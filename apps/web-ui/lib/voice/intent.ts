export type VoiceIntent = 'overwatch.pause' | 'overwatch.resume' | 'open.settings' | 'none';

const rules: Array<[VoiceIntent, RegExp]> = [
  ['overwatch.pause', /\b(pause|hold|stop\s+(overwatch|listening|monitor))/i],
  ['overwatch.resume', /\b(resume|continue|start\s+(overwatch|listening|monitor))/i],
  ['open.settings', /\b(open|show)\s+(settings|prefs|preferences)/i],
];

export function classifyIntent(text: string): VoiceIntent {
  if (!text) return 'none';
  for (const [intent, rx] of rules) {
    if (rx.test(text)) return intent;
  }
  return 'none';
}
