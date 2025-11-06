#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function mtime(p) {
  try {
    return fs.statSync(p).mtime;
  } catch {
    return null;
  }
}

function groupFor(name) {
  if (name.startsWith('.chat-')) return 'chat';
  if (name.startsWith('.audit-')) return 'audit';
  if (name.startsWith('.session-')) return 'session';
  if (name.startsWith('.prefs-')) return 'prefs';
  if (name.startsWith('.bmad-')) return 'bmad';
  if (name.startsWith('.sec-')) return 'sec';
  return 'other';
}

const root = path.resolve(process.cwd(), 'apps/web-ui/app/(checks)');
const out = path.resolve(process.cwd(), 'docs/PHASE_2_PROGRESS.md');

if (!fs.existsSync(root)) {
  console.error(`[aggregate_guards] Directory not found: ${root}`);
  process.exit(1);
}

const files = fs
  .readdirSync(root)
  .filter((f) => f.endsWith('.md'))
  .sort();

const entries = files.map((f) => {
  const p = path.join(root, f);
  return { name: f, path: p, group: groupFor(f), mtime: mtime(p) };
});

// Build summary
let buf = `# Phase-2 Progress Log\n\nGenerated from guard docs in \`apps/web-ui/app/(checks)\`.\n\n`;
buf += `## Checklist Summary\n`;

const groups = Array.from(new Set(entries.map((e) => e.group)));
for (const g of groups) {
  const groupItems = entries.filter((e) => e.group === g);
  if (!groupItems.length) continue;
  buf += `\n### ${g}\n`;
  for (const e of groupItems) {
    const ts = e.mtime ? new Date(e.mtime).toISOString().slice(0, 19).replace('T', ' ') : 'n/a';
    const anchor = e.name.replace(/\./g, '').replace(/[^a-z0-9\-]+/gi, '');
    buf += `- ✅ [${e.name}](#${anchor}) — _${ts}_\n`;
  }
}
buf += `\n---\n\n`;

// Build detailed sections
for (const f of files) {
  const p = path.join(root, f);
  const content = fs.readFileSync(p, 'utf-8');
  buf += `## ${f}\n\n${content}\n\n`;
}

fs.writeFileSync(out, buf, 'utf-8');
console.log(`[aggregate_guards] Wrote ${out} with ${files.length} entries`);
