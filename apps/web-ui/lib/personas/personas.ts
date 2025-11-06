// Persona core: registry + cloning + persistence
import { deriveProfileFromOnboarding } from './onboarding';

export type Persona = {
  id: string;
  name: string;
  kind: 'assistant' | 'agent';
  profile: { voiceId?: string; tone?: string; bio?: string; traits?: string[] };
  systemPreamble: string; // injected into /reason
};

export type Onboarding = { userName?: string; bizFocus?: string[]; dob?: string };

const LS = { persona: 'os1.prefs.persona_id' };

// SSR-safe localStorage + event helpers
const isBrowser = typeof window !== 'undefined';
const lsGet = (k: string) => { try { return isBrowser ? localStorage.getItem(k) : null; } catch { return null; } };
const lsSet = (k: string, v: string) => { try { if (isBrowser) localStorage.setItem(k, v); } catch {} };
const emit = (name: string, detail: any) => { try { if (isBrowser) window.dispatchEvent(new CustomEvent(name, { detail })); } catch {} };

export const Personas: Record<string, Persona> = {
  gabriel: {
    id: 'gabriel',
    name: 'Gabriel',
    kind: 'assistant',
    profile: {
      voiceId: 'baritone_01',
      tone: 'mentor',
      bio: 'Default OS One assistant',
      traits: ['decisive', 'protective'],
    },
    systemPreamble: 'You are Gabriel Tanner… strategic, protective, entrepreneurial.',
  },
};

export function loadActivePersonaId() {
  return lsGet(LS.persona) || 'gabriel';
}

export function setActivePersonaId(id: string) {
  lsSet(LS.persona, id);
  emit('os1:prefs:update', { persona_id: id });
}

export function cloneFromTemplate(template: Persona, seed: Partial<Persona>): Persona {
  const id = (seed.id || `${template.id}_${Math.random().toString(36).slice(2, 8)}`).toLowerCase();
  return {
    ...template,
    ...seed,
    id,
    name: seed.name || template.name,
    profile: { ...template.profile, ...seed.profile },
  };
}

// Gabriel's powers:
export function createAssistantFromTemplate(seed: Partial<Persona>) {
  const p = cloneFromTemplate(Personas.gabriel, { ...seed, kind: 'assistant' });
  Personas[p.id] = p;
  return p;
}

export function createAgentFromTemplate(seed: Partial<Persona>) {
  const p = cloneFromTemplate(Personas.gabriel, { ...seed, kind: 'agent' });
  Personas[p.id] = p;
  return p;
}

// Onboarding-driven population (+ horoscope projection hook)
export function spawnFromOnboarding(kind: 'assistant' | 'agent', ob: Onboarding) {
  const seed = deriveProfileFromOnboarding(ob, kind);
  const p = kind === 'assistant'
    ? createAssistantFromTemplate(seed)
    : createAgentFromTemplate(seed);
  emit('os1:persona:created', { id: p.id });
  return p;
}
