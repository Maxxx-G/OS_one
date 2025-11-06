X-Tier1: user
X-Agent: copilot
X-Domain: os1p1webui
X-Purpose: autonomic-theta-init
X-Version: v2025.10.12
X-Policy: filename+header compliance required

---

# OS1 — Single Task Block (STB) · v2025.10.12
## Autonomic Theta Layer Initialization

**Title**: Autonomic Theta Layer Initialization  
**Scope**: Initialize SEC-COMMS θ-layer (Autonomic Mesh) for agent-to-agent communication  
**Constraints**: ≤5 files, backend-only changes, zero UI disruption  
**Owner**: copilot  
**Status**: PENDING

---

## Objective

Initialize the SEC-COMMS θ-layer (Autonomic Mesh) to enable agent-to-agent signaling and coordination via:
- WebSocket mesh endpoint (`/api/mesh/theta`)
- Peer discovery and registration protocol
- Encrypted autonomic message relay (agent ↔ agent)
- Compliance with STB header/filename policies

All changes are backend-focused; no UI modifications required. Must pass guardian + smoke tests.

---

## Constraints

1. **File Limit**: ≤5 files (create/modify combined)
2. **No UI Changes**: All modifications in `apps/web-ui/src/pages/api/` or `apps/web-ui/src/server/`
3. **SEC-COMMS Compliance**: Theta-layer messages must be encrypted (TLS + optional E2E)
4. **Guardian Pass**: All new/modified files must have STB headers and compound filenames
5. **Smoke Test Pass**: `npm run smoke` must succeed post-implementation

---

## Implementation Plan (≤5 Files)

### File 1: `apps/web-ui/src/pages/api/mesh/theta.ts`
- **Action**: CREATE
- **Purpose**: WebSocket endpoint for autonomic mesh signaling
- **Content**:
  - WebSocket handler (using Next.js API route or similar)
  - Peer registration: `{ agentId, capabilities, status }`
  - Message relay: `{ from, to, payload, timestamp }`
  - STB headers: `X-Tier1: user, X-Agent: copilot, X-Domain: os1p1webui, X-Purpose: theta-mesh-endpoint, X-Version: v2025.10.12`

### File 2: `apps/web-ui/src/server/thetaMeshManager.ts`
- **Action**: CREATE
- **Purpose**: Mesh state management (peer registry, message queue)
- **Content**:
  - `peerRegistry: Map<agentId, PeerInfo>`
  - `relayMessage(from, to, payload)` function
  - `discoverPeers()` function (local mesh discovery)
  - STB headers

### File 3: `apps/web-ui/src/types/mesh.ts`
- **Action**: CREATE
- **Purpose**: TypeScript interfaces for autonomic mesh
- **Content**:
  - `PeerInfo { agentId, capabilities, endpoint, lastSeen }`
  - `MeshMessage { from, to, payload, timestamp, encrypted }`
  - `MeshStatus` enum (ONLINE, OFFLINE, SYNCING)
  - STB headers

### File 4: `apps/web-ui/src/server/meshAuth.ts`
- **Action**: CREATE
- **Purpose**: Authentication/authorization for mesh peers
- **Content**:
  - `validatePeer(agentId, token)` function
  - `generateMeshToken(agentId)` function
  - Integration with existing auth layer
  - STB headers

### File 5: `apps/web-ui/next.config.js` (or similar config)
- **Action**: MODIFY
- **Purpose**: Enable WebSocket support in Next.js API routes (if needed)
- **Content**:
  - WebSocket configuration (e.g., `experimental.appDir`, custom server settings)
  - CORS settings for mesh endpoints
  - STB headers (as JS comment block if .js, or create `.mjs` with headers)

**Alternative File 5**: If config changes not needed, create `apps/web-ui/src/pages/api/mesh/discover.ts` for peer discovery endpoint

---

## Acceptance Criteria

1. ✅ Guardian passes: `node scripts/checks/stb_guard.mjs` → PASS
2. ✅ STB validator passes: `npm run validate:stb` → PASS
3. ✅ Smoke test passes: `npm run smoke` → PASS
4. ✅ `/api/mesh/theta` endpoint responds to WebSocket connections
5. ✅ Peer registration functional (mock test with 2+ peers)
6. ✅ Message relay confirmed (peer A → theta → peer B)

---

## Rollback Plan

If implementation exceeds 5 files or introduces regressions:

1. **Immediate**: `git reset --hard HEAD~1` (if committed)
2. **Verification**: Re-run `npm run smoke` to confirm rollback
3. **Alternative**: Split into 2 STBs:
   - STB-A: Mesh endpoint + basic peer registry (3 files)
   - STB-B: Authentication + advanced routing (2 files)

---

## Commit Stub

```
feat(mesh): initialize SEC-COMMS θ-layer (autonomic mesh)

- Add /api/mesh/theta WebSocket endpoint (≤5 files)
- Implement peer registry + message relay
- Add mesh authentication layer
- Create TypeScript interfaces for mesh domain

Acceptance:
✅ guardian PASS
✅ validate:stb PASS
✅ smoke PASS

Refs: SEC-COMMS θ-layer, docs/policies/user.copilot.os1p1webui.seccomms-beta.v2025.10.10.md
```

---

## Dependencies

- **SEC-COMMS Policy**: `docs/policies/user.copilot.os1p1webui.seccomms-beta.v2025.10.10.md` (θ-layer spec)
- **WebSocket Library**: Next.js built-in or `ws` package (if custom server)
- **STB Policies**: `docs/templates/user.copilot.os1p1docs.filenaming-policies.v2025.10.04.md`
- **Existing Auth**: `apps/web-ui/src/server/` authentication modules (if applicable)

---

## Notes

- θ-layer is **agent-to-agent only** (not user-facing); no UI components needed
- Message encryption can use TLS (transport layer) initially; E2E encryption deferred to future STB
- Peer discovery is **local mesh** (same network/cluster); cross-network discovery out of scope
- If WebSocket config conflicts with existing Next.js setup, use alternative File 5 (discover endpoint)
- Integration with α-η layers (client ↔ server ↔ mesh) handled in future STBs
