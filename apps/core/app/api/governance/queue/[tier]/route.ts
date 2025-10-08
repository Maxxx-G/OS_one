export const runtime = 'edge';
import { loadTierQueue } from '../../../../../lib/governance/queue';

export async function GET(_: Request, ctx: { params: { tier: string }}) {
  try {
    const { tier } = ctx.params;
    const data = loadTierQueue(tier);
    return new Response(JSON.stringify({ ok:true, data }), { status: 200 });
  } catch (e:any) {
    return new Response(JSON.stringify({ ok:false, error: 'LOAD_FAILED' }), { status: 500 });
  }
}
