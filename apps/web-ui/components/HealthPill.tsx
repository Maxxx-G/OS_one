"use client";

import { useEffect, useState } from "react";

type HealthStatus = "checking" | "healthy" | "mock" | "down";

interface HealthResponse {
  ok: boolean;
  mock?: boolean;
}

/**
 * HealthPill - Persistent chat backend health indicator
 * 
 * Polls /api/chat/health every 10 seconds and displays status:
 * - 🟩 Healthy: Backend operational (ok=true, mock=false)
 * - 🟦 Mock: Mock mode active (ok=true, mock=true)
 * - 🟥 Down: Backend unreachable or error
 * - ⚪ Checking: Initial state or validating
 */
export default function HealthPill() {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let mounted = true;

    async function poll() {
      if (!mounted) return;

      try {
        const res = await fetch("/api/chat/health", {
          cache: "no-store",
          signal: AbortSignal.timeout(5000), // 5s timeout
        });

        if (!mounted) return;

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: HealthResponse = await res.json();
        
        if (!mounted) return;

        // Determine status based on response
        if (data?.ok) {
          setStatus(data.mock ? "mock" : "healthy");
        } else {
          setStatus("down");
        }
        
        setLastCheck(new Date());
      } catch (err) {
        if (!mounted) return;
        console.warn("[HealthPill] Poll failed:", err);
        setStatus("down");
        setLastCheck(new Date());
      }

      // Schedule next poll (10 seconds)
      if (mounted) {
        timer = setTimeout(poll, 10000);
      }
    }

    // Start polling immediately
    poll();

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Color mapping for each status
  const colorConfig = {
    checking: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-300",
      label: "Checking",
      emoji: "⚪",
    },
    healthy: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-300",
      label: "Healthy",
      emoji: "🟩",
    },
    mock: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-300",
      label: "Mock",
      emoji: "🟦",
    },
    down: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-300",
      label: "Down",
      emoji: "🟥",
    },
  };

  const config = colorConfig[status];
  
  // Tooltip with status and last check time
  const tooltip = lastCheck
    ? `Chat backend: ${config.label}\nLast checked: ${lastCheck.toLocaleTimeString()}`
    : `Chat backend: ${config.label}`;

  return (
    <div
      title={tooltip}
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 
        text-xs font-medium 
        rounded-full
        ${config.bg} ${config.text} 
        border ${config.border}
        transition-all duration-300
        cursor-default
        select-none
      `}
      role="status"
      aria-live="polite"
      aria-label={`Chat backend status: ${config.label}`}
    >
      <span className="text-[10px]" aria-hidden="true">
        {config.emoji}
      </span>
      <span>{config.label}</span>
    </div>
  );
}
