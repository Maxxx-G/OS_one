const store: any[] = [];

export async function GET() {
  const last = store.slice(-50);
  return new Response(JSON.stringify({ count: store.length, last }), {
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    store.push({ ...body, ts: Date.now() });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
}
