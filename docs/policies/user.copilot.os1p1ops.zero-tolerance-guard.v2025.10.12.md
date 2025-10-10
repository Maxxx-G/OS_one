# Zero-Tolerance Compliance Guard — Policy
**X-Tier1:** user  
**X-Agent:** copilot  
**X-Domain:** os1p1ops  
**X-Purpose:** zero-tolerance-compliance-guard  
**X-Version:** v2025.10.12  
**X-Policy:** filename+header compliance required

**STB Reference:** user.copilot.os1p1ops.zero-tolerance-guard.v2025.10.12.md

---

## Purpose

Lock the OS One repository to **zero-tolerance** compliance: non-compliant filenames, missing headers, or unsafe tracked files cannot land. Enforcement occurs at:
- **Local**: Pre-commit hooks block non-compliant commits
- **CI**: GitHub Actions hard-fail on push/PR with violations

---

## Rules Enforced

### 1. Filename Compliance

**Global Pattern** (all tracked text files except exemptions):
```regex
^(user|assistant)\.[a-z0-9\-]+\.[a-z0-9\-]+(?:p\d+[a-z0-9\-]*)?\.[a-z0-9\-]+\.v\d{4}\.\d{2}\.\d{2}\.(md|ps1|json|yaml|yml|ts|tsx)$
```

**Project Plan Pattern** (`docs/project_plans/**` only):
```regex
^(user|assistant)\.[a-z0-9\-]+\.os1p\d+[a-z0-9\-]*\.project-plan\.v\d{4}\.\d{2}\.\d{2}\.md$
```

**Examples**:
- ✅ `user.copilot.os1p1webui.chat-interface.v2025.10.12.md`
- ✅ `user.copilot.os1p1ops.zero-tolerance-guard.v2025.10.12.md`
- ✅ `user.copilot.os1p1.project-plan.v2025.10.10.md` (in `docs/project_plans/`)
- ❌ `PLAN_v2025.10.10.md` (missing compound identifier)
- ❌ `my-feature.md` (no version, no domain)

### 2. Required Headers

All `.md`, `.ps1`, `.ts`, `.tsx`, `.json`, `.yaml`, `.yml` files must include:
```yaml
X-Tier1: user | assistant
X-Agent: copilot | chatgpt5 | ...
X-Domain: os1p1webui | os1p1ops | os1p2madm | ...
X-Purpose: brief-description-kebab-case
X-Version: v2025.MM.DD
X-Policy: policy-name or "compliant" or "none"
```

### 3. Forbidden Paths (Git-Tracked)

**Hard-fail** if these paths are tracked in Git:
- `data/vault/**` (encrypted vault files)
- `data/embeddings/**` (learned memory vectors)

These directories must remain excluded via `.gitignore`.

### 4. Policy/Template STB Reference

Files in `docs/policies/` or `docs/templates/` must reference their originating STB document:
```markdown
**STB Reference:** user.copilot.os1p1ops.zero-tolerance-guard.v2025.10.12.md
```

---

## Exemptions

The following files are **exempt** from filename pattern checks:
- All-caps documentation: `README.md`, `INDEX.md`, `CHANGELOG.md`, `LICENSE.md`, etc.
- `node_modules/**` (dependencies)
- `.git/**` (version control metadata)
- `_archive/**` or `archives/**` (historical files)

---

## CI Behavior

**GitHub Actions Workflow**: `.github/workflows/guardian.yml`

**Current Status**: **STAGED ROLLOUT** - Manual trigger only

Triggers:
- `workflow_dispatch` (manual trigger via GitHub Actions UI)
- ~~`push` to `main` or `codex/ci-exercise`~~ (disabled during rollout)
- ~~All `pull_request` events~~ (disabled during rollout)

Jobs:
1. **Run Zero-Tolerance Guardian**: `node scripts/checks/stb_guard.mjs`
2. **STB Header Validator**: `npm run validate:stb`

**Rollout Plan**:
1. **Phase 1 (Current)**: Manual validation only, no blocking
2. **Phase 2**: Fix ~50 legacy violations in governance paths
3. **Phase 3**: Enable pre-commit hook (opt-in via `git config`)
4. **Phase 4**: Enable CI on push/PR (hard-fail on violations)

---

## Local Pre-Commit Hook

**File**: `.githooks/pre-commit`

**Current Status**: **OPT-IN** - Disabled by default

To enable locally:
```powershell
git config os1.enableGuardian true
```

To disable:
```powershell
git config os1.enableGuardian false
```

**Behavior when enabled**:
1. Runs `node scripts/checks/stb_guard.mjs` (zero-tolerance checks)
2. Runs `npm run validate:stb` (existing STB header validator)
3. Blocks commit on any violation

**Setup**:
```powershell
git config core.hooksPath .githooks
git update-index --chmod=+x .githooks/pre-commit
```

---

## Auto-Archive Fixer

