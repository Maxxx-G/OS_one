"use client";

import { useEffect, useState } from "react";

interface ThetaStatus {
  agents: number;
  cpu: number;
}

/**
 * NavbarOps - Operational controls in navbar
 * 
 * Features:
 * - Retry Last: Re-sends last prompt if previous call failed/timed out
 * - θ Mini: Shows theta layer status (agents count + CPU %)
 */
export default function NavbarOps() {
  const [theta, setTheta] = useState<ThetaStatus | null>(null);
  const [disabled, setDisabled] = useState(false);

  // Poll theta status every 10 seconds
  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout;

    async function pollTheta() {
      if (!mounted) return;

      try {
        const res = await fetch("/api/theta/status", {
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        });

        if (!mounted) return;

        const data = await res.json();
        
        if (data?.ok && mounted) {
          setTheta({
            agents: data.agents ?? 0,
            cpu: data.cpu ?? 0,
          });
        }
      } catch (err) {
        // Silent fail - theta status is informational only
        if (mounted) {
          console.debug("[NavbarOps] Theta poll failed:", err);
        }
      }

      if (mounted) {
        timer = setTimeout(pollTheta, 10000);
      }
    }

    pollTheta(); // Initial poll

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Retry last prompt handler with debounce
  async function handleRetry() {
    if (disabled) return;

    // Debounce: disable for 1 second
    setDisabled(true);
    setTimeout(() => setDisabled(false), 1000);

    // Dispatch custom event for chat page to handle
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("os1-retry-last"));
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Retry Last Button */}
      <button
        onClick={handleRetry}
        disabled={disabled}
        className="
          px-2 py-1 
          text-xs font-medium
          rounded border 
          bg-white hover:bg-gray-50 
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
        title="Re-send last prompt if previous call failed or timed out"
        type="button"
      >
        Retry last
      </button>

      {/* Theta Mini Status */}
      <span
        className="text-xs text-gray-600 font-mono"
        title={
          theta
            ? `Theta layer: ${theta.agents} agent(s), ${theta.cpu}% CPU`
            : "Theta layer status loading..."
        }
      >
        {theta ? `θ ${theta.agents} @ ${theta.cpu}%` : "θ …"}
      </span>
    </div>
  );
}
