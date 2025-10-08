# Web-UI Launch Checklist (v2025.10.07)

**Purpose**: Pre-launch verification steps for OS One Web-UI deployment with health monitoring, provider configuration, and voice features.

---

## 1) Environment Configuration

Copy `.env.local.example` to `.env.local` and configure:

### Required Settings

```bash
# Provider configuration (choose one)
NEXT_PUBLIC_PROVIDER=OpenAIResponses   # or: Ollama, Anthropic, etc.

# OpenAI API key (if using OpenAIResponses)
OPENAI_API_KEY=sk-xxxx...

# Local LLM base (choose one)
OLLAMA_BASE=http://localhost:11434
# OR
OPENWEBUI_BASE=http://localhost:3000
```

### Optional Settings

```bash
# Live Router integration (production deployments)
NEXT_PUBLIC_LIVE_BASE=http://localhost:4000

# Voice features (experimental)
NEXT_PUBLIC_VOICE_LOOP=1        # Enable voice reasoning loop
NEXT_PUBLIC_TTS_STREAM=1        # Enable streaming TTS
NEXT_PUBLIC_DEVHUD=1            # Show development diagnostics

# Agent mode
NEXT_PUBLIC_DIRECT_AGENT=0      # 0=Mediated (default), 1=Direct
```

---

## 2) Quick Smoke Test (Development)

### Start Development Server
```bash
npm run dev
```

### Verify Core Features

✅ **Page Renders**: Navigate to `http://localhost:4000` (or configured port)  
✅ **Provider Switch**: Change provider in UI, send "Hello" message  
✅ **Streaming Tokens**: Verify streamed response tokens appear progressively  
✅ **Footer Badge**: Shows correct format:
   - **Mode**: "Mediated" or "Direct"
   - **Provider**: e.g., "OpenAIResponses (Universe)" or "Ollama (Live)"
   - **Health**: Green "OK" or red "ERR"

### Voice Loop Verification (if enabled)

✅ **PTT (Push-to-Talk)**: Alt+Space activates microphone  
✅ **Phase Transitions**: "listening → thinking → speaking → idle"  
✅ **Health Pill**: VoiceBar shows "Health: OK" (green) when LLM/TTS reachable  

---

## 3) Health Endpoint Verification

### Test Aggregated Health
```bash
curl http://localhost:4000/api/health
```

**Expected Response**:
```json
{
  "ok": true,
  "llmOk": true,
  "ttsOk": false,
  "voice": {
    "llmOk": true,
    "ttsOk": true,
    "timestamp": "2025-10-07T12:00:00.000Z"
  },
  "timestamp": "2025-10-07T12:00:00.000Z"
}
```

**Health Criteria**:
- `llmOk`: LLM base (`/api/version`) returns 200 OK
- `ttsOk`: Live Router TTS endpoint (`/v1/audio/tts/stream`) returns 200 OK
- `voice.llmOk`: Voice-specific LLM check
- `voice.ttsOk`: Voice-specific TTS check

---

## 4) Production Build Verification

### Build and Start Production Server
```bash
npm run build
npm run start
```

### Production Checklist

✅ **Build Succeeds**: No TypeScript errors, all routes compile  
✅ **Production Server Starts**: `npm run start` launches without errors  
✅ **Static Assets Load**: CSS, JS bundles served correctly  
✅ **API Routes Work**: `/api/health`, `/api/voice/health` return JSON  
✅ **Footer Status**: Shows correct mode and health badge  

---

## 5) Pre-Deployment

### Tag Release (Optional)
```bash
git tag webui-launch-v2025.10.07
git push origin webui-launch-v2025.10.07
```

### Environment Variable Audit
- [ ] `OPENAI_API_KEY` set (if using OpenAI)
- [ ] `OLLAMA_BASE` or `OPENWEBUI_BASE` reachable
- [ ] `NEXT_PUBLIC_LIVE_BASE` configured (production only)
- [ ] `NEXT_PUBLIC_PROVIDER` matches deployment target
- [ ] No `.env.local` committed to git (verify `.gitignore`)

---

## 6) Handoff & Push

### Stage and Commit Changes
```bash
# Stage all pending changes
git add -A

# Commit with descriptive message
git commit -m "chore(webui): launch readiness v2025.10.07"
```

### Robust Push (HTTP/2 Workaround + Retries)
```bash
# Push to main branch (default)
npm run push:robust

# Push to different branch
npm run push:robust -- -Branch develop

# Custom retry count
npm run push:robust -- -Branch main -Retries 5
```

**What the script does**:
- Configures git HTTP settings (HTTP/1.1, 500MB buffer)
- Attempts push with exponential backoff (2s, 4s, 8s)
- Prints diagnostics if all retries fail (remote URLs, config, status)

### CI Line Ending Issues

If CI fails with line ending errors:

1. Ensure `.gitattributes` exists with LF normalization (see below)
2. Re-normalize existing files:
   ```bash
   git rm --cached -r .
   git reset --hard
   ```
3. Re-commit and push:
   ```bash
   git add -A
   git commit -m "chore: normalize line endings"
   npm run push:robust
   ```

---

## 7) Rollback Procedure

### Emergency Rollback

#### Option 1: Provider Switch
```bash
# In .env.local, change:
NEXT_PUBLIC_PROVIDER=Ollama
NEXT_PUBLIC_LIVE_BASE=
```

#### Option 2: Git Revert
```bash
# Remove tag
git tag -d webui-launch-v2025.10.07

# Revert last commit
git revert HEAD

# Or hard reset to previous state
git reset --hard <pre-launch-sha>
git push origin main --force  # Use with caution
```

#### Option 3: Docker Restart (if using containers)
```bash
docker-compose down
docker-compose up -d
```

---

## 8) Common Issues

### Footer Shows "ERR"

**Cause**: LLM or TTS endpoint unreachable

**Fix**:
1. Verify `OLLAMA_BASE`/`OPENWEBUI_BASE` is running:
   ```bash
   curl http://localhost:11434/api/version
   ```
2. Check `NEXT_PUBLIC_LIVE_BASE` (if configured):
   ```bash
   curl http://localhost:4000/v1/audio/tts/stream -I
   ```
3. Check browser console for fetch errors

### Voice Loop Not Working

**Cause**: `NEXT_PUBLIC_VOICE_LOOP` not set or LLM unreachable

**Fix**:
1. Set `NEXT_PUBLIC_VOICE_LOOP=1` in `.env.local`
2. Restart dev server: `npm run dev`
3. Verify health pill shows "OK" in VoiceBar

### Provider Switch Has No Effect

**Cause**: Environment variable not recognized (requires server restart)

**Fix**:
```bash
# Stop dev server (Ctrl+C)
npm run dev   # Restart to pick up .env.local changes
```

---

## 9) Success Criteria

✅ Development server runs without errors  
✅ Footer badge shows "Mediated • OpenAIResponses (Universe) • OK"  
✅ `/api/health` returns healthy status (200 OK)  
✅ Chat messages stream correctly with selected provider  
✅ Voice loop (if enabled) cycles through phases correctly  
✅ Production build completes successfully  
✅ No console errors in browser DevTools  
✅ `npm run push:robust` successfully pushes to remote  

---

**Last Updated**: 2025.10.07  
**Owner**: Web-UI Launch Readiness + Push Hardening Task
