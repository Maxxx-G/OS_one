import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Use in any future media egress endpoints.
 * Denies when SEC-COMMS is not ON or pinned key mismatches.
 * Client must send headers when attempting media egress:
 *   x-os1-seccomms: on
 *   x-os1-peer: <hex fingerprint>
 */
export function assertSeccomms(req: NextApiRequest, res: NextApiResponse): boolean {
  const modeHdr = (req.headers['x-os1-seccomms'] as string | undefined)?.toLowerCase();
  const peerHdr = (req.headers['x-os1-peer'] as string | undefined)?.toLowerCase() || '';

  // Server-side policy: env overrides UI
  const serverMode = (process.env.SEC_COMMS_MODE || '').toLowerCase(); // '', 'local_only', 'seccomms_on'
  const pinned = (process.env.SEC_COMMS_PINNED_KEY || '').toLowerCase(); // hex

  const effectiveMode =
    serverMode === 'local_only' || serverMode === 'seccomms_on'
      ? serverMode
      : modeHdr === 'on'
        ? 'seccomms_on'
        : 'local_only';

  if (effectiveMode !== 'seccomms_on') {
    res.status(403).json({ error: 'SEC-COMMS disabled (local_only)' });
    return false;
  }
  if (pinned && peerHdr !== pinned) {
    res.status(403).json({ error: 'SEC-COMMS peer mismatch' });
    return false;
  }
  return true;
}
