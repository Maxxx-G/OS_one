'use client';

import React from 'react';
import { useSession } from '@/lib/SessionStore';

type VoicePhase = 'muted' | 'idle' | 'listening' | 'speaking' | 'streaming';

const LABELS: Record<VoicePhase, string> = {
  muted: 'Muted',
  idle: 'Idle',
  listening: 'Listening...',
  speaking: 'Speaking...',
  streaming: 'Streaming...',
};

const LEGENDS: Record<VoicePhase, string> = {
  muted: 'TTS disabled',
  idle: 'Ready for input',
  listening: 'Recording audio',
  speaking: 'Playing response',
  streaming: 'Receiving audio',
};

function mapPhase(raw: unknown): VoicePhase {
  if (typeof raw !== 'string') {
    return 'idle';
  }
  const value = raw.toLowerCase();
  if (value === 'muted') {
    return 'muted';
  }
  if (value === 'streaming') {
    return 'streaming';
  }
  if (value === 'speaking') {
    return 'speaking';
  }
  if (value === 'rec' || value === 'recording' || value === 'listening') {
    return 'listening';
  }
  return 'idle';
}

export default function VoiceOverlay() {
  const { voiceStatus } = useSession();
  const [globalPhase, setGlobalPhase] = React.useState<VoicePhase>('idle');
  const [forcedMuted, setForcedMuted] = React.useState(false);
  const [showHints, setShowHints] = React.useState(false);

  // Alt+/ hotkey to toggle hints
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '/') {
        e.preventDefault();
        setShowHints((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    let previous: VoicePhase | null = null;
    const read = () => {
      const voice = (window as any).os1Voice;
      const raw = typeof voice?.get === 'function' ? voice.get() : voice?.voiceStatus;
      const next = mapPhase(raw);
      if (previous !== next) {
        previous = next;
        setGlobalPhase(next);
      }
    };
    read();
    const id = window.setInterval(read, 200);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.EventSource === 'undefined') {
      return;
    }
    let active = true;
    const source = new window.EventSource('/v1/audio/events');

    const handleStatus = (event: MessageEvent) => {
      if (!active) {
        return;
      }
      try {
        const payload = JSON.parse(event.data) as { status?: { tts_enabled?: boolean } };
        if (typeof payload?.status?.tts_enabled === 'boolean') {
          setForcedMuted(!payload.status.tts_enabled);
        }
      } catch {
        // ignore malformed payloads
      }
    };

    source.addEventListener('status', handleStatus as EventListener);
    source.onerror = () => {
      // keep silent; UI stays in last known state
    };

    return () => {
      active = false;
      source.removeEventListener('status', handleStatus as EventListener);
      source.close();
    };
  }, []);

  const displayPhase = React.useMemo<VoicePhase>(() => {
    if (forcedMuted) {
      return 'muted';
    }
    if (voiceStatus.ttsActive) {
      return 'speaking';
    }
    if (voiceStatus.sttActive) {
      return 'listening';
    }
    return globalPhase;
  }, [forcedMuted, voiceStatus.ttsActive, voiceStatus.sttActive, globalPhase]);

  const animate =
    displayPhase === 'speaking' || displayPhase === 'listening' || displayPhase === 'streaming';
  const waveClass = animate ? 'wave on' : 'wave';
  const overlayClass = `voice-overlay ${displayPhase}`;

  return (
    <>
      <div className={overlayClass} role="status" aria-live="polite">
        <div className={waveClass} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <span className="label">{LABELS[displayPhase]}</span>
      </div>
      <div className="voice-legend">
        <span className="voice-legend-text">{LEGENDS[displayPhase]}</span>
        <button
          className="voice-legend-btn"
          onClick={() => setShowHints((prev) => !prev)}
          title="Toggle hotkey hints (Alt+/)"
          aria-label="Toggle hotkey hints"
        >
          ?
        </button>
      </div>
      {showHints && (
        <div className="voice-hotkey-hints" role="complementary" aria-label="Keyboard shortcuts">
          <div className="hint-item">
            <kbd>Alt+M</kbd>
            <span>Mic</span>
          </div>
          <div className="hint-item">
            <kbd>Alt+R</kbd>
            <span>Reasoning</span>
          </div>
          <div className="hint-item">
            <kbd>Alt+A</kbd>
            <span>Audit</span>
          </div>
          <div className="hint-item">
            <kbd>Alt+P</kbd>
            <span>Palette</span>
          </div>
        </div>
      )}
    </>
  );
}
