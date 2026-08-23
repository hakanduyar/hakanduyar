/**
 * Decide whether a freshly written data/telemetry.json differs *materially*
 * from the committed one.
 *
 * "Material" means anything except the capture timestamp. If only the clock
 * moved, the refresh workflow skips the commit: a history of date-only bumps
 * is noise, and the plate's MEASURED date stays true either way (it states
 * when the data was measured, not today's date).
 *
 * Exit 0 = material change, exit 1 = timestamp-only. Plain .mjs with no
 * imports from the TypeScript tree so the workflow can run it before any
 * build tooling is involved.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function stripVolatile(snapshot) {
  const clone = structuredClone(snapshot);
  delete clone.capturedAt;
  return clone;
}

let committedRaw;
try {
  committedRaw = execFileSync('git', ['show', 'HEAD:data/telemetry.json'], { encoding: 'utf8' });
} catch {
  console.log('[material-change] no committed telemetry.json - treating as changed');
  process.exit(0);
}

const committed = stripVolatile(JSON.parse(committedRaw));
const current = stripVolatile(JSON.parse(readFileSync('data/telemetry.json', 'utf8')));

const changed = JSON.stringify(committed) !== JSON.stringify(current);
console.log(`[material-change] ${changed ? 'material change detected' : 'timestamp-only - no material change'}`);
process.exit(changed ? 0 : 1);
