#!/usr/bin/env powershell
# X-Tier1: user
# X-Agent: copilot
# X-Domain: os1p3
# X-Purpose: ui-chat-canary
# X-Version: v2025.10.14
# X-Policy: Single-Fence STB; exit 0/71/72

<#
.SYNOPSIS
  UI Chat canary - hourly health check with latency measurement.

.DESCRIPTION
  POSTs to /api/chat in MOCK mode and emits GUARDIAN_SUMMARY line:
  - Measures request latency
  - Validates HTTP 2xx + non-empty response
  - Emits compact summary for dashboard consumption

.PARAMETER Api
  Chat endpoint URL (default: http://localhost:4000/api/chat)

.PARAMETER Prompt
  User message to send (default: "canary")

.NOTES
  Exit Codes:
    0  = UI_CHAT_CANARY_PASS
    71 = UI_CHAT_CANARY_FAIL (HTTP error or empty response)
    72 = UI_CHAT_CANARY_ERROR (request/network error)

  Guardian Summary Format:
    GUARDIAN_SUMMARY: UI_CHAT_CANARY {PASS|FAIL|ERROR}; latency_ms=N; mock=1

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File ui_chat_canary.ps1
  # Output: GUARDIAN_SUMMARY: UI_CHAT_CANARY PASS; latency_ms=123; mock=1
#>

Param(
  [string]$Api = "http://localhost:4000/api/chat",
  [string]$Prompt = "canary"
)

$ErrorActionPreference = "Stop"

# Ensure MOCK mode is enabled
$env:CHAT_BACKEND_MOCK = "1"

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "UI Chat Canary (MOCK Mode)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Endpoint: $Api" -ForegroundColor Gray
Write-Host "Mock:     Enabled (CHAT_BACKEND_MOCK=1)" -ForegroundColor Gray
Write-Host ""

# Build request body
$body = @{
  messages = @(
    @{
      role    = "user"
      content = $Prompt
    }
  )
} | ConvertTo-Json -Depth 6

# Measure latency
$t0 = Get-Date

try {
  Write-Host "Sending canary request..." -ForegroundColor Yellow
  
  $res = Invoke-WebRequest `
    -Method POST `
    -Uri $Api `
    -Body $body `
    -ContentType "application/json" `
    -Headers @{ "x-sec-local-only" = "1" } `
    -UseBasicParsing

  $ms = [int]((Get-Date) - $t0).TotalMilliseconds
  $code = $res.StatusCode
  $content = $res.Content

  Write-Host ""
  Write-Host "Response received in ${ms}ms" -ForegroundColor Green
  Write-Host "HTTP Status: $code" -ForegroundColor Gray

  # Validate response
  $ok = ($code -ge 200 -and $code -lt 300) -and (-not [string]::IsNullOrWhiteSpace($content))

  if ($ok) {
    Write-Host ""
    Write-Host "✓ Canary PASS" -ForegroundColor Green
    Write-Host "  - HTTP: $code" -ForegroundColor Gray
    Write-Host "  - Latency: ${ms}ms" -ForegroundColor Gray
    Write-Host "  - Response: $($content.Length) bytes" -ForegroundColor Gray
    Write-Host ""
    Write-Host "GUARDIAN_SUMMARY: UI_CHAT_CANARY PASS; latency_ms=$ms; mock=1" -ForegroundColor Cyan
    Write-Host ""
    exit 0
  }
  else {
    Write-Host ""
    Write-Host "✗ Canary FAIL" -ForegroundColor Red
    Write-Host "  - HTTP: $code" -ForegroundColor Red
    Write-Host "  - Latency: ${ms}ms" -ForegroundColor Gray
    Write-Host "  - Content empty: $(if([string]::IsNullOrWhiteSpace($content)){'YES'}else{'NO'})" -ForegroundColor Red
    Write-Host ""
    Write-Error "GUARDIAN_SUMMARY: UI_CHAT_CANARY FAIL; http=$code; latency_ms=$ms; mock=1"
    exit 71
  }
}
catch {
  $ms = [int]((Get-Date) - $t0).TotalMilliseconds
  
  Write-Host ""
  Write-Host "✗ Canary ERROR" -ForegroundColor Red
  Write-Host "  - Error: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "  - Latency: ${ms}ms" -ForegroundColor Gray
  Write-Host ""
  Write-Error "GUARDIAN_SUMMARY: UI_CHAT_CANARY ERROR; err=$($_.Exception.Message); latency_ms=$ms; mock=1"
  exit 72
}
