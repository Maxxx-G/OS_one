<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1universe
X-Purpose: registry-smoke
X-Version: v2025.10.12
X-Policy: filename+header compliance required
#>

# Genesis Registry Smoke Test
# Validates JSON structure and MVP app fields

$ErrorActionPreference = "Continue"
$RegistryPath = "docs/hubs/user.copilot.os1universe.genesis-app-registry.v2025.10.12.json"
$ReportPath = "docs/reports/user.copilot.os1universe.registry-smoke.v2025.10.12.md"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "`n=== Genesis Registry Smoke Test ===" -ForegroundColor Cyan

# Test 1: JSON validity
Write-Host "`n[1/5] Testing JSON validity..." -ForegroundColor Yellow
try {
    $registry = Get-Content $RegistryPath -Raw | ConvertFrom-Json
    Write-Host "✅ JSON valid: Registry parsed successfully" -ForegroundColor Green
    $jsonStatus = "PASS"
    $jsonDetails = "Valid JSON structure"
} catch {
    Write-Host "❌ JSON invalid: $($_.Exception.Message)" -ForegroundColor Red
    $jsonStatus = "FAIL"
    $jsonDetails = $_.Exception.Message
}

# Test 2: Required fields
Write-Host "`n[2/5] Checking required fields..." -ForegroundColor Yellow
$requiredFieldsPass = $true
$missingFields = @()
try {
    foreach ($app in $registry.tier1) {
        $required = @("key", "title", "status", "seccomms", "features")
        foreach ($field in $required) {
            if (-not $app.PSObject.Properties.Name.Contains($field)) {
                $missingFields += "$($app.key): missing $field"
                $requiredFieldsPass = $false
            }
        }
    }
    if ($requiredFieldsPass) {
        Write-Host "✅ Required fields: All present" -ForegroundColor Green
        $fieldsStatus = "PASS"
        $fieldsDetails = "All apps have required fields"
    } else {
        Write-Host "⚠️  Required fields: Missing - $($missingFields -join ', ')" -ForegroundColor Yellow
        $fieldsStatus = "WARN"
        $fieldsDetails = $missingFields -join ', '
    }
} catch {
    Write-Host "❌ Required fields check failed: $($_.Exception.Message)" -ForegroundColor Red
    $fieldsStatus = "FAIL"
    $fieldsDetails = $_.Exception.Message
}

# Test 3: MVP consistency
Write-Host "`n[3/5] Checking MVP app consistency..." -ForegroundColor Yellow
$mvpConsistencyPass = $true
$mvpIssues = @()
try {
    $mvpApps = $registry.tier1 | Where-Object { $_.status -eq "mvp" }
    foreach ($app in $mvpApps) {
        if (-not $app.route) {
            $mvpIssues += "$($app.key): MVP missing route"
            $mvpConsistencyPass = $false
        }
        if (-not $app.api) {
            $mvpIssues += "$($app.key): MVP missing api"
            $mvpConsistencyPass = $false
        }
        if ($app.stage -eq "active" -and -not $app.telemetry) {
            $mvpIssues += "$($app.key): Active MVP should have telemetry=true"
        }
    }
    if ($mvpConsistencyPass) {
        Write-Host "✅ MVP consistency: All MVP apps have route + api" -ForegroundColor Green
        $mvpStatus = "PASS"
        $mvpDetails = "$($mvpApps.Count) MVP apps validated"
    } else {
        Write-Host "⚠️  MVP consistency: Issues - $($mvpIssues -join ', ')" -ForegroundColor Yellow
        $mvpStatus = "WARN"
        $mvpDetails = $mvpIssues -join ', '
    }
} catch {
    Write-Host "❌ MVP consistency check failed: $($_.Exception.Message)" -ForegroundColor Red
    $mvpStatus = "FAIL"
    $mvpDetails = $_.Exception.Message
}

