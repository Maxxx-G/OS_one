# Audit Log (JSONL)

POST `/v1/audit` → `{ event: string, payload?: object }` appends one record to `AUDIT_LOG_PATH` (default `./data/audit.jsonl`).
POST `/v1/audit/bulk` → `{ items: [{ event, payload? }, ...] }` appends many (max 500 per call).
GET `/v1/audit/tail?limit=100` returns the most recent entries for debugging (limit is clamped to 1-1000).
Record shape: `{ ts: ms_epoch, event, payload }`.
Notes: developer-grade; plan rotation and compression in Phase-3.

## Rotation

Configure via env:

- `AUDIT_MAX_MB` (default 10)
- `AUDIT_KEEP` (default 5 rotated files kept)

Use `GET /v1/audit/info` to inspect current usage and history.
