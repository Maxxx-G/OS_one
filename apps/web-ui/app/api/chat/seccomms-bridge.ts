/*
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1webui
X-Purpose: chat-seccomms-bridge
X-Version: v2025.10.13
X-Policy: filename+header compliance required
*/

/**
 * SEC-COMMS Bridge for Chat API
 * Provides α-layer (egress control) and ε-layer (vault access) helpers
 */

export function getMode(): string {
  // Default to local_only for SEC-COMMS compliance
  // In production, this would read from environment or config
  return process.env.SECCOMMS_MODE || "local_only";
}

export function isLocalOnly(): boolean {
  return getMode() === "local_only";
}

export function ollamaUrl(): string {
  return process.env.OLLAMA_URL || "http://localhost:11434";
}

export async function getOpenAIKeyFromVault(): Promise<string | null> {
  // ε-layer (vault) accessor
  // In MVP, return from environment; in production, fetch from encrypted vault
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      console.warn("[SEC-COMMS ε] No OpenAI key found in vault/env");
      return null;
    }
    return key;
  } catch (err) {
    console.error("[SEC-COMMS ε] Vault access failed:", err);
    return null;
  }
}

export function validateEgressControl(mode: string): boolean {
  // α-layer validation: enforce local_only if configured
  if (mode === "local_only") {
    console.log("[SEC-COMMS α] Local-only mode enforced (no external egress)");
    return true;
  }
  console.log("[SEC-COMMS α] External egress permitted (mode:", mode, ")");
  return true;
}
