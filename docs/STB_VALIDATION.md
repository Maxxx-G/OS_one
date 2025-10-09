# STB Header Validation Protocol

**Version**: v2025.10.10  
**Status**: Active  
**Scope**: All STB files in `/templates`  

---

## Overview

This protocol enforces **Tier-1 (user/assistant) + Tier-2 (agent)** compliance for all Single Task Block (STB) files in the OS1 repository. It ensures that both **filenames** and **file headers** contain required metadata for governance, auditability, and agent coordination.

## What It Checks

### 1. Filename Pattern

**Required Format**: `{tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.md`

**Components**:
- `{tier1}` → `user` or `assistant` (who authored it)
- `{agent}` → AI agent identifier (e.g., `copilot`, `deepseek-r1-8b`, `chatgpt5`)
- `{domain}` → Short scope bucket (e.g., `docs`, `ui`, `api`, `kb`, `ops`)
- `{purpose}` → Kebab-case summary of what it does
- `v{YYYY}.{MM}.{DD}` → Version date (ISO 8601 fragment)

**Examples**:
```
✅ user.copilot.ui.overwatch-metrics.v2025.10.09.md
✅ assistant.deepseek-r1-8b.api.session-persistence.v2025.10.10.md
✅ user.copilot.stb-template.v2025.10.10.md

❌ stb-overwatch.md (missing tier1/agent/version)
❌ user.copilot.stb.md (missing version date)
❌ copilot.ui.feature.md (missing tier1)
```

### 2. Required Headers

Every STB file **must** include these headers in the front matter:

```markdown
X-Tier1: user          # {user|assistant}
X-Agent: copilot       # e.g., copilot|codex|chatgpt5|deepseek-r1-8b|gemini-2-pro
X-Domain: docs         # short bucket: docs|templates|kb|ui|api|ops...
X-Purpose: single-task-block-template
X-Version: v2025.10.10
X-Policy: filename+header compliance required
```

### 3. Header-Filename Consistency

The validator **cross-checks** that:
- `X-Tier1` matches `{tier1}` in filename
- `X-Agent` matches `{agent}` in filename
- `X-Domain` matches `{domain}` in filename
- `X-Purpose` matches `{purpose}` in filename
- `X-Version` matches `v{YYYY}.{MM}.{DD}` in filename
- `X-Policy` contains the phrase "filename+header compliance"

---

## Usage

### Run Validation

**Validate all STB files in `/templates`:**
```powershell
npm run validate:stb
```

**Validate specific file(s):**
```powershell
node scripts/validate_stb_headers.mjs templates/user.copilot.stb-template.v2025.10.10.md
```

### Pre-Commit Hook (Recommended)

Add to `.git/hooks/pre-commit` (or use Husky):
```bash
#!/bin/sh
npm run validate:stb || exit 1
```

This prevents commits if STB files fail validation.

---

## Interpreting Results

### Success Output
```
🔍 STB Header Validation

📁 Scanning /templates directory...
📄 Found 2 markdown file(s) to validate

✅ user.copilot.stb-template.v2025.10.10.md
✅ assistant.deepseek-r1-8b.api.example.v2025.10.09.md

────────────────────────────────────────────────────────────
✅ Valid: 2
❌ Invalid: 0
────────────────────────────────────────────────────────────

✅ All STB files are compliant!
```
**Exit Code**: 0

### Failure Output
```
🔍 STB Header Validation

📁 Scanning /templates directory...
📄 Found 1 markdown file(s) to validate

❌ user.copilot.bad-stb.md
   ⮑ Filename does not match pattern: {tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.md

────────────────────────────────────────────────────────────
✅ Valid: 0
❌ Invalid: 1
────────────────────────────────────────────────────────────

❌ Validation failed! Fix errors before committing.
```
**Exit Code**: 1

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Filename does not match pattern` | Missing tier1, agent, or version | Rename file to match `{tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.md` |
| `Missing required header: X-Tier1` | Header not found | Add `X-Tier1: user` (or `assistant`) to file |
| `X-Agent header "codex" does not match filename agent "copilot"` | Mismatch between header and filename | Update header to match filename or vice versa |
| `Invalid tier1 "admin"` | Unsupported tier1 value | Use only `user` or `assistant` |
| `X-Policy must include "filename+header compliance"` | Policy text missing | Add exact phrase to `X-Policy` header |

---

## Integration with Workflow

### 1. Creating New STB

```powershell
# Copy canonical template
cp templates/user.copilot.stb-template.v2025.10.10.md templates/user.copilot.ui.my-feature.v2025.10.10.md

# Edit headers to match filename
# Update X-Domain: ui
# Update X-Purpose: my-feature
# ... (keep tier1, agent, version consistent)

# Validate before committing
npm run validate:stb
```

### 2. Migrating Old STBs

For non-compliant STB files:

```powershell
# 1. Move to archive
mv docs/old-stb.md templates/_archive/old-stb.archived.$(date +%Y-%m-%d).md

# 2. Create compliant version
cp templates/user.copilot.stb-template.v2025.10.10.md templates/user.copilot.docs.old-stb-migrated.v2025.10.10.md

# 3. Update headers and content

# 4. Validate
npm run validate:stb

# 5. Update references in codebase/docs
```

### 3. CI/CD Integration

Add to GitHub Actions workflow:
```yaml
- name: Validate STB Headers
  run: npm run validate:stb
```

---

## Exemptions

The validator **automatically skips**:
- Files in `templates/_archive/` (archived templates)
- `README.md` files (documentation)
- Non-`.md` files

---

## Troubleshooting

### "Could not read directory /templates"
**Cause**: `/templates` directory doesn't exist  
**Fix**: Create directory or run from repository root

### "npm run validate:stb" command not found
**Cause**: Script not in `package.json`  
**Fix**: Verify `"validate:stb": "node scripts/validate_stb_headers.mjs"` exists in scripts section

### Validator passes but file looks wrong
**Cause**: Headers parsed incorrectly (comments, spacing)  
**Fix**: Ensure headers follow exact format:
```markdown
X-Tier1: user          # comment after value is OK
X-Agent: copilot
```

### Windows line ending issues
**Cause**: Git autocrlf or editor settings  
**Fix**: Validator handles both `\n` and `\r\n` line endings

---

## Policy Reference

**Governance Doc**: `/governance/README.v2025.10.06.md`  
**Template Location**: `/templates/user.copilot.stb-template.v2025.10.10.md`  
**Validation Script**: `/scripts/validate_stb_headers.mjs`  

**Enforcement**: All STB commits to `main` or release branches MUST pass validation.

---

## Changelog

### v2025.10.10
- Initial protocol created
- Validation script implemented
- Pre-commit integration documented
- Filename + header cross-check added

---

## See Also

- [templates/README.md](../templates/README.md) - Template directory governance
- [docs/REPO_AUDIT.md](./REPO_AUDIT.md) - Repository health auditing
- [governance/README.v2025.10.06.md](../governance/README.v2025.10.06.md) - Governance model
