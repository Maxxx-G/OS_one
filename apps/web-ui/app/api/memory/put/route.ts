export const runtime = 'edge';
import { put, setConsent } from '@/lib/memory/engine';
import { isPublic } from '@/lib/privacy/public-mode';
import { redactObject } from '@/lib/privacy/redactor';

export async function POST(req: Request) {
  const body = await req.json().catch(()=> ({}));
  const { session_id, scope, actor_id, topic, tags = [], content, sensitivity = 'P2', consent } = body || {};
  if (!session_id || !scope || !actor_id || !topic) {
    return new Response(JSON.stringify({ ok:false, error:'missing fields' }), { status: 400 });
  }
  if (typeof consent === 'boolean') {
    const principal = scope === 'user' ? actor_id : (scope === 'org' ? 'org' : 'session');
    setConsent(principal, consent);
  }
  // Public-mode: block risky P1/P2 writes unless explicit consent present and NOT public
  const risky = sensitivity === 'P1' || sensitivity === 'P2';
  if (risky && isPublic(session_id)) {
    return new Response(JSON.stringify({ ok:false, error:'PUBLIC_MODE_BLOCK' }), { status: 403 });
  }
  try {
    const safeContent = risky ? redactObject(content) : content;
    const rec = put({ session_id, scope, actor_id, topic, tags, content: safeContent, sensitivity });
    return new Response(JSON.stringify({ ok:true, record: rec }), { status: 200 });
  } catch (e:any) {
    if (e.message === 'CONSENT_REQUIRED') {
      return new Response(JSON.stringify({ ok:false, error:'CONSENT_REQUIRED' }), { status: 403 });
    }
    return new Response(JSON.stringify({ ok:false, error:'UNKNOWN' }), { status: 500 });
  }
}
