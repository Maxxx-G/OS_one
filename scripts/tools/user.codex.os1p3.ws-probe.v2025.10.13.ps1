# X-Tier1: user
# X-Agent: codex
# X-Domain: os1p3
# X-Purpose: ws-probe
# X-Version: v2025.10.13
# X-Policy: Single-Fence STB; ≤5 files; deterministic

Param(
    [string]$Base = "ws://localhost:4000/api/mesh/stream"
)

Add-Type -AssemblyName System.Net.WebSockets

Write-Host "WS Probe: $Base" -ForegroundColor Cyan

try {
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    
    # Optional SEC-COMMS header for local dev
    try {
        $ws.Options.SetRequestHeader("x-sec-local-only", "1")
    }
    catch { }
    
    Write-Host "  Connecting..." -ForegroundColor Gray
    $ws.ConnectAsync([Uri]$Base, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    
    if ($ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        Write-Host "  WS_PROBE_OPEN" -ForegroundColor Green
    }
    
    Write-Host "  Closing..." -ForegroundColor Gray
    $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "bye", [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    $ws.Dispose()
    
    Write-Host "  WS Probe successful" -ForegroundColor Green
    exit 0
}
catch {
    Write-Host "  WS_PROBE_FAIL" -ForegroundColor Red
    Write-Error "WS_PROBE_FAIL: $($_.Exception.Message)"
    exit 11
}
