# OS One - Telemetry Runtime Rules (v2025.10.07)

## Purpose
Define runtime constraints for telemetry emission, batching, validation, and retention so profit tracking remains aligned with ethics enforcement.

## Scope
Applies to client emitters, edge/API handlers, and storage services responsible for profit telemetry within OS One.

## Canonical Location(s)
- Primary: `policies/`
- Archive: `policies/_archive/` (retain filename when superseded)

## Dependencies/References
- Profit Telemetry Spec: `policies/user.chatgpt5.os1p1.profit-telemetry-spec.v2025.10.07.md`
- Ethics Core Values: `policies/user.chatgpt5.os1p1.ethics-core-values.v2025.10.06.md`
- Profit Matrix Policy: `policies/user.chatgpt5.os1p1.profit-matrix-policy.v2025.10.06.md`
- Memory Policy: `docs/templates/user.chatgpt5.os1p1.memory-policy.v2025.10.06.md`
- Docs Creation Guidelines: `docs/templates/user.chatgpt5.os1p1.docs-creation-guidelines.v2025.10.05.md`

## Body

### Split Architecture
| Layer | Role | Asset | Notes |
| --- | --- | --- | --- |
| Client | Emit batched telemetry via `sendBeacon` or `fetch` | `emitter.ts` (front-end SDK) | Debounced to ?10 Hz per session |
| Edge/API | Validate payloads and append to storage | `/api/telemetry/profit/route.ts` | Enforces Profit Telemetry Spec schema |
| Storage | Maintain append-only daily logs | `/telemetry/profit/YYYY-MM-DD.log` | Auto-rotated at UTC midnight |

### Operational Rules
1. **Emission Frequency**: Client throttles events to ?10 Hz per session (debounce in emitter SDK).
2. **Batching**: Buffer up to 10 events or 1000 ms before dispatch; flush immediately on visibility change.
3. **Transport**: Prefer `navigator.sendBeacon`; fallback to POST `/api/telemetry/profit` using `fetch` with retry backoff.
4. **Validation**: Edge/API verifies fields against Profit Telemetry Spec and rejects unknown or malformed keys with HTTP 422.
5. **Retention**: Store data for 30 days; prune older logs nightly. Retention extensions require Memory Policy review.
6. **Rotation**: Begin a new log file per UTC day; move expired logs to `/telemetry/_archive/` before deletion.
7. **Ethics Enforcement**: Reject events where `ethic` is below `PRIMACY` while `action = "upgrade_prompt"` or `revenue_impact > 0`.
8. **Storage Integrity**: Append-only writes; optionally compute SHA256 per line and log checksums in `/telemetry/profit/_integrity.log`.

### File Structure
```
/telemetry/
??? profit/
    ??? 2025-10-07.log
    ??? 2025-10-08.log
    ??? _archive/
```

### Runtime Compliance Checklist
- [ ] Client emitter rate limit verified during QA.
- [ ] `sendBeacon` path functional; `fetch` fallback exercised.
- [ ] API schema validation enabled and monitored.
- [ ] 30-day pruning automation operational.
- [ ] Ethics Core enforcement integrated with rejection telemetry.
- [ ] Log rotation verified across UTC boundaries.

## Stability Guardrails
- Runtime changes must keep within One-Fence STB limits and update Profit Telemetry Spec simultaneously.
- Any adjustment to batching or retention requires governance approval and Memory Policy sign-off.

## Version & Archive
- Increment `vYYYY.MM.DD` when modifying frequency limits, batching thresholds, or retention rules.
- Archive superseded versions in `policies/_archive/telemetry/` retaining the filename.

## Acceptance
- Runtime rules enforce the Profit Telemetry Spec schema and ethics gating requirements.
- Storage layout and retention processes documented for operators.
- References resolve to active governance documents.

## Notes
- Future revisions may integrate privacy budgets or adaptive sampling for high-volume tiers.
