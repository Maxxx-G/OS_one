#!/usr/bin/env pwsh
<#
.SYNOPSIS
  OS1 Stabilize Mode - Emergency "everything works" health check.

.DESCRIPTION
  Sets CHAT_BACKEND_MOCK=1, starts web-ui dev server, probes /api/chat/health,
  sends a minimal POST to /api/chat, and prints GUARDIAN_SUMMARY PASS/FAIL.
  
  This is the single command to verify the entire chat stack is operational
  in MOCK mode before attempting real backend connections.

.NOTES
  X-Tier1: tool
  X-Agent: user.copilot
  X-Domain: os1p3
  X-Purpose: ops-stabilize
  X-Version: v2025.10.15
  X-Policy: Single-Fence STB

.EXAMPLE
  powershell -f scripts/tools/user.copilot.os1p3.ops-stabilize.v2025.10.15.ps1

.OUTPUTS
  Exit 0 (PASS) or 81 (FAIL)
#>

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OS1 STABILIZE: Emergency Health Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Enable MOCK mode
Write-Host "[1/5] Enabling MOCK mode..." -ForegroundColor Yellow
$env:CHAT_BACKEND_MOCK = "1"
$env:CHAT_BACKEND_MODE = "auto"
Write-Host "      CHAT_BACKEND_MOCK=1" -ForegroundColor Gray
Write-Host "      CHAT_BACKEND_MODE=auto" -ForegroundColor Gray
Write-Host ""

# Step 2: Check if web-ui is already running
Write-Host "[2/5] Checking web-ui status..." -ForegroundColor Yellow
$alreadyRunning = $false
try {
    $testReq = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:4000" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($testReq.StatusCode -eq 200) {
        $alreadyRunning = $true
        Write-Host "      ✓ Web-UI already running on :4000" -ForegroundColor Green
    }
} catch {
    Write-Host "      Web-UI not detected, will start..." -ForegroundColor Gray
}
Write-Host ""

# Step 3: Start web-ui if needed
if (-not $alreadyRunning) {
    Write-Host "[3/5] Starting web-ui dev server..." -ForegroundColor Yellow
    $processParams = @{
        FilePath = "npm"
        ArgumentList = @("run", "-w", "apps/web-ui", "dev")
        NoNewWindow = $true
        PassThru = $true
    }
    $webUiProcess = Start-Process @processParams
    Write-Host "      Process ID: $($webUiProcess.Id)" -ForegroundColor Gray
    Write-Host "      Waiting 8 seconds for startup..." -ForegroundColor Gray
    Start-Sleep -Seconds 8
} else {
    Write-Host "[3/5] Skipping startup (already running)" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Probe /api/chat/health
Write-Host "[4/5] Probing /api/chat/health..." -ForegroundColor Yellow
$healthOk = $false
$healthUrl = "http://localhost:4000/api/chat/health"
try {
    $healthResponse = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -Method GET -TimeoutSec 5
    $healthJson = $healthResponse.Content | ConvertFrom-Json
    
    if ($healthJson.ok -eq $true) {
        $healthOk = $true
        Write-Host "      ✓ Health check PASS" -ForegroundColor Green
        Write-Host "      Backend: $($healthJson.url)" -ForegroundColor Gray
        Write-Host "      Mock: $($healthJson.mock)" -ForegroundColor Gray
    } else {
        Write-Host "      ✗ Health check returned ok=false" -ForegroundColor Red
    }
} catch {
    Write-Host "      ✗ Health endpoint unreachable: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Step 5: Send minimal chat POST
Write-Host "[5/5] Testing /api/chat endpoint..." -ForegroundColor Yellow
$chatOk = $false
$chatUrl = "http://localhost:4000/api/chat"
$chatBody = @{
    messages = @(
        @{
            role = "user"
            content = "stabilize test"
        }
    )
} | ConvertTo-Json -Depth 6

try {
    $chatResponse = Invoke-WebRequest -UseBasicParsing -Uri $chatUrl -Method POST -ContentType "application/json" -Body $chatBody -TimeoutSec 10
    
    if ($chatResponse.StatusCode -ge 200 -and $chatResponse.StatusCode -lt 300) {
        $chatOk = $true
        Write-Host "      ✓ Chat endpoint PASS (HTTP $($chatResponse.StatusCode))" -ForegroundColor Green
        
        # Try to extract reply content
        try {
            $chatJson = $chatResponse.Content | ConvertFrom-Json
            $reply = $chatJson.choices[0].message.content
            Write-Host "      Reply: $($reply.Substring(0, [Math]::Min(60, $reply.Length)))..." -ForegroundColor Gray
        } catch {
            Write-Host "      Reply: (non-JSON response)" -ForegroundColor Gray
        }
    } else {
        Write-Host "      ✗ Chat endpoint returned HTTP $($chatResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "      ✗ Chat endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
if ($healthOk -and $chatOk) {
    Write-Host "GUARDIAN_SUMMARY: STABILIZE PASS; mock=1" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✓ All checks passed. Chat stack is operational in MOCK mode." -ForegroundColor Green
    Write-Host "  You can now proceed with real backend testing." -ForegroundColor Gray
    exit 0
} else {
    Write-Host "GUARDIAN_SUMMARY: STABILIZE FAIL; mock=1" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✗ Stabilize checks failed. Diagnostics:" -ForegroundColor Red
    Write-Host "  - Health endpoint: $(if ($healthOk) { '✓ PASS' } else { '✗ FAIL' })" -ForegroundColor Gray
    Write-Host "  - Chat endpoint:   $(if ($chatOk) { '✓ PASS' } else { '✗ FAIL' })" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Check web-ui logs for errors" -ForegroundColor Gray
    Write-Host "  2. Run: npm run -w apps/web-ui dev" -ForegroundColor Gray
    Write-Host "  3. Verify CHAT_BACKEND_MOCK=1 is set" -ForegroundColor Gray
    Write-Host "  4. Run E2E smoke: scripts/tools/user.copilot.os1p3.ui-chat-e2e-mock.v2025.10.14.ps1" -ForegroundColor Gray
    exit 81
}
