import React from 'react';
import { QuickSwitchBar, QUICK_AGENT_OPTIONS } from './QuickSwitchBar';
import { ModelTransportToggle } from './ModelTransportToggle';
import { StreamStatus } from './StreamStatus';
import { useProvider } from '../state/ProviderContext';
import { AgentStatus } from './AgentStatus';

const badgeLabel = (key: 'openai.responses' | 'ollama.openwebui', model: string) => {
  const preset = QUICK_AGENT_OPTIONS.find((opt) => opt.provider === key && opt.model === model);
  if (preset) return preset.label;
  if (key === 'openai.responses') return 'OpenAI - ' + model;
  return 'Ollama - ' + model;
};

export const ProviderBar: React.FC = () => {
  const { key, model, directAgentMode, setDirectAgentMode } = useProvider();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 8,
        borderBottom: '1px solid #eee',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              background: '#111827',
              color: '#f9fafb',
              borderRadius: 12,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.3,
              textTransform: 'uppercase',
            }}
          >
            Agent: {badgeLabel(key, model)}
          </span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={directAgentMode}
              onChange={(event) => setDirectAgentMode(event.target.checked)}
            />
            Direct Agent
          </label>
          <span style={{ fontSize: 11, color: '#6b7280' }}>
            Assistant mediated by default; local redaction always on.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ModelTransportToggle />
          <StreamStatus />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <QuickSwitchBar />
        <AgentStatus />
      </div>
    </div>
  );
};
