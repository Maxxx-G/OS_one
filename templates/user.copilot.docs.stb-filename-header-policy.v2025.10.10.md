# OS1 — STB Filename & Header Policy · v2025.10.10

X-Tier1: user
X-Agent: copilot
X-Domain: docs
X-Purpose: stb-filename-header-policy
X-Version: v2025.10.10
X-Policy: filename+header compliance required

---

## Overview

This policy defines the **canonical filename schema** and **required header metadata** for all Single Task Block (STB) files, templates, and agent-critical documents in the OS1 repository.

**Enforcement**: Pre-commit validation via `npm run validate:stb`

---

## Filename Schema (Tier-1)

### Pattern
```
{tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.{ext}
```

### Components

| Component | Pattern | Description | Examples |
|-----------|---------|-------------|----------|
| `tier1` | `user\|assistant` | Who authored the file | `user`, `assistant` |
| `agent` | `[a-z0-9-]+` | AI agent identifier | `copilot`, `codex`, `chatgpt5`, `deepseek-r1-8b`, `gemini-2-pro` |
| `domain` | `[a-z0-9-]+` | Short scope bucket | `docs`, `templates`, `kb`, `ui`, `api`, `ops`, `audio`, `memory` |
| `purpose` | `[a-z0-9-]+` | Kebab-case summary | `stb-template`, `overwatch-metrics`, `session-persistence` |
| `version` | `v{YYYY}.{MM}.{DD}` | ISO 8601 date | `v2025.10.10`, `v2025.12.31` |
| `ext` | See below | File extension | `md`, `ps1`, `json`, `yaml`, `yml`, `ts`, `tsx` |

### Supported Extensions

| Extension | Use Case | Example |
|-----------|----------|---------|
| `.md` | Markdown docs, STBs, templates | `user.copilot.docs.stb-template.v2025.10.10.md` |
| `.ps1` | PowerShell scripts | `user.copilot.ops.deployment-script.v2025.10.10.ps1` |
| `.json` | Config, data files | `user.copilot.templates.agent-config.v2025.10.10.json` |
| `.yaml`, `.yml` | YAML configs | `user.copilot.ops.docker-compose.v2025.10.10.yaml` |
| `.ts`, `.tsx` | TypeScript source | `user.copilot.ui.voice-controls.v2025.10.10.tsx` |

### Filename Regex

```regex
^(user|assistant)\.[a-z0-9\-]+\.[a-z0-9\-]+\.[a-z0-9\-]+\.v\d{4}\.\d{2}\.\d{2}\.(md|ps1|json|yaml|yml|ts|tsx)$
```

### Valid Examples

```
✅ user.copilot.docs.stb-template.v2025.10.10.md
✅ assistant.deepseek-r1-8b.api.session-persistence.v2025.10.09.ts
✅ user.copilot.ops.deployment-script.v2025.10.10.ps1
✅ assistant.chatgpt5.templates.agent-config.v2025.10.10.json
✅ user.codex.ui.overwatch-sidebar.v2025.10.09.tsx
```

### Invalid Examples

```
❌ stb-template.md                              (missing tier1, agent, version)
❌ user.copilot.stb-template.md                 (missing domain and version)
❌ user.copilot.docs.template.md                (missing version)
❌ user.copilot.docs.template.2025.10.10.md     (wrong version format - use v2025.10.10)
❌ user.copilot.docs.STB_Template.v2025.10.10.md (uppercase/underscores not allowed)
```

---

## Required STB Header Keys

### Location
Headers **must** appear within the **first 40 lines** of the file (after title, before main content).

### Required Keys

```markdown
X-Tier1: user|assistant
X-Agent: <agent-id>
X-Domain: <short-bucket>
X-Purpose: <kebab-case-summary>
X-Version: vYYYY.MM.DD
X-Policy: filename+header compliance required
```

### Header Regex Patterns

