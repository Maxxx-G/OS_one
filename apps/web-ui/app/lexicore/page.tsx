/*
X-Tier1: user
X-Agent: copilot
X-Domain: os1p1lexicore
X-Purpose: editor-page
X-Version: v2025.10.12
X-Policy: filename+header compliance required
*/

"use client";

import { useState } from "react";

export default function LexiCorePage() {
  const [doc, setDoc] = useState("");
  const [status, setStatus] = useState("");
  const [replayFile, setReplayFile] = useState("");

  const handleSave = async () => {
    try {
      setStatus("Saving to vault...");
      const res = await fetch("/api/memory/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "gabriel",
          stateVector: { doc },
        }),
      });
      if (res.ok) {
        setStatus("✅ Saved to vault (ε)");
      } else {
        setStatus(`⚠️ Save failed: ${res.status}`);
      }
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  };

  const handleLoad = async () => {
    try {
      setStatus("Loading from vault...");
      const res = await fetch("/api/memory/load?agentId=gabriel");
      if (res.ok) {
        const data = await res.json();
        if (data.snapshot?.stateVector?.doc) {
          setDoc(data.snapshot.stateVector.doc);
          setStatus("✅ Loaded from vault (ε)");
        } else {
          setStatus("⚠️ No snapshot found");
        }
      } else {
        setStatus(`⚠️ Load failed: ${res.status}`);
      }
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  };

  const handleReplay = async () => {
    try {
      setStatus("Creating replay embed...");
      const res = await fetch("/api/replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "gabriel",
          eventType: "lexicore_edit",
          payload: { docLength: doc.length, timestamp: Date.now() },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReplayFile(data.filename || "replay.bin");
        setStatus("✅ Replay embed created (ζ)");
      } else {
        setStatus(`⚠️ Replay failed: ${res.status}`);
      }
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>LexiCore — Cognitive Word Processor</h1>
      <p style={{ color: "#666" }}>
        Tier-I MVP: Editor with vault persistence (ε) and replay cue (ζ)
      </p>

      <textarea
        value={doc}
        onChange={(e) => setDoc(e.target.value)}
        placeholder="Start writing your document..."
        style={{
          width: "100%",
          minHeight: "300px",
          padding: "1rem",
          fontSize: "16px",
          fontFamily: "monospace",
          border: "1px solid #ccc",
          borderRadius: "4px",
          marginTop: "1rem",
        }}
      />

      <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
        <button
          onClick={handleSave}
          style={{
            padding: "0.5rem 1rem",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Save to Vault (ε)
        </button>

        <button
          onClick={handleLoad}
          style={{
            padding: "0.5rem 1rem",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Load from Vault (ε)
        </button>

        <button
          onClick={handleReplay}
          style={{
            padding: "0.5rem 1rem",
            background: "#8b5cf6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Replay Embed (ζ)
        </button>
      </div>

      {status && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            background: "#f3f4f6",
            borderRadius: "4px",
          }}
        >
          {status}
        </div>
      )}

      {replayFile && (
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.75rem",
            background: "#ede9fe",
            borderRadius: "4px",
          }}
        >
          Replay file: <code>{replayFile}</code>
        </div>
      )}
    </div>
  );
}