# Test 4: AuroraWire MVP fields
Write-Host "`n[4/5] Verifying AuroraWire MVP fields..." -ForegroundColor Yellow
try {
    $aurora = $registry.tier1 | Where-Object { $_.key -eq "aurora-wire" }
    if ($aurora.status -eq "mvp" -and $aurora.stage -eq "active" -and $aurora.telemetry -eq $true -and $aurora.route -eq "/aurora" -and $aurora.api -eq "/api/aurora/health") {
        Write-Host "✅ AuroraWire: status=mvp, stage=active, telemetry=true, route=/aurora, api=/api/aurora/health" -ForegroundColor Green
        $auroraStatus = "PASS"
        $auroraDetails = "All fields correct"
    } else {
        Write-Host "⚠️  AuroraWire: Missing or incorrect fields" -ForegroundColor Yellow
        $auroraStatus = "WARN"
        $auroraDetails = "status=$($aurora.status), stage=$($aurora.stage), telemetry=$($aurora.telemetry)"
    }
} catch {
    Write-Host "❌ AuroraWire check failed: $($_.Exception.Message)" -ForegroundColor Red
    $auroraStatus = "FAIL"
    $auroraDetails = $_.Exception.Message
}

# Test 5: LexiCore MVP fields
Write-Host "`n[5/5] Verifying LexiCore MVP fields..." -ForegroundColor Yellow
try {
    $lexicore = $registry.tier1 | Where-Object { $_.key -eq "lexicore" }
    if ($lexicore.status -eq "mvp" -and $lexicore.stage -eq "active" -and $lexicore.telemetry -eq $true -and $lexicore.route -eq "/lexicore" -and $lexicore.api -eq "/api/lexicore/health") {
        Write-Host "✅ LexiCore: status=mvp, stage=active, telemetry=true, route=/lexicore, api=/api/lexicore/health" -ForegroundColor Green
        $lexicoreStatus = "PASS"
        $lexicoreDetails = "All fields correct"
    } else {
        Write-Host "⚠️  LexiCore: Missing or incorrect fields" -ForegroundColor Yellow
        $lexicoreStatus = "WARN"
        $lexicoreDetails = "status=$($lexicore.status), stage=$($lexicore.stage), telemetry=$($lexicore.telemetry)"
    }
} catch {
    Write-Host "❌ LexiCore check failed: $($_.Exception.Message)" -ForegroundColor Red
    $lexicoreStatus = "FAIL"
    $lexicoreDetails = $_.Exception.Message
}

# Generate report
$reportContent = @"
X-Tier1: user
X-Agent: copilot
X-Domain: os1universe
X-Purpose: registry-smoke-report
X-Version: v2025.10.12
X-Policy: filename+header compliance required

---

# Genesis Registry Smoke Test Report

**Timestamp**: $Timestamp  
**Registry**: $RegistryPath

## Results

| Check | Status | Details |
|---|:---:|---|
| JSON Validity | $jsonStatus | $jsonDetails |
| Required Fields | $fieldsStatus | $fieldsDetails |
| MVP Consistency | $mvpStatus | $mvpDetails |
| AuroraWire MVP | $auroraStatus | $auroraDetails |
| LexiCore MVP | $lexicoreStatus | $lexicoreDetails |

## Summary

- **JSON Structure**: $jsonStatus
- **Field Validation**: $fieldsStatus
- **MVP Apps**: AuroraWire ($auroraStatus), LexiCore ($lexicoreStatus)

## Conclusion

"@

if ($jsonStatus -eq "PASS" -and $fieldsStatus -eq "PASS" -and $mvpStatus -eq "PASS" -and $auroraStatus -eq "PASS" -and $lexicoreStatus -eq "PASS") {
    $reportContent += "✅ Genesis registry smoke test PASSED - All validations successful`n"
    Write-Host "`n✅ SMOKE TEST PASSED" -ForegroundColor Green
    $exitCode = 0
} else {
    $reportContent += "⚠️ Genesis registry smoke test FAILED - Check validation details above`n"
    Write-Host "`n⚠️ SMOKE TEST FAILED" -ForegroundColor Yellow
    $exitCode = 1
}

# Write report
New-Item -Path (Split-Path $ReportPath -Parent) -ItemType Directory -Force | Out-Null
[IO.File]::WriteAllText((Join-Path (Get-Location) $ReportPath), $reportContent, [System.Text.Encoding]::UTF8)

Write-Host "`nRegistry smoke report saved: $ReportPath" -ForegroundColor Cyan
exit $exitCode
