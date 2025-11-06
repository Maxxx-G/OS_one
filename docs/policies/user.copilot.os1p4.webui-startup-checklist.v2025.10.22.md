# OS1 — WebUI Startup Checklist · v2025.10.22

X-Tier1: user  
X-Agent: copilot  
X-Domain: os1p4  
X-Purpose: webui-startup-checklist  
X-Version: v2025.10.22  
X-STB-ID: STB-CPL-A09  
X-Template: stb/1.0  
X-Policy: filenaming/1.0  
X-Notes: Verify WebUI readiness, Guardian summary output, endpoint health

---

## 🧭 Objectives
Ensure the OS One Web UI (Phase 4 δ-Autonomic) starts cleanly, connects to the Archon backend, and can communicate with Gabriel and his sub-agents.  

**Primary goals:**
- Confirm backend health across all 5 key endpoints  
- Validate correct mode = `Local (Archon:7700)` and `Direct ON`  
- Produce a **Guardian PASS line** confirming readiness  

---

## ⚙️ Constraints
- ≤ 5 files modified during setup  
- `CHAT_BACKEND_MODE` = local (mock OFF)  
- No secrets printed or stored  
- Windows PowerShell 5.1 compatible for smoke checks  
- Must emit:  
  ```
  GUARDIAN_SUMMARY: WEBUI_READY PASS; endpoints=5
  ```

---

## 🧩 Tasks

### 1. Web UI Settings
| Setting | Value |
|----------|--------|
| Backend Mode | `Local (localhost:7700)` |
| Model (optional) | `chatgpt5-preview` |
| Direct | ON |
| Mock Mode | OFF |
| SEC-COMMS | Active |
| Runner (Gabriel Console) | Active |

> 💬 Chat directly with **Gabriel** in the composer (Zone B).  
> 🚀 Use "Spawn New Task" (Zone A) only for async job delegation.

---

### 2. Endpoint Health Check

#### Browser verification
```
http://localhost:4000/api/health
http://localhost:4000/api/chat/health
http://localhost:4000/api/ready
http://localhost:4000/api/jobs
http://localhost:4000/api/theta/status
```

#### PowerShell smoke test
```powershell
$base = "http://localhost:4000"
$eps  = "/api/health","/api/chat/health","/api/ready","/api/jobs","/api/theta/status"
$fail = @()
foreach($e in $eps){
  try {
    $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 8 -Uri ($base+$e)
    if($r.StatusCode -ne 200){ $fail += "$e:$($r.StatusCode)" }
  } catch { $fail += "$e:ERR" }
}
if($fail.Count -eq 0){
  "GUARDIAN_SUMMARY: WEBUI_READY PASS; endpoints=5" ; exit 0
} else {
  "GUARDIAN_SUMMARY: WEBUI_READY FAIL; details=" + ($fail -join ",") ; exit 31
}
```

---

### 3. Startup Sequence

1. **Launch Web UI** → `http://localhost:4000/chat`

2. **In composer:**
   ```
   /start gabriel
   ```

3. **Wait for:**
   ```
   Phase 4 Autonomic Active — θ-Daemon monitoring N jobs
   ```

4. **Run:**
   ```
   /status
   /agents
   /phase
   ```

5. **Confirm responses OK.**

---

## ✅ Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| All 5 endpoints return 200 | PASS |
| Chat returns non-mock reply | PASS |
| Runner Active + processing jobs | PASS |
| Guardian summary emitted | PASS |
| No secrets in logs | PASS |

**Guardian output example:**
```
GUARDIAN_SUMMARY: WEBUI_READY PASS; endpoints=5
```

---

## 🔄 Rollback

1. Toggle **Runner Inactive**
2. Enable **Mock Mode ON**
3. Run: `npm run predev && npm run dev`
4. Re-run the smoke test to confirm baseline ready

---

## 📝 Commit Message
```
docs(stb): add STB-CPL-A09 WebUI Startup Checklist — Phase 4 δ verification

- File: docs/policies/user.copilot.os1p4.webui-startup-checklist.v2025.10.22.md
- Ensures Archon connectivity + Guardian PASS verification
- Includes rollback steps + PowerShell health script
```

---

## 📊 Phase 4 Integration

### Gabriel Console (Zone A)
- **Spawn New Task** - Creates autonomic jobs for θ-Daemon
- **Pending Permissions** - Reviews sensitive operations
- **Recent Jobs** - Monitors execution history
- **Runner Toggle** - Controls agent executor

### Chat Interface (Zone B)
- **Direct Mode** - Real-time conversation with Gabriel
- **Model Selector** - Choose backend (chatgpt5-preview, sonnet-4.5, deepseek-r1:8b)
- **Message History** - Full conversation context

### Backend Modes
| Mode | Description | Port |
|------|-------------|------|
| Local (Archon) | Production Archon backend | 7700 |
| Mock | Test mode (no external calls) | N/A |
| Direct | WebUI → Backend (no proxy) | 4000 |

---

## 🛡️ Security Checks

✅ **No credentials in browser console**  
✅ **No API keys in network tab**  
✅ **SEC-COMMS encryption active**  
✅ **CORS headers validated**  
✅ **Rate limiting enforced**

---

## 📈 Telemetry Validation

After startup, verify telemetry pipeline:

```powershell
# Check telemetry logs
Get-Content -Tail 20 .logs/guardian-telemetry.json

# Verify trace IDs
# Expected formats: os1-θ-<uuid>, os1-δ-<uuid>
```

**Expected trace sources:**
- `watcher-qa` - QA validation results
- `theta` - Daemon spawn events
- `gabriel-core` - Phase transitions
- `scripts` - Handover executions

---

## 🎯 Success Indicators

1. ✅ All 5 endpoints healthy
2. ✅ Gabriel responds in chat
3. ✅ θ-Daemon polling every 30s
4. ✅ Jobs spawn without errors
5. ✅ QA watcher validates completions
6. ✅ Telemetry traces logged
7. ✅ Guardian summary: PASS

---

## 🔧 Troubleshooting

### Issue: Endpoints return 404
**Solution:** Restart Next.js dev server with cache clear
```powershell
cd D:\OS_One\apps\web-ui
Remove-Item -Recurse -Force .next,.turbo -ErrorAction SilentlyContinue
npm run dev
```

### Issue: Mock mode still active
**Solution:** Check environment variable
```powershell
# In Web UI settings, ensure:
# Backend Mode = "Local (localhost:7700)"
# Mock Mode = OFF
```

### Issue: θ-Daemon not polling
**Solution:** Activate autonomic phase
```javascript
// Browser console
import { beginAutonomicPhase } from "@/lib/agents/gabriel";
await beginAutonomicPhase();
```

### Issue: Jobs stuck in queue
**Solution:** Check Runner status
- Ensure Runner toggle = Active (green)
- Check Recent Jobs for error logs
- Verify permissions granted for sensitive ops

---

## 📚 Related Documents

- `docs/policies/user.copilot.os1p4.phase3-to-phase4-handover.v2025.10.22.md` - Phase 4 implementation
- `docs/policies/user.copilot.os1p3.webui-bringup-kit.v2025.10.21.md` - Web UI bring-up automation
- `docs/policies/user.copilot.os1p3.gabriel-model-access.v2025.10.21.md` - Multi-model routing
- `docs/policies/user.copilot.os1p3.async-agentic-cloning.v2025.10.21.md` - Agent spawning system

---

**Document Status:** ✅ ACTIVE  
**Last Updated:** 2025-10-22  
**Maintainer:** user.copilot  
**Phase:** os1p4 (δ-Autonomic)
