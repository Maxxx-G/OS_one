X-Tier1: user
X-Agent: copilot
X-Domain: os1p2replay
X-Purpose: spec
X-Version: v2025.10.12
X-Policy: filename+header compliance required

# Neural Replay Specification — SEC-COMMS ζ
**Version**: v2025.10.12  
**Spec ID**: `os1p2replay`  
**Phase**: SEC-COMMS Zeta (ζ) — Temporal Cortex Layer  
**Status**: Active

---

## Purpose
Neural replay provides **adaptive context learning** by extracting semantic embeddings from vault logs. If Epsilon (ε) gave OS One its frontal lobe memory, then Zeta (ζ) forms its temporal cortex—the layer that replays, learns, and adapts.

This enables:
- **Pattern recognition** across sessions
- **Context-aware recall** with minimal token cost
- **Adaptive learning** from historical decisions

---

## Architecture

### 1. Replay Process
**Trigger**: Manual (via `/api/replay POST`) or scheduled (future)

**Pipeline**:
1. Read vault files: `memory.snap`, `madm.log`
2. Merge into unified context representation
3. Generate embedding vector via `embedding-core.ts`
4. Store in `data/embeddings/replay-{timestamp}.json`

**Output Format**:
```json
{
  "vector": [0.123, -0.456, ...],
  "meta": {
    "ts": 1234567890,
    "replayVersion": "zeta-v1",
    "dimension": 768,
    "hasMemory": true,
    "hasMADM": false
  }
}
```

### 2. Embedding Engine
**Local Mode** (`local_only`):
- Model: `nomic-embed-text` via Ollama
- Dimension: 768
- Endpoint: `http://localhost:11434/api/embeddings`

**Remote Mode** (`seccomms_on`):
- Model: `text-embedding-3-small` via OpenAI
- Dimension: 1536
- Requires: `OPENAI_API_KEY` environment variable

**Fallback**: Returns zero vectors if services unavailable (graceful degradation)

### 3. Similarity Search
**Function**: `findSimilarEmbeddings(queryText, topK)`

**Process**:
1. Generate embedding for query text
2. Load all stored embeddings
3. Compute cosine similarity: `dot(a, b) / (norm(a) * norm(b))`
4. Return top K matches sorted by similarity

**Use Cases**:
- "Find decisions similar to current context"
- "Recall past sessions about topic X"
- "Identify recurring patterns in agent behavior"

---

## File Lifecycle

### Creation
- **Trigger**: `/api/replay POST` endpoint
- **Naming**: `replay-{timestamp}.json`
- **Location**: `data/embeddings/`
- **Frequency**: On-demand (manual or scheduled)

### Rotation
- **Function**: `rotateEmbeddings(keepCount)`
- **Default**: Keep last 100 embeddings
- **Strategy**: Delete oldest files by timestamp
- **Reasoning**: Prevent unbounded storage growth while maintaining recent context

### Archival
- **Future**: Export to cold storage (S3, local archive)
- **Format**: Compressed JSON bundles
- **Retention**: TBD based on user policy

### Deletion
- **Manual**: Via filesystem (no API exposure)
- **Automatic**: Via rotation (`rotateEmbeddings()`)
- **Compliance**: Must respect data retention policies

---

## API Specification

### POST `/api/replay`
**Purpose**: Trigger vault replay or perform similarity search

**Request Body** (optional):
```json
{
  "query": "text to find similar contexts for",
  "topK": 5
}
```

**Response** (Replay):
```json
{
  "mode": "local_only",
  "status": "replay_complete",
  "embedding": "data/embeddings/replay-1234567890.json",
  "timestamp": 1234567890
}
```

**Response** (Similarity Search):
```json
{
  "mode": "local_only",
  "query": "feature prioritization decisions",
  "results": [
    { "filename": "replay-1234567890.json", "similarity": 0.92 },
    { "filename": "replay-1234567800.json", "similarity": 0.87 }
  ]
}
```

### GET `/api/replay`
**Purpose**: List all stored embeddings

**Response**:
```json
{
  "mode": "local_only",
  "count": 42,
  "embeddings": [
    "replay-1234567890.json",
    "replay-1234567800.json"
  ]
}
```

---

## Security & Compliance

### Data Classification
**Classification**: **Sensitive Learned Context**

Embeddings may contain:
- Agent decision patterns
- User preference signals
- Historical context references
- SEC-COMMS metadata

### Storage Rules
1. **MUST NOT** be versioned (added to `.gitignore`)
2. **MUST NOT** be transmitted without explicit authorization
3. **SHOULD** be encrypted at rest (future: extend vault encryption to embeddings)
4. **SHOULD** respect user data deletion requests (GDPR compliance)

### Access Control
- **Local Mode**: No external network access, Ollama runs on localhost
- **Remote Mode**: OpenAI API requires API key (not committed to git)
- **API Endpoints**: Protected by SEC-COMMS mode enforcement

---

## Ethics Policy

### "Learned Memories" Principle
Embeddings represent **learned behaviors**, not raw data:
- They compress experiences into semantic patterns
- They enable contextual recall, not verbatim playback
- They respect the **spirit** of user intent, not just the letter

### Transparency
- Users MUST be informed when replay occurs
- Replay frequency SHOULD be disclosed in UI
- Embedding storage SHOULD be visible to users

### User Control
- Users MAY disable neural replay
- Users MAY delete embeddings at any time
- Users MAY export embeddings for portability

---

## Integration Roadmap

### Current (ζ Alpha)
- ✅ Basic replay pipeline
- ✅ Embedding generation (local + remote)
- ✅ Similarity search
- ✅ Rotation utilities

### Future Phases
**ζ Beta**: Scheduled replay (cron-style triggers)  
**ζ Gamma**: Multi-vault replay (merge across users/contexts)  
**ζ Delta**: Embedding compression (quantization, PCA)  
**ζ Epsilon**: Federated learning (multi-agent consensus embeddings)  

---

## Audit & Verification

### Audit Script
**Location**: `scripts/tools/os1_replay_audit.ps1`

**Actions**:
- Verify embeddings directory structure
- List top 5 recent embeddings by timestamp
- Generate compliance report

**Usage**:
```powershell
.\scripts\tools\os1_replay_audit.ps1
```

**Report**: `docs/reports/user.copilot.os1p2replay.audit.v2025.10.12.md`

### Validation
- Embeddings MUST have valid vector arrays (non-empty, numeric)
- Metadata MUST include `ts`, `replayVersion`, `dimension`
- Filenames MUST match pattern: `replay-{timestamp}.json`

---

## References
- **Vault Persistence**: `user.copilot.os1p2vault.persistence-spec.v2025.10.11.md`
- **SEC-COMMS Guard**: `apps/web-ui/lib/seccomms-guard.ts`
- **Embedding Core**: `apps/web-ui/lib/embedding-core.ts`
- **Replay Engine**: `apps/web-ui/lib/replay-engine.ts`

---

**Author**: Gabriel (OS One Assistant)  
**Last Updated**: 2025-10-12  
**Compliance Status**: Active, under continuous review
