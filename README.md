# CommitBrew

**Automatically generate Git commit messages using Gemini API**

CommitBrew is a VS Code extension that analyzes your staged Git changes and generates meaningful commit messages using Google's Gemini AI. Say goodbye to "fix stuff" and "update code" commits!

## Features

- **AI-Powered Commit Messages**: Leverages Google's Gemini API to analyze your code changes
- **Conventional Commit Format**: Generates messages following conventional commit standards (feat:, fix:, docs:, etc.)
- **Interactive Editing**: Review and edit the generated message before committing
- **One-Click Commit**: Option to commit directly after generating the message
- **Smart Analysis**: Analyzes staged changes to understand the context of your modifications
- **Zero Configuration**: Automatically searches for API keys in multiple locations

## Installation

### From VS Code Marketplace (Coming Soon)
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "CommitBrew"
4. Click Install

## Setup

### 1. Get a Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key for the next step

### 2. Configure API Key
Create a `.env` file in your project root or workspace:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

**Note**: CommitBrew searches for the `.env` file in multiple locations:
- Current workspace root
- Extension directory
- Current working directory
- Parent directories

## Usage

### Basic Usage
1. **Stage your changes**: Use `git add` to stage the files you want to commit
2. **Open Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. **Run CommitBrew**: Type "Generate Commit Message" and select the command
4. **Review & Edit**: The AI-generated message will appear in an input box for review
4. **Commit**: Choose to commit immediately or copy the message for later use

### Alternative Methods
- Right-click in the Source Control panel and select "Generate Commit Message"
- Use the command from the Command Palette: `CommitBrew: Generate Commit Message`

## How It Works

1. **Analysis**: CommitBrew runs `git diff --cached` to analyze your staged changes
2. **AI Processing**: Sends the diff to Gemini API with a specialized prompt
3. **Format**: Ensures the response follows conventional commit format
4. **Review**: Presents the generated message for your review and editing
5. **Commit**: Optionally commits the changes with the final message

## Requirements

- **VS Code**: Version 1.74.0 or higher
- **Git**: Must be installed and repository initialized
- **Gemini API Key**: Required for AI functionality
- **Staged Changes**: At least one file must be staged before generating commits

## Development

### Prerequisites
- Node.js 16.x or higher
- npm or yarn
- VS Code

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/commitbrew.git
cd commitbrew

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes during development
npm run watch
```

### Testing
```bash
# Run linting
npm run lint

# Run tests
npm test
```

### Building
```bash
# Prepare for publishing
npm run vscode:prepublish
```

## Contributing

CommitBrew is in beta and we welcome contributions! Here's how you can help:

### Bug Reports
- Use GitHub Issues to report bugs
- Include VS Code version, OS, and steps to reproduce
- Attach relevant error messages or screenshots

### Feature Requests
- Open an issue with the "enhancement" label
- Describe the feature and its use case
- Discuss implementation approaches

### Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Run `npm run lint` and fix any issues
6. Commit your changes (use CommitBrew! 😉)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Changelog

### [0.0.1] - Beta Release
- Initial beta release
- Basic commit message generation using Gemini API
- Support for conventional commit format
- Interactive message editing
- Automatic .env file detection
- One-click commit functionality

## Known Issues

- **Beta Status**: This extension is in beta, expect some rough edges
- **API Rate Limits**: Heavy usage may hit Gemini API rate limits
- **Large Diffs**: Very large changes might exceed API token limits
- **Network Dependency**: Requires internet connection for AI generation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Privacy & Security

- **API Key Security**: Store your API key in `.env` files, never commit them
- **Code Privacy**: Your code diffs are sent to Google's Gemini API for processing
- **No Data Storage**: CommitBrew doesn't store or log your code or commit messages
- **Local Processing**: All file operations happen locally on your machine

## Acknowledgments

- Google Gemini API for powerful AI capabilities
- VS Code Extension API for seamless integration
- Conventional Commits specification for standardized formatting

---

**Happy Brewing!** Make your commits as smooth as your favorite brew.