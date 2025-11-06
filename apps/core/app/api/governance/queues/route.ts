export const runtime = 'edge';
import { loadAllQueues } from '../../../../lib/governance/queue';

export async function GET() {
  try {
    const data = loadAllQueues();
    return new Response(JSON.stringify({ ok:true, data }), { status: 200 });
  } catch (e:any) {
    return new Response(JSON.stringify({ ok:false, error: 'LOAD_FAILED' }), { status: 500 });
  }
}
