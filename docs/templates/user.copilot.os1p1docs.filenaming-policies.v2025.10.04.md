X-Tier1: user
X-Agent: copilot
X-Domain: os1p1docs
X-Purpose: filenaming-policies
X-Version: v2025.10.04
X-Policy: filename+header compliance required

# ops.one.policy.filenaming pointer

## Purpose

Anchors the file naming guardrail for OS.One docs and templates.

## Schema

# Tier 1. the request is made by top tier personnel ie USer or Assistant

`<assistant>.<agent>.<project/phase>.<purpose or desc>.v<yyyy.mm.dd>.<ext>`
# eg. user.chatgpt5.os1p1.verbs-reference.v2025.09.26.md


# Tier 2. inter programmed creation by agent to achieve a goal unknown to top tier
`<agent>.<project/phase>.<purpose or desc>.v<yyyy.mm.dd>.<ext>`
**Examples**
- `chatgpt5.os1p1.filenaming-policy.v2025.10.04.md`
- `codex.os1p1.lint-report.v2025.10.04.md`

## Validation Regex

Use either:

- **Tier 1** 
^[a-z0-9]+\.[a-z0-9]+\.[a-z0-9]+\.[a-z0-9-]+\.v\d{4}\.\d{2}\.\d{2}\.[a-z0-9]+$

or

- **Tier 2**
^[a-z0-9]+\.[a-z0-9]+\.[a-z0-9-]+\.v\d{4}\.\d{2}\.\d{2}\.[a-z0-9]+$

## Canonical Locations
- **Templates & Policies:** `docs/templates/`
- **Project Plans (all versions):** `docs/project_plans/`
- **Archives (superseded):** `docs/_archive/` (mirror original subfolder)
- **Special Folder:** `_archive/` is reserved for inactive or superseded docs. Leading underscore signals non-active content. Files inside must still follow dot-schema naming.

## Version & Archive
- Bump the date portion `vYYYY.MM.DD` when issuing a content change.
- Move superseded files to `docs/_archive/` with the **same filename**.
- Keep exactly one active version per document in its canonical folder.

## Guardrails
- Max **5 files** per change set (STB rule); prefer 1–3 for policy edits.
- Enforce dot-naming in CI or pre-commit scripts where available.
- Reject names with uppercase or extra symbols beyond hyphen in `purpose`.

## Notes
This pointer is the **single source of truth**. Any duplicates must link back here.
Folder naming is generally free-form, except `_archive/` which is explicitly sanctioned as a hidden/inactive repository for old versions.

