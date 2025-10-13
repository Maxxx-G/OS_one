# Docs STRICT Policy (Phase 3)
X-Tier1: user  
X-Agent: copilot  
X-Domain: os1p3  
X-Purpose: docs-strict-policy  
X-Version: v2025.10.13
X-Policy: Single-Fence STB; ≤5 files; deterministic

## Overview
This policy enforces strict documentation standards to prevent configuration drift and ensure consistency across all documentation files.

## Rules

### 1. Forbidden Ports
- **Banned**: `localhost:3000` 
- **Allowed**: `localhost:4000`, `localhost:4001`
- **Rationale**: Port 3000 is reserved for legacy/external services. All OS_One services must use approved ports (4000/4001).

### 2. Multi-Fence Violations
- **Rule**: STB documents must contain exactly **one outer fence pair** (two backtick markers total: ` ``` ` opening, ` ``` ` closing)
- **General docs**: Prefer code indents over nested fences for readability
- **Rationale**: Enforces single-fence STB format and prevents fence nesting complexity

## Enforcement

### CI (Automatic)
The `docs_strict` job in `.github/workflows/guardian.yml` automatically scans all documentation on every push/PR:
- Fails build if violations are found
- Exit code 10 indicates STRICT violations

### Local Testing

#### Quick Sweep
Run the docs sweep tool to check for violations:
```powershell
powershell -f scripts/tools/user.copilot.os1p3.docs-strict-sweep.v2025.10.13.ps1
```

Expected output:
- ✅ `DOCS_STRICT_PASS` — No violations found
- ❌ `DOCS_PORT_VIOLATIONS` / `DOCS_FENCE_VIOLATIONS` — Lists offending files (exit 10)

#### Full STB Validation (STRICT mode)
To validate a specific document with STRICT enforcement:
```powershell
$env:STRICT = "1"
powershell -f ops/check_plan_templates.ps1 -Path docs/your-file.md
```

### Pre-Commit Hook
The pre-commit hook (`ops/pre-commit.ps1`) automatically runs the sweep when docs files are staged:
- **Warning-only**: Does not block commits locally
- **CI enforcement**: Guardian CI job will fail if violations reach the repo

## Remediation

### Fixing Port Violations
Replace `localhost:3000` references with:
- `localhost:4000` (primary app server)
- `localhost:4001` (secondary/relay services)

### Fixing Fence Violations
For STB documents:
1. Ensure exactly **one outer fence pair** wrapping the entire STB content
2. Remove nested fences inside the outer fence
3. Use 4-space indentation for code examples instead of nested fences

For general documentation:
- Prefer code indentation over fenced code blocks where possible
- Limit to one fence pair per section if needed

## Exit Codes
- `0` — PASS (no violations)
- `10` — STRICT violations detected (ports or fences)

## References
- Validator policy: `rules/policy.validator.yaml`
- Sweep tool: `scripts/tools/user.copilot.os1p3.docs-strict-sweep.v2025.10.13.ps1`
- STB template: `docs/templates/user.copilot.os1p1docs.stb-template-copilot.v2025.09.21.md`
- Validator usage: `docs/policies/user.copilot.os1p3.validator-usage.v2025.10.13.md`
