/**
 * Panel 02 — selected systems. One plate per featured repository.
 *
 * v1 drew a plate and then repeated its entire contents underneath in
 * Markdown: the repository name again as a link, the headline again as a
 * sentence, three bullets of signals, and a `Stack:` line. Four repositories
 * of that came to 60 lines of prose restating four images.
 *
 * v2 keeps the plate and deletes the prose. Everything the reader needs is
 * drawn: what the system is, what it is built from, when it last moved. The
 * plate itself is wrapped in a link by the README assembler, so the repository
 * stays one click away without a line of text asking for the click.
 *
 * Deliberately still absent: star counts and commit counts. Three of the four
 * selected repositories have single-digit or low-double-digit commit counts and
 * near-zero stars; printing those beside a claim of architectural depth invites
 * arithmetic instead of reading the code.
 */

import { Canvas, type RenderedAsset } from '../shared/canvas.js';
import { el, linePath } from '../shared/svg.js';
import { TYPE, GRID, STROKE, type Palette } from '../shared/tokens.js';
import { frame, head, fitted, HEAD, SECTIONS } from '../shared/panel.js';
import type { Telemetry } from '../shared/telemetry-types.js';
import { FEATURED_REPOS } from '../shared/config.js';

const W = GRID.width;
const L = GRID.margin;
const R = GRID.right;

/** Height of the plate body, excluding any section header above it. */
const BODY_H = 136;
/** Text column, clearing the index rule at the margin. */
const TEXT_X = 64;

/** Baselines within the plate body, relative to its top. */
const ROW = { name: 42, line: 78, stack: 110 } as const;

/** Longest implementation line that clears the right-aligned push month. */
const MAX_IMPLEMENTATION_CHARS = 25;

export interface SystemPlateInput {
  telemetry: Telemetry;
  key: string;
  /**
   * True for the first plate only. The section opens on it, so the four plates
   * below read as one rack rather than four unrelated images — which is what
   * lets the README carry no heading of its own.
   */
  sectionHead: boolean;
}

export function renderSystemPlate(input: SystemPlateInput, palette: Palette): RenderedAsset {
  const featured = input.telemetry.featured.find((f) => f.key === input.key);
  if (!featured) throw new Error(`No featured repository with key "${input.key}"`);
  const config = FEATURED_REPOS.find((f) => f.key === input.key);
  if (!config) throw new Error(`No configuration for featured key "${input.key}"`);

  const top = input.sectionHead ? HEAD.rail : 0;
  const height = top + BODY_H;
  const canvas = new Canvas(W, height, palette, `hdu-sys-${input.key}-${palette.name}`);
  const p = palette;

  canvas.add(frame(canvas, p));
  if (input.sectionHead) canvas.add(head(canvas, p, { index: SECTIONS.systems, name: 'SELECTED SYSTEMS' }));

  const implementation = config.plateLine;
  if (implementation.length > MAX_IMPLEMENTATION_CHARS) {
    throw new Error(
      `plateLine for "${input.key}" is ${implementation.length} characters; the plate fits ` +
        `${MAX_IMPLEMENTATION_CHARS} before it collides with the meta column. Shorten it in src/shared/config.ts.`,
    );
  }

  // The index rule: the plate's left edge, spanning every text row. Same mark
  // on all four, which is most of what makes them read as a set.
  canvas.add(
    el('path', {
      d: linePath(L + 0.75, top + 20, L + 0.75, top + ROW.stack),
      stroke: p.rule.strong,
      'stroke-width': STROKE.strong,
      fill: 'none',
    }),
  );

  const pushMonth = featured.pushedAt.slice(0, 7);
  const stack = config.stack.join(' · ');

  const monthWidth = fitted(canvas, pushMonth, TYPE.label, R - TEXT_X, `push month ${pushMonth}`);
  fitted(canvas, featured.name, TYPE.strong, R - TEXT_X - monthWidth - 24, `plate name ${featured.name}`);
  fitted(canvas, implementation, TYPE.body, R - TEXT_X, `plate line ${input.key}`);
  fitted(canvas, stack, TYPE.body, R - TEXT_X, `plate stack ${input.key}`);

  canvas.add(
    canvas.text(featured.name, TYPE.strong, { x: TEXT_X, y: top + ROW.name, fill: p.text.primary }),
    canvas.text(pushMonth, TYPE.label, { x: R, y: top + ROW.name, anchor: 'end', fill: p.text.tertiary }),
    canvas.text(implementation, TYPE.body, { x: TEXT_X, y: top + ROW.line, fill: p.text.secondary }),
    canvas.text(stack, TYPE.body, { x: TEXT_X, y: top + ROW.stack, fill: p.text.tertiary }),
  );

  return canvas.build({
    id: `system-${input.key}`,
    title: `${featured.name} - ${implementation}`,
    desc:
      `${featured.name}: ${config.headline} Built with ${config.stack.join(', ')}. ` +
      `Last public push ${pushMonth}.`,
  });
}
