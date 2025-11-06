X-Tier1: user
X-Agent: copilot
X-Domain: os1p1webui
X-Purpose: chat-interface-init
X-Version: v2025.10.12
X-Policy: filename+header compliance required

---

# OS1 — Single Task Block (STB) · v2025.10.12
## Chat Interface Initialization

**Title**: Chat Interface Initialization  
**Scope**: Initialize core chat UI components with SEC-COMMS α-layer integration  
**Constraints**: ≤5 files, zero breaking changes, must pass guardian + smoke tests  
**Owner**: copilot  
**Status**: PENDING

---

## Objective

Initialize the foundational chat interface in `apps/web-ui` with:
- Message input/display components
- SEC-COMMS α-layer (client-side encryption) integration
- Basic message history state management
- Compliance with STB header/filename policies

All changes must preserve existing functionality and pass zero-tolerance guardian validation.

---

## Constraints

1. **File Limit**: ≤5 files (create/modify combined)
2. **No Breaking Changes**: Existing routes, APIs, components must remain functional
3. **SEC-COMMS Compliance**: All message I/O must route through α-layer redaction
4. **Guardian Pass**: All new/modified files must have STB headers and compound filenames
5. **Smoke Test Pass**: `npm run smoke` must succeed post-implementation

---

## Implementation Plan (≤5 Files)

### File 1: `apps/web-ui/src/components/ChatInterface.tsx`
- **Action**: CREATE
- **Purpose**: Main chat UI container component
- **Content**:
  - Message list display (read from state)
  - Input field + send button
  - Integration with SEC-COMMS α-layer for client-side redaction
  - STB headers: `X-Tier1: user, X-Agent: copilot, X-Domain: os1p1webui, X-Purpose: chat-interface, X-Version: v2025.10.12`

### File 2: `apps/web-ui/src/components/MessageInput.tsx`
- **Action**: CREATE
- **Purpose**: Controlled input component for message composition
- **Content**:
  - Textarea with auto-resize
  - Send button with loading state
  - Pre-send α-layer redaction hook
  - STB headers (matching File 1 pattern)

### File 3: `apps/web-ui/src/state/ChatContext.tsx`
- **Action**: CREATE
- **Purpose**: React Context for chat state management
- **Content**:
  - `messages: Message[]` state
  - `sendMessage(content: string)` action
  - Integration with existing SEC-COMMS context
  - STB headers

### File 4: `apps/web-ui/src/types/chat.ts`
- **Action**: CREATE
- **Purpose**: TypeScript interfaces for chat domain
- **Content**:
  - `Message { id, content, sender, timestamp, redacted }`
  - `ChatSession` interface
  - STB headers

### File 5: `apps/web-ui/src/pages/chat.tsx` (or modify existing `index.tsx`)
- **Action**: CREATE or MODIFY
- **Purpose**: Chat page route
- **Content**:
  - Render `<ChatInterface />` with context provider
  - STB headers

---

## Acceptance Criteria

1. ✅ Guardian passes: `node scripts/checks/stb_guard.mjs` → PASS
2. ✅ STB validator passes: `npm run validate:stb` → PASS
3. ✅ Smoke test passes: `npm run smoke` → PASS
4. ✅ Chat interface renders at `/chat` (or designated route)
5. ✅ Message input accepts text and triggers send action
6. ✅ SEC-COMMS α-layer integration confirmed (redaction applied pre-send)

---

## Rollback Plan

If implementation exceeds 5 files or introduces regressions:

1. **Immediate**: `git reset --hard HEAD~1` (if committed)
2. **Verification**: Re-run `npm run smoke` to confirm rollback
3. **Alternative**: Split into 2 STBs (STB-A: components only, STB-B: state + routing)

---

## Commit Stub

```
feat(chat): initialize chat interface with SEC-COMMS α-layer

- Add ChatInterface + MessageInput components (≤5 files)
- Integrate SEC-COMMS α-layer for client-side redaction
- Add ChatContext for message state management
- Create /chat route with context provider

Acceptance:
✅ guardian PASS
✅ validate:stb PASS
✅ smoke PASS

Refs: SEC-COMMS α-layer, docs/policies/user.copilot.os1p1webui.seccomms-beta.v2025.10.10.md
```

---

## Dependencies

- **SEC-COMMS α-layer**: `apps/web-ui/src/lib/redact.ts` (existing)
- **SeccommsContext**: `apps/web-ui/src/state/SeccommsContext.tsx` (existing)
- **STB Policies**: `docs/templates/user.copilot.os1p1docs.filenaming-policies.v2025.10.04.md`

---

## Notes

- If `/chat` route conflicts with existing pages, use `/messages` or integrate into existing dashboard
- Message persistence (DB/Supabase) deferred to future STB (autonomic-theta-init handles backend)
- Focus on UI/state layer only; backend API integration is separate scope
