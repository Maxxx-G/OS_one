import React, { useState } from 'react';
import { useAuth } from '../state/AuthContext';
import { scoreSalience } from '../lib/salience';

export const RememberButton: React.FC<{ prompt: string; text: string }> = ({ prompt, text }) => {
  const { userId, token } = useAuth();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'err'>('idle');
  const [lastScore] = useState<number>(() => scoreSalience({ prompt, output: text }));

  const onRemember = async () => {
    if (!token || !userId || !text?.trim()) return;
    setStatus('saving');
    const res = await fetch('/api/memory/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        user_id: userId,
        title: (prompt || text).slice(0, 80),
        content: text,
        tags: ['manual'],
        salience: lastScore,
      }),
    });
    setStatus(res.ok ? 'saved' : 'err');
  };

  const disabled = !token || !userId || !text?.trim();
  return (
    <div className="flex items-center gap-2">
      <button
        className="border rounded px-2 py-1 text-sm disabled:opacity-50"
        disabled={disabled || status === 'saving'}
        title={!token ? 'Paste a JWT in AuthBar to enable' : 'Store to semantic_memories'}
        onClick={onRemember}
      >
        Remember
      </button>
      <span className="text-xs text-gray-500">salience: {lastScore.toFixed(2)}</span>
      {status === 'saved' && <span className="text-xs text-green-700">saved</span>}
      {status === 'err' && <span className="text-xs text-red-700">error</span>}
    </div>
  );
};
