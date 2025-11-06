# STB Filename & Header Policy

X-Tier1: user
X-Agent: copilot
X-Domain: docs
X-Purpose: stb-filename-header-policy
X-Version: v2025.10.10
X-Policy: filename+header compliance required

## Purpose

Defines the official filename and header schema for Single Task Block (STB) documents and related governance files in OS One. Ensures consistent naming, traceability, and automated validation.

## Filename Schema (Tier-1)

**Pattern:** `<tier1>.<agent>.<project/phase>.<purpose>.v<yyyy.mm.dd>.<ext>`

| Segment | Description | Valid Values |
|---------|-------------|--------------|
| tier1 | Request origin | `user`, `assistant` |
| agent | Agent identifier | `copilot`, `chatgpt5`, `kharma`, etc. |
| project/phase | Project and phase | `os1p1`, `os1p2`, etc. |
| purpose | Document purpose | Hyphenated lowercase (e.g., `project-plan`) |
| version | Date-based version | `vYYYY.MM.DD` format |
| ext | File extension | `md`, `ps1`, `json`, `yaml`, `yml`, `ts`, `tsx` |

**Examples:**
- `user.chatgpt5.os1p1.project-plan.v2025.10.10.md`
- `user.copilot.os1p1.security-headers.v2025.10.10.ps1`
- `assistant.kharma.os1p2.agent-config.v2025.10.11.json`

## Filename Schema (Tier-2)

**Pattern:** `<agent>.<project/phase>.<purpose>.v<yyyy.mm.dd>.<ext>`

For inter-programmed creation by agents to achieve goals unknown to top tier.

**Examples:**
- `chatgpt5.os1p1.filenaming-policy.v2025.10.04.md`
- `codex.os1p1.lint-report.v2025.10.04.md`

## Extended Project/Component Identifier Convention · Added v2025.10.11

When a repository covers multiple subsystems or phases of OS One, the **third filename segment** (the "project/phase" field) may itself be a **compound identifier** combining:
- The system name (e.g., `os1`)
- The phase indicator (e.g., `p1`, `p2`)
- The component or sector (e.g., `webui`, `api`, `workbench`, `bmad`, `archon`, `cv`)

These are concatenated without separators **except where clarity requires a dash**.

**Examples:**
- `user.copilot.os1p1webui.chat-interface-init.v2025.10.11.md`
- `user.copilot.os1p1webui.sidebar-init.v2025.10.11.md`
- `user.copilot.os1p1api.auth-endpoints.v2025.10.11.ts`
- `user.copilot.os1p2workbench.agent-linker.v2025.10.11.md`

### Updated Schema Pattern

`<tier1>.<agent>.<projectPhaseComponent>.<purpose>.v<yyyy.mm.dd>.<ext>`

### Updated Regex

```regex
^(user|assistant)\.[a-z0-9-]+\.[a-z0-9-]+(?:p\d+[a-z0-9-]*)?\.([a-z0-9-]+)\.v\d{4}\.\d{2}\.\d{2}\.(md|ps1|json|yaml|yml|ts|tsx)$
```

### Backward Compatibility

All previously valid filenames (e.g., `user.chatgpt5.os1p1.project-plan.v2025.10.10.md`) remain valid.  
The validator treats compound identifiers as an accepted superset.

### Enforcement

- The `validate_stb_headers.mjs` script automatically accepts extended project identifiers.
- Filenames failing to match the pattern will trigger the validator's "non-compliant filename" error with a note suggesting the extended format.

## Required Headers (Markdown Files)

All STB markdown files must include these headers in the first content block:

```markdown
X-Tier1: user|assistant
X-Agent: <agent-name>
X-Domain: <domain>
X-Purpose: <purpose-slug>
X-Version: v<yyyy.mm.dd>
X-Policy: <policy-reference>
```

**Header Validation Rules:**
- `X-Tier1` must match filename tier1 segment
- `X-Agent` must match filename agent segment
- `X-Domain` must match filename project/phase segment (or compound identifier)
- `X-Purpose` must match filename purpose segment
- `X-Version` must match filename version segment
- `X-Policy` describes applicable governance policy

## Canonical Locations

- **Templates & Policies:** `docs/templates/`, `docs/policies/`
- **Project Plans (all versions):** `docs/project_plans/`
- **Reports:** `docs/reports/`
- **Archives (superseded):** `docs/_archive/` (mirror original subfolder)

## Version & Archive

- Bump the date portion `vYYYY.MM.DD` when issuing a content change.
- Move superseded files to `docs/_archive/` with the **same filename**.
- Keep exactly one active version per document in its canonical folder.

## Validation Regex (Legacy)

### Tier 1
```regex
^[a-z0-9]+\.[a-z0-9]+\.[a-z0-9]+\.[a-z0-9-]+\.v\d{4}\.\d{2}\.\d{2}\.[a-z0-9]+$
```

### Tier 2
```regex
^[a-z0-9]+\.[a-z0-9]+\.[a-z0-9-]+\.v\d{4}\.\d{2}\.\d{2}\.[a-z0-9]+$
```

## Guardrails

- Max **5 files** per change set (STB rule); prefer 1–3 for policy edits.
- Enforce dot-naming in CI or pre-commit scripts where available.
- Reject names with uppercase or extra symbols beyond hyphen in `purpose`.
- Use `npm run validate:stb` to check compliance before commit.

## Automated Validation

The `scripts/validate_stb_headers.mjs` script enforces:
1. Filename pattern compliance (Tier-1 or Tier-2)
2. Header presence and format
3. Header-filename value alignment
4. Supported file extensions

**Usage:**
```bash
npm run validate:stb
node scripts/validate_stb_headers.mjs path/to/file.md
```

## Notes

- This policy is the **single source of truth** for STB filename and header schemas.
- Folder naming is generally free-form, except `_archive/` which is explicitly sanctioned as a hidden/inactive repository for old versions.
- Any duplicates must link back here.
- Leading underscore (`_archive/`) signals non-active content.
