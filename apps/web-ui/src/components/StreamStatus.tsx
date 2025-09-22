import React from 'react';
import { useProvider } from '../state/ProviderContext';

export const StreamStatus: React.FC = () => {
  const { streamStatus } = useProvider();
  let color = '#888';
  if (streamStatus === 'streaming') color = '#09f';
  if (streamStatus === 'done') color = '#0a0';
  if (streamStatus === 'error') color = '#c00';
  return <span style={{ color, fontWeight: 'bold' }}>Stream: {streamStatus}</span>;
};
