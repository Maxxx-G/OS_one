\# OS One – Phase 2 Voice Pipeline Handover Block v2025.10.07

\## ROLE

System Architect → Gabriel (Overwatch Runtime Controller)



\## OBJECTIVE

Finalize Phase 2 Voice Pipeline integration — ensuring recording (STT), playback (TTS + streaming), and HUD telemetry operate autonomously across Archon and OS One UI.



\## SUMMARY

✅ All voice-related modules implemented and verified:  

\* Alt + M microphone recording → /v1/audio/transcribe (STT)  

\* Assistant replies stream through /v1/audio/tts and /v1/audio/tts/stream (TTS + streaming)  

\* /v1/audio/status and /v1/audio/events provide state and heartbeat for HUD animation  

\* VoiceOverlay HUD displays Muted / Idle / Speaking / Streaming with 900 ms vhs-stream animation  

\* All functions audited via voice-online events (STT + TTS + stream)  



\## IMPLEMENTED FILES

| Layer | File | Purpose |

| -- | -- | -- |

| Backend | integrations/archon/python/routers/audio.py | STT \& TTS base endpoints with env gate handling |

| Backend | integrations/archon/python/routers/audio\_stream.py | Streaming TTS bridge + dummy tone fallback |

| Backend | integrations/archon/python/app.py | Registered audio/status/events/stream routers |

| Docs | docs/AUDIO\_STATUS.md | Status endpoint contract |

| Docs | docs/AUDIO\_EVENTS.md | SSE heartbeat documentation |

| Docs | docs/AUDIO\_TTS\_STREAM.md | Streaming contract and dummy tone behavior |

| Frontend | apps/web-ui/components/ChatSequencer.tsx | Voice recorder + MediaSource TTS integration |

| Frontend | apps/web-ui/components/VoiceOverlay.tsx | HUD for voice state |

| Frontend | apps/web-ui/app/globals.css | Streaming animation \& HUD styles |

| Frontend | apps/web-ui/app/(checks)/.voice-stream-guard.md | Testing \& rollback guide |



\## VALIDATION

✅ python -m compileall → clean  

✅ npx prettier -w → clean  

✅ npm run build → success  

✅ No new dependencies  

✅ End-to-end Alt + M recording loop operational  

✅ HUD telemetry sync every 2 s via /v1/audio/events  



\## TEST COMMANDS

```powershell

\# Check voice status

Invoke-RestMethod -Uri 'http://localhost:7700/v1/audio/status'



\# Stream voice events

curl.exe -N http://localhost:7700/v1/audio/events



\# Stream TTS audio

curl.exe -X POST "http://localhost:7700/v1/audio/tts/stream" -H "Content-Type: application/json" -d "{\\"text\\":\\"OS One Phase Two online.\\"}"



