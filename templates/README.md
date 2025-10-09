# `/templates` — Agent-Critical Templates (Runtime Priority)

**Purpose:** Authoritative, version-controlled templates read by AI agents on **every transaction**.

**Status:** Canonical source of truth (as of v2025.10.10)

---

## Directory Purpose

This `/templates` folder at the repository root contains **agent-facing templates** that are:
- Read programmatically by AI agents (Agent Gpt5, Gabriel, etc.)
- Version-controlled with strict naming conventions
- Required for Single Task Block (STB) workflows
- Updated only through formal governance processes

---

## Naming Convention

All files follow this pattern:
```
{role}.{system}.{domain}.{topic}.v{YYYY}.{MM}.{DD}.md
```

**Examples:**
- `user.chatgpt5.os1p1.codex-single-task-block.v2025.09.17.md`
- `user.chatgpt5.os1p1.system-instructions-block.v2025.09.17.md`
- `agent.gpt5.os1.execution-protocol.v2025.10.10.md`

---

## Current Templates

### Execution & Planning
- **Single Task Block (STB)** → `user.chatgpt5.os1p1.codex-single-task-block.v2025.09.17.md`
  - Core development workflow template
  - Defines ≤5 files, ≤50 lines/file constraints
  - Unified diff format with commit messages

- **System Instructions** → `user.chatgpt5.os1p1.system-instructions-block.v2025.09.17.md`
  - Agent initialization protocol
  - Behavioral guidelines and constraints
  - Context management rules

- **Project Plan Template** → `OS1-PROJ-TEMPLATE.v2025.09.17.md`
  - Master project plan structure
  - Phase tracking and milestone definitions
  - Governance model reference

### Policies & Standards
- **Verbs Reference** → `user.chatgpt5.os1p1.verbs-reference.v2025.09.26.md`
  - Canonical action vocabulary
  - Command structure definitions
  - API verb standards

- **File Naming Policies** → `user.chatgpt5.os1p1.filenaming-policies.v2025.10.4.md`
  - Repository-wide naming conventions
  - Template versioning scheme
  - Archive/deprecation protocols

---

## vs. `/docs/templates`

| Location | Purpose | Audience | Read Frequency |
|----------|---------|----------|----------------|
| `/templates` | **Agent-critical runtime** | AI agents | Every transaction |
| `/docs/templates` | Human documentation samples | Developers | On-demand reference |

**Rule:** If an agent reads it programmatically → `/templates`. If a human references it occasionally → `/docs/templates`.

---

## Governance

### Template Updates
1. **Propose:** Submit STB with versioned filename (increment date)
2. **Review:** Governance Tier 1 (Founders + AI) approval required
3. **Archive:** Previous version moved to `/templates/_archive/`
4. **Activate:** New version becomes canonical reference

### Version Control
- **Never delete** old templates (archive instead)
- **Never edit** existing versions (create new version)
- **Always increment** date in filename (v2025.MM.DD)
- **Always document** changes in template header

---

## Adding New Templates

### Required Sections
1. **Title & Metadata** (version, date, role, system, domain)
2. **Purpose** (one-sentence objective)
3. **Structure** (required sections/format)
4. **Examples** (at least one concrete sample)
5. **Verification** (how to validate compliance)
6. **Version History** (changelog from previous versions)

### File Checklist
- [ ] Filename follows naming convention
- [ ] Version date is today or future
- [ ] Header includes all metadata
- [ ] Superseded templates moved to `_archive/`
- [ ] Updated in this README's "Current Templates" section
- [ ] Referenced in `/docs/PROJECT_PLAN_v2025.10.10.md`

---

## Agent Instructions

When reading templates from this directory:

1. **Priority Order:**
   - `/templates/*.md` (canonical, always current)
   - `/docs/templates/*.md` (fallback, human-facing)
   - `/templates/_archive/*.md` (historical reference only)

2. **Version Selection:**
   - Always use the **highest date version** of a given template
   - Ignore archived versions unless explicitly requested
   - Validate filename matches `v{YYYY}.{MM}.{DD}` pattern

3. **Caching:**
   - Re-read templates on each new conversation session
   - Do not cache templates across sessions
   - Assume templates may update between sessions

---

## Audit & Maintenance

### Periodic Review (Monthly)
- Run `node scripts/audit_templates.mjs` to check for:
  - Orphaned files (no reference in README)
  - Duplicate versions (same date, different content)
  - Empty placeholders (.keep files)
  - Missing metadata headers

### Archive Protocol
```powershell
# Move superseded template to archive
Move-Item templates/old-template.v2025.09.01.md templates/_archive/
# Add archival note to README
echo "Archived: old-template.v2025.09.01.md → Superseded by v2025.10.10" >> templates/_archive/CHANGELOG.md
```

---

## Contact

**Template Governance:** Tier 1 (Founders + AI)  
**Current Maintainer:** Agent Gpt5 (Systems Architect, Nexxis-Gen)  
**Last Audit:** 2025-10-10  
**Next Review:** 2025-11-10

---

**Last Updated:** October 10, 2025  
**Schema Version:** 1.0
