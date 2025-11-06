// Edge runtime
export const runtime = 'edge';

function adaptersEnabled() {
  return process.env.NEXT_PUBLIC_FEATURE_ADAPTERS === '1';
}

export async function POST(req: Request) {
  if (!adaptersEnabled()) {
    return new Response('disabled', { status: 404 });
  }
  // Minimal placeholder: echo body (no real streaming needed for CI).
  const body = await req.text();
  return new Response(body || 'ok', {
    status: 200,
    headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' },
  });
}
