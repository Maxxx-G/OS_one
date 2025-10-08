'use client';

import { useEffect } from 'react';
import { initSecCommsDevAck } from '../lib/seccomms/devAck';
import { overwatchUI } from '../store/overwatchUI';

/**
 * GlobalClient
 * Mounts early (App Router layout) to ensure SEC-COMMS dev auto-ack runs
 * before any user interaction can trigger the blocking consent modal.
 * Also sets up global keyboard shortcuts.
 */
export default function GlobalClient() {
  useEffect(() => {
    const dispose = initSecCommsDevAck();

    // --- Alt + O hotkey to toggle Overwatch ---
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        overwatchUI.toggle();
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      if (typeof dispose === 'function') dispose();
      window.removeEventListener('keydown', onKey);
    };
  }, []);
  return null;
}
