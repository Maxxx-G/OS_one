#!/usr/bin/env node
const { execSync } = require("node:child_process");
const branch = (process.env.GIT_BRANCH || execSync('git rev-parse --abbrev-ref HEAD').toString().trim());
const files = execSync('git diff --name-only --staged || true').toString().trim().split('\n').filter(Boolean);
const allowUI = (f) => /^apps\/web-ui\//.test(f) || /^docs\//.test(f) || /^policies\/env\//.test(f);
const allowArchon = (f) => /^integrations\/archon\//.test(f) || /^ops\//.test(f) || /^docs\//.test(f);
let ok = true, bad = [];
if (/^feat\/ui-/.test(branch)) { bad = files.filter(f => !allowUI(f)); ok = bad.length===0; }
if (/^feat\/archon-/.test(branch)) { bad = files.filter(f => !allowArchon(f)); ok = bad.length===0; }
if (!ok) {
  console.error(`[pathguard] Branch ${branch} cannot modify:\n - ` + bad.join('\n - '));
  process.exit(2);
}
console.log(`[pathguard] OK on ${branch} (${files.length} staged files)`);
