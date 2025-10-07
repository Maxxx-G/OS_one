/**
 * POST /api/voice/summarize
 * Generate rolling summary of conversation for context continuity
 */

import { NextResponse } from 'next/server';

export const runtime = 'edge';

const ARCHON_BASE = process.env.ARCHON_BASE_URL || 'http://localhost:7700';

export async function POST(request: Request) {
  try {
    const { conversation } = await request.json();

    if (!conversation || typeof conversation !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Missing conversation text' },
        { status: 400 }
      );
    }

    // Call Archon's chat endpoint with summarization prompt
    const response = await fetch(`${ARCHON_BASE}/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes conversations concisely. Create a brief summary (2-3 sentences) capturing key topics and context.',
          },
          {
            role: 'user',
            content: `Summarize this conversation:\n\n${conversation}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn('[SummarizeAPI] Archon chat failed:', response.status);
      return NextResponse.json(
        { ok: false, error: 'Summarization failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const summary = data.content || '';

    return NextResponse.json({
      ok: true,
      summary,
    });
  } catch (err) {
    console.error('[SummarizeAPI] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
