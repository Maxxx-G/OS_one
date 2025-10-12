<!--
X-Tier1: user
X-Agent: copilot
X-Domain: os1p3ops
X-Purpose: phase3-init
X-Version: v2025.10.13
X-Policy: filename+header compliance required
-->

# Phase 3 (θ) — Compliance Init Brief (Copilot) · v2025.10.13

## Role
- **Owner:** Copilot (Compliance Agent & CI Guardian)
- **Mandate:** Audit Codex STBs for θ-layer; enforce Guardian; archive reports.

## Scope (Week 1–2)
- Guardian schema for θ endpoints & control-bus artifacts.
- CI wiring for WebSocket telemetry monitoring.
- Compliance report template + archival under `/docs/stb/_archive`.

## Auditable Surfaces (initial)
- `/api/mesh/stream` (Edge WS): upgrade guard, SEC-COMMS headers, heartbeat.
- Autonomic Control Bus envelopes: `{ ts, kind, source, session_id, payload }`.
- Token-economy metrics: `{ rate_limited, retries, budget_used }`.

## Outputs
- Policy: `user.copilot.os1p3ops.guardian-theta-schema.v2025.10.13.md`
- Script: `scripts/tools/user.copilot.os1p3ops.theta-validation-smoke.v2025.10.13.ps1`
- Registry updated to Phase 3 "in-progress".

## Timeline
- **Week 1**: Schema definition + smoke validation framework
- **Week 2**: Codex θ STB audits (within 48h of commit)
- **Week 3**: Final Guardian regression sweep + compliance summary

## Constraints
- ≤5 files per Codex STB
- Zero-Tolerance Guardian must pass all commits
- No runtime changes to existing Phase 2 APIs
- PowerShell 5.1 compatibility required

## Success Criteria
- θ-layer validation schema documented
- Smoke script validates WebSocket upgrade enforcement
- Registry reflects Phase 3 transition
- CI pipeline ready for θ endpoint monitoring

---

**Status**: Init complete  
**Next**: Await Codex θ-layer STBs for audit cycle
