import React from 'react';
import { useProvider } from '../state/ProviderContext';

export const ProviderSelector: React.FC = () => {
  const { key, setKey, model, setModel, streamStatus } = useProvider();

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <label>
        Provider:
        <select value={key} onChange={(e) => setKey(e.target.value as any)}>
          <option value="openai.responses">OpenAI Responses</option>
          <option value="ollama.openwebui">Ollama/Open-WebUI</option>
        </select>
      </label>
      <label>
        Model:
        <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model name" />
      </label>
      <span>
        Stream: <b>{streamStatus}</b>
      </span>
    </div>
  );
};
