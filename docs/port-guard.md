# Port Guard System

## Overview

The port guard system prevents port 4000 conflicts by automatically killing existing listeners before starting the dev server.

## Implementation

- `scripts/killPort.cjs` - Windows-specific port killing utility
- `package.json` - predev script that runs port guard before dev server

## Usage

```bash
npm run dev  # Automatically runs port guard first
```

## Platform Support

- **Windows**: Uses netstat + taskkill to find and kill listeners on port 4000
- **Non-Windows**: No-op (prints note and continues)

## Files

- `/scripts/killPort.cjs` - Main port guard script
- `/package.json` - Contains predev hook that calls killPort.cjs

## Behavior

1. Before `npm run dev` starts, npm automatically runs `predev` script
2. `predev` executes `node scripts/killPort.cjs 4000`
3. On Windows: Finds PID listening on :4000 and kills it
4. On other platforms: Prints note and continues
5. Dev server starts normally on cleared port 4000

## Error Handling

- If no process is listening on port 4000: Prints "Nothing to kill" and continues
- If taskkill fails: Catches error and continues (port may already be free)
- Script always exits 0 to allow dev server to start
