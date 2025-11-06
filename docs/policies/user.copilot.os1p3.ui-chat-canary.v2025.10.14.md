# UI Chat Canary (Hourly)
X-Tier1: user  
X-Agent: copilot  
X-Domain: os1p3  
X-Purpose: ui-chat-canary  
X-Version: v2025.10.14  
X-Policy: Single-Fence STB; ≤5 files; deterministic

## Overview
Hourly scheduled health check for `/api/chat` running in **MOCK mode** on the main branch. Emits Guardian summary metrics for dashboard consumption and early drift detection.

## Purpose
- **Early Detection**: Catch regressions before they impact users
- **Continuous Monitoring**: Hourly checks ensure service availability
- **Deterministic**: MOCK mode eliminates external dependencies
- **Dashboard Metrics**: Guardian summary line provides latency/status data

## Guardian Summary Format

The canary emits a standardized summary line:

### Success:
```
GUARDIAN_SUMMARY: UI_CHAT_CANARY PASS; latency_ms=123; mock=1
```

### Failure:
```
GUARDIAN_SUMMARY: UI_CHAT_CANARY FAIL; http=500; latency_ms=234; mock=1
```

### Error:
```
GUARDIAN_SUMMARY: UI_CHAT_CANARY ERROR; err=connection refused; latency_ms=0; mock=1
```

## Exit Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 0 | PASS | HTTP 2xx, non-empty response |
| 71 | FAIL | HTTP error or empty response body |
| 72 | ERROR | Network/request error, connection refused |

## Local Usage

### Basic canary check:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3.ui-chat-canary.v2025.10.14.ps1
```

### Custom endpoint:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3.ui-chat-canary.v2025.10.14.ps1 -Api "http://localhost:3000/api/chat"
```

### Custom prompt:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3.ui-chat-canary.v2025.10.14.ps1 -Prompt "health check"
```

## CI Integration

### Scheduled Job
The `ui_chat_canary` job runs on GitHub Actions:
- **Schedule**: Every hour (`0 * * * *` cron)
- **Branch**: Only on `main` (not PRs or feature branches)
- **Mode**: `CHAT_BACKEND_MOCK=1` (deterministic canned responses)
- **Blocking**: Fails if canary fails (alerts team)

### Job Conditions
```yaml
if: github.event_name == 'schedule' && github.ref == 'refs/heads/main'
```

This ensures canary only runs:
- On scheduled triggers (hourly)
- On the main branch (not PRs)

### Job Steps
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Start web-ui with `CHAT_BACKEND_MOCK=1`
5. Run canary script
6. Fail if exit code != 0

## Metrics Collected

### Latency
- Measured from request start to response received
- Reported in milliseconds
- Useful for detecting performance regressions

### Status
- **PASS**: Service healthy, response valid
- **FAIL**: Service responded but invalid (4xx/5xx or empty)
- **ERROR**: Service unreachable or network issue

### Mock Flag
- Always `mock=1` in CI
- Indicates no external LLM dependency
- Guarantees deterministic behavior

## Dashboard Integration

The Guardian summary line is designed for:
- Log aggregation tools (Splunk, ELK, etc.)
- Custom dashboards
- Alert systems
- Trend analysis

### Example Queries

**Parse summary line:**
```regex
GUARDIAN_SUMMARY: UI_CHAT_CANARY (?<status>\w+); latency_ms=(?<latency>\d+); mock=(?<mock>\d)
```

**Track success rate:**
```
Count(status=PASS) / Count(status=*)
```

**Monitor latency trends:**
```
AVG(latency_ms) GROUP BY hour
```

## Troubleshooting

### Exit 71: FAIL
**Causes:**
- Backend returns 4xx/5xx status
- Response body is empty
- MOCK mode not properly implemented

**Fix:**
1. Check `/api/chat` route implementation
2. Verify `CHAT_BACKEND_MOCK=1` is respected
3. Ensure canned response is non-empty
4. Check server logs for errors

### Exit 72: ERROR
**Causes:**
- Web-ui server not running
- Network connectivity issues
- Port 4000 blocked or in use

**Fix:**
1. Verify server startup in CI logs
2. Check `Start-Sleep` duration (may need increase)
3. Review dependency installation
4. Check for port conflicts

### Canary fails but E2E passes
**Possible reasons:**
- Timing issue (canary runs too early)
- Different environment variables
- Race condition in server startup

**Fix:**
1. Compare job configurations
2. Ensure both use same `CHAT_BACKEND_MOCK` setting
3. Increase sleep duration in canary job
4. Check for environment variable leakage

### High latency warnings
**Normal ranges:**
- Local dev: 50-200ms typical
- CI environment: 100-500ms typical

**Investigation:**
- If latency > 1000ms consistently, investigate:
  - Server resource constraints
  - Middleware overhead
  - CI runner performance issues

## Best Practices

### For Developers
- Keep `/api/chat` MOCK response lightweight
- Ensure MOCK mode has minimal latency
- Don't add external calls in MOCK code path
- Test canary locally before pushing

### For DevOps
- Monitor canary failure alerts
- Set up dashboard to track latency trends
- Alert on consecutive failures (3+)
- Review canary logs during incidents

### For Product
- Use canary metrics for SLOs
- Track availability percentage
- Compare MOCK vs real latency
- Identify performance regressions early

## Related Tests

- **E2E Mock**: `scripts/tools/user.copilot.os1p3.ui-chat-e2e-mock.v2025.10.14.ps1`
  - Runs on PRs and pushes
  - Validates chat functionality
  - Similar but not scheduled

- **Smoke Test**: `scripts/tools/user.copilot.os1p3.chat-smoke.v2025.10.14.ps1`
  - Basic connectivity check
  - Runs in CI pipeline
  - No latency measurement

- **Contract Check**: `scripts/tools/user.copilot.os1p3.chat-contract-check.v2025.10.14.ps1`
  - Validates response format
  - Runs after smoke tests
  - Ensures API contract compliance

## Health API Integration

The canary complements the `/api/chat/health` endpoint:

**Canary**: Measures actual request flow
**Health endpoint**: Reports service status

Both should report:
```json
{
  "ok": true,
  "mock": true
}
```

When `CHAT_BACKEND_MOCK=1` is set.

## References
- Canary script: `scripts/tools/user.copilot.os1p3.ui-chat-canary.v2025.10.14.ps1`
- E2E test: `scripts/tools/user.copilot.os1p3.ui-chat-e2e-mock.v2025.10.14.ps1`
- E2E policy: `docs/policies/user.copilot.os1p3.ui-chat-e2e.v2025.10.14.md`
- CI workflow: `.github/workflows/guardian.yml` (ui_chat_canary job)