| Header | Pattern | Example |
|--------|---------|---------|
| `X-Tier1` | `^X-Tier1:\s+(user\|assistant)$` | `X-Tier1: user` |
| `X-Agent` | `^X-Agent:\s+[a-z0-9\-]+$` | `X-Agent: copilot` |
| `X-Domain` | `^X-Domain:\s+[a-z0-9\-]+$` | `X-Domain: docs` |
| `X-Purpose` | `^X-Purpose:\s+[a-z0-9\-]+$` | `X-Purpose: stb-template` |
| `X-Version` | `^X-Version:\s+v\d{4}\.\d{2}\.\d{2}$` | `X-Version: v2025.10.10` |
| `X-Policy` | `^X-Policy:.*filename\+header compliance.*$` | `X-Policy: filename+header compliance required` |

### Header-Filename Consistency

The validator **cross-checks** that header values match filename components:

```markdown
# Filename: user.copilot.docs.stb-template.v2025.10.10.md

X-Tier1: user          # ← must match "user" in filename
X-Agent: copilot       # ← must match "copilot" in filename
X-Domain: docs         # ← must match "docs" in filename
X-Purpose: stb-template # ← must match "stb-template" in filename
X-Version: v2025.10.10 # ← must match "v2025.10.10" in filename
```

**Mismatch = Validation Error**

---

## Enforcement

### Pre-Commit Validation

**Command**: `npm run validate:stb`

**Validates**:
1. ✅ Filename matches pattern
2. ✅ All required headers present (within first 40 lines)
3. ✅ Header values match filename components
4. ✅ Date format valid (YYYY.MM.DD)
5. ✅ Tier1 is `user` or `assistant`
6. ✅ Extension is supported

**Scope**: Files under:
- `/templates/**/*.{md,ps1,json,yaml,yml,ts,tsx}`
- `/docs/templates/**/*.{md,ps1,json,yaml,yml,ts,tsx}`

**Exemptions** (auto-skipped):
- `README.md`, `QUICK_REFERENCE.md`, `USAGE.md`, `GUIDE.md`, `INDEX.md`
- Files in `_archive/` directories
- Non-matching file extensions

