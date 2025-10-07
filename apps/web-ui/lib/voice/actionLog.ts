/**
 * Action Log — Append-only micro-store for voice action audit trail.
 * Max 50 entries, subscribe pattern for reactive UI.
 * Persists to localStorage and hydrates on first access.
 */

export type ActionLogEntry = {
  ts: number;
  intent: string;
  transcript: string;
  result: 'ok' | 'cancel' | 'fail';
  note?: string;
};

const MAX_ENTRIES = 50;
const LS_KEY = 'os1.actionLog.v1';

let entries: ActionLogEntry[] = [];
const subscribers = new Set<() => void>();
let hydrated = false;

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        entries = parsed.slice(0, MAX_ENTRIES);
      }
    }
  } catch {
    // ignore parse errors
  }
}

function persist(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(entries));
  } catch {
    // ignore storage errors
  }
}

export function addLog(entry: ActionLogEntry): void {
  hydrate();
  entries = [{ ...entry }, ...entries].slice(0, MAX_ENTRIES);
  persist();
  subscribers.forEach((fn) => fn());
}

export function getLog(): ActionLogEntry[] {
  hydrate();
  return entries;
}

export function clearLog(): void {
  hydrate();
  entries = [];
  persist();
  subscribers.forEach((fn) => fn());
}

export function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
