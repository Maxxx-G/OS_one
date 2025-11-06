X-Tier1: user
X-Agent: copilot
X-Domain: os1p1docs
X-Purpose: docs-validation-checklist
X-Version: v2025.10.05
X-Policy: filename+header compliance required

# OS One - Documentation Validation Checklist (v2025.10.05)

## Purpose
Operational checklist to verify new or updated docs meet OS One guardrails before merge.

## Filename and Header
- [ ] Filename follows Tier-1 regex:
      ^[a-z0-9]+\.[a-z0-9]+\.[a-z0-9]+\.[a-z0-9-]+\.v\d{4}\.\d{2}\.\d{2}\.[a-z0-9]+$
- [ ] Header includes version `(vYYYY.MM.DD)` that exactly matches filename.
- [ ] Purpose segment uses hyphens only (no underscores or extra symbols).

## Structure
- [ ] Contains Required Sections (see Creation Guidelines).
- [ ] Concise sections; no redundant boilerplate.

## Links and Canonical Paths
- [ ] All internal references point to canonical folders:
      - Templates or policies -> `docs/templates/`
      - Project plans -> `docs/project_plans/`
      - Archives -> `docs/_archive/`
- [ ] No dead links.

## STB-Specific (if doc includes STBs)
- [ ] One-Fence Rule observed (0 or exactly 2 fences in the whole STB).
- [ ] Inner "file contents" use 4-space indentation, not nested fences.
- [ ] <=5 files per change; clear Rollback and Commit sections present.

## Policy Alignment
- [ ] Filenaming policy cited if naming rules discussed.
- [ ] If doc affects communications or behaviors, cite Speech, Async, or Sensory policies.

## Archive and Version
- [ ] Superseded versions moved to `docs/_archive/` (same filename).
- [ ] Version bumped appropriately (date-based).

## Sign-off
- [ ] Reviewer initials and date
- [ ] Optional: quick PowerShell or grep checks run
