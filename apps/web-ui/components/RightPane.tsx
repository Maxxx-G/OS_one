'use client';
import AgentStatus from './AgentStatus';
import ContextPill from './ContextPill';
import HelpOverlay from './HelpOverlay';
import SecCommsPill from './SecCommsPill';
import FilesPanel from './FilesPanel';
import ValuesPanel from './ValuesPanel';
import AdvancedParams from './AdvancedParams';
import NetStatus from './NetStatus';
import AuditTailPanel from './AuditTailPanel';
import PaletteToggle from './PaletteToggle';
import OverwatchConsole from './OverwatchConsole';
import OverwatchQueuePanel from './OverwatchQueuePanel';

export default function RightPane() {
  return (
    <aside role="complementary" aria-label="Right Controls" className="flex flex-col gap-12">
      <header className="right-rail-header">
        {/* Phase-1 skeletons: static values; Phase-2 will bind live session state */}
        <AgentStatus mode="Mediated" agentLabel="OpenAI [ext]" />
        <NetStatus />
        <button
          className="btn sm ghost"
          type="button"
          aria-label="Hotkeys help (?)"
          title="Hotkeys (press ?)"
          data-hotkey="?"
          onClick={() => (window as any).os1Hints?.show?.()}
        >
          ?
        </button>
        <PaletteToggle />
        <ContextPill />
        <HelpOverlay />
        <SecCommsPill />
        <AuditTailPanel />
      </header>
      <FilesPanel />
      <ValuesPanel />
      <AdvancedParams />
      <OverwatchConsole />
      <OverwatchQueuePanel />
      {/* BMAD Dock lives globally inside app layout */}
    </aside>
  );
}
