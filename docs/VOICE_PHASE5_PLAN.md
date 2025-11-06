# Voice Phase 5 — Real Actions (Bootstrap)

**Date**: 2025.10.07  
**Status**: Complete  
**Dependencies**: Voice Phase 3 (reasoning loop), Phase 4 (intent classification + stability)

---

## Scope

Voice Phase 5 maps classified intents to **real, executable actions** that modify application state or trigger UI events. This phase transitions from no-op API stubs to local action execution.

### Implemented Actions

1. **`overwatch.pause`**
   - Pauses Overwatch monitoring
   - Sets `overwatchStore.active = false`
   - UI feedback: "Overwatch paused"

2. **`overwatch.resume`**
   - Resumes Overwatch monitoring
   - Sets `overwatchStore.active = true`
   - UI feedback: "Overwatch resumed"

3. **`open.settings`**
   - Emits `os1:open-settings` custom event
   - UI components can listen to open settings panel
   - Event detail includes original transcript for context

---

## Architecture

### New Components

**`apps/web-ui/store/overwatch.ts`**
- Lightweight React hook-based state store (zero dependencies)
- Singleton pattern with subscriber notifications
- Exports: `useOverwatch()` hook, `overwatchStore` for direct access

**`apps/web-ui/lib/voice/actions.ts`**
- `performVoiceAction(intent, transcript)` - Maps intents to local functions
- Returns `ActionResult { ok: boolean, uiHint?: string }`
- Runs synchronously (no API calls)

### Modified Components

**`apps/web-ui/src/components/VoiceLoop.tsx`**
- Removed dependency on `/api/voice/act` route
- Calls `performVoiceAction()` directly
- If action succeeds (`ok: true`), skips LLM reasoning
- Falls back to LLM reasoning if action not found or fails

**`apps/web-ui/src/components/VoiceBar.tsx`**
- Added Overwatch status pill (green="Active", purple="Paused")
- Positioned before Phase indicator
- Uses `useOverwatch()` hook for reactive updates

---

## Verification

### Test Procedure

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Enable Voice Loop**
   - Navigate to UI
   - Toggle "Voice Loop" checkbox ON
   - Verify status pills appear

3. **Test Pause Action**
   - Speak or type: "pause overwatch"
   - Expected: Overwatch pill changes to purple "Overwatch: Paused"
   - Expected: Reply shows "Overwatch paused"

4. **Test Resume Action**
   - Speak or type: "resume overwatch"
   - Expected: Overwatch pill changes to green "Overwatch: Active"
   - Expected: Reply shows "Overwatch resumed"

5. **Test Settings Action**
   - Speak or type: "open settings"
   - Expected: Console shows `os1:open-settings` event fired
   - Expected: Reply shows "Opening settings"
   - Note: Actual settings panel requires listener implementation

6. **Test Fallback**
   - Speak or type: "what is the weather?"
   - Expected: No action executed (intent='none')
   - Expected: Falls back to DeepSeek-R1 reasoning

### Success Criteria

✅ Overwatch status pill visible when Voice Loop enabled  
✅ "pause overwatch" → pill turns purple  
✅ "resume overwatch" → pill turns green  
✅ "open settings" → `os1:open-settings` event emitted  
✅ Non-action intents → fall back to LLM reasoning  
✅ No console errors  

---

## Integration Points

### Listen for Settings Event

To hook the settings panel:

```typescript
useEffect(() => {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    console.log('Open settings requested:', detail.transcript);
    // Your settings panel logic here
    setSettingsOpen(true);
  };
  
  window.addEventListener('os1:open-settings', handler);
  return () => window.removeEventListener('os1:open-settings', handler);
}, []);
```

### Access Overwatch State

From any component:

```typescript
import { useOverwatch } from '@/apps/web-ui/store/overwatch';

function MyComponent() {
  const { active, pause, resume } = useOverwatch();
  
  return (
    <div>
      <button onClick={pause}>Pause Monitoring</button>
      <button onClick={resume}>Resume Monitoring</button>
      <p>Status: {active ? 'Active' : 'Paused'}</p>
    </div>
  );
}
```

---

## Next Steps (Phase 6)

### 1. Action Audit Log
- Log all executed actions with timestamps
- Show recent actions in DevHUD
- Persist to local storage for debugging

### 2. Confirmation Prompts
- Add optional confirmation for destructive actions
- "Are you sure you want to pause Overwatch?"
- Configurable per-action in actions.ts

### 3. Multi-Turn Follow-Ups
- Support conversational action chaining
- "Pause Overwatch and open settings"
- Context-aware intent detection

### 4. Additional Actions
- `agent.switch` - Switch between AI providers
- `voice.mute` - Mute TTS output
- `session.clear` - Clear chat history
- `theme.toggle` - Toggle dark/light mode

### 5. Action Parameters
- Extract entities from transcript
- "Set timer for 5 minutes"
- "Switch to Claude provider"

### 6. Error Recovery
- Retry failed actions
- Undo/rollback mechanism
- User feedback for failures

---

## Technical Notes

### Why No Zustand?

Originally specified Zustand but implemented zero-dependency React hook pattern for consistency with existing codebase (`voiceLoop.ts` uses same pattern). Avoids adding new dependencies.

### Performance

- Action execution is synchronous and instant
- No network latency (unlike Phase 4 API route)
- UI updates are reactive via React hooks
- Minimal overhead (~200 bytes per action)

### CRLF Safety

All files use LF line endings per `.gitattributes`
PowerShell scripts excluded (use CRLF)

---

**Last Updated**: 2025.10.07  
**Owner**: Voice Phase 5 Real Actions Bootstrap Task  
**Next Review**: After Phase 6 planning
