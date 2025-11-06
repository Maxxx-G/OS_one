# X-Tier1: user
# X-Agent: copilot
# X-Domain: os1p3
# X-Purpose: chat-contract-check
# X-Version: v2025.10.14
# X-Policy: Single-Fence STB; ≤5 files; deterministic

Param(
    [string]$Api = "http://localhost:4000/api/chat",
    [string]$Prompt = "ping"
)

Write-Host "Chat Contract Check: $Api" -ForegroundColor Cyan
Write-Host "  Test message: '$Prompt'" -ForegroundColor Gray
Write-Host ""

$payload = @{
    messages = @(
        @{
            role    = "user"
            content = $Prompt
        }
    )
} | ConvertTo-Json -Depth 6

Write-Host "  Sending request..." -ForegroundColor Gray

try {
    $res = Invoke-WebRequest -Method POST -Uri $Api -Body $payload -ContentType "application/json" -Headers @{
        "x-sec-local-only" = "1"
    } -UseBasicParsing
}
catch {
    Write-Host "  CHAT_CONTRACT_FAIL: Request error" -ForegroundColor Red
    Write-Error "CHAT_CONTRACT_FAIL: request error: $($_.Exception.Message)"
    exit 41
}

$ct = ($res.Headers["Content-Type"] | Select-Object -First 1) -as [string]
$body = $res.Content

Write-Host "  Status: $($res.StatusCode)" -ForegroundColor Gray
Write-Host "  Content-Type: $ct" -ForegroundColor Gray
Write-Host "  Body length: $($body.Length) bytes" -ForegroundColor Gray
Write-Host ""

# Handle streaming responses (SSE/NDJSON/text streams)
if (($ct -match "event-stream") -or ($ct -match "ndjson") -or ($ct -match "^text/")) {
    if ([string]::IsNullOrWhiteSpace($body)) {
        Write-Host "  CHAT_CONTRACT_FAIL: Empty stream" -ForegroundColor Red
        Write-Error "CHAT_CONTRACT_FAIL: empty stream"
        exit 42
    }
    Write-Host "CHAT_CONTRACT_PASS: stream" -ForegroundColor Green
    Write-Host "  Detected streaming response format" -ForegroundColor Gray
    exit 0
}
else {
    # Handle buffered responses (JSON or text)
    if ([string]::IsNullOrWhiteSpace($body)) {
        Write-Host "  CHAT_CONTRACT_FAIL: Empty body" -ForegroundColor Red
        Write-Error "CHAT_CONTRACT_FAIL: empty body"
        exit 43
    }
    
    try {
        $j = $body | ConvertFrom-Json -Depth 10
        $ok = $false
        
        # Check OpenAI-style format: choices[0].message.content
        if ($j.choices -and $j.choices[0].message.content) {
            $ok = $true
            Write-Host "  Found: choices[0].message.content" -ForegroundColor Gray
        }
        # Check simplified format: message.content
        elseif ($j.message -and $j.message.content) {
            $ok = $true
            Write-Host "  Found: message.content" -ForegroundColor Gray
        }
        # Check minimal format: content
        elseif ($j.content) {
            $ok = $true
            Write-Host "  Found: content" -ForegroundColor Gray
        }
        
        if ($ok) {
            Write-Host "CHAT_CONTRACT_PASS: json" -ForegroundColor Green
            exit 0
        }
        else {
            Write-Host "  CHAT_CONTRACT_FAIL: JSON missing content field" -ForegroundColor Red
            Write-Error "CHAT_CONTRACT_FAIL: json present but no content field"
            exit 44
        }
    }
    catch {
        # Non-JSON text is acceptable fallback (some backends return plain text)
        if ($body.Trim().Length -gt 0) {
            Write-Host "CHAT_CONTRACT_PASS: text" -ForegroundColor Green
            Write-Host "  Detected plain text response" -ForegroundColor Gray
            exit 0
        }
        Write-Host "  CHAT_CONTRACT_FAIL: Unparsable body" -ForegroundColor Red
        Write-Error "CHAT_CONTRACT_FAIL: unparsable body"
        exit 45
    }
}
