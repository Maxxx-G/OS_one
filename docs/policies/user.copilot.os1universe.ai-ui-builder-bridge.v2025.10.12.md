# AI UI Builder Bridge — Specification · v2025.10.12

**X-Tier1**: user  
**X-Agent**: copilot  
**X-Domain**: os1universe  
**X-Purpose**: ai-ui-builder-bridge  
**X-Version**: v2025.10.12  
**X-Policy**: filename+header compliance required

---

## Goal
Enable an **AI UI builder** to read OS One codebases, policies, and schemas to synthesize UI flows and **round-trip** changes back to GitHub safely. This bridge creates a structured contract for AI-driven development while maintaining security, compliance, and human oversight.

---

## Principles

### 1. Read-Only by Default
- AI builder has **read access** to public repos and specified directories
- **Write actions** are gated by PR policy + SEC-COMMS identity (δ)
- No direct commits to main branches without human approval

### 2. Filenaming Compliance
- All generated artifacts follow **compound identifier policy** (v2025.10.11)
- Pattern: `user.copilot.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.{ext}`
- STB validation (`npm run validate:stb`) must pass before PR submission

### 3. Deterministic Builds
- Smoke tests (`npm run smoke`) must pass
- Header checks must pass
- Secrets scan must pass
- No breaking changes to existing APIs

### 4. Human-in-the-Loop
- All PRs require human review and approval
- Auto-revert if smoke tests fail in CI
- Rollback snippets included in PR description

---

## Bridge Contract (MVP)

The AI UI Builder follows a **5-phase workflow** to ensure safe, compliant code generation:

### Phase 1: Discovery
**Purpose**: Scan repository structure to understand project context

**Actions**:
- Read `/docs/**` for policies, specs, and templates
- Read `/templates/**` for STB templates and system instructions
- Read `/apps/**` for existing code patterns
- Read `package.json` for dependencies and scripts
- Read `README.md` for project overview

**Output**: Repository manifest with:
- Policy files (filenaming, security, compliance)
- Schema files (JSON schemas for data models)
- STB templates (Single Task Block format)
- Existing routes and components
- Available SEC-COMMS layers (α–η)

**Example Manifest**:
```json
{
  "policies": [
    "docs/policies/user.copilot.docs.stb-filename-header-policy.v2025.10.10.md",
    "docs/policies/user.copilot.security-smoke.v2025.10.10.md"
  ],
  "schemas": [
    "docs/hubs/user.copilot.os1universe.genesis-app-registry.v2025.10.12.json"
  ],
  "templates": [
    "docs/templates/user.copilot.docs.stb-template.v2025.10.10.md"
  ],
  "routes": [
    "/api/telemetry",
    "/api/replay",
    "/api/memory"
  ],
  "seccomms": ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta"]
}
```

### Phase 2: Plan Draft
**Purpose**: Generate STB (Single Task Block) planning document

**Actions**:
- Analyze user request (e.g., "Create AuroraWire news feed component")
- Break down into tasks (≤6 per STB)
- Generate STB document following template
- Include constraints, changes, acceptance criteria, rollback

**Output**: STB markdown file  
**Filename**: `user.copilot.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.md`

**Example**:
```markdown
# OS1 — STB · v2025.10.12 (aurora-wire-feed-init)

X-Tier1: user
X-Agent: copilot
X-Domain: os1p1webui
X-Purpose: aurora-wire-feed-init
X-Version: v2025.10.12
X-Policy: filename+header compliance required

Context: Create news feed component for AuroraWire with SEC-COMMS α validation...
```

### Phase 3: Synthesis
**Purpose**: Generate code with minimal footprint

**Actions**:
- Create files under `apps/web-ui/**` following Next.js App Router structure
- Reuse existing patterns (e.g., telemetry page layout)
- Import SEC-COMMS guards where needed
- Follow TypeScript best practices
- Keep bundle size minimal (no heavy deps)

**Constraints**:
- ≤5 files per STB
- No new `package.json` dependencies without justification
- Edge runtime where possible (Node.js when fs access needed)
- Respect CSP/HSTS/COOP/COEP headers

