#!/usr/bin/env node
/**
 * OS One Docs Validator CLI v0 - (c) Maxxi-Corp / Nexxis-Gen / OS_One
 * Author: Gabriel System (auto-generated via STB)
 * Version: v2025.10.06
 *
 * Checks markdown docs for:
 *  1. Tier-1 filename regex
 *  2. Header version match
 *  3. Canonical path references
 *  4. STB fence count compliance (One-Fence Rule)
 *  5. Presence of required sections
 *
 * Usage: node tools/docs-validator/validator.mjs <file_or_folder> [--strict|--advisory]
 */

import fs from 'fs';
import path from 'path';

const MODES = new Set(['--strict', '--advisory']);
const regexTier1 = /^[a-z0-9]+\.[a-z0-9]+\.[a-z0-9]+\.[a-z0-9-]+\.v\d{4}\.\d{2}\.\d{2}\.[a-z0-9]+$/;
const headerVersionRegex = /^#\s+.+\(v(\d{4}\.\d{2}\.\d{2})\)/;
const versionInFilename = /v(\d{4}\.\d{2}\.\d{2})/;
const requiredSectionPatterns = [
  { label: 'Purpose', regex: /^##\s+Purpose\b/i },
  { label: 'Scope (or Audience)', regex: /^##\s+Scope\b/i },
  { label: 'Canonical Location(s)', regex: /^##\s+Canonical Location/i },
  { label: 'Dependencies/References', regex: /^##\s+Dependencies\/?References/i },
  { label: 'Body', regex: /^##\s+Body\b/i },
  { label: 'Stability Guardrails', regex: /^##\s+Stability Guardrails\b/i },
  { label: 'Version & Archive', regex: /^##\s+Version\s*&\s*Archive/i },
  { label: 'Acceptance', regex: /^##\s+Acceptance\b/i },
  { label: 'Notes', regex: /^##\s+Notes\b/i }
];
const outdatedPathRules = [
  {
    label: 'docs/projects/',
    regex: /docs\/projects\//i,
    message: 'Use docs/project_plans/ instead of docs/projects/'
  }
];

const args = process.argv.slice(2);
if (!args.length) {
  printUsage();
  process.exit(0);
}

let mode = 'advisory';
let target = null;
for (const arg of args) {
  if (MODES.has(arg)) {
    mode = arg === '--strict' ? 'strict' : 'advisory';
  } else if (!target) {
    target = arg;
  }
}

if (!target) {
  printUsage();
  process.exit(0);
}

const resolvedTarget = path.resolve(process.cwd(), target);
let stats;
try {
  stats = fs.statSync(resolvedTarget);
} catch (error) {
  console.error(`Target not found: ${resolvedTarget}`);
  process.exit(1);
}

const reports = [];
if (stats.isDirectory()) {
  collectMarkdownFiles(resolvedTarget).forEach(file => {
    reports.push(validateFile(file));
  });
} else if (resolvedTarget.toLowerCase().endsWith('.md')) {
  reports.push(validateFile(resolvedTarget));
} else {
  console.error('Unsupported target: only Markdown files or directories are allowed.');
  process.exit(1);
}

let failedFiles = 0;
let warnedFiles = 0;
let errorCount = 0;
let warningCount = 0;
for (const report of reports) {
  if (report.errors.length) {
    failedFiles += 1;
    errorCount += report.errors.length;
  }
  if (report.warnings.length) {
    warningCount += report.warnings.length;
    if (!report.errors.length) {
      warnedFiles += 1;
    }
  }
  printReport(report);
}

console.log('\n---');
console.log(
  `Checked ${reports.length} file(s). Failed files: ${failedFiles}. Warn-only files: ${warnedFiles}. Errors: ${errorCount}. Warnings: ${warningCount}.`
);
if (mode === 'strict' && failedFiles > 0) {
  process.exit(1);
}

function printUsage() {
  console.log('Usage: node tools/docs-validator/validator.mjs <file_or_folder> [--strict|--advisory]');
}

function collectMarkdownFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir).sort((a, b) => a.localeCompare(b));
  for (const entry of entries) {
    const full = path.join(dir, entry);
    let entryStats;
    try {
      entryStats = fs.statSync(full);
    } catch (error) {
      console.error(`Unable to stat entry: ${full}`);
      continue;
    }
    if (entryStats.isDirectory()) {
      results.push(...collectMarkdownFiles(full));
    } else if (entry.toLowerCase().endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function validateFile(filePath) {
  const name = path.basename(filePath);
  const report = {
    file: filePath,
    errors: [],
    warnings: []
  };

  if (!regexTier1.test(name)) {
    report.errors.push(formatIssue('ERROR', 'Filename fails Tier-1 regex', { line: null }));
  }

  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    report.errors.push(formatIssue('ERROR', `Unable to read file: ${error.message}`, { line: null }));
    return finalizeReport(report);
  }

  const lines = text.split(/\r?\n/);
  const headerLineInfo = findHeaderVersionLine(lines);
  const fileVersionMatch = name.match(versionInFilename);
  const headerVersionMatch = headerLineInfo ? headerLineInfo.version : null;

  if (!headerLineInfo || !fileVersionMatch || headerVersionMatch !== fileVersionMatch[1]) {
    const detail = buildHeaderDetail(headerLineInfo, fileVersionMatch);
    report.errors.push(formatIssue('ERROR', `Header version mismatch: ${detail}`, {
      line: headerLineInfo ? headerLineInfo.line : 1
    }));
  }

  for (const rule of outdatedPathRules) {
    const hits = findLinesMatching(lines, rule.regex);
    for (const hit of hits) {
      report.warnings.push(formatIssue('WARNING', rule.message, { line: hit.line, context: hit.text.trim() }));
    }
  }

  if (containsStbBlock(text)) {
    const fenceCount = countTripleBackticks(text);
    if (fenceCount !== 0 && fenceCount !== 2) {
      report.errors.push(formatIssue('ERROR', `Invalid STB fence count: expected 0 or 2 but found ${fenceCount}`, { line: null }));
    }
  }

  const missingSections = findMissingSections(lines);
  if (missingSections.length) {
    report.warnings.push(formatIssue('WARNING', `Missing or misordered sections: ${missingSections.join(', ')}`, { line: null }));
  }

  return finalizeReport(report);
}

function finalizeReport(report) {
  report.status = report.errors.length
    ? 'FAIL'
    : report.warnings.length
    ? 'WARN'
    : 'OK';
  return report;
}

function printReport(report) {
  const statusLabel = report.status === 'OK' ? '[OK]' : report.status === 'WARN' ? '[WARN]' : '[FAIL]';
  console.log(`\n${statusLabel} ${report.file}`);
  const items = [...report.errors, ...report.warnings];
  for (const item of items) {
    const loc = item.line ? `line ${item.line}` : 'line n/a';
    console.log(`   - [${item.level}] ${loc}: ${item.message}`);
    if (item.context) {
      console.log(`       > ${item.context}`);
    }
  }
}

function findHeaderVersionLine(lines) {
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(headerVersionRegex);
    if (match) {
      return { line: i + 1, version: match[1] };
    }
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('<!--')) {
      continue;
    }
    if (line.startsWith('# ')) {
      return null;
    }
  }
  return null;
}

function buildHeaderDetail(headerLineInfo, fileVersionMatch) {
  const headerVersion = headerLineInfo ? headerLineInfo.version : 'n/a';
  const filenameVersion = fileVersionMatch ? fileVersionMatch[1] : 'n/a';
  if (!headerLineInfo) {
    return 'missing version tag in first H1';
  }
  if (!fileVersionMatch) {
    return `filename missing version segment (${filenameVersion})`;
  }
  return `${headerVersion} (header) vs ${filenameVersion} (filename)`;
}

function findLinesMatching(lines, pattern) {
  const matches = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (pattern.test(lines[i])) {
      matches.push({ line: i + 1, text: lines[i] });
    }
    pattern.lastIndex = 0;
  }
  return matches;
}

function containsStbBlock(text) {
  return /<STB\b/i.test(text);
}

function countTripleBackticks(text) {
  const matches = text.match(/```/g);
  return matches ? matches.length : 0;
}

function findMissingSections(lines) {
  let cursor = -1;
  const missing = [];
  for (const section of requiredSectionPatterns) {
    let foundIndex = -1;
    for (let i = cursor + 1; i < lines.length; i += 1) {
      if (section.regex.test(lines[i])) {
        foundIndex = i;
        break;
      }
    }
    if (foundIndex === -1) {
      missing.push(section.label);
    } else {
      cursor = foundIndex;
    }
  }
  return missing;
}

function formatIssue(level, message, { line, context = null }) {
  return { level, message, line, context };
}
