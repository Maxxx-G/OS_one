X-Tier1: user
X-Agent: copilot
X-Domain: os1p2mesh
X-Purpose: endpoints-spec
X-Version: v2025.10.13
X-Policy: filename+header compliance required

---

# Mesh γ-Layer Endpoints Specification · v2025.10.13

**Purpose**: Dual-agent mesh infrastructure for Week 2 multi-agent chat  
**Status**: Static stub endpoints (dynamic peer registry in Week 3+)  
**SEC-COMMS Layer**: γ (Gamma) — Peer-to-peer mesh communication

---

## Overview

The Mesh γ-Layer enables **multi-agent coordination** by providing:
1. **Heartbeat Endpoint**: System pulse + SEC-COMMS mode visibility
2. **Peers Endpoint**: Active agent discovery (static stub for Week 2)

**Week 2 Goal**: UI can poll these endpoints to display agent status  
**Week 3+ Upgrade**: Dynamic peer registry with heartbeat expiration (15s TTL)

---

## Endpoint 1: `/api/mesh/heartbeat`

### Method
```
GET /api/mesh/heartbeat
```

### Purpose
- Return system heartbeat timestamp
- Expose SEC-COMMS mode for client visibility
- Indicate expected heartbeat interval (5 seconds)

### Response (200 OK)

```json
{
  "ok": true,
  "ts": "2025-10-13T14:30:00.000Z",
  "mode": "local_only",
  "intervalMs": 5000
}
```

**Headers**:
```
X-SEC-COMMS-MODE: local_only
Cache-Control: no-cache
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `ok` | boolean | Always `true` (health indicator) |
| `ts` | string (ISO 8601) | Current server timestamp |
| `mode` | string | SEC-COMMS mode (`local_only`, `external`, etc.) |
| `intervalMs` | number | Expected heartbeat interval in milliseconds (5000 = 5s) |

### Runtime
**Edge** (low latency, global distribution)

### SEC-COMMS Integration

**α-Layer (Egress Control)**:
- Imports `getSecMode()` from `chat/seccomms-bridge`
- No external API calls (pure function)

**Headers**:
- `X-SEC-COMMS-MODE`: Exposes current mode to clients
- Clients can adjust behavior (e.g., disable external features in `local_only`)

### Usage Example (Frontend)

```typescript
// Poll heartbeat every 5 seconds
const pollHeartbeat = async () => {
  const res = await fetch('/api/mesh/heartbeat');
  const data = await res.json();
  
  console.log('Heartbeat:', data.ts);
  console.log('SEC-COMMS Mode:', data.mode);
  
  // Adjust UI based on mode
  if (data.mode === 'local_only') {
    setExternalFeaturesEnabled(false);
  }
};

setInterval(pollHeartbeat, 5000);
```

---

## Endpoint 2: `/api/mesh/peers`

### Method
```
GET /api/mesh/peers
```

### Purpose
- List active agents in the mesh
- Enable dual-agent chat UI (Gabriel + Codex selection)
- Provide agent capabilities metadata

### Response (200 OK)

```json
{
  "ok": true,
  "peers": [
    {
      "id": "gabriel",
      "status": "up",
      "capabilities": ["empathy", "context-aware"],
      "lastHeartbeat": "2025-10-13T14:30:00.000Z"
    },
    {
      "id": "codex",
      "status": "up",
      "capabilities": ["technical", "code-generation"],
      "lastHeartbeat": "2025-10-13T14:30:00.000Z"
    }
  ],
  "mode": "local_only",
  "note": "Static stub for Week 2 dual-agent; dynamic registry in Week 3+"
}
```

**Headers**:
```
X-SEC-COMMS-MODE: local_only
Cache-Control: no-cache
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `ok` | boolean | Always `true` (health indicator) |
| `peers` | array | List of active agents |
| `peers[].id` | string | Agent identifier (`gabriel`, `codex`, etc.) |
| `peers[].status` | string | Agent status (`up`, `down`, `busy`) |
| `peers[].capabilities` | string[] | Agent capabilities/tags |
| `peers[].lastHeartbeat` | string (ISO 8601) | Last heartbeat timestamp |
| `mode` | string | SEC-COMMS mode |
| `note` | string | Implementation note (static vs dynamic) |

### Runtime
**Edge** (low latency)

### Static Stub (Week 2)

