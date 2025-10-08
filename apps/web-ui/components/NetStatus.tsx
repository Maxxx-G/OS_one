'use client';
import React, { useEffect, useMemo, useState } from 'react';

const ARCHON_URL = (process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700').replace(
  /\/$/,
  '',
);

const HEALTH_PATH = '/health';
const PING_INTERVAL_MS = 8000;

export default function NetStatus() {
  const [status, setStatus] = useState<'idle' | 'up' | 'down'>('idle');

  const title = useMemo(() => {
    switch (status) {
      case 'up':
        return 'ARCHON online';
      case 'down':
        return 'ARCHON offline';
      default:
        return 'Checking ARCHON…';
    }
  }, [status]);

  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    const probe = async () => {
      try {
        const res = await fetch(`${ARCHON_URL}${HEALTH_PATH}`, {
          method: 'GET',
          signal: controller.signal,
        });
        if (!alive) {
          return;
        }
        setStatus(res.ok ? 'up' : 'down');
      } catch {
        if (!alive) {
          return;
        }
        setStatus('down');
      }
    };

    probe();
    const interval = setInterval(probe, PING_INTERVAL_MS);

    return () => {
      alive = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <span className={`net-dot ${status}`} title={title} aria-label="Network status" role="status" />
  );
}
