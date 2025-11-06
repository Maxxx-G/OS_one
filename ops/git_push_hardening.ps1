#Requires -Version 5.1
<#
.SYNOPSIS
    Robust git push with HTTP/2 workaround and retry logic
.DESCRIPTION
    Sets safe git HTTP options to avoid connection issues, then attempts
    push with exponential backoff retries. Prints diagnostics on failure.
.PARAMETER Branch
    Target branch (default: main)
.PARAMETER Retries
    Number of retry attempts (default: 3)
.EXAMPLE
    .\git_push_hardening.ps1
    .\git_push_hardening.ps1 -Branch develop -Retries 5
#>

Param(
    [string]$Branch = "main",
    [int]$Retries = 3
)

Write-Host "`n== Git Push Hardening ==" -ForegroundColor Cyan
Write-Host "Branch: $Branch | Retries: $Retries`n" -ForegroundColor Gray

# Configure git HTTP settings to avoid flakes
Write-Host "Configuring git HTTP settings..." -ForegroundColor Yellow
git config http.version HTTP/1.1 | Out-Null          # Avoid HTTP/2 issues
git config http.postBuffer 524288000 | Out-Null      # 500MB buffer
git config http.lowSpeedLimit 0 | Out-Null           # Disable speed limits
git config http.lowSpeedTime 0 | Out-Null

# Retry loop with exponential backoff
for ($i = 1; $i -le $Retries; $i++) {
    Write-Host "Attempt $i/$Retries : git push origin $Branch" -ForegroundColor Yellow
    
    $pushResult = git push origin $Branch 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n[OK] Push succeeded!" -ForegroundColor Green
        exit 0
    }
    
    # Push failed
    Write-Warning "Push failed with exit code: $LASTEXITCODE"
    Write-Host "Output: $pushResult" -ForegroundColor Red
    
    if ($i -lt $Retries) {
        $backoff = [int][Math]::Pow(2, $i)
        Write-Host "Retrying in $backoff seconds...`n" -ForegroundColor Cyan
        Start-Sleep -Seconds $backoff
    }
}

# All retries exhausted - print diagnostics
Write-Host "`n== Diagnostics ==" -ForegroundColor Magenta
Write-Host "`nRemote URLs:" -ForegroundColor Yellow
git remote -v

Write-Host "`nHTTP Config:" -ForegroundColor Yellow
git config --list | Select-String "http\.(version|postBuffer|lowSpeed)"

Write-Host "`nBranch Status:" -ForegroundColor Yellow
git status --short --branch

Write-Host "`n[ERROR] Final push attempt failed after $Retries retries." -ForegroundColor Red
exit 1
