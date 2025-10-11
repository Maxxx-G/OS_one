X-Tier1: user
X-Agent: copilot
X-Domain: os1p2ops
X-Purpose: multiagent-timeline
X-Version: v2025.10.13
X-Policy: filename+header compliance required

---

# Multi-Agent Control Timeline · OS One Phase 2

**Duration**: 6 weeks (October 13 – November 24, 2025)  
**Objective**: Progress from single-agent trial connection to multi-agent MADM α consensus  
**Scope**: Gabriel + Codex dual-agent chat → MADM α voting → Autonomic θ policies

---

## Overview

OS One's evolution to **multi-agentic control** follows a staged rollout:

| Week | Phase | Milestone | Status |
|------|-------|-----------|--------|
| **0-1** | Trial Connection | SEC-COMMS α–ε–ζ–η online, chat SSE ready | ✅ **COMPLETE** |
| **2** | Dual-Agent Chat | Gabriel + Codex behind feature flag | 🔄 **NEXT** |
| **3-4** | MADM α Prototype | –5..+5 scalar voting, accept/reject thresholds | 📋 Planned |
| **5-6** | Autonomic θ | Background policies (rate limit, retry, escalation) | 📋 Planned |

---

## Week 0-1: Trial Connection (October 13-20)

### Status: ✅ **COMPLETE**

**Goal**: Validate SEC-COMMS infrastructure, health endpoints, chat SSE backend.

**Deliverables**:
- ✅ Trial Connection Report (comprehensive status grid)
- ✅ CI Smoke Test Suite (12 tests: STB, health, SEC-COMMS, chat, secrets)
- ✅ Tool Transition Workflows (Mobbin→Figma→Replit→Builder.io)
- ✅ All health endpoints return 200 JSON (`/api/health`, `/api/aurora/health`, `/api/lexicore/health`, `/api/voice/health`)
- ✅ Chat SSE backend with SEC-COMMS gating (Ollama local vs OpenAI external)

**Key Achievements**:
- SEC-COMMS α (egress control), ε (vault), ζ (replay), η (telemetry) all operational
- Guardian blocking mode enforced (pre-commit + CI)
- Vault/embeddings properly ignored in Git
- Smoke tests pass (except chat requires dev server, expected)

**Blockers**: None

**Next**: Week 2 (Dual-Agent Chat)

---

## Week 2: Dual-Agent Chat (October 20-27)

### Status: 🔄 **NEXT**

**Goal**: Enable Gabriel + Codex to collaborate in `/chat` interface behind feature flag.

### Architecture

**Mesh γ-Layer (Peer-to-Peer)**:
- Each agent broadcasts heartbeat every 5 seconds
- Heartbeat contains: `{ agentId, timestamp, status, capabilities }`
- Endpoint: `POST /api/mesh/heartbeat`, `GET /api/mesh/peers`

**Chat Interface Update**:
- Add agent selector: User chooses Gabriel (empathy) or Codex (technical)
- Enable multi-agent toggle: "Collaborate with both agents"
- Display dual responses in split view (left: Gabriel, right: Codex)

**Feature Flag**:
- Environment variable: `ENABLE_MULTI_AGENT=true`
- Config file: `config/features.json` → `{ "multiAgent": { "enabled": true } }`
- Frontend check: `useFeatureFlag('multiAgent')` hook

### Implementation Tasks

#### Task 1: Mesh γ-Layer Backend (2 days)

**Files**:
- `apps/web-ui/app/api/mesh/heartbeat/route.ts` (POST handler)
- `apps/web-ui/app/api/mesh/peers/route.ts` (GET handler)
- `apps/web-ui/lib/mesh-service.ts` (in-memory peer registry)

**Logic**:
```typescript
// POST /api/mesh/heartbeat
// Store heartbeat in memory (expires after 15 seconds)
export async function POST(req: Request) {
  const { agentId, status, capabilities } = await req.json();
  
  registerPeer({
    agentId,
    timestamp: Date.now(),
    status,
    capabilities,
  });
  
  return NextResponse.json({ ok: true });
}

// GET /api/mesh/peers
// Return list of active peers (heartbeat < 15s ago)
export async function GET() {
  const peers = getActivePeers();
  return NextResponse.json({ peers });
}
```

