export const runtime = 'edge';

type EchoResponse = {
  id: string;
  role: 'assistant';
  text: string;
  ts: string;
  meta: {
    mode: string;
    agent: string;
    source: string;
  };
};

type EchoError = {
  error: string;
};

const jsonResponse = (data: EchoResponse | EchoError, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = typeof body?.text === 'string' ? body.text.trim() : '';

    if (!text) {
      return jsonResponse({ error: 'empty' }, 400);
    }

    const payload: EchoResponse = {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: `echo: ${text}`,
      ts: new Date().toISOString(),
      meta: {
        mode: 'Mediated',
        agent: 'OpenAI [ext]',
        source: 'local-echo',
      },
    };

    return jsonResponse(payload);
  } catch {
    return jsonResponse({ error: 'bad_request' }, 400);
  }
}
