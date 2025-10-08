// apps/web-ui/app/api/control/interrupt/route.ts
export const runtime = 'edge';
import { buildEvent, enqueue, tryPreempt } from '@/lib/sensory/router';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { session_id, actor_id, actor_tier, target_id, reason } = body as {
    session_id: string; actor_id: string; actor_tier: any; target_id?: string; reason?: string;
  };
  if (!session_id || !actor_id || !actor_tier) {
    return new Response(JSON.stringify({ok:false,error:'missing fields'}), {status:400});
  }
  const allowed = tryPreempt(session_id, actor_tier);
  const ev = buildEvent({
    session_id, actor_id, target_id,
    tier: actor_tier, pri:'T0', kind:'INTERRUPT_STOP',
    payload: { reason }
  });
  enqueue(ev);
  return new Response(JSON.stringify({ok:true, preempted:allowed, event:ev}), {status:200});
}
