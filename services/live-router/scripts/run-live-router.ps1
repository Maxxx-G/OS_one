Param(
  [string]$EnvFile = ".env"
)
$ErrorActionPreference = "Stop"
Push-Location $PSScriptRoot\..
if (Test-Path $EnvFile) {
  Write-Host "Loading $EnvFile"
  Get-Content $EnvFile | ForEach-Object {
    if ($_ -match "^\s*#") { return }
    if ($_ -match "^\s*$") { return }
    $k,$v = $_.Split("=",2)
    [System.Environment]::SetEnvironmentVariable($k.Trim(), $v.Trim())
  }
}
if (-not (Test-Path "node_modules")) { npm ci | Out-Host }
npm run dev
Pop-Location
