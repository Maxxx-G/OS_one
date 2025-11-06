import { getSettings, isStreamLike } from "../../../lib/chat/backend";
import { fetchWithRetry } from "../../../lib/chat/retry";
import { resolveBackend } from "../../../lib/chat/router";

export const runtime = "edge";

function withTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
  });
}

export async function POST(request: Request) {
  const settings = getSettings();
  const payload = await request.text();
  let attemptCount = 0;

  let backendUrl = settings.url;
  let backendHeaders: Record<string, string> = {};

  try {
    const resolved = resolveBackend(process.env.CHAT_BACKEND_MODE);
    backendUrl = resolved.url;
    backendHeaders = resolved.headers ?? {};
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : String(error ?? "router_error");
    return new Response(
      JSON.stringify({
        error: "backend_configuration",
        reason
      }),
      {
        status: 502,
        headers: { "content-type": "application/json" }
      }
    );
  }

  if (settings.mock || backendUrl === "mock") {
    const mockReply = {
      choices: [
        {
          message: {
            content: "MOCK: Hello from OS One! (retry layer active)"
          }
        }
      ]
    };
    // Safe render: JSON for backwards compat, text/plain fallback supported
    return new Response(JSON.stringify(mockReply), {
      status: 200,
      headers: { 
        "content-type": "application/json; charset=utf-8",
        "X-OS1-Trace": `mode=mock; attempts=1; mock=1`
      }
    });
  }

  const requestHeaders: Record<string, string> = {
    ...backendHeaders
  };
  requestHeaders["content-type"] = "application/json";

  const localOnly = request.headers.get("x-sec-local-only");
  if (localOnly) {
    requestHeaders["x-sec-local-only"] = localOnly;
  }

  try {
    const upstream = await fetchWithRetry(
      () =>
        withTimeout(
          backendUrl,
          { method: "POST", headers: requestHeaders, body: payload },
          settings.timeoutMs
        ),
      {
        attempts: 3,
        baseDelayMs: 500,
        capMs: Math.max(12_000, settings.timeoutMs)
      },
      (attempt) => {
        attemptCount = attempt;
      }
    );

    const contentType = upstream.headers.get("content-type") || "";

    if (upstream.body && isStreamLike(contentType)) {
      const headersOut = new Headers();
      headersOut.set("content-type", contentType);
      headersOut.set("x-os1-retry", String(attemptCount || 1));
      headersOut.set("X-OS1-Trace", `mode=live; attempts=${attemptCount || 1}; mock=0`);
      return new Response(upstream.body, {
        status: upstream.status,
        headers: headersOut
      });
    }

    const text = await upstream.text();
    const headersOut = new Headers();
    headersOut.set("content-type", contentType || "text/plain; charset=utf-8");
    headersOut.set("x-os1-retry", String(attemptCount || 1));
    headersOut.set("X-OS1-Trace", `mode=live; attempts=${attemptCount || 1}; mock=0`);

    return new Response(text, {
      status: upstream.status,
      headers: headersOut
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error ?? "unknown");

    const status = message.includes("timeout") ? 504 : 502;

    const body = JSON.stringify({
      error: "backend_unreachable",
      reason: message,
      url: backendUrl
    });
    return new Response(body, {
      status,
      headers: {
        "content-type": "application/json",
        "x-os1-retry": String(Math.max(1, attemptCount || 3)),
        "X-OS1-Trace": `mode=live; attempts=${Math.max(1, attemptCount || 3)}; mock=0`
      }
    });
  }
}
