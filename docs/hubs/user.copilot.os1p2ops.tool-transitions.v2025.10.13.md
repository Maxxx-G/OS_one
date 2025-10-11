X-Tier1: user
X-Agent: copilot
X-Domain: os1p2ops
X-Purpose: tool-transitions
X-Version: v2025.10.13
X-Policy: filename+header compliance required

---

# Tool Transition Workflows · OS One Design-to-Deployment Pipeline

**Purpose**: Define handoff protocols for Mobbin → Figma → Replit → Builder.io → Production  
**Scope**: File locations, audit requirements, Git sync rules, security constraints  
**Status**: Operational guidelines for multi-tool development workflow

---

## Overview

OS One uses a staged design-to-deployment pipeline with distinct tools at each phase:

```
Mobbin (Research)
    ↓
Figma (Design)
    ↓
Replit (Development)
    ↓
Builder.io (Marketing)
    ↓
Hostinger/Replit (Production)
```

Each transition has **handoff rules** to maintain consistency, traceability, and security.

---

## 1. Mobbin → Figma (Research to Design)

### Purpose
- **Mobbin**: UI/UX pattern research, competitor analysis, interaction flows
- **Figma**: High-fidelity design, component library, design tokens

### Handoff Protocol

**Input**: Mobbin screenshots, flow diagrams, pattern library bookmarks  
**Output**: Figma design file + references list

**Steps**:

1. **Export Mobbin References**
   - Location: `docs/research/user.copilot.os1design.mobbin-refs.vYYYY.MM.DD.md`
   - Format: Markdown with screenshot links, pattern names, flow descriptions
   - Headers: X-Tier1, X-Agent, X-Domain, X-Purpose, X-Version, X-Policy

2. **Create Figma File**
   - Naming: `OS One — [Feature Name] — vYYYY.MM.DD`
   - Organization: Pages for Desktop, Mobile, Components, Design Tokens
   - Link: Store Figma file URL in references doc

3. **Document Transition**
   - File: `docs/research/user.copilot.os1design.mobbin-to-figma-handoff.vYYYY.MM.DD.md`
   - Contents:
     - Mobbin patterns used
     - Figma file URL
     - Design decisions log
     - Component mapping (Mobbin pattern → Figma component)

**Audit Requirements**:
- ✅ References doc committed to `/docs/research`
- ✅ Figma file URL accessible to team
- ✅ Design tokens exported (future automation)

**Example References Doc**:
```markdown
X-Tier1: user
X-Agent: copilot
X-Domain: os1design
X-Purpose: mobbin-refs
X-Version: v2025.10.13
X-Policy: filename+header compliance required

---

# Mobbin Research References — Chat Interface

## Patterns Analyzed
1. **Linear Chat UI** — Single-column message flow
2. **Anthropic Claude** — Code block rendering
3. **Notion AI** — Inline command palette

## Screenshots
- [Mobbin Link: Linear Chat](https://mobbin.com/...)
- [Mobbin Link: Claude Code](https://mobbin.com/...)

## Key Takeaways
- Use monospace font for code blocks
- Add copy button to code snippets
- Implement smooth scroll-to-bottom on new message
```

---

## 2. Figma → Replit (Design to Development)

### Purpose
- **Figma**: Static design mockups, component specs, design tokens
- **Replit**: Live development environment, rapid prototyping, AI agent collaboration

### Handoff Protocol

**Input**: Figma design file + exported tokens/assets  
**Output**: Replit project with live UI implementation

**Steps**:

1. **Export Design Tokens**
   - Tool: Figma Tokens plugin (or manual export)
   - Format: JSON with colors, typography, spacing, shadows
   - Location: `config/design-tokens.json` (in Replit project)
   - Commit to Git: **Yes** (design tokens are source of truth)

2. **Export Assets**
   - Icons: SVG (store in `public/icons/`)
   - Images: WebP (store in `public/images/`)
   - Fonts: WOFF2 (store in `public/fonts/`)
   - ⚠️ **Do not** commit large binaries (> 1MB) — use CDN or external hosting

3. **Create Replit Project**
   - Name: `os-one-[feature-name]`
   - Template: Next.js 14 + TypeScript + Tailwind
   - Git Sync: **Enabled** (connect to GitHub repo branch)

4. **Document Import Hash**
   - File: `docs/handover/user.copilot.os1p2ops.figma-to-replit-import.vYYYY.MM.DD.md`
   - Contents:
     - Figma file URL
     - Export timestamp
     - SHA-256 hash of `design-tokens.json`
     - Component mapping (Figma layer → React component)
     - Agent prompts used for code generation

