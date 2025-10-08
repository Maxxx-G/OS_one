import fs from 'fs';
import path from 'path';
import { tagDecision, resolveConflict } from '../ethics/values';

export type Ethic = 'PRIMACY'|'SECONDARY'|'GUARDIAN';

function ethicFromAuthority(tier: number): Ethic {
  return tier === 1 ? 'PRIMACY' : tier === 2 ? 'SECONDARY' : tier === 3 ? 'SECONDARY' : 'GUARDIAN';
}
function ethicFromMeeting(tier: number): Ethic {
  return tier === 1 ? 'PRIMACY' : tier === 2 ? 'SECONDARY' : tier === 3 ? 'SECONDARY' : 'GUARDIAN';
}
function maxEthic(a: Ethic, b: Ethic): Ethic {
  const rank = { PRIMACY:3, SECONDARY:2, GUARDIAN:1 };
  return (rank[a] >= rank[b]) ? a : b;
}

export type QueueItem = {
  topic_id: string;
  title: string;
  authority_tier: 1|2|3|4;
  meeting_tier: 1|2|3|4;
  effective_ethic?: Ethic;
  departments: string[];
  participants: string[];
  status: 'queued'|'scheduled'|'in_progress'|'done'|'blocked';
  next_review?: string;
  attachments?: string[];
};

export type LoadedQueue = { tier: string; items: QueueItem[] };

function readJSON(file: string): any {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function loadTierQueue(tierDir: string): LoadedQueue {
  const base = path.resolve(process.cwd(), 'governance', 'meetings', tierDir);
  const files = fs.readdirSync(base).filter(f => f.startsWith('.queue') && f.endsWith('.json')).sort().reverse();
  const items: QueueItem[] = [];
  for (const f of files) {
    const arr = readJSON(path.join(base, f));
    for (const raw of arr) {
      const auth = ethicFromAuthority(raw.authority_tier);
      const meet = ethicFromMeeting(raw.meeting_tier);
      const computed: Ethic = maxEthic(auth, meet);
      const finalEthic = raw.effective_ethic ? maxEthic(computed, raw.effective_ethic) : computed;
      const tag = tagDecision(raw.topic_id, finalEthic);
      items.push({ ...raw, effective_ethic: tag.level });
    }
  }
  return { tier: tierDir, items };
}

export function loadAllQueues(): LoadedQueue[] {
  const root = path.resolve(process.cwd(), 'governance', 'meetings');
  const tiers = fs.readdirSync(root).filter(d => d.startsWith('tier') && fs.statSync(path.join(root,d)).isDirectory());
  return tiers.map(loadTierQueue);
}
