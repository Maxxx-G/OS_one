import { Personas, loadActivePersonaId } from './personas';

export interface ReasonPayload {
  transcript: string;
  intent?: string;
  previousQuestion?: string | null;
  conversation_context?: string | null;
}

export async function postReasonWithPersona(payload: ReasonPayload) {
  const id = loadActivePersonaId();
  const persona = Personas[id] || Personas.gabriel;

  const body = {
    ...payload,
    persona_id: persona.id,
    systemPreamble: persona.systemPreamble,
    voiceId: persona.profile.voiceId,
  };

  const r = await fetch('/api/voice/reason', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  return r;
}