**Validation**:
- Smoke test: POST heartbeat with Gabriel ID, GET peers returns Gabriel
- Timeout test: Wait 20 seconds, GET peers returns empty (heartbeat expired)

#### Task 2: Chat Multi-Agent Toggle (3 days)

**Files**:
- `apps/web-ui/app/chat/page.tsx` (add agent selector + toggle)
- `apps/web-ui/app/chat/useMultiAgent.ts` (hook for dual responses)
- `apps/web-ui/app/chat/DualResponseView.tsx` (split-pane component)

**UI Mockup**:
```
┌─────────────────────────────────────────┐
│ Agent: [Gabriel ▼] [✓] Collaborate     │
├─────────────────┬───────────────────────┤
│ Gabriel         │ Codex                 │
│ "I understand   │ "The technical issue  │
│ your concern... │ stems from...         │
│                 │                       │
└─────────────────┴───────────────────────┘
```

**Logic**:
- If toggle OFF: Single-agent chat (existing behavior)
- If toggle ON: Parallel requests to `/api/chat` with different `agentId`
- Display responses side-by-side (Gabriel left, Codex right)

**Validation**:
- Smoke test: Enable toggle, send message, verify 2 SSE streams
- Feature flag test: Disable `ENABLE_MULTI_AGENT`, toggle should be hidden

#### Task 3: Telemetry Integration (1 day)

**Files**:
- `apps/web-ui/app/api/telemetry/route.ts` (update to include mesh peers)

**Update**:
```typescript
// Add mesh peer count to telemetry snapshot
const peers = getActivePeers();

return NextResponse.json({
  mode: "local_only",
  timestamp: new Date().toISOString(),
  mesh: {
    activePeers: peers.length,
    peers: peers.map(p => ({ agentId: p.agentId, status: p.status })),
  },
  // ...existing telemetry
});
```

**Validation**:
- GET `/api/telemetry` includes `mesh.activePeers`
- Dashboard shows mesh status (future UI enhancement)

### Deliverables

- [ ] Mesh γ-layer endpoints (`/api/mesh/heartbeat`, `/api/mesh/peers`)
- [ ] Chat multi-agent toggle UI
- [ ] Dual-response split view
- [ ] Feature flag config (`ENABLE_MULTI_AGENT`)
- [ ] Smoke test for mesh heartbeat + dual-agent chat
- [ ] Telemetry update with mesh peer count

### Acceptance Criteria

- ✅ POST `/api/mesh/heartbeat` stores peer (expires after 15s)
- ✅ GET `/api/mesh/peers` returns active peers only
- ✅ Chat toggle visible when `ENABLE_MULTI_AGENT=true`
- ✅ Dual responses display correctly (Gabriel + Codex)
- ✅ Telemetry includes mesh peer count
- ✅ Smoke test PASS (mesh + dual-agent)

### Estimated Effort

- Backend (mesh γ): 2 days
- Frontend (UI toggle + dual view): 3 days
- Telemetry integration: 1 day
- **Total**: 6 days (within Week 2)

---

## Week 3-4: MADM α Prototype (October 27 – November 10)

### Status: 📋 **PLANNED**

**Goal**: Implement Multi-Agent Decision Making (MADM) with scalar voting (–5 to +5).

### Architecture

**MADM α-Layer (Scalar Voting)**:
- Each agent votes on a decision: –5 (strongly reject) to +5 (strongly approve)
- Threshold: Accept if average ≥ +2, reject if average ≤ –2, escalate if –2 < avg < +2
- Decision packets signed with ES256 (identity layer)

**Use Case: Code Merge Approval**:
- User submits code PR
- Gabriel votes: +3 (empathetic, encourages progress)
- Codex votes: –4 (detects security issue)
- Average: (3 + –4) / 2 = –0.5 → **ESCALATE** (manual review)

### Implementation Tasks

#### Task 1: MADM α Backend (3 days)

