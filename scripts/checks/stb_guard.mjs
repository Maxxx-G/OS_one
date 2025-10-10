#!/usr/bin/env node
// Zero-tolerance repo guardian (Node 18+, Windows-safe)
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const TEXT_EXT = new Set([".md",".ps1",".json",".yaml",".yml",".ts",".tsx"]);
const RX_MAIN = /^(user|assistant)\.[a-z0-9\-]+\.[a-z0-9\-]+(?:p\d+[a-z0-9\-]*)?\.[a-z0-9\-]+\.v\d{4}\.\d{2}\.\d{2}\.(md|ps1|json|yaml|yml|ts|tsx)$/;
const RX_PLAN = /^(user|assistant)\.[a-z0-9\-]+\.os1p\d+[a-z0-9\-]*\.project-plan\.v\d{4}\.\d{2}\.\d{2}\.md$/;

const mustHeader = ["X-Tier1","X-Agent","X-Domain","X-Purpose","X-Version","X-Policy"];
const forbidden = [/^data\/vault\//,/^data\/embeddings\//];

// Exempt paths from ALL checks (filename + headers)
const exempt = [
  /^methods\/bmad\//,           // Legacy BMAD expansion packs
  /^ops\//,                     // Operations scripts (legacy)
  /^packages\//,                // Shared packages (no governance yet)
  /^services\//,                // Services (legacy)
  /^integrations\/archon\//,    // Archon integration (Python)
  /^supabase\//,                // Supabase schema files
  /^node_modules\//,            // Dependencies
  /^\./,                        // Dot files/folders
  /_archive\//,                 // Archived files
  /archives\//,                 // Archived files
  /package(-lock)?\.json$/,     // Package manifests
  /tsconfig\.json$/,            // TypeScript config
  /^scripts\/aggregate_guards\.cjs$/,  // Build script
  /^docker-compose\.yml$/,      // Docker compose
  /^Makefile$/,                 // Make
  /\.css$/,                     // Stylesheets
  /\.js$/,                      // Legacy JavaScript
];

const root = process.cwd();
let errors = [];

function walk(dir){
  for (const f of readdirSync(dir)) {
    const p = join(dir,f); const s = statSync(p);
    if (s.isDirectory()) { walk(p); continue; }
    const rel = p.replace(root+(/\\$/.test(root)?"":"\\"),"").replace(/\\/g,"/");
    
    // Forbidden paths in Git
    if (forbidden.some(rx=>rx.test(rel))) {
      errors.push(`Forbidden path tracked: ${rel}`);
      continue;
    }
    
    // Check exemptions
    if (exempt.some(rx=>rx.test(rel))) continue;
    
    // Scope filenames
    if (!TEXT_EXT.has(extname(p))) continue;
    const leaf = rel.split("/").pop();
    
    // Skip caps docs like README/INDEX
    if (/^([A-Z0-9\-_]+)\.md$/.test(leaf)) continue;
    
    // Project plan strict path
    if (rel.startsWith("docs/project_plans/")) {
      if (!rel.includes("/archives/") && !RX_PLAN.test(leaf)) {
        errors.push(`Non-compliant project plan filename: ${rel}`);
      }
    } else if (rel.startsWith("docs/policies/") || rel.startsWith("docs/templates/") || rel.startsWith("docs/hubs/") || rel.startsWith("docs/vision/") || rel.startsWith("scripts/tools/")) {
      // Enforce compound identifiers in governance paths
      if (!RX_MAIN.test(leaf)) {
        errors.push(`Non-compliant filename: ${rel}`);
      }
    }
    
    // Header check for governance paths only
    if (rel.startsWith("docs/policies/") || rel.startsWith("docs/templates/") || rel.startsWith("docs/hubs/") || rel.startsWith("scripts/tools/user.")) {
      const raw = readFileSync(p,"utf8");
      for (const k of mustHeader) {
        if (!raw.includes(`${k}:`)) errors.push(`Missing header ${k} in ${rel}`);
      }
    }
  }
}

walk(root);

if (errors.length) {
  console.error("❌ Zero-Tolerance Guard Failed\n" + errors.map(e=>" - "+e).join("\n"));
  process.exit(1);
}
console.log("✅ Zero-Tolerance Guard: PASS");

