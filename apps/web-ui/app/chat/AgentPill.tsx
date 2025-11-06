/*
X-Tier1: user
X-Agent: codex
X-Domain: os1p1webui
X-Purpose: chat-agent-pill
X-Version: v2025.10.13
X-Policy: filename+header compliance required
*/

"use client";

import { useEffect, useState } from "react";

type Status = "checking" | "healthy" | "offline";

interface AgentPillProps {
  label: string;
  endpoint: string;
}

const statusStyles: Record<Status, { background: string; color: string; text: string }> = {
  checking: { background: "#fef3c7", color: "#92400e", text: "Checking" },
  healthy: { background: "var(--accent)", color: "var(--fg)", text: "Healthy" },
  offline: { background: "var(--danger)", color: "var(--fg)", text: "Offline" },
};

export default function AgentPill({ label, endpoint }: AgentPillProps) {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      if (cancelled) return;
      setStatus("checking");
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        if (cancelled) return;
        if (res.ok || res.status === 404 || res.status === 405) {
          setStatus("healthy");
        } else {
          setStatus("offline");
        }
      } catch {
        if (!cancelled) setStatus("offline");
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [endpoint]);

  const style = statusStyles[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--spacing-s)",
        padding: "var(--spacing-xs) var(--spacing-m)",
        borderRadius: "var(--radius-lg)",
        background: style.background,
        color: style.color,
        fontSize: 12,
        fontWeight: 600,
        border: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      <span>{label}</span>
      <span>{style.text}</span>
    </span>
  );
}

