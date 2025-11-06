#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';

const roots = ['apps/web-ui'];
const exts = new Set(['.ts', '.tsx', '.js', '.mjs', '.css', '.md']);
const bad = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (exts.has(extname(p))) check(p);
  }
}

function check(p) {
  const buf = readFileSync(p);
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    bad.push([p, 'BOM present']);
    return;
  }
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    bad.push([p, 'invalid UTF-8']);
  }
}

for (const r of roots) walk(r);

if (bad.length) {
  console.error('? Encoding issues found:');
  for (const [p, why] of bad) console.error(' -', p, '=>', why);
  process.exit(1);
}

console.log('? All checked files are UTF-8 (no BOM).');
