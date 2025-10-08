# OS One - Memory UX Guidelines (v2025.10.06)

## Purpose
Describe the user-facing patterns, controls, and cues that govern memory consent, recall, and transparency in OS One.

## Scope
UX and product designers, PMs, and engineers implementing memory-related flows across web, voice, and multimodal clients.

## Canonical Location(s)
- Primary: `docs/templates/`
- Archive: `docs/_archive/` (same filename when superseded)

## Dependencies/References
- Memory Policy: `docs/templates/user.chatgpt5.os1p1.memory-policy.v2025.10.06.md`
- Memory Engine Spec: `docs/templates/user.chatgpt5.os1p1.memory-spec.v2025.10.06.md`
- Speech Control Policy: `docs/templates/user.chatgpt5.os1p1.speech-control-policy.v2025.10.04.md`
- Async/Sync Policy: `docs/templates/user.chatgpt5.os1p1.async-sync-policy.v2025.10.05.md`
- Sensory Router Spec: `docs/templates/user.chatgpt5.os1p1.sensory-router-spec.v2025.10.05.md`
- Docs Validator Spec: `docs/templates/user.chatgpt5.os1p1.docs-validator-spec.v2025.10.05.md`

## Body

### Core UX Components
- **Memory Switch**: Toggle offering `Off`, `Private`, `Shared` states; tooltip explains scope, retention, and quick access to policy notes.
- **Why remembered?**: Inline link revealing rule, scope, consent timestamp, and "Forget now" control.
- **Recall Panel**: Scoped view with filters for topic, tags, date, and sensitivity tier; must indicate origin channel (chat, voice, sensor).

### Consent Flow
- First write requires banner: "Allow saving this info?" with per-scope checkboxes and TTL disclosure.
- Sensitive (`P1`) content prompts explicit modal confirmation; present storage location and revoke path.
- Display `CONSENT_SET` result with audit link when available.

### Multimodal (Speech, Async, Sensory)
- Meeting HUD mirrors recording and memory state; red/amber indicators align with Speech Control policy.
- Sensory Router events that disable inputs must also dim memory affordances within 500ms.
- Async handoffs surface memory availability status in follow-up threads.

### Error and Edge Handling
- Without consent, store only volatile hints; notify user that memory is disabled and provide enablement path.
- When revocation triggers, show countdown (<=24h) and completion toast.
- Network or storage errors fallback: keep local draft, retry with exponential backoff, inform user.

### Accessibility and Clarity
- All controls keyboard accessible; ARIA labels articulate scope and retention.
- Avoid dark patterns; language must be direct, with reading level <= Grade 9.
- Provide inline glossary for scope and sensitivity tiers.

## Stability Guardrails
- UX flows must pause memory interactions when Speech or Async policies preempt.
- Follow One-Fence Rule for any embedded STBs in future updates.

## Version & Archive
- Increment version with any material UX change to controls or consent wording.
- Archive prior versions in `docs/_archive/` without altering filenames.

## Acceptance
- Screens/flows implement consent indicators, recall filters, and revocation feedback as described.
- UX guidelines align with Memory Policy, Spec, and platform guardrails.
- Document passes Docs Validator without unresolved warnings.

## Notes
- Future iterations may add locale-specific consent treatments and hardware indicator requirements.
