# OS One — Profit Matrix & Feature Flag Policy (v2025.10.06)

## Purpose
Modulate capabilities by subscription tier while maximizing value minus cost and honoring Ethics Core Values.

## Tiers
- FREE: onboarding, limited chat, promos
- CORE: calendar, voiceSync
- PRO: + timeManager, advanced routing
- ENTERPRISE: SSO, audit feeds, MCP private packs

## Guardrails
- Feature exposure controlled by flags per tier.
- Legal/ethics: Guardian overrides predatory upsells; clear pricing.
- Engineering: flags must be read at adapter layer (middleware) not UI-only.
- Experiments off by default in production tiers.

## Ops Flow
- Propose change → Governance Tier-2 queue.
- Validate cost/value deltas → update matrix.ts & config/features.json.
- Roll to canary cohort → review profit telemetry → GA.

## Observability
- Log enable/disable events `profit_audit`.
- Compute `profitScore(tier)` weekly and alert on regressions.

## References
- /policies/user.chatgpt5.os1p1.ethics-core-values.v2025.10.06.md
- /policies/user.chatgpt5.os1p1.governance-model.v2025.10.06.md
