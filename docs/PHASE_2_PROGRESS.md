# Phase-2 Progress Log

Generated from guard docs in `apps/web-ui/app/(checks)`.

## Checklist Summary

### other
- ✅ [.agent-status-guard.md](#agent-status-guardmd) — _2025-09-30 20:11:59_
- ✅ [.context-guard.md](#context-guardmd) — _2025-09-28 06:07:38_
- ✅ [.context-pill-guard.md](#context-pill-guardmd) — _2025-09-30 20:27:26_
- ✅ [.data-model-guard.md](#data-model-guardmd) — _2025-09-29 14:37:04_
- ✅ [.guard-readme.md](#guard-readmemd) — _2025-09-27 13:35:25_
- ✅ [.help-overlay-guard.md](#help-overlay-guardmd) — _2025-09-30 20:56:46_
- ✅ [.hint-palette-guard.md](#hint-palette-guardmd) — _2025-10-03 02:58:40_
- ✅ [.left-rail-guard.md](#left-rail-guardmd) — _2025-09-29 14:09:31_
- ✅ [.mcp-selector-guard.md](#mcp-selector-guardmd) — _2025-10-03 13:08:26_
- ✅ [.onboarding-guard.md](#onboarding-guardmd) — _2025-09-28 08:59:28_
- ✅ [.pane-style-guard.md](#pane-style-guardmd) — _2025-09-29 17:55:15_
- ✅ [.port-guard.md](#port-guardmd) — _2025-09-30 21:33:42_
- ✅ [.right-rail-guard.md](#right-rail-guardmd) — _2025-09-29 15:53:31_
- ✅ [.seccomms-guard.md](#seccomms-guardmd) — _2025-09-28 10:48:43_
- ✅ [.seccomms-pill-guard.md](#seccomms-pill-guardmd) — _2025-09-30 22:06:33_
- ✅ [.three-pane-grid-guard.md](#three-pane-grid-guardmd) — _2025-09-29 17:09:44_
- ✅ [.threepane-guard.md](#threepane-guardmd) — _2025-09-29 03:45:13_
- ✅ [.ui-header-guard.md](#ui-header-guardmd) — _2025-09-29 14:01:43_
- ✅ [.voice-io-guard.md](#voice-io-guardmd) — _2025-10-03 15:24:50_

### audit
- ✅ [.audit-footer-guard.md](#audit-footer-guardmd) — _2025-09-30 20:18:45_
- ✅ [.audit-sink-guard.md](#audit-sink-guardmd) — _2025-09-30 22:31:07_
- ✅ [.audit-tail-guard.md](#audit-tail-guardmd) — _2025-10-03 01:28:55_

### bmad
- ✅ [.bmad-dock-guard.md](#bmad-dock-guardmd) — _2025-10-01 21:47:44_

### chat
- ✅ [.chat-adapter-guard.md](#chat-adapter-guardmd) — _2025-10-01 22:27:44_
- ✅ [.chat-archon-wire-guard.md](#chat-archon-wire-guardmd) — _2025-10-02 18:55:16_
- ✅ [.chat-contract-guard.md](#chat-contract-guardmd) — _2025-10-02 19:21:59_
- ✅ [.chat-export-pin-guard.md](#chat-export-pin-guardmd) — _2025-10-02 17:56:06_
- ✅ [.chat-hotkeys-guard.md](#chat-hotkeys-guardmd) — _2025-10-02 21:07:05_
- ✅ [.chat-resilience-guard.md](#chat-resilience-guardmd) — _2025-10-02 00:01:37_
- ✅ [.chat-sequencer-guard.md](#chat-sequencer-guardmd) — _2025-10-01 22:14:46_
- ✅ [.chat-stream-guard.md](#chat-stream-guardmd) — _2025-10-01 23:19:22_
- ✅ [.chat-style-guard.md](#chat-style-guardmd) — _2025-09-29 14:13:26_

### sec
- ✅ [.sec-gate-guard.md](#sec-gate-guardmd) — _2025-10-02 04:10:48_

---

## .agent-status-guard.md

# AgentStatus Guard (Phase-1)

Expect to find:

- `components/AgentStatus.tsx`
- `<AgentStatus mode="Mediated" agentLabel="OpenAI [ext]" />` in `RightPane.tsx`
- `.agent-status` styles in `globals.css`


## .audit-footer-guard.md

# Audit Footer Guard (Phase-1)

Expect:

- `components/AuditFooter.tsx`
- `<AuditFooter mode="Mediated" />` mounted from `app/layout.tsx`
- `.audit-footer` styles present in `globals.css`

Phase-2: bind to provider/session; add audit sink logging.


## .audit-sink-guard.md

# Mini Audit Sink Guard (Phase-1)

Expect:

- `components/AuditSink.tsx` (client) mounted from `app/layout.tsx`
- Styles for `.audit-tray/*` present in `globals.css`
- Global shim `window.os1Audit.log(type, data)` dispatches `os1:audit` CustomEvent


## .audit-tail-guard.md

# Audit Tail Viewer Guard

Expect:

- A "Tail" control in right-rail header toggles a panel showing `/v1/audit/tail?limit=50` (selectable).
- Panel polls ~5s while open; manual Refresh works; keyboard hint Alt+A visible via hints.
- No impact to existing AuditSink; layout remains tidy.


## .bmad-dock-guard.md

﻿# BMAD Dock Guard

Expect:

- `components/BmadDock.tsx` with localStorage autosave, tags, notes, hypotheses checklist
- Export to markdown button present; emits `bmad-export` audit event
- Dock toggle emits `bmad-toggle`; reset emits `bmad-reset`
- Styles for `.bmad-*` exist in `globals.css`; dock visible top-left


## .chat-adapter-guard.md

﻿# Chat Adapter Guard (Phase-2b)

Expect:

- `lib/chatClient.ts` exposes `sendChat(payload)` preferring ARCHON then falling back to local `/api/echo`.
- `ChatSequencer` persists history (cap 50), adds Clear, and logs transport in audit.
- `.env.example` declares `NEXT_PUBLIC_ARCHON_URL` and `NEXT_PUBLIC_ARCHON_CHAT_PATH`.
- `/api/archon-proxy` returns 503 JSON `{ error: "archon_unavailable" }` when ARCHON is offline.


## .chat-archon-wire-guard.md

# ARCHON Wiring Guard (Phase-2g)

Expect:

- `.env.example` points to `/v1/chat` and `/v1/chat/stream` routes.
- `chatClient.sendViaArchon()` normalizes responses to `{id,text,ts,provider}`.
- `chatClient.streamChat()` maps SSE `data:` chunks (delta/content/text, done, provider) with local NDJSON fallback intact.
- `ChatSequencer` logs `provider` alongside `transport` for stream audits.


## .chat-contract-guard.md

# Chat Contract Guard
Expect UI/adapter to accept fields defined in `/contracts/chat.v1.md`:
- Sync: maps `{id,text,ts,provider}`
- Stream: consumes `{delta|content|text, done, provider}`
Changes to contract require PR touching `/contracts/chat.v1.md` first.


## .chat-export-pin-guard.md

﻿# Transcript Export & BMAD Pin Guard

Expect:

- `AuditSink` shows Export .md/.json buttons; downloads succeed and log `chat-export`.
- `ChatSequencer` exposes `window.os1Chat.getHistory()` and injects the system preface from `os1.chat.systemPreface` once per session.
- `BmadDock` includes “Pin -> System” that writes `os1.chat.systemPreface` and emits `bmad-pin`.


## .chat-hotkeys-guard.md

# Chat Hotkeys Guard

Expect:

- Ctrl/⌘+Enter sends.
- Esc cancels streaming.
- Ctrl/⌘+L clears history and logs `chat-clear`.


## .chat-resilience-guard.md

﻿# Chat Resilience Guard

Expect:

- Cancel button aborts streaming via AbortController and emits `chat-stream` phase `cancel`.
- Inline error banner surfaces on failures; Retry clears the error and replays the last prompt.
- Right-rail header shows `NetStatus` dot that pings ARCHON `/health` roughly every 8s.
- Audit coverage includes `start`, `end`, `error`, `cancel`, and `retry` metadata.


## .chat-sequencer-guard.md

﻿# Chat Sequencer Guard (Phase-2a)

Expect:

- `app/api/echo/route.ts` (Edge) accepts POST {text} and returns {id, role:'assistant', text, ts}.
- `components/ChatSequencer.tsx` renders messages + drives composer; Enter-to-send works.
- `app/layout.tsx` mounts `<ChatSequencer />` inside `.main-card`.
- Minimal bubble styles exist in `globals.css`.
  Manual test: type in composer → UI shows user then assistant "echo: ...".


## .chat-stream-guard.md

﻿# Chat Streaming Guard (Phase-2c)

Expect:

- `lib/chatClient.ts` exposes `streamChat()` that prefers ARCHON (`NEXT_PUBLIC_ARCHON_STREAM_PATH`) and falls back to `/api/echo-stream`.
- `ChatSequencer` shows typing indicator, streams tokens progressively, and logs `chat-stream` start/end (with duration).
- Typing dot styles exist in `globals.css`.
- Manual: message streams token-by-token; disable ARCHON to confirm local fallback.


## .chat-style-guard.md

MessageList aligns (user right, assistant left); composer multiline with Enter send, Shift+Enter newline.


## .context-guard.md

This file indicates that Context Visibility pill and /api/context stub are present.
Used by verify scripts in Phase-1.


## .context-pill-guard.md

# Context Pill Guard (Phase-1)

Expect:

- `components/ContextPill.tsx` (client component with stub data + modal)
- `<ContextPill />` rendered in `RightPane` header beside AgentStatus
- Modal/backdrop styles present in `globals.css`

Phase-2: replace stub with provider/session-backed injected context (read-only).


## .data-model-guard.md

Data model + event stubs present. Telemetry + error states minimal. Ready for Phase-2 wiring.


## .guard-readme.md

This placeholder marks completion of Phase-1 step: Agent Toolbar Finalization.
Used by verify scripts to assert presence; no runtime code.


## .help-overlay-guard.md

# Help Overlay Guard (Phase-1)

Expect:

- `components/HelpOverlay.tsx` (client) with 3 slides: Quick Switch, Direct vs Mediated, Quick Test.
- `<HelpOverlay />` rendered next to AgentStatus + Context in right-rail header.
- Styles for `.help-pill`, `.modal-body`, `.modal-foot`, `.modal-dots`, `.dot`.

Phase-2: connect content to live features; add link outs to docs/policy.


## .hint-palette-guard.md

# Hint Palette Guard

Expect:

- `hint_palette` read from `/v1/prefs` and polled; `cb_safe` switches hints to a blue→orange ramp.
- Right-rail **Palette** toggle flips between `normal` and `cb_safe` and POSTs to `/v1/prefs`.
- Works with keyboard (Alt+P) and appears in audit tail (via toast/audit if configured).


## .left-rail-guard.md

LeftRail sections present: Primary Nav, Agents, Channels/History.


## .mcp-selector-guard.md

# MCP Selector Guard

## Feature
Session-level MCP (Model Context Protocol) multi-select component that persists enabled MCPs to `/v1/prefs` and logs changes to audit trail.

## Expect to find

- `components/SessionControls.tsx` - React component with chip-based multi-select UI
- `lib/prefs.ts` - Utility module for reading/writing preferences including `mcp_enabled: string[]`
- `.mcp-selector-*` CSS classes in `globals.css` for chip styling
- Integration in main layout (e.g., `app/layout.tsx` or toolbar area)

## Behavior

1. **Selection**: Click MCP chips to toggle enable/disable state
2. **Persistence**: Changes POST to `/v1/prefs` with updated `mcp_enabled` array
3. **Audit**: Each change logs `mcp-change` event via `window.os1Audit.log()` with action, mcp ID, and enabled list
4. **Reload**: Preferences survive page reload via server-side persistence
5. **Polling**: Component polls `/v1/prefs` every 15s to sync with external changes

## Available MCPs

Phase-1 hardcoded list:
- `filesystem` - Filesystem operations
- `git` - Git repository access
- `web` - Web search capabilities
- `database` - Database queries
- `docker` - Docker container management

Phase-2+: Dynamic discovery from backend

## API Contract

### GET /v1/prefs
Returns: `{ mcp_enabled?: string[], hints_enabled?: boolean, ... }`

### POST /v1/prefs
Accepts: `{ mcp_enabled?: string[] }` (partial update)

### Audit Event
```json
{
  "type": "mcp-change",
  "data": {
    "action": "added" | "removed" | "failed",
    "mcp": "filesystem",
    "enabled": ["filesystem", "git"]
  }
}
```

## Integration Points

- Uses `lib/prefs.ts` for API calls
- Logs via global `window.os1Audit` sink
- Styled with `.mcp-chip`, `.mcp-chip-selected`, `.mcp-chip-unselected` classes
- Accessible with ARIA labels and `aria-pressed` states

## Phase-1 Limitations

- Fixed MCP list (no backend discovery)
- No validation of MCP availability
- No error UI for failed persistence (logs to audit only)


## .onboarding-guard.md

Guard marker: Onboarding overlay (3 slides) mounted with Help reopen.


## .pane-style-guard.md

# Phase-1 Pane Style Guard

Confirms presence of:

- `.left-rail` with background + border
- `.main-card` wrapping center content
- `.composer` pinned to bottom of center

Scripts may grep these class names to verify style hooks.


## .port-guard.md

# Dev Port Guard

Expect:

- `scripts/killPort.cjs` present
- `package.json` has `predev` that invokes the guard
- `npm run dev` frees :4000 on Windows before launching


## .right-rail-guard.md

Right Rail groups controls into Files, Values, Advanced panels; placeholders acceptable in Phase-1.


## .sec-gate-guard.md

﻿# SEC-COMMS Gate Guard

Expect:

- `.env.example` includes `NEXT_PUBLIC_DIRECT_DISABLED` (bool).
- `SecCommsPill` persists `os1.seccomms.ack` and logs `sec-ack-toggle`.
- `ChatSequencer` blocks Direct mode without ack, honors `NEXT_PUBLIC_DIRECT_DISABLED`, emits `sec-gate` (blocked/allowed).
- After acknowledgment, Direct sends proceed (policy permitting).


## .seccomms-guard.md

Guard marker: SEC-COMMS placeholder pill mounted (Phase-1).


## .seccomms-pill-guard.md

﻿# SEC-COMMS Pill Guard (Phase-1)

Expect:

- `components/SecCommsPill.tsx` (client) renders pill + modal with bullets.
- `<SecCommsPill />` present in right-rail header next to other pills.
- Styles for `.sec-pill` and `.policy-list` exist in `globals.css`.
  Notes: Phase-1 is UI-only; Phase-2 will connect provider state and audit sink.


## .three-pane-grid-guard.md

3-pane grid active (sticky rails): 280 / 1fr / 360. LeftNav = col 1, Chat = col 2, RightPane = col 3. Cards styled.


## .threepane-guard.md

Guard: three-pane skeleton present. Align with designs in D:\OS_One\kb\design\ui_ux\drafts


## .ui-header-guard.md

Spec: AppHeader present; grid locked (L=280,R=360).


## .voice-io-guard.md

# Voice I/O Guard

## Feature
Voice input with automatic transcription and Text-to-Speech (TTS) playback for assistant replies.

## Expect to find

- `components/VoiceControls.tsx` - Mic recording + TTS toggle UI component
- `app/api/transcribe/route.ts` - Edge proxy for audio transcription (forwards to Archon `/v1/audio/transcribe`)
- `app/api/tts/route.ts` - Edge proxy for TTS synthesis (forwards to Archon `/v1/audio/tts`)
- `components/ChatSequencer.tsx` - Integrated VoiceControls and TTS playback logic
- `.voice-ctrls`, `.voice-mic-btn`, `.voice-tts-btn` CSS classes in `globals.css`

## Behavior

### Voice Input Flow
1. **Start Recording**: Click mic button or press `Alt+M`
   - Requests microphone permission (browser prompt on first use)
   - Starts MediaRecorder with `audio/webm;codecs=opus` (or fallback `audio/webm`)
   - Shows pulsing red dot indicator during recording
   - Logs `voice-start` audit event

2. **Stop Recording**: Click mic button again or press `Alt+M`
   - Stops MediaRecorder and mic stream
   - Shows "Transcribing..." state
   - Logs `voice-stop` audit event

3. **Transcription**: Automatically sends audio to `/api/transcribe`
   - Edge proxy forwards FormData to Archon `/v1/audio/transcribe`
   - On success: injects text into composer and auto-sends message
   - Logs `voice-transcribe-ok` with text length
   - On failure: logs `voice-transcribe-err` with error details

### TTS Playback Flow
1. **Enable TTS**: Click TTS button (🔊) or press `Alt+Shift+P`
   - Toggles TTS playback for assistant replies
   - Preference saved to `localStorage` (`os1.voice.tts_enabled`)
   - Logs `voice-tts-toggle` audit event

2. **Automatic Playback**: When assistant reply completes
   - Checks if TTS is enabled via `window.os1Voice.isTtsEnabled()`
   - POSTs reply text to `/api/tts`
   - Edge proxy forwards to Archon `/v1/audio/tts`
   - Plays audio stream via `HTMLAudioElement`
   - Logs `chat-tts` audit event with status

## Microphone Permission Flow

### First Use
- Browser shows permission prompt when user clicks mic button
- If **Allowed**: Recording starts immediately
- If **Denied**: Shows red error message "Microphone permission denied"

### Retry After Denial
- User must grant permission via browser settings
- Click mic button again to retry
- Error clears automatically on successful permission grant

### Permission States
- **NotAllowedError**: User denied permission → shows error, logs `voice-start` with `permission_denied`
- **NotFoundError**: No microphone found → logged as error
- **NotReadableError**: Microphone in use by another app → logged as error

## Audit Events

### Voice Input
```json
{"type": "voice-start", "data": {"mimeType": "audio/webm;codecs=opus"}}
{"type": "voice-start", "data": {"error": "permission_denied"}}
{"type": "voice-stop", "data": {}}
{"type": "voice-transcribe-ok", "data": {"length": 42}}
{"type": "voice-transcribe-err", "data": {"error": "network_error", "reason": "empty_result"}}
```

### TTS Playback
```json
{"type": "voice-tts-toggle", "data": {"enabled": true}}
{"type": "chat-tts", "data": {"length": 156, "status": "playing"}}
{"type": "chat-tts", "data": {"error": "fetch_failed", "status": 503}}
{"type": "chat-tts", "data": {"error": "playback_failed"}}
```

## Keyboard Shortcuts

- **Alt+M**: Toggle voice recording (start/stop)
- **Alt+Shift+P**: Toggle TTS playback on replies

## API Contract

### POST /api/transcribe
**Request**: `FormData` with `file` (Blob, WebM audio)  
**Response**: `{ text: string }` or `{ error: string }`  
**Forwards to**: Archon `/v1/audio/transcribe`

### POST /api/tts
**Request**: `{ text: string, voice_id?: string }`  
**Response**: `audio/mpeg` stream or `{ error: string }`  
**Forwards to**: Archon `/v1/audio/tts`

## Integration Points

### Global State
- `window.os1Voice.isTtsEnabled()` - Returns current TTS preference (called by ChatSequencer)
- `window.os1Audit.log(type, data)` - Audit logging (used by VoiceControls and ChatSequencer)

### ChatSequencer Integration
- `onTranscriptReady` callback: Receives transcription text, sets draft, and auto-sends
- `playTtsIfEnabled()`: Called after assistant reply completes, checks TTS preference, fetches and plays audio

### Storage
- `localStorage['os1.voice.tts_enabled']` - TTS preference (`'1'` = enabled, absent/`'0'` = disabled)

## Phase-1 Limitations

- **No voice selection**: Uses default Archon/ElevenLabs voice
- **No audio queue**: Only one TTS plays at a time (new audio cancels previous)
- **No visual feedback**: No waveform or audio progress indicator
- **No retry UI**: Transcription errors only logged to audit, not shown to user
- **No offline fallback**: Requires Archon connectivity for both transcription and TTS
- **No streaming TTS**: Waits for full audio before playback starts

## Phase-2+ Enhancements

- Voice selection dropdown (multiple ElevenLabs voices)
- Visual waveform during recording
- Transcription error toast notifications
- Audio playback progress bar
- Stop/pause TTS controls
- Streaming TTS with chunked playback
- Offline voice input with browser SpeechRecognition API fallback
- Language selection for transcription


