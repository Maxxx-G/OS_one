'use client';
import React from 'react';
import { useAgentState } from '@/app/providers';

export default function FooterMode() {
  const { mode, current } = useAgentState();
  return (
    <div className="inline-flex items-center gap-2">
      <span className="rounded-full border px-2 py-0.5 text-xs">
        {mode === 'direct' ? 'Direct' : 'Mediated'}
      </span>
      <span className="text-xs opacity-70">agent: {current}</span>
    </div>
  );
}
