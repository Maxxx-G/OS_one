# OS One - Ethics Core Values (v2025.10.06)

## Purpose
Document the engineering definition of Ethics Core Values so platform components can enforce consent, privacy, and safety constraints consistently.

## Scope
Applies to all OS One services and agents that orchestrate consent, inference, storage, or output decisions involving user or third-party data.

## Canonical Location(s)
- Primary: `policies/`
- Archive: `policies/_archive/` (retain filename when superseded)

## Dependencies/References
- Docs Creation Guidelines: `docs/templates/user.chatgpt5.os1p1.docs-creation-guidelines.v2025.10.05.md`
- Docs Validator Spec: `docs/templates/user.chatgpt5.os1p1.docs-validator-spec.v2025.10.05.md`
- Memory Policy: `docs/templates/user.chatgpt5.os1p1.memory-policy.v2025.10.06.md`
- Memory Engine Spec: `docs/templates/user.chatgpt5.os1p1.memory-spec.v2025.10.06.md`
- Memory UX Guidelines: `docs/templates/user.chatgpt5.os1p1.memory-ux-guidelines.v2025.10.06.md`
- Speech Control Policy: `docs/templates/user.chatgpt5.os1p1.speech-control-policy.v2025.10.04.md`
- Async/Sync Policy: `docs/templates/user.chatgpt5.os1p1.async-sync-policy.v2025.10.05.md`
- Sensory Router Spec: `docs/templates/user.chatgpt5.os1p1.sensory-router-spec.v2025.10.05.md`

## Body

### Concept Overview
Ethics Core Values act as a control plane that enumerates non-functional constraints (consent, privacy, redaction) and publishes machine-readable policies that downstream systems must satisfy before executing high-risk actions.

### Structural Layers
- **Primacy Layer**: Authoritative ruleset hosted in the Governance Service. Exposes versioned policy bundles via signed manifests consumed by gateway services. Maintains compatibility contracts for Speech, Memory, Async, and Sensory modules.
- **Secondary Layer**: Runtime adapters that translate Primacy manifests into module-specific guards. Examples include speech pre-roll blockers, memory write interceptors, and async task schedulers that enforce consent prerequisites.
- **Guardian Layer**: Edge and client-side sentinels (UI badges, device toggles, redaction filters) that deliver immediate user feedback and halt actions when upstream evaluations fail or drift from expected state.

### Integration Points
- **Speech Module**: Primacy rules map to Speech Control states (`RECORD_ON`, `STOP`); Secondary adapters push guardrails into live transcription, while Guardian indicators show capture state and consent gaps.
- **Memory Module**: Secondary adapters inject consent checks into `PUT /api/memory/put` and govern TTL selection. Guardian layer surfaces "Why remembered?" with `CONSENT_REF` linkage.
- **Async/Sensory Module**: Primacy bundles define safe handoff patterns; Secondary schedulers enforce pause signals from Sensory Router events; Guardian HUDs acknowledge sensor gating and notify when data is suppressed.
- **Audit & Telemetry**: Each layer emits structured events (`ETHICS_EVAL`, `ETHICS_DENY`) aggregated for compliance dashboards and Docs Validator cross-checks.

### Operational Safeguards
- Versioned manifests must be signed and verified before deployment.
- Rollout uses feature flags allowing staged enablement per workspace or org.
- Deviation detection compares Guardian telemetry with Primacy expectations; mismatches trigger failsafe stop actions.

## Stability Guardrails
- Follow One-Fence Rule when embedding STBs; limit policy-related code pushes to <=5 files unless an approved exception exists.
- Any Primacy schema change requires simultaneous updates to Secondary adapters and Guardian UI contracts.

## Version & Archive
- Increment version tag (`vYYYY.MM.DD`) when modifying structural layer definitions, integration requirements, or safeguard logic.
- Move superseded versions to `policies/_archive/` without renaming the file.

## Acceptance
- Structural layers are technically defined with integration hooks for Speech, Memory, and Async/Sensory systems.
- Guardian behaviors describe actionable telemetry and stop conditions.
- References resolve to active governance documents.

## Notes
- Future revisions may enumerate additional module bindings (for example, payments) once policies mature.

```
<STB version="v2025.10.06" mode="REFERENCE">
  <acceptance>
    <item>Policy ingested by Governance Service and surfaced via Primacy manifest.</item>
    <item>Secondary adapters updated to consume manifest revision.</item>
  </acceptance>
  <rollback>
    <item>Revert to prior Ethics Core Values manifest and notify module owners.</item>
  </rollback>
  <commit>
    <item>policies(ethics): codify Ethics Core Values layers and module integrations</item>
  </commit>
</STB>
```
