# OS1 — Single Task Block (STB) Template · v2025.09.23

> Use this **exact format** for Copilot/Codex. One atomic change set. Keep it short, explicit, enforceable.

## Context

- What is changing and why (1–3 bullets, max).
- Repo state assumptions (branches, env flags, secrets present/absent).

## Constraints

- File cap: ≤N files (default 5)
- Tech scope (e.g., TS/Next only; no deps)
- Determinism (idempotent, skip/guard when env missing)
- Platform notes (Windows/CRLF safe)

## One-Fence Rule

**Entire STB must be wrapped in a single fenced markdown block** (` ```md … ``` `). Do not use nested code fences inside the STB; use **4-space indentation** for inner code blocks instead. This prevents Copilot truncation and ensures the complete STB is delivered as one atomic markdown block.

## Changes

1. ADD/REPLACE/EDIT: <relative/path.ext>

    (use 4-space indentation for code, no nested fences)
    # Minimal patch or full file contents.
    # Be explicit; no ellipses; no interactive prompts.

## Acceptance

- Verify STB has 0 or exactly 2 backtick fences total (outer wrapper only).
- Confirm all changes applied correctly; run lint/format checks.
- Observable checks: tests pass, visual poke, policy hooks validated.

## Rollback

- Revert files to prior state using version control.
- Clean up any generated artifacts or state changes.

## Commit

- `type(scope): brief summary of the change`

