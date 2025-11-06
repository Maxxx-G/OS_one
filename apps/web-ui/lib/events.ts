export type EventName =
  | 'thread:create'
  | 'thread:open'
  | 'thread:rename'
  | 'message:send'
  | 'message:success'
  | 'message:error'
  | 'files:add'
  | 'params:change';

type Listener = (payload: unknown) => void;

const listeners: Record<EventName, Listener[]> = {
  'thread:create': [],
  'thread:open': [],
  'thread:rename': [],
  'message:send': [],
  'message:success': [],
  'message:error': [],
  'files:add': [],
  'params:change': [],
};

export const telemetry = {
  tokens: 0,
  attachmentsSuccess: 0,
};

export function trackTokens(count: number) {
  if (Number.isFinite(count)) telemetry.tokens += count;
}

export function trackAttachmentSuccess() {
  telemetry.attachmentsSuccess += 1;
}

export function on(event: EventName, fn: Listener) {
  listeners[event].push(fn);
}

export function emit(event: EventName, payload: unknown) {
  for (const fn of listeners[event]) fn(payload);
  if (event === 'message:error') {
    console.warn('message:error', payload);
  }
}
