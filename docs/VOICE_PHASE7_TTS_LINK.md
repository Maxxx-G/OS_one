# Phase 7.2 — Persona-Aware TTS Pairing

## Behavior

- When persona changes, if **linked**, TTS voice switches to persona.profile.voiceId.
- If user picks a voice manually, link is disabled (🔓 Unlinked). Toggle to re-link (🔗 Persona Voice).
- Events:
  - `os1:prefs:update { persona_id }` → triggers follow-persona swap.
  - `os1:tts:voice:manual { voiceId }` → unlinks.
  - `os1:tts:voice:set { voiceId }` → programmatic sync for pickers.
  - `os1:tts:link:set { on }` → observers can reflect UI state.

## Verify

1) Switch persona → picker shows new voice; replies use new voice.
2) Manually pick another voice → badge shows **Unlinked**; persona switches no longer change the voice.
3) Click badge to re-link → voice snaps to persona default again.
