# STT Health Notes

`/api/health` now includes an `sttOk` boolean derived from probing the Live base ( `NEXT_PUBLIC_LIVE_BASE` ).

## Probe Order
1. `HEAD /v1/audio/transcribe`
2. Fallback: `OPTIONS /v1/audio/status`

If either returns an HTTP OK (2xx), STT is considered reachable.

## Footer Badges
- Main health badge = Aggregate (LLM or Voice LLM / TTS success)
- `STT: OK/ERR` = Speech-to-Text reachability (transcribe path)

## Troubleshooting
1. Ensure `NEXT_PUBLIC_LIVE_BASE` points at the Archon / Live Router base (no trailing slash).
2. Check the proxy endpoint: `POST /api/archon/transcribe` (should not 404/502).
3. Open DevTools Console and look for `[STT] transcribe failed` warnings.
4. Confirm backend dependency: `python-multipart` installed in Archon environment.
5. Verify CORS / network: direct fetch in console:
```js
await fetch(`${window.location.origin.replace(/:\d+$/,'')}:7700/v1/audio/status`).then(r=>r.status)
```

## Notes
- Probes use 3s timeouts.
- Failure does not block UI; badge simply reflects degraded mode.
- Future: could add latency metrics or rolling success ratio.
