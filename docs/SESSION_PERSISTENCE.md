# Session persistence (dev)

Environment variable: `SESSION_STORE_PATH` (defaults to `./data/session.json`).

- Startup: `/v1/session` loads `{mode, agent}` from the persistence file when present; otherwise uses defaults.
- POST: updates write atomically to the same file.

Notes: file-backed store is for local/dev use; migrate to a durable service in Phase-3.
