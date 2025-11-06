export const runtime = 'edge';
import { query } from '@/lib/memory/engine';

export async function POST(req: Request) {
  const body = await req.json().catch(()=> ({}));
  const { session_id, scope, topic, tag } = body || {};
  const results = query({ session_id, scope, topic, tag });
  return new Response(JSON.stringify({ ok:true, results }), { status: 200 });
}
