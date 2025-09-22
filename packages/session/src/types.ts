export type MessageRole = 'user' | 'assistant' | 'system';
export type ProviderKey = 'openai.responses' | 'ollama.openwebui';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  responseId?: string;     // from provider
  createdAt: number;
  model?: string;
  provider?: ProviderKey;
}

export interface Thread {
  id: string;
  title?: string;
  createdAt: number;
  messages: Message[];
}

export interface SessionStore {
  getThread(id: string): Thread | undefined;
  getOrCreateThread(id: string): Thread;
  appendMessage(threadId: string, m: Message): void;
}
