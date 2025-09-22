import React from 'react';
import { ProviderSelector } from './ProviderSelector';
import { ModelTransportToggle } from './ModelTransportToggle';
import { StreamStatus } from './StreamStatus';

export const ProviderBar: React.FC = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: 8, borderBottom: '1px solid #eee' }}>
    <ProviderSelector />
    <ModelTransportToggle />
    <StreamStatus />
  </div>
);
