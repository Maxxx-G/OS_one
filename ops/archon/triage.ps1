Param([int]$Head=40)
$ErrorActionPreference = 'Continue'
$root = (Resolve-Path -Path "$PSScriptRoot/.." ).Path
$logDir = Join-Path $root "../logs/archon"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
Push-Location "$root/../archon"
try {
  $out = ""
  if (Test-Path .venv) { $env:VIRTUAL_ENV = (Resolve-Path .venv).Path }
  $out += "`n--- ruff/flake8 ---`n"
  try { $out += (ruff . 2>&1 | Out-String) } catch {}
  try { $out += (flake8 . 2>&1 | Out-String) } catch {}
  $out += "`n--- pytest -q ---`n"
  try { $out += (pytest -q 2>&1 | Out-String) } catch {}
  $out | Set-Content -NoNewline -Path (Join-Path $logDir "last_failure.txt")
  Get-Content (Join-Path $logDir "last_failure.txt") | Select-Object -First $Head
} finally {
  Pop-Location
}
