'use client';

import { spawnFromOnboarding } from '../../lib/personas/personas';

export default function PersonaCloneButtons() {
  function clone(kind: 'assistant' | 'agent') {
    const w = window as any;
    const data = w?.os1Onboarding?.data || {};

    const created = spawnFromOnboarding(kind, {
      userName: data.userName || 'User',
      bizFocus: data.bizFocus || ['growth'],
      dob: data.dob,
    });

    // Optional toast via console for now
    console.info('[Persona] created:', created.id);

    // Trigger refresh of persona selector
    window.dispatchEvent(new CustomEvent('os1:persona:created', { detail: { id: created.id } }));
  }

  return (
    <div className="flex items-center gap-1">
      <button
        className="text-[10px] px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
        onClick={() => clone('assistant')}
        title="Clone new assistant from Gabriel template"
      >
        Clone Assistant
      </button>
      <button
        className="text-[10px] px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700"
        onClick={() => clone('agent')}
        title="Clone new agent from Gabriel template"
      >
        Clone Agent
      </button>
    </div>
  );
}
