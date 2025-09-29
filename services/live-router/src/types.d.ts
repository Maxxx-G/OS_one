// minimal local types; extend later if needed
export type RouterRequest = { prompt: string; system?: string; model?: string; reasoningEffort?: 'low'|'medium'|'high'; toolChoice?: 'none'|'auto'|string; };
export type RouterResponse = { text: string; provider: string; id?: string; usage?: any };
