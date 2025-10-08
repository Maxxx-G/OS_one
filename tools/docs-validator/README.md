# OS One Docs Validator (v2025.10.06)

CLI tool enforcing documentation guardrails defined in:
- docs/templates/user.chatgpt5.os1p1.docs-creation-guidelines.v2025.10.05.md
- docs/templates/user.chatgpt5.os1p1.docs-validation-checklist.v2025.10.05.md
- docs/templates/user.chatgpt5.os1p1.docs-validator-spec.v2025.10.05.md

## Usage
node tools/docs-validator/validator.mjs docs/templates --strict

## Checks
- Tier-1 regex filename pattern
- Header version alignment
- Canonical path references
- One-Fence Rule compliance for STBs
- Required section order (Creation Guidelines)

## Exit Codes
- 0 = all checks passed or warnings only (advisory mode)
- 1 = failures detected in strict mode

## Roadmap
- JSON output via --json flag
- CI integration for pull requests
- Configurable rule allowlists per folder
