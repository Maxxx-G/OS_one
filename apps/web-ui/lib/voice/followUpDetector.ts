/**
 * Follow-up question detection with interrogative intent heuristics.
 * Detects leading interrogative markers and trailing question marks.
 */

const INTERROGATIVE_PATTERNS = [
  /^\s*(can|could|would|should|will|may|might)\s+(you|i|we)/i,
  /^\s*(what|when|where|why|who|how|which)/i,
  /^\s*(do|does|did|have|has|had|is|are|was|were)\s+(you|i|we|they)/i,
  /^\s*(tell me|explain|describe|clarify|elaborate)/i,
];

export type FollowUpContext = {
  isQuestion: boolean;
  topic: string | null;
  rawReply: string;
};

/**
 * Detect if a reply is asking a follow-up question.
 * Returns { isQuestion: true, topic: extractedTopic } if detected.
 */
export function detectFollowUp(reply: string): FollowUpContext {
  const trimmed = reply.trim();
  
  if (!trimmed) {
    return { isQuestion: false, topic: null, rawReply: reply };
  }

  // Check trailing question mark
  const endsWithQuestion = trimmed.endsWith('?');
  
  // Check leading interrogative patterns
  const hasInterrogative = INTERROGATIVE_PATTERNS.some(pattern => pattern.test(trimmed));

  const isQuestion = endsWithQuestion || hasInterrogative;

  if (!isQuestion) {
    return { isQuestion: false, topic: null, rawReply: reply };
  }

  // Extract topic: take first sentence or up to 60 chars
  let topic = trimmed;
  
  // If multiple sentences, take first
  const firstSentence = trimmed.split(/[.!?]/)[0];
  if (firstSentence && firstSentence.length < trimmed.length) {
    topic = firstSentence.trim();
  }

  // Truncate to 60 chars for UI brevity
  if (topic.length > 60) {
    topic = topic.slice(0, 57) + '...';
  }

  return { isQuestion: true, topic, rawReply: reply };
}
