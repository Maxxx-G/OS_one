#!/usr/bin/env node
import { existsSync } from 'fs';
import { execSync } from 'child_process';

const must = [
  'apps/web-ui/app/layout.tsx',
  'apps/web-ui/components/LeftNav.tsx',
  'apps/web-ui/components/RightPane.tsx',
  'apps/web-ui/components/AgentToolbar.tsx',
  'apps/web-ui/components/FooterMode.tsx',
  'apps/web-ui/components/Onboarding.tsx',
  'apps/web-ui/components/SecCommsPill.tsx',
  'docs/HANDOVER_PHASE1.md',
];

const missing = must.filter((p) => !existsSync(p));
if (missing.length) {
  console.error('? Missing handover files:\n' + missing.join('\n'));
  process.exit(1);
}

const git = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();
const branch = git('git rev-parse --abbrev-ref HEAD');
const rev = git('git rev-parse --short HEAD');

console.log('? Snapshot OK � branch:', branch, 'rev:', rev);
console.log('? Handover doc present. Ready to tag Phase-1.');
