# OS_One

> A next-generation operating system interface powered by AI

## 🚀 Getting Started

**New to this repository?** Start here: **[SETUP.md](SETUP.md)**

The setup guide covers:
- Prerequisites and installation
- How to run the development server
- GitHub Copilot CLI usage (optional)
- Troubleshooting common issues

**Using GitHub Copilot in VS Code?** See: **[docs/COPILOT_WORKSPACE_SETUP.md](docs/COPILOT_WORKSPACE_SETUP.md)** for workspace permissions and write access configuration.

### Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (runs on port 4000)
pnpm dev
```

Visit `http://localhost:4000` to see the application.

---

## Documentation Index

- **Project Plan (latest)** → [`docs/project_plans/user.copilot.os1p1.project-plan.v2025.10.10.md`](docs/project_plans/user.copilot.os1p1.project-plan.v2025.10.10.md)
- **Agent GPT5 Handover** → [`docs/AGENT_GPT5_HANDOVER.md`](docs/AGENT_GPT5_HANDOVER.md)
- **Genesis Hub & Telemetry**:
  - Genesis Series (Tier I–III blueprint) → [`docs/hubs/user.copilot.os1universe.genesis-app-registry.v2025.10.12.json`](docs/hubs/user.copilot.os1universe.genesis-app-registry.v2025.10.12.json)
  - **Tier-I Status**: AuroraWire = MVP (active, telemetry), LexiCore = MVP (active, telemetry)
  - LexiCore (Word Processor MVP, health-integrated) → [http://localhost:4000/lexicore](http://localhost:4000/lexicore) (dev)
  - AI UI Builder Bridge → [`docs/policies/user.copilot.os1universe.ai-ui-builder-bridge.v2025.10.12.md`](docs/policies/user.copilot.os1universe.ai-ui-builder-bridge.v2025.10.12.md)
  - Telemetry Dashboard → [http://localhost:4000/telemetry](http://localhost:4000/telemetry) (dev)
- **Project Plan Template (agent-facing)** → [`docs/templates/user.copilot.os1p1docs.proj-template.v2025.09.17.md`](docs/templates/user.copilot.os1p1docs.proj-template.v2025.09.17.md)
- **Codex "Single Task Block" Template & Policies** → [`docs/templates/user.chatgpt5.os1p1.codex-single-task-block.v2025.09.17.md`](docs/templates/user.chatgpt5.os1p1.codex-single-task-block.v2025.09.17.md)o1. Read the **Project Plan (latest)** top to bottom.
2. Use `/start` to announce context; use `/break` for snapshotting (done/pending/blockers/next).
3. Create **one** Codex task block at a time using the **Single Task Block** template.
4. Respect constraints (TypeScript-only, App Router, ports 4000/7700, feature flags off by default).
5. Update the plan's **Decisions Log** when architecture changes occur.ex

- **Project Plan (latest)** → [`docs/PROJECT_PLAN_v2025.10.10.md`](docs/PROJECT_PLAN_v2025.10.10.md)
- **Agent Gpt5 Handover** → [`docs/AGENT_GPT5_HANDOVER.md`](docs/AGENT_GPT5_HANDOVER.md)
- **Project Plan Template (agent-facing)** → [`docs/templates/user.copilot.os1p1docs.proj-template.v2025.10.11.md`](docs/templates/user.copilot.os1p1docs.proj-template.v2025.10.11.md)
- **Codex "Single Task Block" Template & Policies** → [`docs/templates/user.chatgpt5.os1p1.codex-single-task-block.v2025.09.17.md`](docs/templates/user.chatgpt5.os1p1.codex-single-task-block.v2025.09.17.md)pnpm dev
- In the app, click "Run Demo Stream" to see incremental text appear; when the stream closes, the text is finalized and appended as an assistant message in the store.

### Phase 2c — WebSocket Demo (Edge runtime, no deps)

- `pnpm dev` → open the app → click **Connect WS** then **Run WS Demo**.
- Tokenized chunks stream in real time; finalizes on `[WS:done]`.
- Phase 2b SSE demo remains available.

### Phase 2d-1 — Supabase Client Bootstrap

- Install: `pnpm -w add @supabase/supabase-js`
- Set env in `apps/web-ui/.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>`
- Verify: run `pnpm dev` and open `/api/health/supabase` → JSON shows `"configured": true`.
- No UI changes; client available via `getSupabaseClient()` for later phases.

### Phase 2d-2 — Supabase Schema + RLS (Demo)

1. Open Supabase → SQL Editor → paste `supabase/schema/phase_2d_2.sql` → Run.
2. Verify env set in `apps/web-ui/.env.local` (see Phase 2d-1).
3. Run `pnpm dev` and open `/api/health/supabase-db` → expect `{ "ok": true, "tableAccessible": true }`.
4. This RLS is permissive for demo only. We will tighten with auth and per-user policies in a later phase.

### Phase 2d-3 — Persist SSE Final Message (Demo Thread)

- Set `NEXT_PUBLIC_FEATURE_PERSIST=1` in `apps/web-ui/.env.local`.
- Run SSE demo; the final assistant message is written to Supabase under a client-local demo thread.
- Inspect via: `/api/db/messages?threadId=<value of localStorage.os1.demo.threadId>`.
- No UI or store refactors; writes are best-effort and non-blocking.

### Phase 2d-4 — Persist WS Final Message (Demo Thread)

- Set `NEXT_PUBLIC_FEATURE_PERSIST=1` in `apps/web-ui/.env.local`.
- Use the **Connect WS** → **Run WS Demo** flow; on completion, the final assistant message is written to Supabase under the demo thread.
- Inspect via `/api/db/messages?threadId=<value of localStorage.os1.demo.threadId>`.

### Dev Port Change (Phase 2e-0)

- Open-WebUI uses http://localhost:3000. This app now runs at http://localhost:4000 in dev.
- Start: `pnpm dev` (or from `apps/web-ui`: `npm run dev`)
- Visit: `http://localhost:4000`
- SSE and WS demo endpoints remain under the same host (`/api/...`); no code changes required.

### Phase 2e-1 — Controller Dispatch (BMAD stub)

Endpoints:

- `POST /api/controller/dispatch` body:
  `{ "modality":"text", "transport":"sse", "payload":{"text":"hello"}, "meta":{"client":"archon"} }`
  Returns a streamed text (same shape as the demo), logs to `logs/runtime/*.jsonl`, and (if `NEXT_PUBLIC_FEATURE_PERSIST=1`) persists a final assistant message to Supabase.
- `GET /api/controller/ws` (WebSocket):
  connect, then send a JSON envelope as first message (same shape as above, `transport:"ws"`). You’ll receive tokenized chunks, `[WS:ack]`, and `[WS:done]`.

Notes:

- No UI changes required. You can drive these with curl/websocket client or wire Archon temporarily to `/api/controller/dispatch` and `/api/controller/ws`.
- Logging files appear under `logs/runtime/`.

### Phase 2e-2 — UI → Controller Toggle

- Set `NEXT_PUBLIC_USE_CONTROLLER=1` in `apps/web-ui/.env.local` to route hooks through BMAD Controller:
  - SSE button uses `POST /api/controller/dispatch` (streamed text)
  - WS button connects to `GET /api/controller/ws` and sends a JSON envelope
- With flag off (`0`), hooks use the original demo endpoints.

### Phase 2e-3 — Controller Persistence + Provenance + CORS

- Set `CONTROLLER_CORS_ORIGINS` to a comma-separated list of origins (e.g., `http://localhost:7800,http://localhost:3000`) to allow cross-origin POST to `/api/controller/dispatch`.
- With `NEXT_PUBLIC_FEATURE_PERSIST=1`, controller persists both:
  - human input (at dispatch start / first WS message)
  - assistant final message (on stream end)
- Provenance recorded in `meta`: `{ client, transport, source: 'controller' }`.
- Existing demos remain intact; no UI changes.

### Phase 2e-4 — Controller Hardening (Timeout, Rate-limit, Trace-id)

- Set `CONTROLLER_TIMEOUT_MS` (default 30000) and `CONTROLLER_RATE_LIMIT_PER_MIN` (default 60).
- `X-Trace-Id` is echoed by `/api/controller/dispatch` and included in logs. WS sends `[WS:ack:<traceId>]` and `[WS:done:<traceId>]`.
- On timeout: dispatch appends `[timeout]` before close; WS sends `[WS:error:timeout]` and closes.
- Behavior is additive; SSE/WS demos and 2e-3 persistence stay intact.

### Phase 2e-5 — Chat Input to Controller (SSE)

- Ensure `NEXT_PUBLIC_USE_CONTROLLER=1` in `apps/web-ui/.env.local`.
- In the Chat pane, type a message and click **Send** to stream a response from `/api/controller/dispatch`.
- Existing demo buttons remain available; this addition does not change layout or store contracts.

### Dev Launch Hardening (Phase 2e-6)

Windows / PowerShell quick start

1. Ensure Node LTS is installed: `winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements`
2. Activate pnpm:
   `corepack enable`
   `corepack prepare pnpm@9 --activate`
   `pnpm -v`
3. Start the app:
   - From repo root: `pnpm dev` (serves http://localhost:4000)
4. If port 4000 is busy, you'll need to stop the process or change the port in `apps/web-ui/package.json`

Troubleshooting

- Check listener: `Test-NetConnection localhost -Port 4000`
- If refused: ensure the dev terminal shows `ready - started server on 0.0.0.0:4000`
- Find/kill port holder:
  `Get-NetTCPConnection -LocalPort 4000 | Select OwningProcess`
  `Get-Process -Id <PID> | Stop-Process -Force`
- WSL/VM: binding is already `-H 0.0.0.0`; visit `http://127.0.0.1:4000`

### Phase 2e-7 — DB Message History (Demo)

- Set `NEXT_PUBLIC_FEATURE_HISTORY=1` in `apps/web-ui/.env.local`.
- Click **Load History** in the Chat pane to fetch messages for the demo thread.
- History is read-only and flagged; SSE/WS demos and layout remain unchanged.

### Phase 2e-8 — Chat Input via Controller WebSocket

- Flags:
  - `NEXT_PUBLIC_USE_CONTROLLER=1`
  - `NEXT_PUBLIC_FEATURE_WS_INPUT=1`
- Type in the chat input and click **Send (WS)** to stream over `/api/controller/ws`.
- Existing **Send** (SSE) and demo buttons remain available; no layout or store refactors.

### Phase 2e-10 — Auto-refresh History + Trace-ID Status

- Set `NEXT_PUBLIC_FEATURE_STATUS=1` to show a small status pill with the last controller trace id.
- After each stream finalizes, history auto-refreshes when `NEXT_PUBLIC_FEATURE_HISTORY=1` is also enabled.
- SSE captures `X-Trace-Id`; WS parses `[WS:ack:<traceId>]`.
- No layout or store refactors.

### TU-1 — Provider Adapters (Flagged)

- Toggle: `NEXT_PUBLIC_FEATURE_ADAPTERS=1`
- Health: `/api/llm/openwebui/health`, `/api/llm/openai/health`
- Stream: POST `/api/llm/<provider>/stream` with `{ model, messages: [{role,content}], stream: true }`

### TU-2 — Minimal Provider Selector (Dev)

- Page: `/dev/adapters`
- Use to switch provider and test health and stream without layout changes.
- Requires `NEXT_PUBLIC_FEATURE_ADAPTERS=1`.

### TU-3 — Supabase Auth + RLS (Tighten)

- Apply migration:
  - With Supabase CLI: `supabase db push` (or psql apply the SQL in `supabase/migrations/2025-09-17_auth_rls.sql`)
- Required env in `apps/web-ui/.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- RLS behavior:
  - Reads/writes require a valid user JWT; rows are scoped to `auth.uid()`
- Dev note:
  - Existing UI continues to work; adapters unaffected. Add `Authorization: Bearer <user_jwt>` when persisting messages.

### TU-4 — Thread/Session Minimal API (Flagged)

- Toggle: `NEXT_PUBLIC_FEATURE_THREADS=1`
- Create thread: POST `/api/threads` body `{ "user_id":"<auth.uid()>", "title":"..." }` + header `Authorization: Bearer <user_jwt>`
- Add message: POST `/api/threads/<thread_id>/messages` body `{ "user_id":"<auth.uid()>", "role":"user|assistant", "content":"..." }` + same header
- RLS ensures user_id matches `auth.uid()` and thread ownership

### TU-5 — CI Smoke

- Validates TypeScript (if tsconfig present) and required API routes exist.
- Fast signal; no build/run to keep CI quick.

### CI Exercise (Plan Guard + CI Smoke)

- Trigger commit to verify required checks run on PR.
- Date: 2025-09-17

### Voice Phase 3 (2025-10-07)

Live voice reasoning loop powered by **DeepSeek-R1:8B** with feature flags, TTS stream support, and graceful degradation.  
See [`docs/VOICE_PHASE3_CHANGELOG.md`](docs/VOICE_PHASE3_CHANGELOG.md) for full details, verification matrix, and Phase 4 roadmap.

## Documentation Index

- **Project Plan (latest)** → [`docs/plans/OS1-PLAN.v2025.09.17.md`](docs/plans/OS1-PLAN.v2025.09.17.md)
- **Project Plan Template (agent-facing)** → [`docs/templates/user.copilot.os1p1docs.proj-template.v2025.10.11.md`](docs/templates/user.copilot.os1p1docs.proj-template.v2025.10.11.md)
- **Codex “Single Task Block” Template & Policies** → [`docs/templates/user.chatgpt5.os1p1.codex-single-task-block.v2025.09.17.md`](docs/templates/user.chatgpt5.os1p1.codex-single-task-block.v2025.09.17.md)

> Treat the plan as the **single source of truth**. All new work orders must follow the Codex single-block format.

## How to Use This Plan (LLM Agents)

1. Read the **Project Plan (latest)** top to bottom.
2. Use `/start` to announce context; use `/break` for snapshotting (done/pending/blockers/next).
3. Create **one** Codex task block at a time using the **Single Task Block** template.
4. Respect constraints (TypeScript-only, App Router, port 4000, feature flags off by default).
5. Update the plan’s **Decisions Log** when architecture changes occur.

## How to File a Single Task Block (Codex)

- Start from the template: [`user.chatgpt5.os1p1.codex-single-task-block.v2025.09.17.md`](docs/templates/user.chatgpt5.os1p1.codex-single-task-block.v2025.09.17.md)
- Keep scope ≤5–7 files. Prefer append-only edits. Declare runtime for new API routes.
- Always add a **README** note for how to run/verify, and an **Acceptance** section.
- Example skeleton (replace everything with real content):

PHASE X — <Short Title>

constraints

≤N files; TypeScript only; no new deps

tasks

<change> file: <path> code/instructions: ------------------------------------------------ <exact snippet or full small file> ------------------------------------------------
readme (append)
file: README.md
append:
<how to run/verify in 3–6 lines>

acceptance

app builds; feature verified; no regressions

## Quick Dev Reminders

- Dev port: http://localhost:4000 (was 3001)
- Start: `npm run -w apps/web-ui dev`
- Smoke: `npm run smoke` or `pwsh ./scripts/tools/os1_smoke.ps1`
- **Zero-Tolerance Guardian** (opt-in): `node scripts/checks/stb_guard.mjs`
  - Enable pre-commit: `git config os1.enableGuardian true`
  - Disable: `git config os1.enableGuardian false`
  - Policy: `docs/policies/user.copilot.os1p1ops.zero-tolerance-guard.v2025.10.12.md`
- WS input: `NEXT_PUBLIC_FEATURE_WS_INPUT=1`
- Logs: `apps/web-ui/logs/runtime/*.jsonl`

### Design Tokens (Phase 2.1 — η)

Runtime token system with hot-swap via JSON:

**Quick Start**
1. Place your token definitions:
   - Create or edit `apps/web-ui/config/tokens.json` with colors, spacing, radius
   - Example:
     ```json
     {
       "colors": { "bg": "#0b0f14", "fg": "#e6edf3", "accent": "#7c93ff", "danger": "#ff6b6b", "muted": "#1b222c" },
       "spacing": { "xs": 4, "s": 8, "m": 12, "l": 16 },
       "radius": { "sm": 6, "md": 10, "lg": 14 }
     }
     ```
2. Sync from Figma export (optional):
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.codex.os1p2design.tokens-sync.v2025.10.13.ps1 -Input <your_figma_export.json>
   ```
3. Restart dev server → tokens apply immediately via CSS vars (`--accent`, `--spacing-m`, etc.)

**η Telemetry Smoke** (validates `/api/telemetry/metrics`):
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.codex.os1p2telemetry.metrics-smoke.v2025.10.13.ps1
```
Expects `PASS (3/3)` + report in `docs/reports/user.codex.os1p2telemetry.metrics-smoke.v2025.10.13.md`.

**Git Policy**: Token JSON is **not** in `.gitignore` by default—commit if you want team consistency, or add `apps/web-ui/config/tokens.json` to `.gitignore` for local overrides.

### Guardian Telemetry Job (CI Integration)

The **telemetry-smoke** job runs automatically in CI when `DEV_SERVER_URL` is set:

**Local Execution** (manual):
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/tools/user.codex.os1p2telemetry.metrics-smoke.v2025.10.13.ps1
```

**CI Behavior**:
- ✅ **PASS** (exit 0): All tests passed → build continues
- ⚠️ **SKIP** (exit 2): Dev server unavailable → warning logged, build continues
- ❌ **FAIL** (exit 1): Contract violation → build fails, PR blocked

**Setup**:
1. Set `DEV_SERVER_URL` in **Settings → Secrets and variables → Actions → Variables**
2. Value: Preview deployment URL (e.g., `https://preview-abc123.vercel.app`)
3. Job auto-triggers on PR/push when variable is set

**Documentation**:
- **CI Spec**: `docs/policies/user.copilot.os1p2telemetry.guardian-ci-spec.v2025.10.13.md`
- **Contract Validation**: `docs/reports/user.copilot.os1p2telemetry.contract-validation.v2025.10.13.md`
- **Metrics Spec**: `docs/policies/user.codex.os1p2telemetry.metrics-spec.v2025.10.13.md`


### Template Linkage (v2025.09.17)

Project plan now explicitly references governing templates for execution, planning, and agent/system behavior.

### Plan Guard (v2025.09.17)

- Validate required template links in the active plan:
  - `npm run plan:check` (PowerShell required on Windows)
- New plans should be derived from: `docs/templates/OS1-PLAN.template.v2025.09.17.md`

### CI — Plan Guard (Required Status Check)

- GitHub Actions workflow **Plan Guard** validates the active plan contains required template links.
- Enable branch protection (Repo Settings → Branches → **main**):
  - Require status checks to pass before merging → **Plan Guard / guard**.
- Local check (optional): `npm run plan:check`

### Scheduled Plan Guard

- Runs every Sunday (UTC) and on-demand to validate plan compliance.

### Plan Naming Rule

- Active plan must follow: `OS1-PLAN.vYYYY-MM-DD.md` (enforced by guard).

### Guard Hardening (Link Targets + Single Active Plan)

- Guard fails if any required template file is missing.
- Guard enforces exactly one `OS1-PLAN.vYYYY-MM-DD.md` in `docs/plans/`.
- The provided `-PlanPath` must be that single active file.
- Exit codes: 3 (bad name), 4 (missing template file), 5 (multiple/zero plans), 6 (PlanPath ≠ active).

### Docker Compose — Profiles & Network

- Network: create once if missing: `docker network create osone-net`.
- Ollama: now included by default (no profile needed). This avoids "depends_on service ollama is undefined" errors.
- Open-WebUI: still optional via profile — include with `--profile webui`.
- Recommended test:
  - `docker compose --profile local-ollama up -d --build` (works even though ollama no longer requires a profile)
  - Verify services: ollama, archon-api, archon-ui, bmad all running on `osone-net`.

### Stability / Guardrails

- Dotted template naming: segments use dots; multi-word segments use hyphens within a segment.

### Filename Policy (Dotted Convention)

- Pattern: `assistant.agent.project.purpose.vMM.mm.ext` or `assistant.agent.project.purpose.vYYYY.MM.DD.ext`
- Dots separate segments; use **hyphens inside multi-word segments**.
- Check staged files: `npm run namecheck`
- Manual sweep (docs & kb): `npm run namecheck:docs`
- Optional local hook: see `.githooks/pre-commit.sample`

### Agent Toolbar & Direct Mode

- Toolbar shows the active agent badge, quick-switch buttons, and Direct Agent toggle (default OFF).
- Safety: Direct Agent toggle preserves local redaction and Sec-Comms guard even when enabled.

### First Chat Readiness

- Status chip cycles Idle -> OK/Degraded/Offline based on the latest quick test latency.
- Click **Test** to send a redacted `hello` through the current agent path without touching history.
- Quick Test respects Direct Agent defaults and resets automatically on provider/model changes.
\n## Genesis Quick Links (local dev)

- AuroraWire (News Dashboard): http://localhost:4000/aurora (health-checked UI)

## Genesis Quick Links (local dev)
 - AuroraWire Feed (MVP API): http://localhost:4000/api/aurora/feed