**Audit Requirements**:
- ✅ Design tokens JSON committed to Git
- ✅ Import hash document in `/docs/handover`
- ✅ Replit Git sync enabled (pull from GitHub, push to branch)
- ✅ No hardcoded secrets in Replit environment

**Example Import Hash Doc**:
```markdown
X-Tier1: user
X-Agent: copilot
X-Domain: os1p2ops
X-Purpose: figma-to-replit-import
X-Version: v2025.10.13
X-Policy: filename+header compliance required

---

# Figma → Replit Import Log

**Figma File**: [OS One — Chat Interface — v2025.10.13](https://figma.com/...)  
**Export Timestamp**: 2025-10-13T14:30:00.000Z  
**Import Hash (SHA-256)**: `a3f2c1d8b9e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9`

## Component Mapping

| Figma Layer | React Component | File Path |
|-------------|-----------------|-----------|
| ChatContainer | `<ChatContainer />` | `app/chat/ChatContainer.tsx` |
| MessageBubble | `<Message />` | `app/chat/Message.tsx` |
| InputBar | `<ChatInput />` | `app/chat/ChatInput.tsx` |

## Agent Prompts Used

1. "Generate React component from Figma design with Tailwind classes"
2. "Implement SSE chat stream with ReadableStream API"
3. "Add SEC-COMMS gating for local_only mode"

## Design Tokens

Location: `config/design-tokens.json`  
Size: 4.2 KB  
Hash: `a3f2c1d8...`
```

**Git Sync Rules**:
- Replit auto-commits on save (⚠️ noisy commit history)
- Use feature branches: `replit/[feature-name]`
- Squash merge to main after review
- ⚠️ **Never** push directly to main from Replit

---

## 3. Replit → Builder.io (Development to Marketing)

### Purpose
- **Replit**: Core app functionality, API routes, business logic
- **Builder.io**: Marketing pages, landing pages, blog, CMS content

### Handoff Protocol

**Input**: Replit app with `/app` routes  
**Output**: Builder.io marketing pages at `/landing`, `/blog`, `/pricing`

**Steps**:

1. **Restrict Builder.io Scope**
   - **Allowed Routes**: `/landing/*`, `/blog/*`, `/pricing/*`, `/about/*`
   - **Forbidden Routes**: `/api/*`, `/chat/*`, `/lexicore/*`, `/aurora/*`
   - Rationale: Marketing only; no access to authenticated app routes

2. **Export Components from Replit**
   - Create shared component library in `components/marketing/`
   - Export to Builder.io as custom components
   - Register in Builder.io: `builder.init('your-api-key')`

3. **Enable Git Sync in Builder.io**
   - Builder.io → GitHub integration
   - Commits: Save to `builder-content/` directory (separate from app code)
   - Review: All Builder.io changes require PR review (no auto-merge)

4. **Enforce No Secret Pages**
   - Builder.io pages must be public (no auth gates)
   - Use environment variables for API keys (not Builder.io editor)
   - Audit: Run `scripts/tools/user.copilot.os1p2ops.builder-audit.vYYYY.MM.DD.ps1`

**Audit Requirements**:
- ✅ Builder.io routes limited to `/landing`, `/blog`, `/pricing`, `/about`
- ✅ Git sync enabled (builder-content/ directory)
- ✅ No API keys or secrets in Builder.io editor
- ✅ PR review required for all Builder.io commits

**Example Builder Audit Script** (future implementation):
```powershell
# Check builder-content/ for hardcoded secrets
Get-ChildItem -Path "builder-content" -Recurse -Include *.json | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "sk-|AKIA|ghp_") {
        Write-Host "⚠️  Secret found in $($_.Name)" -ForegroundColor Red
    }
}
```

**Deployment Constraint**:
- Builder.io pages deploy to **staging only** until smoke tests pass
- Production deploy: Manual trigger after CI green

---

## 4. Deployment (Replit/Hostinger)

### Purpose
- **Replit**: Quick prototyping, staging environment, AI agent testing
- **Hostinger**: Production hosting, custom domain, SSL/CDN

### Handoff Protocol

**Input**: Replit project with passing smoke tests  
**Output**: Production deployment at `os-one.com` (or custom domain)

**Steps**:

1. **Pre-Deployment Checklist**
   - ✅ All smoke tests PASS (run CI suite)
   - ✅ Guardian blocking mode enabled
   - ✅ Secrets moved to environment variables (no .env in Git)
   - ✅ Vault/embeddings in .gitignore
   - ✅ Build succeeds: `npm run build`
   - ✅ No console errors in production build

2. **Staging Deployment (Replit)**
   - URL: `os-one-staging.replit.app`
   - Environment: `NEXT_PUBLIC_ENV=staging`
   - Test: Run smoke suite against staging URL
   - Duration: 24-48 hours for soak testing

