# X-Tier1: user
# X-Agent: codex
# X-Domain: os1p3
# X-Purpose: theta-self-heal-smoke
# X-Version: v2025.10.13
# X-Policy: Single-Fence STB; ≤5 files; deterministic

Param(
    [string]$Base = "ws://localhost:4000/api/mesh/stream",
    [int]$Burst = 80,
    [int]$ConnectRetries = 3
)

Add-Type -AssemblyName System.Net.Http
Add-Type -AssemblyName System.Net.WebSockets

function Iso {
    (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

function Json($o) {
    $o | ConvertTo-Json -Depth 6 -Compress
}

function New-WS($uri) {
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    # Optional SEC-COMMS header for local dev
    try { $ws.Options.SetRequestHeader("x-sec-local-only", "1") } catch { }
    
    for ($i = 1; $i -le $ConnectRetries; $i++) {
        try {
            $ws.ConnectAsync([Uri]$uri, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
            return $ws
        }
        catch {
            if ($i -eq $ConnectRetries) { throw $_ }
            Start-Sleep -Milliseconds (200 * $i)
        }
    }
}

function Send-Text($ws, $text) {
    if ($null -eq $ws -or $ws.State -ne [System.Net.WebSockets.WebSocketState]::Open) {
        return $false
    }
    $bytes = [Text.Encoding]::UTF8.GetBytes($text)
    $seg = [ArraySegment[byte]]::new($bytes, 0, $bytes.Length)
    $ws.SendAsync($seg, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    return $true
}

function Recv-Text($ws, [int]$ms = 2000) {
    if ($null -eq $ws -or $ws.State -ne [System.Net.WebSockets.WebSocketState]::Open) {
        return $null
    }
    $buf = New-Object Byte[] 65536
    $seg = [ArraySegment[byte]]::new($buf, 0, $buf.Length)
    $cts = New-Object Threading.CancellationTokenSource($ms)
    try {
        $res = $ws.ReceiveAsync($seg, $cts.Token).GetAwaiter().GetResult()
    }
    catch {
        return $null
    }
    if ($res.MessageType -ne [System.Net.WebSockets.WebSocketMessageType]::Text) {
        return $null
    }
    return [Text.Encoding]::UTF8.GetString($buf, 0, $res.Count)
}

function Close-WS($ws) {
    if ($null -eq $ws) { return }
    try {
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "bye", [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    }
    catch { }
    try { $ws.Dispose() } catch { }
}

$pass = @()
$fail = @()

Write-Host "Running θ-layer self-heal smoke tests..." -ForegroundColor Cyan
Write-Host ""

# TEST A: ACK + heartbeat
Write-Host "TEST A: ACK + Heartbeat" -ForegroundColor Yellow
$sidA = "smokeA-" + ([Guid]::NewGuid().ToString("N").Substring(0, 12))
$wsA = $null
try {
    $wsA = New-WS $Base
    Write-Host "  Connected to $Base" -ForegroundColor Gray
}
catch {
    $fail += "A: connect failed"
    Write-Host "  FAIL: Connection failed - $($_.Exception.Message)" -ForegroundColor Red
}

if ($wsA) {
    Send-Text $wsA (Json @{ ts = Iso; kind = "control"; source = "ui"; session_id = $sidA; payload = @{ ping = 1 } }) | Out-Null
    $msgA = Recv-Text $wsA 4000
    if ($msgA -and $msgA -match '"kind":"ack"') {
        $pass += "A: ACK"
        Write-Host "  PASS: Received ACK" -ForegroundColor Green
    }
    else {
        $fail += "A: expected ACK"
        Write-Host "  FAIL: Expected ACK response" -ForegroundColor Red
    }
    
    # heartbeat ≤12s
    $hb = $null
    $t0 = Get-Date
    while (((Get-Date) - $t0).TotalSeconds -lt 12 -and -not $hb) {
        $tmp = Recv-Text $wsA 2000
        if ($tmp -and $tmp -match '"kind":"heartbeat"') {
            $hb = $tmp
        }
    }
    if ($hb) {
        $pass += "A: heartbeat"
        Write-Host "  PASS: Received heartbeat within 12s" -ForegroundColor Green
    }
    else {
        $fail += "A: expected heartbeat ≤12s"
        Write-Host "  FAIL: Expected heartbeat within 12s" -ForegroundColor Red
    }
}
Close-WS $wsA

Write-Host ""

# TEST B: rate-limit
Write-Host "TEST B: Rate Limiting" -ForegroundColor Yellow
$sidB = "smokeB-" + ([Guid]::NewGuid().ToString("N").Substring(0, 12))
$wsB = $null
try {
    $wsB = New-WS $Base
    Write-Host "  Connected for burst test" -ForegroundColor Gray
}
catch {
    $fail += "B: connect failed"
    Write-Host "  FAIL: Connection failed" -ForegroundColor Red
}

if ($wsB) {
    Write-Host "  Sending $Burst messages..." -ForegroundColor Gray
    for ($i = 0; $i -lt $Burst; $i++) {
        Send-Text $wsB (Json @{ ts = Iso; kind = "control"; source = "ui"; session_id = $sidB; payload = @{ n = $i } }) | Out-Null
    }
    $seen = $false
    for ($i = 0; $i -lt 12; $i++) {
        $m = Recv-Text $wsB 1000
        if ($m -and $m -match '"code":"rate_limited"') {
            $seen = $true
            break
        }
    }
    if ($seen) {
        $pass += "B: rate_limited"
        Write-Host "  PASS: Rate limiting triggered" -ForegroundColor Green
    }
    else {
        $fail += "B: expected rate_limited error"
        Write-Host "  FAIL: Expected rate limiting" -ForegroundColor Red
    }
}
Close-WS $wsB

Write-Host ""

# TEST C: isolation after faults
Write-Host "TEST C: Fault Isolation" -ForegroundColor Yellow
$sidC = "smokeC-" + ([Guid]::NewGuid().ToString("N").Substring(0, 12))
$wsC = $null
try {
    $wsC = New-WS $Base
    Write-Host "  Connected for fault test" -ForegroundColor Gray
}
catch {
    $fail += "C: connect failed"
    Write-Host "  FAIL: Connection failed" -ForegroundColor Red
}

if ($wsC) {
    Write-Host "  Sending malformed messages..." -ForegroundColor Gray
    for ($i = 0; $i -lt 6; $i++) {
        Send-Text $wsC "{ not-json: true }" | Out-Null
    }
    $iso = $false
    for ($i = 0; $i -lt 10; $i++) {
        $m = Recv-Text $wsC 1200
        if ($m -and ($m -match '"isolated"' -or $m -match '"code":"isolated"')) {
            $iso = $true
            break
        }
    }
    if ($iso) {
        $pass += "C: isolated"
        Write-Host "  PASS: Isolation triggered after faults" -ForegroundColor Green
    }
    else {
        $fail += "C: expected isolation after faults"
        Write-Host "  FAIL: Expected isolation after faults" -ForegroundColor Red
    }
}
Close-WS $wsC

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($fail.Count -eq 0) {
    Write-Host "THETA_SMOKE_PASS: " -NoNewline -ForegroundColor Green
    Write-Host ($pass -join ", ") -ForegroundColor Gray
    Write-Host "========================================" -ForegroundColor Cyan
    exit 0
}
else {
    Write-Host "THETA_SMOKE_FAIL" -ForegroundColor Red
    Write-Host "  Failures: " -NoNewline -ForegroundColor Red
    Write-Host ($fail -join "; ") -ForegroundColor Yellow
    Write-Host "  Passes: " -NoNewline -ForegroundColor Gray
    Write-Host ($pass -join ", ") -ForegroundColor Gray
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Error ("THETA_SMOKE_FAIL: " + ($fail -join "; ") + " | passes: " + ($pass -join ", "))
    exit 20
}
