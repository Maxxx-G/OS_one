X-Tier1: user
X-Agent: copilot
X-Domain: os1p1lexicore
X-Purpose: mvp-spec
X-Version: v2025.10.12
X-Policy: filename+header compliance required

---

# LexiCore MVP Specification · v2025.10.12

**Domain**: Word Processor (Genesis Series Tier-I)  
**Status**: MVP Released  
**SEC-COMMS Layers**: ε (Vault), ζ (Replay)

---

## Purpose

LexiCore is a **cognitive word processor** that integrates with OS One's SEC-COMMS infrastructure to provide:
- Rich text editing with vault persistence (ε-layer)
- Replay event logging for version history (ζ-layer)
- Lightweight MVP implementation (≤5 files, zero new dependencies)

This document defines the MVP scope, ethical constraints, and retention policies.

---

## MVP Features

### 1. Editor Page (`/lexicore`)
- **Location**: `apps/web-ui/app/lexicore/page.tsx`
- **Functionality**:
  - Simple textarea for document editing
  - Three action buttons: Save to Vault, Load from Vault, Replay Embed
  - Status feedback for all operations

### 2. Vault Persistence (ε-layer)
- **Save**: POST to `/api/memory/save` with `{ agentId, stateVector: { doc } }`
- **Load**: GET from `/api/memory/load?agentId=gabriel`
- **Storage**: Uses existing `/api/memory` endpoint (no new persistence format)
- **Encryption**: Inherits AES-GCM encryption from ε-layer

### 3. Replay Logging (ζ-layer)
- **Trigger**: POST to `/api/replay` with `{ agentId, eventType: "lexicore_edit", payload }`
- **Purpose**: Create embeddings for adaptive learning and version history
- **Output**: Returns filename of replay snapshot (e.g., `replay.bin`)

### 4. Smoke Test
- **Script**: `scripts/tools/user.copilot.os1p1lexicore.smoke.v2025.10.12.ps1`
- **Tests**: Verifies `/lexicore` page renders (200 OK)
- **Report**: Saves results to `docs/reports/user.copilot.os1p1lexicore.smoke.v2025.10.12.md`

---

## Architecture

```
LexiCore MVP/
├── apps/web-ui/app/lexicore/
│   ├── page.tsx           # Main editor UI (client component)
│   └── types.ts           # TypeScript interfaces (Snapshot, ReplayEvent)
├── scripts/tools/
│   └── user.copilot.os1p1lexicore.smoke.v2025.10.12.ps1  # Smoke test
└── docs/
    ├── policies/
    │   └── user.copilot.os1p1lexicore.mvp-spec.v2025.10.12.md  # This file
    └── reports/
        └── user.copilot.os1p1lexicore.smoke.v2025.10.12.md  # Generated report
```

---

## Ethics & Retention

### Data Sovereignty
- **User Control**: All documents stored in user's local vault (ε-layer)
- **No Cloud Sync**: MVP does not transmit documents to external services
- **Encryption**: Documents encrypted at rest (AES-GCM via ε-layer)

### Replay Ethics
- **Consent**: Replay logging only triggered by explicit user action (button click)
- **Purpose**: Version history and adaptive learning (user benefit)
- **Retention**: Replay snapshots follow OS One's general retention policy (user-configurable)

### Transparency
- **Status Feedback**: All operations display clear success/failure messages
- **No Silent Tracking**: No background telemetry without user interaction
- **Open Source**: Code available for audit (Genesis Series licensing)

---

## Limitations (MVP Scope)

The following features are **out of scope** for MVP:
- Rich text formatting (WYSIWYG editor)
- Semantic search across documents
- AI writing assistance (grammar/style suggestions)
- Collaboration mode (multi-user editing)
- STB block insertion
- Export to other formats (PDF, DOCX)

These features are planned for **LexiCore Enhanced** (post-MVP).

---

## Integration Points

### Existing APIs
- **`/api/memory/save`**: Vault persistence (ε-layer)
- **`/api/memory/load`**: Vault retrieval (ε-layer)
- **`/api/replay`**: Replay event logging (ζ-layer)

### SEC-COMMS Compliance
- **α (Alpha)**: Page served locally (no external egress)
- **ε (Epsilon)**: Documents encrypted in vault
- **ζ (Zeta)**: Edit events logged for replay/embeddings

---

## Acceptance Criteria

1. ✅ `/lexicore` page renders with textarea and 3 buttons
2. ✅ Save button POSTs to `/api/memory/save` and displays status
3. ✅ Load button GETs from `/api/memory/load` and populates textarea
4. ✅ Replay button POSTs to `/api/replay` and shows filename
5. ✅ Smoke test script verifies page accessibility (200 OK)
6. ✅ All files have STB headers and compound filenames
7. ✅ Guardian + Validator PASS
8. ✅ No new dependencies added

---

## Rollback Plan

If LexiCore MVP introduces regressions:

1. **Remove Files**:
   - `apps/web-ui/app/lexicore/page.tsx`
   - `apps/web-ui/app/lexicore/types.ts`
   - `scripts/tools/user.copilot.os1p1lexicore.smoke.v2025.10.12.ps1`
   - `docs/policies/user.copilot.os1p1lexicore.mvp-spec.v2025.10.12.md`

2. **Restore README**: Remove LexiCore link from Genesis Series section

3. **Verify**:
   ```powershell
   node scripts/checks/stb_guard.mjs
   npm run validate:stb
   npm run smoke
   ```

---

## Future Roadmap

### Phase 2: Enhanced (Tier-I+)
- Rich text editor (ProseMirror/Lexical)
- Semantic search (vector embeddings via ζ)
- AI writing assistant (GPT-4 integration)
- Version history viewer (replay ζ)

### Phase 3: Advanced (Tier-II)
- Collaboration mode (multi-user with δ identity)
- STB block insertion (fetch from `docs/templates/`)
- Cross-app integration (export to Maxxi Ops, EchoReach)
- Adaptive writing coach (learns user style via ζ replay)

---

## References

- **Genesis Hub**: `docs/hubs/user.copilot.os1universe.genesis-hub.v2025.10.12.md`
- **SEC-COMMS Policy**: `docs/policies/user.copilot.os1p1webui.seccomms-beta.v2025.10.10.md`
- **LexiCore App Stub**: `apps/lexicore/README.md`
- **Filenaming Policy**: `docs/templates/user.copilot.os1p1docs.filenaming-policies.v2025.10.04.md`

---

**Last Updated**: v2025.10.12  
**Status**: MVP Complete — Ready for user testing