**Hardcoded Peers**:
- **Gabriel**: Empathy-focused agent (context-aware, emotional intelligence)
- **Codex**: Technical agent (code generation, debugging, architecture)

**Upgrade Path (Week 3+)**:
- Replace `STUB_PEERS` with in-memory registry
- Agents POST to `/api/mesh/heartbeat` to register
- Registry expires peers after 15 seconds (no heartbeat)
- Add `GET /api/mesh/peers/:id` for individual peer status

### Usage Example (Frontend)

```typescript
// Fetch active peers
const fetchPeers = async () => {
  const res = await fetch('/api/mesh/peers');
  const data = await res.json();
  
  // Display in agent selector
  setPeers(data.peers);
  
  // Example: Gabriel + Codex available
  // User can choose one or enable "Collaborate" mode
};
```

---

## SEC-COMMS Integration

### α-Layer (Origin Validation & Egress Control)

**Implementation**:
- Both endpoints import `getSecMode()` from `chat/seccomms-bridge`
- Pure function (no side effects, safe for Edge runtime)
- Returns `"local_only"` by default (SEC-COMMS compliance)

**Header Injection**:
```typescript
response.headers.set("X-SEC-COMMS-MODE", mode);
```

**Purpose**:
- Clients can inspect mode without separate API call
- Frontend can disable external features in `local_only` mode
- Audit trail for SEC-COMMS enforcement

### γ-Layer (Mesh P2P Communication)

**Current State**: Static stub (no actual P2P yet)

**Week 3+ Implementation**:
- In-memory peer registry (Map<agentId, PeerInfo>)
- Heartbeat expiration tracking (15s TTL)
- POST `/api/mesh/heartbeat` for agents to register
- WebSocket support for real-time peer updates (optional)

### δ-Layer (Signature/Identity)

**Not Yet Implemented**:
- Week 3-4: ES256 identity signing for peer registration
- Each agent signs heartbeat with private key
- Peers verify signatures before trusting

---

## Week 2 vs Week 3+ Comparison

| Feature | Week 2 (Current) | Week 3+ (Planned) |
|---------|------------------|-------------------|
| **Peers** | Static stub (Gabriel, Codex) | Dynamic in-memory registry |
| **Heartbeat** | GET only (no registration) | POST to register agent |
| **Expiration** | No TTL | 15s TTL (auto-expire) |
| **P2P** | No direct communication | WebSocket or SSE for peer updates |
| **Identity** | No signing | ES256 signature verification |
| **Capabilities** | Hardcoded tags | Dynamic capability registration |

---

## Upgrade Path (Week 3+)

### Phase 1: Dynamic Peer Registry

**Add POST `/api/mesh/heartbeat`**:
```typescript
// Agent registers heartbeat
POST /api/mesh/heartbeat
Body: {
  "agentId": "gabriel",
  "status": "up",
  "capabilities": ["empathy", "context-aware"]
}

Response: {
  "ok": true,
  "registered": true,
  "expiresAt": "2025-10-13T14:30:15.000Z"
}
```

**Update GET `/api/mesh/peers`**:
- Replace `STUB_PEERS` with in-memory registry
- Filter expired peers (heartbeat > 15s ago)

### Phase 2: Identity Signing (δ-Layer)

**Add Signature to Heartbeat**:
```typescript
POST /api/mesh/heartbeat
Body: {
  "agentId": "gabriel",
  "status": "up",
  "capabilities": ["empathy"],
  "signature": "<ES256 signature>",
  "publicKey": "<ES256 public key>"
}
```

**Verification**:
- Server verifies signature with publicKey
- Reject invalid signatures (403 Forbidden)
- Store verified peers only

### Phase 3: Real-Time Updates

**Add WebSocket `/api/mesh/stream`**:
- Clients subscribe to peer updates
- Server pushes events on peer join/leave
- Reduces polling overhead (from 5s to real-time)

---

## Security Considerations

### Week 2 (Current)

✅ **Safe**:
- Read-only endpoints (no state mutation)
- Static data (no user input)
- SEC-COMMS mode visibility (α-layer)

⚠️ **Limitations**:
- No authentication (anyone can call endpoints)
- No rate limiting (potential abuse)

**Mitigation**:
- Endpoints return non-sensitive data (agent IDs, capabilities)
- Week 3+ will add authentication + rate limiting

### Week 3+ (Planned)

