X-Tier1: user
X-Agent: copilot
X-Domain: os1p1docs
X-Purpose: agent-context-catalog
X-Version: v2025.09.25
X-Policy: filename+header compliance required

| agent           | class | skills                 | preferred_format   | toggles                                          | ui.quick-switch | direct_agent_allowed | notes                                                    |
| --------------- | ----- | ---------------------- | ------------------ | ------------------------------------------------ | --------------- | -------------------- | -------------------------------------------------------- |
| chatgpt5        | Agent | reasoning, coding      | xml tags           | reasoning_effort, tool_budget, redaction, memory | enabled         | false                | profile docs/templates/agents.chatgpt5.context.v01.01.md |
| claude-3-opus   | Agent | analysis, drafting     | markdown blocks    | reasoning_effort, tool_budget                    | enabled         | false                | profile pending                                          |
| codex           | Agent | coding, review         | markdown diffs     | reasoning_effort, tool_budget                    | pending         | false                | legacy template pending                                  |
| copilot         | Agent | autocomplete, snippets | inline suggestions | n/a                                              | pending         | false                | relies on ide settings                                   |
| deepseek-r1-8b  | Agent | research, reasoning    | markdown trees     | reasoning_effort                                 | enabled         | false                | profile pending                                          |
| llava-llama3-8b | Agent | vision, commentary     | multimodal prompts | temperature, vision_mode                         | enabled         | false                | profile pending                                          |

## Update Protocol

Append new agents as dot-named template files under docs/templates/ before extending this catalog. Maintain alphabetical order, update ui.quick-switch/direct_agent_allowed when toggles ship, and bump version tags when rotating to a new policy revision.
