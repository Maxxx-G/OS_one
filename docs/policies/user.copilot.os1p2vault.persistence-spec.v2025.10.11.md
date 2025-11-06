# SEC-COMMS ε — Vault Persistence Specification

X-Tier1: user
X-Agent: copilot
X-Domain: security
X-Purpose: vault-persistence-spec
X-Version: v2025.10.11
X-Policy: filename+header compliance required

## Overview

SEC-COMMS ε (Epsilon) establishes the secure persistence layer for OS One, providing encrypted storage for:
- SEC-COMMS session keys
- MADM consensus decision logs
- Agent memory snapshots
- Vault metadata and checksums

This specification defines the encryption protocol, file lifecycle, identity linkage, and compliance requirements for vault operations.

## Vault Architecture

### Location
```
data/vault/
├── seccomms.keys     # Serialized session key bundles
├── madm.log          # Consensus decisions and scalar averages
├── memory.snap       # Agent state vector + active task summaries
└── vault.meta        # Creation time, checksum, policy revision ID
```

**Note**: The `data/vault/` directory is excluded from version control and must not be transmitted without explicit authorization.

### Encryption Protocol

**Algorithm**: AES-GCM-256  
**Master Key**: Derived from ES256 identity seed (or generated for local-only mode)  
**IV**: Random 12-byte nonce per encryption operation  
**Format**: Base64-encoded ciphertext for file storage

#### Encryption Procedure

1. **Prepare Data**: Serialize to JSON with 2-space indentation
2. **Encode**: Convert JSON string to UTF-8 bytes
3. **Encrypt**: Apply AES-GCM with random IV
   - IV (12 bytes) prepended to ciphertext
   - Authentication tag included in output
4. **Encode**: Convert Uint8Array to base64
5. **Write**: Store base64 string to vault file

#### Decryption Procedure

1. **Read**: Load base64 string from vault file
2. **Decode**: Convert base64 to Uint8Array
3. **Extract**: Separate IV (first 12 bytes) from ciphertext
4. **Decrypt**: Apply AES-GCM with extracted IV
5. **Decode**: Convert bytes to UTF-8 string
6. **Parse**: Deserialize JSON to object

### Identity-Seed Linkage

**Current**: Master key generated via `newKeyBundle()` (random seed)  
**Future (Phase ε+)**: Master key derived from ES256 identity private key
- Use HKDF-SHA256 with identity seed as input keying material
- Salt: Static application identifier (`os-one-vault-v1`)
- Info: Vault purpose context (`seccomms-epsilon-persistence`)

This ensures vault encryption is bound to agent identity and cannot be decrypted without the corresponding ES256 key.

## File Lifecycle

### Creation
1. Vault directory created on first write operation
2. Master key generated or derived
3. Data encrypted and written to vault file
4. `vault.meta` updated with timestamp and checksum

### Rotation
- Session keys rotated automatically via SEC-COMMS ratchet mechanism
- MADM logs append-only (no rotation until archive)
- Memory snapshots overwrite previous state (single active snapshot)

### Archive
- Vault files may be archived when:
  - Session ends and new identity seed is generated
  - Explicit user request for data export
  - System migration or backup procedures
- Archived vaults stored in `data/vault/_archive/<timestamp>/`
- Archive operation requires explicit authorization

### Deletion
- Individual vault files deleted via `deleteVaultFile()`
- Complete vault purge requires manual directory removal
- Deletion logs recorded in system audit trail

## Vault File Schemas

### seccomms.keys
```json
{
  "keys": [
    {
      "id": "string",
      "salt": "base64",
      "ctr": 0,
      "created": "ISO8601",
      "rotated": "ISO8601"
    }
  ]
}
```

### madm.log
```json
{
  "entries": [
    {
      "timestamp": "ISO8601",
      "proposalId": "uuid",
      "votes": [
        {
          "agentId": "string",
          "tier": 1 | 2 | 3,
          "rating": -5 to +5,
          "justification": "string"
        }
      ],
      "consensus": {
        "average": 0.0,
        "decision": "ACCEPT" | "REJECT" | "DELIBERATE"
      }
    }
  ]
}
```

### memory.snap
```json
{
  "timestamp": "ISO8601",
  "agentId": "string",
  "stateVector": {
    "key": "value"
  },
  "activeTasks": ["task1", "task2"],
  "context": "string"
}
```

