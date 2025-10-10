X-Tier1: user
X-Agent: copilot
X-Domain: os1p1ops
X-Purpose: security-smoke
X-Version: v2025.10.10
X-Policy: filename+header compliance required

# OS1 — Security & Smoke Notes · v2025.10.10

## Runtime Flags
- `NEXT_PUBLIC_ENABLE_WS=1` to enable experimental WebSocket route (`/api/ws`).
- Default OFF to keep builds green and avoid non-standard `ResponseInit` usage.
- Streaming defaults to SSE at `/api/stream` (Edge-safe).

## Acceptance
- `npm run -w apps/web-ui build` succeeds (no fs on Edge, no webSocket typing error).
- `npm run smoke` shows OK for STB validate, repo audit, UI build, secrets scan.
- `curl -N http://localhost:4000/api/stream` yields SSE events when dev server runs.
- With `NEXT_PUBLIC_ENABLE_WS=1`, `/api/ws` upgrades successfully in Edge runtimes.

## Default Security Headers
- Set by `apps/web-ui/middleware.ts` for all routes (dev+prod).
- CSP: self-only by default; extend `connect-src` per provider.
- HSTS: enabled only when `NODE_ENV=production`.
- COOP/COEP: enabled for isolation (future SharedArrayBuffer/WebRTC perf).
- Permissions-Policy: camera/microphone default-deny until SEC-COMMS ON.

### Telemetry Layer (η)
- Dashboard: `/telemetry` (Edge-safe, no external libs)
- Metrics: SSE heartbeat, vault presence, embedding count, middleware headers
- Validations: included in telemetry smoke report

## Header Self-Check
- Run: `pwsh ./scripts/tools/os1_headers_check.ps1`
- Report: `docs/reports/user.copilot.headers-check.v2025.10.10.md`

## SEC-COMMS alpha Deployment
- Guard imported in middleware validates CORS origins and egress targets.
- Local-only by default; adjust `seccomms.config.json` -> mode: "seccomms_on" for trusted peers.
- Check: `pwsh ./scripts/tools/os1_seccomms_check.ps1`
- Header `X-SEC-COMMS-MODE` indicates current enforcement state.
