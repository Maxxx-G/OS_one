import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../state/AuthContext';

export type Profile = {
  tone?: string;
  formatting_prefs?: Record<string, any>;
  do_list?: string[];
  dont_list?: string[];
  updated_at?: string;
} | null;

export const useProfile = () => {
  const { token, userId } = useAuth();
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setProfile(null);
      return;
    }
    setLoading(true);
    try {
      const r = await fetch('/api/memory/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ q: '', topk: 0 }),
      });
      if (r.ok) {
        const { profile: p } = await r.json();
        setProfile(p ?? null);
      } else {
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  const update = useCallback(
    async (patch: Partial<Profile>) => {
      if (!token || !userId) return { ok: false };
      const r = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: userId, ...patch }),
      });
      if (r.ok) {
        const j = await r.json();
        setProfile(j);
        return { ok: true, data: j };
      }
      return { ok: false };
    },
    [token, userId],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, loading, refresh, update };
};
