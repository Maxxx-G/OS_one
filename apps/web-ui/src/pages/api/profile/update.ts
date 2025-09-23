import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const base = process.env.SUPABASE_URL;
  if (!base) return res.status(500).json({ error: 'SUPABASE_URL missing' });

  const auth = req.headers.authorization || '';
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const { user_id, tone, formatting_prefs, do_list, dont_list } = (req.body || {});
  if (!user_id) return res.status(400).json({ error: 'user_id required' });

  const now = new Date().toISOString();

  // Try PATCH by user_id first
  const patchUrl = new URL(`${base}/rest/v1/profile_traits`);
  patchUrl.searchParams.set('user_id', `eq.${user_id}`);
  const patch = await fetch(patchUrl, {
    method: 'PATCH',
    headers: {
      'Authorization': auth as string,
      'Content-Type': 'application/json',
      'Accept-Profile': 'public',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      ...(tone !== undefined ? { tone } : {}),
      ...(formatting_prefs !== undefined ? { formatting_prefs } : {}),
      ...(do_list !== undefined ? { do_list } : {}),
      ...(dont_list !== undefined ? { dont_list } : {}),
      updated_at: now
    }),
  });

  if (patch.ok) {
    const json = await patch.json();
    return res.status(200).json(Array.isArray(json) ? json[0] : json);
  }

  // Fallback: POST (insert)
  const post = await fetch(`${base}/rest/v1/profile_traits`, {
    method: 'POST',
    headers: {
      'Authorization': auth as string,
      'Content-Type': 'application/json',
      'Accept-Profile': 'public',
      'Prefer': 'return=representation,resolution=merge-duplicates'
    },
    body: JSON.stringify([{
      user_id, tone: tone ?? 'neutral',
      formatting_prefs: formatting_prefs ?? {},
      do_list: do_list ?? [],
      dont_list: dont_list ?? [],
      updated_at: now
    }]),
  });

  const ok = post.ok;
  const payload = ok ? await post.json() : await post.text();
  return res.status(ok ? 200 : post.status).json(ok ? payload?.[0] : { error: payload || 'upsert failed' });
}
