'use client';
import { useState } from 'react';
export default function ValuesPanel() {
  const [prompt, setPrompt] = useState('');
  return (
    <section aria-label="Values Panel" className="card">
      <h3 className="card-title">Values</h3>
      <label htmlFor="sysPrompt" className="mb-1 block text-xs opacity-70">
        System Prompt
      </label>
      <textarea
        id="sysPrompt"
        className="input"
        placeholder="Enter system prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
      />
      <div className="actions">
        <button type="button" className="btn">
          Apply
        </button>
        <button type="button" className="btn">
          Revert
        </button>
      </div>
    </section>
  );
}
