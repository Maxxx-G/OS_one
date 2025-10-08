// ────────────────────────────────────────────────────────────
// Voice Phase 4 Intent Action Route — Safe No-Op Bootstrap
// ────────────────────────────────────────────────────────────

export const runtime = 'edge';

type ActionOk = { ok: true; uiHint: string; action: string };
type ActionErr = { ok: false; error: string };
type ActionBody = ActionOk | ActionErr;

const JSON_HEADERS = { 'content-type': 'application/json' } as const;

/**
 * POST /api/voice/act
 * Accepts intent routing payloads and returns UI hints.
 * Phase 4 Bootstrap: All actions are no-ops; returns acknowledgment only.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const payload = await req.json().catch(() => ({}));
    const intent = typeof payload?.intent === 'string' ? payload.intent : '';
    const data = payload?.payload || {};

    if (!intent || intent === 'none') {
      return jsonResponse(400, { ok: false, error: 'bad_request' });
    }

    // Route intent to appropriate action (no-op for now)
    const result = await handleIntent(intent, data);
    return jsonResponse(200, result);
  } catch (error) {
    return jsonResponse(500, { ok: false, error: 'internal_error' });
  }
}

async function handleIntent(intent: string, data: Record<string, unknown>): Promise<ActionOk> {
  switch (intent) {
    case 'overwatch.pause':
      return {
        ok: true,
        action: 'overwatch.pause',
        uiHint: '⏸️ Overwatch paused (no-op in Phase 4)',
      };

    case 'overwatch.resume':
      return {
        ok: true,
        action: 'overwatch.resume',
        uiHint: '▶️ Overwatch resumed (no-op in Phase 4)',
      };

    case 'open.settings':
      return {
        ok: true,
        action: 'open.settings',
        uiHint: '⚙️ Settings opened (no-op in Phase 4)',
      };

    default:
      return {
        ok: true,
        action: 'unknown',
        uiHint: `❓ Intent "${intent}" not recognized`,
      };
  }
}

function jsonResponse(status: number, body: ActionBody): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}
