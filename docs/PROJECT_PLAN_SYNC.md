# Project Plan Sync

Run `make docs` (or `npm run docs:progress`) to regenerate `docs/PHASE_2_PROGRESS.md` from guard docs.

CI: `.github/workflows/plan-guard-check.yml` will fail a PR if the progress doc is not up to date.

CI/CD should call `make docs` before commit to ensure the plan stays current.

Paired with `docs/PHASE_2_PROGRESS.md`, this forms the living Phase-2 plan log.
