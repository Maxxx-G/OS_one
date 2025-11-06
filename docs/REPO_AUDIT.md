# Repository Audit System

**Purpose:** Automated audit of OS One repository structure to detect empty directories, placeholder files, duplicate templates, and control folder health.

**Script:** `scripts/audit_repo.mjs`  
**Command:** `npm run audit:repo`  
**Output:** `logs/audit_repo_{timestamp}.md`

---

## What It Checks

### Control Folders
Scans these critical directories:
- `/templates` — Agent-critical runtime templates
- `/docs/templates` — Human-facing documentation samples
- `/policies` — Governance and operational policies
- `/governance` — Meeting queues and committee structures
- `/assistants` — Persona profiles and avatars
- `/kb` — Knowledge base and design docs
- `/docs` — Project documentation
- `/scripts` — Build and automation scripts
- `/tools` — Command-line utilities

### Issues Detected
1. **Empty Directories** — Folders with no files (may need .keep or removal)
2. **Placeholder Files** — .keep, .gitkeep, minimal READMEs
3. **Duplicate Templates** — Same version date with different content
4. **Missing Folders** — Expected control folders that don't exist

---

## Report Structure

### Section 1: Control Folders Analysis
For each folder:
- Total file count
- Real files vs placeholders
- Subdirectory count
- Empty directory list
- Placeholder file list

### Section 2: Duplicate Detection
- Lists templates with identical version dates
- Groups by base name and version
- Shows full paths for investigation

### Section 3: Template Inventory
- `/templates` count and list (agent-critical)
- `/docs/templates` count and list (human-facing)

### Section 4: Recommendations
- Actionable suggestions for cleanup
- Priority flags for critical issues
- Best practices for maintenance

---

## Usage

### Run Audit
```powershell
npm run audit:repo
```

### Review Output
```powershell
# Latest audit report
ls logs/audit_repo_*.md | sort -Descending | select -First 1 | cat
```

### Schedule Audit
Add to CI/CD or run monthly:
```yaml
# .github/workflows/monthly-audit.yml
name: Monthly Repo Audit
on:
  schedule:
    - cron: '0 0 1 * *'  # First day of each month
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run audit:repo
      - uses: actions/upload-artifact@v3
        with:
          name: audit-report
          path: logs/audit_repo_*.md
```

---

## Interpreting Results

### ✅ Healthy Folder
```
### ✅ templates
- Total Files: 15
- Real Files: 15
- Placeholders: 0
- Empty Directories: 0
```
**Action:** None needed, folder is well-maintained.

### ⚠️ Empty Directories
```
**Empty Directories:**
- governance/committees/PR
- governance/meetings/tier3_engineering
```
**Action:** Add .keep files or populate with content.

### 🔴 Duplicates Found
```
⚠️ Found 2 duplicate version(s):
### codex-single-task-block (v2025.09.17)
- templates/user.chatgpt5.os1p1.codex-single-task-block.v2025.09.17.md
- docs/templates/user.chatgpt5.os1p1.codex-single-task-block.v2025.09.17.md
```
**Action:** Move one to `_archive/` and update references.

---

## Maintenance Protocol

### Monthly Review
1. Run `npm run audit:repo`
2. Review report in `logs/`
3. Address critical issues (duplicates)
4. Consider recommendations (empty dirs, placeholders)
5. Update control folder READMEs if structure changed

### Archive Old Reports
```powershell
# Keep last 6 months of reports
Get-ChildItem logs/audit_repo_*.md | 
  Where-Object { $_.CreationTime -lt (Get-Date).AddMonths(-6) } |
  Remove-Item
```

### Template Cleanup
```powershell
# Example: Archive old template version
Move-Item templates/old-template.v2025.09.01.md templates/_archive/
# Document in archive README
echo "2025-10-10: old-template.v2025.09.01.md → Superseded by v2025.10.10" >> templates/_archive/README.md
```

---

## Integration with Governance

This audit supports:
- **Template Versioning:** Ensures no duplicate versions exist
- **Folder Hygiene:** Keeps control folders clean and documented
- **Agent Reliability:** Prevents confusion from stale/duplicate templates
- **Compliance:** Tracks all policy/governance files

---

## Troubleshooting

### "Cannot find module" error
```powershell
# Ensure you're in repo root
cd d:/OS_One
node scripts/audit_repo.mjs
```

### Report not generated
```powershell
# Check logs directory exists
New-Item -ItemType Directory -Force -Path logs
npm run audit:repo
```

### Permission denied
```powershell
# Windows: Run as Administrator if needed
# Or adjust file permissions
icacls logs /grant Everyone:F
```

---

**Last Updated:** October 10, 2025  
**Version:** 1.0  
**Maintainer:** Agent Gpt5
