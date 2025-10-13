# UI Chat Contract (CI)
X-Tier1: user  
X-Agent: copilot  
X-Domain: os1p3  
X-Purpose: ui-chat-contract  
X-Version: v2025.10.14  
X-Policy: Single-Fence STB; ≤5 files; deterministic

## Overview
This contract ensures the `/api/chat` endpoint responds with valid, parsable content in either streaming or buffered format.

## Supported Response Formats

### 1. Streaming Responses
Accepted Content-Types:
- `text/event-stream` (Server-Sent Events)
- `application/x-ndjson` or `application/ndjson` (Newline-delimited JSON)
- `text/*` (Plain text streams)

**Requirement**: Non-empty body (any content length > 0)

### 2. Buffered JSON Responses
Must include one of the following fields:

#### OpenAI-style format:
```json
{
  "choices": [
    {
      "message": {
        "content": "response text here"
      }
    }
  ]
}
```

#### Simplified message format:
```json
{
  "message": {
    "content": "response text here"
  }
}
```

#### Minimal format:
```json
{
  "content": "response text here"
}
```

### 3. Plain Text Responses
Any non-empty text response is accepted as a fallback.

## Exit Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 0 | PASS | Contract satisfied (stream/json/text) |
| 41 | Request error | Network failure, connection refused, timeout |
| 42 | Empty stream | Streaming response with no content |
| 43 | Empty body | Buffered response with empty body |
| 44 | Invalid JSON | JSON present but missing content field |
| 45 | Unparsable | Response cannot be parsed as JSON or text |

## Local Usage

### Basic check:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3.chat-contract-check.v2025.10.14.ps1
```

### Custom endpoint:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3.chat-contract-check.v2025.10.14.ps1 -Api "http://localhost:3000/api/chat"
```

### Custom prompt:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3.chat-contract-check.v2025.10.14.ps1 -Prompt "test message"
```

## CI Integration

The `ui_chat_contract` job in Guardian CI:
1. Runs after `ui_chat_smoke` passes
2. Ensures web-ui dev server is running
3. Executes contract check against `/api/chat`
4. **Fails the build** if contract is violated

### When CI Fails

**Exit 41 (Request error)**:
- Web-ui server not running or crashed
- Network/port configuration issue
- Check previous job logs for server startup errors

**Exit 42 (Empty stream)**:
- Streaming endpoint returns headers but no content
- Backend may have crashed mid-stream
- Check backend logs for errors

**Exit 43 (Empty body)**:
- Buffered endpoint returns 200 but empty response
- Backend processed request but produced no output
- Verify backend is connected and healthy

**Exit 44 (Invalid JSON)**:
- JSON response missing required `content` field
- Backend may be returning error object instead of chat response
- Check backend response format matches one of the accepted schemas

**Exit 45 (Unparsable)**:
- Response is neither valid JSON nor plain text
- May indicate corrupted response or encoding issue
- Check `Content-Type` header and response encoding

## Troubleshooting

### Local: "Request error"
1. Verify web-ui is running: `http://localhost:4000`
2. Check if `/api/chat` route exists
3. Verify `CHAT_BACKEND_URL` is set correctly in `.env.local`
4. Check backend server is running at configured URL

### Local: "Empty stream" or "Empty body"
1. Check backend server logs for errors
2. Verify backend is processing the request
3. Test backend directly (bypass `/api/chat` proxy)
4. Check for middleware blocking the response

### Local: "Invalid JSON"
1. Inspect actual response:
   ```powershell
   Invoke-WebRequest -Method POST -Uri "http://localhost:4000/api/chat" `
     -Body '{"messages":[{"role":"user","content":"test"}]}' `
     -ContentType "application/json" -UseBasicParsing | 
     Select-Object Content
   ```
2. Verify response includes `content` field in expected location
3. Check if backend is returning error JSON instead of chat response

### CI: Contract check fails but works locally
1. CI environment may have different backend availability
2. Timing issues - server may not be fully ready
3. Check CI job logs for actual error details
4. Verify all dependencies are installed in CI

## Pre-Commit Hook

Optional: Add to `ops/pre-commit.ps1` for local validation:
```powershell
if (Test-Path "scripts/tools/user.copilot.os1p3.chat-contract-check.v2025.10.14.ps1") {
  try {
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3.chat-contract-check.v2025.10.14.ps1 | Out-Null
  }
  catch {
    Write-Warning "Chat contract check raised warnings; CI will enforce."
  }
}
```

## References
- Smoke test: `scripts/tools/user.copilot.os1p3.chat-smoke.v2025.10.14.ps1`
- Environment config: `.env.local.example`
- Chat ops guide: `docs/policies/user.copilot.os1p3.ui-chat-ops.v2025.10.14.md`
- CI workflow: `.github/workflows/guardian.yml` (ui_chat_contract job)
