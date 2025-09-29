'use client';
import React, { createContext, useContext, useMemo, useState } from 'react';

type AgentId = 'openai' | 'ollama';
type Mode = 'mediated' | 'direct';
type ModuleId = 'home' | 'seccomms';

type AgentState = {
  current: AgentId;
  mode: Mode;
  available: { id: AgentId; label: string; type: 'external' | 'local' }[];
  setAgent: (id: AgentId) => void;
  toggleMode: () => void;
  ui: {
    activeModule: ModuleId;
    setActiveModule: (module: ModuleId) => void;
  };
};

const AgentCtx = createContext<AgentState | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<AgentId>('openai');
  const [mode, setMode] = useState<Mode>('mediated');
  const [activeModule, setActiveModule] = useState<ModuleId>('home');

  const available = useMemo(
    () => [
      { id: 'openai' as const, label: 'OpenAI', type: 'external' as const },
      { id: 'ollama' as const, label: 'Ollama', type: 'local' as const },
    ],
    [],
  );

  async function audit(event: string, data: Record<string, unknown>) {
    try {
      await fetch('/api/audit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ event, ...data }),
      });
    } catch {
      // dev-only sink
    }
  }

  const value: AgentState = {
    current,
    mode,
    available,
    setAgent: (id) => {
      setCurrent(id);
      audit('agent.switch', { to: id });
    },
    toggleMode: () => {
      const next = mode === 'mediated' ? 'direct' : 'mediated';
      setMode(next);
      audit('agent.mode', { to: next });
    },
    ui: {
      activeModule,
      setActiveModule: (module) => {
        setActiveModule(module);
        audit('ui.module', { to: module });
      },
    },
  };

  return <AgentCtx.Provider value={value}>{children}</AgentCtx.Provider>;
}

export function useAgentState() {
  const ctx = useContext(AgentCtx);
  if (!ctx) throw new Error('useAgentState must be used within <Providers>');
  return ctx;
}
