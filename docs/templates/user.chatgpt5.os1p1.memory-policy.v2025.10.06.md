# OS One - Memory Policy (v2025.10.06)

## Purpose
Define the governing rules for how OS One stores, recalls, and expires memory artifacts across session, user, org, and global scopes.

## Scope
All assistants, agents, and services operating inside OS One that create, consume, or manage memory artifacts.

## Canonical Location(s)
- Primary: `docs/templates/`
- Archive: `docs/_archive/` (same filename when superseded)

## Dependencies/References
- Docs Creation Guidelines: `docs/templates/user.chatgpt5.os1p1.docs-creation-guidelines.v2025.10.05.md`
- Docs Validator Spec: `docs/templates/user.chatgpt5.os1p1.docs-validator-spec.v2025.10.05.md`
- Filenaming Policies: `docs/templates/user.chatgpt5.os1p1.filenaming-policies.v2025.10.4.md`
- Speech Control Policy: `docs/templates/user.chatgpt5.os1p1.speech-control-policy.v2025.10.04.md`
- Async/Sync Policy: `docs/templates/user.chatgpt5.os1p1.async-sync-policy.v2025.10.05.md`
- Sensory Router Spec: `docs/templates/user.chatgpt5.os1p1.sensory-router-spec.v2025.10.05.md`

## Body

### Memory Scopes
- `session`: ephemeral to the active session; default TTL <= 24 hours.
- `user`: persists under the user owner profile; default ON with explicit consent.
- `org`: persists inside the organization vault; opt-in per org admin.
- `global`: anonymized product heuristics; never includes personal identifiers.

### Data Classes
- `P0 Critical`: credentials, auth tokens, raw biometrics. Never persisted; transient only.
- `P1 Sensitive`: PII, health, biometric derived data. Requires private mode, encryption at rest, and explicit consent.
- `P2 Standard`: preferences, goals, working notes. Consent driven, revocable at any moment.
- `P3 Telemetry`: aggregated metrics and traces without identity.

### Consent and Visibility
- Memory indicators must surface the active scope state (recording on/off, private, public).
- A `CONSENT_SET` commit event is required before persisting any `P1` or `P2` record.
- Provide "Why was this remembered?" affordance with pathway to delete/forget.

### Retention and Deletion
- Default TTLs: session 24h, user 365d, org 365d (configurable), global N/A (aggregated only).
- Revocation enforces hard delete within 24h; only audit tombstones remain.
- Retention policies must be surfaced to the user during consent.

### Naming and Storage
- Persisted artifacts adopt dot-schema naming: `memory.<scope>.<topic>.vYYYY.MM.DD.json`.
- Superseded artifacts move to `_archive/` with identical filenames.
- Metadata includes scope, consent reference, sensitivity tier, and TTL.

### Guardrails and Events
- Enforce <=5 file writes per STB execution.
- Maintain strong consistency for `CONSENT_SET` and `RECORD_ON|OFF` commits; analytics may remain eventual.
- Memory operations must pause immediately when Speech/Async policies issue a STOP or private-mode override.

## Stability Guardrails
- Apply the One-Fence Rule when embedding STBs in future revisions.
- Any code or infra changes derived from this policy must bump the document version and update linked specs.

## Version & Archive
- Version bump follows `vYYYY.MM.DD` based on approval date.
- Retire superseded versions to `docs/_archive/` without renaming.

## Acceptance
- Document passes the Docs Validator and references resolve to existing canonical paths.
- Consent states and retention timelines are explicitly defined for each memory scope.
- Speech, Async, and Sensory guardrails are acknowledged.

## Notes
- Future revisions may enumerate jurisdiction-specific retention requirements or encryption primitives once finalized.
