<!--
X-Tier1: policy
X-Agent: user.copilot
X-Domain: os1p3.ops
X-Purpose: stabilize-mode
X-Version: v2025.10.15
X-Policy: STB
-->

# OS1 Stabilize Mode - Emergency Health Check

**Policy**: `user.copilot.os1p3.ops-stabilize-mode.v2025.10.15`  
**Status**: Active  
**Owner**: Ops Team  
**Effective**: 2025-10-15

---

## Overview

**Stabilize Mode** provides a single command to verify the entire chat stack is operational in MOCK mode. This is the emergency "everything works" lever that validates:

1. Environment variables (MOCK mode enabled)
2. Web-UI dev server startup
3. Health endpoint (`/api/chat/health`)
4. Chat endpoint (`/api/chat`) with real POST
5. GUARDIAN_SUMMARY output (PASS/FAIL)

### Goals

- **Emergency Verification**: One command to prove chat stack is alive
- **Pre-Flight Check**: Run before attempting real backend connections
- **Rollback Validation**: Confirm system works after reverting changes
- **CI/CD Gate**: Manual workflow dispatch for ops validation

---

## Usage

### Basic Command

```powershell
powershell -f scripts/tools/user.copilot.os1p3.ops-stabilize.v2025.10.15.ps1
```

### Output

**Success (Exit 0):**
```
========================================
OS1 STABILIZE: Emergency Health Check
========================================

[1/5] Enabling MOCK mode...
      CHAT_BACKEND_MOCK=1
      CHAT_BACKEND_MODE=auto

[2/5] Checking web-ui status...
      Web-UI not detected, will start...

[3/5] Starting web-ui dev server...
      Process ID: 12345
      Waiting 8 seconds for startup...

[4/5] Probing /api/chat/health...
      ✓ Health check PASS
      Backend: mock
      Mock: true

[5/5] Testing /api/chat endpoint...
      ✓ Chat endpoint PASS (HTTP 200)
      Reply: MOCK: Hello from OS One! (retry layer active)...

========================================
GUARDIAN_SUMMARY: STABILIZE PASS; mock=1
========================================

✓ All checks passed. Chat stack is operational in MOCK mode.
  You can now proceed with real backend testing.
```

**Failure (Exit 81):**
```
========================================
GUARDIAN_SUMMARY: STABILIZE FAIL; mock=1
========================================

✗ Stabilize checks failed. Diagnostics:
  - Health endpoint: ✗ FAIL
  - Chat endpoint:   ✗ FAIL

Next steps:
  1. Check web-ui logs for errors
  2. Run: npm run -w apps/web-ui dev
  3. Verify CHAT_BACKEND_MOCK=1 is set
  4. Run E2E smoke: scripts/tools/user.copilot.os1p3.ui-chat-e2e-mock.v2025.10.14.ps1
```

---

## Exit Codes

| Code | Status | Meaning |
|------|--------|---------|
| `0` | PASS | All checks passed: health + chat operational |
| `81` | FAIL | One or more checks failed: see diagnostics |

---

## Runbook

### When to Use Stabilize Mode

1. **After Major Changes**: Validate chat stack after refactoring
2. **Before Rollout**: Pre-flight check before enabling real backend
3. **Rollback Verification**: Confirm system works after reverting
4. **Emergency Triage**: Quick check if chat is completely broken
5. **CI/CD Gates**: Manual workflow dispatch in Guardian

### Decision Tree

```
Run stabilize.ps1
    ↓
PASS? → Proceed with real backend testing
    ↓
FAIL? → Check diagnostics
    ↓
    ├─ Health FAIL → Check web-ui startup, port 4000 availability
    ├─ Chat FAIL → Check /api/chat route, MOCK mode configuration
    └─ Both FAIL → Run full E2E smoke suite for detailed errors
```

### Integration with Existing Tools

- **E2E MOCK Test**: `user.copilot.os1p3.ui-chat-e2e-mock.v2025.10.14.ps1`
  - More detailed, runs full conversation flow
  - Use for regression testing

- **Hourly Canary**: `user.copilot.os1p3.ui-chat-canary.v2025.10.14.ps1`
  - Scheduled drift detection
  - Use for continuous monitoring

- **Stabilize Mode**: `user.copilot.os1p3.ops-stabilize.v2025.10.15.ps1`
  - Emergency health check
  - Use for manual verification

---

## Environment Variables

### Required

- `CHAT_BACKEND_MOCK=1` - Enables MOCK mode (set automatically by script)
- `CHAT_BACKEND_MODE=auto` - Uses auto-routing (set automatically by script)

### Pre-Requisites

- Web-UI dev server NOT already running on port 4000 (script will start it)
  - OR web-UI already running (script will detect and skip startup)
- PowerShell 5.1 or higher
- npm installed and `apps/web-ui` dependencies available

---

## Health Check Details

