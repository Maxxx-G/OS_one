# OS_One Setup Guide

This guide will help you set up and work with the OS_One repository, including how to use GitHub Copilot CLI (codex) if needed.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start (Without GitHub Copilot CLI)](#quick-start-without-github-copilot-cli)
- [Using GitHub Copilot CLI (Optional)](#using-github-copilot-cli-optional)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before getting started, ensure you have the following installed:

1. **Node.js LTS** (Long Term Support version)
   - **Windows (PowerShell):**
     ```powershell
     winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
     ```
   - **macOS:**
     ```bash
     brew install node@lts
     ```
   - **Linux:**
     ```bash
     curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
     sudo apt-get install -y nodejs
     ```

2. **pnpm** (Package manager)
   ```bash
   corepack enable
   corepack prepare pnpm@9 --activate
   pnpm -v  # Verify installation
   ```

## Quick Start (Without GitHub Copilot CLI)

You don't need the GitHub Copilot CLI (`codex`) to work with this repository. Here's how to get started:

### 1. Clone the Repository
```bash
git clone https://github.com/Maxxx-G/OS_one.git
cd OS_one
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Set Up Environment Variables
Copy the example environment file:
```bash
# Copy the appropriate example based on your needs
cp .env.example .env.local
# OR for more detailed configuration
cp .env.local.example apps/web-ui/.env.local
```

Configure your environment variables as needed in the `.env.local` file.

### 4. Start the Development Server

**Option A: From the repository root**
```bash
pnpm web:dev
```

**Option B: Using the helper script (Windows)**
```powershell
pwsh -File .\scripts\start-web-ui.ps1
```

**Option C: From the web-ui directory**
```bash
cd apps/web-ui
pnpm dev
```

The application will be available at `http://localhost:3001` (or `http://localhost:3002` if port 3001 is busy).

### 5. Verify Installation
Open your browser and navigate to `http://localhost:3001` to ensure the application is running correctly.

## Using GitHub Copilot CLI (Optional)

If you want to use GitHub Copilot's CLI tool (referred to as `codex` in some contexts), follow these steps:

### What is GitHub Copilot CLI?

GitHub Copilot CLI is a command-line interface that provides AI-powered assistance for developers. It's part of GitHub Copilot and can help with various development tasks.

### Installing GitHub Copilot CLI

#### Prerequisites for GitHub Copilot CLI
- A GitHub account with an active GitHub Copilot subscription
- GitHub CLI (`gh`) installed

#### Installation Steps

1. **Install GitHub CLI** (if not already installed)
   
   **Windows (PowerShell):**
   ```powershell
   winget install GitHub.cli
   ```
   
   **macOS:**
   ```bash
   brew install gh
   ```
   
   **Linux:**
   ```bash
   curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
   sudo apt update
   sudo apt install gh
   ```

2. **Authenticate with GitHub**
   ```bash
   gh auth login
   ```
   Follow the prompts to authenticate with your GitHub account.

3. **Install GitHub Copilot CLI Extension**
   ```bash
   gh extension install github/gh-copilot
   ```

4. **Verify Installation**
   ```bash
   gh copilot --version
   ```

### Using GitHub Copilot CLI with This Repository

Once installed, you can use GitHub Copilot CLI in the following ways:

#### Get Command Suggestions
```bash
gh copilot suggest "start the development server"
```

#### Explain Commands
```bash
gh copilot explain "pnpm web:dev"
```

#### Interactive Mode
```bash
gh copilot
```

### Note About "codex" Command

The error message in your screenshot shows:
```
codex : The term 'codex' is not recognized...
```

This happens because:
1. The GitHub Copilot CLI is accessed via `gh copilot` (not `codex`)
2. If you see references to `codex` in documentation, they may be referring to an older or internal name
3. You may need to create an alias if you prefer to use `codex` as a command name

To create a `codex` alias:

**PowerShell (Windows):**
```powershell
# Add to your PowerShell profile
# Open profile: notepad $PROFILE
function codex { gh copilot @args }
```

**Bash/Zsh (macOS/Linux):**
```bash
# Add to ~/.bashrc or ~/.zshrc
alias codex='gh copilot'
```

## Troubleshooting

### Port Already in Use
If port 3001 is already in use, you can start the server on a different port:
```bash
pnpm web:dev:3002
```
This will start the server on `http://localhost:3002`.

**To check what's using a port on Windows:**
```powershell
Get-NetTCPConnection -LocalPort 3001 | Select OwningProcess
Get-Process -Id <PID> | Stop-Process -Force
```

### Connection Refused
If you get a connection refused error:
1. Ensure the dev terminal shows: `ready - started server on 0.0.0.0:3001`
2. Check if your firewall is blocking the port
3. Try accessing via `http://127.0.0.1:3001` instead of `localhost`

### GitHub Copilot CLI Not Working
If GitHub Copilot CLI commands fail:
1. Verify you have an active GitHub Copilot subscription
2. Re-authenticate: `gh auth logout` then `gh auth login`
3. Update the extension: `gh extension upgrade gh-copilot`
4. Check your internet connection

### Module Not Found Errors
If you get module not found errors:
```bash
# Clean install
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Build Errors
If you encounter build errors:
1. Ensure you're using Node.js LTS version
2. Clear the build cache:
   ```bash
   rm -rf .next
   pnpm install
   pnpm build
   ```

## Additional Resources

- [Main README](README.md) - Project overview and documentation index
- [Project Plan](docs/plans/OS1-PLAN.v2025.09.17.md) - Detailed project plan
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [pnpm Documentation](https://pnpm.io/)

## Getting Help

If you encounter issues not covered in this guide:
1. Check the [GitHub Issues](https://github.com/Maxxx-G/OS_one/issues) for similar problems
2. Review the project documentation in the `/docs` directory
3. Open a new issue with details about your environment and the problem

---

**Note:** This repository is primarily a Next.js web application. The GitHub Copilot CLI is optional and not required for development. You can work with this codebase using standard Node.js development tools and your preferred code editor.
