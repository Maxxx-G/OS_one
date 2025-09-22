import { Message, SessionStore, Thread } from './types';

const KEY = 'os1:threads:v1';
const memory = new Map<string, Thread>();

function load() {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, Thread>;
      for (const [id, t] of Object.entries(obj)) memory.set(id, t);
    }
  } catch {}
}
function flush() {
  if (typeof window === 'undefined') return;
  const obj: Record<string, Thread> = {};
  for (const [id, t] of memory.entries()) obj[id] = t;
  try { window.localStorage.setItem(KEY, JSON.stringify(obj)); } catch {}
}

load();

export const store: SessionStore = {
  getThread(id) {
    return memory.get(id);
  },
  getOrCreateThread(id) {
    let t = memory.get(id);
    if (!t) {
      t = { id, createdAt: Date.now(), messages: [] };
      memory.set(id, t);
      flush();
    }
    return t;
  },
  appendMessage(threadId, m) {
    const t = this.getOrCreateThread(threadId);
    t.messages.push(m);
    flush();
  },
};
