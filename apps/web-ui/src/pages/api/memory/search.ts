import type { NextApiRequest, NextApiResponse } from 'next';

async function json(req: NextApiRequest) {
  try {
    return JSON.parse(req.body && typeof req.body === 'string' ? req.body : JSON.stringify(req.body || '{}'));
  } catch { return {}; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const base = process.env.SUPABASE_URL;
  if (!base) return res.status(200).json({ episodic: [], semantic: [], profile: null }); // soft fallback

  const auth = req.headers.authorization || '';
  if (!auth) return res.status(200).json({ episodic: [], semantic: [], profile: null }); // soft fallback

  const { q = '', topk = 3 } = await json(req);
  const headers = {
    'Authorization': auth,
    'Content-Type': 'application/json',
    'Accept-Profile': 'public',
    'Prefer': 'return=representation'
  };

  // Episodic: latest messages containing q (simple ilike), newest first
  const episodicUrl = new URL(`${base}/rest/v1/messages`);
  episodicUrl.searchParams.set('select', 'id,thread_id,role,text,created_at,response_id');
  if (q) episodicUrl.searchParams.set('text', `ilike.*${q}*`);
  episodicUrl.searchParams.set('order', 'created_at.desc');
  episodicUrl.searchParams.set('limit', String(topk));

  // Semantic: memories containing q (ilike on title/content), newest first
  const semanticUrl = new URL(`${base}/rest/v1/semantic_memories`);
  semanticUrl.searchParams.set('select', 'id,title,content,salience,tags,created_at');
  if (q) {
    semanticUrl.searchParams.set('or', `(title.ilike.*${q}*,content.ilike.*${q}*)`);
  }
  semanticUrl.searchParams.set('order', 'created_at.desc');
  semanticUrl.searchParams.set('limit', String(topk));

  // Profile: single row (tone/format prefs)
  const profileUrl = new URL(`${base}/rest/v1/profile_traits`);
  profileUrl.searchParams.set('select', 'tone,formatting_prefs,do_list,dont_list,updated_at');
  profileUrl.searchParams.set('limit', '1');

  const [episodicRes, semanticRes, profileRes] = await Promise.all([
    fetch(episodicUrl, { headers }),
    fetch(semanticUrl, { headers }),
    fetch(profileUrl, { headers }),
  ]);

  if (!episodicRes.ok || !semanticRes.ok || !profileRes.ok) {
    return res.status(200).json({ episodic: [], semantic: [], profile: null }); // soft fail
  }

  const [episodic, semantic, profileRows] = await Promise.all([
    episodicRes.json(), semanticRes.json(), profileRes.json()
  ]);

  const profile = Array.isArray(profileRows) && profileRows.length ? profileRows[0] : null;
  return res.status(200).json({ episodic, semantic, profile });
}
