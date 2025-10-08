# OS One - Governance Model (Authority ? Meeting) (v2025.10.06)

## Purpose
Unify people authority tiers with meeting/topic tiers so sessions, queues, and decisions inherit consistent power, quorum, and ethics tags.

## Scope
Applies to governance services, scheduling tools, and assistants that coordinate meetings or decision queues within OS One.

## Axes
- **Authority Tiers (people)**:
  - T1 Founders / AI Cores (Kharma, Gabriel, Alfred, ADA, Tiffany) ? PRIMACY
  - T2 Directors (Finance, IT, Legal, Ops) ? SECONDARY
  - T3 Engineering / Analysis (SEs, SAs) ? SECONDARY
  - T4 Admin / Support / Agents ? GUARDIAN
- **Meeting Tiers (topics)**:
  - M1 Board / Strategic ? PRIMACY
  - M2 Executive / Division ? SECONDARY
  - M3 Departmental ? SECONDARY
  - M4 Project / Task ? GUARDIAN

## Effective Ethics
```
effective_ethic = max(authority_ethic, meeting_ethic)
```
Conflicts route through Ethics Core Values (Primacy ? Secondary ? Guardian).

## Canonical Layout
```
/governance/
?? meetings/       # tiered queues (T1..T4)
?? committees/     # R&D, PR, Legal, Finance groupings
?? topics/         # reusable topic briefs
?? _schemas/       # queue schema, authority catalogs
```

## Guardrails
- Queue entry shape: `topic_id`, `title`, `authority_tier`, `meeting_tier`, `effective_ethic`, `departments[]`, `participants[]`, `status`, optional `next_review`, `attachments[]`.
- Tier-1 sessions require PRIMACY acknowledgement; agent roles cannot override assistant owners.
- All events and decisions carry `ethic.level` for audit and UI badge rendering.

## References
- `policies/user.chatgpt5.os1p1.ethics-core-values.v2025.10.06.md`
- `policies/user.chatgpt5.os1p1.speech-control-policy.v2025.10.04.md`
- `policies/user.chatgpt5.os1p1.async-sync-policy.v2025.10.05.md`
- `policies/user.chatgpt5.os1p1.sensory-router-spec.v2025.10.05.md`

## Stability Guardrails
- Adhere to the One-Fence Rule for future STBs; keep governance rollouts within <=5 file updates unless approved.
- Schema updates must version bump and notify queue processors before deployment.

## Version & Archive
- Increment `vYYYY.MM.DD` when authority tiers, meeting mappings, or guardrails change.
- Archive superseded versions in `policies/_archive/` retaining the filename.

## Acceptance
- Authority ? meeting mapping available to scheduling and ethics evaluators.
- Queue tooling recognizes `effective_ethic` as the enforcement field.
- Document references resolve to active governance artifacts.

## Notes
- Future revisions may append regional governance overlays or add Tier-0 emergency councils.
