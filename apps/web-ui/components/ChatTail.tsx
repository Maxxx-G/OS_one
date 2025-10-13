"use client";

import { useEffect, useState } from "react";

type TailEvent = {
  timestamp: number;
  message: string;
};

/**
 * ChatTail - Debug panel for chat proxy events
 * 
 * Shows last 20 events including:
 * - Send operations (mode, backend URL)
 * - Receive operations (status, trace header)
 * - Retry attempts
 * - Timeout/error events
 * 
 * Provides:
 * - Copy to clipboard for bug reports
 * - Resend last message action
 */
export default function ChatTail() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<TailEvent[]>([]);

  // Listen for tail events
  useEffect(() => {
    function handleTailEvent(event: Event) {
      const customEvent = event as CustomEvent<string>;
      const message = customEvent.detail;

      setEvents((prev) => {
        // Keep last 20 events (19 old + 1 new)
        const next = [...prev.slice(-19), {
          timestamp: Date.now(),
          message,
        }];
        return next;
      });
    }

    if (typeof window !== "undefined") {
      window.addEventListener("os1-tail", handleTailEvent);
      return () => {
        window.removeEventListener("os1-tail", handleTailEvent);
      };
    }
  }, []);

  // Copy events to clipboard
  function copyToClipboard() {
    if (!navigator.clipboard) {
      console.warn("[ChatTail] Clipboard API not available");
      return;
    }

    const text = events
      .map((e) => {
        const timestamp = new Date(e.timestamp).toISOString();
        return `${timestamp} — ${e.message}`;
      })
      .join("\n");

    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("[ChatTail] Copied to clipboard");
      })
      .catch((err) => {
        console.error("[ChatTail] Copy failed:", err);
      });
  }

  // Trigger retry-last event
  function resendLast() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("os1-retry-last"));
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="
          px-3 py-1.5 
          text-xs font-medium
          rounded-md border border-gray-300
          bg-white shadow-md
          hover:bg-gray-50
          transition-colors
        "
        title="Toggle debug tail panel"
        type="button"
      >
        {open ? "Tail ▲" : "Tail ▼"}
        {events.length > 0 && (
          <span className="ml-1 text-[10px] text-gray-500">
            ({events.length})
          </span>
        )}
      </button>

      {/* Tail panel */}
      {open && (
        <div
          className="
            mt-2 
            w-[480px] max-h-[320px]
            overflow-auto
            text-xs
            bg-white 
            border border-gray-300
            rounded-md 
            shadow-lg
            p-3
          "
        >
          {/* Header */}
          <div className="mb-2 pb-2 border-b border-gray-200 flex items-center justify-between">
            <div className="font-semibold text-gray-700">
              Debug Tail
              <span className="ml-2 text-[10px] text-gray-500 font-normal">
                Last {events.length} event{events.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Events list */}
          <div className="space-y-1 mb-3 font-mono">
            {events.length === 0 && (
              <div className="text-gray-400 italic">
                No events yet. Send a message to populate.
              </div>
            )}
            {events.map((event, index) => (
              <div
                key={`${event.timestamp}-${index}`}
                className="text-[11px] whitespace-pre-wrap break-all"
              >
                <span className="text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-gray-700 mx-1">—</span>
                <span className="text-gray-900">{event.message}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <button
              onClick={copyToClipboard}
              className="
                px-3 py-1.5
                text-xs
                border border-gray-300
                rounded-md
                bg-white
                hover:bg-gray-50
                transition-colors
              "
              disabled={events.length === 0}
              title="Copy events to clipboard"
              type="button"
            >
              📋 Copy
            </button>
            <button
              onClick={resendLast}
              className="
                px-3 py-1.5
                text-xs
                border border-blue-300
                rounded-md
                bg-blue-50
                hover:bg-blue-100
                text-blue-700
                transition-colors
              "
              title="Resend last message (same as navbar button)"
              type="button"
            >
              🔄 Resend last
            </button>
            <button
              onClick={() => setEvents([])}
              className="
                px-3 py-1.5
                text-xs
                border border-red-300
                rounded-md
                bg-red-50
                hover:bg-red-100
                text-red-700
                transition-colors
                ml-auto
              "
              disabled={events.length === 0}
              title="Clear all events"
              type="button"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
