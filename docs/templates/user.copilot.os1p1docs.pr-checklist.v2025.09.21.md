X-Tier1: user
X-Agent: copilot
X-Domain: os1p1docs
X-Purpose: pr-checklist
X-Version: v2025.09.21
X-Policy: filename+header compliance required

# OS One — PR Checklist (Copilot / Single Task Block)

## 🔖 Status Badges

✔️ Plan Guard | ✔️ CI Smoke

(Add these badges at the top of PR descriptions; replace ✔️ with ❌ if failing)

---

## ✅ Pre-merge checks

- [ ] **Plan Guard**
  - `ops/check_plan_templates.ps1` ran
  - Exit code = `0`
  - All required template links present

- [ ] **CI Smoke**
  - Typecheck passes (`npx -y -p typescript@5 -p @types/node@20 tsc ...`)
  - Routes presence passes (`Test-Path -LiteralPath ...`)
  - Output includes: `Routes OK`

- [ ] **Task Block Discipline**
  - ≤ 5 files changed
  - ≤ 50 lines per file
  - Diff shows only scoped edits
  - Commit message follows conventional format

- [ ] **Artifacts / Docs**
  - Updated templates/docs if relevant
  - Smoke `.http` scripts updated if endpoints changed
  - Handover notes updated if guard/CI rules changed

---

## 🚦 Approval

- Reviewer confirms all boxes ticked
- Merge only when **Plan Guard + CI Smoke** are green
