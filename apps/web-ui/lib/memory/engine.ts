export type Scope = 'session'|'user'|'org'|'global';
export type Sensitivity = 'P1'|'P2'|'P3';
export interface MemoryRecord {
  id: string;
  session_id: string;
  scope: Scope;
  actor_id: string;
  topic: string;
  tags: string[];
  content: any;
  sensitivity: Sensitivity;
  created_at: number;
  ttl_ms?: number;
  consent_ref?: string;
  hash: string;
}

type Store = Map<string, MemoryRecord>; // id -> record
const store: Store = new Map();
const consentByPrincipal = new Map<string, boolean>(); // principal -> consent

function hashOf(input: any): string {
  const s = typeof input === 'string' ? input : JSON.stringify(input);
  let h = 0; for (let i=0;i<s.length;i++) { h = (h<<5)-h + s.charCodeAt(i); h|=0; }
  return `h${Math.abs(h)}`;
}

export function setConsent(principal: string, on: boolean) {
  consentByPrincipal.set(principal, on);
}

export function hasConsent(principal: string): boolean {
  return !!consentByPrincipal.get(principal);
}

export function put(rec: Omit<MemoryRecord,'id'|'created_at'|'hash'>): MemoryRecord {
  // Policy: P0 never stored (not modeled here); P1/P2 require consent
  const principal = rec.scope === 'user' ? rec.actor_id : rec.scope === 'org' ? 'org' : 'session';
  if ((rec.sensitivity === 'P1' || rec.sensitivity === 'P2') && !hasConsent(principal)) {
    throw new Error('CONSENT_REQUIRED');
  }
  const now = Date.now();
  const id = `${rec.session_id}:${rec.scope}:${rec.topic}:${now}`;
  const final: MemoryRecord = { ...rec, id, created_at: now, hash: hashOf(rec.content) };
  store.set(id, final);
  return final;
}

export function query(opts: { session_id?: string; scope?: Scope; topic?: string; tag?: string }) {
  const out: MemoryRecord[] = [];
  for (const r of store.values()) {
    if (opts.session_id && r.session_id !== opts.session_id) continue;
    if (opts.scope && r.scope !== opts.scope) continue;
    if (opts.topic && r.topic !== opts.topic) continue;
    if (opts.tag && !r.tags.includes(opts.tag)) continue;
    out.push(r);
  }
  return out.sort((a,b)=>a.created_at-b.created_at);
}

export function forget(id: string) {
  // Tombstone behavior can be added later; v0 just deletes
  return store.delete(id);
}
