# OS1 — Overwatch Governance Onboarding · v2025.10.23

X-Tier1: user  
X-Agent: copilot  
X-Domain: os1p4  
X-Purpose: overwatch-governance-onboarding  
X-Version: v2025.10.23  
X-STB-ID: user.copilot.os1p4.overwatch-governance-onboarding.v2025.10.23  
X-Template: stb/1.0  
X-Policy: overwatch/1.0  
X-MaxFiles: 5  
X-Notes: Sentience+Legacy onboarding; voice & hotkey controls; backend-mode switching via Overwatch; audio boot; SEC-COMMS

---

## 🎯 Objectives
- Establish **Overwatch** as the invisible control plane superimposed on WebUI, revealed only by hotkey/voice
- Deliver **two onboarding paths**: Sentience (hands-free voice) and Legacy (classic forms)
- Centralize **backend mode** control (mock/local/external) inside Overwatch (voice + switches), not .env files
- Provide **auditory cues** (boot chime, ready tone) and ensure SEC-COMMS initializes at startup

---

## ⚙️ Constraints
- Windows PowerShell 5.1 compatible scripts only; no external modules
- ≤ 5 files changed
- No secrets in repo; all secrets injected per-process (CredMan / `dev:secure`)
- UI must remain usable when Overwatch UI is hidden (no layout shift)

---

## 🧩 Tasks

### T1 — Overwatch Shell & Hotkeys
**File:** `apps/web-ui/app/chat/OverwatchPanel.tsx`

- Add hidden Overwatch layer (portal) that mounts over the app root; hidden by default
- **Hotkeys:**
  - `Ctrl+Alt+O` → Toggle Overwatch panel
  - `Alt+M` → Toggle mic (Sentience)
  - `Ctrl+Alt+G` → Gabriel Console quick toggle
- **Panel sections:** Modes, Comms, Audio, Guardian, Daemon
- Persist state in `localStorage.os1.overwatch.*`

**Key Features:**
```typescript
interface OverwatchState {
  visible: boolean;
  backendMode: "mock" | "local" | "external";
  secCommsActive: boolean;
  thetaDaemonActive: boolean;
  audioEnabled: boolean;
  micActive: boolean;
  selectedModel: string;
}
```

---

### T2 — Voice Intents (Sentience Path)
**File:** `apps/web-ui/lib/overwatch/voice-intents.ts`

- Map voice commands to actions:
  - **"Mock Off"** → `backendMode=local` (or external if configured)
  - **"Enable Local Mode"** → `local`
  - **"Enable External Inference"** → `external`
  - **"Open Overwatch"** / **"Close Overwatch"**
  - **"Start Gabriel"**, **"Status"**
- Route via SEC-COMMS-safe handler; never speak or log secrets

**Voice Command Grammar:**
```typescript
const VOICE_INTENTS = {
  "mock off": { action: "setBackendMode", params: { mode: "local" } },
  "enable local mode": { action: "setBackendMode", params: { mode: "local" } },
  "enable external inference": { action: "setBackendMode", params: { mode: "external" } },
  "open overwatch": { action: "toggleOverwatch", params: { visible: true } },
  "close overwatch": { action: "toggleOverwatch", params: { visible: false } },
  "start gabriel": { action: "activateGabriel" },
  "status": { action: "showStatus" }
};
```

---

### T3 — Legacy Controls (Switches)
**Implementation:** Within `OverwatchPanel.tsx`

