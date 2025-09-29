import type { NextApiRequest, NextApiResponse } from 'next';
import { assertSeccomms } from '../../../server/seccommsGuard';

type Room = { offer?: { type: 'offer'; sdp: string }; answer?: { type: 'answer'; sdp: string } };
const rooms: Record<string, Room> = {}; // dev-only, in-memory

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!assertSeccomms(req, res)) return;
  const redacted = (req.headers['x-os1-redacted'] as string | undefined) === 'true';
  if (!redacted) {
    return res.status(403).json({ error: 'redaction header required' });
  }

  const room = (req.query.room as string) || 'default';
  rooms[room] ||= {};
  if (req.method === 'POST') {
    const { type, sdp } = (req.body || {}) as { type?: string; sdp?: string };
    if (type === 'offer' && sdp) {
      rooms[room].offer = { type: 'offer', sdp };
      rooms[room].answer = undefined;
      return res.status(200).json({ ok: true });
    }
    if (type === 'answer' && sdp) {
      rooms[room].answer = { type: 'answer', sdp };
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: 'type must be offer|answer and include sdp' });
  }
  if (req.method === 'GET') {
    const what = (req.query.what as string) || 'offer'; // 'offer'|'answer'
    return res.status(200).json(rooms[room]?.[what] ?? null);
  }
  res.status(405).end();
}
