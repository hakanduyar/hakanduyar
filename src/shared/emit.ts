/**
 * Asset emission: optimise, write, and report.
 *
 * SVGO is configured conservatively. The default preset happily rewrites ids,
 * inlines <style> blocks into presentation attributes and drops "unknown"
 * attributes — every one of which silently kills a CSS keyframe animation or
 * an aria wiring. The plugins disabled below were each disabled in response to
 * a specific breakage, so do not re-enable them without re-running
 * `npm run validate`.
 */

import { optimize, type Config } from 'svgo';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const SVGO_CONFIG: Config = {
  multipass: true,
  js2svg: { indent: 0, pretty: false },
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Ids are animation and aria targets, not decoration.
          cleanupIds: false,
          // Would hoist <style> rules onto elements and destroy keyframes.
          inlineStyles: false,
          // Collapsing groups moves transforms that animations depend on.
          collapseGroups: false,
          // Merging paths across animated groups changes what animates.
          mergePaths: false,
          // <title>/<desc> are the accessibility contract for these assets.
          removeTitle: false,
          removeDesc: false,
          // Keeps the viewBox so the asset scales inside GitHub's column.
          removeViewBox: false,
          // 2dp already applied at generation time; re-rounding shifts glyphs.
          cleanupNumericValues: false,
          convertPathData: { floatPrecision: 2, transformPrecision: 2 },
        },
      },
    },
    'removeDimensions',
  ],
};

export interface EmitResult {
  path: string;
  bytes: number;
  bytesBefore: number;
  changed: boolean;
}

/**
 * Optimise and write an SVG.
 *
 * `removeDimensions` strips width/height so GitHub scales the asset to the
 * README column width instead of forcing a fixed pixel size — this is what
 * makes the assets responsive on mobile. The viewBox stays, so the aspect
 * ratio is preserved.
 */
export function emitSvg(relPath: string, svg: string): EmitResult {
  const bytesBefore = Buffer.byteLength(svg, 'utf8');
  const result = optimize(svg, SVGO_CONFIG);
  const output = result.data;

  const absolute = resolve(REPO_ROOT, relPath);
  mkdirSync(dirname(absolute), { recursive: true });

  const previous = existsSync(absolute) ? readFileSync(absolute, 'utf8') : null;
  const changed = previous !== output;
  if (changed) writeFileSync(absolute, output, 'utf8');

  return {
    path: relative(REPO_ROOT, absolute).replace(/\\/g, '/'),
    bytes: Buffer.byteLength(output, 'utf8'),
    bytesBefore,
    changed,
  };
}

/** Human-readable byte size for build logs and reports. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function reportEmit(result: EmitResult): void {
  const saved = result.bytesBefore - result.bytes;
  const pct = result.bytesBefore ? Math.round((saved / result.bytesBefore) * 100) : 0;
  const flag = result.changed ? '' : ' (unchanged)';
  console.log(
    `  ${result.path.padEnd(46)} ${formatBytes(result.bytes).padStart(9)}` +
      `  (-${pct}% from ${formatBytes(result.bytesBefore)})${flag}`,
  );
}
