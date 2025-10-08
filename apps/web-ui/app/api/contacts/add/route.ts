export const runtime = 'edge';
import { upsertContact, listContacts } from '@/lib/contacts/engine';

export async function POST(req: Request) {
  const body = await req.json().catch(()=> ({}));
  const { session_id, display_name, emails = [], phones = [], addresses = [], tags = [], notes = '', consent_ref } = body || {};
  if (!session_id || !display_name) {
    return new Response(JSON.stringify({ ok:false, error:'missing fields' }), { status: 400 });
  }
  try {
    const record = upsertContact(session_id, { display_name, emails, phones, addresses, tags, notes, consent_ref });
    return new Response(JSON.stringify({ ok:true, record }), { status: 200 });
  } catch (e:any) {
    const msg = e.message || 'UNKNOWN';
    const code = msg === 'PUBLIC_MODE_BLOCK' ? 403 : (msg === 'CONSENT_REQUIRED' ? 403 : 500);
    return new Response(JSON.stringify({ ok:false, error: msg }), { status: code });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ ok:true, contacts: listContacts() }), { status: 200 });
}
