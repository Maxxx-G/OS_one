import { NextResponse } from 'next/server';
import { getStats } from '@/lib/voice/voiceMetrics';

export const runtime = 'edge';

/**
 * GET /api/voice/metrics
 * Returns aggregated voice pipeline metrics (last 5 minutes).
 */
export async function GET() {
  try {
    const stats = getStats(5);
    return NextResponse.json({
      ok: true,
      window_minutes: 5,
      ...stats,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'metrics_error' },
      { status: 500 }
    );
  }
}
