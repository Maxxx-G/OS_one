X-Tier1: user
X-Agent: copilot
X-Domain: os1p1docs
X-Purpose: third-party-consent-policy
X-Version: v2025.10.06
X-Policy: filename+header compliance required

# OS One - Third-Party Consent Policy (v2025.10.06)

## Purpose
Govern how OS One captures, stores, and revokes non-user (third-party) personal data and media gathered during sessions such as meetups, hangouts, or calls.

## Scope
All assistants, agents, and services that collect or reference personal information belonging to individuals other than the signed-in Owner within OS One experiences.

## Canonical Location(s)
- Primary: `docs/templates/`
- Archive: `docs/_archive/` (same filename when superseded)

## Dependencies/References
- Ethics & Consent Policy: `docs/templates/user.chatgpt5.os1p1.ethics-consent-policy.v2025.10.06.md`
- Public-Mode Safety Policy: `docs/templates/user.chatgpt5.os1p1.public-mode-safety.v2025.10.06.md`
- Memory Policy: `docs/templates/user.chatgpt5.os1p1.memory-policy.v2025.10.06.md`
- Memory Engine Spec: `docs/templates/user.chatgpt5.os1p1.memory-spec.v2025.10.06.md`
- Memory UX Guidelines: `docs/templates/user.chatgpt5.os1p1.memory-ux-guidelines.v2025.10.06.md`
- Docs Creation Guidelines: `docs/templates/user.chatgpt5.os1p1.docs-creation-guidelines.v2025.10.05.md`
- Docs Validator Spec: `docs/templates/user.chatgpt5.os1p1.docs-validator-spec.v2025.10.05.md`

## Body

### Principles
- **Explicit opt-in**: Obtain verifiable consent from each identified third party before persisting any `P1` or `P2` data (names, phones, addresses, photos, voice prints).
- **Visibility**: Surface to the Owner and participants who is recorded, which data classes are stored, and retention timelines.
- **Revocation**: Provide third parties with deletion channels; purge stored data within 24h while retaining audit tombstones only.
- **Public-mode interlock**: When Public Mode is active, block new `P1`/`P2` writes unless both consent exists and Public Mode has been expressly overridden for that interaction.
- **External respect**: Honor bystanders by pausing capture when consent cannot be gathered or is revoked mid-session.

### Consent Surface
- Offer in-session prompts, QR codes, or short links that issue time-bound consent tokens.
- Tokens encode granted data categories (for example, name, email, photo) and expiry (default 30 days unless otherwise specified).
- Store `CONSENT_REF` per Memory Policy and expose in "Why remembered?" UI.

### Storage and Naming
- Contacts persist as `memory.user.profile.contact.<slug>.vYYYY.MM.DD.json` (scope = `user`).
- Photos or media metadata persist as `memory.user.profile.contact-photo.<slug>.vYYYY.MM.DD.json` unless full-image storage is separately approved via STB.
- `P1` assets require encryption at rest once the capability is delivered (tracked in Memory Spec roadmap).

### Enforcement and Logging
- Block all `P1`/`P2` writes when consent tokens are absent, expired, or revoked.
- Public Mode must trigger redaction pipelines and prevent writes of third-party data unless override with audit trail.
- Log every write with `CONSENT_REF`, timestamp, actor, and mode state for auditability.
- Speech/Async STOP events pause capture immediately and invalidate temporary buffers containing third-party data.

## Stability Guardrails
- Future updates embedding STBs must abide by the One-Fence Rule and the <=5 file write limit.
- Policy updates that alter consent token semantics require synchronized revisions to Memory Spec and UX guidelines.

## Version & Archive
- Increment version (`vYYYY.MM.DD`) when modifying consent scopes, storage patterns, or enforcement requirements.
- Relocate superseded versions to `docs/_archive/` with the same filename.

## Acceptance
- Third-party `P1`/`P2` capture is impossible without explicit consent recorded in `CONSENT_REF` fields.
- Public Mode gating and revocation flows align with Public-Mode Safety and Memory guardrails.
- Document passes Docs Validator checks with references resolving to canonical paths.

## Notes
- Future work may include locale-specific consent language, mobile quick-consent flows, and integration with an External Respect guideline once published.
