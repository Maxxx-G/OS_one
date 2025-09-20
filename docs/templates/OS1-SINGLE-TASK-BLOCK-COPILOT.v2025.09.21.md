# OS One — Single Task Block (Copilot-Tuned Edition)

**File:** OS1-SINGLE-TASK-BLOCK-COPILOT.v2025.09.21.md  
**Scope:** For use with GitHub Copilot Chat / Agent Mode  
**Discipline:** Atomic, verifiable, reversible tasks

---

## Rules of Execution
1. **Plan First** — Always show a numbered plan before editing files.  
2. **File Limit** — Touch ≤5 files, ≤50 lines per file.  
3. **Edits Only** — No hidden refactors; append-only when possible.  
4. **Diff Output** — Show unified diffs for each file.  
5. **Commit Message** — Suggest a clear, conventional commit message.  
6. **Verification** — After edits, rerun:
   - `ops/check_plan_templates.ps1`
   - `.github/workflows/ci-smoke.yml` (dry-run check)
7. **Abort Condition** — If scope drifts, stop and request user approval.  

---

## Example Workflow (Copilot Agent)
- Step 1: Print plan (≤5 steps).  
- Step 2: Apply edits.  
- Step 3: Output diffs + commit message.  
- Step 4: Instruct user to run Plan Guard + CI Smoke.  

---

## Notes
- Designed to keep Copilot on track without drifting.  
- Mirrors Codex Single Task Block discipline with Copilot-specific adjustments.  
- Use this template as the **context primer** whenever opening Copilot Chat.