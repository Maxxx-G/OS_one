<#
X-Tier1: user
X-Agent: copilot
X-Domain: ops
X-Purpose: stb-precommit-hook
X-Version: v2025.10.10
X-Policy: filename+header compliance required
#>

$ErrorActionPreference = 'Stop'

$extensions = @('md', 'ps1', 'json', 'yaml', 'yml', 'ts', 'tsx')
$extPattern = $extensions -join '|'

$staged = git diff --cached --name-only | Where-Object {
  ($_ -like 'templates/*') -or ($_ -like 'docs/templates/*')
} | Where-Object {
  $ext = [System.IO.Path]::GetExtension($_).TrimStart('.')
  $extensions -contains $ext
}

if (-not $staged) {
  Write-Host "✅ No STB files staged for commit" -ForegroundColor Green
  exit 0
}

Write-Host "🔍 Validating $($staged.Count) staged STB file(s)..." -ForegroundColor Cyan

$fileRegex = '^(user|assistant)\.[a-z0-9\-]+\.[a-z0-9\-]+\.[a-z0-9\-]+\.v\d{4}\.\d{2}\.\d{2}\.(' + $extPattern + ')$'
$needles = @('X-Tier1:', 'X-Agent:', 'X-Domain:', 'X-Purpose:', 'X-Version:')
$docFiles = @('README.md', 'QUICK_REFERENCE.md', 'USAGE.md', 'GUIDE.md', 'INDEX.md')

$violations = @()
$skipped = @()
$validated = 0

foreach ($rel in $staged) {
  $name = Split-Path $rel -Leaf
  
  if ($docFiles -contains $name) {
    $skipped += $name
    continue
  }
  
  if ($rel -like '*/_archive/*') {
    $skipped += $name
    continue
  }
  
  if ($name -notmatch $fileRegex) {
    $violations += "❌ Filename non-compliant: $rel"
    $violations += "   Expected: {tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.{ext}"
    continue
  }
  
  try {
    $content = Get-Content -LiteralPath $rel -TotalCount 40 -ErrorAction Stop
    $head = $content -join "`n"
  }
  catch {
    $violations += "❌ Could not read file: $rel"
    continue
  }
  
  $missingHeaders = @()
  foreach ($needle in $needles) {
    $pattern = '(?m)^\s*[\*/#]*\s*' + [regex]::Escape($needle) + '\s+'
    if ($head -notmatch $pattern) {
      $missingHeaders += $needle
    }
  }
  
  if ($missingHeaders.Count -gt 0) {
    $violations += "❌ Missing headers in $rel"
    foreach ($missing in $missingHeaders) {
      $violations += "   - $missing"
    }
  }
  else {
    $validated++
  }
}

Write-Host ""
Write-Host "────────────────────────────────────────────────────────────" -ForegroundColor Gray

if ($skipped.Count -gt 0) {
  Write-Host "⚠️  Skipped $($skipped.Count) documentation file(s)" -ForegroundColor Yellow
}

if ($violations.Count -gt 0) {
  Write-Host ""
  Write-Host "❌ STB VALIDATION FAILED" -ForegroundColor Red
  Write-Host ""
  Write-Host "Policy violations found:" -ForegroundColor Red
  foreach ($v in $violations) {
    Write-Host "  $v" -ForegroundColor Yellow
  }
  Write-Host ""
  Write-Host "📖 See: templates/user.copilot.docs.stb-filename-header-policy.v2025.10.10.md" -ForegroundColor Cyan
  Write-Host "💡 Run: npm run validate:stb" -ForegroundColor Cyan
  Write-Host ""
  exit 1
}

Write-Host ""
Write-Host "✅ All $validated STB file(s) compliant!" -ForegroundColor Green
Write-Host ""
exit 0
