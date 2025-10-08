# OS One - Governance Folders (v2025.10.06)

## Structure
- `meetings/`: tiered queues aligned with authority levels
- `committees/`: department groupings (add `.keep` placeholders as needed)
- `topics/`: reusable topic briefs and decision records
- `_schemas/`: validation assets (JSON Schema, role catalogs)

## Scaling Notes
- Create `.queue.vYYYY.MM.DD.json` files per tier; keep each queue under 200 entries and rotate by date.
- Reference `_schemas/meeting.queue.schema.v2025.10.06.json` when validating with internal tooling; no external dependencies.
- Pre-create future folders with zero-byte `.keep` files (for example, `meetings/tier3_engineering/.keep`, `committees/finance/.keep`).

## Operations
- Editors append queue entries; Copilot/Codex tools validate and schedule meetings.
- SECCOMMS selects queues by tier for live routing.
- Ethics evaluators read `effective_ethic` to determine Primacy/Secondary/Guardian enforcement.
