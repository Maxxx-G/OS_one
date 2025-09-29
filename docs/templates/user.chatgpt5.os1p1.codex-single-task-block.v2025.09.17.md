<Objectives>
- Summarize the single-task outcome in 1-2 bullets; scope stays atomic.
- Identify the system surface(s) the change will touch.
</Objectives>
<Constraints>
- Dot naming required: `semantic.name.vYYYY.MM.DD.ext`; see [ops.one.policy.filenaming.v01.00.md](ops.one.policy.filenaming.v01.00.md).
- Batch <=5 files per change set; prefer tighter bundles when possible.
- Tool budget: declare expected tool invocations; avoid redundant runs.
- Platform, dependency, and safety limits belong here (Windows, no new deps, etc.).
</Constraints>
<Tasks>
1. List concrete steps the agent will perform, each starting with a verb.
2. Keep tasks sequential; combine only when strictly atomic together.
3. Note any coordination (reviews, approvals) as separate bullets if required.
</Tasks>
<Acceptance>
- Define observable checks (tests, lint, visual poke) that prove success.
- Include policy hooks or guard validations when relevant.
</Acceptance>
<Rollback>
- Provide the exact command(s) to revert the change locally.
- Mention data cleanup or state resets if needed.
</Rollback>
<Commit>
- Supply the final commit message stub (e.g., `type(scope): summary`).
</Commit>
