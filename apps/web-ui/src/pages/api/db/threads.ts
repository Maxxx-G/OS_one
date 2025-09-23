import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseRest } from '../../../lib/supabaseRest';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const base = process.env.SUPABASE_URL;
  if (!base) return res.status(500).json({ error: 'SUPABASE_URL missing' });

  // Next.js Request wrapper for helper
  const r = new Request('http://local', {
    method: req.method,
    headers: {
      authorization: (req.headers.authorization as string) || '',
      'content-type': 'application/json',
    },
    body: req.method === 'POST' ? JSON.stringify(req.body ?? {}) : undefined,
  });

  if (req.method === 'GET') {
    const out = await supabaseRest(base, 'threads', 'GET', r);
    return res.status(out.status).send(await out.text());
  }
  if (req.method === 'POST') {
    // BODY must include { user_id, title } to satisfy RLS (auth.uid()) check.
    const out = await supabaseRest(base, 'threads', 'POST', r, req.body);
    return res.status(out.status).send(await out.text());
  }
  return res.status(405).end();
}
