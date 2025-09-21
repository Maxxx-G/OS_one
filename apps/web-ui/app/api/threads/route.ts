// Edge runtime
export const runtime = 'edge';

function threadsEnabled() {
  return process.env.NEXT_PUBLIC_FEATURE_THREADS === '1';
}

export async function POST() {
  if (!threadsEnabled()) {
    return new Response('threads:disabled', { status: 404 });
  }
  // Minimal stub response so CI typecheck passes.
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