- In Overwatch panel, add switches:
  - **Backend Mode:** Mock / Local (http://localhost:7700) / External
  - **Model selector (Gabriel):** `chatgpt5-preview | sonnet-4.5 | deepseek-r1:8b`
  - **SEC-COMMS:** Active/Paused
  - **θ-Daemon:** Active/Paused
- On save: emit readiness check (`/api/ready`) and show pill status

**UI Structure:**
```tsx
<OverwatchPanel visible={overwatchVisible}>
  <Section name="Backend Mode">
    <RadioGroup value={backendMode} onChange={handleModeChange}>
      <Radio value="mock">Mock (Testing)</Radio>
      <Radio value="local">Local (Archon:7700)</Radio>
      <Radio value="external">External (OpenAI/Anthropic)</Radio>
    </RadioGroup>
  </Section>
  
  <Section name="Model Selection">
    <Select value={model} onChange={handleModelChange}>
      <Option value="chatgpt5-preview">ChatGPT-5 Preview</Option>
      <Option value="sonnet-4.5">Claude Sonnet 4.5</Option>
      <Option value="deepseek-r1:8b">DeepSeek R1:8b</Option>
    </Select>
  </Section>
  
  <Section name="Services">
    <Toggle label="SEC-COMMS" checked={secComms} onChange={toggleSecComms} />
    <Toggle label="θ-Daemon" checked={thetaDaemon} onChange={toggleTheta} />
  </Section>
</OverwatchPanel>
```

---

### T4 — Audio Boot & Cues
**File:** `apps/web-ui/lib/overwatch/audio-boot.ts`

- On app mount:
  - Ambient loop fade-in (low volume)
  - Boot chime once SEC-COMMS + backend ready
  - "Gabriel Online" cue when θ-Daemon is active
- Respect a single **"Mute All"** master switch in Overwatch

**Audio Events:**
```typescript
enum AudioCue {
  BOOT_CHIME = "boot-chime",
  GABRIEL_ONLINE = "gabriel-online",
  MODE_CHANGE = "mode-change",
  ERROR = "error",
  AMBIENT_LOOP = "ambient-loop"
}

class AudioBootSystem {
  async initialize() {
    await this.playAmbientLoop();
    await this.waitForReady();
    await this.playBootChime();
    if (await this.isGabrielActive()) {
      await this.playGabrielOnline();
    }
  }
}
```

---

### T5 — Guardian Readiness & Telemetry
**File:** `apps/web-ui/app/api/ready/route.ts` (modify existing)

- Ensure `/api/ready` returns `{ ok, mode, provider, timestamp }` within 1200ms timeout
- On mode change, log `GUARDIAN_SUMMARY: MODE_CHANGE <from>→<to>; provider=<p>; ts=<iso>`
- Write NDJSON to `.logs/guardian-telemetry.json` (local only)

**API Response:**
```typescript
interface ReadyResponse {
  ok: boolean;
  mode: "mock" | "local" | "external";
  provider: string;
  timestamp: string;
  services: {
    secComms: boolean;
    thetaDaemon: boolean;
    archonApi: boolean;
  };
}
```

**Guardian Summary Format:**
```
GUARDIAN_SUMMARY: MODE_CHANGE mock→local; provider=archon-api; ts=2025-10-23T01:23:45.678Z
```

---

## ✅ Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| **A1** | Overwatch panel invisible until `Ctrl+Alt+O` or voice cue; no layout shift | Manual test: press hotkey, verify no page reflow |
| **A2** | "Mock Off" or toggle switch updates backend without page reload | Voice command → check network tab, chat works |
| **A3** | Boot audio plays once, "Gabriel Online" tone on θ-Daemon active | App mount → hear chimes in sequence |
| **A4** | `/api/ready` reflects mode changes within ≤2s; Ready pill updates | Change mode → curl endpoint → verify JSON |
| **A5** | No secrets printed; Guardian emits `GUARDIAN_SUMMARY` on mode changes | Check logs, browser console, network tab |
| **A6** | ≤5 files changed; WinPS 5.1 scripts run without external modules | `git diff --stat`, run scripts |

---

## 🔄 Rollback

1. **Disable Overwatch UI:**
   ```bash
   export OS1_OVERWATCH_UI=off
   npm run build
   ```

2. **Remove audio boot hook:**
   - Comment out `<AudioBootSystem />` in `page.tsx`

3. **Revert backend switching:**
   - Restore static `.env.local` mode configuration

4. **Delete telemetry logs:**
   ```powershell
   Remove-Item .logs/guardian-telemetry.json -Force
   ```

---

## 📝 Commit Message

```
feat(overwatch): add governance onboarding with voice+hotkey controls

BREAKING CHANGE: Backend mode now controlled via Overwatch UI/voice instead of .env

- Add OverwatchPanel.tsx with Ctrl+Alt+O hotkey toggle
- Implement voice-intents.ts for Sentience path ("Mock Off", "Enable Local Mode")
- Add audio-boot.ts system with boot chime + Gabriel Online cue
- Enhance /api/ready with mode/provider/services status
- Emit GUARDIAN_SUMMARY on mode changes to .logs/guardian-telemetry.json

Addresses: STB user.copilot.os1p4.overwatch-governance-onboarding.v2025.10.23
Files Changed: 5
- apps/web-ui/app/chat/OverwatchPanel.tsx (new)
- apps/web-ui/lib/overwatch/voice-intents.ts (new)
- apps/web-ui/lib/overwatch/audio-boot.ts (new)
- apps/web-ui/app/api/ready/route.ts (modified)
- apps/web-ui/app/chat/page.tsx (modified - mount Overwatch + Audio)

Co-authored-by: Gabriel <gabriel@os1.ai>
```

---

## 🎨 UI/UX Design

### Overwatch Panel Layout
```
┌─────────────────────────────────────────────────────────────┐
│ 🔭 OVERWATCH                                   [Ctrl+Alt+O] │
├─────────────────────────────────────────────────────────────┤
│ Backend Mode                                                │
│   ○ Mock (Testing)                                          │
│   ● Local (Archon:7700)                     [Status: 🟢]   │
│   ○ External (OpenAI/Anthropic)                             │
├─────────────────────────────────────────────────────────────┤
│ Model Selection (Gabriel)                                   │
│   [chatgpt5-preview ▼]                                      │
├─────────────────────────────────────────────────────────────┤
│ Services                                                     │
│   SEC-COMMS        [🟢 Active]                              │
│   θ-Daemon         [🟢 Active]                              │
│   Archon API       [🟢 Online]                              │
├─────────────────────────────────────────────────────────────┤
│ Audio                                                        │
│   🔊 Master Volume  [━━━━━━━━░░] 80%                        │
│   🎵 Ambient Loop   [ON]                                    │
│   🔇 Mute All       [OFF]                                   │
├─────────────────────────────────────────────────────────────┤
│ Voice (Sentience)                          [Alt+M]          │
│   🎤 Microphone     [⚫ Inactive]                            │
│   Last Command: "Enable Local Mode"                         │
├─────────────────────────────────────────────────────────────┤
│ Guardian                                                     │
│   Last Event: MODE_CHANGE mock→local                        │
│   Timestamp: 2025-10-23T01:23:45.678Z                       │
│   📊 View Telemetry                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Considerations

### Secrets Management
- ✅ **No API keys in localStorage** - Use SEC-COMMS encrypted session storage
- ✅ **Voice commands never echo secrets** - Intent parser sanitizes output
- ✅ **Telemetry logs exclude credentials** - Filter before NDJSON write
- ✅ **Overwatch state persisted without sensitive data** - Only mode/toggles

### Voice Command Security
```typescript
function sanitizeVoiceCommand(transcript: string): string {
  // Remove potential secret patterns
  const sanitized = transcript
    .replace(/\b[A-Z0-9]{32,}\b/g, "[REDACTED]") // API keys
    .replace(/sk-[a-zA-Z0-9]+/g, "[REDACTED]")   // OpenAI keys
    .replace(/\b[\w-]{36}\b/g, "[REDACTED]");    // UUIDs
  return sanitized;
}
```

---

## 🧪 Testing Strategy

### Manual Testing
1. **Hotkey Test:** Press `Ctrl+Alt+O` → Overwatch appears
2. **Voice Test:** Say "Mock Off" → Backend switches to local
3. **Audio Test:** Refresh page → Hear boot chime → Hear Gabriel Online
4. **Mode Switch Test:** Toggle radio buttons → Chat still works
5. **Guardian Test:** Change mode → Check `.logs/guardian-telemetry.json`

### Automated Testing (Future)
```typescript
describe("Overwatch System", () => {
  it("should toggle panel with Ctrl+Alt+O", () => {
    fireEvent.keyDown(document, { key: "o", ctrlKey: true, altKey: true });
    expect(screen.getByText("OVERWATCH")).toBeVisible();
  });

  it("should switch backend mode via voice", async () => {
    await voiceIntents.process("enable local mode");
    expect(getBackendMode()).toBe("local");
  });

  it("should emit guardian summary on mode change", async () => {
    await setBackendMode("local");
    const logs = await readTelemetryLogs();
    expect(logs).toContain("MODE_CHANGE");
  });
});
```

---

## 📊 Telemetry Schema

### NDJSON Format (`.logs/guardian-telemetry.json`)
```json
{"type":"mode_change","from":"mock","to":"local","provider":"archon-api","timestamp":"2025-10-23T01:23:45.678Z","trace_id":"os1-ω-a1b2c3d4"}
{"type":"audio_event","event":"boot_chime","duration_ms":250,"timestamp":"2025-10-23T01:23:46.123Z","trace_id":"os1-ω-e5f6g7h8"}
{"type":"service_status","service":"sec_comms","status":"active","timestamp":"2025-10-23T01:23:46.456Z","trace_id":"os1-ω-i9j0k1l2"}
{"type":"voice_command","intent":"setBackendMode","params":{"mode":"local"},"timestamp":"2025-10-23T01:23:47.789Z","trace_id":"os1-ω-m3n4o5p6"}
```

---

## 🚀 Implementation Priority

### Phase 1 (MVP - This STB)
- ✅ Overwatch panel with hotkeys
- ✅ Backend mode switching (UI only)
- ✅ Basic audio boot system
- ✅ Enhanced `/api/ready` endpoint
- ✅ Guardian telemetry logging

### Phase 2 (Future)
- Voice intent recognition (Web Speech API)
- Advanced audio cues (spatial audio, voice feedback)
- Real-time telemetry dashboard
- Multi-user Overwatch permissions
- Cloud telemetry sync

---

## 📚 Related Documents

- `user.copilot.os1p4.webui-user-setup.v2025.10.23.md` - Daily workflow guide
- `user.copilot.os1p4.webui-startup-checklist.v2025.10.22.md` - Health verification
- `user.copilot.os1p4.phase3-to-phase4-handover.v2025.10.22.md` - Phase 4 autonomics
- `user.copilot.os1p3.gabriel-model-access.v2025.10.21.md` - Multi-model routing
- `docs/OVERWATCH_HOTKEY.md` - Hotkey reference guide
- `docs/OVERWATCH_UI_FLOAT.md` - UI floating panel spec

---

**Document Status:** ✅ POLICY DEFINED  
**Implementation Status:** ⏳ PENDING  
**Last Updated:** 2025-10-23  
**Maintainer:** user.copilot  
**Phase:** os1p4 (δ-Autonomic + Ω-Overwatch)
