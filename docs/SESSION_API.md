# ARCHON Session API (dev)

**GET /v1/session** -> `{ "mode":"Mediated|Direct", "agent":"<label>", "ts": <unix> }`  
**POST /v1/session** body: `{ "mode"?: "...", "agent"?: "..." }` -> `{ "ok": true, "mode":"...", "agent":"..." }`

Notes:

- Persists to `SESSION_STORE_PATH` (default `./data/session.json`); see `docs/SESSION_PERSISTENCE.md`.
- Console prints `[archon][session] ...` for quick audit.

## Tests

See `integrations/archon/python/tests/test_session_api.py` for GET/POST and persistence assertions.
