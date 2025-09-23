import { useCallback } from 'react';
import { useAuth } from '../state/AuthContext';

export type MemoryBlock = { system: string };

export const useMemoryContext = () => {
  const { token } = useAuth();

  const build = useCallback(async (q: string, topk = 3): Promise<MemoryBlock> => {
    if (!token) return { system: '' };
    const r = await fetch('/api/memory/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ q, topk }),
    });
    if (!r.ok) return { system: '' };
    const { episodic = [], semantic = [], profile = null } = await r.json();

    const epi = episodic.map((m: any) => `- [${m.role}] ${m.text}`)?.join('\n') || '';
    const sem = semantic.map((s: any) => `- ${s.title || ''} — ${s.content}`)?.join('\n') || '';
    const tone = profile?.tone ? `tone=${profile.tone}` : '';
    const fmt = profile?.formatting_prefs ? `format=${JSON.stringify(profile.formatting_prefs)}` : '';
    const dos = Array.isArray(profile?.do_list) && profile.do_list.length ? `do=${profile.do_list.join(', ')}` : '';
    const donts = Array.isArray(profile?.dont_list) && profile.dont_list.length ? `dont=${profile.dont_list.join(', ')}` : '';

    const header = [tone, fmt, dos, donts].filter(Boolean).join(' ; ');
    const block = [
      header && `# Profile\n${header}`,
      epi && `# Episodic (top ${Math.min(episodic.length, topk)})\n${epi}`,
      sem && `# Semantic (top ${Math.min(semantic.length, topk)})\n${sem}`
    ].filter(Boolean).join('\n\n');

    return { system: block };
  }, [token]);

  return { build };
};
