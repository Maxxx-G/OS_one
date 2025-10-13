'use client';
import React from 'react';
import { useAgentState } from '@/app/providers';
import AgentStatusChip from './AgentStatusChip';
import QuickTest from './QuickTest';
import ContextPill from './ContextPill';
import SecCommsPill from './SecCommsPill';
import SessionControls from './SessionControls';
import HealthPill from './HealthPill';

function openOnboarding() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('os1:onboarding:open'));
  }
}

export default function AgentToolbar() {
  const { available, current, setAgent, mode, toggleMode } = useAgentState();
  return (
    <div className="flex w-full flex-col gap-2 rounded-xl border bg-white/60 p-3 shadow-sm backdrop-blur">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AgentStatusChip />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm opacity-70" htmlFor="qs">
            Agent
          </label>
          <select
            id="qs"
            className="rounded-md border px-2 py-1 text-sm"
            value={current}
            onChange={(event) => setAgent(event.target.value as any)}
          >
            {available.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.label} {agent.type === 'external' ? '[ext]' : '[local]'}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={toggleMode}
            className="ml-2 rounded-md border px-3 py-1 text-sm"
            aria-pressed={mode === 'direct'}
            title="Toggle Direct Agent mode (debug/high-trust only)"
          >
            {mode === 'direct' ? 'Direct: ON' : 'Direct: OFF'}
          </button>{' '}
          <QuickTest />
          <SecCommsPill />
          <HealthPill />
          <button
            type="button"
            onClick={openOnboarding}
            className="rounded-md border px-2 py-1 text-sm"
            title="Reopen the onboarding tour"
          >
            Help
          </button>
          <ContextPill />
        </div>
      </div>
      <SessionControls />
    </div>
  );
}
