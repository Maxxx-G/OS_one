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

// Filename pattern: {tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.{ext}
// Purpose can contain multiple hyphenated segments (e.g., "stb-template", "single-task-block")
// Supported extensions: md, ps1, json, yaml, yml, ts, tsx
const FILENAME_PATTERN = /^([a-z]+)\.([a-z0-9-]+)\.([a-z0-9-]+)\.([a-z0-9-]+(?:-[a-z0-9-]+)*)\.v(\d{4})\.(\d{2})\.(\d{2})\.(md|ps1|json|yaml|yml|ts|tsx)$/;
const SUPPORTED_EXTENSIONS = ['md', 'ps1', 'json', 'yaml', 'yml', 'ts', 'tsx'];

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
 * Parse headers from file content based on extension
 */
function parseHeaders(content, ext) {
  const headers = {};
  const lines = content.split('\n');
  
  // Different parsing strategies by extension
  if (ext === 'md') {
    // Markdown: Look for X-Key: value format
    for (const line of lines) {
      if (line.startsWith('##') && !line.includes('X-')) break; // Stop at first h2
      
      const match = line.match(/^(X-[A-Za-z0-9-]+):\s*(.+?)(?:\s*#.*)?$/);
      if (match) {
        const [, key, value] = match;
        headers[key] = value.trim();
      }
    }
  } else if (ext === 'ps1') {
    // PowerShell: Look inside <# ... #> comment block or # comments
    let inBlock = false;
    for (const line of lines) {
      if (line.trim() === '<#') { inBlock = true; continue; }
      if (line.trim() === '#>') { inBlock = false; continue; }
      
      if (inBlock || line.trim().startsWith('#')) {
        const cleanLine = line.replace(/^#\s*/, '').trim();
        const match = cleanLine.match(/^(X-[A-Za-z0-9-]+):\s*(.+?)$/);
        if (match) {
          const [, key, value] = match;
          headers[key] = value.trim();
        }
      }
    }
  } else if (ext === 'json') {
    // JSON: Look for _metadata object
    try {
      const parsed = JSON.parse(content);
      if (parsed._metadata) {
        Object.keys(parsed._metadata).forEach(key => {
          if (key.startsWith('X-')) {
            headers[key] = String(parsed._metadata[key]);
          }
        });
      }
    } catch (e) {
      // Invalid JSON - will fail validation later
    }
  } else if (ext === 'yaml' || ext === 'yml') {
    // YAML: Look for _metadata or top-level X- keys
    // Simple parser - look for X-Key: value lines
    for (const line of lines) {
      const match = line.match(/^(X-[A-Za-z0-9-]+):\s*(.+?)$/);
      if (match) {
        const [, key, value] = match;
        headers[key] = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
      }
    }
  } else if (ext === 'ts' || ext === 'tsx') {
    // TypeScript: Look inside /** ... */ or // comments
    let inBlock = false;
    for (const line of lines) {
      if (line.trim().startsWith('/**')) { inBlock = true; continue; }
      if (line.trim().startsWith('*/')) { inBlock = false; continue; }
      
      if (inBlock) {
        const cleanLine = line.replace(/^\s*\*\s*/, '').trim();
        const match = cleanLine.match(/^(X-[A-Za-z0-9-]+):\s*(.+?)$/);
        if (match) {
          const [, key, value] = match;
          headers[key] = value.trim();
        }
      } else if (line.trim().startsWith('//')) {
        const cleanLine = line.replace(/^\/\/\s*/, '').trim();
        const match = cleanLine.match(/^(X-[A-Za-z0-9-]+):\s*(.+?)$/);
        if (match) {
          const [, key, value] = match;
          headers[key] = value.trim();
        }
      }
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
  const ext = extname(filename).slice(1); // Remove leading dot
  
  // Skip files with unsupported extensions
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    return { valid: true, errors: [], warnings: [`Skipped unsupported extension: ${filename}`] };
  }
  
  // Skip archived files
  if (filePath.includes('_archive')) {
    return { valid: true, errors: [], warnings: [`Skipped archived: ${filename}`] };
  }
  
  // Skip README-style documentation files (all caps .md files)
  const baseNameUpper = filename.replace(/\.md$/i, '').toUpperCase();
  const isDocFile = baseNameUpper === filename.replace(/\.md$/i, '').toUpperCase() && 
                    baseNameUpper.includes('_') || 
                    baseNameUpper === 'README' ||
                    ['USAGE', 'QUICK_REFERENCE', 'GUIDE', 'INDEX'].includes(baseNameUpper);
  
  if (isDocFile) {
    return { valid: true, errors: [], warnings: [`Skipped documentation file: ${filename}`] };
  }
  
  // Validate filename pattern
  const match = filename.match(FILENAME_PATTERN);
  if (!match) {
    errors.push(`Filename does not match pattern: {tier1}.{agent}.{domain}.{purpose}.v{YYYY}.{MM}.{DD}.{ext}`);
    errors.push(`  Supported extensions: ${SUPPORTED_EXTENSIONS.join(', ')}`);
    return { valid: false, errors, warnings: [] };
  }
  
  const [, tier1, agent, domain, purpose, year, month, day, extension] = match;
  
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
  
  const headers = parseHeaders(content, ext);
  
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
      } else {
        const ext = extname(entry).slice(1);
        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        }
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
  
  if (filesToValidate.length > 2) {
    // Validate specific files from command line
    filesToValidate = process.argv.slice(2);
    console.log(`📄 Validating ${filesToValidate.length} specified file(s)...\n`);
  } else {
    // Validate all STB files in /templates
    filesToValidate = findSTBFiles();
    console.log(`📁 Scanning /templates directory...`);
    console.log(`📄 Found ${filesToValidate.length} file(s) to validate`);
    console.log(`📋 Extensions: ${SUPPORTED_EXTENSIONS.join(', ')}\n`);
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
