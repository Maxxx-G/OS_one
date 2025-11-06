<!--
X-Tier1: user
X-Agent: codex
X-Domain: os1p3
X-Purpose: theta-self-heal-smoke
X-Version: v2025.10.13
X-Policy: single-fence
-->

# Theta Self-Heal Smoke (WebSocket)

- Base endpoint: `ws://localhost:4000/api/mesh/stream`
- Tests:
  - A) ACK + heartbeat (<=12s)
  - B) Rate-limit error when bursting
  - C) Isolation after repeated malformed frames

## Run

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.codex.os1p3.theta-self-heal-smoke-updated.v2025.10.13.ps1
```

- PASS prints `THETA_SMOKE_PASS: ...` and exits 0
- FAIL exits with code `20` and includes reasons

## Windows PowerShell Notes

- **Use Windows PowerShell 5.1+**: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.codex.os1p3.theta-self-heal-smoke-updated.v2025.10.13.ps1`
- **WS Probe**: Run `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.codex.os1p3.ws-probe.v2025.10.13.ps1` to check endpoint availability
  - Exit 0 = WS_PROBE_OPEN (endpoint ready)
  - Exit 11 = WS_PROBE_FAIL (connection failed)
- **Troubleshooting**: If WS probe fails (exit 11):
  1. Check `/api/mesh/stream/health` endpoint
  2. Confirm `runtime: edge` in response
  3. Verify WebSocket upgrade support in server
- **CI Integration**: Guardian CI runs probe first, then full smoke; failures are blocking
- **Exit Codes**:
  - 0 = All tests passed
  - 11 = WS probe failed (endpoint unavailable)
  - 20 = Smoke tests failed (partial or complete failure)

