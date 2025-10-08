'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Session = { mode: 'Mediated' | 'Direct'; agent: string };
type VoiceStatus = { sttActive: boolean; ttsActive: boolean };
type Ctx = Session & {
  voiceStatus: VoiceStatus;
  refresh: () => Promise<void>;
  setMode: (m: Session['mode']) => Promise<void>;
  setAgent: (a: string) => Promise<void>;
  setVoiceStatus: (next: Partial<VoiceStatus>) => void;
};

const ARCHON_URL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';
const C = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Session>({ mode: 'Mediated', agent: 'OpenAI [ext]' });
  const [voiceStatus, setVoiceStatusState] = useState<VoiceStatus>({
    sttActive: false,
    ttsActive: false,
  });

  async function refresh() {
    try {
      const res = await fetch(`${ARCHON_URL}/v1/session`, { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      setState({
        mode: json.mode === 'Direct' ? 'Direct' : 'Mediated',
        agent: String(json.agent || 'OpenAI [ext]'),
      });
    } catch {}
  }

  async function setMode(mode: Session['mode']) {
    let error: unknown;
    try {
      const res = await fetch(`${ARCHON_URL}/v1/session`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) {
        error = new Error(`setMode failed with status ${res.status}`);
      }
    } catch (err) {
      error = err;
    }
    await refresh();
    if (error) {
      throw error;
    }
  }

  async function setAgent(agent: string) {
    let error: unknown;
    try {
      const res = await fetch(`${ARCHON_URL}/v1/session`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ agent }),
      });
      if (!res.ok) {
        error = new Error(`setAgent failed with status ${res.status}`);
      }
    } catch (err) {
      error = err;
    }
    await refresh();
    if (error) {
      throw error;
    }
  }

  function setVoiceStatus(next: Partial<VoiceStatus>) {
    setVoiceStatusState((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({ ...state, voiceStatus, refresh, setMode, setAgent, setVoiceStatus }),
    [state, voiceStatus],
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useSession() {
  const v = useContext(C);
  if (!v) throw new Error('SessionProvider missing');
  return v;
}
