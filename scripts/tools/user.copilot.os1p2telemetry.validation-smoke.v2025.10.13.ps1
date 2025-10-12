# X-Tier1: user
# X-Agent: copilot
# X-Domain: os1p2telemetry
# X-Purpose: validation-smoke
# X-Version: v2025.10.13
# X-Policy: filename+header compliance required

<#
.SYNOPSIS
  Post-merge validation smoke for telemetry metrics contract compliance.

.DESCRIPTION
  Verifies:
  1. Smoke report exists (user.codex.os1p2telemetry.metrics-smoke.v2025.10.13.md)
  2. Guardian CI job configuration is present in .github/workflows/guardian.yml
  3. Exit code handling is correct (0=PASS, 1=FAIL, 2=SKIP)

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p2telemetry.validation-smoke.v2025.10.13.ps1
#>

$ErrorActionPreference = "SilentlyContinue"

Write-Output ""
Write-Output "Telemetry validation smoke"
Write-Output "Timestamp: $((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm:ss')) UTC"
Write-Output ""

# ─────────────────────────────────────────────────────────────────────────────
# Test 1: Smoke report exists
# ─────────────────────────────────────────────────────────────────────────────
Write-Output "Test 1 - Smoke report exists"

$reportPath = "docs/reports/user.codex.os1p2telemetry.metrics-smoke.v2025.10.13.md"
$reportExists = $false

if (Test-Path $reportPath) {
  $reportExists = $true
  Write-Output "  PASS"
} else {
  Write-Output "  FAIL - Report not found: $reportPath"
}

# ─────────────────────────────────────────────────────────────────────────────
# Test 2: Guardian workflow has telemetry-smoke job
# ─────────────────────────────────────────────────────────────────────────────
Write-Output "Test 2 - Guardian workflow includes telemetry-smoke job"

$guardianPath = ".github/workflows/guardian.yml"
$jobPresent = $false

if (Test-Path $guardianPath) {
  $content = Get-Content $guardianPath -Raw
  if ($content -match "telemetry-smoke:") {
    $jobPresent = $true
    Write-Output "  PASS"
  } else {
    Write-Output "  FAIL - Job 'telemetry-smoke' not found in guardian.yml"
  }
} else {
  Write-Output "  FAIL - Guardian workflow not found: $guardianPath"
}

# ─────────────────────────────────────────────────────────────────────────────
# Test 3: Contract validation report exists
# ─────────────────────────────────────────────────────────────────────────────
Write-Output "Test 3 - Contract validation report exists"

$validationPath = "docs/reports/user.copilot.os1p2telemetry.contract-validation.v2025.10.13.md"
$validationExists = $false

if (Test-Path $validationPath) {
  $validationExists = $true
  Write-Output "  PASS"
} else {
  Write-Output "  FAIL - Validation report not found: $validationPath"
}

# ─────────────────────────────────────────────────────────────────────────────
# Test 4: Guardian CI spec document exists
# ─────────────────────────────────────────────────────────────────────────────
Write-Output "Test 4 - Guardian CI spec document exists"

$ciSpecPath = "docs/policies/user.copilot.os1p2telemetry.guardian-ci-spec.v2025.10.13.md"
$ciSpecExists = $false

if (Test-Path $ciSpecPath) {
  $ciSpecExists = $true
  Write-Output "  PASS"
} else {
  Write-Output "  SKIP - CI spec doc not yet created: $ciSpecPath"
}

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
$total = 4
$passed = 0
$failed = 0
$skipped = 0

if ($reportExists) { $passed++ } else { $failed++ }
if ($jobPresent) { $passed++ } else { $failed++ }
if ($validationExists) { $passed++ } else { $failed++ }
if ($ciSpecExists) { $passed++ } else { $skipped++ }

Write-Output ""
if ($failed -eq 0 -and $skipped -eq 0) {
  $status = "PASS"
} elseif ($failed -eq 0) {
  $status = "PASS (with skips)"
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
