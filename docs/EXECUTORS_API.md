# Executors API (Bridge)

## Endpoints

- `POST /v1/executors/dispatch` — queue an execution task and return `{ ok, jobId }`
- `GET /v1/executors/logs?jobId=...` — fetch a specific job record (stubbed logs)
- `GET /v1/executors/logs?tail=N` — fetch the most recent `N` job summaries

## Storage

- Jobs JSONL: `EXEC_JOBS_PATH` (defaults to `./data/exec_jobs.jsonl`)

## Notes

- Current implementation records deterministic log trails (`begin`, `apply STB-A`, `run acceptance`, `result`).
- Real execution will replace the stubbed log and status handling in a future revision.
