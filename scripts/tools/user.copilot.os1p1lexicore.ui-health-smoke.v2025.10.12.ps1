<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1lexicore
X-Purpose: ui-health-smoke
X-Version: v2025.10.12
X-Policy: filename+header compliance required
#>

# LexiCore UI Health Integration Smoke Test
# Verifies /lexicore page renders with health badge

$ErrorActionPreference = "Continue"
$BaseUrl = "http://localhost:4000"
$ReportPath = "docs/reports/user.copilot.os1p1lexicore.ui-health-smoke.v2025.10.12.md"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "`n=== LexiCore UI Health Integration Smoke Test ===" -ForegroundColor Cyan

# Test 1: Page renders
Write-Host "`n[1/2] Testing /lexicore page availability..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/lexicore" -Method GET -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ /lexicore page: OK (200)" -ForegroundColor Green
        $pageStatus = "PASS"
        $pageDetails = "HTTP 200"
    } else {
        Write-Host "⚠️  /lexicore page: Unexpected status $($response.StatusCode)" -ForegroundColor Yellow
        $pageStatus = "WARN"
        $pageDetails = "HTTP $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ /lexicore page: FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $pageStatus = "FAIL"
    $pageDetails = $_.Exception.Message
}

# Test 2: Health badge content (optional text check)
Write-Host "`n[2/2] Checking for health badge content..." -ForegroundColor Yellow
try {
    if ($pageStatus -eq "PASS") {
        # Simple content match for badge text (Healthy or Offline)
        if ($response.Content -match "Healthy|Offline|Checking") {
            Write-Host "✅ Health badge: Present (found status text)" -ForegroundColor Green
            $badgeStatus = "PASS"
            $badgeDetails = "Status badge detected in HTML"
        } else {
            Write-Host "⚠️  Health badge: Not detected" -ForegroundColor Yellow
            $badgeStatus = "WARN"
            $badgeDetails = "No status badge text found"
        }
    } else {
        Write-Host "⚠️  Health badge: Skipped (page not available)" -ForegroundColor Yellow
        $badgeStatus = "SKIP"
        $badgeDetails = "Page unavailable"
    }
} catch {
    Write-Host "❌ Health badge: FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $badgeStatus = "FAIL"
    $badgeDetails = $_.Exception.Message
}

# Generate report
$reportContent = @"
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1lexicore
X-Purpose: ui-health-smoke-report
X-Version: v2025.10.12
X-Policy: filename+header compliance required

---

# LexiCore UI Health Integration Smoke Test Report

**Timestamp**: $Timestamp  
**Base URL**: $BaseUrl  
**Page**: /lexicore

## Results

| Check | Status | Details |
|---|:---:|---|
| Page Availability (GET) | $pageStatus | $pageDetails |
| Health Badge Content | $badgeStatus | $badgeDetails |

## Summary

- **Page Render**: $pageStatus
- **Health Badge**: $badgeStatus
- **Expected**: Health badge shows "✅ Healthy" (green) or "❌ Offline" (red)

## Conclusion

"@

if ($pageStatus -eq "PASS" -and ($badgeStatus -eq "PASS" -or $badgeStatus -eq "SKIP")) {
    $reportContent += "✅ LexiCore UI health integration smoke test PASSED - Page accessible with health badge`n"
    Write-Host "`n✅ SMOKE TEST PASSED" -ForegroundColor Green
    $exitCode = 0
} else {
    $reportContent += "⚠️ LexiCore UI health integration smoke test FAILED - Check dev server status`n"
    Write-Host "`n⚠️ SMOKE TEST FAILED" -ForegroundColor Yellow
    $exitCode = 1
}

# Write report
New-Item -Path (Split-Path $ReportPath -Parent) -ItemType Directory -Force | Out-Null
[IO.File]::WriteAllText((Join-Path (Get-Location) $ReportPath), $reportContent, [System.Text.Encoding]::UTF8)

Write-Host "`nUI health smoke report saved: $ReportPath" -ForegroundColor Cyan
exit $exitCode
