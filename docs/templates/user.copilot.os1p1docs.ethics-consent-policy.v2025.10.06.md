X-Tier1: user
X-Agent: copilot
X-Domain: os1p1docs
X-Purpose: ethics-consent-policy
X-Version: v2025.10.06
X-Policy: filename+header compliance required

# OS One - Ethics & Consent Policy (v2025.10.06)

## Purpose
Ensure every OS One experience handles sensitive data and automated profiling through explicit, informed consent that meets legal and user trust standards.

## Scope
All assistants, agents, and platform services that collect, infer, store, or act on personal or sensitive information within OS One.

## Canonical Location(s)
- Primary: `docs/templates/`
- Archive: `docs/_archive/` (same filename when superseded)

## Dependencies/References
- Docs Creation Guidelines: `docs/templates/user.chatgpt5.os1p1.docs-creation-guidelines.v2025.10.05.md`
- Docs Validator Spec: `docs/templates/user.chatgpt5.os1p1.docs-validator-spec.v2025.10.05.md`
- Filenaming Policies: `docs/templates/user.chatgpt5.os1p1.filenaming-policies.v2025.10.4.md`
- Memory Policy: `docs/templates/user.chatgpt5.os1p1.memory-policy.v2025.10.06.md`
- Memory Engine Spec: `docs/templates/user.chatgpt5.os1p1.memory-spec.v2025.10.06.md`
- Memory UX Guidelines: `docs/templates/user.chatgpt5.os1p1.memory-ux-guidelines.v2025.10.06.md`
- Speech Control Policy: `docs/templates/user.chatgpt5.os1p1.speech-control-policy.v2025.10.04.md`
- Async/Sync Policy: `docs/templates/user.chatgpt5.os1p1.async-sync-policy.v2025.10.05.md`
- Sensory Router Spec: `docs/templates/user.chatgpt5.os1p1.sensory-router-spec.v2025.10.05.md`

## Body

### Core Principles
- **Consent-first**: Require explicit opt-in for any `P1` or `P2` data handling, including profiling beyond functional necessity.
- **Clarity**: Surface "what, why, how long" prior to data capture with accessible language and revocation controls.
- **Data minimization**: Collect only what is needed for the declared purpose and expire promptly per Memory Policy.
- **Control before content**: Features remain locked until consent prerequisites are satisfied.

### Sensitive Profiling Examples
- Birth attributes (date, time, place), biometrics, medical data, sexuality, religion, and political beliefs demand explicit per-user opt-in.
- Profiling modules (see Profiling Modules Spec) must never auto-enable without recorded consent and user awareness.
- No shadow inference; unconsented data must be discarded immediately.

### Decision Autonomy
- Assistants may offer recommendations, but binding actions require either real-time approval or documented standing authorization.
- Every automated conclusion exposes a "Why this?" pane that links to data sources and module logic.

### Violation Handling
- On detected violation: trigger audit alert, suspend relevant writes, prompt user to reaffirm or revoke consent, and log remediation.
- Report incidents to governance tooling within 24h and retain tombstones per Memory Policy.

## Stability Guardrails
- Apply One-Fence Rule when embedding STBs in updates.
- Consent flows must honor Speech and Async STOP events, pausing capture until re-enabled.
- Policy updates require synced revisions across Memory and Profiling specs.

## Version & Archive
- Increment `vYYYY.MM.DD` upon material changes to consent definitions or enforcement requirements.
- Move superseded versions to `docs/_archive/` without renaming the file.

## Acceptance
- Consent requirements map to Memory scopes and profiling modules.
- Policy references remain current and resolve to canonical documents.
- Document passes Docs Validator without outstanding errors.

## Notes
- Future iterations may include jurisdiction-specific consent tracking and integration with Norms Engine overlays.
