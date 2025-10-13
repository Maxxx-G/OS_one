#!/usr/bin/env powershell
# X-Tier1: user
# X-Agent: copilot
# X-Domain: os1p3
# X-Purpose: ui-chat-e2e-mock
# X-Version: v2025.10.14
# X-Policy: Single-Fence STB; exit 0/61/62/63

<#
.SYNOPSIS
  UI Chat E2E smoke test in MOCK mode.

.DESCRIPTION
  POSTs to /api/chat and asserts:
  - HTTP 200/201
  - Non-empty response body
  - Mock mode should return deterministic canned replies

.PARAMETER Api
  Chat endpoint URL (default: http://localhost:4000/api/chat)

.PARAMETER Prompt
  User message to send (default: "ping (mock)")

.NOTES
  Exit Codes:
    0  = UI_E2E_PASS
    61 = UI_E2E_FAIL (request error)
    62 = UI_E2E_FAIL (HTTP error)
    63 = UI_E2E_FAIL (empty response)

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File ui_chat_e2e_mock.ps1
  powershell -NoProfile -ExecutionPolicy Bypass -File ui_chat_e2e_mock.ps1 -Api "http://localhost:3000/api/chat"
#>

Param(
  [string]$Api = "http://localhost:4000/api/chat",
  [string]$Prompt = "ping (mock)"
)

$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "UI Chat E2E (MOCK Mode)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Endpoint: $Api" -ForegroundColor Gray
Write-Host "Prompt:   $Prompt" -ForegroundColor Gray
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

Write-Host "Sending POST request..." -ForegroundColor Yellow

# Make request
try {
  $res = Invoke-WebRequest `
    -Method POST `
    -Uri $Api `
    -Body $body `
    -ContentType "application/json" `
    -Headers @{ "x-sec-local-only" = "1" } `
    -UseBasicParsing

  $code = $res.StatusCode
  $txt = $res.Content
}
catch {
  Write-Host ""
  Write-Host "✗ UI_E2E_FAIL: Request error" -ForegroundColor Red
  Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
  Write-Host ""
  exit 61
}

# Check HTTP status
if ($code -lt 200 -or $code -ge 300) {
  Write-Host ""
  Write-Host "✗ UI_E2E_FAIL: HTTP $code" -ForegroundColor Red
  Write-Host ""
  exit 62
}

Write-Host "✓ HTTP $code" -ForegroundColor Green

# Check response content
if ([string]::IsNullOrWhiteSpace($txt)) {
  Write-Host ""
  Write-Host "✗ UI_E2E_FAIL: Empty response" -ForegroundColor Red
  Write-Host ""
  exit 63
}

Write-Host "✓ Response: $($txt.Length) bytes" -ForegroundColor Green
Write-Host ""
Write-Host "───────────────────────────────────────" -ForegroundColor Gray
Write-Host "Response Preview:" -ForegroundColor White
Write-Host $txt.Substring(0, [Math]::Min(200, $txt.Length)) -ForegroundColor Gray
if ($txt.Length -gt 200) {
  Write-Host "... (truncated)" -ForegroundColor DarkGray
}
Write-Host "───────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "✓ UI_E2E_PASS" -ForegroundColor Green -NoNewline
Write-Host " (mock mode)" -ForegroundColor Cyan
Write-Host ""

exit 0
