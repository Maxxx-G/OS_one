# OS One - Profit Telemetry Spec (v2025.10.07)

## Purpose
Define the telemetry contract for profit tracking, tier usage analysis, and ethics-aware gating across OS One services.

## Scope
Applies to all subsystems that emit user-tier or feature-usage events, including HUD surfaces, calendar/time manager, voice modules, and backend profit-score processors.

## Canonical Location(s)
- Primary: `policies/`
- Archive: `policies/_archive/` (retain filename when superseded)

## Dependencies/References
- Ethics Core Values: `policies/user.chatgpt5.os1p1.ethics-core-values.v2025.10.06.md`
- Profit Matrix Policy: `policies/user.chatgpt5.os1p1.profit-matrix-policy.v2025.10.06.md`
- Memory Policy: `docs/templates/user.chatgpt5.os1p1.memory-policy.v2025.10.06.md`
- Docs Creation Guidelines: `docs/templates/user.chatgpt5.os1p1.docs-creation-guidelines.v2025.10.05.md`
- Docs Validator Spec: `docs/templates/user.chatgpt5.os1p1.docs-validator-spec.v2025.10.05.md`

## Body

### Event Schema
| Field | Type | Description |
| --- | --- | --- |
| `id` | string | UUID or composite key (for example, `session_id:task_id`). |
| `ts` | ISO8601 string | UTC timestamp of the event emission. |
| `tier` | `"FREE" | "CORE" | "PRO" | "ENTERPRISE"` | User entitlement tier at emission time. |
| `feature_id` | string | Feature identifier (for example, `calendar`, `voiceSync`). |
| `ethic` | `"PRIMACY" | "SECONDARY" | "GUARDIAN"` | Effective ethics level applied to the event. |
| `action` | `"use" | "view" | "upgrade_prompt" | "toggle"` | Interaction type. |
| `duration_ms` | number (optional) | Duration for continuous interactions. |
| `revenue_impact` | number | Incremental profit score delta (positive or negative). |
| `source` | string | Origin system (`hud`, `api`, `agent`, etc.). |
| `metadata` | object | Additional diagnostics (must avoid PII). |

### Logging Policy
- Frequency capped at ?10 Hz per active session; debounce bursty emitters.
- Storage path: append-only NDJSON files under `/telemetry/profit/` segmented by date.
- Retention: keep raw telemetry for 30 days locally; archival or cloud sync requires consent alignment per Memory Policy.
- Ethics enforcement: events with `action = "upgrade_prompt"` must carry `ethic = "PRIMACY"`; secondary/guardian tiers cannot trigger upsell workflows.

### Integration Requirements
- HUD widgets, feature APIs, and memory engines emit telemetry via shared client libraries.
- Profit Matrix processors aggregate `revenue_impact` for `profitScore(tier)` analytics; they must not override ethics decisions from the core values manifest.
- Governance dashboards consume aggregated metrics but must report ethics breaches within 24h.

## Stability Guardrails
- Any change to field definitions or semantics requires synchronized updates to Profit Matrix Policy, HUD emitters, and validator tooling.
- One-Fence Rule applies to future STB inclusions; limit PRs to <=5 files unless pre-approved.

## Version & Archive
- Increment version tag when adding/removing fields or altering logging constraints.
- Archive superseded versions in `policies/_archive/` using the same filename.

## Acceptance
- Schema fields map to existing profit matrix computations.
- Ethics linkage and retention policies mirror Ethics Core Values and Memory Policy requirements.
- Document passes Docs Validator without blocking issues.

## Notes
- Future revisions may introduce anonymized aggregation or privacy budget tracking per jurisdictional requirements.
