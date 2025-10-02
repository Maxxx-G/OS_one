# ARCHON Session API (dev)

**GET /v1/session** ? `{ "mode":"Mediated|Direct", "agent":"<label>", "ts": <unix> }`  
**POST /v1/session** body: `{ "mode"?: "...", "agent"?: "..." }` ? `{ "ok": true, "mode":"...", "agent":"..." }`

Notes:

- Dev-only in-memory store; restarts reset state.
- Console prints `[archon][session] ...` for quick audit.
