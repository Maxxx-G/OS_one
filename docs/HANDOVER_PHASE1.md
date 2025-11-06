# OS One � Phase-1 Handover (UI/UX Launch)

**Status:** GREEN (verify + format + encoding pass)  
**Default Mode:** Mediated (Direct is opt-in)

## What�s Included

- Three-pane UI skeleton (LeftNav � Center Chat � Right Pane)
- Toolbar: Agent switch � Direct toggle � Quick Test � Context pill � Help (onboarding)
- Footer: Mediated/Direct badge with current agent
- Onboarding overlay (3 slides) + guard markers (`.guard-readme.md`, `.context-guard.md`, `.onboarding-guard.md`, `.seccomms-guard.md`, `.threepane-guard.md`)
- SEC-COMMS placeholder pill + policy modal (Phase-2 preview)
- Context stub: `/api/context` + modal showing live agent state
- Encoding hardened to UTF-8 (no BOM) via `.editorconfig`, `.gitattributes`, `.vscode/settings.json`
- Verifiers: `verify-phase1.mjs`, `verify-encoding.mjs`, formatting scripts (`fmt`, `fmt:seccomms`), `npm run verify`

## How to Run

```bash
npm install
npm run dev            # UI served from http://localhost:4000
npm run verify         # phase guards + prettier + encoding
npm run snapshot:phase1  # confirm handover files are present
```

## Verification Checklist

- `npm run verify` ? success (phase guard stub, Prettier, encoding)
- `npm run verify:encoding` ? �? All checked files are UTF-8 (no BOM).�
- `npm run fmt:seccomms` (optional) keeps SEC-COMMS files consistent with Prettier

## Next Milestones

- **Phase-2:** Overwatch UI (always-on brain, hands-free, onboarding/settings)
- **Phase-3:** SEC-COMMS morph (contacts left, comms panel right; paid tiers)

## References

- Design drafts: `D:\OS_One\kb\design\ui_ux\drafts`
- Project plan: `docs/templates/user.chatgpt5.os1p1.project-plan.v2025.09.23.md`
