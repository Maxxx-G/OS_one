X-Tier1: user
X-Agent: copilot
X-Domain: os1p1webui
X-Purpose: seccomms-gamma
X-Version: v2025.10.11
X-Policy: filename+header compliance required

# SEC-COMMS γ — Operational Mesh Runtime Bridge · v2025.10.11

## Overview

Phase γ connects all local agents (Gabriel, Overwatch, Curator, etc.) through a secure in-memory bus encrypted via SEC-COMMS AES-GCM key bundles.

## Features

- Authenticated message passing (local for now).
- 10s heartbeat broadcast to all registered nodes.
- Extensible: can replace internal dispatch with WebRTC relay for remote peers.

## Usage

1. Start dev server (port 4000) → open `/mesh`.
2. Observe two local nodes exchanging encrypted events and periodic heartbeats.
3. Run `pwsh ./scripts/tools/os1_mesh_smoke.ps1` to confirm reachability.

## Security

- Still bound by SEC-COMMS guard (no external egress).
- All messages encoded via same AES-GCM context as β.
- Next: attach identity certs and remote relay for cross-system mesh.
