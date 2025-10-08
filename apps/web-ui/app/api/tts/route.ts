export const runtime = 'edge';

const ARCHON_URL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';

/**
 * POST /api/tts
 * Proxies TTS requests to Archon's /v1/audio/tts endpoint.
 * Returns audio stream with proper headers for browser playback.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, voice_id } = body;

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'No text provided' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Forward to Archon /v1/audio/tts
    const payload: { text: string; voice_id?: string } = { text };
    if (voice_id && typeof voice_id === 'string') {
      payload.voice_id = voice_id;
    }

    const response = await fetch(`${ARCHON_URL}/v1/audio/tts`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: 'tts_failed', details: errorText }), {
        status: response.status,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Stream audio back to client with proper headers
    const audioStream = response.body;
    const contentType = response.headers.get('content-type') || 'audio/mpeg';

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Transfer-Encoding', 'chunked');
    headers.set('Connection', 'keep-alive');

    return new Response(audioStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[api/tts] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'tts_transport_error',
        message: error instanceof Error ? error.message : 'unknown',
      }),
      {
        status: 502,
        headers: { 'content-type': 'application/json' },
      },
    );
  }
}
