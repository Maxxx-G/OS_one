# OS One � Changelog

## 2025-09-29 � Encoding Hardening (Windows)

- Enforced **UTF-8 (no BOM)** across repo via `.editorconfig`, `.gitattributes`, `.vscode/settings.json`.
- Added `scripts/verify-encoding.mjs` and wired `npm run verify:encoding` (also included in `npm run verify`).
- Note: Previous ASCII rewrites (e.g., `FooterMode.tsx`, `LeftNav.tsx`, `RightPane.tsx`) were temporary unblocks. UTF-8 is now the canonical encoding.\n\n## 2025-09-29 � Phase-1 Green-Light Cleanup\n- \
  pm run verify\ now passes end-to-end (phase guards + Prettier + encoding).\n- Added \docs/HANDOVER_PHASE1.md\ (canonical summary).\n- Added snapshot script and npm scripts to streamline final tagging.\n
