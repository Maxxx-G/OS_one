# OS1 — WebUI User Setup · v2025.10.23

X-Tier1: user  
X-Agent: copilot  
X-Domain: os1p4  
X-Purpose: webui-user-setup  
X-Version: v2025.10.23  
X-STB-ID: STB-CPL-A10  
X-Template: stb/1.0  
X-Policy: filenaming/1.0  
X-Notes: One-click WebUI startup, local connection, daily workflow enablement

---

## 🧭 Objectives
Set up the OS One WebUI so you can:
1. Launch Gabriel and chat normally  
2. Run jobs through the Gabriel Console  
3. Switch between mock, local (Archon), or external (OpenAI) modes  
4. Keep everything stable for daily work  

---

## ⚙️ Constraints
- Must run on Windows PowerShell 5.1+  
- Limit: ≤ 5 files touched  
- No secrets printed or stored  
- Keep model defaults:  
  ```
  CHAT_BACKEND_MODE = local
  CHAT_BACKEND_URL = http://localhost:7700/v1/chat
  CHAT_BACKEND_MODEL = deepseek-r1:8b
  ```

---

## 🧩 Tasks

### 1. Start Local Services

```powershell
# Start Archon (port 7700)
docker compose up -d archon-api

# Wait for health confirmation
curl http://localhost:7700/health
```

**Should return:**
```json
{"status":"running"}
```

---

### 2. Launch WebUI

```powershell
# Kill anything using port 4000
npm run predev

# Start Next.js WebUI
npm run dev
```

Then open: `http://localhost:4000/chat`

---

### 3. Set Chat Settings

| Setting | Value |
|---------|-------|
| Backend Mode | `Local (localhost:7700)` |
| Model (optional) | `deepseek-r1:8b` |
| Direct | ON |
| Mock Mode | OFF |
| SEC-COMMS | ON |
| Runner (Gabriel Console) | ON |

---

### 4. Start Gabriel

In the chat input (Zone B):

```
/start gabriel
```

**Expected reply:**
```
Phase 4 Autonomic Active — θ-Daemon ready
```

---

### 5. Health Check

```powershell
npm run webui:bringup
```

**Expect:**
```
GUARDIAN_SUMMARY: WEBUI_READY PASS; endpoints=5
```

---

### 6. Daily Use

✅ **Chat with Gabriel in the composer**  
✅ **Use "Spawn New Task" to assign async jobs**  
✅ **Review "Recent Jobs" for PASS/FAIL badges**  
✅ **Restart services as needed:**

```powershell
npm run predev
npm run dev
```

---

## ✅ Acceptance Criteria

| Check | Pass Condition |
|-------|---------------|
| Archon API Running | ✅ localhost:7700 healthy |
| WebUI Running | ✅ localhost:4000 open |
| Gabriel Responds | ✅ `/start gabriel` → Active |
| Guardian PASS Output | ✅ Seen in PowerShell |
| Chat Functional | ✅ Send/receive mock + local replies |

---

## 🔄 Rollback

```powershell
npm run predev
docker compose down
Remove-Item .next, .turbo -Recurse -Force
```

Then restart everything from **Step 1**.

---

## 📝 Commit Message
```
docs(stb): add STB-CPL-A10 — OS One WebUI User Setup

- Adds step-by-step local launch and health check
- Verifies Gabriel ready state and daily workflow config
```

---

## 🚀 Quick Start Reference

### One-Line Startup (After Initial Setup)
```powershell
# Terminal 1: Start Archon
docker compose up -d archon-api

# Terminal 2: Start WebUI
cd D:\OS_One; npm run dev
```

### Common Commands
```powershell
# Health checks
curl http://localhost:7700/health          # Archon
curl http://localhost:4000/api/health      # WebUI

# Stop services
npm run predev                              # Kill port 4000
docker compose down                         # Stop Archon

# Clear cache
cd apps\web-ui; Remove-Item -Recurse -Force .next,.turbo

# Run full bringup test
npm run webui:bringup
```

---

## 🎯 Daily Workflow

### Morning Startup
1. **Start Archon:** `docker compose up -d archon-api`
2. **Start WebUI:** `npm run dev`
3. **Open Browser:** `http://localhost:4000/chat`
4. **Activate Gabriel:** Type `/start gabriel` in chat

### During Work
- **Chat directly** with Gabriel for immediate tasks
- **Spawn async jobs** via Gabriel Console (top-right button)
- **Monitor progress** in "Recent Jobs" panel
- **Grant permissions** for sensitive operations in "Pending Permissions"

### End of Day
1. **Stop WebUI:** Press `Ctrl+C` in terminal
2. **Stop Archon:** `docker compose down`

