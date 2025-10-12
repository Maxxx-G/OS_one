# X-Tier1: user
# X-Agent: copilot
# X-Domain: os1p3ops
# X-Purpose: theta-validation-smoke
# X-Version: v2025.10.13
# X-Policy: filename+header compliance required

<#
.SYNOPSIS
  θ Smoke Validation — Copilot · v2025.10.13

.DESCRIPTION
  Minimal guard to confirm /api/mesh/stream exists and enforces WebSocket upgrade.
  
  Tests:
  1. Non-WebSocket GET request → Expect 426 Upgrade Required
  
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3ops.theta-validation-smoke.v2025.10.13.ps1
#>

$ErrorActionPreference = "SilentlyContinue"

Write-Output ""
Write-Output "θ-layer validation smoke"
Write-Output "Timestamp: $((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm:ss')) UTC"
Write-Output ""

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────
$base = $env:NEXT_PUBLIC_BASE_URL
if (-not $base) {
  $base = "http://localhost:4000"
}

$endpoint = "$base/api/mesh/stream"

Write-Output "Endpoint: $endpoint"
Write-Output ""

# ─────────────────────────────────────────────────────────────────────────────
# Test 1: Non-WebSocket GET must return 426 Upgrade Required
# ─────────────────────────────────────────────────────────────────────────────
Write-Output "Test 1 - Non-WebSocket GET returns 426"

$statusCode = 0
$Error.Clear()

$response = Invoke-WebRequest -Uri $endpoint -Method GET -UseBasicParsing

if ($Error.Count -gt 0) {
  $errorMsg = $Error[0].Exception.Message
  if ($errorMsg -match "426") {
    $statusCode = 426
  } elseif ($errorMsg -match "(\d{3})") {
    $statusCode = [int]$matches[1]
  } else {
    Write-Output "  SKIP - Server not reachable or endpoint not yet implemented"
    exit 2
  }
} else {
  $statusCode = $response.StatusCode
}

if ($statusCode -eq 426) {
  Write-Output "  PASS - Got 426 Upgrade Required"
  $test1Pass = $true
} else {
  Write-Output "  FAIL - Expected 426, got $statusCode"
  $test1Pass = $false
}

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
$total = 1
$passed = if ($test1Pass) { 1 } else { 0 }
$failed = if ($test1Pass) { 0 } else { 1 }
$skipped = 0

Write-Output ""
if ($failed -eq 0) {
  $status = "PASS"
} else {
  $status = "FAIL"
}

Write-Output "Summary: total=$total, passed=$passed, failed=$failed, skipped=$skipped, status=$status"

# ─────────────────────────────────────────────────────────────────────────────
# Exit codes: 0=PASS, 1=FAIL, 2=SKIP
# ─────────────────────────────────────────────────────────────────────────────
if ($failed -gt 0) {
  exit 1
} elseif ($skipped -gt 0) {
  exit 2
} else {
  exit 0
}
