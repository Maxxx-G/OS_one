import type { Provider, ProviderRequest, ProviderResponse, StreamChunk } from './types';

export const OllamaOpenWebUI: Provider = {
  name: 'ollama.openwebui',
  async *stream(req: ProviderRequest): AsyncIterable<StreamChunk> {
    // TODO: connect to local Open-WebUI or Ollama streaming endpoint
  },
  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    // TODO: non-stream request
    return { text: '' };
  },
};
