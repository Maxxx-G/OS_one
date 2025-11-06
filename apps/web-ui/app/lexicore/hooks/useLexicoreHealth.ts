/*
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1lexicore
X-Purpose: health-hook
X-Version: v2025.10.12
X-Policy: filename+header compliance required
*/

import { useState, useEffect } from "react";

interface HealthStatus {
  ok: boolean;
  mode: string;
  loading: boolean;
  version?: string;
  timestamp?: string;
}

export function useLexicoreHealth(): HealthStatus {
  const [status, setStatus] = useState<HealthStatus>({
    ok: false,
    mode: "unknown",
    loading: true,
  });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/lexicore/health", {
          method: "GET",
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          setStatus({
            ok: data.ok || false,
            mode: data.mode || "unknown",
            loading: false,
            version: data.version,
            timestamp: data.timestamp,
          });
        } else {
          setStatus({
            ok: false,
            mode: "error",
            loading: false,
          });
        }
      } catch (err) {
        setStatus({
          ok: false,
          mode: "offline",
          loading: false,
        });
      }
    };

    checkHealth();
  }, []);

  return status;
}
