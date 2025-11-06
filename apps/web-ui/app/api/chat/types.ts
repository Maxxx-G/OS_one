/*
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1webui
X-Purpose: chat-types
X-Version: v2025.10.13
X-Policy: filename+header compliance required
*/

export interface ChatRequest {
  message: string;
  conversationId?: string;
  agentId?: string;
}

export interface ChatStreamChunk {
  type: "data" | "error" | "end";
  content: string;
  timestamp?: number;
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
}

export interface OllamaGenerateResponse {
  response: string;
  done: boolean;
}

export interface OpenAIStreamChunk {
  choices: Array<{
    delta: {
      content?: string;
    };
    finish_reason: string | null;
  }>;
}
