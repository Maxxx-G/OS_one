<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1ops
X-Purpose: repo-audit
X-Version: v2025.10.11
X-Policy: filename+header compliance required
#>
Param(
    [string]$Report = "docs/reports/user.copilot.repo-audit.v2025.10.10.md"
)
$ErrorActionPreference = 'Stop'
function Line($t) { $script:lines += $t }
$script:lines = @(
    "# OS One - Repo Audit v2025.10.10",
    "",
    "## Summary",
    "- Root items and sizes",
    "- Duplicate filenames across repo",
    "- Directory tree (top levels)"
)

# 1) Root items
$root = Get-ChildItem -Force | Where-Object { $_.Name -notin @('.git', '.githooks', 'node_modules', '.vscode', '.DS_Store') }
$script:lines += "",
"## Root Items",
"| Name | Type | Size |",
"|---|---:|---:|"
foreach ($item in $root) {
    $type = if ($item.PSIsContainer) { 'dir' }else { 'file' }
    $size = if ($item.PSIsContainer) { '' }else { $item.Length }
    $script:lines += "| $($item.Name) | $type | $size |"
}

# 2) Duplicate filenames
$files = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue |
Where-Object { $_.FullName -notmatch "\\node_modules\\|\\.git\\|\\.next\\|\\dist\\|\\build\\|\\logs\\" }
$dupes = $files | Group-Object Name | Where-Object { $_.Count -gt 1 }
$script:lines += "", "## Duplicate Filenames"
if ($dupes.Count -eq 0) { $script:lines += "- None" }
foreach ($d in $dupes) {
    $script:lines += "- $($d.Name):"
    foreach ($f in $d.Group) { $script:lines += "  - $($f.FullName)" }
}

# 3) Top-level trees (depth 2)
$topDirs = Get-ChildItem -Directory -Force | Where-Object { $_.Name -notin @('.git', 'node_modules', '.next') }
$script:lines += "", "## Top-level Directory Trees (depth=2)"
foreach ($d in $topDirs) {
    $script:lines += "", "### $($d.Name)"
    try {
        $tree = Get-ChildItem -Recurse -Depth 2 -Path $d.FullName -ErrorAction SilentlyContinue |
        ForEach-Object { $_.FullName.Substring($d.FullName.Length).TrimStart('\\') }
        foreach ($t in $tree) { $script:lines += "- $t" }
    }
    catch {}
}

New-Item -ItemType Directory -Force -Path (Split-Path $Report) | Out-Null
Set-Content -Path $Report -Value ($script:lines -join "`r`n") -Encoding UTF8
Write-Host "Repo audit report -> $Report"
