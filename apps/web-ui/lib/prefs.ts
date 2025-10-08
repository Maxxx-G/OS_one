/**
 * Preferences utility module
 * Handles reading/writing user preferences to the Archon API
 */

const ARCHON_URL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';
const PREFS_URL = `${ARCHON_URL}/v1/prefs`;

export type Preferences = {
  hints_enabled?: boolean;
  acclimation_start?: string | null;
  hint_palette?: 'normal' | 'cb_safe';
  mcp_enabled?: string[];
};

/**
 * Fetch current preferences from the server
 */
export async function getPrefs(): Promise<Preferences | null> {
  try {
    const response = await fetch(PREFS_URL, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Update preferences on the server
 * @param updates Partial preferences object with fields to update
 */
export async function updatePrefs(updates: Partial<Preferences>): Promise<boolean> {
  try {
    const response = await fetch(PREFS_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get MCP enabled list from preferences
 */
export async function getMcpEnabled(): Promise<string[]> {
  const prefs = await getPrefs();
  return prefs?.mcp_enabled ?? [];
}

/**
 * Update MCP enabled list in preferences
 */
export async function setMcpEnabled(mcpList: string[]): Promise<boolean> {
  return updatePrefs({ mcp_enabled: mcpList });
}
