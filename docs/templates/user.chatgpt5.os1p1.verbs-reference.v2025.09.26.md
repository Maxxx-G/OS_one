user.chatgpt5.os1p1.verbs-reference.v2025.09.26.md

<STB.Verbs.Reference>
- **/start** → Initialize handover; load project plan + last status; output snapshot.
- **/stb <file>** → Load and obey a Single Task Block format from the named file.
- **/projectplan** → Locate, parse, and summarize the current OS1 Project Plan.
- **/laststatus** → Summarize last 5 completed STBs and list next 5 candidates.
- **/backup** → Close current segment; produce backup checklist (files, paths, versions).
- **/break** → Produce snapshot of done/pending/blockers with timestamps.
- **/verify** → Run repo guardrails: lint, format, file-naming, ≤5 file constraint.
- **/handover** → Emit the canonical Handover Prompt, referencing all active project files.
- **/yes?** → Load and obey a Single Task Block format from the named file.
</STB.Verbs.Reference>

<Notes>
- Verbs are intended for Assistant↔Agent orchestration, not direct user input.
- Each STB must declare which verbs it requires.
- Expansion: new verbs may be appended in later revisions; bump version tag.
</Notes>
