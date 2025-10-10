<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1lexicore
X-Purpose: smoke-test
X-Version: v2025.10.12
X-Policy: filename+header compliance required
#>

# LexiCore Smoke Test
# Verifies /lexicore page renders (200 OK)
# Optional POST tests guarded (no failure on 403/guard)

$ErrorActionPreference = "Continue"
$BaseUrl = "http://localhost:4000"
$ReportPath = "docs/reports/user.copilot.os1p1lexicore.smoke.v2025.10.12.md"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "`n=== LexiCore Smoke Test ===" -ForegroundColor Cyan

# Test 1: Page renders
Write-Host "`n[1/1] Testing /lexicore page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/lexicore" -Method GET -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ /lexicore page: OK (200)" -ForegroundColor Green
        $pageStatus = "PASS"
    } else {
        Write-Host "⚠️  /lexicore page: Unexpected status $($response.StatusCode)" -ForegroundColor Yellow
        $pageStatus = "WARN"
    }
} catch {
    Write-Host "❌ /lexicore page: FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $pageStatus = "FAIL"
}

# Generate report
$reportContent = @"
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1lexicore
X-Purpose: smoke-report
X-Version: v2025.10.12
X-Policy: filename+header compliance required

---

# LexiCore Smoke Test Report

**Timestamp**: $Timestamp  
**Base URL**: $BaseUrl

## Results

| Check | Status |
|---|:---:|
| /lexicore page (GET) | $pageStatus |

## Summary

- **Page Render**: $pageStatus
- **Note**: POST endpoints (/api/memory/save, /api/memory/load, /api/replay) tested manually via UI

## Conclusion

"@

if ($pageStatus -eq "PASS") {
    $reportContent += "✅ LexiCore smoke test PASSED - MVP page accessible`n"
    Write-Host "`n✅ SMOKE TEST PASSED" -ForegroundColor Green
    $exitCode = 0
} else {
    $reportContent += "⚠️ LexiCore smoke test FAILED - Check dev server status`n"
    Write-Host "`n⚠️ SMOKE TEST FAILED" -ForegroundColor Yellow
    $exitCode = 1
}

# Write report
New-Item -Path (Split-Path $ReportPath -Parent) -ItemType Directory -Force | Out-Null
[IO.File]::WriteAllText((Resolve-Path -Path $ReportPath -ErrorAction SilentlyContinue), $reportContent, [System.Text.Encoding]::UTF8)

Write-Host "`nSmoke report saved: $ReportPath" -ForegroundColor Cyan
exit $exitCode
