/**
 * CLI: render every asset to `assets/generated/`.
 *
 * Rendering is pure and deterministic — same snapshot in, byte-identical SVG
 * out — so `--check` can assert that the committed assets match their source.
 * That is the gate that stops a hand-edited SVG from drifting away from the
 * code that is supposed to produce it.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { optimizeSvg, emitSvg, reportEmit, formatBytes, REPO_ROOT } from '../../src/shared/emit.js';
import { buildAll, loadTelemetry } from '../../src/build.js';

const checkOnly = process.argv.includes('--check');

function main(): void {
  const telemetry = loadTelemetry();
  const builds = buildAll(telemetry);

  if (checkOnly) {
    const stale: string[] = [];
    for (const build of builds) {
      const absolute = resolve(REPO_ROOT, build.path);
      const expected = optimizeSvg(build.asset.svg);
      const actual = existsSync(absolute) ? readFileSync(absolute, 'utf8') : null;
      if (actual !== expected) stale.push(build.path);
    }
    // The gate is two-directional: a committed SVG that no build produces is
    // drift too - it would ship unreviewed and unregenerable.
    const expectedNames = new Set(builds.map((b) => b.path.split('/').pop()));
    for (const file of readdirSync(resolve(REPO_ROOT, 'assets/generated'))) {
      if (file.endsWith('.svg') && !expectedNames.has(file)) {
        stale.push(`assets/generated/${file} (orphan: no build produces this file)`);
      }
    }
    if (stale.length) {
      console.error(
        `[render --check] ${stale.length} generated asset(s) do not match their source:\n` +
          stale.map((s) => `  ${s}`).join('\n') +
          '\n\nRun `npm run render` and commit the result.',
      );
      process.exitCode = 1;
      return;
    }
    console.log(`[render --check] all ${builds.length} assets match their source`);
    return;
  }

  console.log(`[render] ${builds.length} assets from data captured ${telemetry.capturedAt}\n`);
  let total = 0;
  let changed = 0;
  for (const build of builds) {
    const result = emitSvg(build.path, build.asset.svg);
    reportEmit(result);
    total += result.bytes;
    if (result.changed) changed++;
  }
  console.log(`\n[render] ${formatBytes(total)} across ${builds.length} files, ${changed} changed`);
}

main();
