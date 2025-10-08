export const runtime = 'edge';

const ARCHON_URL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';
const ARCHON_CHAT_PATH = process.env.NEXT_PUBLIC_ARCHON_CHAT_PATH || '/echo';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = `${ARCHON_URL}${ARCHON_CHAT_PATH}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    const contentType = res.headers.get('content-type') || 'application/json';

    return new Response(text, {
      status: res.status,
      headers: {
        'content-type': contentType,
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'archon_unavailable' }), {
      status: 503,
      headers: {
        'content-type': 'application/json',
      },
    });
  }
}
