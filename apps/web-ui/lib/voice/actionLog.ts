/**
 * Action Log — Append-only micro-store for voice action audit trail.
 * Max 50 entries, subscribe pattern for reactive UI.
 */

export type ActionLogEntry = {
  ts: number;
  intent: string;
  transcript: string;
  result: 'ok' | 'cancel' | 'fail';
  note?: string;
};

const MAX_ENTRIES = 50;
let entries: ActionLogEntry[] = [];
const subscribers = new Set<() => void>();

export function addLog(entry: ActionLogEntry): void {
  entries = [{ ...entry }, ...entries].slice(0, MAX_ENTRIES);
  subscribers.forEach((fn) => fn());
}

export function getLog(): ActionLogEntry[] {
  return entries;
}

export function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
