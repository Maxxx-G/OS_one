# GitHub Copilot Workspace Setup

This guide explains how to configure GitHub Copilot with workspace permissions for the OS_One repository.

## What is "Codex"?

If you see "**Codex**" in your window title (typically in the top-left corner), you're using **GitHub Copilot Workspace** - a web-based AI coding environment. GitHub Copilot Workspace was formerly codenamed "Codex" and you may still see this name in some interfaces.

This is different from:
- GitHub Copilot in VS Code (IDE extension)
- GitHub Copilot CLI (`gh copilot` command-line tool)

## GitHub Copilot Workspace (Web-Based)

If you're working in the **GitHub Copilot Workspace** web interface (where the window title shows "Codex"):

### Giving Write Access in Copilot Workspace

GitHub Copilot Workspace already has write access by design. When you're in a Copilot Workspace session:

1. **Workspace is Pre-Configured**: The environment is set up with appropriate permissions automatically
2. **Making Changes**: Simply describe what you want to change in the chat interface
3. **Reviewing Changes**: Copilot Workspace will show you a diff of proposed changes
4. **Applying Changes**: Click "Apply" or "Accept" to write the changes to your repository

### Working with This Repository in Copilot Workspace

To work with OS_One in GitHub Copilot Workspace:

1. **Access Workspace**: Navigate to your repository on GitHub and look for "Copilot Workspace" option
2. **Describe Your Task**: Use natural language to describe what you want to accomplish
3. **Review Generated Plan**: Copilot Workspace will create a plan with specific file changes
4. **Execute Changes**: Approve the plan to make changes to your repository
5. **Commit Changes**: Once satisfied, commit and push the changes back to your repository

### Common Commands in Copilot Workspace

- **"Add feature X"**: Copilot will plan and implement the feature
- **"Fix bug in Y"**: Copilot will analyze and propose fixes
- **"Update documentation"**: Copilot will modify relevant docs
- **"Run tests"**: Execute test suites if configured

### Limitations and Considerations

- Copilot Workspace works directly with your GitHub repository
- Changes are proposed first, then applied after your approval
- You maintain full control over what gets committed
- The environment is sandboxed for security

---

## Understanding GitHub Copilot Workspace Modes

GitHub Copilot can operate in different workspace modes when working with repositories:

- **Read-only mode**: Copilot can read your code but cannot make changes
- **Workspace-write mode**: Copilot can suggest and make changes to files in your workspace

## Giving GitHub Copilot Write Access (VS Code)

### In VS Code

1. **Install GitHub Copilot Extension**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
   - Search for "GitHub Copilot"
   - Install both:
     - GitHub Copilot
     - GitHub Copilot Chat

2. **Sign in to GitHub Copilot**
   - Click the GitHub Copilot icon in the status bar
   - Follow the prompts to sign in with your GitHub account
   - Authorize the extension when prompted

3. **Configure Workspace Permissions**
   
   **Option A: Trust the Workspace** (Recommended for your own repositories)
   - When you first open the repository, VS Code may show a prompt: "Do you trust the authors of the files in this folder?"
   - Click **"Yes, I trust the authors"**
   - This allows Copilot to have full access to read and suggest changes

   **Option B: Configure Settings Manually**
   - Open VS Code Settings (Ctrl+, / Cmd+,)
   - Search for "workspace trust"
   - Ensure "Security: Workspace Trust Enabled" is checked
   - Add the repository path to trusted folders if needed

4. **Enable Copilot Chat File Operations**
   - Open Settings (Ctrl+, / Cmd+,)
   - Search for "github.copilot"
   - Enable these settings:
     - `github.copilot.enable`: true
     - `github.copilot.chat.enable`: true
   - For write operations in Chat:
     - Use the Copilot Chat panel (Ctrl+Alt+I / Cmd+Alt+I)
     - When Copilot suggests file changes, you'll see options to:
       - Accept changes
       - Reject changes
       - View diffs before applying

### Using GitHub Copilot Edits

The newer "Copilot Edits" feature allows Copilot to make multi-file changes:

1. **Open Copilot Edits**
   - Press Ctrl+Shift+I (Windows/Linux) or Cmd+Shift+I (Mac)
   - Or click the Copilot icon and select "Open Copilot Edits"

2. **Start an Editing Session**
   - Describe what you want to change
   - Copilot will analyze your workspace and suggest changes across multiple files
   - Review each change in the diff view
   - Accept or reject individual changes

3. **Working Files**
   - Add files to the working set that Copilot should edit
   - Use `@workspace` to reference the entire workspace
   - Use `@file:path/to/file.ts` to reference specific files

### About the Command-Line Error

If you saw an error like:
```
codex run --sandbox-mode workspace-write
```

This command is **not** for the GitHub CLI. It's an internal command that may appear in GitHub Copilot Workspace error messages or logs. You don't need to run this command manually.

**What this means:**
- `codex` was the internal codename for GitHub Copilot Workspace
- This command runs automatically within the GitHub Copilot Workspace environment
- You don't need to install or configure anything extra for this to work
- If you see this error, it's likely from within the Copilot Workspace web interface itself

