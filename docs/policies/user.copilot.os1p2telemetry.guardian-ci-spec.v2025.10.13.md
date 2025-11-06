<!--
X-Tier1: user
X-Agent: copilot
X-Domain: os1p2telemetry
X-Purpose: guardian-ci-spec
X-Version: v2025.10.13
X-Policy: filename+header compliance required
-->

# Guardian CI Telemetry Integration Specification

**Version**: v2025.10.13  
**Status**: Active  
**Workflow**: `.github/workflows/guardian.yml`  
**Job Name**: `telemetry-smoke`

---

## Overview

The Guardian CI workflow integrates automated telemetry metrics smoke testing to validate `/api/telemetry/metrics` endpoint compliance during continuous integration. The job runs conditionally and implements a **tolerant SKIP pattern** to gracefully handle scenarios where the development server is unavailable.

---

## Job Configuration

### Trigger Conditions

**Conditional Execution**:
```yaml
if: vars.DEV_SERVER_URL != ''
```

The `telemetry-smoke` job **only runs** when:
1. GitHub repository variable `DEV_SERVER_URL` is set
2. Value is non-empty string

**When to set `DEV_SERVER_URL`**:
- Staging/preview deployments (e.g., Vercel preview URLs)
- CI environments with ephemeral dev servers
- Integration test suites with server bootstrapping

**When to leave unset**:
- Local development (smoke runs manually)
- Pull requests without preview deployments
- Environments where dev server startup is not guaranteed

---

## Exit Code Handling

### Standard Exit Codes

The smoke test script (`user.codex.os1p2telemetry.metrics-smoke.v2025.10.13.ps1`) uses three exit codes:

| Exit Code | Meaning | CI Action | Guardian Behavior |
|-----------|---------|-----------|-------------------|
| `0` | PASS | ✅ Continue | All tests passed |
| `1` | FAIL | ❌ Fail build | One or more tests failed |
| `2` | SKIP | ⚠️ Warning + Continue | Dev server unreachable |

### Tolerant SKIP Implementation

```yaml
- name: Run η Telemetry Metrics Smoke Test
  shell: pwsh
  run: |
    $exitCode = 0
    try {
      & powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.codex.os1p2telemetry.metrics-smoke.v2025.10.13.ps1
      $exitCode = $LASTEXITCODE
    } catch {
      $exitCode = 1
    }
    
    if ($exitCode -eq 2) {
      Write-Host "::warning::Telemetry smoke test SKIPPED (dev server not available)"
      exit 0
    } elseif ($exitCode -ne 0) {
      Write-Host "::error::Telemetry smoke test FAILED"
      exit 1
    }
    Write-Host "Telemetry smoke test PASSED"
```

**Logic**:
1. Execute smoke script and capture exit code
2. If exit code = `2` (SKIP):
   - Emit GitHub Actions `::warning::` annotation
   - Convert to exit `0` (success) to prevent build failure
3. If exit code = `1` (FAIL):
   - Emit GitHub Actions `::error::` annotation
   - Propagate exit `1` to fail the build
4. If exit code = `0` (PASS):
   - Log success message
   - Build continues

---

## Integration Points

### Workflow Dependencies

```yaml
jobs:
  guard:
    runs-on: windows-latest
    steps:
      - name: Run Zero-Tolerance Guardian
        run: node scripts/checks/stb_guard.mjs
      - name: STB Header Validator
        run: npm run validate:stb

  telemetry-smoke:
    runs-on: windows-latest
    if: vars.DEV_SERVER_URL != ''
    steps:
      - uses: actions/checkout@v4
      - name: Run η Telemetry Metrics Smoke Test
        # ... (see above)
```

**Jobs run in parallel** — no dependency chain required. Guardian and telemetry-smoke can both pass/fail independently.

### Artifact Generation

When telemetry-smoke runs, it generates:
- **Report**: `docs/reports/user.codex.os1p2telemetry.metrics-smoke.v2025.10.13.md`
- **Console Output**: Test results logged to GitHub Actions run log

**Note**: Report is **not** committed by CI job. It must be committed separately during development smoke testing.

---

## Local vs CI Execution

### Local Development

**Command**:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.codex.os1p2telemetry.metrics-smoke.v2025.10.13.ps1
```

**Prerequisites**:
- Dev server running at `http://localhost:4000`
- `/api/telemetry/metrics` endpoint reachable

**Output**:
- Console test results (PASS/FAIL/SKIP)
- Generated report in `docs/reports/`

**Expected Flow**:
1. Developer starts dev server (`npm run -w apps/web-ui dev`)
2. Runs smoke script locally
3. Reviews PASS/FAIL results
4. Commits report if PASS
5. Fixes failures before pushing

### CI Environment

**Command**: Same script, executed by GitHub Actions runner

**Prerequisites**:
- `DEV_SERVER_URL` variable set (e.g., `https://preview-abc123.vercel.app`)
- Endpoint reachable from GitHub Actions runner network

**Output**:
- GitHub Actions workflow annotations (`::warning::`, `::error::`)
- Test results in workflow run log

