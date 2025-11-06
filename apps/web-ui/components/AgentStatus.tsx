'use client';

import { useSession } from '../lib/SessionStore';

export default function AgentStatus() {
  const { mode, agent } = useSession();
  const direct = mode === 'Direct';
  return (
    <div
      className={`agent-status ${direct ? 'direct' : 'mediated'}`}
      aria-label="Agent status"
      data-testid="agent-status"
    >
      <span className="badge-mode">{mode}</span>
      <span className="sep">·</span>
      <span className="badge-agent">{agent}</span>
    </div>
  );
}
