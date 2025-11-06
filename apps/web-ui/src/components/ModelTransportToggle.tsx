import React from 'react';
import { useProvider } from '../state/ProviderContext';

export const ModelTransportToggle: React.FC = () => {
  const { model, setModel } = useProvider();
  // For demo: just a text input, but could be a select in future
  return (
    <label>
      Model:
      <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model name" />
    </label>
  );
};
