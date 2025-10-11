/*
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1webui
X-Purpose: chat-route
X-Version: v2025.10.13
X-Policy: filename+header compliance required
*/

import {
  getMode,
  isLocalOnly,
  ollamaUrl,
  getOpenAIKeyFromVault,
  validateEgressControl,
} from "./seccomms-bridge";
import type { ChatRequest, OllamaGenerateResponse } from "./types";

export const runtime = "edge";

export async function POST(request: Request) {
  const encoder = new TextEncoder();
  const mode = getMode();

  // SEC-COMMS α-layer: validate egress control
  if (!validateEgressControl(mode)) {
    return new Response("SEC-COMMS egress control violation", { status: 403 });
  }

  try {
    const body = (await request.json()) as ChatRequest;
    const { message, agentId } = body;

    if (!message || message.trim().length === 0) {
      return new Response("Missing or empty message", { status: 400 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Emit agent metadata at stream start if agentId provided
          if (agentId) {
            controller.enqueue(
              encoder.encode(`event: agent\ndata: ${agentId}\n\n`)
            );
          }

          if (isLocalOnly()) {
            // Local-only mode: use Ollama
            await streamOllama(message, controller, encoder);
          } else {
            // External mode: use OpenAI
            await streamOpenAI(message, controller, encoder);
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${errorMsg}\n\n`)
          );
        } finally {
          controller.enqueue(encoder.encode(`event: end\ndata: \n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Error: ${errorMsg}`, { status: 500 });
  }
}

async function streamOllama(
  message: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  const url = `${ollamaUrl()}/api/generate`;
  const payload = {
    model: "llama2",
    prompt: message,
    stream: true,
  };

  console.log("[SEC-COMMS α] Streaming from Ollama (local_only mode)");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Ollama unavailable: ${response.status} ${response.statusText}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body from Ollama");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line) as OllamaGenerateResponse;
            if (data.response) {
              controller.enqueue(
                encoder.encode(`event: data\ndata: ${data.response}\n\n`)
              );
            }
            if (data.done) break;
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Ollama error";
    console.error("[SEC-COMMS α] Ollama error:", errorMsg);
    controller.enqueue(encoder.encode(`event: error\ndata: ${errorMsg}\n\n`));
  }
}

async function streamOpenAI(
  message: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  const apiKey = await getOpenAIKeyFromVault();
  if (!apiKey) {
    throw new Error("OpenAI API key not found in vault (ε-layer)");
  }

  console.log("[SEC-COMMS α] Streaming from OpenAI (external mode)");

  const url = "https://api.openai.com/v1/chat/completions";
  const payload = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
    stream: true,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI unavailable: ${response.status} ${response.statusText}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body from OpenAI");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6);
          if (dataStr === "[DONE]") break;

          try {
            const data = JSON.parse(dataStr);
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(`event: data\ndata: ${content}\n\n`)
              );
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "OpenAI error";
    console.error("[SEC-COMMS] OpenAI error:", errorMsg);
    controller.enqueue(encoder.encode(`event: error\ndata: ${errorMsg}\n\n`));
  }
}
