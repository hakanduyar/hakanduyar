/**
 * Asset emission: optimise, write, and report.
 *
 * SVGO is configured conservatively. Most of the overrides this file once
 * carried existed to protect animation; v2 ships none, and they were removed.
 * What remains is one override protecting the aria wiring and one precision
 * setting, each documented at its line. Do not add more without re-running
 * `npm run validate` — the earlier set was accumulated one breakage at a
 * time.
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
          // The <title>/<desc> ids are the targets of aria-labelledby. SVGO
          // does not track that reference, so cleaning ids would silently
          // break the accessibility contract on every asset.
          cleanupIds: false,
          // role="img" is the accessibility contract; SVGO treats it as an
          // unknown attribute and strips it without this flag.
          removeUnknownsAndDefaults: { keepRoleAttr: true },
          // 1 decimal place: 0.1 user units, which is 0.1 CSS px in the 890px
          // profile column and 0.04 px on a 360px phone — below the rendering
          // resolution either way, and verified against captures at both
          // widths. Every panel is outlined text, so path data is essentially
          // the whole payload. Set this back to 2 and re-run `npm run render`
          // to see it: the same content measures 412 KB at two decimals and
          // 295 KB at one. That saving is what let panel 02 afford a fourth
          // line without breaching the 400 KB payload budget.
          convertPathData: { floatPrecision: 1, transformPrecision: 1 },
          // <title>/<desc> are the accessibility contract for these assets, and
          // the viewBox is what lets GitHub scale them: SVGO 4 keeps all three
          // by default, so they need no override, only this note.
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

/** Run the optimiser without touching disk — used by the drift check. */
export function optimizeSvg(svg: string): string {
  return optimize(svg, SVGO_CONFIG).data;
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
  const output = optimizeSvg(svg);

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
