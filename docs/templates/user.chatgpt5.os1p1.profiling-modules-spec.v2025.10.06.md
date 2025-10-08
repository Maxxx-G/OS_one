# OS One - Profiling Modules Spec (v2025.10.06)

## Purpose
Define the technical contract, consent gates, and storage patterns for profiling modules operating within OS One.

## Scope
Applies to all modular profiling components (habits, etiquette, AstroProfile, etc.) that process user or org data for personalized experiences.

## Canonical Location(s)
- Primary: `docs/templates/`
- Archive: `docs/_archive/` (same filename when superseded)

## Dependencies/References
- Docs Creation Guidelines: `docs/templates/user.chatgpt5.os1p1.docs-creation-guidelines.v2025.10.05.md`
- Docs Validator Spec: `docs/templates/user.chatgpt5.os1p1.docs-validator-spec.v2025.10.05.md`
- Filenaming Policies: `docs/templates/user.chatgpt5.os1p1.filenaming-policies.v2025.10.4.md`
- Ethics & Consent Policy: `docs/templates/user.chatgpt5.os1p1.ethics-consent-policy.v2025.10.06.md`
- Memory Policy: `docs/templates/user.chatgpt5.os1p1.memory-policy.v2025.10.06.md`
- Memory Engine Spec: `docs/templates/user.chatgpt5.os1p1.memory-spec.v2025.10.06.md`
- Memory UX Guidelines: `docs/templates/user.chatgpt5.os1p1.memory-ux-guidelines.v2025.10.06.md`
- Speech Control Policy: `docs/templates/user.chatgpt5.os1p1.speech-control-policy.v2025.10.04.md`
- Async/Sync Policy: `docs/templates/user.chatgpt5.os1p1.async-sync-policy.v2025.10.05.md`
- Sensory Router Spec: `docs/templates/user.chatgpt5.os1p1.sensory-router-spec.v2025.10.05.md`

## Body

### Module Contract (v0)
```
ProfilingModule {
  id: string;
  version: string;
  inputs: {
    required: string[];
    optional: string[];
  };
  output: {
    schema: string;
    sensitivity: 'P1' | 'P2' | 'P3';
  };
  consent_flag: string; // e.g., consent.astro
  locales?: string[];   // region or locale allowlist
}
```
- Modules must register contract metadata in the Norms Engine for governance scans.
- `sensitivity` drives storage scope and UX treatment.

### Core Modules (Illustrative)
- `HabitsProfile` (`P2`): infers routine preferences; requires explicit opt-in.
- `OrgEtiquette` (`P2`): captures organization customs; consent provided by org admin plus individual acknowledgement.
- `AstroProfile` (`P1`): consumes name, date of birth, time of birth, place of birth; **explicit per-user opt-in** required, advisory output only, never used for automation without a separate approval.

### Enforcement Rules
- Runtime must validate `consent_flag === true`, locale allowlist, and active Speech/Async state before execution.
- Missing consent or disallowed locale results in a logged denial; no data processed or stored.
- Outputs persist under `memory.user.profile.<module>.vYYYY.MM.DD.json` with TTL per Memory Policy; `P1` modules require encrypted storage when available.

### UX and Transparency
- Onboarding flows list modules with plain-language descriptions, sensitivity tier, and toggle default OFF.
- "Why remembered?" surfaces module id, consent timestamp, and data categories per Ethics & Consent Policy.
- Revocation disables module immediately and removes future scheduled runs.

## Stability Guardrails
- Module definitions must comply with One-Fence Rule if distributed via STBs.
- Profiling engines must respect Speech STOP and Sensory Router pause signals prior to capturing inputs.
- Contract changes require synchronized updates to Memory and UX documentation.

## Version & Archive
- Increment version on any schema signature, consent requirement, or storage behavior change.
- Archive superseded specs in `docs/_archive/` with unchanged filename.

## Acceptance
- Module contract enforces consent and locale checks before profiling runs.
- AstroProfile documented as `P1` optional module with explicit opt-in requirements.
- References resolve to current governance documents.

## Notes
- Future revisions may incorporate jurisdictional consent flags, differential privacy modules, and automated compliance reporting hooks.
