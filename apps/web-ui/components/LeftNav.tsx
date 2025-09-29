'use client';
import React from 'react';
import { useAgentState } from '@/app/providers';

type ModuleId = 'home' | 'seccomms';
const NAV_ITEMS: Array<{ id: ModuleId; label: string }> = [
  { id: 'home', label: 'New Chat' },
  { id: 'seccomms', label: 'SEC-COMMS' },
];

// Left navigation menu � aligns with draft UI designs in D:\\OS_One\\kb\\design\\ui_ux\\drafts
export default function LeftNav() {
  const { ui } = useAgentState();

  return (
    <aside role="navigation" aria-label="LeftRail" className="flex flex-col gap-3">
      <div className="text-xs font-semibold opacity-70">OS One</div>
      <div className="flex flex-col">
        {NAV_ITEMS.map((item) => {
          const active = ui.activeModule === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => ui.setActiveModule(item.id)}
              className="mb-1 w-full rounded-md border px-3 py-2 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
              aria-pressed={active}
              data-active={active || undefined}
            >
              {item.label}
            </button>
          );
        })}
        <button className="mb-1 w-full rounded-md border px-3 py-2 text-left text-sm">
          Search
        </button>
        <button className="mb-1 w-full rounded-md border px-3 py-2 text-left text-sm">Notes</button>
        <button className="mb-1 w-full rounded-md border px-3 py-2 text-left text-sm">
          Workspace
        </button>
      </div>

      <div className="text-xs font-semibold opacity-70">Agents</div>
      <div className="flex flex-col">
        <button className="mb-1 w-full rounded-md border px-3 py-2 text-left text-sm">
          Gabriel Tanner
        </button>
        <button className="mb-1 w-full rounded-md border px-3 py-2 text-left text-sm">ADA</button>
      </div>

      <div className="text-xs font-semibold opacity-70">Channels</div>
      <div className="text-xs opacity-70">Chats</div>
      <div className="max-h-[260px] overflow-auto pr-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <button key={index} className="mb-1 w-full rounded-md border px-3 py-2 text-left text-sm">
            Sample thread {index + 1}
          </button>
        ))}
      </div>

      <div className="sr-only" aria-live="polite" />
    </aside>
  );
}
