// apps/web-ui/app/api/stream/route.ts
export const runtime = 'edge';
import { enqueue, buildEvent, drain } from '@/lib/sensory/router';

export function GET(req: Request) {
  const upgrade = req.headers.get('upgrade') || '';
  if (upgrade.toLowerCase() !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426 });
  }
  // @ts-ignore Edge runtime
  const { 0: client, 1: server } = new WebSocketPair();
  // @ts-ignore
  server.accept();

  // Client → Server: accept JSON content events (TEXT_TOKEN/LLM_PARTIAL/etc.)
  // @ts-ignore
  server.addEventListener('message', (ev: MessageEvent) => {
    try {
      const msg = JSON.parse(ev.data as string);
      const evn = buildEvent({
        session_id: msg.session_id ?? 'default',
        actor_id: msg.actor_id ?? 'unknown',
        tier: msg.tier ?? 'TIER_3_0',
        pri: msg.pri ?? 'T1',
        kind: msg.kind ?? 'TEXT_TOKEN',
        task_id: msg.task_id,
        payload: msg.payload
      });
      enqueue(evn);
    } catch (_e) { /* ignore malformed */ }
  });

  // Simple tick to drain and push router queue
  const iv = setInterval(() => {
    const batch = drain();
    if (batch.length) {
      // @ts-ignore
      server.send(JSON.stringify({kind:'BATCH', events: batch}));
    }
  }, 100);

  // @ts-ignore
  server.addEventListener('close', () => clearInterval(iv));

  return new Response(null, { status: 101, webSocket: client });
}
