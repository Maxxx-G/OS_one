# Voice Phase 7 — Personas Bootstrap

## Scope

- Gabriel is default; can clone new **Assistants**/**Agents** from his template.
- Personas/profiles generated from onboarding; horoscope projects "prosperity-forward" tone.
- Persist active persona id; pair with a voice id; expose selector in VoiceBar.

## API & Reasoning Hook (follow-up STB)

- Inject `persona_id` and `systemPreamble` into `/api/voice/reason` payload to steer style/tone.

## Verify

- Selector shows current persona & voice id; persists across refresh.
- `spawnFromOnboarding('assistant', ob)` registers a new persona visible in selector.
- Cloned entries keep template preamble + onboarding edits.
