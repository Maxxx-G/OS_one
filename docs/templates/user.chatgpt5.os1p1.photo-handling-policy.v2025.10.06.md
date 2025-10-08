# OS One - Photo Handling & Redaction Policy (v2025.10.06)

## Purpose
Set the guardrails for capturing, storing, redacting, and sharing photos gathered during OS One sessions involving third parties.

## Scope
All services, assistants, and client applications that process image data or photo metadata connected to OS One interactions.

## Canonical Location(s)
- Primary: `docs/templates/`
- Archive: `docs/_archive/` (same filename when superseded)

## Dependencies/References
- Third-Party Consent Policy: `docs/templates/user.chatgpt5.os1p1.third-party-consent-policy.v2025.10.06.md`
- Contacts/Profile Spec: `docs/templates/user.chatgpt5.os1p1.contacts-profile-spec.v2025.10.06.md`
- Ethics & Consent Policy: `docs/templates/user.chatgpt5.os1p1.ethics-consent-policy.v2025.10.06.md`
- Public-Mode Safety Policy: `docs/templates/user.chatgpt5.os1p1.public-mode-safety.v2025.10.06.md`
- Memory Policy: `docs/templates/user.chatgpt5.os1p1.memory-policy.v2025.10.06.md`
- Memory Engine Spec: `docs/templates/user.chatgpt5.os1p1.memory-spec.v2025.10.06.md`
- Memory UX Guidelines: `docs/templates/user.chatgpt5.os1p1.memory-ux-guidelines.v2025.10.06.md`
- Docs Creation Guidelines: `docs/templates/user.chatgpt5.os1p1.docs-creation-guidelines.v2025.10.05.md`
- Docs Validator Spec: `docs/templates/user.chatgpt5.os1p1.docs-validator-spec.v2025.10.05.md`

## Body

### Default Handling
- Store metadata only (for example, face count, capture time, session id) unless the participant has granted explicit photo consent.
- Metadata records use `memory.user.profile.contact-photo.<slug>.vYYYY.MM.DD.json` and remain `P1` due to biometric inference potential.
- Without consent, image pixels must not be persisted, cached, or transmitted beyond volatile buffers.

### Redaction and Blocking (MVP)
- When any detected subject lacks consent, the system must either block storage or redact faces before persistence.
- Public Mode automatically blocks image persistence; metadata may be stored with `[REDACTED]` markers for non-consenting subjects.
- Redaction pipeline should provide deterministic outcomes (for example, blur strength, mask type) and log each redaction action for audit.

### Sharing and Export
- Prior to export, display all detected subjects with consent status; require confirmation before including pixels.
- Replace unconsented faces with blur, pixelation, or placeholder masks in exported assets.
- Outbound channels must inherit Public Mode redaction settings and respect Speech/Async STOP events.

### Future Enhancements
- On-device face detection to minimize cloud exposure.
- Encryption at rest and access logging for stored photo blobs.
- Configurable retention windows aligned with Memory Policy TTLs.

## Stability Guardrails
- STB-driven changes must comply with the One-Fence Rule and record <=5 file modifications.
- Redaction logic updates require coordinated revisions to Contacts/Profile Spec and Memory documentation.

## Version & Archive
- Increment version when altering default storage behavior, redaction classes, or consent prerequisites.
- Archive prior versions in `docs/_archive/` keeping filenames unchanged.

## Acceptance
- Policy mandates metadata-only storage absent consent and requires redaction for non-consenting subjects.
- Public Mode interactions clearly block or redact photo storage in line with broader safety policies.
- Document passes Docs Validator and all references resolve to canonical docs.

## Notes
- Subsequent versions may add video handling guidance, device-specific redaction libraries, and integration with External Respect guidelines once formalized.
