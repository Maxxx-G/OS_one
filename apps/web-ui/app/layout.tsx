import React from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import AgentToolbar from '@/components/AgentToolbar';
import LeftNav from '@/components/LeftNav';
import RightPane from '@/components/RightPane';
import ChatPane from '@/components/ChatPane';

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
        <Providers>
          <AgentToolbar />
          {/* 3-pane shell: left 280 / center / right 360 */}
          <div className="os-container">
            <div className="os-grid" aria-label="OS One 3-pane grid">
              <aside aria-label="Left Navigation" className="rail left-rail">
                <LeftNav />
              </aside>
              <main aria-label="Main Work Area" className="main-pane">
                {/* Phase-1: default chat pane; keep {children} for routes */}
                <ChatPane />
                {children}
              </main>
              <aside aria-label="Right Controls" className="rail right-rail">
                <RightPane />
              </aside>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
