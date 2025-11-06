// apps/web-ui/lib/sensory/router.ts
export type Tier = 'TIER_1_0'|'TIER_1_0A'|'TIER_1_1'|'TIER_1_2'|'TIER_1_3'|'TIER_2_0'|'TIER_3_0'|'TIER_4_0';
export type Pri = 'T0'|'T1'|'T2'|'T3';
export type Kind =
  | 'INTERRUPT_STOP' | 'YIELD' | 'MUTE' | 'FLOOR_GRANT'
  | 'TEXT_TOKEN' | 'AUDIO_CHUNK' | 'FRAME' | 'LLM_PARTIAL'
  | 'SESSION_START' | 'CONSENT_SET' | 'RECORD_ON' | 'RECORD_OFF'
  | 'TRACE' | 'METRIC';

export interface Event {
  session_id: string;
  actor_id: string;
  target_id?: string;
  tier: Tier;
  pri: Pri;
  kind: Kind;
  task_id?: string;
  seq: number;
  ts: number; // ms epoch
  payload?: unknown;
  idempotency_key: string; // session:task:seq
}

type Queue = Event[];
const qT0: Queue = [];
const qT1: Queue = [];
const qT2: Queue = [];
const qT3: Queue = [];

let seqCounter = 0;

export const tierTable = {
  // Minimal enforcement: Gabriel override, agents cannot cut assistants
  canPreempt: (actorTier: Tier, targetTier: Tier): boolean => {
    if (actorTier === 'TIER_1_0A') return true; // Gabriel global override
    const order = ['TIER_1_0','TIER_1_0A','TIER_1_1','TIER_1_2','TIER_1_3','TIER_2_0','TIER_3_0','TIER_4_0'];
    return order.indexOf(actorTier) <= order.indexOf(targetTier);
  },
  isAgent: (t: Tier) => t === 'TIER_3_0',
  isAssistant: (t: Tier) => ['TIER_1_1','TIER_1_2','TIER_1_3','TIER_2_0'].includes(t),
};

export function nextSeq(): number { return ++seqCounter; }

export function enqueue(ev: Event) {
  switch (ev.pri) {
    case 'T0': qT0.push(ev); break;
    case 'T1': qT1.push(ev); break;
    case 'T2': qT2.push(ev); break;
    default:   qT3.push(ev); break;
  }
}

export function drain(): Event[] {
  // T0 first (control), then T1, T2, T3
  return [...qT0.splice(0), ...qT1.splice(0), ...qT2.splice(0), ...qT3.splice(0)];
}

// Preemption book-keeping (very light stub)
const speakingBySession = new Map<string, {actor_id:string; tier:Tier; task_id?:string}>();

export function grantFloor(session_id: string, actor_id: string, tier: Tier, task_id?: string) {
  speakingBySession.set(session_id, {actor_id, tier, task_id});
}

export function currentSpeaker(session_id: string) {
  return speakingBySession.get(session_id);
}

export function tryPreempt(session_id: string, actor_tier: Tier): boolean {
  const cur = speakingBySession.get(session_id);
  if (!cur) return true;
  if (tierTable.canPreempt(actor_tier, cur.tier)) {
    speakingBySession.delete(session_id);
    return true;
  }
  return false;
}

// Helper to build events with idempotency
export function buildEvent(partial: Omit<Event,'seq'|'ts'|'idempotency_key'>): Event {
  const seq = nextSeq();
  const ts = Date.now();
  const idempotency_key = `${partial.session_id}:${partial.task_id ?? 'none'}:${seq}`;
  return {...partial, seq, ts, idempotency_key};
}
