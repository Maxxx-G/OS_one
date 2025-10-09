#!/usr/bin/env node
/**
 * validate_stb_headers.mjs
 * 
 * Pre-commit validator for STB (Single Task Block) files.
 * Ensures filename and header compliance with governance policy.
 * 
 * Requirements:
 * - Filename pattern: {tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.md
 * - Required headers: X-Tier1, X-Agent, X-Domain, X-Purpose, X-Version, X-Policy
 * - Header values must match filename components
 * 
 * Usage:
 *   node scripts/validate_stb_headers.mjs [file1.md] [file2.md] ...
 *   npm run validate:stb
 * 
 * Exit codes:
 *   0 = all valid
 *   1 = validation failures found
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

// Filename pattern: {tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.md
// Purpose can contain multiple hyphenated segments (e.g., "stb-template", "single-task-block")
const FILENAME_PATTERN = /^([a-z]+)\.([a-z0-9-]+)\.([a-z0-9-]+)\.([a-z0-9-]+(?:-[a-z0-9-]+)*)\.v(\d{4})\.(\d{2})\.(\d{2})\.md$/;

const REQUIRED_HEADERS = [
  'X-Tier1',
  'X-Agent',
  'X-Domain',
  'X-Purpose',
  'X-Version',
  'X-Policy'
];

const VALID_TIER1 = ['user', 'assistant'];

/**
 * Parse headers from markdown content
 */
function parseHeaders(content) {
  const headers = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Stop at first non-header line (after initial title/headers section)
    if (line.startsWith('##') && !line.includes('X-')) break;
    
    const match = line.match(/^(X-[A-Za-z0-9-]+):\s*(.+?)(?:\s*#.*)?$/);
    if (match) {
      const [, key, value] = match;
      headers[key] = value.trim();
    }
  }
  
  return headers;
}

/**
 * Validate a single STB file
 */
function validateSTBFile(filePath) {
  const errors = [];
  const filename = basename(filePath);
  
  // Skip non-.md files
  if (extname(filename) !== '.md') {
    return { valid: true, errors: [], warnings: [`Skipped non-markdown: ${filename}`] };
  }
  
  // Skip archived files
  if (filePath.includes('_archive')) {
    return { valid: true, errors: [], warnings: [`Skipped archived: ${filename}`] };
  }
  
  // Skip README files
  if (filename.toUpperCase() === 'README.MD') {
    return { valid: true, errors: [], warnings: [`Skipped README: ${filename}`] };
  }
  
  // Validate filename pattern
  const match = filename.match(FILENAME_PATTERN);
  if (!match) {
    errors.push(`Filename does not match pattern: {tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.md`);
    return { valid: false, errors, warnings: [] };
  }
  
  const [, tier1, agent, domain, purpose, year, month, day] = match;
  
  // Validate tier1
  if (!VALID_TIER1.includes(tier1)) {
    errors.push(`Invalid tier1 "${tier1}" - must be one of: ${VALID_TIER1.join(', ')}`);
  }
  
  // Validate date components
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);
  if (monthNum < 1 || monthNum > 12) {
    errors.push(`Invalid month "${month}" - must be 01-12`);
  }
  if (dayNum < 1 || dayNum > 31) {
    errors.push(`Invalid day "${day}" - must be 01-31`);
  }
  
  // Read and parse file content
  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (err) {
    errors.push(`Failed to read file: ${err.message}`);
    return { valid: false, errors, warnings: [] };
  }
  
  const headers = parseHeaders(content);
  
  // Check required headers
  for (const required of REQUIRED_HEADERS) {
    if (!headers[required]) {
      errors.push(`Missing required header: ${required}`);
    }
  }
  
  // If missing headers, can't validate values
  if (errors.length > 0) {
    return { valid: false, errors, warnings: [] };
  }
  
  // Validate header values match filename
  if (headers['X-Tier1'] !== tier1) {
    errors.push(`X-Tier1 header "${headers['X-Tier1']}" does not match filename tier1 "${tier1}"`);
  }
  
  if (headers['X-Agent'] !== agent) {
    errors.push(`X-Agent header "${headers['X-Agent']}" does not match filename agent "${agent}"`);
  }
  
  if (headers['X-Domain'] !== domain) {
    errors.push(`X-Domain header "${headers['X-Domain']}" does not match filename domain "${domain}"`);
  }
  
  if (headers['X-Purpose'] !== purpose) {
    errors.push(`X-Purpose header "${headers['X-Purpose']}" does not match filename purpose "${purpose}"`);
  }
  
  const expectedVersion = `v${year}.${month}.${day}`;
  if (headers['X-Version'] !== expectedVersion) {
    errors.push(`X-Version header "${headers['X-Version']}" does not match filename version "${expectedVersion}"`);
  }
  
  // Validate X-Policy contains required phrase
  if (!headers['X-Policy'].includes('filename+header compliance')) {
    errors.push(`X-Policy must include "filename+header compliance"`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Find all STB files in /templates
 */
function findSTBFiles(dir = join(ROOT, 'templates')) {
  const files = [];
  
  try {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip _archive directory
        if (entry === '_archive') continue;
        files.push(...findSTBFiles(fullPath));
      } else if (entry.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (err) {
    console.error(`⚠️  Warning: Could not read directory ${dir}: ${err.message}`);
  }
  
  return files;
}

/**
 * Main validation routine
 */
function main() {
  console.log('🔍 STB Header Validation\n');
  
  // Get files to validate
  let filesToValidate = [];
  
  if (process.argv.length > 2) {
    // Validate specific files from command line
    filesToValidate = process.argv.slice(2);
    console.log(`📄 Validating ${filesToValidate.length} specified file(s)...\n`);
  } else {
    // Validate all STB files in /templates
    filesToValidate = findSTBFiles();
    console.log(`📁 Scanning /templates directory...`);
    console.log(`📄 Found ${filesToValidate.length} markdown file(s) to validate\n`);
  }
  
  if (filesToValidate.length === 0) {
    console.log('✅ No STB files to validate\n');
    process.exit(0);
  }
  
  // Validate each file
  let totalErrors = 0;
  let totalWarnings = 0;
  const results = [];
  
  for (const filePath of filesToValidate) {
    const result = validateSTBFile(filePath);
    results.push({ filePath, ...result });
    
    if (result.errors.length > 0) {
      totalErrors += result.errors.length;
      console.log(`❌ ${basename(filePath)}`);
      result.errors.forEach(err => console.log(`   ⮑ ${err}`));
      console.log();
    } else if (result.warnings.length > 0) {
      totalWarnings += result.warnings.length;
      console.log(`⚠️  ${basename(filePath)}`);
      result.warnings.forEach(warn => console.log(`   ⮑ ${warn}`));
      console.log();
    } else {
      console.log(`✅ ${basename(filePath)}`);
    }
  }
  
  // Summary
  console.log('\n' + '─'.repeat(60));
  const validCount = results.filter(r => r.valid).length;
  const invalidCount = results.filter(r => !r.valid).length;
  
  console.log(`✅ Valid: ${validCount}`);
  console.log(`❌ Invalid: ${invalidCount}`);
  if (totalWarnings > 0) {
    console.log(`⚠️  Warnings: ${totalWarnings}`);
  }
  console.log('─'.repeat(60) + '\n');
  
  if (invalidCount > 0) {
    console.log('❌ Validation failed! Fix errors before committing.\n');
    process.exit(1);
  } else {
    console.log('✅ All STB files are compliant!\n');
    process.exit(0);
  }
}

main();
