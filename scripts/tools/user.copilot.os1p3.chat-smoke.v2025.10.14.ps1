# X-Tier1: user
# X-Agent: copilot
# X-Domain: os1p3
# X-Purpose: chat-smoke
# X-Version: v2025.10.14
# X-Policy: Single-Fence STB; ≤5 files; deterministic

Param(
    [string]$Api = "http://localhost:4000/api/chat",
    [string]$Prompt = "ping"
)

Write-Host "Chat Smoke Test: $Api" -ForegroundColor Cyan
Write-Host "  Sending test message: '$Prompt'" -ForegroundColor Gray
Write-Host ""

$body = @{
    messages = @(
        @{
            role    = "user"
            content = $Prompt
        }
    )
} | ConvertTo-Json -Depth 5

try {
    $res = Invoke-WebRequest -Method POST -Uri $Api -Body $body -ContentType "application/json" -Headers @{
        "x-sec-local-only" = "1"
    } -UseBasicParsing
    
    $code = $res.StatusCode
    $txt = $res.Content
}
catch {
    Write-Host "  CHAT_SMOKE_FAIL" -ForegroundColor Red
    Write-Error "CHAT_SMOKE_FAIL: request error $($_.Exception.Message)"
    exit 31
}

Write-Host "  HTTP Status: $code" -ForegroundColor Gray

if ($code -ne 200 -and $code -ne 201) {
    Write-Host "  CHAT_SMOKE_FAIL" -ForegroundColor Red
    Write-Error "CHAT_SMOKE_FAIL: HTTP $code (expected 200 or 201)"
    exit 32
}

if ([string]::IsNullOrWhiteSpace($txt)) {
    Write-Host "  CHAT_SMOKE_FAIL" -ForegroundColor Red
    Write-Error "CHAT_SMOKE_FAIL: empty response"
    exit 33
}

Write-Host "  Response length: $($txt.Length) bytes" -ForegroundColor Gray
Write-Host ""
Write-Host "CHAT_SMOKE_PASS" -ForegroundColor Green
exit 0
