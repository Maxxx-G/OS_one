/**
 * GET /api/confirmations/policy
 * Proxy to Archon's /v1/config/confirmations endpoint
 */

import { NextResponse } from 'next/server';

export const runtime = 'edge';

const ARCHON_BASE = process.env.ARCHON_BASE_URL || 'http://localhost:7700';

export async function GET() {
  try {
    const resp = await fetch(`${ARCHON_BASE}/v1/config/confirmations`, {
      cache: 'no-store',
    });
    
    if (!resp.ok) {
      console.warn('[PolicyAPI] Archon fetch failed:', resp.status);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch policy from Archon' },
        { status: resp.status }
      );
    }
    
    const policy = await resp.json();
    
    return NextResponse.json({
      ok: true,
      policy,
    });
  } catch (err) {
    console.error('[PolicyAPI] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
