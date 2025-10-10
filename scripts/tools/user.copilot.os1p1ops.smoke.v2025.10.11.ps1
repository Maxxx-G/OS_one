<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1ops
X-Purpose: smoke
X-Version: v2025.10.11
X-Policy: filename+header compliance required
#>
Param(
    [switch]$Start,             # launch UI dev server for live ping
    [int]$Port = 4000,          # match apps/web-ui Next dev port
    [int]$TimeoutSec = 45,
    [string]$Report = "docs/reports/user.copilot.smoke-report.v2025.10.10.md"
)
$ErrorActionPreference = 'Stop'
function Line($t) { $script:lines += $t }
$script:lines = @("# OS One - Smoke Report v2025.10.10", "", "## Steps")

# 1) Validate STB headers (7 extensions)
Line("- STB validate"); $ok1 = $true
try { npm run validate:stb | Out-Null } catch { $ok1 = $false }

# 2) Repo audit (folders/dupes/trees)
Line("- Repo audit"); $ok2 = $true
try { & ./scripts/tools/os1_repo_audit.ps1 | Out-Null } catch { $ok2 = $false }

# 3) Build UI (apps/web-ui)
$uiPath = "apps/web-ui"
$built = $false; $serverPid = $null; $base = "http://localhost:$Port"
if (Test-Path $uiPath) {
    Line("- UI build"); $ok3 = $true
    try {
        npm --prefix apps/web-ui run build | Out-Null
        $built = $true
    }
    catch { $ok3 = $false }
    if ($Start -and $ok3) {
        Line("- UI dev start and ping")
        $proc = Start-Process -FilePath "npm" -ArgumentList "--prefix apps/web-ui run dev" -PassThru -WindowStyle Hidden
        $serverPid = $proc.Id
        $deadline = (Get-Date).AddSeconds($TimeoutSec)
        $alive = $false
        while ((Get-Date) -lt $deadline) {
            try {
                $r = Invoke-WebRequest -Uri "$base" -UseBasicParsing -TimeoutSec 3
                if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { $alive = $true; break }
            }
            catch { Start-Sleep -Milliseconds 500 }
        }
        # try healthz if route exists
        $hz = $null
        try { $hz = Invoke-WebRequest -Uri "$base/api/healthz" -UseBasicParsing -TimeoutSec 5 } catch {}
        if ($serverPid) { try { Stop-Process -Id $serverPid -Force } catch {} }
        Line("  - server reachable: $alive")
        if ($hz) { Line("  - /api/healthz: " + $hz.StatusCode) } else { Line("  - /api/healthz: n/a") }
    }
}
else { $ok3 = $false; Line("- UI build skipped (apps/web-ui missing)") }

# 4) Secrets scan (lightweight)
Line("- Secrets scan"); $ok4 = $true
try { & ./scripts/tools/os1_secrets_scan.ps1 | Out-Null } catch { $ok4 = $false }

# Summarize
$rows = @("| Check | OK |", "|---|:---:|")
if ($ok1) { $rows += "| STB validate | OK |" } else { $rows += "| STB validate | FAIL |" }
if ($ok2) { $rows += "| Repo audit | OK |" } else { $rows += "| Repo audit | FAIL |" }
if ($ok3) { $rows += "| UI build | OK |" } else { $rows += "| UI build | FAIL |" }
if ($ok4) { $rows += "| Secrets scan | OK |" } else { $rows += "| Secrets scan | FAIL |" }
$script:lines += "", "## Summary"
$script:lines += $rows
New-Item -ItemType Directory -Force -Path (Split-Path $Report) | Out-Null
Set-Content -Path $Report -Value ($script:lines -join "`r`n") -Encoding UTF8
Write-Host "Smoke report -> $Report"
if (-not ($ok1 -and $ok2 -and $ok3 -and $ok4)) { exit 1 }