---

## 🛠️ Troubleshooting

### Issue: Archon not starting
**Solution:**
```powershell
# Check if port 7700 is in use
netstat -ano | findstr :7700

# Kill process if needed (as admin)
taskkill /F /PID <PID>

# Restart Archon
docker compose up -d archon-api
```

### Issue: WebUI not loading
**Solution:**
```powershell
# Clear cache and restart
cd D:\OS_One\apps\web-ui
Remove-Item -Recurse -Force .next,.turbo
cd ..\..
npm run dev
```

### Issue: Gabriel not responding
**Solution:**
1. Check Backend Mode = "Local (localhost:7700)"
2. Verify Archon health: `curl http://localhost:7700/health`
3. Toggle Runner ON in Gabriel Console
4. Restart chat: Refresh browser page

### Issue: Jobs stuck in queue
**Solution:**
1. Check Runner status (green = active)
2. Review "Recent Jobs" for error messages
3. Grant pending permissions if needed
4. Verify θ-Daemon active: `curl http://localhost:4000/api/theta/status`

---

## 📊 Status Indicators

### Green (Healthy)
- ✅ Archon API responding
- ✅ WebUI endpoints all 200 OK
- ✅ Runner active and polling
- ✅ θ-Daemon monitoring jobs
- ✅ Gabriel chat responding

### Yellow (Warning)
- ⚠️ Some endpoints slow (>500ms)
- ⚠️ Jobs pending permissions
- ⚠️ Cache growing large (>1GB)

### Red (Error)
- ❌ Archon unreachable (port 7700)
- ❌ WebUI crashed (port 4000)
- ❌ Runner stopped
- ❌ Gabriel not responding
- ❌ Jobs failing consistently

---

## 🔐 Security Notes

✅ **No API keys stored in browser**  
✅ **Environment variables in `.env.local` only**  
✅ **Windows Credential Manager for sensitive data**  
✅ **SEC-COMMS encryption active**  
✅ **CORS restricted to localhost**

---

## 📈 Performance Tips

### Faster Startup
```powershell
# Keep Archon running all day
docker compose up -d archon-api

# Only restart WebUI when needed
npm run dev
```

### Memory Management
```powershell
# Clear cache weekly
cd apps\web-ui
Remove-Item -Recurse -Force .next,.turbo

# Restart Archon if memory high
docker compose restart archon
```

### Background Jobs
- Use **autonomic: true** for tasks that can run unattended
- Set **lower priority** for non-urgent jobs
- Monitor telemetry: `.logs/guardian-telemetry.json`

---

## 🧪 Testing Checklist

Before daily use, verify:

- [ ] Archon health: `curl http://localhost:7700/health`
- [ ] WebUI health: `curl http://localhost:4000/api/health`
- [ ] Chat health: `curl http://localhost:4000/api/chat/health`
- [ ] Ready status: `curl http://localhost:4000/api/ready`
- [ ] Jobs API: `curl http://localhost:4000/api/jobs`
- [ ] θ-Daemon: `curl http://localhost:4000/api/theta/status`

**All should return 200 OK** ✅

---

## 📚 Related Documents

- `user.copilot.os1p4.webui-startup-checklist.v2025.10.22.md` - Detailed health verification
- `user.copilot.os1p3.webui-bringup-kit.v2025.10.21.md` - Automated bringup script
- `user.copilot.os1p4.phase3-to-phase4-handover.v2025.10.22.md` - Phase 4 implementation
- `user.copilot.os1p3.gabriel-model-access.v2025.10.21.md` - Multi-model routing
- `user.copilot.os1p3.async-agentic-cloning.v2025.10.21.md` - Agent spawning system

---

## 🎓 Learning Resources

### Gabriel Commands
```
/start gabriel      - Activate Phase 4 autonomic mode
/status            - Show Gabriel status
/agents            - List active sub-agents
/phase             - Show current phase (3 or 4)
/help              - Show all commands
```

### Chat Modes
- **Direct Mode:** WebUI → Archon (no middleware)
- **Mock Mode:** Simulated responses (testing only)
- **External Mode:** OpenAI/Anthropic/Ollama (requires API keys)

### Job Lifecycle
1. **Queued** - Waiting to run
2. **Running** - Agent executing
3. **Waiting Permission** - Sensitive op detected
4. **Completed** - Success with QA PASS
5. **Failed** - Error or QA FAIL

---

**Document Status:** ✅ ACTIVE  
**Last Updated:** 2025-10-23  
**Maintainer:** user.copilot  
**Phase:** os1p4 (δ-Autonomic)  
**Target Users:** Daily OS One operators, Gabriel users
