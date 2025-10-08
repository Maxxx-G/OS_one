export const runtime = 'edge';
import { issueConsent } from '@/lib/contacts/engine';

export async function POST(req: Request) {
  const body = await req.json().catch(()=> ({}));
  const { subject, scopes = ['contact.basic'], ttl_ms } = body || {};
  if (!subject) return new Response(JSON.stringify({ ok:false, error:'missing subject' }), { status: 400 });
  const ref = issueConsent(subject, scopes, ttl_ms);
  return new Response(JSON.stringify({ ok:true, consent_ref: ref }), { status: 200 });
}