**Expected Flow**:
1. PR opened → preview deployment created
2. `DEV_SERVER_URL` set to preview URL
3. Guardian workflow triggers
4. Telemetry-smoke job runs conditionally
5. SKIP → warning (build passes)
6. FAIL → error (build fails, PR blocked)
7. PASS → success (merge allowed)

---

## Failure Scenarios

### Scenario 1: Dev Server Not Running (Local)

**Cause**: Developer runs smoke script without starting dev server

**Result**:
- Exit code: `2` (SKIP)
- Console output: "SKIP - Server not reachable at http://localhost:4000"
- Report: Not generated (or marked SKIP)

**Action**: Start dev server, re-run script

---

### Scenario 2: Contract Violation (CI)

**Cause**: API response missing required field (e.g., `ok` flag)

**Result**:
- Exit code: `1` (FAIL)
- GitHub Actions: `::error::Telemetry smoke test FAILED`
- Build status: ❌ Failed
- PR merge: Blocked

**Action**: Fix API implementation, push fix, re-run CI

---

### Scenario 3: Network Timeout (CI)

**Cause**: Preview deployment slow to respond (>30s timeout)

**Result**:
- Exit code: `2` (SKIP)
- GitHub Actions: `::warning::Telemetry smoke test SKIPPED (dev server not available)`
- Build status: ✅ Passed (with warning)
- PR merge: Allowed

**Action**: Investigate preview deployment latency (optional)

---

### Scenario 4: Missing `DEV_SERVER_URL` (CI)

**Cause**: Variable not set in repository settings

**Result**:
- Job: **Does not run** (conditional `if` clause skips job)
- Build status: ✅ Passed (guardian jobs still run)
- PR merge: Allowed

**Action**: Set `DEV_SERVER_URL` in repository settings if preview deployments available

---

## Configuration Management

### Setting `DEV_SERVER_URL`

**GitHub Repository Settings**:
1. Navigate to: **Settings → Secrets and variables → Actions**
2. Click **Variables** tab
3. Click **New repository variable**
4. Name: `DEV_SERVER_URL`
5. Value: `https://your-preview-deployment.example.com` (no trailing slash)
6. Click **Add variable**

**Environment-Specific Overrides**:
```yaml
telemetry-smoke:
  environment: preview
  runs-on: windows-latest
  if: vars.DEV_SERVER_URL != ''
```

Use GitHub Environments to set different `DEV_SERVER_URL` values per deployment stage.

---

## Monitoring & Observability

### Metrics to Track

1. **Pass Rate**: Percentage of telemetry-smoke runs that exit `0`
2. **Skip Rate**: Percentage of runs that exit `2` (indicates deployment issues)
3. **Fail Rate**: Percentage of runs that exit `1` (contract violations)
4. **Execution Time**: Duration of smoke test run

### GitHub Actions Insights

View job statistics:
1. Navigate to **Actions** tab
2. Select **Zero-Tolerance Guardian (Blocking Mode)** workflow
3. Filter by job name: `telemetry-smoke`
4. Review pass/fail/skip trends

---

## Maintenance

### Version Updates

When updating telemetry contract:
1. Update spec: `docs/policies/user.codex.os1p2telemetry.metrics-spec.vYYYY.MM.DD.md`
2. Update smoke script: `scripts/tools/user.codex.os1p2telemetry.metrics-smoke.vYYYY.MM.DD.ps1`
3. Update guardian.yml to reference new script version
4. Update this CI spec with new version number
5. Archive old versions in `docs/_archive/`

### Job Removal

If telemetry smoke testing becomes unnecessary:
1. Remove `telemetry-smoke` job from `guardian.yml`
2. Archive smoke script to `scripts/_archive/`
3. Update README to remove telemetry smoke documentation
4. Keep spec and reports for historical reference

---

## Related Documentation

- **Metrics Spec**: `docs/policies/user.codex.os1p2telemetry.metrics-spec.v2025.10.13.md`
- **Smoke Script**: `scripts/tools/user.codex.os1p2telemetry.metrics-smoke.v2025.10.13.ps1`
- **Contract Validation**: `docs/reports/user.copilot.os1p2telemetry.contract-validation.v2025.10.13.md`
- **Guardian Policy**: `docs/policies/user.copilot.os1p1ops.zero-tolerance-guard.v2025.10.12.md`

---

## Appendix: Example Workflow Run

**Scenario**: PR with preview deployment

```yaml
Run powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.codex.os1p2telemetry.metrics-smoke.v2025.10.13.ps1

Telemetry metrics smoke
Endpoint: https://preview-abc123.vercel.app/api/telemetry/metrics
Timestamp: 2025-10-13 14:22:10 UTC

Test 1 - HTTP status 200
  PASS

Test 2 - ok flag is true
  PASS

Test 3 - SEC-COMMS header and latency numeric
  PASS

Summary: total=3, passed=3, failed=0, skipped=0, status=PASS
```

**Result**: ✅ Build passes, PR approved for merge

---

**Specification Status**: ✅ Active  
**Last Updated**: 2025-10-13  
**Next Review**: Post-Phase 2.2 completion
