// Onboarding → persona profile (+ horoscope projection to "prosperity")
import type { Persona, Onboarding } from './personas';

function horoscopeTone(dob?: string) {
  return dob ? 'prosperity-forward' : 'optimistic';
}

export function deriveProfileFromOnboarding(
  ob: Onboarding,
  kind: Persona['kind']
): Partial<Persona> {
  const tone = horoscopeTone(ob.dob);
  const traits = ['entrepreneurial', 'supportive', kind === 'agent' ? 'tactical' : 'advisory'];
  const bio = `Built from onboarding for ${ob.userName || 'User'}; focuses on ${ob.bizFocus?.join(', ') || 'growth'}.`;

  return {
    name: kind === 'agent' ? 'Field Agent' : 'Studio Assistant',
    profile: { voiceId: kind === 'agent' ? 'baritone_02' : 'alto_01', tone, bio, traits },
    systemPreamble: `Champion the user's prosperity via practical, upbeat guidance; emphasize ${ob.bizFocus?.join(', ') || 'value creation'}.`,
  };
}
