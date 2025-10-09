# Templates Directory Usage Guide

**Last Updated**: 2025-10-09  
**Status**: Active  

---

## Quick Start

### Creating a New STB

1. **Copy the canonical template**:
   ```powershell
   cp templates/user.copilot.docs.stb-template.v2025.10.10.md `
      templates/user.copilot.{domain}.{your-purpose}.v2025.10.10.md
   ```

2. **Update headers** to match your filename:
   ```markdown
   X-Tier1: user
   X-Agent: copilot
   X-Domain: ui          # ← change to match filename
   X-Purpose: your-purpose  # ← change to match filename
   X-Version: v2025.10.10
   X-Policy: filename+header compliance required
   ```

3. **Validate before committing**:
   ```powershell
   npm run validate:stb
   ```

4. **Fill in your content** (Context, Constraints, Changes, etc.)

---

## Filename Pattern

**Format**: `{tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.md`

| Component | Values | Examples |
|-----------|--------|----------|
| `tier1` | `user`, `assistant` | Who authored the STB |
| `agent` | `copilot`, `codex`, `chatgpt5`, `deepseek-r1-8b`, `gemini-2-pro` | Which AI agent executes it |
| `domain` | `ui`, `api`, `docs`, `kb`, `ops`, `templates` | Scope of changes |
| `purpose` | Kebab-case summary | `overwatch-metrics`, `session-persistence`, `stb-template` |
| Version | `v{YYYY}.{MM}.{DD}` | ISO 8601 date (e.g., `v2025.10.09`) |

**Valid Examples**:
```
✅ user.copilot.ui.overwatch-metrics.v2025.10.09.md
✅ assistant.deepseek-r1-8b.api.session-persistence.v2025.10.10.md
✅ user.copilot.docs.stb-template.v2025.10.10.md
```

**Invalid Examples**:
```
❌ stb-feature.md                    (missing tier1/agent/version)
❌ user.copilot.feature.md           (missing domain and version)
❌ copilot.ui.feature.v2025.10.md    (missing tier1)
```

---

## Required Headers

Every STB **must** include these 6 headers:

```markdown
X-Tier1: user          # or assistant
X-Agent: copilot       # or codex, chatgpt5, etc.
X-Domain: docs         # short scope bucket
X-Purpose: stb-template
X-Version: v2025.10.10
X-Policy: filename+header compliance required
```

**Critical**: Header values **must match** filename components!

---

## Validation

### Run Validator

```powershell
# Validate all templates
npm run validate:stb

# Validate specific file
node scripts/validate_stb_headers.mjs templates/user.copilot.docs.stb-template.v2025.10.10.md
```

### Success Output
```
✅ All STB files are compliant!
```

### Failure Output
```
❌ user.copilot.bad.md
   ⮑ Filename does not match pattern: {tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.md
```

**Fix errors before committing!**

---

## Common Domains

| Domain | Description | Example STBs |
|--------|-------------|--------------|
| `ui` | Frontend components, pages, styles | `ui.overwatch-sidebar`, `ui.voice-controls` |
| `api` | Backend endpoints, services | `api.session-persistence`, `api.tts-proxy` |
| `docs` | Documentation updates | `docs.project-plan`, `docs.stb-template` |
| `kb` | Knowledge base articles | `kb.bmad-protocol`, `kb.governance` |
| `ops` | DevOps, scripts, infra | `ops.docker-compose`, `ops.ci-pipeline` |
| `templates` | Template files themselves | `templates.stb-v2`, `templates.persona` |

---

## Archival Process

When replacing/deprecating an STB:

1. **Move old version to `_archive/`**:
   ```powershell
   mv templates/old-stb.md `
      templates/_archive/old-stb.archived.$(Get-Date -Format 'yyyy-MM-dd').md
   ```

2. **Create new compliant version** (if needed)

3. **Never delete** - archive preserves history

---

## Pre-Commit Hook (Optional)

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/sh
npm run validate:stb || exit 1
```

This blocks commits with non-compliant STB files.

---

## See Also

- [templates/user.copilot.docs.stb-template.v2025.10.10.md](./user.copilot.docs.stb-template.v2025.10.10.md) - Canonical template
- [docs/STB_VALIDATION.md](../docs/STB_VALIDATION.md) - Full validation documentation
- [templates/README.md](./README.md) - Template directory governance
- [docs/REPO_AUDIT.md](../docs/REPO_AUDIT.md) - Repository health auditing
