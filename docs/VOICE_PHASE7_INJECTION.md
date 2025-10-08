# Phase 7.1 — Persona Injection & Clone UI

## What changed

- `/api/voice/reason` now receives `{ persona_id, systemPreamble, voiceId }`.
- Persona Switcher includes **Clone Assistant/Agent** buttons.

## Verify

- Select a persona → send a prompt → backend logs include persona fields.
- Click "Clone Assistant/Agent" → new persona appears in selector immediately.

## Notes

- Onboarding data is read from `window.os1Onboarding?.data` if present; falls back to defaults.
