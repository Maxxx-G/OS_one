'use client';

import { useEffect, useState } from 'react';

/**
 * Shows "SEC-COMMS AUTO-ACK (dev)" pill when dev auto-ack is active.
 * Only visible on localhost or when NEXT_PUBLIC_SEC_COMMS_DEV=1.
 * Hidden in production builds.
 */
export default function SecCommsBadge() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Check if we're on localhost or dev flag is set
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const devFlag = process.env.NEXT_PUBLIC_SEC_COMMS_DEV === '1';

    if (!isLocalhost && !devFlag) {
      return; // Hidden in prod
    }

    // Listen for dev-ack initialization event
    const onDevAck = () => setActive(true);
    window.addEventListener('os1:seccomms:devack:init', onDevAck);

    // Check if already initialized
    if ((window as any).__os1_seccomms_devack_active) {
      setActive(true);
    }

    return () => window.removeEventListener('os1:seccomms:devack:init', onDevAck);
  }, []);

  if (!active) return null;

  return (
    <div className="fixed bottom-2 right-2 z-30 text-[10px] px-2 py-1 rounded bg-amber-100 border border-amber-300 text-amber-800">
      🔓 SEC-COMMS AUTO-ACK (dev)
    </div>
  );
}
