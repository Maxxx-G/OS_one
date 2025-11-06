#!/usr/bin/env pwsh
# X-Tier1: user
# X-Agent: copilot
# X-Domain: os1p3
# X-Purpose: pre-commit STB validator
# X-Version: v2025.10.13
# X-Policy: Single-Fence STB enforcement

Param()

Write-Host "Running OS1 STB pre-commit validation..." -ForegroundColor Cyan
Write-Host ""

# Get all staged *.os1p*.md files
$stagedFiles = git diff --cached --name-only --diff-filter=ACM
$stbFiles = $stagedFiles | Where-Object { $_ -match '\.os1p.*\.md$' }

if ($stbFiles.Count -eq 0) {
    Write-Host "No STB files staged for commit." -ForegroundColor Gray
    exit 0
}

Write-Host "Found $($stbFiles.Count) STB file(s) to validate:" -ForegroundColor Yellow
$stbFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
Write-Host ""

$allPassed = $true
$failedFiles = @()

foreach ($file in $stbFiles) {
    if (!(Test-Path $file)) {
        Write-Host "  WARNING: Skipping deleted file: $file" -ForegroundColor Yellow
        continue
    }

    Write-Host "Validating: $file" -ForegroundColor White -NoNewline
    
    # Run validator (suppress output, capture exit code)
    $output = & powershell -NoProfile -ExecutionPolicy Bypass -File ops/check_plan_templates.ps1 -Path $file 2>&1
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host " [PASS]" -ForegroundColor Green
    }
    else {
        Write-Host " [FAIL - exit $exitCode]" -ForegroundColor Red
        Write-Host "  Error: $output" -ForegroundColor Red
        $allPassed = $false
        $failedFiles += $file
    }
}

Write-Host ""

if (-not $allPassed) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "STB VALIDATION FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Failed files:" -ForegroundColor Yellow
    $failedFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Exit codes:" -ForegroundColor Yellow
    Write-Host "  3 = ONE_FENCE_FAIL (multiple fence blocks)" -ForegroundColor Gray
    Write-Host "  4 = SECTION_MISSING (missing required sections)" -ForegroundColor Gray
    Write-Host "  5 = MAX_FILES_FAIL (>5 files referenced)" -ForegroundColor Gray
    Write-Host "  6 = PORT_POLICY_FAIL (contains localhost:3000)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Fix the issues and try again." -ForegroundColor Yellow
    Write-Host "Run manually: powershell -f ops/check_plan_templates.ps1 -Path file.md" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "All staged STBs passed validation" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Warn if docs strict sweep finds issues (do not block commit here; CI will)
if (Test-Path "scripts/tools/user.copilot.os1p3.docs-strict-sweep.v2025.10.13.ps1") {
    $changedDocs = (git diff --cached --name-only) | Where-Object { $_ -match '^docs/.*\.(md|mdx)$' }
    if ($changedDocs) {
        Write-Host "Running docs STRICT sweep on staged documentation..." -ForegroundColor Cyan
        Write-Host ""
        & powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3.docs-strict-sweep.v2025.10.13.ps1
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "WARNING: Docs STRICT violations found!" -ForegroundColor Yellow
            Write-Host "  This is a warning only - commit will proceed." -ForegroundColor Gray
            Write-Host "  However, CI will FAIL until violations are fixed." -ForegroundColor Red
            Write-Host ""
        }
    }
}

# Warn if chat contract check fails (do not block commit; CI will enforce)
if (Test-Path "scripts/tools/user.copilot.os1p3.chat-contract-check.v2025.10.14.ps1") {
    Write-Host "Running chat contract check..." -ForegroundColor Cyan
    try {
        & powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3.chat-contract-check.v2025.10.14.ps1 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "WARNING: Chat contract check failed (exit $LASTEXITCODE)!" -ForegroundColor Yellow
            Write-Host "  This is a warning only - commit will proceed." -ForegroundColor Gray
            Write-Host "  However, CI will FAIL if contract violations persist." -ForegroundColor Red
            Write-Host ""
        }
    }
    catch {
        Write-Host "  (Chat contract check skipped - server may not be running)" -ForegroundColor Gray
    }
}

# Warn if E2E mock test fails when MOCK mode is enabled (do not block commit; CI will enforce)
if ($env:CHAT_BACKEND_MOCK -eq "1" -and (Test-Path "scripts/tools/user.copilot.os1p3.ui-chat-e2e-mock.v2025.10.14.ps1")) {
    Write-Host "Running E2E mock test (CHAT_BACKEND_MOCK=1 detected)..." -ForegroundColor Cyan
    try {
        & powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3.ui-chat-e2e-mock.v2025.10.14.ps1 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "WARNING: E2E mock test failed (exit $LASTEXITCODE)!" -ForegroundColor Yellow
            Write-Host "  This is a warning only - commit will proceed." -ForegroundColor Gray
            Write-Host "  However, CI will FAIL if E2E issues persist." -ForegroundColor Red
            Write-Host ""
        }
    }
    catch {
        Write-Host "  (E2E mock test skipped - server may not be running)" -ForegroundColor Gray
    }
}

exit 0