### Pre-Commit Hook (Optional)

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/sh
npm run validate:stb || exit 1
```

This blocks commits with non-compliant STB files.

---

## Domain Buckets Reference

| Domain | Scope | Example STBs |
|--------|-------|--------------|
| `docs` | Documentation, policies, guides | `stb-template`, `project-plan`, `handover` |
| `templates` | Template files, schemas | `system-instructions-template`, `persona-template` |
| `kb` | Knowledge base articles | `bmad-protocol`, `governance-model` |
| `ui` | Frontend components, pages, styles | `overwatch-sidebar`, `voice-controls`, `personas-ui` |
| `api` | Backend endpoints, services | `session-persistence`, `tts-proxy`, `chat-api` |
| `ops` | DevOps, scripts, infrastructure | `docker-compose`, `ci-pipeline`, `deployment` |
| `audio` | Audio processing, TTS, STT | `voice-input`, `tts-stream`, `audio-events` |
| `memory` | Memory, state, persistence | `session-state`, `prefs-storage`, `cache-manager` |

**Add new domains** as needed - keep them lowercase, kebab-case, under 15 chars.

---

## Common Validation Errors

### Error 1: Filename Pattern Mismatch

```
❌ user.copilot.stb-template.v2025.10.10.md
   ⮑ Filename does not match pattern: {tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.{ext}
```

**Fix**: Missing `domain` component. Should be:
```
✅ user.copilot.docs.stb-template.v2025.10.10.md
```

### Error 2: Header Missing

```
❌ user.copilot.docs.feature.v2025.10.10.md
   ⮑ Missing required header: X-Tier1
```

**Fix**: Add header within first 40 lines:
```markdown
X-Tier1: user
```

### Error 3: Header-Filename Mismatch

```
❌ user.copilot.docs.stb-template.v2025.10.10.md
   ⮑ X-Purpose header "single-task-block-template" does not match filename purpose "stb-template"
```

**Fix**: Update header to match filename:
```markdown
X-Purpose: stb-template
```

### Error 4: Invalid Tier1

```
❌ X-Tier1: admin
   ⮑ Invalid tier1 "admin" - must be one of: user, assistant
```

**Fix**: Use only `user` or `assistant`:
```markdown
X-Tier1: user
```

### Error 5: Invalid Date

```
❌ user.copilot.docs.feature.v2025.13.01.md
   ⮑ Invalid month "13" - must be 01-12
```

**Fix**: Use valid month (01-12):
```
✅ user.copilot.docs.feature.v2025.12.01.md
```

---

## Migration Guide

### Step 1: Identify Non-Compliant Files

```powershell
npm run validate:stb
```

Review output for validation errors.

### Step 2: Archive Old Files

```powershell
# Move to archive
mv templates/old-stb.md `
   templates/_archive/old-stb.archived.$(Get-Date -Format 'yyyy-MM-dd').md
```

### Step 3: Create Compliant Versions

```powershell
# Copy template
cp templates/user.copilot.docs.stb-template.v2025.10.10.md `
   templates/user.copilot.{domain}.{purpose}.v2025.10.10.md

# Edit headers to match filename
# Validate
npm run validate:stb
```

### Step 4: Update References

Update all code/docs that reference the old filename.

---

## Non-Markdown STB Examples

### PowerShell Script STB

**Filename**: `user.copilot.ops.port-guard.v2025.10.10.ps1`

**Headers** (in comments):
```powershell
<#
X-Tier1: user
X-Agent: copilot
X-Domain: ops
X-Purpose: port-guard
X-Version: v2025.10.10
X-Policy: filename+header compliance required
#>

# Script content...
```

### JSON Config STB

**Filename**: `user.copilot.templates.agent-config.v2025.10.10.json`

**Headers** (in JSON):
```json
{
  "_metadata": {
    "X-Tier1": "user",
    "X-Agent": "copilot",
    "X-Domain": "templates",
    "X-Purpose": "agent-config",
    "X-Version": "v2025.10.10",
    "X-Policy": "filename+header compliance required"
  },
  "config": { ... }
}
```

### TypeScript STB

**Filename**: `user.copilot.ui.voice-controls.v2025.10.10.tsx`

**Headers** (in comments):
```typescript
/**
 * X-Tier1: user
 * X-Agent: copilot
 * X-Domain: ui
 * X-Purpose: voice-controls
 * X-Version: v2025.10.10
 * X-Policy: filename+header compliance required
 */

export function VoiceControls() { ... }
```

---

## Validation Output Reference

### Success

```
🔍 STB Header Validation

📁 Scanning /templates directory...
📄 Found 3 file(s) to validate

✅ user.copilot.docs.stb-template.v2025.10.10.md
✅ user.copilot.templates.system-instructions-template.v2025.10.10.md
✅ user.copilot.ops.deployment.v2025.10.10.ps1

────────────────────────────────────────────────────────────
✅ Valid: 3
❌ Invalid: 0
────────────────────────────────────────────────────────────

✅ All STB files are compliant!
```

**Exit Code**: 0

### Failure

```
🔍 STB Header Validation

📁 Scanning /templates directory...
📄 Found 2 file(s) to validate

❌ bad-stb.md
   ⮑ Filename does not match pattern: {tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.{ext}

❌ user.copilot.docs.feature.v2025.10.10.md
   ⮑ Missing required header: X-Tier1

────────────────────────────────────────────────────────────
✅ Valid: 0
❌ Invalid: 2
────────────────────────────────────────────────────────────

❌ Validation failed! Fix errors before committing.
```

**Exit Code**: 1

---

## See Also

- [templates/user.copilot.docs.stb-template.v2025.10.10.md](./user.copilot.docs.stb-template.v2025.10.10.md) - STB template
- [docs/STB_VALIDATION.md](../docs/STB_VALIDATION.md) - Detailed validation guide
- [templates/README.md](./README.md) - Template governance
- [scripts/validate_stb_headers.mjs](../scripts/validate_stb_headers.mjs) - Validator source

---

## Version History

### v2025.10.10
- Initial policy document created
- Filename pattern: `{tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.{ext}`
- Supported extensions: `.md`, `.ps1`, `.json`, `.yaml`, `.yml`, `.ts`, `.tsx`
- Required headers: X-Tier1, X-Agent, X-Domain, X-Purpose, X-Version, X-Policy
- Pre-commit enforcement via `npm run validate:stb`
