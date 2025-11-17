# Windows Setup Guide for OS_One

This guide is specifically for Windows users who want to set up and run OS_One using PowerShell.

## Prerequisites

Open PowerShell as Administrator and run the following commands:

### 1. Install Node.js LTS

```powershell
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
```

After installation, close and reopen PowerShell to refresh your PATH.

Verify installation:
```powershell
node --version
npm --version
```

### 2. Enable and Configure pnpm

```powershell
corepack enable
corepack prepare pnpm@9 --activate
pnpm -v  # Should display version 9.x.x
```

## Quick Setup

1. **Clone the repository** (if you haven't already):
   ```powershell
   cd D:\  # or your preferred directory
   git clone https://github.com/Maxxx-G/OS_one.git
   cd OS_One
   ```

2. **Install dependencies**:
   ```powershell
   pnpm install
   ```

3. **Start the development server**:
   ```powershell
   # Option A: Using pnpm from the root
   pnpm dev
   
   # Option B: Using npm from the web-ui directory
   cd apps\web-ui
   npm run dev
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:4000`

## About the "codex" Command

If you see references to a `codex` command, this typically refers to GitHub Copilot CLI. Here's what you need to know:

### The Error You Might See

```powershell
PS D:\OS_One> codex run --sandbox-mode workspace-write ...
codex : The term 'codex' is not recognized as the name of a cmdlet, function, 
script file, or operable program.
```

### Why This Happens

- `codex` is **not** a standard command or required for working with this repository
- It may refer to GitHub Copilot CLI, which is an optional tool
- **You do NOT need `codex` to develop or run this application**

### If You Want to Use GitHub Copilot CLI

If you have a GitHub Copilot subscription and want to use it:

1. **Install GitHub CLI**:
   ```powershell
   winget install GitHub.cli
   ```

2. **Restart PowerShell** to refresh your PATH

3. **Authenticate with GitHub**:
   ```powershell
   gh auth login
   ```

4. **Install GitHub Copilot extension**:
   ```powershell
   gh extension install github/gh-copilot
   ```

5. **Use GitHub Copilot CLI**:
   ```powershell
   # Get command suggestions
   gh copilot suggest "how to start a Next.js dev server"
   
   # Explain a command
   gh copilot explain "pnpm web:dev"
   ```

### Creating a "codex" Alias (Optional)

If you prefer to use `codex` instead of `gh copilot`, add this to your PowerShell profile:

```powershell
# Open your PowerShell profile
notepad $PROFILE

# Add this function:
function codex { gh copilot @args }

# Save and reload:
. $PROFILE
```

Now you can use `codex suggest "your question"` instead of `gh copilot suggest "your question"`.

## Common Issues and Solutions

### Issue: Port 4000 Already in Use

**Solution 1**: Find and kill the process using port 4000
```powershell
# Find the process
Get-NetTCPConnection -LocalPort 4000 | Select OwningProcess

# Kill the process (replace <PID> with the process ID)
Get-Process -Id <PID> | Stop-Process -Force
```

**Solution 2**: Change the dev port
Edit `apps/web-ui/package.json` and change:
```json
"dev": "next dev -p 4000",
```
to use a different port (e.g., 4001)

### Issue: PowerShell Execution Policy Error

If you see "cannot be loaded because running scripts is disabled":

```powershell
# Check current policy
Get-ExecutionPolicy

# Set to allow scripts (run as Administrator)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Module Not Found

```powershell
# Clean reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item pnpm-lock.yaml
pnpm install
```

### Issue: pnpm Command Not Found After Installation

1. Close all PowerShell windows
2. Open a new PowerShell window
3. Try again: `pnpm -v`

If still not working:
```powershell
# Re-enable corepack
corepack enable
corepack prepare pnpm@9 --activate
```

### Issue: Git Not Found

Install Git for Windows:
```powershell
winget install Git.Git
```

Restart PowerShell after installation.

## Testing Your Setup

Run these commands to verify everything is working:

```powershell
# Check Node.js
node --version  # Should show v18.x or v20.x

# Check pnpm
pnpm -v  # Should show 9.x.x

# Check if port 4000 is available
Test-NetConnection localhost -Port 4000
# Should show "TcpTestSucceeded : False" (meaning port is available)

# Start the dev server
pnpm dev
# Should show "ready - started server on 0.0.0.0:4000"
```

## Development Workflow

Typical development workflow on Windows:

1. **Navigate to project**:
   ```powershell
   cd D:\OS_One  # or your project path
   ```

2. **Pull latest changes**:
   ```powershell
   git pull
   ```

3. **Install any new dependencies**:
   ```powershell
   pnpm install
   ```

4. **Start dev server**:
   ```powershell
   pnpm dev
   ```

5. **Open in browser**: `http://localhost:4000`

6. **Make your changes** in your preferred code editor (VS Code, etc.)

7. **Server auto-reloads** when you save files

## Additional Resources

- [Main Setup Guide](../SETUP.md) - Cross-platform setup instructions
- [Project README](../README.md) - Project overview
- [GitHub CLI Documentation](https://cli.github.com/)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)

## Getting Help

If you encounter issues:
1. Check the [Troubleshooting](#common-issues-and-solutions) section above
2. Review the [main SETUP.md](../SETUP.md) guide
3. Open an issue on GitHub with:
   - Your Windows version
   - PowerShell version (`$PSVersionTable.PSVersion`)
   - Node.js version (`node --version`)
   - Error message and full command you ran

---

**Remember**: You **do not need** the `codex` command or GitHub Copilot CLI to work with this repository. It's entirely optional!
