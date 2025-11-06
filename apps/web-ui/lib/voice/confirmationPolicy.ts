/**
 * Confirmation Policy Engine
 * JSON-driven configuration for which voice intents require confirmation
 */

export interface PolicyRule {
  intent: string;
  requiresConfirmation: boolean;
  message?: string; // Custom confirmation message
  priority?: number; // For rule ordering
}

export interface ConfirmationPolicy {
  version: string;
  rules: PolicyRule[];
  defaultRequireConfirmation?: boolean;
}

interface PolicyStore {
  policy: ConfirmationPolicy | null;
  lastUpdated: number | null;
  loading: boolean;
}

const store: PolicyStore = {
  policy: null,
  lastUpdated: null,
  loading: false,
};

/**
 * Fetch policy from backend
 */
export async function fetchPolicy(): Promise<ConfirmationPolicy | null> {
  if (store.loading) return store.policy;
  
  store.loading = true;
  try {
    const resp = await fetch('/api/confirmations/policy');
    if (!resp.ok) {
      console.warn('[ConfirmPolicy] Fetch failed:', resp.status);
      return null;
    }
    
    const data = await resp.json();
    if (data.ok && data.policy) {
      store.policy = data.policy;
      store.lastUpdated = Date.now();
      console.log('[ConfirmPolicy] Loaded policy version:', data.policy.version);
      return data.policy;
    }
    
    return null;
  } catch (err) {
    console.error('[ConfirmPolicy] Fetch error:', err);
    return null;
  } finally {
    store.loading = false;
  }
}

/**
 * Get cached policy (use fetchPolicy first if needed)
 */
export function getPolicy(): ConfirmationPolicy | null {
  return store.policy;
}

/**
 * Check if intent requires confirmation based on policy
 */
export function shouldConfirmIntent(intent: string): boolean {
  if (!store.policy) {
    // Fallback: confirm all if no policy loaded
    return true;
  }
  
  // Find matching rule
  const rule = store.policy.rules.find(r => r.intent === intent);
  if (rule) {
    return rule.requiresConfirmation;
  }
  
  // Use default if no rule matches
  return store.policy.defaultRequireConfirmation ?? true;
}

/**
 * Get custom confirmation message for intent
 */
export function getConfirmMessage(intent: string): string | null {
  if (!store.policy) return null;
  
  const rule = store.policy.rules.find(r => r.intent === intent);
  return rule?.message ?? null;
}

/**
 * Get last policy update timestamp
 */
export function getLastUpdated(): number | null {
  return store.lastUpdated;
}

/**
 * Clear policy cache (force reload on next fetch)
 */
export function clearPolicy(): void {
  store.policy = null;
  store.lastUpdated = null;
}
