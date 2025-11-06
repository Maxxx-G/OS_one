import React, { useState } from 'react';
import { useStreamRun } from '../hooks/useStreamRun';

export const StreamOutput: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const { text, runStream } = useStreamRun();

  return (
    <div className="p-3 border-t grid gap-2">
      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 flex-1"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Stream a reply…"
        />
        <button className="border rounded px-3 py-2" onClick={() => prompt && runStream(prompt)}>
          Stream
        </button>
      </div>
      <pre className="text-sm whitespace-pre-wrap">{text || '—'}</pre>
    </div>
  );
};
