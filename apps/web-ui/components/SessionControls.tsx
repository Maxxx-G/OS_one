'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { getMcpEnabled, setMcpEnabled } from '../lib/prefs';

/**
 * Available MCP servers that can be enabled/disabled
 * TODO: Replace with dynamic discovery from backend
 */
const AVAILABLE_MCPS = [
  { id: 'filesystem', label: 'Filesystem' },
  { id: 'git', label: 'Git' },
  { id: 'web', label: 'Web Search' },
  { id: 'database', label: 'Database' },
  { id: 'docker', label: 'Docker' },
] as const;

type McpId = (typeof AVAILABLE_MCPS)[number]['id'];

/**
 * Log audit event via global audit sink
 */
const logAudit = (type: string, data?: Record<string, unknown>) => {
  try {
    (window as any).os1Audit?.log?.(type, data);
  } catch {
    // ignore audit logging failures
  }
};

export default function SessionControls() {
  const [selectedMcps, setSelectedMcps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial MCP preferences
  useEffect(() => {
    const loadPrefs = async () => {
      const mcps = await getMcpEnabled();
      setSelectedMcps(mcps);
      setLoading(false);
    };
    void loadPrefs();
  }, []);

  // Poll for external preference changes every 15 seconds
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const mcps = await getMcpEnabled();
      setSelectedMcps(mcps);
    }, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const toggleMcp = useCallback(
    async (mcpId: string) => {
      const isCurrentlySelected = selectedMcps.includes(mcpId);
      const newSelection = isCurrentlySelected
        ? selectedMcps.filter((id) => id !== mcpId)
        : [...selectedMcps, mcpId];

      // Optimistically update UI
      setSelectedMcps(newSelection);

      // Persist to backend
      const success = await setMcpEnabled(newSelection);

      if (success) {
        // Log audit event
        logAudit('mcp-change', {
          action: isCurrentlySelected ? 'removed' : 'added',
          mcp: mcpId,
          enabled: newSelection,
        });
      } else {
        // Rollback on failure
        setSelectedMcps(selectedMcps);
        logAudit('mcp-change', {
          action: 'failed',
          mcp: mcpId,
          error: 'persistence_failed',
        });
      }
    },
    [selectedMcps],
  );

  if (loading) {
    return (
      <div className="session-controls" aria-label="MCP Selector">
        <label className="session-controls-label">MCPs:</label>
        <div className="mcp-chips-container">
          <span className="text-sm opacity-50">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="session-controls" aria-label="MCP Selector">
      <label className="session-controls-label" id="mcp-selector-label">
        MCPs:
      </label>
      <div className="mcp-chips-container" role="group" aria-labelledby="mcp-selector-label">
        {AVAILABLE_MCPS.map((mcp) => {
          const isSelected = selectedMcps.includes(mcp.id);
          return (
            <button
              key={mcp.id}
              type="button"
              className={`mcp-chip ${isSelected ? 'mcp-chip-selected' : 'mcp-chip-unselected'}`}
              onClick={() => toggleMcp(mcp.id)}
              aria-pressed={isSelected}
              title={`${isSelected ? 'Disable' : 'Enable'} ${mcp.label} MCP`}
            >
              <span className="mcp-chip-label">{mcp.label}</span>
              {isSelected && (
                <span className="mcp-chip-indicator" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
