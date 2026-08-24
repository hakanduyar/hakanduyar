/**
 * Panel 00 — identity.
 *
 * The name is the design. v1 spent its first 44u on a monogram and the words
 * "ENGINEERING RECORD", which framed a person as a filing system before the
 * reader ever reached the person. v2 deletes the frame: the plate opens on the
 * wordmark, states one discipline line, and then produces three measured
 * numbers as evidence rather than as decoration.
 *
 * Each of those three belongs to this panel and to no other. That is a rule the
 * whole page keeps, and it is the rule v1 broke worst: the repository and commit
 * counts appeared on the hero, again on the telemetry panel, and a third time in
 * a Markdown table.
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
import { TYPE, GRID, type Palette } from '../shared/tokens.js';
import { frame, rail, fitted } from '../shared/panel.js';
import type { Telemetry } from '../shared/telemetry-types.js';

const W = GRID.width;
const H = 254;
const L = GRID.margin;
const R = GRID.right;

/** Vertical structure. */
const Y = {
  nameBaseline: 96,
  disciplineBaseline: 134,
  rail: 162,
  valueBaseline: 208,
  keyBaseline: 234,
} as const;

/** Three readout columns on the 10-column grid. */
const CELL_X = [40, 310, 580] as const;

export interface IdentityInput {
  telemetry: Telemetry;
  /** The single discipline line under the wordmark. */
  discipline: string;
}

export function renderIdentity(input: IdentityInput, palette: Palette): RenderedAsset {
  const t = input.telemetry;
  const canvas = new Canvas(W, H, palette, `hdu-identity-${palette.name}`);
  const p = palette;

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

  // Three counts, each owned by this panel alone. The third was the primary
  // language share until review caught it: the signal panel draws the whole
  // distribution, so stating one row of it here was the page contradicting its
  // own rule against saying anything twice. Longevity is the fact this panel
  // is uniquely placed to give, and nothing else on the page carries it.
  const readouts = [
    { value: String(t.publicRepos), key: 'REPOSITORIES' },
    { value: String(t.totalCommits), key: 'COMMITS' },
    { value: t.memberSince.slice(0, 4), key: 'ACTIVE SINCE' },
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

  // No chromatic mark here. The plate used to carry a signal-coloured track
  // for the primary-language share; with that readout gone the accent had
  // nothing left to measure, and rather than find it a job the page now spends
  // its single chroma exactly once, on the peak contribution week in panel 03.

  const disciplineSentence = input.discipline.charAt(0) + input.discipline.slice(1).toLowerCase();
  const desc =
    `${t.name}. ${disciplineSentence}. ` +
    `${t.publicRepos} public repositories, ${t.totalCommits} commits on default branches, ` +
    `active on GitHub since ${t.memberSince.slice(0, 4)}.`;

  return canvas.build({
    id: 'identity',
    title: `${t.name} - ${disciplineSentence}`,
    desc,
  });
}
