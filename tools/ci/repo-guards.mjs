#!/usr/bin/env node
// OS One Repo Guards (v2025.10.06) ? Next.js boundary + feature-gate checks
import fs from "fs";
import path from "path";

const root = process.cwd();
const IGNORE_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "coverage"]);
let errors = 0;

function walk(dir, filterFn = () => true) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(fullPath, filterFn));
    } else if (filterFn(fullPath)) {
      out.push(fullPath);
    }
  }
  return out;
}

// 1) Next.js boundary check: no onClick in files lacking 'use client'
const tsxFiles = walk(path.join(root, "apps"), file => file.endsWith(".tsx"));
for (const file of tsxFiles) {
  const txt = fs.readFileSync(file, "utf8");
  const trimmed = txt.trimStart();
  const isClient = trimmed.startsWith("'use client'") || trimmed.startsWith('"use client"');
  const hasOnClick = /\bonClick\s*=\s*/.test(txt);
  if (!isClient && hasOnClick) {
    console.log(`? Server Component with onClick: ${path.relative(root, file)}`);
    errors += 1;
  }
}

// 2) Feature gate check: routes that look featureful must gate
const apiRoutes = walk(path.join(root, "apps"), file => /\\/app\\/api\\/.+\\/route\\.ts$/.test(file));
const keywords = ["calendar", "time", "voice", "memory", "contacts"];
for (const file of apiRoutes) {
  const txt = fs.readFileSync(file, "utf8");
  const featureHit = keywords.some(keyword => txt.includes(keyword));
  const hasGateImport = /withFeatureGate/.test(txt);
  if (featureHit && !hasGateImport) {
    console.log(`??  Missing withFeatureGate in API route: ${path.relative(root, file)}`);
    errors += 1;
  }
}

console.log("---");
console.log(`Repo guard checks complete. Failures: ${errors}`);
process.exit(errors > 0 ? 1 : 0);
