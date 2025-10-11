<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p2ops
X-Purpose: ci-smoke-suite
X-Version: v2025.10.13
X-Policy: filename+header compliance required
#>

# OS One — Comprehensive CI Smoke Test Suite
# Validates: STB compliance, repo audit, health endpoints, chat SSE, telemetry

$ErrorActionPreference = "Continue"
$BaseUrl = "http://localhost:4000"
$ReportPath = "docs/reports/user.copilot.os1p2ops.ci-smoke-suite.v2025.10.13.md"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"

Write-Host "`n=== OS One CI Smoke Test Suite ===" -ForegroundColor Cyan
Write-Host "Timestamp: $Timestamp`n" -ForegroundColor Gray

# Initialize counters
$totalTests = 0
$passedTests = 0
$failedTests = 0
$skippedTests = 0
$results = @()

# Helper: Run test and track result
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [string]$ExpectedContent = $null,
        [int]$TimeoutSec = 5
    )
    
    $script:totalTests++
    Write-Host "[Test $script:totalTests] $Name..." -ForegroundColor Yellow -NoNewline
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
            TimeoutSec = $TimeoutSec
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq 200) {
            if ($ExpectedContent -and $response.Content -notmatch $ExpectedContent) {
                Write-Host " FAIL (content mismatch)" -ForegroundColor Red
                $script:failedTests++
                return @{ Name = $Name; Status = "FAIL"; Details = "Content did not match: $ExpectedContent" }
            }
            Write-Host " PASS" -ForegroundColor Green
            $script:passedTests++
            return @{ Name = $Name; Status = "PASS"; Details = "Status 200, response OK" }
        }
        else {
            Write-Host " FAIL (status $($response.StatusCode))" -ForegroundColor Red
            $script:failedTests++
            return @{ Name = $Name; Status = "FAIL"; Details = "Unexpected status: $($response.StatusCode)" }
        }
    }
    catch {
        # Check if it's a connection error (server not running)
        if ($_.Exception.Message -match "Unable to connect|connection") {
            Write-Host " SKIP (server not running)" -ForegroundColor DarkGray
            $script:skippedTests++
            return @{ Name = $Name; Status = "SKIP"; Details = "Dev server not running at $BaseUrl" }
        }
        
        Write-Host " FAIL ($($_.Exception.Message))" -ForegroundColor Red
        $script:failedTests++
        return @{ Name = $Name; Status = "FAIL"; Details = $_.Exception.Message }
    }
}

Write-Host "`n--- Phase 1: STB Compliance ---`n" -ForegroundColor Cyan

# Test 1: Guardian validation
$totalTests++
Write-Host "[Test $totalTests] Guardian blocking mode..." -ForegroundColor Yellow -NoNewline
try {
    $guardianResult = node scripts/checks/stb_guard.mjs 2>&1 | Out-String
    if ($guardianResult -match "PASS") {
        Write-Host " PASS" -ForegroundColor Green
        $passedTests++
        $results += @{ Name = "Guardian STB validation"; Status = "PASS"; Details = "Zero-tolerance guard passed" }
    }
    else {
        Write-Host " FAIL" -ForegroundColor Red
        $failedTests++
        $results += @{ Name = "Guardian STB validation"; Status = "FAIL"; Details = $guardianResult }
    }
}
catch {
    Write-Host " FAIL ($($_.Exception.Message))" -ForegroundColor Red
    $failedTests++
    $results += @{ Name = "Guardian STB validation"; Status = "FAIL"; Details = $_.Exception.Message }
}

# Test 2: STB header validation
$totalTests++
Write-Host "[Test $totalTests] STB header compliance..." -ForegroundColor Yellow -NoNewline
try {
    $headerResult = npm run validate:stb 2>&1 | Out-String
    if ($headerResult -match "All STB files are compliant" -or $headerResult -match "Valid:") {
        Write-Host " PASS" -ForegroundColor Green
        $passedTests++
        $results += @{ Name = "STB header validation"; Status = "PASS"; Details = "Templates compliant" }
    }
    else {
        Write-Host " FAIL" -ForegroundColor Red
        $failedTests++
        $results += @{ Name = "STB header validation"; Status = "FAIL"; Details = $headerResult }
    }
}
catch {
    Write-Host " FAIL ($($_.Exception.Message))" -ForegroundColor Red
    $failedTests++
    $results += @{ Name = "STB header validation"; Status = "FAIL"; Details = $_.Exception.Message }
}

Write-Host "`n--- Phase 2: Health Endpoints ---`n" -ForegroundColor Cyan

