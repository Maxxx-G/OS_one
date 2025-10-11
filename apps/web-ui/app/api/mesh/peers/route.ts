/*
X-Tier1: user
X-Agent: copilot
X-Domain: os1p2mesh
X-Purpose: peers-endpoint
X-Version: v2025.10.13
X-Policy: filename+header compliance required
*/

/**
 * /api/mesh/peers
 * SEC-COMMS γ-Layer (Mesh) — Peer Discovery Endpoint
 * 
 * Returns list of active agents in the mesh
 * Static stub for Week 2; Week 3+ will implement dynamic peer registry
 * 
 * Edge runtime for low latency
 */

import { NextResponse } from "next/server";
import { getSecMode } from "../../chat/seccomms-bridge";

export const runtime = "edge";

/**
 * Static peer stub data (Week 2)
 * Week 3+ will replace with in-memory registry + heartbeat tracking
 */
const STUB_PEERS = [
  {
    id: "gabriel",
    status: "up",
    capabilities: ["empathy", "context-aware"],
    lastHeartbeat: new Date().toISOString(),
  },
  {
    id: "codex",
    status: "up",
    capabilities: ["technical", "code-generation"],
    lastHeartbeat: new Date().toISOString(),
  },
];

/**
 * GET /api/mesh/peers
 * Returns list of active peers in the mesh
 */
export async function GET() {
  const mode = getSecMode();

  const response = NextResponse.json({
    ok: true,
    peers: STUB_PEERS,
    mode,
    note: "Static stub for Week 2 dual-agent; dynamic registry in Week 3+",
  });

  // Add SEC-COMMS mode header (α-layer visibility)
  response.headers.set("X-SEC-COMMS-MODE", mode);
  response.headers.set("Cache-Control", "no-cache");

  return response;
}
