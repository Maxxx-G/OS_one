# OS One - Profit Telemetry Checklist (v2025.10.07)

## Purpose
Provide a pre-deploy checklist to ensure telemetry emitters comply with the Profit Telemetry Spec.

## Scope
Applies to developers and QA reviewers instrumenting profit-related events in frontend or backend components.

## Canonical Location(s)
- Primary: `docs/templates/`
- Archive: `docs/_archive/` (retain filename when superseded)

## Dependencies/References
- Profit Telemetry Spec: `policies/user.chatgpt5.os1p1.profit-telemetry-spec.v2025.10.07.md`
- Ethics Core Values: `policies/user.chatgpt5.os1p1.ethics-core-values.v2025.10.06.md`
- Profit Matrix Policy: `policies/user.chatgpt5.os1p1.profit-matrix-policy.v2025.10.06.md`
- Memory Policy: `docs/templates/user.chatgpt5.os1p1.memory-policy.v2025.10.06.md`
- Docs Creation Guidelines: `docs/templates/user.chatgpt5.os1p1.docs-creation-guidelines.v2025.10.05.md`

## Body
- [ ] `tier` field set to one of `FREE`, `CORE`, `PRO`, `ENTERPRISE`.
- [ ] `ethic` field set to `PRIMACY`, `SECONDARY`, or `GUARDIAN` (match governance manifest).
- [ ] `action` matches allowed values (`use`, `view`, `upgrade_prompt`, `toggle`).
- [ ] Emission frequency ?10 Hz per session (debounced/throttled).
- [ ] Events stored under `/telemetry/profit/` in NDJSON format.
- [ ] Payload excludes PII and aligns with Memory Policy retention rules.
- [ ] Event structure validates against Profit Telemetry Spec.

## Stability Guardrails
- Checklist updates require synchronized revisions to Profit Telemetry Spec.
- Maintain One-Fence Rule if embedding STBs in future versions.

## Version & Archive
- Update version tag when checklist items change materially.
- Archive prior versions to `docs/_archive/` using the same filename.

## Acceptance
- Checklist covers schema, ethics linkage, retention, and storage location.
- References resolve to current canonical documents.
- Document passes Docs Validator without blocking issues.

## Notes
- Consider automating checklist enforcement via repo guard scripts or CI linting.
