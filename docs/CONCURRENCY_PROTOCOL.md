# OS1 Concurrency Protocol
Branches → allowed paths:
- `feat/ui-*` → `apps/web-ui/**` plus `policies/env/**`, `docs/**`
- `feat/archon-*` → `integrations/archon/**`, `ops/**`, `docs/**`
Use `npm run pathguard` before committing. If a change spans both scopes, split into 2 STBs or update `/contracts/*` first.

## Quick rules
- ≤5 files per STB; guard docs for every new surface.
- No secrets in code; env via `policies/env/`.
- Contract-first if touching cross-boundary.