**Files**:
- `apps/web-ui/app/api/madm/vote/route.ts` (POST handler)
- `apps/web-ui/app/api/madm/decision/route.ts` (GET handler)
- `apps/web-ui/lib/madm-engine.ts` (voting logic + threshold calculation)
- `apps/web-ui/lib/madm-signature.ts` (ES256 signing for decision packets)

**Logic**:
```typescript
// POST /api/madm/vote
export async function POST(req: Request) {
  const { decisionId, agentId, vote, rationale } = await req.json();
  
  // Validate vote in range –5..+5
  if (vote < -5 || vote > 5) {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }
  
  // Store vote with signature
  const signature = await signVote({ decisionId, agentId, vote });
  registerVote({ decisionId, agentId, vote, rationale, signature });
  
  return NextResponse.json({ ok: true });
}

// GET /api/madm/decision/:decisionId
export async function GET(req: Request, { params }) {
  const { decisionId } = params;
  const votes = getVotes(decisionId);
  
  // Calculate average
  const avg = votes.reduce((sum, v) => sum + v.vote, 0) / votes.length;
  
  // Determine outcome
  const outcome = avg >= 2 ? "ACCEPT" : avg <= -2 ? "REJECT" : "ESCALATE";
  
  return NextResponse.json({ decisionId, votes, average: avg, outcome });
}
```

**Validation**:
- Smoke test: POST votes from Gabriel (+3) and Codex (–4), GET decision returns ESCALATE
- Signature test: Verify ES256 signature on decision packet

#### Task 2: Decision UI (2 days)

**Files**:
- `apps/web-ui/app/decisions/page.tsx` (list of pending decisions)
- `apps/web-ui/app/decisions/[id]/page.tsx` (decision detail + votes)
- `apps/web-ui/app/decisions/DecisionCard.tsx` (vote visualization)

**UI Mockup**:
```
┌─────────────────────────────────────────┐
│ Decision: Merge PR #123                 │
├─────────────────────────────────────────┤
│ Gabriel: +3  "Great progress!"          │
│ Codex:   –4  "Security issue detected"  │
├─────────────────────────────────────────┤
│ Average: –0.5                            │
│ Outcome: ⚠️  ESCALATE (manual review)    │
└─────────────────────────────────────────┘
```

**Validation**:
- Display pending decisions at `/decisions`
- Click decision to view votes + outcome
- Show color-coded outcome (green = ACCEPT, red = REJECT, yellow = ESCALATE)

#### Task 3: ES256 Identity Signing (2 days)

**Files**:
- `apps/web-ui/lib/identity-service.ts` (ES256 key generation + signing)
- `apps/web-ui/lib/vault-service.ts` (update to store identity keys)

**Logic**:
```typescript
import { generateKeyPair, sign } from '@noble/secp256k1';

// Generate ES256 identity key (store in vault)
export async function generateIdentityKey(agentId: string) {
  const privKey = generateKeyPair();
  await writeVaultFile(`identity_${agentId}.key`, privKey);
  return privKey;
}

// Sign decision packet
export async function signDecisionPacket(packet: DecisionPacket) {
  const privKey = await readVaultFile(`identity_${packet.agentId}.key`);
  const hash = sha256(JSON.stringify(packet));
  const signature = await sign(hash, privKey);
  return signature;
}
```

**Validation**:
- Generate identity key for Gabriel and Codex
- Sign decision packet, verify signature with public key
- Store identity keys in vault (encrypted with AES-GCM)

### Deliverables

- [ ] MADM α backend (`/api/madm/vote`, `/api/madm/decision`)
- [ ] Decision UI (`/decisions`)
- [ ] ES256 identity signing (vault-backed)
- [ ] Smoke test for scalar voting + threshold calculation
- [ ] Documentation: MADM α voting protocol

### Acceptance Criteria

- ✅ POST `/api/madm/vote` accepts –5..+5 votes
- ✅ GET `/api/madm/decision/:id` returns average + outcome (ACCEPT/REJECT/ESCALATE)
- ✅ Decision packets signed with ES256 (stored in vault)
- ✅ UI displays pending decisions with color-coded outcomes
- ✅ Smoke test PASS (voting + signature verification)

