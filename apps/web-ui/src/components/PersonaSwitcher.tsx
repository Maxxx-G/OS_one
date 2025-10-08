'use client';

import { useEffect, useState } from 'react';
import {
  Personas,
  loadActivePersonaId,
  setActivePersonaId,
} from '../../lib/personas/personas';

export default function PersonaSwitcher() {
  const [id, setId] = useState<string>('gabriel');

  useEffect(() => {
    setId(loadActivePersonaId());
  }, []);

  const active = Personas[id] || Personas.gabriel;
  const entries = Object.values(Personas);

  return (
    <div className="flex items-center gap-2">
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
    </div>
  );
}
