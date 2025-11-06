<#
.SYNOPSIS
Verifies local VS Code AI tooling alignment with OS One standards.
Auto-patches settings.json if values diverge.
#>

$root = (Get-Location).Path
$settingsPath = Join-Path $root ".vscode\settings.json"
$continueCfg = Join-Path $root ".continue\config.json"

Write-Host "`n== OS One AI Tooling Check ==" -ForegroundColor Cyan

if (!(Test-Path $settingsPath)) {
    Write-Warning "No .vscode/settings.json found. Run the STB trio-setup first."
    exit 1
}

# Load JSON safely
function Read-Json($path) {
    try { Get-Content $path -Raw | ConvertFrom-Json } catch { @{} }
}

$settings = Read-Json $settingsPath

$required = @{
    "editor.inlineSuggest.enabled"                = $false
    "github.copilot.editor.enableAutoCompletions" = $false
    "cody.telemetry.level"                        = "off"
    "phind.enableTelemetry"                       = $false
    "files.eol"                                   = "`n"
    "files.insertFinalNewline"                    = $true
}

$patched = $false
foreach ($key in $required.Keys) {
    if ($settings.$key -ne $required[$key]) {
        Write-Host "Fixing $key ..." -ForegroundColor Yellow
        $settings | Add-Member -NotePropertyName $key -NotePropertyValue $required[$key] -Force
        $patched = $true
    }
}

if ($patched) {
    $settings | ConvertTo-Json -Depth 6 | Out-File -Encoding utf8 -Force $settingsPath
    Write-Host "✅ settings.json patched for OS One standards." -ForegroundColor Green
}
else {
    Write-Host "✅ settings.json already compliant." -ForegroundColor Green
}

# Continue config presence
if (Test-Path $continueCfg) {
    Write-Host "✅ Continue config detected."
}
else {
    Write-Warning "❌ Missing .continue/config.json"
}

# Extension hints
$exts = @("continuedev.continue", "sourcegraph.cody-ai", "phind.phind")
Write-Host "`nInstalled extensions recommended:" -ForegroundColor Cyan
$exts | ForEach-Object { Write-Host " - $_" }

Write-Host "`nCheck complete.`n"
