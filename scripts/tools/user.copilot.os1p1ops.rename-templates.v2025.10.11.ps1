<#
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1ops
X-Purpose: rename-templates
X-Version: v2025.10.11
X-Policy: filename+header compliance required
#>
# OS1 â€” Legacy Template Rename Script
# v2025.10.11
# Renames legacy templates to compound policy format (os1p1docs) and updates references

$ErrorActionPreference = 'Stop'
$folder = "docs\templates"
$items = @(
  @{ old="user.copilot.os1p1docs.proj-template.v2025.09.17.md"; new="user.copilot.os1p1docs.proj-template.v2025.09.17.md" },
  @{ old="user.copilot.os1p1docs.stb-template-copilot.v2025.09.21.md"; new="user.copilot.os1p1docs.stb-template-copilot.v2025.09.21.md" },
  @{ old="user.copilot.os1p1docs.agent-context-catalog.v2025.10.04.md";   new="user.copilot.os1p1docs.agent-context-catalog.v{DATE}.md" },
  @{ old="user.copilot.os1p1docs.agent-context-catalog.v2025.09.25.md";   new="user.copilot.os1p1docs.agent-context-catalog.v{DATE}.md" },
  @{ old="user.copilot.os1p1docs.agent-chatgpt5-context.v2025.09.27.md"; new="user.copilot.os1p1docs.agent-chatgpt5-context.v{DATE}.md" },
  @{ old="user.copilot.os1p1docs.agent-chatgpt5-context.v2025.09.25.md"; new="user.copilot.os1p1docs.agent-chatgpt5-context.v{DATE}.md" },
  @{ old="user.copilot.os1p1docs.agents-role-taxonomy.v2025.10.04.md";    new="user.copilot.os1p1docs.agents-role-taxonomy.v{DATE}.md" }
)

Write-Host "OS1 Legacy Template Rename Script" -ForegroundColor Cyan
Write-Host "Processing $($items.Count) files..." -ForegroundColor Gray

# Collect repo text files for reference rewriting
$textExt = @('md','ps1','json','yaml','yml','ts','tsx','js','css')
Write-Host "Scanning for text files to update references..." -ForegroundColor Gray
$allText = Get-ChildItem -Recurse -File | Where-Object {
  $textExt -contains ($_.Extension.TrimStart('.').ToLower())
}
Write-Host "Found $($allText.Count) text files" -ForegroundColor Gray

$changes = @()
foreach($m in $items){
  $src = Join-Path $folder $m.old
  if(-not (Test-Path $src)) { 
    Write-Host "  Skipping $($m.old) (not found)" -ForegroundColor Yellow
    continue 
  }
  
  $date = (Get-Item $src).LastWriteTime.ToString('yyyy.MM.dd')
  $destName = $m.new -replace '\{DATE\}', $date
  $dest = Join-Path $folder $destName
  
  if((Split-Path $src -Leaf) -ieq (Split-Path $dest -Leaf)){ 
    Write-Host "  Skipping $($m.old) (already renamed)" -ForegroundColor Gray
    continue 
  }

  Write-Host "  Renaming: $($m.old) -> $(Split-Path $dest -Leaf)" -ForegroundColor Green
  
  # git mv
  $gitResult = git mv -- "$src" "$dest" 2>&1
  if($LASTEXITCODE -ne 0){
    Write-Host "    Git mv failed: $gitResult" -ForegroundColor Red
    continue
  }

  # rewrite references (relative path mentions)
  $oldLeaf = Split-Path $src -Leaf
  $newLeaf = Split-Path $dest -Leaf
  $refCount = 0
  
  foreach($f in $allText){
    $raw = Get-Content -Raw -LiteralPath $f.FullName -ErrorAction SilentlyContinue
    if($null -eq $raw){ continue }
    
    if($raw -like "*$oldLeaf*"){
      $updated = $raw -replace [regex]::Escape($oldLeaf), $newLeaf
      Set-Content -NoNewline -LiteralPath $f.FullName -Value $updated -Encoding UTF8
      $refCount++
    }
  }
  
  if($refCount -gt 0){
    Write-Host "    Updated $refCount file references" -ForegroundColor Cyan
  }
  
  $changes += @{Old=$m.old; New=$newLeaf}
}

Write-Host "`nValidating renamed files..." -ForegroundColor Cyan
$validateResult = npm run validate:stb 2>&1
if($LASTEXITCODE -ne 0){
  Write-Host "Validation failed!" -ForegroundColor Red
  Write-Host $validateResult
  exit 1
}

Write-Host "Validation passed!" -ForegroundColor Green

# Generate report
$report = "docs/reports/user.copilot.os1p1docs.rename-report.v2025.10.11.md"
$lines = @(
  "# OS One - Legacy Template Renames",
  "",
  "**Date**: 2025-10-11",
  "**Policy**: Compound project identifier (os1p1docs)",
  "",
  "## Renamed Files",
  "",
  "| Old | New |",
  "|-----|-----|"
)
foreach($c in $changes){ 
  $lines += "| $($c.Old) | $($c.New) |" 
}
$lines += ""
$lines += "## Summary"
$lines += ""
$lines += "- Total files renamed: $($changes.Count)"
$lines += "- All references updated"
$lines += "- Validation: PASSED"

New-Item -ItemType Directory -Force -Path (Split-Path $report) | Out-Null
Set-Content -Path $report -Value ($lines -join "`r`n") -Encoding UTF8

Write-Host "`nRename complete!" -ForegroundColor Green
Write-Host "Report written to: $report" -ForegroundColor Cyan
Write-Host "Files renamed: $($changes.Count)" -ForegroundColor White