**If you're seeing this error:**
1. **In Copilot Workspace (web)**: The system is already set up - just use the chat interface
2. **In your terminal**: You likely meant to use the GitHub CLI instead (see below)

### Using GitHub Copilot in the Terminal (CLI)

For command-line assistance (different from Copilot Workspace):

1. **Install GitHub CLI Copilot Extension**
   ```bash
   gh extension install github/gh-copilot
   ```

2. **Use GitHub Copilot CLI**
   ```bash
   # Get command suggestions
   gh copilot suggest "your task description"
   
   # Explain a command
   gh copilot explain "command to explain"
   ```

3. **Note**: The GitHub CLI version doesn't directly modify files in your workspace. For workspace modifications, use:
   - GitHub Copilot Workspace (web interface)
   - VS Code extension (see sections below)

## Workspace Trust and Security

When working with GitHub Copilot in VS Code:

### Why Workspace Trust Matters

- VS Code's workspace trust feature protects you from malicious code in untrusted repositories
- Copilot respects workspace trust settings
- If a workspace is untrusted, Copilot's capabilities may be limited

### How to Manage Workspace Trust

1. **View Current Trust Status**
   - Click the shield icon in the status bar (bottom left)
   - Or use Command Palette (Ctrl+Shift+P / Cmd+Shift+P): "Workspaces: Manage Workspace Trust"

2. **Trust Current Workspace**
   - Click "Trust" in the workspace trust dialog
   - Or: Command Palette → "Workspaces: Trust This Workspace"

3. **Trust Parent Folder** (Recommended for your project directories)
   - In the workspace trust dialog, check "Trust all files in parent folder"
   - This will trust all repositories in that parent directory

### Configuring Trust for OS_One

For this repository (OS_One):

```json
// Add to VS Code settings (Settings → Edit in settings.json)
{
  "security.workspace.trust.untrustedFiles": "prompt",
  "security.workspace.trust.banner": "always",
  "security.workspace.trust.emptyWindow": true
}
```

## Permissions for Copilot Chat

To allow Copilot Chat to create/modify files:

1. **Enable in Settings**
   ```json
   {
     "github.copilot.chat.experimental.fileCreation": true,
     "github.copilot.chat.experimental.fileModification": true
   }
   ```

2. **Grant Permissions During Chat**
   - When Copilot suggests creating/modifying files, you'll see a prompt
   - Click "Allow" to grant permission for that operation
   - Check "Remember my choice" to avoid repeated prompts

## Troubleshooting

### "Copilot is not authorized to access this workspace"

**Solution:**
1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Workspaces: Trust This Workspace"
3. Confirm by clicking "Trust"

### "Copilot suggestions are not appearing"

**Solution:**
1. Check that Copilot is enabled:
   - Look for the Copilot icon in the status bar
   - It should show "Copilot: ✓" or similar
2. Verify your GitHub Copilot subscription is active
3. Sign out and sign in again:
   - Command Palette → "GitHub Copilot: Sign Out"
   - Command Palette → "GitHub Copilot: Sign In"

### "Cannot modify files in this workspace"

**Solution:**
1. Ensure the workspace is trusted (see above)
2. Check file permissions (files should not be read-only)
3. For Windows: Run VS Code as Administrator if needed
4. Verify you have write permissions to the directory:
   ```powershell
   # Windows PowerShell
   Get-Acl -Path "D:\OS_One" | Format-List
   ```

### "Copilot Chat is not making changes"

**Solution:**
1. Make sure you're using Copilot Chat (not just inline suggestions)
2. Use explicit commands like:
   - "Create a new file named..."
   - "Modify the file X to..."
   - "Update the function Y in file Z to..."
3. Review the changes in the diff view and accept them

## Quick Reference

### VS Code Commands for Copilot

| Action | Command |
|--------|---------|
| Open Copilot Chat | `Ctrl+Alt+I` / `Cmd+Alt+I` |
| Open Copilot Edits | `Ctrl+Shift+I` / `Cmd+Shift+I` |
| Toggle Copilot | `Ctrl+Alt+\` / `Cmd+Alt+\` |
| Accept Suggestion | `Tab` |
| Reject Suggestion | `Esc` |
| Next Suggestion | `Alt+]` / `Option+]` |
| Previous Suggestion | `Alt+[` / `Option+[` |

### Common Copilot Chat Commands

- `@workspace` - Ask about your entire workspace
- `/explain` - Explain selected code
- `/fix` - Suggest fixes for problems
- `/new` - Scaffold new code or files
- `/tests` - Generate tests

## Additional Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [VS Code Workspace Trust](https://code.visualstudio.com/docs/editor/workspace-trust)
- [GitHub Copilot Chat](https://docs.github.com/en/copilot/github-copilot-chat/using-github-copilot-chat-in-your-ide)
- [Main Setup Guide](../SETUP.md)
- [Windows Setup Guide](./WINDOWS_SETUP.md)

---

**Note**: This guide assumes you're using GitHub Copilot in VS Code or a similar IDE. The command-line interface (GitHub CLI with Copilot extension) has different capabilities and doesn't directly modify workspace files.
