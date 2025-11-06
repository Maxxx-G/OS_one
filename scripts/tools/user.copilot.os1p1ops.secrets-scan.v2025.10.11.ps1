<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1ops
X-Purpose: secrets-scan
X-Version: v2025.10.11
X-Policy: filename+header compliance required
#>
Param(
  [string]$Report = "docs/reports/user.copilot.secrets-scan.v2025.10.10.md"
)
$ErrorActionPreference='Stop'
function Line($t){ $script:lines += $t }
$script:lines = @(
  "# OS One - Secrets Scan v2025.10.10",
  "",
  "This is a lightweight regex-based sweep. Consider gitleaks or trufflehog for deeper scans.",
  "",
  "## Findings"
)

# Patterns (conservative)
$patterns = @(
  '(?i)api[_-]?key\s*[:=]\s*[\w-]{16,}',
  '(?i)secret\s*[:=]\s*[\w/+=]{16,}',
  '(?i)token\s*[:=]\s*[\w\.-]{16,}',
  'AKIA[0-9A-Z]{16}',               # AWS Access Key ID
  'ASIA[0-9A-Z]{16}',               # AWS Temp Key ID
  'AIza[0-9A-Za-z\-_]{35}',        # Google API key
  'ghp_[0-9A-Za-z]{36,40}',         # GitHub token
  'sk-[0-9A-Za-z]{32,}'             # OpenAI-style keys
)

# Scan
$files = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "\\node_modules\\|\\.git\\|\\.next\\|\\dist\\|\\build\\|\\logs\\|\\.githooks\\" }
$found = $false
foreach($file in $files){
  try {
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    foreach($pat in $patterns){
      $m = [regex]::Matches($content, $pat)
      if($m.Count -gt 0){
        if(-not $found){ $found=$true }
        $script:lines += "### $($file.FullName)"
        $script:lines += "- Pattern: $pat"
        $script:lines += "- Count: $($m.Count)"
      }
    }
  } catch {}
}

if(-not $found){ $script:lines += "- No findings" }

New-Item -ItemType Directory -Force -Path (Split-Path $Report) | Out-Null
Set-Content -Path $Report -Value ($script:lines -join "`r`n") -Encoding UTF8
Write-Host "Secrets scan report -> $Report"