**File**: `scripts/tools/auto_archive.ps1`

**Purpose**: Optional utility to move non-compliant files to `_archive/` subdirectory.

**Usage**:
```powershell
# Archive non-compliant project plans
pwsh ./scripts/tools/auto_archive.ps1 -Base "docs/project_plans" -OutDir "archives"

# Archive with custom path
pwsh ./scripts/tools/auto_archive.ps1 -Base "docs/policies" -OutDir "_archive"
```

**Behavior**:
- Scans `$Base` directory for files not matching required pattern
- Moves violators to `$OutDir/` with `.archived` suffix
- Uses `git mv` to preserve history

---

## Rollback Instructions

If the guardian causes issues, disable with:

### Disable Local Hook
```powershell
git config core.hooksPath ""
```

### Restore Files
```powershell
git restore --staged -W .
git checkout HEAD -- scripts/checks/stb_guard.mjs .githooks/pre-commit .github/workflows/guardian.yml `
  scripts/tools/auto_archive.ps1 docs/policies/user.copilot.os1p1ops.zero-tolerance-guard.v2025.10.12.md
```

### Disable CI Workflow
```powershell
git mv .github/workflows/guardian.yml .github/workflows/guardian.yml.disabled
```

---

## Validation

### Manual Testing (Recommended During Rollout)

Test the guardian locally without blocking commits:
```powershell
# Dry-run (no git operations)
node scripts/checks/stb_guard.mjs

# Shows all violations in governance paths
```

**Expected Output** (current state with ~50 violations):
```
❌ Zero-Tolerance Guard Failed
 - Missing header X-Tier1 in docs/hubs/user.copilot.os1universe.genesis-hub.v2025.10.12.md
 - Missing header X-Agent in docs/policies/user.copilot.os1p2replay.spec.v2025.10.12.md
 - Non-compliant filename: docs/policies/user.copilot.seccomms-beta.v2025.10.10.md
 - Non-compliant filename: scripts/tools/os1_headers_check.ps1
 ... (~50 total violations)
```

**Expected Output** (after fixes):
```
✅ Zero-Tolerance Guard: PASS
```

### Enable Pre-Commit Hook (Optional)

Once violations are fixed:
```powershell
# Enable guardian in pre-commit
git config os1.enableGuardian true

# Test with actual commit
git commit -m "test: guardian enabled"
```

### Enable CI Workflow (Future)

After local validation passes:
1. Edit `.github/workflows/guardian.yml`
2. Uncomment `pull_request` and `push` triggers
3. Commit and push to test CI enforcement

---

## Governance Alignment

This policy enforces:
- **Compound Identifier Standard**: All new files follow `entity.agent.domain.purpose.version.ext` pattern
- **Header Metadata**: Ensures traceability (Tier, Agent, Domain, Purpose, Version, Policy)
- **Security Hygiene**: Prevents vault/embeddings from entering version control
- **STB Linkage**: Policies/templates reference their originating task blocks

**References**:
- [Filename Policy](user.copilot.docs.stb-filename-header-policy.v2025.10.10.md)
- [STB Template](user.copilot.docs.stb-template.v2025.10.10.md)
- [Project Plan](../project_plans/user.copilot.os1p1.project-plan.v2025.10.10.md)

---

## Success Metrics

### Phase 1 (Current - Staged Rollout)
- ✅ **Guardian script operational** (manual testing passes)
- ✅ **Exemptions configured** (legacy paths excluded)
- ✅ **~50 violations identified** in governance paths (docs/policies/, docs/templates/, docs/hubs/, scripts/tools/)
- ⏳ **Violations pending fix**: Missing headers + non-compliant filenames in governance files
- ⏳ **Pre-commit hook opt-in**: Disabled by default (`git config os1.enableGuardian`)
- ⏳ **CI workflow manual**: `workflow_dispatch` only (no automatic triggers)

### Phase 2 (Target: v2025.10.15)
- ⏳ **100% compliance** in governance paths (docs/policies/, docs/templates/, docs/hubs/)
- ⏳ **Legacy scripts migrated** to compound identifiers (scripts/tools/os1_*.ps1 → user.copilot.os1p1ops.*.ps1)
- ⏳ **All new files compliant** (headers + filenames)

### Phase 3 (Target: v2025.10.20)
- ⏳ **Pre-commit hook enabled** for all contributors
- ⏳ **Zero violations** on manual guardian runs
- ⏳ **CI green** on all branches

### Phase 4 (Target: v2025.11.01)
- ⏳ **CI hard-fail enabled** on push/PR
- ⏳ **Zero vault/embeddings leaks** into Git (verified)
- ⏳ **Policy drift prevented** via STB reference enforcement

---

**Maintainer:** Agent Gpt5 — OS One Systems Architect / Nexxis-Gen  
**Last Updated:** October 12, 2025  
**Status:** Active
