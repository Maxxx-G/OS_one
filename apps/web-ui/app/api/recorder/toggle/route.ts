// apps/web-ui/app/api/recorder/toggle/route.ts
export const runtime = 'edge';
import { buildEvent, enqueue } from '@/lib/sensory/router';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { session_id, actor_id, mode, on } = body as {
    session_id:string; actor_id:string; mode:'private'|'temp'|'public'; on:boolean;
  };
  if (!session_id || !actor_id || typeof on !== 'boolean' || !mode) {
    return new Response(JSON.stringify({ok:false,error:'missing fields'}), {status:400});
  }
  const kind = on ? 'RECORD_ON' : 'RECORD_OFF';
  const ev = buildEvent({ session_id, actor_id, tier:'TIER_1_1', pri:'T0', kind, payload:{ mode } });
  enqueue(ev);
  return new Response(JSON.stringify({ok:true, event:ev}), {status:200});
}
