/**
 * Telemetry panel — three headline measures and the language distribution.
 *
 * Three values, not fifteen. Every extra metric raises the chance one of them
 * is unflattering and dilutes the ones that are not, and at this account's
 * scale the cumulative record (repositories, commits, four years) is the
 * respectable number while the trailing-year rate is the weakest one. Follower
 * and star counts are deliberately absent: at 27 and 5 they turn neutral facts
 * into a scoreboard the reader watches you lose.
 *
 * Each value carries its measurement method, which is the point rather than
 * fine print — a small number stated exactly reads as rigour.
 */

import { Canvas, type RenderedAsset } from '../shared/canvas.js';
import { el, linePath } from '../shared/svg.js';
import { TYPE, GRID, STROKE, RADIUS, type Palette } from '../shared/tokens.js';
import type { Telemetry } from '../shared/telemetry-types.js';

const W = GRID.width;
const H = 200;
const L = GRID.margin;

const CELL_GAP = 16;
const CELL_W = (GRID.contentWidth - CELL_GAP * 2) / 3;

const KEY_BASELINE = 44;
const VALUE_BASELINE = 100;
const METHOD_BASELINE = 126;
const BAR_TOP = 150;
const BAR_H = 16;
const SEGMENT_GAP = 3;
const CAPTION_BASELINE = 186;

export interface TelemetryPanelInput {
  telemetry: Telemetry;
}

export function renderTelemetryPanel(input: TelemetryPanelInput, palette: Palette): RenderedAsset {
  const t = input.telemetry;
  const canvas = new Canvas(W, H, palette, `hdu-telemetry-${palette.name}`, false);
  const p = palette;

  const primary = t.languages[0];
  if (!primary) throw new Error('Telemetry has no language data');

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
  );

  // Vertical rules between the cells: without them the three method lines sit
  // on one shared baseline and read as a single run-on sentence.
  const dividers: string[] = [];
  for (const boundary of [1, 2]) {
    const x = L + boundary * (CELL_W + CELL_GAP) - CELL_GAP / 2 - 0.5;
    dividers.push(linePath(x, 28, x, METHOD_BASELINE + 6));
  }
  canvas.add(
    el('path', { d: dividers.join(''), stroke: p.rule.hairline, 'stroke-width': STROKE.hairline, fill: 'none' }),
  );

  const megabytes = (t.totalSourceBytes / 1e6).toFixed(2);
  const cells = [
    { key: 'REPOSITORIES', value: String(t.publicRepos), method: 'PUBLIC, NON-FORK' },
    { key: 'COMMITS', value: String(t.totalCommits), method: 'DEFAULT BRANCHES' },
    {
      key: primary.name.toUpperCase(),
      value: `${(primary.share * 100).toFixed(1)}%`,
      method: `SHARE OF ${megabytes} MB`,
    },
  ];

  cells.forEach((cell, index) => {
    const x = L + index * (CELL_W + CELL_GAP);
    for (const [label, style] of [
      [cell.key, TYPE.label],
      [cell.method, TYPE.micro],
    ] as const) {
      const width = canvas.measureText(label, style);
      if (width > CELL_W) {
        throw new Error(
          `Telemetry cell text "${label}" measures ${width.toFixed(0)}u, wider than the ${CELL_W.toFixed(0)}u cell`,
        );
      }
    }
    canvas.add(
      canvas.text(cell.key, TYPE.label, { x, y: KEY_BASELINE, fill: p.text.tertiary }),
      canvas.text(cell.value, TYPE.metricXl, { x, y: VALUE_BASELINE, fill: p.text.primary }),
      // Methods are annotation; the Markdown table repeats them verbatim.
      canvas.text(cell.method, TYPE.micro, { x, y: METHOD_BASELINE, fill: p.text.tertiary, decorative: true }),
    );
  });

  // -- language distribution bar -------------------------------------------
  //
  // Four measured segments plus an outlined remainder. The gaps are painted in
  // surface.base so each segment is judged for contrast against one common
  // ground rather than against its neighbour.

  const top4 = t.languages.slice(0, 4);
  const remainderShare = 1 - top4.reduce((sum, l) => sum + l.share, 0);
  const totalGap = SEGMENT_GAP * 4;
  const usable = GRID.contentWidth - totalGap;

  // The segments carry no in-image labels: at 18u they sat below every
  // legibility floor and only some names fit their segment, so which languages
  // got named was an accident of string width. The Markdown table directly
  // under the image names every one of them.
  let cursor = L;
  const segments: string[] = [];

  top4.forEach((language, index) => {
    const width = usable * language.share;
    segments.push(
      el('rect', {
        x: cursor,
        y: BAR_TOP,
        width,
        height: BAR_H,
        fill: p.series[index] as string,
      }),
    );
    cursor += width + SEGMENT_GAP;
  });

  // The remainder is outlined rather than filled: it is a residual, not a
  // measured category, and the difference should be visible.
  const remainderWidth = usable * remainderShare;
  segments.push(
    el('rect', {
      x: cursor + 0.5,
      y: BAR_TOP + 0.5,
      width: Math.max(0, remainderWidth - 1),
      height: BAR_H - 1,
      fill: 'none',
      stroke: p.seriesRemainder,
      'stroke-width': STROKE.hairline,
    }),
  );

  const caption = `SHARE OF ${megabytes} MB ACROSS ${t.publicRepos} PUBLIC REPOSITORIES`;
  const captionWidth = canvas.measureText(caption, TYPE.micro);
  if (captionWidth > GRID.contentWidth) {
    throw new Error(`Telemetry caption measures ${captionWidth.toFixed(0)}u, wider than ${GRID.contentWidth}u`);
  }

  canvas.add(
    ...segments,
    canvas.text(caption, TYPE.micro, { x: L, y: CAPTION_BASELINE, fill: p.text.tertiary, decorative: true }),
  );

  const breakdown = top4.map((l) => `${l.name} ${(l.share * 100).toFixed(1)} percent`).join(', ');
  const desc =
    `Measured telemetry: ${t.publicRepos} public non-fork repositories, ` +
    `${t.totalCommits} commits on default branches, and a language distribution of ${breakdown}, ` +
    `with ${(remainderShare * 100).toFixed(1)} percent across all other languages, ` +
    `measured over ${megabytes} MB of public source on ${t.capturedAt.slice(0, 10)}.`;

  return canvas.build({ id: 'telemetry', title: 'Measured repository telemetry', desc });
}
