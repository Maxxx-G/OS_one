import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const base = process.env.SUPABASE_URL;
  if (!base) return res.status(500).json({ error: 'SUPABASE_URL missing' });

  const auth = req.headers.authorization || '';
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const { user_id, title, content, tags = [], salience = 0.0 } = req.body || {};
  if (!user_id || !content) return res.status(400).json({ error: 'user_id and content required' });

  const r = await fetch(`${base}/rest/v1/semantic_memories`, {
    method: 'POST',
    headers: {
      Authorization: auth as string,
      'Content-Type': 'application/json',
      'Accept-Profile': 'public',
      Prefer: 'return=representation',
    },
    body: JSON.stringify([{ user_id, title, content, tags, salience }]),
  });

  const ok = r.ok;
  const payload = ok ? await r.json() : await r.text();
  return res
    .status(ok ? 200 : r.status)
    .json(ok ? payload?.[0] : { error: payload || 'insert failed' });
}
