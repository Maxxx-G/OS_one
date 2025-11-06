<!--
X-Tier1: user
X-Agent: copilot
X-Domain: os1p3ops
X-Purpose: guardian-theta-schema
X-Version: v2025.10.13
X-Policy: filename+header compliance required
-->

# Guardian θ-Layer Validation Schema · v2025.10.13

## Overview
Defines validation rules for Phase 3 (θ — Autonomic Regulation) endpoints, control bus envelopes, and metrics. Used by Guardian CI to enforce compliance on Codex θ-layer deliverables.

---

## Endpoints

### WebSocket: `/api/mesh/stream` (Edge Runtime)

**Protocol Requirements**:
- **Upgrade Header**: `Upgrade: websocket` (required)
- **SEC-COMMS Header**: `x-sec-local-only: true` (default) OR gated policy flag
- **Heartbeat Interval**: Server → client `{"kind":"heartbeat","ts":<iso>}` every ≤15s
- **Close Codes**:
  - `1000` — Normal closure
  - `1011` — Internal server error
  - `4001` — Policy violation (e.g., missing SEC header when enforced)

**Validation Rules**:
1. Non-WebSocket GET request → MUST return `426 Upgrade Required`
2. Missing `Upgrade: websocket` header → MUST reject with `400 Bad Request` or `426`
3. Heartbeat messages → MUST arrive within 15-second window
4. Close code `4001` → MUST include reason text (e.g., "policy_violation: missing sec header")

---

## Envelopes (Control Bus)

All messages on `/api/mesh/stream` MUST conform to this envelope schema:

```json
{
  "ts": "ISO-8601 timestamp",
  "kind": "control|telemetry|ack|heartbeat|error",
  "source": "guardian|mesh|agent|ui",
  "session_id": "^[a-z0-9_-]{8,64}$",
  "payload": {}
}
```

### Required Fields
- `ts`: ISO-8601 UTC timestamp (e.g., `2025-10-13T15:30:00.000Z`)
- `kind`: One of `control`, `telemetry`, `ack`, `heartbeat`, `error`
- `source`: One of `guardian`, `mesh`, `agent`, `ui`

### Optional Fields
- `session_id`: Session identifier (regex: `^[a-z0-9_-]{8,64}$`)
- `payload`: Message-specific data (object or null)

### Policy Hooks
1. **Unknown `kind`**: Reject with close code `4001` + reason "unknown_message_kind"
2. **PII Redaction**: Before persisting to logs/vault, redact fields matching PII patterns:
   - Email addresses (regex: `[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}`)
   - API keys (regex: `sk-[a-zA-Z0-9]{32,}`)
   - JWT tokens (regex: `eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+`)

---

## Metrics (Autonomic)

θ-layer autonomic regulation exposes these metrics in telemetry envelopes:

```json
{
  "kind": "telemetry",
  "ts": "2025-10-13T15:30:00.000Z",
  "source": "guardian",
  "payload": {
    "rate_limited": false,
    "retries": 0,
    "budget_used": 42.5
  }
}
```

### Field Constraints
- `rate_limited`: boolean (true if session is currently throttled)
- `retries`: number ≥ 0 (count of retry attempts in current operation)
- `budget_used`: number ≥ 0 (abstract units consumed; e.g., tokens, credits, compute time)

### Emission Cadence
- Metrics MUST be emitted at ≤10-second intervals per session under load
- Idle sessions MAY emit less frequently (≤60s)

---

## CI Checks

Guardian CI pipeline MUST validate:

### 1. Schema Linting
- All envelope JSON samples in docs MUST pass JSON schema validation
- Schema file: `docs/policies/user.copilot.os1p3ops.guardian-theta-schema.v2025.10.13.md`

### 2. Non-WebSocket GET Test
```powershell
# Expected: 426 Upgrade Required
$response = Invoke-WebRequest -Uri "http://localhost:4000/api/mesh/stream" -Method GET
if ($response.StatusCode -ne 426) {
  Write-Error "Expected 426, got $($response.StatusCode)"
  exit 1
}
```

### 3. SEC-COMMS Header Enforcement (when enabled)
```powershell
# Expected: 4001 close code when missing required header
# (Test only when NEXT_PUBLIC_FEATURE_SEC_ENFORCE=1)
```

### 4. Heartbeat Timing
```powershell
# Connect via WebSocket, wait 20 seconds
# Expected: At least 1 heartbeat message received
```

---

## Rollback Policy

If θ-layer validation breaks existing Phase 2 functionality:

1. **Immediate**: Revert offending commit
2. **CI**: Mark Guardian check as "degraded" (warning, not blocking)
3. **Docs**: Add incident report to `docs/stb/_archive/`
4. **Fix**: Codex submits corrective STB within 48h

---

## Related Documentation

- **Phase 3 Init Brief**: `docs/handover/user.copilot.os1p3ops.phase3-init.v2025.10.13.md`
- **Telemetry Metrics Spec**: `docs/policies/user.codex.os1p2telemetry.metrics-spec.v2025.10.13.md`
- **Guardian CI Spec**: `docs/policies/user.copilot.os1p2telemetry.guardian-ci-spec.v2025.10.13.md`

---

**Schema Version**: v2025.10.13  
**Status**: Active (awaiting Codex θ STBs)  
**Next Review**: Post-Week 3 regression sweep
