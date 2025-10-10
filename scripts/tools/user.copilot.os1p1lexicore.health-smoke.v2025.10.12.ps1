<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1lexicore
X-Purpose: health-smoke
X-Version: v2025.10.12
X-Policy: filename+header compliance required
#>

# LexiCore Health Endpoint Smoke Test
# Verifies /api/lexicore/health returns 200 OK with expected payload

$ErrorActionPreference = "Continue"
$BaseUrl = "http://localhost:4000"
$ReportPath = "docs/reports/user.copilot.os1p1lexicore.health-smoke.v2025.10.12.md"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "`n=== LexiCore Health Endpoint Smoke Test ===" -ForegroundColor Cyan

# Test: Health endpoint
Write-Host "`n[1/1] Testing /api/lexicore/health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/lexicore/health" -Method GET -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.ok -eq $true -and $data.mode -eq "local_only") {
            Write-Host "✅ Health endpoint: PASS (ok=true, mode=local_only)" -ForegroundColor Green
            $healthStatus = "PASS"
            $healthDetails = "ok=$($data.ok), mode=$($data.mode), version=$($data.version)"
        } else {
            Write-Host "⚠️  Health endpoint: WARN - Unexpected payload" -ForegroundColor Yellow
            $healthStatus = "WARN"
            $healthDetails = "ok=$($data.ok), mode=$($data.mode)"
        }
    } else {
        Write-Host "⚠️  Health endpoint: Unexpected status $($response.StatusCode)" -ForegroundColor Yellow
        $healthStatus = "WARN"
        $healthDetails = "HTTP $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Health endpoint: FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $healthStatus = "FAIL"
    $healthDetails = $_.Exception.Message
}

# Generate report
$reportContent = @"
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1lexicore
X-Purpose: health-smoke-report
X-Version: v2025.10.12
X-Policy: filename+header compliance required

---

# LexiCore Health Endpoint Smoke Test Report

**Timestamp**: $Timestamp  
**Base URL**: $BaseUrl  
**Endpoint**: /api/lexicore/health

## Results

| Check | Status | Details |
|---|:---:|---|
| Health Endpoint (GET) | $healthStatus | $healthDetails |

## Summary

- **Health Check**: $healthStatus
- **Expected Payload**: { "ok": true, "mode": "local_only", "version": "v2025.10.12" }

## Conclusion

"@

if ($healthStatus -eq "PASS") {
    $reportContent += "✅ LexiCore health endpoint smoke test PASSED - Service operational`n"
    Write-Host "`n✅ SMOKE TEST PASSED" -ForegroundColor Green
    $exitCode = 0
} else {
    $reportContent += "⚠️ LexiCore health endpoint smoke test FAILED - Check dev server status`n"
    Write-Host "`n⚠️ SMOKE TEST FAILED" -ForegroundColor Yellow
    $exitCode = 1
}

# Write report
New-Item -Path (Split-Path $ReportPath -Parent) -ItemType Directory -Force | Out-Null
[IO.File]::WriteAllText((Join-Path (Get-Location) $ReportPath), $reportContent, [System.Text.Encoding]::UTF8)

Write-Host "`nHealth smoke report saved: $ReportPath" -ForegroundColor Cyan
exit $exitCode
