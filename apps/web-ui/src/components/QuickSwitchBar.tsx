import React from 'react';
import { useProvider } from '../state/ProviderContext';

export type QuickAgentOption = {
  id: string;
  label: string;
  provider: 'openai.responses' | 'ollama.openwebui';
  model: string;
};

export const QUICK_AGENT_OPTIONS: QuickAgentOption[] = [
  { id: 'gpt-5', label: 'GPT-5', provider: 'openai.responses', model: 'gpt-5-mini' },
  { id: 'claude', label: 'Claude', provider: 'openai.responses', model: 'claude-3-opus' },
  {
    id: 'deepseek-r1',
    label: 'DeepSeek-R1',
    provider: 'ollama.openwebui',
    model: 'deepseek-r1:8b',
  },
  { id: 'llava-llama3', label: 'LLaVA', provider: 'ollama.openwebui', model: 'llava-llama3:8b' },
];

export const QuickSwitchBar: React.FC = () => {
  const { key, model, setKey, setModel } = useProvider();

  const handleSwitch = (opt: QuickAgentOption) => {
    let changed = false;
    if (key !== opt.provider) {
      setKey(opt.provider);
      changed = true;
    }
    if (model !== opt.model) {
      setModel(opt.model);
      changed = true;
    }
    if (changed && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('agent-status:reset'));
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginTop: 4,
      }}
    >
      {QUICK_AGENT_OPTIONS.map((opt) => {
        const active = key === opt.provider && model === opt.model;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleSwitch(opt)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: active ? '2px solid #1f2937' : '1px solid #d1d5db',
              background: active ? '#1f2937' : '#f9fafb',
              color: active ? '#ffffff' : '#111827',
              fontSize: 12,
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
