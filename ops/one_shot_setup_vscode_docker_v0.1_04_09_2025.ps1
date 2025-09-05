# One-Shot Setup — VS Code + Docker + WSL2 (OS_One) v0.1 (PS 5.1 safe)
# Save as: D:\OS_one\ops\one_shot_setup_vscode_docker_v0.1_04_09_2025.ps1
# Run (elevated): Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; D:\OS_one\ops\one_shot_setup_vscode_docker_v0.1_04_09_2025.ps1

param(
  [string]$RepoRoot = "D:\OS_one",
  [switch]$SkipVSCode,
  [switch]$SkipDocker
)

function Write-Header { param([string]$t) Write-Host "`n=== $t ===" -ForegroundColor Cyan }
function Test-Admin {
  $id = [Security.Principal.WindowsIdentity]::GetCurrent()
  $p  = New-Object Security.Principal.WindowsPrincipal($id)
  return $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}
function HasCommand([string]$n) {
  try { Get-Command $n -ErrorAction Stop | Out-Null; return $true } catch { return $false }
}

if (-not (Test-Admin)) { Write-Warning "Run PowerShell as Administrator for WSL/Docker install." }

# Ensure base folders
New-Item -ItemType Directory -Force "$RepoRoot" | Out-Null
New-Item -ItemType Directory -Force "$RepoRoot\ops" | Out-Null
New-Item -ItemType Directory -Force "$RepoRoot\policies\env" | Out-Null
New-Item -ItemType Directory -Force "$RepoRoot\.vscode" | Out-Null
New-Item -ItemType Directory -Force "$RepoRoot\kb" | Out-Null
New-Item -ItemType Directory -Force "$RepoRoot\logs" | Out-Null

Write-Header "Install VS Code (winget)"
if ($SkipVSCode) { Write-Host "Skip VS Code as requested." }
else {
  if (-not (HasCommand 'code')) {
    if (HasCommand 'winget') {
      winget install --id Microsoft.VisualStudioCode -e --source winget --accept-package-agreements --accept-source-agreements
    } else {
      Write-Warning "winget not found. Install VS Code manually: https://code.visualstudio.com/download"
    }
  } else { Write-Host "VS Code already present." }
}

# Locate VS Code CLI
$codeCli = $null
try { $codeCli = (Get-Command code -ErrorAction Stop).Source } catch { }
if (-not $codeCli) {
  $defaultCode = "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd"
  if (Test-Path $defaultCode) { $codeCli = $defaultCode }
}

Write-Header "Install VS Code extensions"
$exts = @(
  'ms-azuretools.vscode-docker',
  'ms-python.python',
  'eamodio.gitlens',
  'esbenp.prettier-vscode',
  'redhat.vscode-yaml',
  'yzhang.markdown-all-in-one',
  'streetsidesoftware.code-spell-checker'
)
if ($codeCli) { foreach($e in $exts){ & $codeCli --install-extension $e | Out-Null }; Write-Host "Extensions ok." }
else { Write-Warning "VS Code CLI not found; skipping extension install." }

Write-Header "Install Docker Desktop (winget)"
if ($SkipDocker) { Write-Host "Skip Docker as requested." }
else {
  if (-not (Test-Path "C:\Program Files\Docker\Docker\Docker Desktop.exe")) {
    if (HasCommand 'winget') {
      winget install --id Docker.DockerDesktop -e --accept-package-agreements --accept-source-agreements
    } else { Write-Warning "winget not found. Install Docker Desktop: https://docs.docker.com/desktop/" }
  } else { Write-Host "Docker Desktop already present." }
}

Write-Header "Enable WSL2 (if needed)"
try {
  $wslv = & wsl -l -v 2>$null
  if (-not $wslv) { throw "WSL not configured" }
  Write-Host "WSL appears available:"; Write-Host $wslv
} catch {
  Write-Warning "Enabling WSL features (may require reboot)."
  try {
    Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -NoRestart -ErrorAction Stop | Out-Null
    Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart -ErrorAction Stop | Out-Null
    Write-Host "WSL features enabled. Reboot may be required." -ForegroundColor Yellow
  } catch { Write-Warning "Could not enable WSL automatically. Enable via Windows Features UI and reboot." }
}

