# Preferences API

GET `/v1/prefs` returns `{ hints_enabled: boolean, acclimation_start: ISO|null, hint_palette: "normal"|"cb_safe", mcp_enabled: string[], ts }`.
POST `/v1/prefs` accepts any subset of those fields and persists to `PREFS_STORE_PATH` (default `./data/prefs.json`).
Use cases: share hint enablement and color-ramp start across devices; Overwatch can toggle via POST and the UI polls with SessionStore timing.

## Fields

- `hints_enabled` - show or hide speed-key hints
- `acclimation_start` - ISO timestamp anchor for the color ramp
- `hint_palette` - `"normal"` or `"cb_safe"` (color-blind safe palette for downstream UI)
- `mcp_enabled` - array of enabled MCP (Model Context Protocol) server IDs; controls which MCPs Archon will call during session