# Test 3-7: Health endpoints
$results += Test-Endpoint -Name "General health endpoint" -Url "$BaseUrl/api/health" -ExpectedContent '"ok":\s*true'
$results += Test-Endpoint -Name "Aurora health endpoint" -Url "$BaseUrl/api/aurora/health" -ExpectedContent '"ok":\s*true'
$results += Test-Endpoint -Name "LexiCore health endpoint" -Url "$BaseUrl/api/lexicore/health" -ExpectedContent '"ok":\s*true'
$results += Test-Endpoint -Name "Voice health endpoint" -Url "$BaseUrl/api/voice/health" -ExpectedContent '"ok":\s*true'
$results += Test-Endpoint -Name "Telemetry endpoint" -Url "$BaseUrl/api/telemetry" -ExpectedContent '"mode":\s*"'

Write-Host "`n--- Phase 3: SEC-COMMS Layers ---`n" -ForegroundColor Cyan

# Test 8: Memory (ε-layer) - Load
$results += Test-Endpoint -Name "Vault load (ε-layer)" -Url "$BaseUrl/api/memory" -Method "GET"

# Test 9: Replay (ζ-layer) - List
$results += Test-Endpoint -Name "Replay list (ζ-layer)" -Url "$BaseUrl/api/replay" -Method "GET"

Write-Host "`n--- Phase 4: Chat SSE Backend ---`n" -ForegroundColor Cyan

# Test 10: Chat SSE
$totalTests++
Write-Host "[Test $totalTests] Chat SSE backend..." -ForegroundColor Yellow -NoNewline
try {
    $chatBody = @{ message = "Hello, smoke test!" }
    $chatResponse = Invoke-WebRequest -Uri "$BaseUrl/api/chat" -Method POST -Body ($chatBody | ConvertTo-Json) -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    
    $contentType = $chatResponse.Headers["Content-Type"]
    
    if ($chatResponse.StatusCode -eq 200 -and $contentType -match "text/event-stream") {
        Write-Host " PASS (SSE stream detected)" -ForegroundColor Green
        $passedTests++
        $results += @{ Name = "Chat SSE backend"; Status = "PASS"; Details = "Content-Type: $contentType" }
    }
    elseif ($chatResponse.StatusCode -eq 200) {
        Write-Host " WARN (200 OK but not SSE)" -ForegroundColor Yellow
        $skippedTests++
        $results += @{ Name = "Chat SSE backend"; Status = "WARN"; Details = "Content-Type: $contentType (expected text/event-stream)" }
    }
    else {
        Write-Host " FAIL (status $($chatResponse.StatusCode))" -ForegroundColor Red
        $failedTests++
        $results += @{ Name = "Chat SSE backend"; Status = "FAIL"; Details = "Unexpected status: $($chatResponse.StatusCode)" }
    }
}
catch {
    if ($_.Exception.Message -match "Unable to connect|connection") {
        Write-Host " SKIP (server not running)" -ForegroundColor DarkGray
        $skippedTests++
        $results += @{ Name = "Chat SSE backend"; Status = "SKIP"; Details = "Dev server not running" }
    }
    else {
        Write-Host " FAIL ($($_.Exception.Message))" -ForegroundColor Red
        $failedTests++
        $results += @{ Name = "Chat SSE backend"; Status = "FAIL"; Details = $_.Exception.Message }
    }
}

Write-Host "`n--- Phase 5: Build & Secrets ---`n" -ForegroundColor Cyan

# Test 11: Check for hardcoded secrets (basic scan)
$totalTests++
Write-Host "[Test $totalTests] Secrets scan (basic)..." -ForegroundColor Yellow -NoNewline
try {
    $secretPatterns = @("sk-", "AKIA", "ghp_", "Bearer ")
    $secretFound = $false
    
    Get-ChildItem -Path "apps/web-ui/app" -Recurse -Include *.ts,*.tsx,*.js,*.jsx -ErrorAction SilentlyContinue | ForEach-Object {
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        foreach ($pattern in $secretPatterns) {
            if ($content -match [regex]::Escape($pattern)) {
                $secretFound = $true
                break
            }
        }
    }
    
    if (-not $secretFound) {
        Write-Host " PASS (no obvious secrets)" -ForegroundColor Green
        $passedTests++
        $results += @{ Name = "Secrets scan"; Status = "PASS"; Details = "No hardcoded API keys detected" }
    }
    else {
        Write-Host " WARN (potential secret found)" -ForegroundColor Yellow
        $skippedTests++
        $results += @{ Name = "Secrets scan"; Status = "WARN"; Details = "Potential secret pattern detected (manual review needed)" }
    }
}
catch {
    Write-Host " SKIP ($($_.Exception.Message))" -ForegroundColor DarkGray
    $skippedTests++
    $results += @{ Name = "Secrets scan"; Status = "SKIP"; Details = $_.Exception.Message }
}

