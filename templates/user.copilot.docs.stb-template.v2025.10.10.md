# OS1 — Single Task Block (STB) Template · v2025.10.10

X-Tier1: user          # {user|assistant}
X-Agent: copilot       # e.g., copilot|codex|chatgpt5|deepseek-r1-8b|gemini-2-pro
X-Domain: docs         # short bucket: docs|templates|kb|ui|api|ops...
X-Purpose: stb-template
X-Version: v2025.10.10
X-Policy: filename+header compliance required

## Context
- What is changing and why (1–3 bullets).
- Repo state assumptions.
- Link to related docs/STBs if applicable.

## Constraints
- File cap ≤5; no new deps; Windows-safe.
- Deterministic/idempotent.
- Must pass `npm run validate:stb` before commit.

## Changes
1. **ADD/EDIT/REPLACE**: `<relative/path>`

   ```<lang-or-text>
   # minimal patch; no ellipses
   # show exact code with context lines
   ```

2. **ADD/EDIT/REPLACE**: `<another/path>`

   ```<lang-or-text>
   # another change
   ```

## Acceptance
- Observable checks (e.g., "no TypeScript errors", "audit report generated").
- Verification commands to prove success.

## Rollback
```powershell
# exact commands to undo changes
git revert <commit-hash>
# or manual file restoration
```

## Commit
```
type(scope): summary

- detail 1
- detail 2
```

---

## Header Field Reference

| Field | Required | Values | Description |
|-------|----------|--------|-------------|
| X-Tier1 | ✅ | `user\|assistant` | Who authored the STB |
| X-Agent | ✅ | `copilot\|codex\|chatgpt5\|deepseek-r1-8b\|gemini-2-pro\|...` | AI agent that will execute |
| X-Domain | ✅ | Short bucket (e.g., `docs\|ui\|api\|kb\|ops`) | Scope/area of change |
| X-Purpose | ✅ | Kebab-case summary | What this STB accomplishes |
| X-Version | ✅ | `vYYYY.MM.DD` | Template version used |
| X-Policy | ✅ | `filename+header compliance required` | Governance requirement |

## Filename Compliance

**Pattern**: `{tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.md`

**Examples**:
- ✅ `user.copilot.ui.overwatch-metrics.v2025.10.09.md`
- ✅ `assistant.deepseek-r1-8b.api.session-persistence.v2025.10.10.md`
- ❌ `stb-overwatch.md` (missing tier1/agent/version)
- ❌ `user.copilot.stb.md` (missing version date)

## Validation

Run before commit:
```powershell
npm run validate:stb
```

This checks:
- Filename matches pattern `{tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.md`
- All required X-* headers present
- Header values match filename components
- Version date is valid (YYYY.MM.DD format)

## Migration Note

Existing STB files without compliant headers should be:
1. Moved to `templates/_archive/` (preserve history)
2. Re-created with compliant headers in `/templates`
3. References updated in docs/codebase
