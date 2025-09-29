# ops.one.policy.filenaming pointer

## Purpose

Anchors the file naming guardrail for OS.One docs and templates.

## Schema

`<assistant>.<agent>.<project>.<purpose>.v<MM.mm>.<ext>`

## Validation Regex

`^[a-z0-9]+\.[a-z0-9]+\.[a-z0-9]+\.[a-z0-9]+\.v\d{2}\.\d{2}\.[a-z0-9]+$`

## Version & Archive

- Increment `MM` for month-level revisions; increment `mm` for minor adjustments.
- Archive the superseded version under docs or kb archives before publishing the new pointer.
- Keep only the newest active version alongside its archived predecessors.

## Note

This page is the entrypoint for all contributors; the authoritative policy lives alongside KB/policies if duplicated.
