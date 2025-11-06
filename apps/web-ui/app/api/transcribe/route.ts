export const runtime = 'edge';

const ARCHON_URL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Forward to Archon /v1/audio/transcribe
    const archonFormData = new FormData();
    archonFormData.append('file', file);

    const response = await fetch(`${ARCHON_URL}/v1/audio/transcribe`, {
      method: 'POST',
      body: archonFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: 'transcription_failed', details: errorText }),
        {
          status: response.status,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'transcription_error',
        message: error instanceof Error ? error.message : 'unknown',
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      },
    );
  }
}
