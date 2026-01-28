<div align="center">

# @sunwood-ai-labs/sync-repo-tui

<a href="README_JA.md"><img src="https://img.shields.io/badge/ドキュメント-日本語-white.svg" alt="JA doc"/></a>
<a href="README.md"><img src="https://img.shields.io/badge/Documentation-English-white.svg" alt="EN doc"/></a>

**GitHub Repository Synchronization TUI Tool**

A beautiful Terminal User Interface for syncing GitHub Actions Workflows and Claude Agents to target repositories

</div>

## 📖 Overview

`@sunwood-ai-labs/sync-repo-tui` is a GitHub repository synchronization tool implemented with TypeScript and `terminal-kit`. It efficiently syncs GitHub Actions Workflows and Claude Agents configurations to a single repository or multiple repositories within an organization.

Just like organizing books in a library, this tool helps you beautifully organize your repository configurations. 🌸

## ✨ Features

### TUI Interface
- Comfortable terminal UI powered by `terminal-kit`
- Intuitive menu system
- Real-time progress feedback

### Sync Modes

#### Single Repository Mode
Syncs to a specified repository only. Useful for quickly updating a specific repository.

#### Organization Mode
Bulk syncs to all repositories within an organization. You can exclude specific repositories by setting an exclusion list.

### Sync Item Selection
- **Workflows**: Sync GitHub Actions workflows (`.github/workflows/`)
- **Agents**: Sync Claude Agents configurations (`.github/claude/agents/`)

Toggle each item ON/OFF to sync only what you need.

## 📦 Installation

### Global Installation

```bash
npm install -g @sunwood-ai-labs/sync-repo-tui
```

### Local Installation

```bash
npm install @sunwood-ai-labs/sync-repo-tui
```

## 🚀 Usage

### Basic Usage

```bash
# Launch TUI
sync-repo-tui
```

### Options

```bash
# Specify project root
sync-repo-tui --project-root /path/to/project

# Show help
sync-repo-tui --help
```

### TUI Operation

1. **Main Menu**: Select sync mode
   - Single Repository Mode
   - Organization Mode

2. **Sync Options**: Select items to sync
   - Workflows: ON/OFF
   - Agents: ON/OFF

3. **Confirmation**: Review sync settings and execute

4. **Progress Display**: Monitor sync progress in real-time

## ⚙️ Configuration

Configure the following settings in your `.env` file:

```bash
# Target repository (used in single repository mode)
TARGET_REPO=Sunwood-ai-labs/claude-glm-actions-lab-sandbox

# Target organization (used in organization mode)
TARGET_ORG=Sunwood-ai-labs

# Excluded repositories (used in organization mode, comma-separated)
EXCLUDED_REPOS=claude-glm-actions-lab-sandbox,another-repo
```

### Configuration Details

| Setting | Description | Default Value |
|---------|-------------|---------------|
| `TARGET_REPO` | Target repository to sync to (`owner/repo` format) | `Sunwood-ai-labs/claude-glm-actions-lab-sandbox` |
| `TARGET_ORG` | Target organization name | `Sunwood-ai-labs` |
| `EXCLUDED_REPOS` | Repositories to exclude from sync (comma-separated) | `claude-glm-actions-lab-sandbox` |

## 📋 Dependencies

### Required Software

- **Node.js**: >= 18.0.0
- **gh CLI**: [GitHub CLI](https://cli.github.com/) must be installed

### Installing GitHub CLI

```bash
# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Authenticate
gh auth login
```

## 🛠️ Development

### Development Setup

```bash
# Clone repository
git clone https://github.com/Sunwood-ai-labs/claude-glm-actions-lab.git
cd claude-glm-actions-lab/packages/sync-repo-tui

# Install dependencies
npm install

# Run in development mode (build + execute)
npm run dev
```

### Available Scripts

```bash
# Build
npm run build

# Run
npm start

# Development (build + execute)
npm run dev

# Clean
npm run clean
```

### Project Structure

```
packages/sync-repo-tui/
├── package.json
├── tsconfig.json
├── README.md
├── README_JA.md
├── bin/
│   └── sync-repo-tui       # Entry point
└── src/
    ├── index.ts            # Main entry point
    ├── cli.ts              # CLI argument parser
    ├── config/             # Configuration module
    │   ├── env.ts          # Environment variable loader
    │   ├── constants.ts    # Constant definitions
    │   └── index.ts        # Configuration management
    ├── tui/                # TUI screen module
    │   ├── index.ts        # TUI main
    │   ├── main-menu.ts    # Main menu
    │   ├── sync-options.ts # Sync options selection
    │   ├── repo-selector.ts# Repository selector
    │   ├── confirmation.ts # Confirmation screen
    │   └── progress.ts     # Progress display
    ├── sync/               # Sync logic module
    │   ├── index.ts        # Sync main
    │   ├── workflows.ts    # Workflows sync
    │   ├── agents.ts       # Agents sync
    │   └── git.ts          # Git operations
    ├── github/             # GitHub API wrapper
    │   ├── index.ts        # GitHub API main
    │   └── repo-list.ts    # Repository list fetcher
    └── utils/              # Utilities
        ├── logger.ts       # Logger
        ├── file.ts         # File operations
        └── error.ts        # Error handling
```

## 🔍 Synced Files

This tool syncs the following files:

### Workflows
- All YAML files under `.github/workflows/` directory

### Agents
- All configuration files under `.github/claude/agents/` directory

## 📝 Usage Examples

### Scenario 1: Sync Workflows to a Single Repository

```bash
# Configure .env
echo "TARGET_REPO=my-org/my-repo" > .env

# Launch TUI
sync-repo-tui

# Select "Single Repository Mode" from menu
# Set "Workflows" to ON, "Agents" to OFF
# Confirm and execute
```

### Scenario 2: Sync to All Repositories in an Organization

```bash
# Configure .env
echo "TARGET_ORG=my-org" > .env
echo "EXCLUDED_REPOS=repo1,repo2" >> .env

# Launch TUI
sync-repo-tui

# Select "Organization Mode" from menu
# Select sync items
# Confirm and execute
```

## 🤝 Contributing

Contributions are welcome! Please create an Issue for bug reports or feature requests.

## 📄 License

MIT License - see LICENSE file for details.

## 👥 Authors

Sunwood AI Labs

---

A story has been completed.
May this tool beautifully help organize your repository management...🌸
