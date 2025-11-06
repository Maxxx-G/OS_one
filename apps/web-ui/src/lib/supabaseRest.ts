type Method = 'GET' | 'POST';
export async function supabaseRest(
  urlBase: string,
  table: string,
  method: Method,
  req: Request,
  body?: any,
) {
  const auth = req.headers.get('authorization'); // "Bearer <user_jwt>"
  if (!auth) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const url = `${urlBase}/rest/v1/${table}`;
  const headers: Record<string, string> = {
    Authorization: auth,
    'Content-Type': 'application/json',
    'Accept-Profile': 'public', // schema
    Prefer: 'return=representation',
  };
  const qs = method === 'GET' ? '?select=*&order=created_at.asc' : '';
  const r = await fetch(url + qs, {
    method,
    headers,
    body: method === 'POST' ? JSON.stringify(body ?? {}) : undefined,
  });
  if (!r.ok) {
    const text = await r.text();
    return new Response(JSON.stringify({ error: text || r.statusText }), { status: r.status });
  }
  const json = await r.json();
  return new Response(JSON.stringify(json), { status: 200 });
}
