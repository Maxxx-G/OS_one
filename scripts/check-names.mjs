#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { basename } from 'node:path';

const HELP = `
Usage:
  node scripts/check-names.mjs --staged        # validate staged files only (recommended)
  node scripts/check-names.mjs --docs          # validate docs/templates/**/*.md (manual sweep)
  node scripts/check-names.mjs --files a b c   # validate specific files
Rule:
  assistant.agent.project.purpose.vMM.mm.ext
  assistant.agent.project.purpose.vYYYY.MM.DD.ext
Notes:
  - dots between segments
  - use hyphens INSIDE any multi-word segment (e.g., new-employee-induction)
  - lowercase a-z, digits 0-9, and hyphens only inside a segment
`;

const args = process.argv.slice(2);
if (args.includes('--help') || args.length === 0) {
  console.log(HELP.trim());
  process.exit(0);
}

const PATTERN =
  /^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+\.v(?:\d{2}\.\d{2}|\d{4}\.\d{2}\.\d{2})\.[a-z0-9]+$/;

function listStagedFiles() {
  const out = execSync('git diff --name-only --cached', { encoding: 'utf8' }).trim();
  return out ? out.split('\n') : [];
}

function listDocsTemplates() {
  try {
    const out = execSync('git ls-files "docs/templates/**" "kb/**"', { encoding: 'utf8' }).trim();
    return out ? out.split('\n') : [];
  } catch {
    return [];
  }
}

function sliceFilesAfterFlag(flag) {
  const index = args.indexOf(flag);
  if (index === -1) return [];
  return args.slice(index + 1);
}

function filterFiles(files) {
  return files
    .filter(Boolean)
    .map((f) => f.trim())
    .filter((f) => f && existsSync(f))
    .filter((f) => !f.startsWith('.git/') && !f.includes('node_modules/'));
}

function check(files) {
  const bad = [];
  for (const file of files) {
    const name = basename(file);
    const likelyDoc = name.toLowerCase().endsWith('.md');
    if (!likelyDoc) continue;
    if (!PATTERN.test(name)) bad.push(file);
  }
  return bad;
}

let files = [];
if (args.includes('--staged')) {
  files = filterFiles(listStagedFiles());
} else if (args.includes('--docs')) {
  files = filterFiles(listDocsTemplates());
} else if (args.includes('--files')) {
  files = filterFiles(sliceFilesAfterFlag('--files'));
} else {
  console.error('Unknown option. Use --help for usage.');
  process.exit(1);
}

const bad = check(files);
if (bad.length) {
  console.error('\nFilename policy violation(s):');
  for (const b of bad) console.error(' -', b);
  console.error(`
Required pattern:
  assistant.agent.project.purpose.vMM.mm.ext
  assistant.agent.project.purpose.vYYYY.MM.DD.ext

Segment rules:
  - dots between segments
  - use hyphens INSIDE multi-word segments (e.g., new-employee-induction)
  - lowercase alphanumerics only

Examples:
  user.chatgpt5.os1p1.project-plan.v2025.09.23.md
  user.codex.os1p1.single-task-block.v2025.09.26.md
  tiffany.gemini-pro.os1p1.new-employee-induction.v2025.09.19.md
`);
  process.exit(2);
}

console.log(`OK: filename policy passed for ${files.length} file(s).`);
