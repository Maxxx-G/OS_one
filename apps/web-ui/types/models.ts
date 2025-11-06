export interface Params {
  stream: boolean;
  deltaChunk: number;
  funcCalling: string;
  reasoningTags: boolean;
  sources: string[];
}

export interface Attachment {
  id: string;
  type: string;
  name: string;
  size: number;
  mime: string;
  url?: string;
  source?: string;
}

export interface Message {
  id: string;
  threadId: string;
  author: { id: string; name: string; role: string };
  createdAt: string;
  body: string;
  attachments: Attachment[];
  status: 'sending' | 'sent' | 'error';
}

export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  systemPrompt?: string;
  params: Params;
  participants: string[];
}
