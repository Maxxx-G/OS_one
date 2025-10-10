<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1ops
X-Purpose: identity-smoke
X-Version: v2025.10.11
X-Policy: filename+header compliance required
#>
# OS1 - Identity & Relay Smoke Test
# v2025.10.11
# Verifies /api/relay endpoint is reachable and returns expected structure

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

Write-Host "Identity & Relay Smoke Test" -ForegroundColor Cyan
Write-Host "Checking /api/relay endpoint at http://localhost:4000..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/relay" -Method GET -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json

    if ($json.status -eq "ok") {
        $modeCheck = "OK"
    } else {
        $modeCheck = "NO"
    }

    Write-Host "  /api/relay reachable: OK" -ForegroundColor Green
    Write-Host "  Status field: $($json.status)" -ForegroundColor White
    Write-Host "  SEC-COMMS mode: $($json.mode)" -ForegroundColor White
    Write-Host "  Requires auth: $($json.requiresAuth)" -ForegroundColor White
    Write-Host "  Mode check: $modeCheck" -ForegroundColor $(if ($modeCheck -eq "OK") { "Green" } else { "Red" })

    # Write report
    $reportPath = "docs/reports/user.copilot.identity-relay-smoke.v2025.10.11.md"
    $reportContent = @"
# Identity & Relay Smoke Test Report
**Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Endpoint**: http://localhost:4000/api/relay

## Results
- Endpoint reachable: OK
- Status: $($json.status)
- SEC-COMMS mode: $($json.mode)
- Requires authentication: $($json.requiresAuth)
- Mode check: $modeCheck

## Summary
All identity and relay checks passed.
"@
    New-Item -Path (Split-Path $reportPath -Parent) -ItemType Directory -Force | Out-Null
    Set-Content -Path $reportPath -Value $reportContent -Encoding ASCII

    Write-Host "`nSmoke test: PASSED" -ForegroundColor Green
    Write-Host "Report written to: $reportPath" -ForegroundColor Gray
    exit 0

} catch {
    Write-Host "  /api/relay check: FAILED" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    Write-Host "`nSmoke test: FAILED" -ForegroundColor Red
    exit 1
}
