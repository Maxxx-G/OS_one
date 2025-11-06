/*
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1lexicore
X-Purpose: types
X-Version: v2025.10.12
X-Policy: filename+header compliance required
*/

export interface Snapshot {
  agentId: string;
  stateVector: {
    doc: string;
    [key: string]: unknown;
  };
  timestamp?: number;
}

export interface ReplayEvent {
  agentId: string;
  eventType: string;
  payload: {
    docLength: number;
    timestamp: number;
    [key: string]: unknown;
  };
}
