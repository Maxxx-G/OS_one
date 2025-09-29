'use client';
import React, { useEffect, useRef, useState } from 'react';

const INITIAL_MESSAGES: Array<{ role: 'assistant' | 'user'; content: string; ts?: number }> = [];

export default function ChatPane() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  function onKey(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!busy) send();
    }
  }

  async function send() {
    const text = input.trim();
    if (!text) return;
    setBusy(true);
    setMessages((prev) => [...prev, { role: 'user', content: text, ts: Date.now() }]);
    setInput('');

    await new Promise((resolve) => setTimeout(resolve, 200));

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `Echo: ${text}`,
        ts: Date.now(),
      },
    ]);
    setBusy(false);
  }

  return (
    <div className="flex h-full flex-col" aria-label="Chat Surface">
      <div
        ref={scroller}
        className="min-h-[360px] flex-1 overflow-auto rounded-md border p-3"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="text-sm opacity-60">Say hello to start�</div>
        ) : (
          messages.map((message, index) => {
            const right = message.role === 'user';
            return (
              <div key={index} className={'mb-3 flex ' + (right ? 'justify-end' : 'justify-start')}>
                <div className={'max-w-[70%] ' + (right ? 'text-right' : 'text-left')}>
                  <div className="text-[11px] opacity-60">
                    {message.role}
                    {message.ts ? ` � ${new Date(message.ts).toLocaleTimeString()}` : ''}
                  </div>
                  <div
                    className={
                      'rounded-md p-2 text-sm ' +
                      (right
                        ? 'bg-blue-100 border border-blue-200'
                        : 'bg-black/5 border border-black/10')
                    }
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <textarea
          className="w-full min-h-[40px] max-h-[160px] rounded-md border px-3 py-2 text-sm"
          placeholder="Get a detailed report"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKey}
          aria-label="Composer"
        />
        <button
          type="button"
          className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
          onClick={() => void send()}
          disabled={busy || !input.trim()}
        >
          {busy ? 'Sending�' : 'Send'}
        </button>
        <button
          type="button"
          className="rounded-md border px-3 py-2 text-sm"
          disabled
          aria-label="Mic (stub)"
        >
          ???
        </button>
      </div>
    </div>
  );
}
