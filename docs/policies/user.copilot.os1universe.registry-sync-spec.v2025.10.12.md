X-Tier1: user
X-Agent: copilot
X-Domain: os1universe
X-Purpose: registry-sync-spec
X-Version: v2025.10.12
X-Policy: filename+header compliance required

---

# Genesis Registry Synchronization Specification · v2025.10.12

**Registry**: `docs/hubs/user.copilot.os1universe.genesis-app-registry.v2025.10.12.json`  
**Purpose**: Maintain single source of truth for Genesis Series Tier-I application status  
**Scope**: Schema definition, field semantics, validation rules

---

## Overview

The Genesis Registry is a **machine-readable JSON document** that tracks the status, routes, APIs, and capabilities of all Genesis Series applications. This specification defines:
- Field semantics and allowed values
- Validation rules for CI/smoke tests
- Synchronization procedures for status updates
- Integration points for telemetry and monitoring

---

## Registry Schema

### Top-Level Structure

```json
{
  "_comment": "STB headers (X-Tier1, X-Agent, etc.)",
  "_metadata": {
    "description": "Machine-readable registry of The Genesis Series applications",
    "last_updated": "YYYY-MM-DD"
  },
  "tier1": [ /* Array of Tier-I apps */ ],
  "tiers": { /* Tier definitions */ },
  "shared_infrastructure": { /* SEC-COMMS layers, APIs */ },
  "roadmap": { /* Future layers (theta, iota, kappa) */ }
}
```

### Application Entry Schema (Tier-I)

```json
{
  "key": "app-key",              // Unique identifier (kebab-case)
  "title": "App Title",          // Display name (Title Case)
  "category": "category",        // news, crypto, business, video, music, writer, ide, marketing, education, art3d
  "domain": "Domain Name",       // Human-readable domain description
  "description": "Brief desc",   // One-line app description
  "status": "status",            // REQUIRED: "planned" | "mvp" | "beta" | "stable" | "deprecated"
  "stage": "stage",              // OPTIONAL: "inactive" | "active" | "maintenance"
  "telemetry": boolean,          // OPTIONAL: true if η-layer telemetry enabled
  "route": "/path",              // OPTIONAL: UI route (if status >= mvp)
  "api": "/api/path",            // OPTIONAL: Health endpoint (if status >= mvp)
  "seccomms": ["layers"],        // Array of SEC-COMMS layers used (alpha, beta, gamma, delta, epsilon, zeta, eta)
  "features": ["feature list"]   // Array of key features
}
```

---

## Field Semantics

### Required Fields

#### `status` (string, REQUIRED)
Defines the application's development/release status:

- **`"planned"`**: App is in design/planning phase; no code exists
- **`"mvp"`**: Minimum Viable Product deployed; core features functional
- **`"beta"`**: Feature-complete; undergoing testing and refinement
- **`"stable"`**: Production-ready; recommended for general use
- **`"deprecated"`**: No longer maintained; users should migrate

**Rules**:
- Apps with `status >= "mvp"` MUST have `route` and `api` fields
- Apps with `status = "planned"` SHOULD NOT have `route`/`api` fields

### Optional Fields

#### `stage` (string, OPTIONAL)
Defines the operational/deployment status:

- **`"inactive"`**: Not deployed or accessible (default for "planned")
- **`"active"`**: Deployed and accessible to users
- **`"maintenance"`**: Temporarily unavailable for updates

**Rules**:
- Apps with `status = "mvp"` or higher SHOULD have `stage = "active"`
- Apps with `stage = "active"` MUST be reachable at their `route`

#### `telemetry` (boolean, OPTIONAL)
Indicates whether η-layer telemetry is enabled:

- **`true`**: App sends telemetry data to `/api/telemetry`
- **`false`** or omitted: No telemetry data sent

**Rules**:
- Apps with `stage = "active"` SHOULD have `telemetry = true` for monitoring
- Telemetry data MUST respect user consent and SEC-COMMS policies

#### `route` (string, OPTIONAL)
The UI route where the app is accessible (e.g., `"/lexicore"`)

**Rules**:
- MUST start with `/`
- MUST be unique across all apps
- MUST be accessible (return 200 OK) if `stage = "active"`

#### `api` (string, OPTIONAL)
The health endpoint for the app (e.g., `"/api/lexicore/health"`)

**Rules**:
- MUST start with `/api/`
- MUST return JSON with `{ ok: true, mode: "local_only" }` if healthy
- MUST be accessible (return 200 OK) if `stage = "active"`

---

## Validation Rules

### Smoke Test Checks

The registry smoke test (`scripts/tools/user.copilot.os1universe.registry-smoke.v2025.10.12.ps1`) validates:

1. **JSON Validity**: Registry parses without errors
2. **Required Fields**: All apps have `key`, `title`, `status`, `seccomms`, `features`
3. **Status Consistency**:
   - Apps with `status = "mvp"` MUST have `route` and `api` fields
   - Apps with `stage = "active"` MUST have `status >= "mvp"`
4. **Telemetry Flag**: Apps with `telemetry = true` MUST have `stage = "active"`
5. **Unique Keys**: No duplicate `key` values in `tier1` array
6. **Route Uniqueness**: No duplicate `route` values

### CI Integration

The Guardian workflow (`.github/workflows/guardian.yml`) can be extended to:
- Validate registry on every commit
- Ping health endpoints for apps with `stage = "active"`
- Generate telemetry summary for apps with `telemetry = true`

---

## Synchronization Procedures

### When to Update the Registry

1. **New App Initialization**: Add entry with `status = "planned"`
2. **MVP Deployment**: Update `status = "mvp"`, add `route`/`api`, set `stage = "active"`, `telemetry = true`
3. **Feature Completion**: Update `status = "beta"` or `"stable"`
4. **Maintenance Mode**: Set `stage = "maintenance"`
5. **Deprecation**: Update `status = "deprecated"`, set `stage = "inactive"`

### Update Checklist

- [ ] Update `status` field
- [ ] Add/update `stage` field (if changing deployment status)
- [ ] Add/update `telemetry` flag (if enabling/disabling monitoring)
- [ ] Add `route` and `api` fields (if promoting to MVP)
- [ ] Update `_metadata.last_updated` timestamp
- [ ] Run smoke test: `powershell scripts/tools/user.copilot.os1universe.registry-smoke.v2025.10.12.ps1`
- [ ] Verify health endpoints are accessible (if `stage = "active"`)
- [ ] Run Guardian: `node scripts/checks/stb_guard.mjs`
- [ ] Commit with descriptive message (e.g., "chore(genesis): mark LexiCore as MVP (active, telemetry)")

---

## Current MVP Applications

As of **v2025.10.12**, the following Tier-I apps are MVP:

### AuroraWire
- **Status**: `"mvp"`
- **Stage**: `"active"`
- **Telemetry**: `true`
- **Route**: `/aurora`
- **API**: `/api/aurora/health`
- **Features**: Real-time news feed, RAG context synthesis, semantic search

### LexiCore
- **Status**: `"mvp"`
- **Stage**: `"active"`
- **Telemetry**: `true`
- **Route**: `/lexicore`
- **API**: `/api/lexicore/health`
- **Features**: Cognitive document editor, vault persistence (ε), replay logging (ζ), health status badge

---

## Integration Points

### Telemetry Dashboard (`/telemetry`)
- Displays aggregate telemetry data from apps with `telemetry = true`
- Uses η-layer for data collection and visualization
- Respects user consent and SEC-COMMS policies

### Health Monitoring
- Apps with `stage = "active"` SHOULD have health endpoints
- Health endpoints return: `{ ok: boolean, mode: string, version: string }`
- Smoke tests verify health endpoints are accessible

### Client-Side Discovery
```typescript
// Fetch registry to discover available apps
const registry = await fetch('/api/genesis/registry').then(r => r.json());
const activeApps = registry.tier1.filter(app => app.stage === 'active');
```

---

## Acceptance Criteria

For registry synchronization to be considered successful:

1. ✅ JSON is valid and parses without errors
2. ✅ All MVP apps have `status = "mvp"`, `stage = "active"`, `telemetry = true`
3. ✅ All MVP apps have valid `route` and `api` fields
4. ✅ All health endpoints return 200 OK (if dev server running)
5. ✅ Smoke test report generated and shows PASS
6. ✅ Guardian validation PASS
7. ✅ STB validator PASS

---

## Rollback Plan

If registry synchronization introduces errors:

1. **Restore Previous Version**:
   ```bash
   git checkout HEAD~1 docs/hubs/user.copilot.os1universe.genesis-app-registry.v2025.10.12.json
   ```

2. **Verify Restoration**:
   ```powershell
   node scripts/checks/stb_guard.mjs
   powershell scripts/tools/user.copilot.os1universe.registry-smoke.v2025.10.12.ps1
   ```

3. **Re-commit Fixes**: Address validation errors and re-apply updates

---

## References

- **Genesis Hub**: `docs/hubs/user.copilot.os1universe.genesis-hub.v2025.10.12.md`
- **LexiCore MVP Spec**: `docs/policies/user.copilot.os1p1lexicore.mvp-spec.v2025.10.12.md`
- **Health Endpoint Specs**:
  - `docs/policies/user.copilot.os1p1lexicore.health-spec.v2025.10.12.md`
- **SEC-COMMS Policy**: `docs/policies/user.copilot.os1p1webui.seccomms-beta.v2025.10.10.md`

---

**Last Updated**: v2025.10.12  
**Status**: Active — Registry synchronized with AuroraWire and LexiCore MVPs