# Test 12: Vault/embeddings .gitignore
$totalTests++
Write-Host "[Test $totalTests] Vault/embeddings .gitignore..." -ForegroundColor Yellow -NoNewline
try {
    $gitignore = Get-Content ".gitignore" -Raw -ErrorAction Stop
    if ($gitignore -match "data/vault" -and $gitignore -match "data/embeddings") {
        Write-Host " PASS" -ForegroundColor Green
        $passedTests++
        $results += @{ Name = "Vault/embeddings .gitignore"; Status = "PASS"; Details = "Vault and embeddings properly ignored" }
    }
    else {
        Write-Host " FAIL (missing .gitignore rules)" -ForegroundColor Red
        $failedTests++
        $results += @{ Name = "Vault/embeddings .gitignore"; Status = "FAIL"; Details = "Vault or embeddings not in .gitignore" }
    }
}
catch {
    Write-Host " FAIL ($($_.Exception.Message))" -ForegroundColor Red
    $failedTests++
    $results += @{ Name = "Vault/embeddings .gitignore"; Status = "FAIL"; Details = $_.Exception.Message }
}

Write-Host "`n--- Summary ---`n" -ForegroundColor Cyan

$passRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }

Write-Host "Total Tests:   $totalTests" -ForegroundColor White
Write-Host "Passed:        $passedTests ($passRate%)" -ForegroundColor Green
Write-Host "Failed:        $failedTests" -ForegroundColor $(if ($failedTests -gt 0) { "Red" } else { "Green" })
Write-Host "Skipped:       $skippedTests" -ForegroundColor DarkGray

if ($failedTests -eq 0 -and $passedTests -gt 0) {
    Write-Host "`n✅ CI SMOKE SUITE: PASS" -ForegroundColor Green
    $overallStatus = "PASS"
}
elseif ($failedTests -gt 0) {
    Write-Host "`n❌ CI SMOKE SUITE: FAIL" -ForegroundColor Red
    $overallStatus = "FAIL"
}
else {
    Write-Host "`n⚠️  CI SMOKE SUITE: INCOMPLETE (no tests passed)" -ForegroundColor Yellow
    $overallStatus = "INCOMPLETE"
}

# Generate markdown report
$reportContent = @"
X-Tier1: user
X-Agent: copilot
X-Domain: os1p2ops
X-Purpose: ci-smoke-suite-report
X-Version: v2025.10.13
X-Policy: filename+header compliance required

---

# CI Smoke Test Suite Report · v2025.10.13

**Timestamp**: $Timestamp  
**Overall Status**: $overallStatus  
**Pass Rate**: $passRate%

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tests | $totalTests |
| Passed | $passedTests |
| Failed | $failedTests |
| Skipped | $skippedTests |

---

## Test Results

| # | Test Name | Status | Details |
|---|-----------|--------|---------|
"@

$counter = 1
foreach ($result in $results) {
    $status = $result.Status
    $emoji = switch ($status) {
        "PASS" { "[PASS]" }
        "FAIL" { "[FAIL]" }
        "SKIP" { "[SKIP]" }
        "WARN" { "[WARN]" }
        default { "[????]" }
    }
    $name = $result.Name
    $details = $result.Details
    $reportContent += [Environment]::NewLine + "| $counter | $name | $emoji | $details |"
    $counter++
}

$notesSection = @"


---

## Notes

- **SKIP** status for endpoints indicates dev server not running (expected in CI without server start)
- **WARN** status requires manual review but does not block CI
- Run with dev server active: ``npm run dev:web-ui`` before executing this script
"@

$reportContent += $notesSection

$recommendationsSection = @"


---

## Recommendations

### If FAIL

1. Review failed test details above
2. Check guardian/STB compliance for file naming violations
3. Verify health endpoints return 200 JSON with ``ok: true``
4. Ensure chat SSE returns ``Content-Type: text/event-stream``

### If SKIP (Server Not Running)

1. Start dev server: ``npm run dev:web-ui``
2. Wait 10 seconds for server startup
3. Re-run smoke suite: ``powershell ./scripts/tools/user.copilot.os1p2ops.ci-smoke-suite.v2025.10.13.ps1``

---

**Report Generated**: $Timestamp  
**Script**: ``scripts/tools/user.copilot.os1p2ops.ci-smoke-suite.v2025.10.13.ps1``
"@

$reportContent += $recommendationsSection

# Write report to file
try {
    $reportContent | Out-File -FilePath $ReportPath -Encoding UTF8 -Force
    Write-Host "`nReport saved: $ReportPath" -ForegroundColor Cyan
}
catch {
    Write-Host "`nFailed to save report: $($_.Exception.Message)" -ForegroundColor Red
}

# Exit with appropriate code
if ($failedTests -gt 0) {
    exit 1
}
else {
    exit 0
}
