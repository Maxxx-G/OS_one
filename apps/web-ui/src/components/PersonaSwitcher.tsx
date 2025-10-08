'use client';

import { useEffect, useState } from 'react';
import {
  Personas,
  loadActivePersonaId,
  setActivePersonaId,
} from '../../lib/personas/personas';
import PersonaCloneButtons from './PersonaCloneButtons';

export default function PersonaSwitcher() {
  const [id, setId] = useState<string>('gabriel');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setId(loadActivePersonaId());
  }, []);

  // Listen for persona creation events
  useEffect(() => {
    const onCreated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setRefreshKey((k) => k + 1); // Force re-render to pick up new persona
      if (detail?.id) {
        setId(detail.id);
        setActivePersonaId(detail.id);
      }
    };
    window.addEventListener('os1:persona:created', onCreated as EventListener);
    return () => window.removeEventListener('os1:persona:created', onCreated as EventListener);
  }, []);

  const active = Personas[id] || Personas.gabriel;
  const entries = Object.values(Personas);

  return (
    <div className="flex items-center gap-2" key={refreshKey}>
      <select
        className="text-xs bg-neutral-800 rounded px-2 py-1"
        value={id}
        onChange={(e) => {
          const v = e.target.value;
          setId(v);
          setActivePersonaId(v);
        }}
      >
        {entries.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <span
        className="text-[10px] px-2 py-1 rounded bg-neutral-800"
        title="Voice pairing"
      >
        🎤 {active.profile.voiceId || 'default'}
      </span>
      
      {/* Quick creation from Gabriel's template */}
      <span className="opacity-50 text-[10px]">•</span>
      <span className="hidden sm:inline">
        <PersonaCloneButtons />
      </span>
    </div>
  );
}
