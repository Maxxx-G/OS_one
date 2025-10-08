export const runtime = 'edge';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const text = typeof (body as any)?.text === 'string' ? (body as any).text.trim() : '';

  if (!text) {
    return new Response(JSON.stringify({ error: 'empty' }), {
      status: 400,
      headers: {
        'content-type': 'application/json',
      },
    });
  }

  const encoder = new TextEncoder();
  const tokens = `echo: ${text}`.split(/(\s+)/);

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let index = 0;

      const push = () => {
        if (index >= tokens.length) {
          controller.enqueue(encoder.encode(JSON.stringify({ done: true }) + '\n'));
          controller.close();
          return;
        }

        const chunk = tokens[index++];
        if (chunk) {
          controller.enqueue(encoder.encode(JSON.stringify({ text: chunk }) + '\n'));
        }

        setTimeout(push, 25);
      };

      push();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'application/x-ndjson',
    },
  });
}
