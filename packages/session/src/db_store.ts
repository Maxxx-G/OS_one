import { Message, SessionStore, Thread } from './types';
import { store as localStore } from './store';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (r.status === 401 || r.status === 403 || r.status === 404) {
    throw new Error('db_unavailable');
  }
  if (!r.ok) throw new Error(`db_error_${r.status}`);
  return r.json();
}

export const dbStore: SessionStore & { online: boolean } = {
  online: !!process.env.NEXT_PUBLIC_SUPABASE_URL, // hint only
  getThread(id: string): Thread | undefined {
    // DB list call would be by user; for now, lean on local mirror
    return localStore.getThread(id);
  },
  getOrCreateThread(id: string): Thread {
    return localStore.getOrCreateThread(id);
  },
  async appendMessage(threadId: string, m: Message) {
    try {
      // attempt DB write only for user messages that include user_id (future Auth block)
      if ((m as any).role === 'user') {
        await api('/api/db/threads', {
          method: 'POST',
          headers: { 'Authorization': (globalThis as any).os1_user_token || '' },
          body: JSON.stringify({ user_id: (globalThis as any).os1_user_id, title: 'default' }),
        });
      }
    } catch {
      // ignore; fall back to local
    } finally {
      localStore.appendMessage(threadId, m);
    }
  },
} as any;
