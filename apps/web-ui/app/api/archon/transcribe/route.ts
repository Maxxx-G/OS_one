export const runtime = 'edge';

export async function POST(req: Request) {
  const base = (
    process.env.NEXT_PUBLIC_LIVE_BASE ||
    process.env.NEXT_PUBLIC_ARCHON_URL ||
    process.env.ARCHON_URL ||
    ''
  ).replace(/\/+$/, '');

  if (!base) {
    return new Response(
      JSON.stringify({ ok: false, error: 'archon_unset' }),
      { status: 503, headers: { 'content-type': 'application/json' } }
    );
  }

  const url = `${base}/v1/audio/transcribe`;
  try {
    const upstream = await fetch(url, {
      method: 'POST',
      body: req.body,
    });
    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ ok: false, error: 'upstream_error', status: upstream.status }),
        { status: upstream.status, headers: { 'content-type': 'application/json' } }
      );
    }
    return upstream;
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: 'archon_unreachable' }),
      { status: 502, headers: { 'content-type': 'application/json' } }
    );
  }
}