### Step 1: Enable MOCK Mode
Sets environment variables:
- `CHAT_BACKEND_MOCK=1`
- `CHAT_BACKEND_MODE=auto`

### Step 2: Check Web-UI Status
Attempts GET request to `http://localhost:4000`
- If 200 response → Already running, skip startup
- If connection fails → Start web-ui dev server

### Step 3: Start Web-UI (if needed)
Launches `npm run -w apps/web-ui dev`
- NoNewWindow mode (background process)
- 8-second startup delay
- Process ID logged for debugging

### Step 4: Probe Health Endpoint
GET `http://localhost:4000/api/chat/health`
- Expected: `{ ok: true, mock: true, url: "mock" }`
- Timeout: 5 seconds
- Validates: Health endpoint accessible, returns valid JSON

### Step 5: Test Chat Endpoint
POST `http://localhost:4000/api/chat`
```json
{
  "messages": [
    { "role": "user", "content": "stabilize test" }
  ]
}
```
- Expected: HTTP 200-299 status
- Expected: JSON response with `choices[0].message.content`
- Timeout: 10 seconds
- Validates: Chat endpoint processes requests, returns MOCK reply

---

## Troubleshooting

### "Health endpoint unreachable"

**Cause**: Web-UI failed to start or port 4000 blocked

**Solutions**:
1. Check if another process is using port 4000:
   ```powershell
   Get-NetTCPConnection -LocalPort 4000
   ```
2. Manually start web-ui and check logs:
   ```powershell
   npm run -w apps/web-ui dev
   ```
3. Verify `apps/web-ui/package.json` has dev script

### "Chat endpoint failed"

**Cause**: `/api/chat` route error or MOCK mode not enabled

**Solutions**:
1. Check MOCK mode environment variable:
   ```powershell
   $env:CHAT_BACKEND_MOCK
   ```
2. Inspect API route logs for errors
3. Test endpoint manually:
   ```powershell
   $body = '{"messages":[{"role":"user","content":"test"}]}'
   Invoke-WebRequest -Uri http://localhost:4000/api/chat -Method POST -Body $body -ContentType "application/json"
   ```

### "Process hangs during startup"

**Cause**: npm install incomplete or dependency issues

**Solutions**:
1. Kill web-ui process:
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process
   ```
2. Reinstall dependencies:
   ```powershell
   npm install --workspace apps/web-ui
   ```
3. Clear Next.js cache:
   ```powershell
   Remove-Item -Recurse -Force apps/web-ui/.next
   ```

---

## Guardian Workflow Integration

### Manual Workflow Dispatch

Add to `.github/workflows/guardian.yml`:

```yaml
ops_stabilize_check:
  runs-on: ubuntu-latest
  if: github.event_name == 'workflow_dispatch'
  needs: [guard]
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: "20"
    - run: npm ci
    - name: Run Stabilize Check
      env:
        CHAT_BACKEND_MOCK: "1"
        CHAT_BACKEND_MODE: "auto"
      run: |
        pwsh -f scripts/tools/user.copilot.os1p3.ops-stabilize.v2025.10.15.ps1
```

### Trigger via GitHub UI

1. Go to **Actions** tab
2. Select **Guardian** workflow
3. Click **Run workflow**
4. Select branch: `main` or feature branch
5. Click **Run workflow** button

Guardian will run stabilize check and report PASS/FAIL in job summary.

---

## Compliance

### Zero-Tolerance Rules

- ✅ Script must exit 0 (PASS) or 81 (FAIL), no other codes
- ✅ GUARDIAN_SUMMARY output required for CI/CD parsing
- ✅ No changes to runtime policy beyond environment variables
- ✅ No external dependencies (PowerShell 5.1 built-ins only)
- ✅ Deterministic output (no random test data)

### Policy Boundaries

- **Does NOT**: Modify source code, database, or configuration files
- **Does NOT**: Test real backend connections (MOCK only)
- **Does NOT**: Run full test suite (single health + chat check)
- **Does**: Set environment variables (ephemeral, script-local)
- **Does**: Start web-ui dev server (if not running)
- **Does**: Send single POST to `/api/chat` (read-only operation)

---

## Related Documentation

- [user.copilot.os1p3.ui-chat.e2e-smoke+ci.v2025.10.14.md](user.copilot.os1p3.ui-chat.e2e-smoke+ci.v2025.10.14.md) - E2E MOCK test suite
- [user.copilot.os1p3.ui-chat.canary+guardian.v2025.10.14.md](user.copilot.os1p3.ui-chat.canary+guardian.v2025.10.14.md) - Hourly canary monitoring
- [user.copilot.os1p3.ui-chat.health-pill.v2025.10.14.md](user.copilot.os1p3.ui-chat.health-pill.v2025.10.14.md) - Health status indicator

---

## Changelog

- **2025-10-15**: Initial policy for stabilize mode emergency health check
