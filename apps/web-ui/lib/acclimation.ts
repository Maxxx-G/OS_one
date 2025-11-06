const ARCHON_URL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';
const START_KEY = 'os1.acclimation.start';
const DAY_MS = 24 * 60 * 60 * 1000;

function readStartIso(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(START_KEY);
  } catch {
    return null;
  }
}

function writeStartIso(value: string) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(START_KEY, value);
  } catch {
    /* ignore */
  }
}

function resolveStart(startIso?: string): number {
  if (startIso) {
    const parsed = new Date(startIso).getTime();
    return Number.isFinite(parsed) ? parsed : Date.now();
  }

  const stored = readStartIso();
  if (stored) {
    const ms = Number(stored);
    if (Number.isFinite(ms)) {
      return ms;
    }
  }

  const now = Date.now();
  writeStartIso(String(now));
  return now;
}

export function getAcclimationPct(startIso?: string, days = 30): number {
  const start = resolveStart(startIso);
  const delta = Date.now() - start;
  const pct = delta / (days * DAY_MS);
  if (Number.isNaN(pct)) {
    return 0;
  }
  return Math.min(1, Math.max(0, pct));
}

export function hintColorCssVar(
  startIso?: string,
  palette: 'normal' | 'cb_safe' = 'normal',
): string {
  const pct = getAcclimationPct(startIso);
  // normal: green→red, cb_safe: blue→orange
  const from = palette === 'cb_safe' ? [37, 99, 235] : [34, 197, 94];
  const to = palette === 'cb_safe' ? [251, 146, 60] : [239, 68, 68];
  const r = Math.round(from[0] + (to[0] - from[0]) * pct);
  const g = Math.round(from[1] + (to[1] - from[1]) * pct);
  const b = Math.round(from[2] + (to[2] - from[2]) * pct);
  return `--hint-accent: rgb(${r}, ${g}, ${b});`;
}

export async function syncAcclimationStartToArchon(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  const stored = readStartIso();
  if (!stored) {
    return;
  }
  const ms = Number(stored);
  if (!Number.isFinite(ms)) {
    return;
  }
  const iso = new Date(ms).toISOString();
  try {
    await fetch(`${ARCHON_URL}/v1/prefs`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ acclimation_start: iso }),
    });
  } catch {
    /* ignore */
  }
}
