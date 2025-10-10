X-Tier1: user
X-Agent: copilot
X-Domain: os1p1lexicore
X-Purpose: health-spec
X-Version: v2025.10.12
X-Policy: filename+header compliance required

---

# LexiCore Health Endpoint Specification · v2025.10.12

**Endpoint**: `/api/lexicore/health`  
**Method**: GET  
**Runtime**: Edge (Next.js)  
**Purpose**: Operational health check for LexiCore service

---

## Overview

The LexiCore health endpoint provides a lightweight status check to verify that the LexiCore service is operational and accessible. This endpoint is designed for:
- Service discovery and monitoring
- Integration testing (smoke tests, CI/CD pipelines)
- Client-side health checks before making API calls
- SEC-COMMS compliance verification (local-only mode)

---

## Request

### HTTP Method
```
GET /api/lexicore/health
```

### Headers
No special headers required. Standard browser/client requests accepted.

### Query Parameters
None.

---

## Response

### Success (200 OK)

**Content-Type**: `application/json`

**Payload**:
```json
{
  "ok": true,
  "mode": "local_only",
  "version": "v2025.10.12",
  "service": "lexicore",
  "timestamp": "2025-10-12T14:32:00.000Z"
}
```

**Fields**:
- `ok` (boolean): Always `true` if endpoint is reachable
- `mode` (string): `"local_only"` - indicates SEC-COMMS α-layer compliance (no external egress)
- `version` (string): Current LexiCore MVP version (follows `vYYYY.MM.DD` format)
- `service` (string): Always `"lexicore"` for service identification
- `timestamp` (string): ISO 8601 timestamp of the request

### Error Responses

**404 Not Found**: LexiCore service not deployed or route misconfigured  
**500 Internal Server Error**: Runtime error (edge runtime failure)

---

## SEC-COMMS Compliance

### α-layer (Origin Validation & Egress Control)
- **Mode**: `local_only` - No external network requests
- **Purpose**: All LexiCore operations (editor, vault, replay) execute locally
- **Enforcement**: Health endpoint confirms local-first architecture

### Runtime
- **Edge Runtime**: Deployed via Next.js edge functions
- **No Server Dependencies**: Stateless, no database/filesystem access
- **Fast Response**: Typically <10ms response time

---

## Usage Examples

### Browser (Fetch API)
```javascript
const response = await fetch('/api/lexicore/health');
const data = await response.json();

if (data.ok && data.mode === 'local_only') {
  console.log('✅ LexiCore operational (local-only mode)');
}
```

### PowerShell (Smoke Test)
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:4000/api/lexicore/health" -UseBasicParsing
$data = $response.Content | ConvertFrom-Json

if ($data.ok -eq $true) {
  Write-Host "✅ LexiCore health check PASSED"
}
```

### cURL
```bash
curl http://localhost:4000/api/lexicore/health
```

---

## Integration Points

### Smoke Tests
- **Script**: `scripts/tools/user.copilot.os1p1lexicore.health-smoke.v2025.10.12.ps1`
- **Verification**: Checks `ok: true` and `mode: "local_only"`
- **Report**: Generates compliance report in `docs/reports/`

### CI/CD
- Health check can be integrated into GitHub Actions workflows
- Useful for verifying deployment status in staging/production
- Example: `.github/workflows/guardian.yml` could add LexiCore health check

### Client-Side Health Checks
- UI components can verify LexiCore availability before rendering
- Graceful degradation if service unavailable
- Example: Show "LexiCore Unavailable" message if health check fails

---

## Monitoring & Telemetry

The health endpoint itself does **not** send telemetry (to minimize overhead). However:
- Client applications may log health check results via η-layer (`/api/telemetry`)
- Smoke test reports provide historical health data
- Future enhancements may add metrics (uptime, response time)

---

## Limitations

- **No Authentication**: Health endpoint is public (no auth required)
- **No Rate Limiting**: Currently unrestricted (suitable for monitoring)
- **No Detailed Status**: Returns only basic operational state (no diagnostics)

For detailed status (e.g., vault connectivity, replay service status), use dedicated endpoints:
- `/api/memory/status` (vault health)
- `/api/replay/status` (replay service health)

---

## References

- **LexiCore MVP Spec**: `docs/policies/user.copilot.os1p1lexicore.mvp-spec.v2025.10.12.md`
- **Genesis Registry**: `docs/hubs/user.copilot.os1universe.genesis-app-registry.v2025.10.12.json`
- **SEC-COMMS Policy**: `docs/policies/user.copilot.os1p1webui.seccomms-beta.v2025.10.10.md`

---

**Last Updated**: v2025.10.12  
**Status**: Active — Deployed with LexiCore MVP