**Output**: Code files + STB document

**Example File Structure**:
```
apps/web-ui/app/aurora-wire/
  page.tsx              (main feed UI)
apps/web-ui/app/api/aurora-wire/
  route.ts              (feed endpoint)
apps/web-ui/lib/
  aurora-feed.ts        (feed logic)
docs/stb/
  user.copilot.os1p1webui.aurora-wire-feed-init.v2025.10.12.md
```

### Phase 4: Validation
**Purpose**: Ensure compliance before PR submission

**Actions**:
1. Run `npm run validate:stb` (filename + header compliance)
2. Run `npm --prefix apps/web-ui run build` (Next.js build)
3. Run smoke tests (if applicable)
4. Check for secrets leakage
5. Verify no CSP/SEC-COMMS regressions

**Output**: Validation report

**Success Criteria**:
```
✅ STB validation: All files compliant
✅ Build: Green (no TypeScript errors)
✅ Smoke tests: All passed
✅ Secrets scan: No leaks detected
✅ Security headers: No regressions
```

### Phase 5: Round-Trip (PR Submission)
**Purpose**: Submit changes via GitHub Pull Request

**Actions**:
- Create branch: `feature/aurora-wire-feed-init`
- Commit with signed metadata (ES256 identity)
- Open PR with structured description
- Tag reviewers
- Monitor CI pipeline

**PR Description Template**:
```markdown
## STB: Aurora Wire Feed Init

**STB File**: `user.copilot.os1p1webui.aurora-wire-feed-init.v2025.10.12.md`

### Summary
Implements news feed component for AuroraWire with SEC-COMMS α validation.

### Files Changed
- `apps/web-ui/app/aurora-wire/page.tsx` (created)
- `apps/web-ui/app/api/aurora-wire/route.ts` (created)
- `apps/web-ui/lib/aurora-feed.ts` (created)

### Validation
✅ STB compliance: PASS
✅ Build: GREEN
✅ Smoke tests: PASS

### Affected Policies
- Filenaming: Compliant with compound identifier policy
- Security: No CSP/HSTS regressions

### Rollback
```bash
git restore --staged -W .
git checkout HEAD -- apps/web-ui/app/aurora-wire apps/web-ui/app/api/aurora-wire apps/web-ui/lib/aurora-feed.ts
```

### Commit Signature
ES256: `eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...` (signed by AI builder identity)
```

---

## Safeguards

### 1. SEC-COMMS Mode Enforcement
**Rule**: No external egress in `local_only` mode

**Implementation**:
- AI builder checks `SEC_COMMS.mode` before generating network calls
- If `local_only`, only localhost endpoints allowed
- If `seccomms_on`, trusted peers only (origin validation)

### 2. Pull Request Gating
**Requirements**:
- PR must include:
  - Diff summary
  - List of affected policies
  - Rollback snippet
  - Validation report
  - ES256 signature (identity proof)

**Auto-Revert**:
- If CI smoke tests fail → auto-close PR and revert
- If secrets detected → auto-close PR and alert
- If CSP regression → block merge

### 3. Human Review
**Mandatory for**:
- New API routes
- Changes to middleware/security
- Database schema changes
- Dependency additions

**Optional for**:
- UI component additions (no backend changes)
- Documentation updates
- Test file additions

### 4. Rate Limiting
**Constraints**:
- Max 5 PRs per day (per AI builder identity)
- Max 20 files changed per PR
- Max 2000 lines of code per PR

---

## Future Enhancements

### Multi-Repo Workspace
**Goal**: Enable AI builder to work across multiple related repos

**Example**:
- Read from `OS_One` (main app)
- Read from `OS_One_Docs` (documentation)
- Read from `OS_One_Plugins` (marketplace)

**Challenge**: Ensure cross-repo consistency

### Plugin Marketplace
**Goal**: AI-generated plugins with signing and curation

**Workflow**:
1. AI generates plugin (follows plugin schema)
2. Submits to marketplace repo
3. Automated security audit
4. Cryptographic signing if approved
5. Published to marketplace

