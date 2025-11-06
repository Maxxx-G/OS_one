'use client';
import React from 'react';
import { useAgentState } from '@/app/providers';

type ModuleId = 'home' | 'seccomms';
const NAV_ITEMS: Array<{ id: ModuleId; label: string }> = [
  { id: 'home', label: 'New Chat' },
  { id: 'seccomms', label: 'SEC-COMMS' },
];

const UTILITY_ITEMS: Array<{ id: string; label: string }> = [
  { id: 'search', label: 'Search' },
  { id: 'notes', label: 'Notes' },
  { id: 'workspace', label: 'Workspace' },
];

const AGENT_NAMES: string[] = ['Gabriel Tanner', 'ADA'];

const SECTION_LABEL_CLASS = 'text-xs font-medium opacity-70';
const BASE_BUTTON_CLASS =
  'nav-item mb-1 w-full rounded-md px-3 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-black';

// Left navigation menu -- aligns with draft UI designs in D:\\OS_One\\kb\\design\\ui_ux\\drafts
export default function LeftNav() {
  const { ui } = useAgentState();

  return (
    <aside role="navigation" aria-label="LeftRail" className="flex flex-col gap-3">
      <div className={SECTION_LABEL_CLASS}>OS One</div>
      <div className="flex flex-col" data-sort="alpha">
        {NAV_ITEMS.map((item) => {
          const active = ui.activeModule === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => ui.setActiveModule(item.id)}
              className={BASE_BUTTON_CLASS}
              aria-pressed={active}
              data-active={active || undefined}
            >
              {item.label}
            </button>
          );
        })}
        {UTILITY_ITEMS.map((item) => (
          <button key={item.id} type="button" className={BASE_BUTTON_CLASS}>
            {item.label}
          </button>
        ))}
      </div>

      <div className={SECTION_LABEL_CLASS}>Agents</div>
      <div className="flex flex-col" data-sort="alpha">
        {AGENT_NAMES.map((name) => (
          <button key={name} type="button" className={BASE_BUTTON_CLASS}>
            {name}
          </button>
        ))}
      </div>

      <div className={SECTION_LABEL_CLASS}>Channels</div>
      <div className="text-xs opacity-70">Chats</div>
      <div className="max-h-[260px] overflow-auto pr-1" data-sort="alpha">
        {Array.from({ length: 8 }).map((_, index) => (
          <button key={index} type="button" className={BASE_BUTTON_CLASS}>
            Sample thread {index + 1}
          </button>
        ))}
      </div>

      <div className="sr-only" aria-live="polite" />
    </aside>
  );
}
