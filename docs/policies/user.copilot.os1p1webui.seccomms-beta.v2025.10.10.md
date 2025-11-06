X-Tier1: user
X-Agent: copilot
X-Domain: os1p1webui
X-Purpose: seccomms-beta
X-Version: v2025.10.10
X-Policy: filename+header compliance required

# SEC-COMMS β — P2P Prototype (Insertable Streams, Key Ratchet) · v2025.10.10

- Scope: local loopback demo under strict CSP; no external signaling; app-layer AES-GCM with 15s ratchet.
- Fallback path: if Insertable Streams unsupported, session still works using SRTP + app-layer encryption for DataChannel payloads.
- No new deps; compatible with dev port 4000 and existing middleware (local_only).

## Operator Steps

1. Start dev: `npm run -w apps/web-ui dev` (port 4000).
2. Open `/seccomms` — observe `Insertable Streams: supported|not available` and ratchet ticks every 15s.
3. Expect logs: `A tx (enc)`, `B rx (dec)`, and a plaintext control sample.

## Notes

- This β focuses on **DataChannel**. A/V media transforms (encoded frame transforms) can be added next.
- Key material is ephemeral, in-memory. Hook real KMS/HKDF and peer auth in Phase γ.
