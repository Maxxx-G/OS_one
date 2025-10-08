# Voice Streaming Stack Verification Script
# Audits recent git changes and verifies TTS stream headers

Param(
    [int]$Commits = 1,
    [string]$TtsUrl = "http://localhost:4000/api/tts/stream",
    [string]$ProbeText = "OS One voice probe"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Voice Streaming Stack Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Git Audit - Show recent changes
Write-Host "== Git Audit (last $Commits commit(s)) ==" -ForegroundColor Cyan
Write-Host "Files changed in recent commits:`n" -ForegroundColor Yellow

try {
    git --no-pager show --name-status HEAD~$Commits..HEAD
} catch {
    Write-Host "Git audit failed: $_" -ForegroundColor Red
}

# 2. TTS Stream Header Check
Write-Host "`n`n== TTS Stream Header Check ==" -ForegroundColor Cyan
Write-Host "Target URL: $TtsUrl" -ForegroundColor Yellow
Write-Host "Probe Text: '$ProbeText'`n" -ForegroundColor Yellow

try {
    $body = @{ text = $ProbeText } | ConvertTo-Json
    
    # Use Invoke-WebRequest for better header inspection
    $response = Invoke-WebRequest -Uri $TtsUrl `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $body `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "`nResponse Headers:" -ForegroundColor Green
    
    $response.Headers.GetEnumerator() | Where-Object { 
        $_.Key -match 'Content-Type|Transfer-Encoding|Connection|Content-Length' 
    } | ForEach-Object {
        Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor White
    }
    
} catch {
    Write-Host "TTS stream probe failed: $_" -ForegroundColor Red
    Write-Host "This may be expected if the dev server is not running." -ForegroundColor Yellow
}

# 3. Expected Headers
Write-Host "`n`n== Expected Headers for Streaming ==" -ForegroundColor Yellow
Write-Host "  Content-Type: audio/mpeg (or audio/wav, audio/ogg)" -ForegroundColor Yellow
Write-Host "  Transfer-Encoding: chunked" -ForegroundColor Yellow
Write-Host "  Connection: keep-alive" -ForegroundColor Yellow

# 4. Quick Health Checks
Write-Host "`n`n== Voice File Audit ==" -ForegroundColor Cyan

$voiceFiles = @(
    "apps\web-ui\components\ChatSequencer.tsx",
    "apps\web-ui\app\api\tts\route.ts",
    "apps\web-ui\lib\net\retry.ts",
    "apps\web-ui\src\components\VoiceLoop.tsx"
)

foreach ($file in $voiceFiles) {
    $fullPath = Join-Path $PSScriptRoot "..\$file"
    if (Test-Path $fullPath) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (not found)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Verification Complete" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
