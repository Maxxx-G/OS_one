/*
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1lexicore
X-Purpose: health-endpoint
X-Version: v2025.10.12
X-Policy: filename+header compliance required
*/

export const runtime = "edge";

export async function GET() {
  return Response.json({
    ok: true,
    mode: "local_only",
    version: "v2025.10.12",
    service: "lexicore",
    timestamp: new Date().toISOString(),
  });
}
