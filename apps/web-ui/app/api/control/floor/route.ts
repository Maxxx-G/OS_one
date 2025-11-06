// apps/web-ui/app/api/control/floor/route.ts
export const runtime = 'edge';
import { buildEvent, enqueue, grantFloor, tryPreempt } from '@/lib/sensory/router';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { session_id, grant_to, grant_tier, channel, ttl_ms } = body as {
    session_id:string; grant_to:string; grant_tier:any; channel?:string; ttl_ms?:number;
  };
  if (!session_id || !grant_to || !grant_tier) {
    return new Response(JSON.stringify({ok:false,error:'missing fields'}), {status:400});
  }
  // Preempt if someone is speaking and lower tier
  const ok = tryPreempt(session_id, grant_tier);
  if (ok) grantFloor(session_id, grant_to, grant_tier);
  const ev = buildEvent({
    session_id, actor_id: grant_to, tier: grant_tier,
    pri:'T0', kind:'FLOOR_GRANT', payload:{ channel, ttl_ms }
  });
  enqueue(ev);
  return new Response(JSON.stringify({ok, event:ev}), {status:200});
}
