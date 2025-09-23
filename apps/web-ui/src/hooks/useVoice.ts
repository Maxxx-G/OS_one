export type VoiceState = 'idle' | 'listening' | 'error';

export const useVoice = () => {
  const Recognition = (typeof window !== 'undefined')
    ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    : null;

  let rec: any = null;
  let onResultCb: ((t: string, final: boolean) => void) | null = null;

  const start = (lang = 'en-US') => {
    if (!Recognition) return { ok: false, reason: 'no_speech_api' };
    rec = new Recognition();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      let txt = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        txt += e.results[i][0].transcript;
        const isFinal = e.results[i].isFinal;
        onResultCb && onResultCb(txt, isFinal);
      }
    };
    rec.onerror = (_e: any) => { /* swallow, UI handles */ };
    rec.start();
    return { ok: true };
  };

  const stop = () => { try { rec?.stop(); } catch {} };

  const onResult = (fn: (t: string, final: boolean) => void) => { onResultCb = fn; };

  const supported = !!Recognition;
  return { start, stop, onResult, supported };
};