### Estimated Effort

- Backend (MADM α): 3 days
- Frontend (Decision UI): 2 days
- Identity signing: 2 days
- **Total**: 7 days (spread over Week 3-4)

---

## Week 5-6: Autonomic θ (November 10-24)

### Status: 📋 **PLANNED**

**Goal**: Implement background autonomic policies (rate limiting, retry, escalation).

### Architecture

**Autonomic θ-Layer (Self-Regulation)**:
- Background policies run without user intervention
- Examples:
  - **Rate Limiting**: Throttle API calls to prevent abuse
  - **Retry Logic**: Auto-retry failed requests (exponential backoff)
  - **Escalation**: Notify admin when error threshold exceeded

**Use Case: Chat API Rate Limiting**:
- Policy: Max 10 messages per minute per user
- Enforcement: Middleware checks request count, returns 429 if exceeded
- Escalation: If user exceeds limit 3 times, flag for review

### Implementation Tasks

#### Task 1: Policy Engine (3 days)

**Files**:
- `apps/web-ui/lib/autonomic-engine.ts` (policy registry + execution)
- `apps/web-ui/lib/policies/rate-limit.ts` (rate limiting policy)
- `apps/web-ui/lib/policies/retry.ts` (retry policy)
- `apps/web-ui/lib/policies/escalation.ts` (escalation policy)

**Logic**:
```typescript
// Policy interface
interface Policy {
  name: string;
  enabled: boolean;
  execute: (context: PolicyContext) => Promise<PolicyResult>;
}

// Rate limiting policy
const rateLimitPolicy: Policy = {
  name: "rate-limit",
  enabled: true,
  execute: async (ctx) => {
    const count = await getRequestCount(ctx.userId);
    if (count > 10) {
      return { action: "BLOCK", reason: "Rate limit exceeded" };
    }
    return { action: "ALLOW" };
  },
};
```

**Validation**:
- Smoke test: Send 11 requests in 1 minute, 11th request blocked
- Escalation test: Exceed rate limit 3 times, admin notified

#### Task 2: Middleware Integration (2 days)

**Files**:
- `apps/web-ui/middleware.ts` (Next.js middleware for policy enforcement)

**Logic**:
```typescript
import { runPolicies } from '@/lib/autonomic-engine';

export async function middleware(req: NextRequest) {
  const result = await runPolicies({
    userId: req.headers.get('x-user-id'),
    path: req.nextUrl.pathname,
  });
  
  if (result.action === "BLOCK") {
    return new Response(result.reason, { status: 429 });
  }
  
  return NextResponse.next();
}
```

**Validation**:
- Middleware blocks request when rate limit exceeded
- Middleware allows request when within limit

#### Task 3: Autonomic UI Toggle (2 days)

**Files**:
- `apps/web-ui/app/settings/page.tsx` (autonomic policy toggles)
- `apps/web-ui/lib/policies/config.ts` (policy configuration storage)

**UI Mockup**:
```
┌─────────────────────────────────────────┐
│ Autonomic Policies                      │
├─────────────────────────────────────────┤
│ [✓] Rate Limiting (10 req/min)         │
│ [✓] Auto-Retry (3 attempts)            │
│ [ ] Escalation (admin notify)           │
└─────────────────────────────────────────┘
```

**Validation**:
- Toggle rate limiting OFF, send 11 requests (all succeed)
- Toggle rate limiting ON, 11th request blocked

#### Task 4: Audit Log (1 day)

**Files**:
- `apps/web-ui/app/api/autonomic/audit/route.ts` (GET handler)
- `apps/web-ui/lib/audit-logger.ts` (log policy actions)

**Logic**:
```typescript
// Log policy action
export function logPolicyAction(action: PolicyAction) {
  appendToLog({
    timestamp: Date.now(),
    policy: action.policyName,
    action: action.action, // ALLOW | BLOCK | ESCALATE
    userId: action.userId,
    reason: action.reason,
  });
}

// GET /api/autonomic/audit
export async function GET() {
  const logs = await readAuditLog();
  return NextResponse.json({ logs });
}
```

