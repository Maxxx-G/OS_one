# Prompt Template — Universal (+Responses Flags)

**Doc ID:** prompt_template_universal_plus_responses_flags_v2025.09.21  
**Owner:** OS_One Core (Orchestrators)  
**Status:** Active  
**Changelog:** v2025.09.21 — Initial GPT-5 flags version

## 0) Meta

- Title:
- Project ID / Task ID / UID:
- Repo / Path:

## 1) Role & Objective

- Role of the assistant:
- Objective (1–2 lines):
- Constraints (legal/safety/privacy):

## 2) Inputs

- Context (short bullets):
- Artifacts (links/files):
- Assumptions:

## 3) Output Contract

- Format (md/json/code):
- Sections/Keys required:
- Acceptance checks (bullets):

## 4) Reasoning & Tools (Responses API)

- reasoning.effort: low | medium | high
- tool_choice: none | auto | <tool-name>
- tool_budget: <max calls or 0>
- state.thread.store: true|false
- state.previous_response_id: <id|null>
- self_review.rubric: <criteria bullets>

## 5) Style & Voice

- Tone/persona:
- Prose vs. list balance:
- Forbidden patterns:

## 6) Guardrails

- No secrets; no raw PII; respect policy links.
- Ask clarifying Q if required fields missing.

## 7) Links

- Policies: Pre-Processor Gate; Naming; Agent-Sys Addendum