### vault.meta
```json
{
  "created": "ISO8601",
  "version": "epsilon-v1",
  "policyRevisionId": "user.copilot.security.vault-persistence-spec.v2025.10.11",
  "checksum": "sha256-hash"
}
```

## API Endpoints

### POST /api/memory/save
Save current agent context to vault.

**Request**:
```json
{
  "agentId": "gabriel",
  "stateVector": { "mood": "focused", "goal": "implement-feature" },
  "activeTasks": ["stb-vault-epsilon"],
  "context": "Working on vault persistence"
}
```

**Response**:
```json
{
  "ok": true,
  "saved": "2025-10-11T12:00:00.000Z",
  "mode": "local_only"
}
```

### GET /api/memory/load
Restore latest memory snapshot.

**Response**:
```json
{
  "ok": true,
  "snapshot": {
    "timestamp": "2025-10-11T12:00:00.000Z",
    "agentId": "gabriel",
    "stateVector": { "mood": "focused", "goal": "implement-feature" },
    "activeTasks": ["stb-vault-epsilon"],
    "context": "Working on vault persistence"
  },
  "mode": "local_only"
}
```

## Security Constraints

### Access Control
- Vault operations require SEC-COMMS mode `local_only` or `seccomms_on`
- Future: ES256 signature verification for all read/write operations
- Human veto override available for vault purge operations

### Storage Security
- All vault files encrypted at rest (AES-GCM-256)
- Master key never persisted in plaintext
- IV randomized per encryption operation (no IV reuse)

### Transmission Restrictions
- **Compliance Note**: Vaults may not be versioned or transmitted without explicit authorization
- Remote vault sync requires `seccomms_on` mode + authenticated relay
- Default mode (`local_only`) restricts all vault operations to same-origin

## Integration with SEC-COMMS Layers

### γ (Operational Mesh)
- Mesh nodes persist session keys to vault on shutdown
- Key restoration on startup enables seamless reconnection

### δ (Identity & Relay)
- ES256 identity seed used to derive vault master key
- Vault operations require valid identity signature (future)

### ε (Vault Persistence)
- Current layer: Provides encrypted storage substrate
- Enables memory continuity across sessions

### ζ (Neural Replay - Future)
- Vault logs used for training self-evolving governance
- Historical replay from MADM consensus logs
- Memory embeddings for context restoration

## Vault Integrity Check

**Script**: `scripts/tools/os1_vault_check.ps1`

**Usage**:
```powershell
powershell scripts/tools/os1_vault_check.ps1
```

**Output**: `docs/reports/user.copilot.os1p2vault.check.v2025.10.11.md`

**Checks**:
- Vault directory existence
- Standard file presence (seccomms.keys, madm.log, memory.snap, vault.meta)
- Additional file detection
- Compliance summary

## Compliance Requirements

1. **No Version Control**: Vault files must never be committed to Git
2. **No Transmission**: Vault data requires explicit authorization for external transfer
3. **Encryption Mandatory**: All vault operations use AES-GCM-256
4. **Audit Trail**: Vault access logged in system audit log
5. **Identity Binding**: Future vault operations require ES256 signature (Phase ε+)

## Future Extensions

### Phase ε+ (Enhanced Vault)
- Master key derivation from ES256 identity seed
- Signature verification for all vault operations
- Vault file checksums in `vault.meta`

### Phase ζ (Neural Replay)
- Historical MADM log replay for governance evolution
- Memory embedding vectors for context restoration
- Self-tuning vault rotation policies

### Phase η (Distributed Vault)
- Encrypted remote vault sync via SEC-COMMS relay
- Multi-node vault replication for high availability
- Consensus-based vault merge conflict resolution

## References

- [SEC-COMMS γ (Operational Mesh)](../../README.md#operational-mesh-sec-comms-γ)
- [SEC-COMMS δ (Identity & Relay)](../../README.md#identity--relay-sec-comms-δ)
- [MADM α (Consensus Kernel)](../vision/user.copilot.os1p2madm.consensus-kernel.v2025.10.11.md)

---

**Status**: Epsilon (ε) - Vault Persistence Foundation  
**Compliance**: Local-only storage, AES-GCM-256 encrypted  
**Authorization**: Required for vault transmission or version control inclusion