**Validation**:
- GET `/api/autonomic/audit` returns policy action history
- Logs include timestamp, policy name, action, user ID

### Deliverables

- [ ] Autonomic policy engine (`rate-limit`, `retry`, `escalation`)
- [ ] Middleware integration (policy enforcement)
- [ ] Autonomic UI toggle (`/settings`)
- [ ] Audit log (`/api/autonomic/audit`)
- [ ] Smoke test for rate limiting + escalation

### Acceptance Criteria

- ✅ Rate limiting blocks requests exceeding 10 req/min
- ✅ Retry policy auto-retries failed requests (exponential backoff)
- ✅ Escalation policy notifies admin when threshold exceeded
- ✅ UI toggles enable/disable policies
- ✅ Audit log tracks all policy actions
- ✅ Smoke test PASS (rate limit + audit log)

### Estimated Effort

- Policy engine: 3 days
- Middleware: 2 days
- UI toggle: 2 days
- Audit log: 1 day
- **Total**: 8 days (spread over Week 5-6)

---

## Summary Timeline

| Week | Phase | Key Deliverables | Effort |
|------|-------|------------------|--------|
| **0-1** | Trial Connection | SEC-COMMS α–ε–ζ–η, chat SSE, health endpoints | ✅ Complete |
| **2** | Dual-Agent Chat | Mesh γ, multi-agent toggle, dual-response view | 6 days |
| **3-4** | MADM α | Scalar voting, ES256 signing, decision UI | 7 days |
| **5-6** | Autonomic θ | Policy engine, rate limit, retry, escalation | 8 days |

**Total Effort**: 21 days (distributed over 6 weeks with buffer for testing/refinement)

---

## Risk Mitigation

### Week 2 Risks

- **Mesh heartbeat timeout issues**: Use in-memory registry with aggressive cleanup (15s TTL)
- **Dual-agent UI complexity**: Start with simple split view, enhance later

### Week 3-4 Risks

- **ES256 signature performance**: Cache identity keys in memory (avoid vault read per request)
- **MADM voting latency**: Use async voting (don't block user on agent votes)

### Week 5-6 Risks

- **Rate limiting false positives**: Allow burst (e.g., 15 req in first minute, then 10/min)
- **Middleware performance overhead**: Optimize policy checks (< 5ms per request)

---

## Success Metrics

| Metric | Target | Tracking |
|--------|--------|----------|
| Mesh peer uptime | > 95% (heartbeat every 5s) | `/api/telemetry` |
| Dual-agent response time | < 2s (parallel SSE streams) | Frontend timing |
| MADM decision accuracy | > 90% (matches manual review) | Decision audit log |
| Autonomic policy uptime | > 99% (always-on policies) | Middleware health check |
| Rate limit false positive | < 1% (legitimate requests blocked) | Audit log analysis |

---

## Rollback Plan

### Week 2 Rollback
- Disable `ENABLE_MULTI_AGENT` flag
- Revert mesh endpoints (delete `/api/mesh`)
- Chat reverts to single-agent mode

### Week 3-4 Rollback
- Disable MADM α endpoints (delete `/api/madm`)
- Revert to manual decision-making (no voting)
- Keep ES256 identity keys (future use)

### Week 5-6 Rollback
- Disable autonomic policies (toggle all OFF)
- Remove middleware policy checks (pass-through)
- Keep audit log for historical data

---

## References

- **Trial Connection Report**: `docs/reports/user.copilot.os1p2ops.trial-connection-report.v2025.10.13.md`
- **MADM α Design**: `docs/vision/user.copilot.vision.madm-alpha.v2025.10.11.md`
- **SEC-COMMS Policy**: `docs/policies/user.copilot.os1p1webui.seccomms-beta.v2025.10.10.md`

---

**Last Updated**: v2025.10.13  
**Next Review**: v2025.10.20 (Week 2 kickoff)  
**Contact**: OS One Operations Team