### Visual Diff Approvals in Telemetry (η)
**Goal**: In-app PR review with visual diffs

**Features**:
- Render code diffs in `/telemetry` dashboard
- Inline approve/reject buttons
- Real-time CI status
- One-click rollback

---

## API Contract

The AI UI Builder exposes a REST API for integration:

### POST `/ai-builder/discover`
**Request**:
```json
{
  "repo": "Maxxx-G/OS_One",
  "branch": "main"
}
```

**Response**:
```json
{
  "manifest": { ... },
  "policies": [ ... ],
  "schemas": [ ... ]
}
```

### POST `/ai-builder/plan`
**Request**:
```json
{
  "task": "Create AuroraWire news feed",
  "manifest": { ... }
}
```

**Response**:
```json
{
  "stb": "user.copilot.os1p1webui.aurora-wire-feed-init.v2025.10.12.md",
  "content": "# OS1 — STB · v2025.10.12 ..."
}
```

### POST `/ai-builder/synthesize`
**Request**:
```json
{
  "stb": "user.copilot.os1p1webui.aurora-wire-feed-init.v2025.10.12.md"
}
```

**Response**:
```json
{
  "files": [
    { "path": "apps/web-ui/app/aurora-wire/page.tsx", "content": "..." },
    { "path": "apps/web-ui/app/api/aurora-wire/route.ts", "content": "..." }
  ]
}
```

### POST `/ai-builder/validate`
**Request**:
```json
{
  "files": [ ... ]
}
```

**Response**:
```json
{
  "stb_validation": "PASS",
  "build": "GREEN",
  "smoke": "PASS",
  "secrets": "CLEAN"
}
```

### POST `/ai-builder/submit-pr`
**Request**:
```json
{
  "branch": "feature/aurora-wire-feed-init",
  "files": [ ... ],
  "stb": "...",
  "signature": "eyJhbGci..."
}
```

**Response**:
```json
{
  "pr_url": "https://github.com/Maxxx-G/OS_One/pull/123",
  "status": "pending_review"
}
```

---

## Security Considerations

### Identity Verification (δ)
- AI builder must have ES256 keypair
- All commits signed with private key
- Public key registered in OS One identity registry

### Audit Trail (ε)
- All AI-generated changes logged in vault
- Timestamp, identity, task description stored
- Searchable via replay (ζ)

### Ethics Enforcement
- AI builder cannot bypass SEC-COMMS modes
- Cannot disable security headers
- Cannot modify vault/embeddings directly
- Cannot access Tier III features without authorization

---

## Example Workflow

**User Request**: "Create a news feed component for AuroraWire"

**AI Builder Actions**:
1. **Discovery**: Scans repo, finds telemetry page pattern, SEC-COMMS α guard
2. **Plan**: Generates STB with 4 tasks (page, API route, feed logic, smoke test)
3. **Synthesis**: Creates 3 files (page.tsx, route.ts, aurora-feed.ts)
4. **Validation**: Runs checks, all pass
5. **PR Submission**: Opens PR #123 with signed commit

**Human Review**:
- Reviewer checks diff
- Verifies STB compliance
- Tests locally
- Approves and merges

**Result**: AuroraWire feed live in production

---

## References

### STB Template
- `docs/templates/user.copilot.docs.stb-template.v2025.10.10.md`

### Filenaming Policy
- `docs/policies/user.copilot.docs.stb-filename-header-policy.v2025.10.10.md`

### SEC-COMMS Specifications
- Delta (δ): `docs/reports/user.copilot.seccomms-delta-completion.v2025.10.11.md`
- Epsilon (ε): `docs/policies/user.copilot.os1p2vault.persistence-spec.v2025.10.11.md`
- Zeta (ζ): `docs/policies/user.copilot.os1p2replay.spec.v2025.10.12.md`

### Genesis Series Hub
- `docs/hubs/user.copilot.os1universe.genesis-hub.v2025.10.12.md`

---

**Author**: Gabriel (OS One Assistant)  
**Last Updated**: 2025-10-12  
**Status**: Active — Specification for AI UI Builder integration
