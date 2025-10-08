import type { VoiceIntent } from './intent';

export type IntentRoute = {
  intent: VoiceIntent;
  payload?: Record<string, unknown>;
};

/**
 * Maps classified voice intents to action payloads.
 * Returns null for 'none' intent or unrecognized intents.
 */
export function routeIntent(intent: VoiceIntent, transcript: string): IntentRoute | null {
  switch (intent) {
    case 'overwatch.pause':
      return { intent, payload: { reason: 'user_request', transcript } };
    
    case 'overwatch.resume':
      return { intent, payload: { resume: true, transcript } };
    
    case 'open.settings':
      return { intent, payload: { ui: 'settings', transcript } };
    
    case 'none':
    default:
      return null;
  }
}
