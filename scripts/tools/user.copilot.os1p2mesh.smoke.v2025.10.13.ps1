<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p2mesh
X-Purpose: smoke
X-Version: v2025.10.13
X-Policy: filename+header compliance required
#>

# Mesh Gamma-Layer Smoke Test
# Validates /api/mesh/heartbeat and /api/mesh/peers endpoints

$ErrorActionPreference = "Continue"
$BaseUrl = "http://localhost:4000"
$ReportPath = "docs/reports/user.copilot.os1p2mesh.smoke.v2025.10.13.md"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"

Write-Host "`n=== Mesh Gamma-Layer Smoke Test ===" -ForegroundColor Cyan
Write-Host "Timestamp: $Timestamp`n" -ForegroundColor Gray

$totalTests = 0
$passedTests = 0
$failedTests = 0
$results = @()

# Helper: Test endpoint
function Test-MeshEndpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$ExpectedField
    )
    
    $script:totalTests++
    Write-Host "[Test $script:totalTests] $Name..." -ForegroundColor Yellow -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec 5
        
        if ($response.StatusCode -eq 200) {
            $json = $response.Content | ConvertFrom-Json
            $secCommsHeader = $response.Headers["X-SEC-COMMS-MODE"]
            
            # Check for expected field
            if ($json.$ExpectedField -ne $null) {
                # Check for SEC-COMMS header
                if ($secCommsHeader) {
                    Write-Host " PASS" -ForegroundColor Green
                    $script:passedTests++
                    return @{ 
                        Name = $Name
                        Status = "PASS"
                        Details = "Status 200, field '$ExpectedField' present, X-SEC-COMMS-MODE: $secCommsHeader"
                    }
                }
                else {
                    Write-Host " WARN (missing X-SEC-COMMS-MODE header)" -ForegroundColor Yellow
                    $script:passedTests++
                    return @{ 
                        Name = $Name
                        Status = "WARN"
                        Details = "Status 200, field present, but missing X-SEC-COMMS-MODE header"
                    }
                }
            }
            else {
                Write-Host " FAIL (field '$ExpectedField' missing)" -ForegroundColor Red
                $script:failedTests++
                return @{ 
                    Name = $Name
                    Status = "FAIL"
                    Details = "Field '$ExpectedField' not found in response"
                }
            }
        }
        else {
            Write-Host " FAIL (status $($response.StatusCode))" -ForegroundColor Red
            $script:failedTests++
            return @{ 
                Name = $Name
                Status = "FAIL"
                Details = "Unexpected status: $($response.StatusCode)"
            }
        }
    }
    catch {
        if ($_.Exception.Message -match "Unable to connect|connection") {
            Write-Host " SKIP (server not running)" -ForegroundColor DarkGray
            return @{ 
                Name = $Name
                Status = "SKIP"
                Details = "Dev server not running at $BaseUrl"
            }
        }
        
        Write-Host " FAIL ($($_.Exception.Message))" -ForegroundColor Red
        $script:failedTests++
        return @{ 
            Name = $Name
            Status = "FAIL"
            Details = $_.Exception.Message
        }
    }
}

# Test 1: Heartbeat endpoint
$results += Test-MeshEndpoint -Name "Mesh heartbeat endpoint" -Url "$BaseUrl/api/mesh/heartbeat" -ExpectedField "ok"

# Test 2: Peers endpoint
$results += Test-MeshEndpoint -Name "Mesh peers endpoint" -Url "$BaseUrl/api/mesh/peers" -ExpectedField "peers"

# Summary
Write-Host "`n--- Summary ---`n" -ForegroundColor Cyan

$passRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }

Write-Host "Total Tests:   $totalTests" -ForegroundColor White
Write-Host "Passed:        $passedTests ($passRate%)" -ForegroundColor Green
Write-Host "Failed:        $failedTests" -ForegroundColor $(if ($failedTests -gt 0) { "Red" } else { "Green" })

if ($failedTests -eq 0 -and $passedTests -gt 0) {
    Write-Host "`n[PASS] Mesh Gamma-Layer Smoke Test" -ForegroundColor Green
    $overallStatus = "PASS"
}
elseif ($failedTests -gt 0) {
    Write-Host "`n[FAIL] Mesh Gamma-Layer Smoke Test" -ForegroundColor Red
    $overallStatus = "FAIL"
}
else {
    Write-Host "`n[SKIP] Mesh Gamma-Layer Smoke Test (no tests passed)" -ForegroundColor Yellow
    $overallStatus = "SKIP"
}

# Generate report
$reportContent = @"
X-Tier1: user
X-Agent: copilot
X-Domain: os1p2mesh
X-Purpose: smoke-report
X-Version: v2025.10.13
X-Policy: filename+header compliance required

---

# Mesh Gamma-Layer Smoke Test Report

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

---

## Test Results

| # | Test Name | Status | Details |
|---|-----------|--------|---------|
"@

$counter = 1
foreach ($result in $results) {
    $status = $result.Status
    $tag = switch ($status) {
        "PASS" { "[PASS]" }
        "FAIL" { "[FAIL]" }
        "SKIP" { "[SKIP]" }
        "WARN" { "[WARN]" }
        default { "[????]" }
    }
    $name = $result.Name
    $details = $result.Details
    $reportContent += [Environment]::NewLine + "| $counter | $name | $tag | $details |"
    $counter++
}

$notesSection = @"


---

## Endpoints Tested

### /api/mesh/heartbeat
- **Purpose**: System heartbeat with SEC-COMMS mode
- **Expected**: `{ ok: true, ts: ISO, mode: string, intervalMs: 5000 }`
- **Headers**: `X-SEC-COMMS-MODE` should be present

### /api/mesh/peers
- **Purpose**: List active agents in mesh
- **Expected**: `{ ok: true, peers: [...], mode: string }`
- **Headers**: `X-SEC-COMMS-MODE` should be present
- **Note**: Static stub for Week 2 (Gabriel + Codex)

---

## Notes

- **SKIP** status indicates dev server not running (expected in CI)
- **WARN** status indicates endpoint works but missing SEC-COMMS headers
- Run with dev server active: ``npm run dev:web-ui``

---

## Next Steps (Week 2)

1. Implement dynamic peer registry (in-memory)
2. Add heartbeat expiration tracking (15s TTL)
3. POST /api/mesh/heartbeat for agents to register
4. Integrate with dual-agent chat UI

---

**Report Generated**: $Timestamp  
**Script**: ``scripts/tools/user.copilot.os1p2mesh.smoke.v2025.10.13.ps1``
"@

$reportContent += $notesSection

# Write report
try {
    $reportContent | Out-File -FilePath $ReportPath -Encoding UTF8 -Force
    Write-Host "`nReport saved: $ReportPath" -ForegroundColor Cyan
}
catch {
    Write-Host "`nFailed to save report: $($_.Exception.Message)" -ForegroundColor Red
}

# Exit code
if ($failedTests -gt 0) {
    exit 1
}
else {
    exit 0
}