3. **Production Deployment (Hostinger or Replit)**
   - Domain: `os-one.com` (example)
   - SSL: Auto-provisioned (Let's Encrypt)
   - CDN: Cloudflare (optional)
   - Environment: `NEXT_PUBLIC_ENV=production`

4. **Post-Deployment Validation**
   - Run smoke suite against production URL
   - Check telemetry: `/api/telemetry` should return green status
   - Monitor errors: Sentry, Datadog, or custom logger

**Audit Requirements**:
- ✅ Staging deploy PASS before production
- ✅ Smoke tests green on staging
- ✅ Domain configured (DNS, SSL)
- ✅ Environment variables set (no .env file)

**Domain Configuration** (store in README):
```markdown
## Deployment

**Staging**: https://os-one-staging.replit.app  
**Production**: https://os-one.com

### Environment Variables (Production)

- `NEXT_PUBLIC_ENV=production`
- `SECCOMMS_MODE=local_only`
- `OPENAI_API_KEY=<from vault>`
- `DATABASE_URL=<Supabase or other>`
```

---

## Governance & Compliance

### File Naming

All transition documents **must** use compound naming:
```
user.copilot.os1p2ops.[purpose].vYYYY.MM.DD.md
```

**Examples**:
- `user.copilot.os1p2ops.figma-to-replit-import.v2025.10.13.md`
- `user.copilot.os1design.mobbin-refs.v2025.10.13.md`
- `user.copilot.os1p2ops.builder-audit.v2025.10.13.ps1`

### STB Headers

All documents require 6 headers:
```markdown
X-Tier1: user
X-Agent: copilot
X-Domain: os1p2ops
X-Purpose: [descriptive-purpose]
X-Version: v2025.10.13
X-Policy: filename+header compliance required
```

### Guardian Enforcement

- Guardian **blocks** commits with missing headers
- Pre-commit hook validates all `.md`, `.ps1`, `.ts`, `.tsx` files
- CI workflow runs guardian on PR (blocking merge)

---

## Handoff Checklist

Use this checklist for each transition:

### Mobbin → Figma
- [ ] Export Mobbin references to `/docs/research`
- [ ] Create Figma file with naming convention
- [ ] Document transition in handoff file
- [ ] Commit references doc to Git

### Figma → Replit
- [ ] Export design tokens to `config/design-tokens.json`
- [ ] Export assets (SVG, WebP, WOFF2)
- [ ] Create Replit project with Git sync
- [ ] Document import hash in `/docs/handover`
- [ ] Map Figma layers to React components

### Replit → Builder.io
- [ ] Restrict Builder.io to marketing routes only
- [ ] Export shared components to Builder.io
- [ ] Enable Git sync (builder-content/ directory)
- [ ] Audit for secrets in Builder.io content
- [ ] Require PR review for all Builder.io commits

### Deployment (Staging → Production)
- [ ] Run CI smoke suite (all PASS)
- [ ] Deploy to staging (Replit)
- [ ] Soak test for 24-48 hours
- [ ] Run smoke suite on staging URL
- [ ] Deploy to production (Hostinger or Replit)
- [ ] Validate production with smoke suite

---

## Rollback Procedures

### Figma → Replit Rollback
- Delete `config/design-tokens.json` (if import failed)
- Revert to previous Git commit
- Re-export from Figma with corrected tokens

### Replit → Builder.io Rollback
- Delete Builder.io pages (via Builder.io dashboard)
- Revert `builder-content/` directory in Git
- Re-restrict Builder.io route access

### Deployment Rollback
- **Staging**: Redeploy previous commit (`git revert`)
- **Production**: DNS switch to previous version (zero-downtime)
- **Database**: Run migration rollback (if schema changed)

---

## Future Automation

### Week 4-6 Enhancements

1. **Figma API Integration**
   - Auto-export design tokens on Figma save
   - Webhook → CI pipeline → Git commit

2. **Builder.io Audit Script**
   - PowerShell script to scan `builder-content/` for secrets
   - Run in CI before merge

3. **Deployment Pipeline**
   - GitHub Actions workflow for staging/production
   - Auto-deploy on merge to `main` (with smoke tests)

---

## References

- **Figma Tokens Plugin**: https://www.figma.com/community/plugin/843461159747178978
- **Builder.io Git Sync**: https://www.builder.io/c/docs/git-sync
- **Replit Git Sync**: https://docs.replit.com/programming-ide/using-git-on-replit

---

**Last Updated**: v2025.10.13  
**Next Review**: v2025.11.01 (after Week 2 dual-agent trial)
