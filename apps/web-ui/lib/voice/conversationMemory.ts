/**
 * Conversation Memory - Rolling Summary for Multi-turn Continuity
 * Tracks exchanges and generates periodic summaries for context
 */

export interface ConversationExchange {
  timestamp: number;
  userInput: string;
  assistantReply: string;
  intent?: string;
}

interface MemoryState {
  exchanges: ConversationExchange[];
  rollingSummary: string | null;
  lastSummaryAt: number | null;
  turnsSinceSummary: number;
}

const MAX_EXCHANGES = 20; // Keep last 20 exchanges
const SUMMARY_INTERVAL = 5; // Generate summary every 5 turns

const state: MemoryState = {
  exchanges: [],
  rollingSummary: null,
  lastSummaryAt: null,
  turnsSinceSummary: 0,
};

/**
 * Add new exchange to memory
 */
export function addExchange(userInput: string, assistantReply: string, intent?: string): void {
  const exchange: ConversationExchange = {
    timestamp: Date.now(),
    userInput,
    assistantReply,
    intent,
  };

  state.exchanges.push(exchange);
  state.turnsSinceSummary++;

  // Trim to max size
  if (state.exchanges.length > MAX_EXCHANGES) {
    state.exchanges.shift();
  }

  console.log('[Memory] Added exchange, turns since summary:', state.turnsSinceSummary);
}

/**
 * Generate rolling summary from recent exchanges
 */
async function generateSummary(): Promise<string | null> {
  if (state.exchanges.length === 0) return null;

  // Take last 5 exchanges for summary
  const recent = state.exchanges.slice(-5);
  const conversationText = recent
    .map(ex => `User: ${ex.userInput}\nAssistant: ${ex.assistantReply}`)
    .join('\n\n');

  try {
    const response = await fetch('/api/voice/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation: conversationText }),
    });

    if (!response.ok) {
      console.warn('[Memory] Summary generation failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.summary || null;
  } catch (err) {
    console.error('[Memory] Summary error:', err);
    return null;
  }
}

/**
 * Check if summary should be generated and do so
 */
export async function maybeGenerateSummary(): Promise<void> {
  if (state.turnsSinceSummary < SUMMARY_INTERVAL) {
    return; // Not yet time for summary
  }

  console.log('[Memory] Generating rolling summary...');
  const summary = await generateSummary();
  
  if (summary) {
    state.rollingSummary = summary;
    state.lastSummaryAt = Date.now();
    state.turnsSinceSummary = 0;
    console.log('[Memory] Summary generated:', summary.substring(0, 80) + '...');
  }
}

/**
 * Get conversation context for LLM reasoning
 * Returns rolling summary + recent exchanges
 */
export function getConversationContext(): string | null {
  if (state.exchanges.length === 0) return null;

  const parts: string[] = [];

  // Include rolling summary if available
  if (state.rollingSummary) {
    parts.push(`[Previous conversation summary: ${state.rollingSummary}]`);
  }

  // Include last 2-3 exchanges for immediate context
  const recentCount = Math.min(3, state.exchanges.length);
  const recent = state.exchanges.slice(-recentCount);
  
  if (recent.length > 0) {
    const recentText = recent
      .map(ex => `User: ${ex.userInput}\nAssistant: ${ex.assistantReply}`)
      .join('\n');
    parts.push(recentText);
  }

  return parts.length > 0 ? parts.join('\n\n') : null;
}

/**
 * Get memory statistics
 */
export function getMemoryStats() {
  return {
    exchangeCount: state.exchanges.length,
    turnsSinceSummary: state.turnsSinceSummary,
    hasSummary: !!state.rollingSummary,
    lastSummaryAt: state.lastSummaryAt,
  };
}

/**
 * Clear conversation memory
 */
export function clearMemory(): void {
  state.exchanges = [];
  state.rollingSummary = null;
  state.lastSummaryAt = null;
  state.turnsSinceSummary = 0;
  console.log('[Memory] Cleared');
}

/**
 * Get raw exchanges for debugging
 */
export function getExchanges(): ConversationExchange[] {
  return [...state.exchanges];
}
