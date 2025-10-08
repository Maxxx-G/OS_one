# Voice Phase 3 — Quick Start (Local Reasoning Loop)

## Overview
Voice Phase 3 integrates a live reasoning loop powered by **DeepSeek-R1:8B** (or compatible local LLMs) running via Ollama or Open-WebUI. The feature is guarded by the `NEXT_PUBLIC_VOICE_LOOP` flag for safe rollout.

## Environment Setup

Add the following to your `.env.local` file in `apps/web-ui/`:

```bash
# Enable Voice Loop Feature
NEXT_PUBLIC_VOICE_LOOP=1

# Local LLM Base URL (choose one)
OLLAMA_BASE=http://localhost:11434
# OR: OPENWEBUI_BASE=http://localhost:3000

# Model Name (default: deepseek-r1:8b)
DEEPSEEK_MODEL=deepseek-r1:8b

# Optional: Enable TTS Stream
# NEXT_PUBLIC_TTS_STREAM=1
```

## Testing Instructions

### 1. Start Local LLM
Ensure Ollama or Open-WebUI is running with the DeepSeek-R1 model loaded:

```bash
# For Ollama
ollama run deepseek-r1:8b
```

### 2. Restart Dev Server
```bash
cd apps/web-ui
npm run dev
```

### 3. Test Voice Loop
1. Open UI at `http://localhost:4000`
2. Look for **Voice Loop** toggle in the VoiceBar
3. Hover over the toggle to see model name in tooltip: `Voice Loop • Model: deepseek-r1:8b`
4. Toggle **Voice Loop: ON**
5. Speak or type a short transcript
6. Watch phase transitions: **idle → thinking → speaking → idle**
7. Verify reply text appears

### 4. Test Graceful Degradation
1. Stop Ollama/Open-WebUI OR remove `OLLAMA_BASE`/`OPENWEBUI_BASE` from env
2. Restart dev server
3. Toggle Voice Loop ON and attempt to use it
4. **Expected behavior:**
   - API returns `503 Service Unavailable` with `llm_unavailable` error
   - UI shows `Phase: error` (red pill)
   - Application remains stable (no crash)

### 5. Optional: Test TTS Stream
```bash
# Add to .env.local
NEXT_PUBLIC_TTS_STREAM=1
```
1. Restart dev server
2. Enable Voice Loop
3. Speak a command
4. Verify audio playback via existing `/api/tts/stream` route

## Architecture

### Files Created
- `apps/web-ui/app/api/voice/reason/route.ts` - Edge API route for DeepSeek reasoning
- `apps/web-ui/lib/voice/intent.ts` - Intent classifier for voice commands
- `apps/web-ui/src/state/voiceLoop.ts` - React hook-based state store
- `apps/web-ui/src/components/VoiceLoop.tsx` - Orchestrator component
- `apps/web-ui/src/components/VoiceBar.tsx` - Updated with Voice Loop toggle

### API Endpoint
- **Route:** `POST /api/voice/reason`
- **Request Body:**
  ```json
  {
    "transcript": "string",
    "intent": "string (optional)"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "ok": true,
    "thought": "string",
    "reply": "string"
  }
  ```
- **Error Response (503/502):**
  ```json
  {
    "ok": false,
    "error": "llm_unavailable | llm_bad_gateway | bad_request"
  }
  ```

### Voice Phases
- `idle` - No activity
- `listening` - Capturing voice input
- `thinking` - LLM processing request
- `speaking` - TTS audio playback (if enabled)
- `error` - Error state (LLM unavailable, network issue, etc.)

## Troubleshooting

### Voice Loop toggle not visible
- Ensure `NEXT_PUBLIC_VOICE_LOOP=1` is set in `.env.local`
- Restart dev server after changing env vars

### API returns 503 error
- Verify local LLM is running: `curl http://localhost:11434/api/tags` (Ollama)
- Check `OLLAMA_BASE` or `OPENWEBUI_BASE` URL is correct
- Ensure model is loaded: `ollama list` should show `deepseek-r1:8b`

### Phase stuck on "thinking"
- Check browser console for network errors
- Verify `/api/voice/reason` endpoint is accessible
- Check local LLM logs for processing errors

### Model name not showing in tooltip
- Hover over the **Voice Loop** toggle area (not the phase label)
- Tooltip format: `Voice Loop • Model: {DEEPSEEK_MODEL}`

## Abort Condition
If your local LLM surface requires a different endpoint than `/api/generate`, you must adjust the endpoint in `apps/web-ui/app/api/voice/reason/route.ts` before merging:

```typescript
// Line 22
const endpoint = `${trimBase(base)}/api/generate`; // Change if needed
```

## Next Steps
- **Phase 4:** Intent-based command routing (pause/resume Overwatch, open settings, etc.)
- **Phase 5:** Multi-turn conversation context
- **Phase 6:** Voice activity detection (VAD) for hands-free operation
