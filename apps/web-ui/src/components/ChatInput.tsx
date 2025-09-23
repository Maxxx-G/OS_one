import React, { useState } from 'react';
import { useChatRun } from '../hooks/useChatRun';

export const ChatInput: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const { output, run } = useChatRun();

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await run(prompt.trim());
  };

  return (
    <div className="p-3 border-t grid gap-2">
      <form onSubmit={onSend} className="flex gap-2">
        <input
          className="border rounded px-3 py-2 flex-1"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type a prompt… (uses current provider/model)"
        />
        <button className="border rounded px-3 py-2" type="submit">
          Send
        </button>
      </form>
      <div className="text-sm text-gray-500">
        <span className="font-medium">Last output:</span> {output || '—'}
      </div>
    </div>
  );
};
