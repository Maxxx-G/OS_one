export type Tier = 'FREE'|'CORE'|'PRO'|'ENTERPRISE';

export function getUserTierFromRequest(req?: Request): Tier {
  try {
    // Basic stub: read from header or cookie; default CORE
    // When auth lands, replace with real session claims
    // @ts-ignore
    const h = (req?.headers?.get && req.headers.get('x-osone-tier')) || '';
    if (h === 'FREE' || h === 'CORE' || h === 'PRO' || h === 'ENTERPRISE') return h;
    return 'CORE';
  } catch { return 'CORE'; }
}

export function getClientTier(): Tier {
  try {
    const v = (typeof document !== 'undefined')
      ? (document.cookie.match(/osone_tier=([A-Z]+)/)?.[1] ?? '')
      : '';
    if (v === 'FREE' || v === 'CORE' || v === 'PRO' || v === 'ENTERPRISE') return v;
  } catch {}
  return 'CORE';
}
