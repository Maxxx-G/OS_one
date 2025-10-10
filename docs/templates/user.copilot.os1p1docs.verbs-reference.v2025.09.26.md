X-Tier1: user
X-Agent: copilot
X-Domain: os1p1docs
X-Purpose: verbs-reference
X-Version: v2025.09.26
X-Policy: filename+header compliance required

user.chatgpt5.os1p1.verbs-reference.v2025.09.26.md

<STB.Verbs.Reference>

- **/start** → Initialize handover from **handover-voice-phase2.v2025.10.07.md**; load project plan + last status; output snapshot.
- **/stb <file>** → Load and obey a Single Task Block format from the named file.
- **/projectplan** → Locate current plan under `docs/project_plans/` or `kb/projects/`; parse and summarize.
- **/laststatus** → Summarize last 5 completed STBs and list next 5 candidates.
- **/backup** → Close current segment; produce backup checklist (files, paths, versions).
- **/break** → Produce snapshot of done/pending/blockers with timestamps.
- **/verify** → Run repo guardrails: lint, format, file-naming, ≤5 file constraint.
- **/handover** → Emit the canonical Handover Prompt, referencing all active project files.
- **/yes?** → paraphrase + proceed. if unclear ask user to validate
  </STB.Verbs.Reference>

<Notes>
- 2025-10-07: Updated `/start` source to **handover-voice-phase2.v2025.10.07.md**.
- Verbs are intended for Assistant↔Agent orchestration, not direct user input.
- Each STB must declare which verbs it requires.
- Expansion: new verbs may be appended in later revisions; bump version tag.
- STBs generated via these verbs must follow the **One-Fence Rule**; nested code fences are disallowed.
</Notes>
