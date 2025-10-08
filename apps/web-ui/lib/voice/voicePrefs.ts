// Simple local prefs for TTS voice + persona link
const K = { voice: 'os1.tts.voice_id', link: 'os1.tts.link_persona' };

export function getVoiceId() {
  try {
    return localStorage.getItem(K.voice) || '';
  } catch {
    return '';
  }
}

export function setVoiceId(id: string) {
  try {
    localStorage.setItem(K.voice, id);
    window.dispatchEvent(new CustomEvent('os1:tts:voice:set', { detail: { voiceId: id } }));
  } catch {}
}

export function isLinkedToPersona() {
  try {
    return (localStorage.getItem(K.link) || '1') === '1';
  } catch {
    return true;
  }
}

export function setLinkedToPersona(on: boolean) {
  try {
    localStorage.setItem(K.link, on ? '1' : '0');
    window.dispatchEvent(new CustomEvent('os1:tts:link:set', { detail: { on } }));
  } catch {}
}
