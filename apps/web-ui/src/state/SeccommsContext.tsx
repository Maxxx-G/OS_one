import React, { createContext, useContext, useEffect, useState } from 'react';

export type SeccommsMode = 'local_only' | 'seccomms_on';
type State = {
  mode: SeccommsMode;
  pinnedPeer: string; // hex fingerprint to match when ON
  expiresAt: number | null; // epoch ms; auto-revert when elapsed
  setMode: (m: SeccommsMode) => void;
  setPinnedPeer: (f: string) => void;
  arm: (seconds: number) => void; // start timebox
};

const Ctx = createContext<State | null>(null);
const LS_KEY = 'os1:seccomms';

export const SeccommsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<SeccommsMode>('local_only');
  const [pinnedPeer, setPinnedPeerState] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw) {
        const v = JSON.parse(raw);
        setModeState(v.mode ?? 'local_only');
        setPinnedPeerState(v.pinnedPeer ?? '');
        setExpiresAt(v.expiresAt ?? null);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const v = { mode, pinnedPeer, expiresAt };
    window.localStorage.setItem(LS_KEY, JSON.stringify(v));
  }, [mode, pinnedPeer, expiresAt]);

  // auto-revert on expiry
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => {
      if (Date.now() >= expiresAt) {
        setModeState('local_only');
        setExpiresAt(null);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const setMode = (m: SeccommsMode) => setModeState(m);
  const setPinnedPeer = (f: string) => setPinnedPeerState(f.trim().toLowerCase());
  const arm = (seconds: number) => setExpiresAt(Date.now() + Math.max(0, seconds) * 1000);

  // expose for server headers (optional)
  (globalThis as any).os1_seccomms_mode = mode;
  (globalThis as any).os1_seccomms_peer = pinnedPeer;

  return (
    <Ctx.Provider value={{ mode, pinnedPeer, expiresAt, setMode, setPinnedPeer, arm }}>
      {children}
    </Ctx.Provider>
  );
};

export const useSeccomms = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('SeccommsContext missing');
  return v;
};
