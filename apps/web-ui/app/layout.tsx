import React from 'react';
import './globals.css';
import type { Metadata } from 'next';
import GlobalClient from './GlobalClient';
import { Providers } from './providers';
import AgentToolbar from '@/components/AgentToolbar';
import LeftNav from '@/components/LeftNav';
import RightPane from '@/components/RightPane';
import AlphaSort from '@/components/AlphaSort';
import AuditSink from '@/components/AuditSink';
import AuditFooter from '@/components/AuditFooter';
import BmadDock from '@/components/BmadDock';
import ChatSequencer from '@/components/ChatSequencer';
import VoiceOverlay from '@/components/VoiceOverlay';
import FooterStatus from '@/components/FooterStatus';
import ReasoningLoop from '@/components/ReasoningLoop';
import SecCommsBadge from '../src/components/SecCommsBadge';
import OverwatchSidebar from '../components/OverwatchSidebar';
import { SessionProvider } from '../lib/SessionStore';

// NOTE: UI skeleton aligns with design drafts located at:
// D:\\OS_One\\kb\\design\\ui_ux\\drafts
// Always cross-check with these mockups before extending UI.
export const metadata: Metadata = {
  title: 'OS One',
  description: 'Assistant-mediated AI interface',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Global client shim mounts first to run SEC-COMMS dev auto-ack before any interactive components */}
        <GlobalClient />
        <OverwatchSidebar />
        <Providers>
          <SessionProvider>
            <AgentToolbar />
            {/* 3-pane shell: left 280 / center / right 360 */}
            <div className="os-container">
              <div className="os-grid" aria-label="OS One 3-pane grid">
                {/* left navigation rail (styled). LeftNav marks groups with data-sort="alpha" for runtime ordering. */}
                <aside aria-label="Left Navigation" className="rail left-rail">
                  <LeftNav />
                </aside>
                <main aria-label="Main Work Area" className="main-pane">
                  <section className="main-card" aria-label="Chat workspace">
                    {/* ChatSequencer owns message list + composer; children pass through for legacy routes */}
                    <ChatSequencer>{children}</ChatSequencer>
                  </section>
                </main>
                {/* right rail ... Files/Values panels. FilesPanel applies data-sort="alpha" to its list. */}
                <aside aria-label="Right Controls" className="rail right-rail">
                  <RightPane />
                </aside>
              </div>
            </div>
            {/* mount helpers */}
            <AlphaSort />
            {/* Phase-1 mini audit sink (visual only). Emit via window.os1Audit.log(type, data) */}
            <AuditSink />
            {/* BMAD Brainstorm Dock (UI-only) */}
            <BmadDock />
            {/* Phase-1 audit footer label (visual only); Phase-2 will inject live mode */}
            <AuditFooter mode="Mediated" />
            <VoiceOverlay />
            {/* Launch readiness: Mediated/Direct + provider + health */}
            <FooterStatus />
            {/* Voice Phase 3: Reasoning loop toggle (Alt+R) */}
            <ReasoningLoop />
            {/* SEC-COMMS dev auto-ack badge (localhost only) */}
            <SecCommsBadge />
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
