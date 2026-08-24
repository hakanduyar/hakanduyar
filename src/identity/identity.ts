/**
 * Panel 00 — identity.
 *
 * The name is the design. v1 spent its first 44u on a monogram and the words
 * "ENGINEERING RECORD", which framed a person as a filing system before the
 * reader ever reached the person. v2 deletes the frame: the plate opens on the
 * wordmark, states one discipline line, and then produces three measured
 * numbers as evidence rather than as decoration.
 *
 * No motion. v1 built this plate twice — animated and at rest — and shipped a
 * reduced-motion `<picture>` ladder to choose between them. The entrance was
 * the most expensive thing on the page and the least load-bearing: it played
 * once, before most readers had scrolled to it, and the composition it
 * resolved to was the composition that mattered. v2 ships that resting state
 * directly, which is also what removes the whole variant-pairing apparatus
 * from the build.
 */

import { Canvas, type RenderedAsset } from '../shared/canvas.js';
import { el, linePath } from '../shared/svg.js';
import { TYPE, GRID, STROKE, type Palette } from '../shared/tokens.js';
import { frame, rail, fit, fitted } from '../shared/panel.js';
import type { Telemetry } from '../shared/telemetry-types.js';

const W = GRID.width;
const H = 268;
const L = GRID.margin;
const R = GRID.right;

/** Vertical structure. */
const Y = {
  nameBaseline: 96,
  disciplineBaseline: 134,
  rail: 162,
  valueBaseline: 208,
  keyBaseline: 234,
  track: 250,
} as const;

/** Three readout columns on the 10-column grid. */
const CELL_X = [40, 310, 580] as const;
const TRACK_X = 580;
const TRACK_W = R - TRACK_X; // 270

export interface IdentityInput {
  telemetry: Telemetry;
  /** The single discipline line under the wordmark. */
  discipline: string;
}

export function renderIdentity(input: IdentityInput, palette: Palette): RenderedAsset {
  const t = input.telemetry;
  const canvas = new Canvas(W, H, palette, `hdu-identity-${palette.name}`);
  const p = palette;

  const primary = t.languages[0];
  if (!primary) throw new Error('Telemetry has no language data');
  const share = primary.share;

  canvas.add(frame(canvas, p));

  // -- wordmark -------------------------------------------------------------

  fitted(canvas, t.name, TYPE.display, GRID.contentWidth, 'wordmark');
  fitted(canvas, input.discipline, TYPE.label, GRID.contentWidth, 'discipline line');

  canvas.add(
    canvas.text(t.name, TYPE.display, { x: L, y: Y.nameBaseline, fill: p.text.primary }),
    canvas.text(input.discipline, TYPE.label, { x: L, y: Y.disciplineBaseline, fill: p.text.secondary }),
    rail(p, Y.rail),
  );

  // -- readouts -------------------------------------------------------------
  //
  // Value over key, not key over value. The number is the thing being shown;
  // the word underneath says what was counted. v1 ran it the other way and the
  // eye landed on "REPOSITORIES" three times before it found a figure.

  const readouts = [
    { value: String(t.publicRepos), key: 'REPOSITORIES' },
    { value: String(t.totalCommits), key: 'COMMITS' },
    { value: `${(share * 100).toFixed(1)}%`, key: primary.name.toUpperCase() },
  ];

  readouts.forEach((readout, index) => {
    const x = CELL_X[index] as number;
    const limit = (CELL_X[index + 1] ?? R + GRID.gutter) - x - GRID.gutter;
    fitted(canvas, readout.value, TYPE.metric, limit, `readout value ${readout.value}`);
    fitted(canvas, readout.key, TYPE.label, limit, `readout key ${readout.key}`);
    canvas.add(
      canvas.text(readout.value, TYPE.metric, { x, y: Y.valueBaseline, fill: p.text.primary }),
      canvas.text(readout.key, TYPE.label, { x, y: Y.keyBaseline, fill: p.text.tertiary }),
    );
  });

  // -- the one signal element ----------------------------------------------
  //
  // The primary-language share, drawn as the fraction of the track it actually
  // is. This is the only chromatic mark on the plate, and it is load-bearing:
  // if the measured share changes, the fill changes with it.

  const fillWidth = TRACK_W * share;
  canvas.add(
    el('path', {
      d: linePath(TRACK_X, Y.track, R, Y.track),
      stroke: p.signalTrace,
      'stroke-width': STROKE.track,
      'stroke-linecap': 'butt',
      fill: 'none',
    }),
    el('path', {
      d: linePath(TRACK_X, Y.track, TRACK_X + fillWidth, Y.track),
      stroke: p.signal,
      'stroke-width': STROKE.track,
      'stroke-linecap': 'butt',
      fill: 'none',
    }),
  );

  // Guard the arithmetic that the drawing depends on: a share outside 0..1
  // would silently draw a track that runs backwards or past the margin.
  if (share < 0 || share > 1) {
    fit('language share track', TRACK_X + fillWidth, R);
  }

  const disciplineSentence = input.discipline.charAt(0) + input.discipline.slice(1).toLowerCase();
  const desc =
    `${t.name}. ${disciplineSentence}. ` +
    `${t.publicRepos} public repositories, ${t.totalCommits} commits on default branches, ` +
    `${primary.name} ${(share * 100).toFixed(1)} percent of ${(t.totalSourceBytes / 1e6).toFixed(2)} MB of public source.`;

  return canvas.build({
    id: 'identity',
    title: `${t.name} - ${disciplineSentence}`,
    desc,
  });
}
