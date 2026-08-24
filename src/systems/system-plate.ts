/**
 * Selected system plate — one per featured repository.
 *
 * Deliberately absent: star counts, commit counts, language brand colours and
 * screenshots. Three of the four selected repositories have single-digit or
 * low-double-digit commit counts and zero stars; rendering those numbers next
 * to a claim of architectural depth invites the reader to do arithmetic
 * instead of opening the code. Language and last-push month are shown because
 * they are useful; the rest is noise at this scale.
 */

import { Canvas, type RenderedAsset } from '../shared/canvas.js';
import { el, linePath } from '../shared/svg.js';
import { TYPE, GRID, STROKE, RADIUS, type Palette } from '../shared/tokens.js';
import type { Telemetry } from '../shared/telemetry-types.js';
import { FEATURED_REPOS } from '../shared/config.js';

const W = GRID.width;
const H = 92;
const L = GRID.margin;
const R = GRID.right;

const NAME_X = 64;
const NAME_BASELINE = 42;
const META_BASELINE = 72;

/** Longest implementation line that clears the right-aligned language label. */
const MAX_IMPLEMENTATION_CHARS = 25;

export interface SystemPlateInput {
  telemetry: Telemetry;
  key: string;
}

export function renderSystemPlate(input: SystemPlateInput, palette: Palette): RenderedAsset {
  const featured = input.telemetry.featured.find((f) => f.key === input.key);
  if (!featured) throw new Error(`No featured repository with key "${input.key}"`);
  const config = FEATURED_REPOS.find((f) => f.key === input.key);
  if (!config) throw new Error(`No configuration for featured key "${input.key}"`);

  const canvas = new Canvas(W, H, palette, `hdu-sys-${input.key}-${palette.name}`, false);
  const p = palette;

  canvas.add(
    el('rect', {
      x: 0.5,
      y: 0.5,
      width: W - 1,
      height: H - 1,
      rx: RADIUS,
      fill: 'none',
      stroke: p.rule.hairline,
      'stroke-width': STROKE.hairline,
    }),
    // Index mark: the plate's left edge, spanning both text lines.
    el('path', {
      d: linePath(L + 0.75, 20, L + 0.75, META_BASELINE),
      stroke: p.rule.strong,
      'stroke-width': STROKE.strong,
      fill: 'none',
    }),
  );

  const implementation = config.plateLine;
  if (implementation.length > MAX_IMPLEMENTATION_CHARS) {
    throw new Error(
      `plateLine for "${input.key}" is ${implementation.length} characters; the plate fits ` +
        `${MAX_IMPLEMENTATION_CHARS} before it collides with the meta column. Shorten it in src/shared/config.ts.`,
    );
  }

  const lang = (featured.language ?? 'UNKNOWN').toUpperCase();
  const pushMonth = featured.pushedAt.slice(0, 7);

  // Row 1: repository name + last-push month. Row 2: what is implemented +
  // the language. Everything on the plate sits at the 26u information floor,
  // so nothing here depends on a Markdown mirror to be legible.
  const nameWidth = canvas.measureText(featured.name, TYPE.label);
  const monthWidth = canvas.measureText(pushMonth, TYPE.label);
  const implWidth = canvas.measureText(implementation, TYPE.label);
  const langWidth = canvas.measureText(lang, TYPE.label);
  if (nameWidth + 24 + monthWidth > R - NAME_X) {
    throw new Error(`Plate row 1 for "${featured.name}" overflows: ${nameWidth.toFixed(0)}u name + month`);
  }
  if (implWidth + 24 + langWidth > R - NAME_X) {
    throw new Error(
      `Plate row 2 for "${featured.name}" overflows: ${implWidth.toFixed(0)}u + ${langWidth.toFixed(0)}u ` +
        `exceeds ${(R - NAME_X).toFixed(0)}u`,
    );
  }

  canvas.add(
    canvas.text(featured.name, TYPE.label, { x: NAME_X, y: NAME_BASELINE, fill: p.text.primary }),
    canvas.text(pushMonth, TYPE.label, { x: R, y: NAME_BASELINE, anchor: 'end', fill: p.text.tertiary }),
    canvas.text(implementation, TYPE.label, { x: NAME_X, y: META_BASELINE, fill: p.text.secondary }),
    canvas.text(lang, TYPE.label, { x: R, y: META_BASELINE, anchor: 'end', fill: p.text.tertiary }),
  );

  return canvas.build({
    id: `system-${input.key}`,
    title: `${featured.name} - ${implementation}`,
    desc: `${featured.name}: ${config.headline} Primary language ${featured.language ?? 'unknown'}, last public push ${pushMonth}.`,
  });
}
