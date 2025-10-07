'use client';

import { useEffect } from 'react';
import { initSecCommsDevAck } from '../lib/seccomms/devAck';

/**
 * GlobalClient
 * Mounts early (App Router layout) to ensure SEC-COMMS dev auto-ack runs
 * before any user interaction can trigger the blocking consent modal.
 */
export default function GlobalClient() {
  useEffect(() => {
    const dispose = initSecCommsDevAck();
    return () => { if (typeof dispose === 'function') dispose(); };
  }, []);
  return null;
}
