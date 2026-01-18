# claude-glm-actions-lab

<p align="center">
  <img src="./assets/header.svg" alt="claude-glm-actions-lab header" width="100%"/>
</p>

<p align="center">
  <a href="https://github.com/Sunwood-ai-labs/claude-glm-actions-lab/stargazers">
    <img src="https://img.shields.io/github/stars/Sunwood-ai-labs/claude-glm-actions-lab?style=flat-square" alt="Stars"/>
  </a>
  <a href="https://github.com/Sunwood-ai-labs/claude-glm-actions-lab/network/members">
    <img src="https://img.shields.io/github/forks/Sunwood-ai-labs/claude-glm-actions-lab?style=flat-square" alt="Forks"/>
  </a>
  <a href="https://github.com/Sunwood-ai-labs/claude-glm-actions-lab/issues">
    <img src="https://img.shields.io/github/issues/Sunwood-ai-labs/claude-glm-actions-lab?style=flat-square" alt="Issues"/>
  </a>
  <a href="https://github.com/Sunwood-ai-labs/claude-glm-actions-lab/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Sunwood-ai-labs/claude-glm-actions-lab?style=flat-square" alt="License"/>
  </a>
</p>

## Overview

Claude Code GitHub Actions with GLM API integration laboratory. This repository contains workflows and configurations for using Claude Code with GLM (General Language Model) API in GitHub Actions.

## Features

- GitHub Actions workflow for Claude Code with GLM API
- Support for issue comments and pull request reviews
- Configurable API endpoints and models
- Bot self-trigger prevention

## Usage

### Requirements

- GitHub repository
- GLM API key (set as `ZAI_API_KEY` in repository secrets)
- Optional: Configure `ANTHROPIC_BASE_URL` variable (default: `https://api.z.ai/api/anthropic`)

### Setup

1. Copy the workflow file to your repository:
   ```bash
   cp .github/workflows/CLAUDE_GLM_DEV.yml <your-repo>/.github/workflows/
   ```

2. Configure secrets in your repository settings:
   - `ZAI_API_KEY`: Your GLM API key

3. Optional: Configure variables:
   - `ANTHROPIC_BASE_URL`: API base URL
   - `API_TIMEOUT_MS`: Request timeout in milliseconds (default: 3000000)
   - `ANTHROPIC_DEFAULT_OPUS_MODEL`: Default Opus model (default: glm-4.7)
   - `ANTHROPIC_DEFAULT_SONNET_MODEL`: Default Sonnet model (default: glm-4.7)
   - `ANTHROPIC_DEFAULT_HAIKU_MODEL`: Default Haiku model (default: glm-4.5-air)

## Workflow Triggers

The workflow is triggered on:
- Issue comments
- Pull request review comments

## License

MIT License - see [LICENSE](LICENSE) for details.

---

_Made with ❤️ by [Sunwood AI Labs](https://github.com/Sunwood-ai-labs)_
