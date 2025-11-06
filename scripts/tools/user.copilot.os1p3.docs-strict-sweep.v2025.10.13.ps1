# X-Tier1: user
# X-Agent: copilot
# X-Domain: os1p3
# X-Purpose: docs-strict-sweep
# X-Version: v2025.10.13
# X-Policy: Scan docs for forbidden ports and multi-fence violations

Param(
    [string]$DocsRoot = "docs",
    [string[]]$ForbiddenPorts = @("localhost:3000")
)

if (!(Test-Path $DocsRoot)) {
    Write-Host "No 'docs' folder found; OK" -ForegroundColor Gray
    exit 0
}

Write-Host "Running DOCS STRICT sweep on '$DocsRoot'..." -ForegroundColor Cyan
Write-Host ""

$files = Get-ChildItem -Recurse -File -Path $DocsRoot -Include *.md, *.mdx
$badPorts = @()
$badFences = @()

foreach ($f in $files) {
    $raw = Get-Content -Raw -Path $f.FullName
    
    # Check for forbidden ports
    foreach ($p in $ForbiddenPorts) {
        if ($raw -match [regex]::Escape($p)) {
            $badPorts += $f.FullName
            break
        }
    }
    
    # Check for multi-fence violations (more than 2 backtick markers = more than 1 fence pair)
    $fenceCount = ([regex]::Matches($raw, '```')).Count
    if ($fenceCount -gt 2) {
        $badFences += "$($f.FullName) (fences=$fenceCount)"
    }
}

Write-Host "Scanned $($files.Count) file(s)" -ForegroundColor Gray
Write-Host ""

if ($badPorts.Count -eq 0 -and $badFences.Count -eq 0) {
    Write-Host "DOCS_STRICT_PASS" -ForegroundColor Green
    Write-Host "  No forbidden ports found" -ForegroundColor Gray
    Write-Host "  No multi-fence violations found" -ForegroundColor Gray
    exit 0
}

# Report violations
if ($badPorts.Count -gt 0) {
    Write-Host "DOCS_PORT_VIOLATIONS ($($badPorts.Count) file(s)):" -ForegroundColor Red
    $badPorts | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host ""
}

if ($badFences.Count -gt 0) {
    Write-Host "DOCS_FENCE_VIOLATIONS ($($badFences.Count) file(s)):" -ForegroundColor Red
    $badFences | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host ""
}

Write-Host "Fix violations before committing. CI will enforce STRICT mode." -ForegroundColor Yellow
exit 10