✅ **Enhancements**:
- POST requires authentication (Bearer token or ES256 signature)
- Rate limiting: Max 1 heartbeat per 5 seconds per agent
- Signature verification (δ-layer)

---

## Performance

### Edge Runtime

**Latency**:
- `/api/mesh/heartbeat`: ~8-10ms (simple JSON response)
- `/api/mesh/peers`: ~10-15ms (array serialization)

**Scalability**:
- Static stubs: No scaling issues (deterministic response)
- Week 3+ registry: In-memory Map (O(1) lookup, O(n) filter for expiration)

**Caching**:
- `Cache-Control: no-cache` (always fresh data)
- Week 3+ could add short TTL (e.g., 1s) to reduce load

---

## Testing

### Smoke Test

**Script**: `scripts/tools/user.copilot.os1p2mesh.smoke.v2025.10.13.ps1`

**Tests**:
1. GET `/api/mesh/heartbeat` → Expect 200 + `ok: true` + `X-SEC-COMMS-MODE` header
2. GET `/api/mesh/peers` → Expect 200 + `peers: [...]` + `X-SEC-COMMS-MODE` header

**Report**: `docs/reports/user.copilot.os1p2mesh.smoke.v2025.10.13.md`

### Manual Testing

```bash
# Start dev server
npm run dev:web-ui

# Test heartbeat
curl http://localhost:4000/api/mesh/heartbeat

# Test peers
curl http://localhost:4000/api/mesh/peers
```

**Expected Output**:
```json
// /api/mesh/heartbeat
{
  "ok": true,
  "ts": "2025-10-13T14:30:00.000Z",
  "mode": "local_only",
  "intervalMs": 5000
}

// /api/mesh/peers
{
  "ok": true,
  "peers": [
    { "id": "gabriel", "status": "up", ... },
    { "id": "codex", "status": "up", ... }
  ],
  "mode": "local_only",
  "note": "Static stub for Week 2..."
}
```

---

## Integration with Dual-Agent Chat UI

### Week 2 UI Features

**Agent Selector**:
- Fetch peers from `/api/mesh/peers`
- Display dropdown: "Gabriel" | "Codex"
- Default: Gabriel (empathy-focused)

**Collaborate Toggle**:
- Checkbox: "Collaborate with both agents"
- If enabled: Parallel requests to `/api/chat` with different `agentId`
- Display responses side-by-side (split view)

**Heartbeat Indicator**:
- Poll `/api/mesh/heartbeat` every 5 seconds
- Display green dot if heartbeat fresh (< 10s ago)
- Display red dot if heartbeat stale (> 10s ago)

### Example React Component

```typescript
import { useEffect, useState } from 'react';

export function useMeshPeers() {
  const [peers, setPeers] = useState([]);
  
  useEffect(() => {
    const fetchPeers = async () => {
      const res = await fetch('/api/mesh/peers');
      const data = await res.json();
      setPeers(data.peers);
    };
    
    fetchPeers();
    const interval = setInterval(fetchPeers, 5000); // Poll every 5s
    
    return () => clearInterval(interval);
  }, []);
  
  return peers;
}
```

---

## Rollback Plan

### If Issues Arise

1. **Disable Endpoints**:
   - Delete `apps/web-ui/app/api/mesh/heartbeat/route.ts`
   - Delete `apps/web-ui/app/api/mesh/peers/route.ts`

2. **Revert SEC-COMMS Bridge**:
   - Remove `getSecMode()` export (keep `getMode()` for chat)

3. **Remove Smoke Test**:
   - Delete `scripts/tools/user.copilot.os1p2mesh.smoke.v2025.10.13.ps1`
   - Delete report from `docs/reports/`

4. **Frontend Fallback**:
   - UI defaults to single-agent mode (Gabriel only)
   - Hide "Collaborate" toggle

---

## References

- **Multi-Agent Timeline**: `docs/project_plans/user.copilot.os1p2ops.project-plan.v2025.10.13.md`
- **SEC-COMMS Policy**: `docs/policies/user.copilot.os1p1webui.seccomms-beta.v2025.10.10.md`
- **Trial Connection Report**: `docs/reports/user.copilot.os1p2ops.trial-connection-report.v2025.10.13.md`

---

**Last Updated**: v2025.10.13  
**Status**: Week 2 static stub endpoints operational  
**Next**: Week 3 dynamic peer registry + ES256 signing
