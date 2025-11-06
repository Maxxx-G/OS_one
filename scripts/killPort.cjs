#!/usr/bin/env node
/**
 * Kill whatever is listening on the given port (Windows only).
 * Usage: node scripts/killPort.cjs 4000
 * Non-Windows: no-op (prints a note and exits 0).
 */
const { execSync } = require('node:child_process');

const port = process.argv[2] || '4000';

if (process.platform !== 'win32') {
  console.log(`[port-guard] Non-Windows OS detected; skipping kill on :${port}`);
  process.exit(0);
}

try {
  const command = `for /f "tokens=5" %p in ('netstat -aon ^| find ":${port}" ^| find "LISTENING"') do taskkill /PID %p /F`;
  execSync(command, { stdio: 'inherit', shell: 'cmd.exe' });
  console.log(`[port-guard] Cleared listeners on :${port}`);
} catch (error) {
  console.log(`[port-guard] Nothing to kill on :${port} (or already freed).`);
}
