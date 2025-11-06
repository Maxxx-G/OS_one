// Edge runtime
export const runtime = 'edge';

function adaptersEnabled() {
  return process.env.NEXT_PUBLIC_FEATURE_ADAPTERS === '1';
}

export async function GET() {
  if (!adaptersEnabled()) {
    return new Response('disabled', { status: 404 });
  }
  // Minimal stub; real adapter probing happens elsewhere.
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
