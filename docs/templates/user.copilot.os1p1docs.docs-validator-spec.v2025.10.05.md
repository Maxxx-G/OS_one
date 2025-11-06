X-Tier1: user
X-Agent: copilot
X-Domain: os1p1docs
X-Purpose: docs-validator-spec
X-Version: v2025.10.05
X-Policy: filename+header compliance required

# OS One - Docs Validator Spec (v2025.10.05)

## Purpose
Specify lightweight automated checks for documentation compliance.

## Checks (MVP)
1) Filename Regex (Tier-1)
   - Pass if match: ^[a-z0-9]+\.[a-z0-9]+\.[a-z0-9]+\.[a-z0-9-]+\.v\d{4}\.\d{2}\.\d{2}\.[a-z0-9]+$

2) Header Version Match
   - Extract `(vYYYY.MM.DD)` from first H1; must equal filename version.

3) Canonical Path References
   - Warn if references to old paths (for example, `docs/projects/` instead of `docs/project_plans/`).

4) STB Fence Count (when applicable)
   - Count global triple backticks. Must be 0 or exactly 2.

5) Required Sections Presence
   - Ensure Creation Guidelines sections exist in order.

## CLI Behavior (future)
- Exit non-zero on hard failures (regex, header mismatch).
- Print actionable hints for each failed check with exact line numbers.
- Mode flags: `--strict` (CI) and `--advisory` (local).

## Output
- JSON report with per-file status, failed checks, and suggestions.

## Extensibility
- Plug-in model to add domain-specific rules.
- Optional org, culture, or context overlays (via Norms Engine) for tone or style checks.

## References
- Creation Guidelines: `docs/templates/user.chatgpt5.os1p1.docs-creation-guidelines.v2025.10.05.md`
- Validation Checklist: `docs/templates/user.chatgpt5.os1p1.docs-validation-checklist.v2025.10.05.md`
- Filenaming Policy: `docs/templates/user.chatgpt5.os1p1.filenaming-policies.v2025.10.4.md`
- STB template guidance: `docs/templates/user.chatgpt5.os1p1.single-task-block.v2025.09.23.md`
