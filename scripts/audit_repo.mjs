#!/usr/bin/env node
/**
 * OS One — Repository Audit Script
 * 
 * Enumerates control folders, detects empty directories, placeholder files,
 * and duplicate templates. Generates a markdown audit report.
 * 
 * Usage: node scripts/audit_repo.mjs
 * Output: logs/audit_repo_{timestamp}.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const CONTROL_FOLDERS = [
  'templates',
  'docs/templates',
  'policies',
  'governance',
  'assistants',
  'kb',
  'docs',
  'scripts',
  'tools',
];

function scanDirectory(dir) {
  const items = { files: [], dirs: [], empty: [] };
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    if (entries.length === 0) {
      items.empty.push(dir);
      return items;
    }
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        items.dirs.push(fullPath);
        const subItems = scanDirectory(fullPath);
        items.files.push(...subItems.files);
        items.dirs.push(...subItems.dirs);
        items.empty.push(...subItems.empty);
      } else {
        items.files.push(fullPath);
      }
    }
  } catch (err) {
    console.warn(`Warning: Could not read ${dir}: ${err.message}`);
  }
  
  return items;
}

function isPlaceholder(file) {
  const basename = path.basename(file);
  return basename === '.keep' || basename === '.gitkeep' || basename === 'README.md' && fs.statSync(file).size < 100;
}

function findDuplicates(files) {
  const templateFiles = files.filter(f => f.endsWith('.md') && f.includes('.v202'));
  const duplicates = [];
  
  const byBaseName = {};
  for (const file of templateFiles) {
    const base = path.basename(file).replace(/\.v\d{4}\.\d{2}\.\d{2}/, '');
    if (!byBaseName[base]) byBaseName[base] = [];
    byBaseName[base].push(file);
  }
  
  for (const [base, files] of Object.entries(byBaseName)) {
    if (files.length > 1) {
      // Check if same version date
      const versions = files.map(f => {
        const match = f.match(/\.v(\d{4}\.\d{2}\.\d{2})/);
        return match ? match[1] : null;
      });
      
      const versionCounts = {};
      versions.forEach(v => {
        if (v) versionCounts[v] = (versionCounts[v] || 0) + 1;
      });
      
      for (const [version, count] of Object.entries(versionCounts)) {
        if (count > 1) {
          duplicates.push({
            base,
            version,
            files: files.filter(f => f.includes(`.v${version}`)),
          });
        }
      }
    }
  }
  
  return duplicates;
}

function generateReport() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = path.join(rootDir, 'logs', `audit_repo_${timestamp}.md`);
  
  // Ensure logs directory exists
  const logsDir = path.join(rootDir, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  let report = `# OS One Repository Audit Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Script:** scripts/audit_repo.mjs\n\n`;
  report += `---\n\n`;
  
  // Scan control folders
  report += `## Control Folders Analysis\n\n`;
  
  for (const folder of CONTROL_FOLDERS) {
    const fullPath = path.join(rootDir, folder);
    
    if (!fs.existsSync(fullPath)) {
      report += `### ⚠️ ${folder} (NOT FOUND)\n\n`;
      continue;
    }
    
    const { files, dirs, empty } = scanDirectory(fullPath);
    const placeholders = files.filter(isPlaceholder);
    const realFiles = files.filter(f => !isPlaceholder(f));
    
    report += `### ✅ ${folder}\n\n`;
    report += `- **Total Files:** ${files.length}\n`;
    report += `- **Real Files:** ${realFiles.length}\n`;
    report += `- **Placeholders:** ${placeholders.length}\n`;
    report += `- **Subdirectories:** ${dirs.length}\n`;
    report += `- **Empty Directories:** ${empty.length}\n\n`;
    
    if (placeholders.length > 0) {
      report += `**Placeholder Files:**\n`;
      placeholders.forEach(p => {
        report += `- \`${path.relative(rootDir, p)}\`\n`;
      });
      report += `\n`;
    }
    
    if (empty.length > 0) {
      report += `**Empty Directories:**\n`;
      empty.forEach(e => {
        report += `- \`${path.relative(rootDir, e)}\`\n`;
      });
      report += `\n`;
    }
  }
  
  // Check for duplicates
  report += `---\n\n## Duplicate Detection\n\n`;
  
  const allFiles = [];
  for (const folder of CONTROL_FOLDERS) {
    const fullPath = path.join(rootDir, folder);
    if (fs.existsSync(fullPath)) {
      const { files } = scanDirectory(fullPath);
      allFiles.push(...files);
    }
  }
  
  const duplicates = findDuplicates(allFiles);
  
  if (duplicates.length === 0) {
    report += `✅ **No duplicate template versions detected.**\n\n`;
  } else {
    report += `⚠️ **Found ${duplicates.length} duplicate version(s):**\n\n`;
    duplicates.forEach(dup => {
      report += `### ${dup.base} (v${dup.version})\n`;
      dup.files.forEach(f => {
        report += `- \`${path.relative(rootDir, f)}\`\n`;
      });
      report += `\n`;
    });
  }
  
  // Template version summary
  report += `---\n\n## Template Inventory\n\n`;
  
  const templateDirs = ['templates', 'docs/templates'];
  const templatesByDir = {};
  
  for (const dir of templateDirs) {
    const fullPath = path.join(rootDir, dir);
    if (fs.existsSync(fullPath)) {
      const { files } = scanDirectory(fullPath);
      const mdFiles = files.filter(f => f.endsWith('.md') && !f.includes('README.md'));
      templatesByDir[dir] = mdFiles.map(f => path.relative(rootDir, f));
    }
  }
  
  report += `### /templates (Agent-Critical)\n\n`;
  if (templatesByDir['templates']) {
    report += `**Count:** ${templatesByDir['templates'].length}\n\n`;
    templatesByDir['templates'].forEach(t => {
      report += `- \`${t}\`\n`;
    });
  } else {
    report += `*No templates found*\n`;
  }
  report += `\n`;
  
  report += `### /docs/templates (Human-Facing)\n\n`;
  if (templatesByDir['docs/templates']) {
    report += `**Count:** ${templatesByDir['docs/templates'].length}\n\n`;
    templatesByDir['docs/templates'].forEach(t => {
      report += `- \`${t}\`\n`;
    });
  } else {
    report += `*No templates found*\n`;
  }
  report += `\n`;
  
  // Recommendations
  report += `---\n\n## Recommendations\n\n`;
  
  const totalEmpty = CONTROL_FOLDERS.reduce((sum, folder) => {
    const fullPath = path.join(rootDir, folder);
    if (fs.existsSync(fullPath)) {
      const { empty } = scanDirectory(fullPath);
      return sum + empty.length;
    }
    return sum;
  }, 0);
  
  if (totalEmpty > 0) {
    report += `1. **Empty Directories:** ${totalEmpty} empty directories found. Consider:\n`;
    report += `   - Adding .keep files if intentionally empty\n`;
    report += `   - Removing if no longer needed\n`;
    report += `   - Documenting purpose in parent README\n\n`;
  }
  
  if (duplicates.length > 0) {
    report += `2. **Duplicates:** ${duplicates.length} duplicate template versions detected.\n`;
    report += `   - Move older versions to _archive/ folders\n`;
    report += `   - Update references to point to latest version\n`;
    report += `   - Document supersession in CHANGELOG.md\n\n`;
  }
  
  const totalPlaceholders = CONTROL_FOLDERS.reduce((sum, folder) => {
    const fullPath = path.join(rootDir, folder);
    if (fs.existsSync(fullPath)) {
      const { files } = scanDirectory(fullPath);
      return sum + files.filter(isPlaceholder).length;
    }
    return sum;
  }, 0);
  
  if (totalPlaceholders > 10) {
    report += `3. **Placeholders:** ${totalPlaceholders} placeholder files found.\n`;
    report += `   - Review if all are still necessary\n`;
    report += `   - Consider consolidating empty markers\n`;
    report += `   - Document purpose in placeholder READMEs\n\n`;
  }
  
  report += `---\n\n`;
  report += `**Report saved to:** \`${path.relative(rootDir, reportPath)}\`\n`;
  
  // Write report
  fs.writeFileSync(reportPath, report, 'utf8');
  
  console.log(`\n✅ Audit complete!`);
  console.log(`📄 Report: ${reportPath}\n`);
  
  return reportPath;
}

// Run audit
generateReport();
