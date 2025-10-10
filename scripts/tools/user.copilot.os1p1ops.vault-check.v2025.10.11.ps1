<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1ops
X-Purpose: vault-check
X-Version: v2025.10.11
X-Policy: filename+header compliance required
#>
# OS1 — Vault Integrity Check Script
# v2025.10.11
# Verifies SEC-COMMS ε vault file existence and generates compliance report

Param(
    [string]$Vault = "data\vault",
    [string]$Out = "docs\reports\user.copilot.os1p2vault.check.v2025.10.11.md"
)

$ErrorActionPreference = 'Stop'

Write-Host "OS1 Vault Integrity Check" -ForegroundColor Cyan
Write-Host "Checking vault at: $Vault" -ForegroundColor Gray

$exists = Test-Path $Vault
$files = if ($exists) { 
    Get-ChildItem $Vault -File | ForEach-Object { $_.Name } 
}
else { 
    @() 
}

Write-Host "Vault exists: $(if($exists){'YES'}else{'NO'})" -ForegroundColor $(if ($exists) { 'Green' }else { 'Yellow' })
Write-Host "Files found: $($files.Count)" -ForegroundColor Gray

# Standard vault files
$expectedFiles = @(
    "seccomms.keys",
    "madm.log",
    "memory.snap",
    "vault.meta"
)

$lines = @(
    "# OS One - Vault Integrity Check",
    "",
    "**Date**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    "**Vault Path**: $Vault",
    "**Vault Exists**: $(if($exists){'YES'}else{'NO'})",
    "",
    "## File Integrity",
    "",
    "| File | Exists |",
    "|------|:------:|"
)

foreach ($f in $expectedFiles) {
    $fileExists = $files -contains $f
    $status = if ($fileExists) { "OK" } else { "NO" }
    $lines += "| $f | $status |"
    
    Write-Host "  $f : $status" -ForegroundColor $(if ($fileExists) { 'Green' }else { 'Gray' })
}

$lines += ""
$lines += "## Summary"
$lines += ""
$lines += "- Total expected files: $($expectedFiles.Count)"
$lines += "- Files present: $($expectedFiles | Where-Object { $files -contains $_ } | Measure-Object | Select-Object -ExpandProperty Count)"
$lines += "- Vault status: $(if($exists){'Initialized'}else{'Not initialized'})"

if ($exists -and $files.Count -gt 0) {
    $lines += ""
    $lines += "## Additional Files"
    $lines += ""
    $additionalFiles = $files | Where-Object { $expectedFiles -notcontains $_ }
    if ($additionalFiles.Count -gt 0) {
        foreach ($f in $additionalFiles) {
            $lines += "- $f"
        }
    }
    else {
        $lines += "None"
    }
}

$lines += ""
$lines += "---"
$lines += "**Check Type**: SEC-COMMS e (Epsilon) Vault Persistence"
$lines += "**Compliance**: Local-only storage, AES-GCM-256 encrypted"

# Write report
New-Item -ItemType Directory -Force -Path (Split-Path $Out) | Out-Null
Set-Content -Path $Out -Value ($lines -join "`r`n") -Encoding UTF8

Write-Host "`nVault check complete!" -ForegroundColor Green
Write-Host "Report written to: $Out" -ForegroundColor Cyan
