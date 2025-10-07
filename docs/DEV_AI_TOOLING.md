# Dev AI Tooling (OS One)

- **Continue (primary coder)**: local DeepSeek-R1 via Ollama/OpenWebUI. Telemetry off.
- **Cody (repo context)**: whole-repo diffs; "apply diff" for safe changes. Telemetry off.
- **Phind (debug lookup)**: fast chat + web search in-editor. Telemetry off.

## Quick Start

1) Install recommended extensions (VS Code prompts).
2) Run local LLM router: `ollama serve` or OpenWebUI at `http://localhost:11434`.
3) Press **Ctrl+Alt+.** → runs Continue `/stb` command.

## Notes

- LF + final newline enforced; Copilot inline disabled to avoid clashes.
- Continue tools wired to `http://localhost:4000` OS One APIs.
