| agent           | skills                 | preferred_format   | toggles                                          | notes                                                    |
| --------------- | ---------------------- | ------------------ | ------------------------------------------------ | -------------------------------------------------------- |
| chatgpt5        | reasoning, coding      | xml tags           | reasoning_effort, tool_budget, redaction, memory | profile docs/templates/agents.chatgpt5.context.v01.00.md |
| codex           | coding, review         | markdown diffs     | reasoning_effort, tool_budget                    | legacy template pending                                  |
| copilot         | autocomplete, snippets | inline suggestions | n/a                                              | relies on ide settings                                   |
| deepseek-r1-8b  | research, reasoning    | markdown trees     | reasoning_effort                                 | profile pending                                          |
| llava-llama3-8b | vision, commentary     | multimodal prompts | temperature, vision_mode                         | profile pending                                          |

## Update Protocol

Append new agents as dot-named template files under docs/templates/ before extending this catalog. Maintain alphabetical order and bump version tags when rotating to a new policy revision.
