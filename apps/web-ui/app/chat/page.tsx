"use client";

import {
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
  MutableRefObject
} from "react";

type Message = { role: "user" | "assistant"; content: string };
type HealthState = { ok: boolean; mock: boolean; url: string };
type Banner =
  | { kind: "none" }
  | { kind: "retry"; attempt: number; total: number }
  | { kind: "timeout"; detail: string };

const HEALTH_ENDPOINT = "/api/chat/health";
const RETRY_HEADER = "x-os1-retry";

function isStreamingContent(contentType: string) {
  const ct = (contentType || "").toLowerCase();
  if (!ct) return false;
  return (
    ct.includes("event-stream") ||
    ct.includes("ndjson") ||
    ct.startsWith("text/")
  );
}

function parseLine(line: string) {
  const trimmed = line.startsWith("data:")
    ? line.slice(5).trim()
    : line.trim();

  if (!trimmed) return "";

  try {
    const payload = JSON.parse(trimmed);
    return (
      payload?.choices?.[0]?.delta?.content ??
      payload?.choices?.[0]?.message?.content ??
      payload?.content ??
      payload?.message ??
      ""
    );
  } catch {
    return trimmed;
  }
}

function scrollToBottom(ref: MutableRefObject<HTMLDivElement | null>) {
  ref.current?.scrollTo({
    top: ref.current.scrollHeight,
    behavior: "smooth"
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<Banner>({ kind: "none" });
  const [health, setHealth] = useState<HealthState | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const lastPromptRef = useRef<string>("");

  useEffect(() => {
    scrollToBottom(logRef);
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const response = await fetch(HEALTH_ENDPOINT, { cache: "no-store" });
        const data = (await response.json()) as HealthState;
        if (!cancelled) {
          setHealth(data);
        }
      } catch {
        if (!cancelled) {
          setHealth({ ok: false, mock: false, url: "(unreachable)" });
        }
      } finally {
        if (!cancelled) {
          timer = setTimeout(poll, 5000);
        }
      }
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Handle retry-last event from NavbarOps
  useEffect(() => {
    function handleRetry() {
      const lastPrompt = lastPromptRef.current || (typeof window !== "undefined" ? (window as any).os1LastPrompt : "");
      
      if (lastPrompt && !busy) {
        setInput(lastPrompt);
        // Trigger send on next tick to ensure input is set
        setTimeout(() => {
          void send();
        }, 0);
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("os1-retry-last", handleRetry);
      return () => {
        window.removeEventListener("os1-retry-last", handleRetry);
      };
    }
  }, [busy]);

  function statusPill(state: HealthState | null) {
    if (!state) {
      return <span className="text-sm opacity-70">checking</span>;
    }
    if (state.mock) {
      return (
        <span className="text-xs px-2 py-1 rounded-md bg-yellow-100 text-yellow-800">
          Mock
        </span>
      );
    }
    if (state.ok) {
      return (
        <span className="text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-800">
          Healthy
        </span>
      );
    }
    return (
      <span className="text-xs px-2 py-1 rounded-md bg-rose-100 text-rose-800">
        Down
      </span>
    );
  }

  function bannerContent(state: Banner) {
    if (state.kind === "retry") {
      return `Retrying (${state.attempt}/${state.total})...`;
    }
    if (state.kind === "timeout") {
      return state.detail;
    }
    return null;
  }

  function updateAssistant(index: number, content: string) {
    setMessages((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = [...prev];
      next[index] = { role: "assistant", content };
      return next;
    });
  }

  async function send() {
    const prompt = input.trim();
    if (!prompt || busy) return;

    // Remember last prompt for retry functionality
    lastPromptRef.current = prompt;
    if (typeof window !== "undefined") {
      (window as any).os1LastPrompt = prompt;
    }

    let assistantIndex = -1;
    setMessages((prev) => {
      const next = [
        ...prev,
        { role: "user", content: prompt },
        { role: "assistant", content: "" }
      ];
      assistantIndex = next.length - 1;
      return next;
    });

    setInput("");
    setBusy(true);
    setBanner({ kind: "none" });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-sec-local-only": "1",
          "x-os1-retry-echo": "1"
        },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
        cache: "no-store"
      });

      const attemptHeader = response.headers.get(RETRY_HEADER);
      if (attemptHeader) {
        const attemptNumber = Number(attemptHeader);
        if (Number.isFinite(attemptNumber) && attemptNumber > 1) {
          setBanner({ kind: "retry", attempt: attemptNumber, total: 3 });
        }
      } else {
        setBanner({ kind: "none" });
      }

      if (!response.ok) {
        if (response.status === 504) {
          setBanner({
            kind: "timeout",
            detail: "Request timed out after retries"
          });
        }
        updateAssistant(
          assistantIndex,
          `[warn] backend error ${response.status}`
        );
        return;
      }

      const contentType = response.headers.get("content-type") || "";

      if (response.body && isStreamingContent(contentType)) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let aggregated = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            const fragment = parseLine(line);
            if (!fragment) continue;
            aggregated += fragment;
            updateAssistant(assistantIndex, aggregated);
          }
        }

        if (buffer.trim()) {
          const fragment = parseLine(buffer);
          aggregated += fragment;
          updateAssistant(assistantIndex, aggregated);
        }

        if (!aggregated) {
          updateAssistant(assistantIndex, "(no content)");
        }
      } else {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          const reply =
            data?.choices?.[0]?.message?.content ??
            data?.choices?.[0]?.delta?.content ??
            data?.content ??
            data?.message ??
            text;
          updateAssistant(assistantIndex, String(reply));
        } catch {
          updateAssistant(assistantIndex, text);
        }
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "network";
      setBanner({
        kind: "timeout",
        detail: `Request failed after retries (${reason})`
      });
      updateAssistant(assistantIndex, `[warn] proxy unreachable (${reason})`);
    } finally {
      setBusy(false);
    }
  }

  function handleKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter") {
      return;
    }

    const modifier = event.ctrlKey || event.metaKey;

    if (!modifier) {
      event.preventDefault();
      void send();
      return;
    }

    event.preventDefault();
    const target = event.currentTarget;
    const { selectionStart, selectionEnd, value } = target;
    const next = `${value.slice(0, selectionStart)}\n${value.slice(selectionEnd)}`;
    setInput(next);

    queueMicrotask(() => {
      const cursor = selectionStart + 1;
      target.selectionStart = cursor;
      target.selectionEnd = cursor;
    });
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#e6edf3] flex flex-col items-center p-6">
      <div className="w-full max-w-3xl grid grid-rows-[auto_auto_auto_auto_1fr_auto] gap-4 border border-white/10 rounded-2xl bg-white/5 backdrop-blur px-4 py-5">
        <div className="text-sm opacity-70">
          Enter = Send. Ctrl/Cmd + Enter = Newline. Responses proxy through the chat backend.
        </div>

        <div className="text-sm flex items-center gap-2">
          Status: {statusPill(health)}
          {health && (
            <span className="opacity-60 truncate">
              ({health.url})
            </span>
          )}
        </div>

        {!health?.ok && !health?.mock && (
          <div className="text-sm p-3 rounded-md bg-yellow-50 text-yellow-800">
            Backend is currently down. Set <code>CHAT_BACKEND_MOCK=1</code> to enable mock replies.
          </div>
        )}

        {banner.kind !== "none" && (
          <div className="text-sm p-3 rounded-md bg-amber-100 text-amber-900">
            {bannerContent(banner)}
          </div>
        )}

        <div
          ref={logRef}
          className="overflow-y-auto border border-white/10 rounded-xl p-3 space-y-3"
          style={{ maxHeight: "60vh" }}
        >
          {messages.length === 0 && (
            <div className="opacity-70 text-sm">
              Say hi -- the local model server (or mock mode) replies here.
            </div>
          )}
          {messages.map((msg, index) => (
            <div
              key={`msg-${index}`}
              className={msg.role === "user" ? "text-right" : "text-left"}
            >
              <span
                className={
                  "inline-block rounded-2xl px-3 py-2 whitespace-pre-wrap " +
                  (msg.role === "user" ? "bg-black/20" : "bg-emerald-900/40")
                }
              >
                {msg.content || (busy && index === messages.length - 1 ? "..." : "")}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <textarea
            className="flex-1 border border-white/20 rounded-xl bg-black/30 px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-sky-400"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message..."
            disabled={busy}
          />
          <button
            className="border border-sky-400 rounded-xl px-4 py-2 text-sky-200 disabled:opacity-50"
            onClick={() => void send()}
            disabled={busy}
          >
            {busy ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
