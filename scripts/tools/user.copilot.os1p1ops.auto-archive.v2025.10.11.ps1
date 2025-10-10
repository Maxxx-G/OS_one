<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1ops
X-Purpose: auto-archive
X-Version: v2025.10.11
X-Policy: filename+header compliance required
#>
# Auto-Archive Non-Compliant Files
# X-Tier1: user
# X-Agent: copilot
# X-Domain: os1p1ops
# X-Purpose: zero-tolerance-compliance-fixer
# X-Version: v2025.10.12
# X-Policy: moves non-compliant files to _archive/ subdirectory

Param(
    [string]$Base = "docs/project_plans",
    [string]$OutDir = "_archive"
)

$ErrorActionPreference = 'Stop'

# Project plan naming pattern
$rx = '^(user|assistant)\.[a-z0-9\-]+\.os1p\d+[a-z0-9\-]*\.project-plan\.v\d{4}\.\d{2}\.\d{2}\.md$'

# Create archive directory if needed
$archivePath = Join-Path $Base $OutDir
New-Item -ItemType Directory -Force -Path $archivePath | Out-Null

Write-Host "🔍 Scanning $Base for non-compliant files..."

# Find and move non-compliant files
Get-ChildItem $Base -File | Where-Object { 
    $_.Name -notmatch $rx -and $_.Name -ne "README.md"
} | ForEach-Object {
    $targetPath = Join-Path $archivePath ($_.Name + ".archived")
    Write-Host "📦 Archiving: $($_.Name)"
    git mv -- $_.FullName $targetPath
}

Write-Host "✅ Auto-archive complete."
