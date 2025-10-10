# MADM α — Hierarchical Consensus Kernel · v2025.10.11

X-Tier1: user
X-Agent: copilot
X-Domain: vision
X-Purpose: madm-alpha-consensus-kernel-skeleton
X-Version: v2025.10.11
X-Policy: filename+header compliance required

## Overview

MADM α formalizes distributed cognition within OS One.  
Agents act as decision-making nodes contributing scalar judgments (–5 to +5) on proposals raised by Tier 1 or peer agents.  
Consensus is achieved through weighted averaging and rule-based polarity thresholds.

## Core Principles

### 1. Hierarchical Input Flow

- **Tier 1 (Human/Executive)** initiates task context and problem statement.  
- **Tier 2+ (Agents)** submit quantified evaluations or supporting analysis.  

### 2. Scalar Agreement System

- **Range**: –5 = strong oppose → +5 = strong support.  
- **Acceptance**: `Σ(ratings)/n ≥ +1` → accepted direction.  
- **Rejection**: `Σ(ratings)/n ≤ –1` → rejected direction.  
- **Deliberation**: `–1 < avg < +1` → discussion continues.  

### 3. Decision Tokenization

- Each vote packaged as a signed `decision.packet` (JSON) via SEC-COMMS.  
- **Metadata**: `agent_id`, `tier`, `timestamp`, `rating`, `justification`.  
- Stored transiently in encrypted mesh memory; optional persistence via vault (Phase ε).  

### 4. Consensus State Evolution

- Aggregator node computes rolling average + variance.  
- New consensus → system leans its active goal vector toward accepted direction.  
- Recorded in `consensus.log` for historical replay / training.  

### 5. Governance & Ethics

- All voting agents must reference ethics-policy document IDs.  
- Human veto overrides maintain safety & accountability.  

## Integration Roadmap

| Phase | Deliverable | Description |
|-------|------------|-------------|
| β | Decision Packet Schema | JSON spec + signature validation |
| γ | Consensus Engine Prototype | Aggregation service on SEC-COMMS mesh |
| δ | Visualization Module | Real-time decision flow in WebUI dashboard |
| ε | Memory Continuity | Persist decision states for self-evolving governance |

## Example (Pseudocode)

```typescript
// agentVote.ts
const vote = {
  agent_id: "overwatch",
  tier: 2,
  rating: +3,
  justification: "Risk acceptable; benefit high",
  ts: Date.now()
};
mesh.send("gabriel", "madm", "vote", vote);

// consensusEngine.ts
const aggregate = votes.reduce((sum, v) => sum + v.rating, 0) / votes.length;
if (aggregate >= 1) {
  return { decision: "ACCEPT", confidence: aggregate };
} else if (aggregate <= -1) {
  return { decision: "REJECT", confidence: Math.abs(aggregate) };
} else {
  return { decision: "DELIBERATE", confidence: 0 };
}
```

## Compliance

- Follows `user.copilot.os1p2madm.*` compound convention.  
- Valid under filename regex v2025.10.11.  
- Cross-references: SEC-COMMS γ–δ layers and filenaming policy v2025.10.11.  

## Vision

MADM α transforms project management into emulated consciousness:  
a self-balancing governance system where every agent contributes to a unified, measurable awareness stream.  
This document anchors that evolution pathway.

## Technical Architecture (Conceptual)

### Decision Packet Schema (Phase β)

```json
{
  "$schema": "madm-decision-packet.v1",
  "agent_id": "string",
  "tier": 1 | 2 | 3,
  "proposal_id": "uuid",
  "rating": -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5,
  "justification": "string",
  "timestamp": "ISO8601",
  "signature": "ES256",
  "ethics_policy_refs": ["doc_id_1", "doc_id_2"]
}
```

### Consensus Engine (Phase γ)

**Responsibilities**:
- Collect decision packets from SEC-COMMS mesh  
- Validate signatures and ethics policy references  
- Compute weighted averages (tier-based weighting optional)  
- Apply threshold rules  
- Broadcast consensus state updates  

**Security**:
- All packets encrypted via SEC-COMMS AES-GCM  
- Identity verified via ES256 signatures  
- Rate limiting per agent to prevent vote flooding  

### Visualization Module (Phase δ)

**UI Components**:
- Real-time decision flow graph (agent nodes → proposal nodes)  
- Scalar rating distribution (histogram)  
- Consensus state timeline (accepted/rejected/deliberating)  
- Agent participation metrics  

**Integration**:
- WebUI dashboard at `/madm`  
- Live updates via WebSocket or Server-Sent Events  
- Historical replay from `consensus.log`  

### Memory Continuity (Phase ε)

**Persistence Layer**:
- Optional vault storage for decision history  
- Replay capability for training and governance evolution  
- Self-evolving policy refinement based on historical patterns  

**Privacy**:
- Encrypted at rest (SEC-COMMS local_only mode by default)  
- Opt-in for remote persistence (requires seccomms_on mode)  

## Use Cases

### 1. Feature Prioritization
**Scenario**: Gabriel proposes new WebUI feature  
**Process**:
1. Tier 1 (User) initiates proposal with context  
2. Agents (Overwatch, Kharma, Pearl) submit ratings  
3. Consensus engine aggregates → +2.3 avg → ACCEPT  
4. Feature added to backlog with confidence score  

### 2. Security Policy Amendment
**Scenario**: Modify SEC-COMMS CORS policy  
**Process**:
1. Tier 1 proposes policy change  
2. Security-focused agents vote (weighted higher for security topics)  
3. Requires +3.0 avg for security changes → deliberation continues  
4. Human veto available if consensus stalls  

### 3. Resource Allocation
**Scenario**: Distribute compute budget across subsystems  
**Process**:
1. Budget proposal submitted with allocation percentages  
2. Subsystem agents vote based on need + ethics  
3. Rolling consensus updates as new information emerges  
4. Final allocation when consensus stabilizes  

## Future Extensions

- **Weighted Voting**: Tier-based or domain-expertise weights  
- **Quorum Rules**: Minimum participation thresholds  
- **Time Decay**: Stale votes lose influence over time  
- **Conflict Resolution**: Tie-breaking protocols  
- **Learning Loop**: Self-tuning thresholds based on outcome quality  

## References

- [SEC-COMMS γ (Operational Mesh)](../../README.md#operational-mesh-sec-comms-γ)  
- [SEC-COMMS δ (Identity & Relay)](../../README.md#identity--relay-sec-comms-δ)  
- [STB Filename Policy](../policies/user.copilot.docs.stb-filename-header-policy.v2025.10.10.md)  
- [Ethics Core Values](../policies/user.chatgpt5.os1p1.ethics-core-values.v2025.10.06.md)  

## Status

**Phase**: Conceptual (α)  
**Target Implementation**: Phase 2 (os1p2madm subsystem)  
**Dependencies**: SEC-COMMS γ–δ, WebUI mesh integration  
**Next Steps**: Decision packet schema design (Phase β)  

---

*MADM α is the cognitive substrate enabling OS One to evolve from task execution into collaborative intelligence.*
