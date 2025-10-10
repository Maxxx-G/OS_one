X-Tier1: user
X-Agent: copilot
X-Domain: os1p1docs
X-Purpose: contacts-profile-spec
X-Version: v2025.10.06
X-Policy: filename+header compliance required

# OS One - Contacts/Profile Spec (v2025.10.06)

## Purpose
Describe the record structures, API behaviors, and consent gates for storing third-party contact information within OS One.

## Scope
Applies to application services, assistants, and UX surfaces that collect or manage third-party contact data and related media metadata.

## Canonical Location(s)
- Primary: `docs/templates/`
- Archive: `docs/_archive/` (same filename when superseded)

## Dependencies/References
- Third-Party Consent Policy: `docs/templates/user.chatgpt5.os1p1.third-party-consent-policy.v2025.10.06.md`
- Ethics & Consent Policy: `docs/templates/user.chatgpt5.os1p1.ethics-consent-policy.v2025.10.06.md`
- Public-Mode Safety Policy: `docs/templates/user.chatgpt5.os1p1.public-mode-safety.v2025.10.06.md`
- Memory Policy: `docs/templates/user.chatgpt5.os1p1.memory-policy.v2025.10.06.md`
- Memory Engine Spec: `docs/templates/user.chatgpt5.os1p1.memory-spec.v2025.10.06.md`
- Memory UX Guidelines: `docs/templates/user.chatgpt5.os1p1.memory-ux-guidelines.v2025.10.06.md`
- Docs Creation Guidelines: `docs/templates/user.chatgpt5.os1p1.docs-creation-guidelines.v2025.10.05.md`
- Docs Validator Spec: `docs/templates/user.chatgpt5.os1p1.docs-validator-spec.v2025.10.05.md`

## Body

### Record Shapes
```
Contact {
  id: string,
  display_name: string,
  phones: string[],
  emails: string[],
  addresses?: string[],
  tags: string[],
  notes?: string,
  consent_ref?: string,
  created_at: ISO8601,
  sensitivity: 'P2'
}

PhotoMeta {
  id: string,
  contact_id?: string,
  session_id: string,
  uri_or_blobref: string,
  faces?: number,
  consent_ref?: string,
  created_at: ISO8601,
  sensitivity: 'P1'
}
```
- `Contact` entries hold `P2` data (phones, emails, addresses) and inherit user-scope retention rules.
- `PhotoMeta` tracks metadata only; pixel storage requires explicit photo consent per Photo Handling Policy.

### APIs (Conceptual v0)
- `POST /api/contacts/consent`: Issues or refreshes a `consent_ref` tied to specific data categories and TTL.
- `POST /api/contacts/add`: Creates or updates contact records; rejects requests lacking valid `consent_ref` when `P1`/`P2` fields are present.
- `POST /api/contacts/photo`: Stores `PhotoMeta`; only stores binary payloads when `consent_ref` explicitly permits photo retention.
- `DELETE /api/contacts/:id`: Marks the contact for purge; writes tombstone in audit log and triggers Memory revocation flow.

### Rules and Guardrails
- Phones, emails, and addresses are `P2`; photos, audio clips, or biometric signatures are `P1`.
- Public Mode blocks `P1`/`P2` writes unless the session exits Public Mode or consent explicitly allows capture in that mode with audit evidence.
- Outbound sharing (chat export, email, streaming) must redact contact data unless all referenced individuals maintain active consent.
- Speech/Async STOP events pause contact capture endpoints and flush volatile buffers.

### Storage and Naming
- Contacts stored under `memory.user.profile.contact.<slug>.vYYYY.MM.DD.json`.
- Photo metadata stored as `memory.user.profile.contact-photo.<slug>.vYYYY.MM.DD.json`.
- File naming adheres to dot-schema rules; archive superseded records in `_archive/`.

### Observability
- Append-only audit log records actor, action (`consent-issued`, `contact-created`, `photo-meta-added`), `consent_ref`, and mode state.
- Metrics: consent issuance rate, revoked contacts, Public Mode overrides, photo redaction count.

## Stability Guardrails
- Changes delivered via STB must follow the One-Fence Rule and respect the <=5 file change limit.
- Schema or API updates require synchronized revisions to Memory Spec, Photo Handling Policy, and UX guidance.

## Version & Archive
- Update version tag when modifying record schemas, API surface, or enforcement logic.
- Archive prior versions in `docs/_archive/` without changing filenames.

## Acceptance
- API concepts and record shapes enforce consent checks per Third-Party Consent Policy.
- Public Mode gating, storage naming, and sensitivity tiers align with Memory guardrails.
- Document passes Docs Validator with valid references and version alignment.

## Notes
- Future enhancements may include localized consent forms, contact pack imports, and differential privacy analytics for aggregate contact insights.
