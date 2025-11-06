# UI Chat E2E (MOCK Mode)
X-Tier1: user  
X-Agent: copilot  
X-Domain: os1p3  
X-Purpose: ui-chat-e2e  
X-Version: v2025.10.14  
X-Policy: Single-Fence STB; ≤5 files; deterministic

## Overview
End-to-end smoke test for `/api/chat` in **MOCK mode** to guarantee the chat endpoint works in CI regardless of external model server availability.

## Mock Mode Benefits
- **Deterministic**: Returns canned replies, no external dependencies
- **Fast**: No model inference delays
- **Reliable**: Works even when backend is offline
- **CI-Friendly**: Guarantees `/chat` works without LLM infrastructure

## Environment Variable

### `CHAT_BACKEND_MOCK`
When set to `"1"`, the chat API route should:
1. Bypass external model server calls
2. Return deterministic canned responses
3. Still exercise the full request/response pipeline
4. Report `mock: true` in health endpoint

**Example:**
```powershell
$env:CHAT_BACKEND_MOCK = "1"
npm --prefix apps/web-ui run dev
```

## Exit Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 0 | UI_E2E_PASS | Request succeeded, response non-empty |
| 61 | UI_E2E_FAIL | Network error, connection refused, timeout |
| 62 | UI_E2E_FAIL | HTTP status not 2xx |
| 63 | UI_E2E_FAIL | Response body empty |

## Local Usage

### Run E2E test (MOCK mode):
```powershell
# 1. Start web-ui with MOCK mode
$env:CHAT_BACKEND_MOCK = "1"
npm --prefix apps/web-ui run dev

# 2. In separate terminal, run E2E test
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3.ui-chat-e2e-mock.v2025.10.14.ps1
```

### Custom endpoint:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3.ui-chat-e2e-mock.v2025.10.14.ps1 -Api "http://localhost:3000/api/chat"
```

### Custom prompt:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3.ui-chat-e2e-mock.v2025.10.14.ps1 -Prompt "test message"
```

## CI Integration

The `ui_chat_e2e` job in Guardian CI:
1. Sets `CHAT_BACKEND_MOCK=1` environment variable
2. Installs web-ui dependencies
3. Starts dev server with MOCK mode enabled
4. Runs E2E smoke test
5. **Fails the build** if E2E test fails

### Job Characteristics
- **Independent**: Runs after `validate-stb` (parallel to smoke/contract jobs)
- **Fast**: No external model server required
- **Deterministic**: Same canned reply every time
- **Blocking**: Prevents merging if `/chat` is broken

## Health API Contract

When `CHAT_BACKEND_MOCK=1`, the health endpoint should reflect mock status:

**Request:**
```
GET /api/chat/health
```

**Response (MOCK mode):**
```json
{
  "ok": true,
  "mock": true
}
```

**Response (Normal mode):**
```json
{
  "ok": true,
  "mock": false,
  "backend": "http://localhost:7700/v1/chat"
}
```

## Troubleshooting

### Exit 61: Request Error
**Causes:**
- Web-ui server not running
- Port 4000 already in use
- Network/firewall blocking localhost

**Fix:**
1. Verify server is running: `curl http://localhost:4000`
2. Check port availability: `netstat -ano | findstr :4000`
3. Restart dev server with MOCK mode enabled

### Exit 62: HTTP Error
**Causes:**
- Server returned 4xx or 5xx status
- Route `/api/chat` not defined
- Middleware rejecting request

**Fix:**
1. Check server logs for error messages
2. Verify `/api/chat` route exists in web-ui
3. Check request headers (x-sec-local-only required)
4. Test manually:
   ```powershell
   $body = @{ messages = @(@{ role="user"; content="test" }) } | ConvertTo-Json
   Invoke-WebRequest -Method POST -Uri "http://localhost:4000/api/chat" `
     -Body $body -ContentType "application/json" `
     -Headers @{ "x-sec-local-only"="1" } -UseBasicParsing
   ```

### Exit 63: Empty Response
**Causes:**
- Server returns 200 but empty body
- MOCK mode not properly implemented
- Response streaming but not captured

**Fix:**
1. Inspect server logs for processing errors
2. Verify MOCK mode is enabled: `$env:CHAT_BACKEND_MOCK`
3. Check if route is returning empty string vs null
4. Ensure canned reply is properly defined

### CI: E2E fails but works locally
**Causes:**
- Environment variable not set in CI
- Dependencies not installed
- Server startup timing issues

**Fix:**
1. Verify `CHAT_BACKEND_MOCK: "1"` in job env section
2. Check `npm install` completed successfully
3. Increase `Start-Sleep` seconds if startup slow
4. Review CI job logs for actual error

## Implementation Checklist

For developers implementing MOCK mode support:

- [ ] Add `CHAT_BACKEND_MOCK` environment variable check in `/api/chat` route
- [ ] Implement canned response logic (bypass external model calls)
- [ ] Update `/api/chat/health` to report `mock: true` when in MOCK mode
- [ ] Test locally with `$env:CHAT_BACKEND_MOCK = "1"`
- [ ] Verify E2E script passes with MOCK mode enabled
- [ ] Document canned reply format/content

## Example Canned Reply

Minimal mock response that satisfies contract:
```json
{
  "message": {
    "content": "This is a mock reply. CHAT_BACKEND_MOCK is enabled."
  }
}
```

Or plain text:
```
This is a mock reply. CHAT_BACKEND_MOCK is enabled.
```

## References
- E2E script: `scripts/tools/user.copilot.os1p3.ui-chat-e2e-mock.v2025.10.14.ps1`
- Smoke test: `scripts/tools/user.copilot.os1p3.chat-smoke.v2025.10.14.ps1`
- Contract check: `scripts/tools/user.copilot.os1p3.chat-contract-check.v2025.10.14.ps1`
- Chat ops guide: `docs/policies/user.copilot.os1p3.ui-chat-ops.v2025.10.14.md`
- CI workflow: `.github/workflows/guardian.yml` (ui_chat_e2e job)
