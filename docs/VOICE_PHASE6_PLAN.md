# Voice Phase 6 — Confirmations & Audit (Bootstrap)

**Status:** ✅ Implemented  
**Date:** 2025-10-07  
**Files Modified:** 5

---

## Overview

Phase 6 adds **confirmation prompts** for sensitive voice actions, an **in-app action audit log**, and scaffolding for future **multi-turn conversations**. All features are zero-dependency, event-driven, and feature-flag friendly.

---

## Scope

### 1. Action Log Micro-Store
- **File:** `apps/web-ui/lib/voice/actionLog.ts`
- **Purpose:** Append-only store with max 50 entries
- **Pattern:** Subscribe pattern for reactive UI updates
- **Entry Structure:**
  ```typescript
  {
    ts: number;           // Timestamp
    intent: string;       // Action intent (e.g., "overwatch.pause")
    transcript: string;   // User's spoken command
    result: 'ok' | 'cancel' | 'fail';
    note?: string;        // Optional UI hint or error message
  }
  ```

### 2. ConfirmCenter Component
- **File:** `apps/web-ui/src/components/ConfirmCenter.tsx`
- **Features:**
  - **Confirmation Modal:** Listens for `os1:confirm:request` events
  - **Action Log Panel:** Toggleable with `os1:actionlog:toggle` event
  - **Styling:** Inline modal with Cancel/Confirm buttons, fixed log panel
- **Events:**
  - `os1:confirm:request` → `{ id: string, message: string }`
  - `os1:confirm:result` → `{ id: string, ok: boolean }`
  - `os1:actionlog:toggle` → Toggles log panel visibility

### 3. VoiceLoop Enhancements
- **File:** `apps/web-ui/src/components/VoiceLoop.tsx`
- **Changes:**
  - Import `addLog` from actionLog store
  - Before `overwatch.pause`, dispatch confirmation request and wait for result
  - On cancel, log as `result: 'cancel'` and abort action
  - On successful action, log as `result: 'ok'` with UI hint
  - On failed action, log as `result: 'fail'`
- **Multi-Turn Seed:** Comment added for Phase 6b follow-up handling

### 4. VoiceBar Updates
- **File:** `apps/web-ui/src/components/VoiceBar.tsx`
- **Changes:**
  - Import `ConfirmCenter` component
  - Add **Log** button (dispatches `os1:actionlog:toggle`)
  - Mount `<ConfirmCenter />` when Voice Loop enabled
- **UI:** Small pill button next to Health button

### 5. Documentation
- **File:** `docs/VOICE_PHASE6_PLAN.md` (this file)

---

## Verification Steps

### 1. Manual Testing
```bash
npm run dev
```

1. **Enable Voice Loop** via checkbox in VoiceBar
2. **Say "pause overwatch"**
   - ✅ Confirmation modal appears with "Pause Overwatch monitoring now?"
   - ✅ Click **Cancel** → No state change, log shows `cancel`
   - ✅ Say again → Click **Confirm** → Overwatch pauses, log shows `ok • ⏸️ Overwatch paused`
3. **Say "resume overwatch"**
   - ✅ No confirmation (not a destructive action)
   - ✅ Overwatch resumes, log entry added
4. **Click Log button**
   - ✅ Log panel appears in bottom-right
   - ✅ Shows entries with time, intent, result, and notes
   - ✅ Click again to hide

### 2. Code Validation
- ✅ TypeScript compiles without errors
- ✅ No new npm dependencies added
- ✅ CRLF-safe (Windows line endings)
- ✅ ≤5 files modified (2 new, 2 edits, 1 doc)
- ✅ ≤50 lines per file constraint met

---

## Implementation Details

### Event-Driven Confirmation Pattern
Avoids global singletons by using DOM events:

```typescript
// VoiceLoop.tsx - Request confirmation
const id = Math.random().toString(36).slice(2);
const confirmed = await new Promise<boolean>((resolve) => {
  const onResult = (e: Event) => {
    const detail = (e as CustomEvent<{ id: string; ok: boolean }>).detail;
    if (detail?.id === id) {
      window.removeEventListener('os1:confirm:result', onResult);
      resolve(!!detail.ok);
    }
  };
  window.addEventListener('os1:confirm:result', onResult);
  window.dispatchEvent(new CustomEvent('os1:confirm:request', {
    detail: { id, message: 'Pause Overwatch monitoring now?' }
  }));
});
```

```typescript
// ConfirmCenter.tsx - Respond to confirmation
function respond(ok: boolean) {
  if (!request) return;
  window.dispatchEvent(new CustomEvent('os1:confirm:result', {
    detail: { id: request.id, ok }
  }));
  setRequest(null);
}
```

### Log Panel UI
- **Position:** Fixed bottom-right
- **Size:** 360px wide, max 40vh height
- **Scrolling:** Auto overflow for long lists
- **Styling:** Neutral dark theme matching existing UI
- **Layout:** Time | Intent | Result+Note (3-column flex)

---

## Extension Points

### Adding More Confirmations
To add confirmation for other intents (e.g., `session.clear`):

```typescript
// In VoiceLoop.tsx, before performVoiceAction:
if (intent === 'session.clear') {
  const id = Math.random().toString(36).slice(2);
  const confirmed = await new Promise<boolean>((resolve) => {
    // ... same pattern as overwatch.pause
  });
  if (!confirmed) {
    addLog({ ts: Date.now(), intent, transcript, result: 'cancel' });
    setPhase('idle');
    processingRef.current = false;
    return;
  }
}
```

### Multi-Turn Follow-Ups (Phase 6b)
Placeholder added in `VoiceLoop.tsx`:
```typescript
// Multi-turn seed: if model asks a question, UI can pick it up in next turn
```

Future implementation:
- Parse LLM response for questions
- Store context in voiceLoop store
- On next transcript, prepend previous context
- Example: "Would you like to see details?" → "Yes" → fetch details

---

## Notes

- **Zero Dependencies:** Uses only React built-ins and DOM events
- **Feature Flag:** All features gated by `NEXT_PUBLIC_VOICE_LOOP === '1'`
- **Max Log Size:** 50 entries (FIFO, oldest dropped)
- **Confirmation Scope:** Currently only `overwatch.pause`, easy to extend
- **Log Persistence:** In-memory only (resets on refresh)

---

## Commit Message

```
feat(voice): Phase-6 bootstrap — confirmations for pause + action audit log + log panel
```

---

## Future Enhancements

1. **Log Persistence:** Save to localStorage or session storage
2. **More Confirmations:** Add to `session.clear`, `mcp.disable`, etc.
3. **Log Export:** Download as JSON or CSV
4. **Multi-Turn Context:** Full conversational memory
5. **Undo Support:** Rollback last action from log
6. **Log Filtering:** Filter by intent, result, or date range

---

## Acceptance Criteria

✅ Confirmation modal appears for destructive actions  
✅ Cancel prevents action execution and logs cancel event  
✅ Confirm executes action and logs success  
✅ Action log shows all entries with proper metadata  
✅ Log button toggles panel visibility  
✅ No TypeScript errors  
✅ No new npm dependencies  
✅ ≤5 files modified  
✅ CRLF-safe
