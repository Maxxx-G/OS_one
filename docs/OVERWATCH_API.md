# Overwatch API

## Endpoints
- `POST /v1/overwatch/dispatch` — queue a task (generates stub STB-A/B payloads)
- `GET /v1/overwatch/queue` — return recent queue entries
- `POST /v1/overwatch/plan` — draft STB-A/B text from provided plan markdown (stubbed)
- `POST /v1/overwatch/retro` — store retrospective update and refresh overwatch weights

## Storage
- Queue JSONL: `./data/overwatch_queue.jsonl` (override with `OVERWATCH_QUEUE_PATH`)

## Notes
- Runtime enforcement updates `prefs.ow_weights` using running averages for success, cycle time, and flake rate.
