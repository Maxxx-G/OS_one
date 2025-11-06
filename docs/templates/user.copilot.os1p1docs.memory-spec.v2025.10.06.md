X-Tier1: user
X-Agent: copilot
X-Domain: os1p1docs
X-Purpose: memory-spec
X-Version: v2025.10.06
X-Policy: filename+header compliance required

# OS One - Memory Engine Spec (v2025.10.06)

## Purpose
Define the Memory Engine v0 interfaces, data models, and operational guarantees that enforce the Memory Policy.

## Scope
Applies to platform services that read or write memory artifacts, including API gateways, assistants, and background processors.

## Canonical Location(s)
- Primary: `docs/templates/`
- Archive: `docs/_archive/` (same filename when superseded)

## Dependencies/References
- Memory Policy: `docs/templates/user.chatgpt5.os1p1.memory-policy.v2025.10.06.md`
- Docs Creation Guidelines: `docs/templates/user.chatgpt5.os1p1.docs-creation-guidelines.v2025.10.05.md`
- Docs Validator Spec: `docs/templates/user.chatgpt5.os1p1.docs-validator-spec.v2025.10.05.md`
- Speech Control Policy: `docs/templates/user.chatgpt5.os1p1.speech-control-policy.v2025.10.04.md`
- Async/Sync Policy: `docs/templates/user.chatgpt5.os1p1.async-sync-policy.v2025.10.05.md`
- Sensory Router Spec: `docs/templates/user.chatgpt5.os1p1.sensory-router-spec.v2025.10.05.md`

## Body

### Interfaces (v0)
- `PUT /api/memory/put`: Idempotent write endpoint; requires scope, topic, consent reference, sensitivity tier.
- `POST /api/memory/query`: Structured recall by scope, topic, tags, created_at window.
- `DELETE /api/memory/forget`: Requests revocation; writes tombstone, schedules purge within 24h.
- `WS /stream` (existing): Emits `COMMIT:RECORD_ON|OFF|CONSENT_SET` events for Speech/Async compliance.

### Data Model
```
MemoryRecord {
  id: string,
  session_id: string,
  scope: 'session' | 'user' | 'org' | 'global',
  actor_id: string,
  topic: string,
  tags: string[],
  content: object | string,
  sensitivity: 'P1' | 'P2' | 'P3',
  created_at: ISO8601,
  ttl_ms?: number,
  consent_ref?: string,
  hash: string
}
```
- `P0` payloads are rejected upstream; never reach persistence.
- `hash` enables tamper detection and dedupe for idempotent writes.

### Behavior
- Writes for `P1` or `P2` require prior `CONSENT_SET` and active `RECORD_ON` state.
- Session scope binds to `session_id`; User/Org scopes require authenticated principal + policy check.
- Deletion flow writes an audit tombstone (`MemoryTombstone`) while purging primary storage inside 24h.
- Idempotency key is derived from `session_id:topic:seq`.
- Speech/Async overrides halt writes and flush pending buffers to volatile memory only.

### Storage Model (Phase 0)
- In-memory map for live session interactions.
- Optional JSON drop (`memory.<scope>.<topic>.vYYYY.MM.DD.json`) for persistence experimentation; disabled by default until approved via STB.
- Encryption placeholders reserved for `P1` records; activation tracked in future specs.

### Observability
- Append-only outbox log for writes, deletes, consent transitions.
- Metrics: recall hit rate, write latency, TTL purge count, consent errors.
- Logs must correlate with Sensory Router events for multimodal context.

### Guardrails
- Configuration toggles align with Speech/Async preemption and Sensory Router pause signals.
- All schema changes require validator updates and version bumps.
- Enforce One-Fence Rule for any STB describing migration steps.

## Stability Guardrails
- Follows Docs Validator checks (regex, header version, canonical references).
- Requires dry-run validation for JSON schema changes before deployment.

## Version & Archive
- Increment version on material schema or interface change.
- Archive superseded versions to `docs/_archive/` without renaming the filename.

## Acceptance
- Interface list and data model align with Memory Policy constraints.
- Consent enforcement and deletion timelines are unambiguous.
- References to Speech, Async, and Sensory controls remain current.

## Notes
- Future revisions will cover encryption at rest, sharded persistence engines, and analytics opt-outs.
