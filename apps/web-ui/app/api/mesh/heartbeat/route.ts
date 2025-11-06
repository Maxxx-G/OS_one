/*
X-Tier1: user
X-Agent: copilot
X-Domain: os1p2mesh
X-Purpose: heartbeat-endpoint
X-Version: v2025.10.13
X-Policy: filename+header compliance required
*/

/**
 * /api/mesh/heartbeat
 * SEC-COMMS γ-Layer (Mesh) — Heartbeat Endpoint
 * 
 * Returns system heartbeat with SEC-COMMS mode header
 * Edge runtime for low latency
 */

import { NextResponse } from "next/server";
import { getSecMode } from "../../chat/seccomms-bridge";

export const runtime = "edge";

/**
 * GET /api/mesh/heartbeat
 * Returns heartbeat timestamp + interval + SEC-COMMS mode
 */
export async function GET() {
  const mode = getSecMode();
  const timestamp = new Date().toISOString();
  const intervalMs = 5000; // 5 seconds (Week 2 heartbeat interval)

  const response = NextResponse.json({
    ok: true,
    ts: timestamp,
    mode,
    intervalMs,
  });

  // Add SEC-COMMS mode header (α-layer visibility)
  response.headers.set("X-SEC-COMMS-MODE", mode);
  response.headers.set("Cache-Control", "no-cache");

  return response;
}
