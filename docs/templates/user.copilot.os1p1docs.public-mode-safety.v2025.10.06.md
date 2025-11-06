X-Tier1: user
X-Agent: copilot
X-Domain: os1p1docs
X-Purpose: public-mode-safety
X-Version: v2025.10.06
X-Policy: filename+header compliance required

# OS One - Public-Mode Safety Policy (v2025.10.06)

## Purpose
Protect users when operating OS One in public, streaming, or shared environments by enforcing redaction, consent, and memory guardrails.

## Scope
All assistants and interfaces that broadcast, stream, or share output publicly, including live voice, chat, and async channels.

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

### Public Mode Effects
- Enable automatic `PII_REDACTION` on all outbound content: replace sensitive values with tokens (for example, `[REDACTED:EMAIL]`).
- Block `P1` and `P2` memory writes unless explicit consent exists and mode is not public.
- UI surfaces a "Public" badge describing active redactions and memory restrictions.

### Redaction Classes (MVP)
- Email addresses, phone numbers, postal addresses, birth date/time/place, and government identifiers.
- Redaction pipeline must be deterministic and log each replacement for audit.
- Allowlist override requires explicit owner authorization plus audit trail.

### Controls and Events
- Toggle via `/privacy/public-mode` command or system UI switch; every change creates an audit entry with initiator, timestamp, and context.
- Speech STOP or Sensory Router pause immediately halts outbound streaming and enforces redaction review.
- Async threads inherit the mode state until explicitly cleared.

### Memory and Consent Interplay
- When public mode activates, notify user that new sensitive memories will not persist; offer quick link to consent settings.
- Revoking public mode re-enables memory writes only after confirming consent state.
- Violations trigger automatic alerts aligned with Ethics & Consent Policy.

## Stability Guardrails
- Apply One-Fence Rule to any embedded STBs.
- Redaction logic must execute before content leaves the device or workspace.
- Policy changes require synchronized updates to Memory and Consent documents.

## Version & Archive
- Bump version whenever redaction classes, control surface, or enforcement changes.
- Archive prior versions in `docs/_archive/` using the same filename.

## Acceptance
- Public mode behavior clearly enumerates redaction classes and memory gating requirements.
- References point to current memory, consent, and speech/async/sensory policies.
- Document passes Docs Validator with no blocking issues.

## Notes
- Later versions may add ML-based redaction heuristics, locale-specific PII classes, and hardware indicator integrations.