Write-Header "Start Docker & verify engine"
$dockerExe = $null
try { $dockerExe = (Get-Command docker -ErrorAction Stop).Source } catch { }
if (-not $dockerExe) { $dockerExe = "C:\Program Files\Docker\Docker\resources\bin\docker.exe" }
$ddExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (Test-Path $ddExe) { Start-Process -FilePath $ddExe -WindowStyle Minimized | Out-Null }
$ok = $false
for($i=0; $i -lt 36; $i++){
  try { & $dockerExe info > $null 2>&1; $ok = $true; break } catch { Start-Sleep -Seconds 5 }
}
if ($ok) { Write-Host "Docker engine is responding." } else { Write-Warning "Docker engine not ready. Open Docker Desktop until it finishes starting." }

Write-Header "Create .vscode workspace files"
$extJson = @'
{
  "recommendations": [
    "ms-azuretools.vscode-docker",
    "ms-python.python",
    "eamodio.gitlens",
    "esbenp.prettier-vscode",
    "redhat.vscode-yaml",
    "yzhang.markdown-all-in-one",
    "streetsidesoftware.code-spell-checker"
  ]
}
'@
Set-Content -Encoding UTF8 -Path "$RepoRoot\.vscode\extensions.json" -Value $extJson

$settingsJson = @'
{
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "editor.formatOnSave": true,
  "editor.rulers": [100],
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "yaml.validate": true,
  "prettier.printWidth": 100,
  "prettier.singleQuote": true,
  "[markdown]": { "editor.wordWrap": "on" },
  "files.associations": { "docker_compose_*.yml": "yaml" }
}
'@
Set-Content -Encoding UTF8 -Path "$RepoRoot\.vscode\settings.json" -Value $settingsJson

$tasksJson = @'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Env: seed archon_api.env (local only)",
      "type": "shell",
      "command": "if (!(Test-Path policies/env)) { New-Item -ItemType Directory policies/env | Out-Null }; if (Test-Path policies/env/archon_api.env.example) { Copy-Item policies/env/archon_api.env.example policies/env/archon_api.env -Force } else { echo 'ARCHON_ENV=dev`nARCHON_PORT=7700' | Out-File -Encoding utf8 policies/env/archon_api.env }",
      "problemMatcher": []
    },
    {
      "label": "Archon: up (highway)",
      "type": "shell",
      "command": "docker compose -f ops/docker_compose_archon_highway_v0.1_04_09_2025.yml up --build",
      "problemMatcher": [],
      "options": { "cwd": "${workspaceFolder}" }
    },
    {
      "label": "Archon: down",
      "type": "shell",
      "command": "docker compose -f ops/docker_compose_archon_highway_v0.1_04_09_2025.yml down",
      "problemMatcher": [],
      "options": { "cwd": "${workspaceFolder}" }
    }
  ]
}
'@
Set-Content -Encoding UTF8 -Path "$RepoRoot\.vscode\tasks.json" -Value $tasksJson

Write-Header "Compose + env example"
$compose = "$RepoRoot\ops\docker_compose_archon_highway_v0.1_04_09_2025.yml"
if (-not (Test-Path $compose)) {
  $composeYml = @'
version: "3.9"
services:
  archon-api:
    build: ./integrations/archon/python
    container_name: osone-archon-api
    ports:
      - "${ARCHON_PORT:-7700}:7700"
    env_file:
      - ./policies/env/archon_api.env
    volumes:
      - ./kb:/app/kb
      - ./logs:/var/log/archon
    restart: unless-stopped
networks:
  default:
    name: osone-net
'@
  Set-Content -Encoding UTF8 -Path $compose -Value $composeYml
}

$envExample = "$RepoRoot\policies\env\archon_api.env.example"
if (-not (Test-Path $envExample)) {
  $envTxt = @'
ARCHON_ENV=dev
ARCHON_PORT=7700
# Add provider keys below (local only; do NOT commit archon_api.env)
# OPENAI_API_KEY=...
# OLLAMA_BASE_URL=http://host.docker.internal:11434
# ANTHROPIC_API_KEY=...
'@
  Set-Content -Encoding UTF8 -Path $envExample -Value $envTxt
}

# Ensure .gitignore excludes real env
$gi = "$RepoRoot\.gitignore"
if (Test-Path $gi) {
  $giTxt = Get-Content $gi -Raw
  if ($giTxt -notmatch "(?m)^/policies/env/archon_api.env$") { Add-Content $gi "`n/policies/env/archon_api.env" }
}

Write-Header "Done"
Write-Host "Open VS Code on $RepoRoot then run: Tasks → 'Env: seed archon_api.env' and Tasks → 'Archon: up (highway)'" -ForegroundColor Green
