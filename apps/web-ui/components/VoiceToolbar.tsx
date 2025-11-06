'use client';

import React from 'react';

interface VoiceToolbarProps {
  sttActive: boolean;
  ttsActive: boolean;
  onToggle: () => void;
}

export default function VoiceToolbar({ sttActive, ttsActive, onToggle }: VoiceToolbarProps) {
  const [voiceStatus, setVoiceStatus] = React.useState<string>('idle');

  // Poll for voice status changes
  React.useEffect(() => {
    const interval = setInterval(() => {
      const status = (window as any).os1Voice?.get?.();
      if (status) {
        setVoiceStatus(status);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="voice-toolbar fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-neutral-800/80 px-3 py-2 text-sm text-white shadow-lg">
      <span>{sttActive ? '🎙️ Listening' : '🎤 Mic Off'}</span>
      <span>{ttsActive ? '🔊 Speaking' : '🔇 Silent'}</span>
      {voiceStatus === 'muted' && <span className="text-amber-400">Muted</span>}
      {voiceStatus === 'speaking' && <span className="text-blue-400">TTS…</span>}
      <button
        type="button"
        onClick={onToggle}
        className="ml-2 rounded-lg bg-emerald-600 px-3 py-1 font-semibold text-white transition hover:bg-emerald-700"
      >
        {sttActive ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}
