export type StreamChunk = { type: 'text' | 'tool' | 'event'; data: any };
export interface ProviderRequest {
  prompt: string;
  system?: string;
  reasoningEffort?: 'low' | 'medium' | 'high';
  toolChoice?: 'none' | 'auto' | string;
  toolBudget?: number;
  thread?: { store?: boolean; previousId?: string | null };
  meta?: Record<string, any>;
}
export interface ProviderResponse {
  text: string;
  responseId?: string;
  usage?: { inputTokens?: number; outputTokens?: number };
}
export interface Provider {
  name: string;
  stream(req: ProviderRequest): AsyncIterable<StreamChunk>;
  complete(req: ProviderRequest): Promise<ProviderResponse>;
}
