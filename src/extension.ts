import * as vscode from 'vscode';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cp from 'child_process';
import * as path from 'path';

function loadEnvironmentVariables() {
    try {
        const fs = require('fs');
        
        const possiblePaths = [
            process.cwd(),
            __dirname,
            path.dirname(__dirname),
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
        ].filter((path): path is string => Boolean(path));
        
        for (const basePath of possiblePaths) {
            const envPath = path.join(basePath, '.env');
            
            if (fs.existsSync(envPath)) {
                try {
                    const envContent = fs.readFileSync(envPath, 'utf8');
                    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
                    if (match && match[1]) {
                        const apiKey = match[1].trim();
                        if (apiKey !== 'your_gemini_api_key_here') {
                            process.env.GEMINI_API_KEY = apiKey;
                            return;
                        }
                    }
                } catch (readError) {
                    continue;
                }
            }
        }
        
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (workspaceRoot) {
            const newEnvPath = path.join(workspaceRoot, '.env');
            if (!fs.existsSync(newEnvPath)) {
                const envContent = 'GEMINI_API_KEY=your_gemini_api_key_here\n';
                
                try {
                    fs.writeFileSync(newEnvPath, envContent);
                } catch (writeError) {
                    
                }
            }
        }
        
    } catch (error) {
        
    }
}

export function activate(context: vscode.ExtensionContext) {
    loadEnvironmentVariables();

    const disposable = vscode.commands.registerCommand(
        'commitbrew.generateCommitMessage',
        async () => {
            try {
                await generateCommitMessage();
            } catch (err) {
                vscode.window.showErrorMessage(
                    `CommitBrew error: ${err instanceof Error ? err.message : String(err)}`
                );
            }
        }
    );

    context.subscriptions.push(disposable);
}

async function generateCommitMessage() {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        throw new Error('No workspace folder found. Please open a folder in VS Code first.');
    }

    const workspacePath = folders[0].uri.fsPath;

    if (!(await isGitRepository(workspacePath))) {
        throw new Error('Not a Git repository. Please initialize Git first using `git init`.');
    }

    const stagedChanges = await getStagedChanges(workspacePath);
    if (!stagedChanges) {
        throw new Error('No staged changes found. Please stage some changes first using `git add`.');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not found. Please add your API key to the .env file and restart VS Code.');
    }

    await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Generating commit message...', cancellable: false },
        async (progress) => {
            progress.report({ increment: 0, message: 'Analyzing staged changes...' });
            
            progress.report({ increment: 50, message: 'Generating commit message with AI...' });
            const commitMessage = await generateMessageWithGemini(stagedChanges, apiKey);
            
            progress.report({ increment: 100, message: 'Commit message ready!' });

            const finalMessage = await vscode.window.showInputBox({
                value: commitMessage,
                prompt: 'Edit the generated commit message if needed',
                placeHolder: 'Enter your commit message',
                validateInput: (text) => (!text?.trim() ? 'Commit message cannot be empty' : null)
            });

            if (finalMessage) {
                const commitNow = await vscode.window.showInformationMessage(
                    'Commit message ready! Commit now?',
                    'Yes',
                    'No'
                );

                if (commitNow === 'Yes') {
                    await commitChanges(workspacePath, finalMessage);
                }
            }
        }
    );
}

async function isGitRepository(path: string): Promise<boolean> {
    try {
        await executeCommand('git', ['rev-parse', '--git-dir'], path);
        return true;
    } catch {
        return false;
    }
}

async function getStagedChanges(path: string): Promise<string | null> {
    try {
        const diff = await executeCommand('git', ['diff', '--cached'], path);
        return diff.trim() || null;
    } catch (err) {
        throw new Error('Failed to get staged changes: ' + (err instanceof Error ? err.message : String(err)));
    }
}

async function generateMessageWithGemini(diff: string, apiKey: string): Promise<string> {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Generate a concise and descriptive Git commit message based on the following staged changes. 
        The message should follow conventional commit format (e.g., feat:, fix:, docs:, style:, refactor:, test:, chore:) and be clear about what changes were made.
        
        Staged changes:
        ${diff}
        
        Please provide only the commit message, no additional text or formatting.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        if (!text?.trim()) {
            throw new Error('Gemini returned empty response');
        }

        return text.trim();
    } catch (err) {
        throw new Error('Gemini API error: ' + (err instanceof Error ? err.message : String(err)));
    }
}

async function commitChanges(path: string, message: string) {
    try {
        await executeCommand('git', ['commit', '-m', message], path);
        vscode.window.showInformationMessage(`Successfully committed with message: "${message}"`);
        
        const commitHash = await executeCommand('git', ['rev-parse', 'HEAD'], path);
        vscode.window.showInformationMessage(`Commit hash: ${commitHash.trim().substring(0, 8)}`);
    } catch (err) {
        throw new Error('Failed to commit changes: ' + (err instanceof Error ? err.message : String(err)));
    }
}

async function executeCommand(cmd: string, args: string[], cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        cp.execFile(cmd, args, { cwd }, (err, stdout, stderr) => {
            if (err) {
                return reject(new Error(`${err.message}\n${stderr}`));
            }
            resolve(stdout);
        });
    });
}

export function deactivate() {}