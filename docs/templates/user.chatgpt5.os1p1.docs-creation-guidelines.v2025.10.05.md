# OS One - Documentation Creation Guidelines (v2025.10.05)

## Purpose
Standardize how contributors create, organize, and version OS One documentation.

## Scope
Applies to all knowledge artifacts (policies, specs, templates, plans) stored in this repo.

## Required Sections (in order)
1. Title with version tag `(vYYYY.MM.DD)`
2. Purpose
3. Scope (or Audience)
4. Canonical Location(s)
5. Dependencies/References (link to other policies/specs)
6. Body (structured, concise, modular)
7. Stability Guardrails (One-Fence Rule if doc contains STBs)
8. Version & Archive
9. Acceptance (what makes this doc "ready")
10. Notes

## Naming and Versioning
- Must follow dot-schema Tier-1 format: `<assistant>.<agent>.<project_or_phase>.<purpose>.vYYYY.MM.DD.md`
- Use lowercase; digits allowed; hyphen only in `<purpose>`.
- Header version must match filename version exactly.

## Canonical Locations
- Templates or policies: `docs/templates/`
- Project plans: `docs/project_plans/`
- Archive superseded docs: `docs/_archive/` (files inside still follow dot-schema)

## Writing Rules
- Be concise, deep, and modular.
- Avoid nested code fences in STBs. Use the One-Fence Rule and 4-space indentation.
- Link policies by path (relative), not by title alone.

## Acceptance (for any new doc)
- Passes validation checklist (see Validation Checklist).
- Filename matches regex (Tier-1).
- Header includes matching `vYYYY.MM.DD`.
- References resolve to existing paths.
- If doc embeds STBs, they comply with the One-Fence Rule.

## References
- Filenaming Policy: `docs/templates/user.chatgpt5.os1p1.filenaming-policies.v2025.10.4.md`
- STB One-Fence guidance: `docs/templates/user.chatgpt5.os1p1.single-task-block.v2025.09.23.md`
- System communications policy: `docs/templates/user.chatgpt5.os1p1.system-instructions-block.v2025.09.17.md`
- Speech and async guidance: `docs/templates/user.chatgpt5.os1p1.verbs-reference.v2025.09.26.md`
