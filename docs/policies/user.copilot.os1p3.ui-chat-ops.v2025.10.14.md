# UI Chat Ops (Local & CI)
X-Tier1: user  
X-Agent: copilot  
X-Domain: os1p3  
X-Purpose: ui-chat-ops  
X-Version: v2025.10.14  
X-Policy: Single-Fence STB; ≤5 files; deterministic

## Overview
Operational guide for UI chat functionality in local development and CI environments.

## Local Development

### Prerequisites
1. **Model Server**: Ensure your model server exposes `POST /v1/chat` on port `:7700`
2. **Web UI**: Start the web-ui server on port `:4000`
3. **Environment**: Copy `.env.local.example` to `.env.local` and configure

### Setup Steps

1. **Configure environment**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Set chat backend URL** (in `.env.local`):
   ```bash
   CHAT_BACKEND_URL=http://localhost:7700/v1/chat
   ```

3. **Start model server** (on port 7700):
   - Ollama: `ollama serve` (configure to use port 7700)
   - OpenWebUI: Start with appropriate port configuration
   - Custom server: Ensure it implements the `/v1/chat` endpoint

4. **Start web-ui**:
   ```bash
   npm --prefix apps/web-ui run dev
   ```

5. **Access chat**: Navigate to `http://localhost:4000/chat`

### Testing Locally

Run the chat smoke test:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.copilot.os1p3.chat-smoke.v2025.10.14.ps1
```

**Expected output**: `CHAT_SMOKE_PASS`

## CI Integration

The `ui_chat_smoke` job in Guardian CI:
1. Installs dependencies
2. Starts the web-ui dev server (with `CHAT_BACKEND_URL=http://localhost:7700/v1/chat`)
3. Optionally checks if backend at `:7700` is reachable (non-blocking)
4. Runs chat smoke test against `/api/chat`
5. **Fails the build** if `/api/chat` proxy or backend is unavailable

### CI Behavior
- **Pass**: Chat endpoint responds with HTTP 200/201 and non-empty content
- **Fail**: Request error, non-200 status, or empty response
- **Backend check**: Optional, non-blocking (continues even if `:7700` unreachable)

## Environment Variables

### CHAT_BACKEND_URL
- **Default**: `http://localhost:7700/v1/chat`
- **Purpose**: Points to the model server endpoint for chat completions
- **Local**: Configure in `.env.local`
- **CI**: Set in workflow or use default

### SEC_COMMS_ENFORCE
- **Purpose**: When set to `1`, client adds `x-sec-local-only: 1` header
- **Use case**: Local development with SEC-COMMS enabled

## Exit Codes

### chat_smoke.ps1
- `0` - CHAT_SMOKE_PASS (success)
- `31` - Request error (connection failed, network issue)
- `32` - HTTP status error (non-200/201 response)
- `33` - Empty response (backend responded but no content)

## Troubleshooting

### Local: "CHAT_SMOKE_FAIL: request error"
- Check if web-ui is running on `:4000`
- Verify `/api/chat` route exists
- Check browser console for errors

### Local: "HTTP 502/504"
- Model server at `:7700` is not running or unreachable
- Check `CHAT_BACKEND_URL` in `.env.local`
- Verify model server is accepting POST requests

### CI: Job fails
- Backend stub not available (expected in basic CI)
- Web-ui build/start failed
- Chat endpoint implementation missing or broken

### "Empty response"
- Backend returned 200 but no content
- Check model server logs
- Verify request format matches backend expectations

## API Contract

### Request Format
```json
POST /api/chat
Content-Type: application/json
x-sec-local-only: 1

{
  "messages": [
    {
      "role": "user",
      "content": "your message here"
    }
  ]
}
```

### Expected Response
- **Status**: 200 or 201
- **Body**: Non-empty JSON or text response
- **Format**: Depends on backend (OpenAI-compatible, streaming, etc.)

## References
- Environment example: `.env.local.example`
- Smoke test: `scripts/tools/user.copilot.os1p3.chat-smoke.v2025.10.14.ps1`
- CI workflow: `.github/workflows/guardian.yml` (ui_chat_smoke job)
