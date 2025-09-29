'use client';
import React from 'react';
import { useAgentState } from '@/app/providers';

export default function AgentStatusChip() {
  const { current, available, mode } = useAgentState();
  const meta = available.find((a) => a.id === current)!;
  const pill = mode === 'mediated' ? 'Mediated' : 'Direct';
  return (
    <span
      title={`${meta.label} � ${meta.type === 'external' ? 'External' : 'Local'} � ${pill}`}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
    >
      <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
      <span>{meta.label}</span>
      <span className="text-xs opacity-70">({meta.type})</span>
      <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs">{pill}</span>
    </span>
  );
}
