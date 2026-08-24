/**
 * Panel 03 — signal. Language distribution and contribution activity, merged.
 *
 * v1 shipped this as three things: a telemetry panel, a nine-row Markdown
 * table restating the same figures with a Method column, and a separate
 * activity strip with a sentence under it restating its caption. The table was
 * the single clearest symptom of the problem the redesign exists to fix — the
 * page drew a number, then printed it again in case the drawing was not
 * trusted.
 *
 * One panel now. Every figure appears exactly once, and it appears where it is
 * drawn. The headline counts (repositories, commits, primary share) are not
 * here at all: they are on the identity plate, and repeating them is what the
 * table was doing.
 *
 * Not a 53x7 contribution grid. With 135 contributions across 52 weeks, ~340
 * cells of that grid would be empty, and a mostly-blank field states "nothing
 * happened" far louder than it states anything else. It is also the most
 * template-recognisable image on GitHub, which works against a page whose whole
 * argument is that it was built rather than assembled. Weekly aggregation shows
 * the real burst shape and invents nothing.
 */

import { Canvas, type RenderedAsset } from '../shared/canvas.js';
import { el, linePath } from '../shared/svg.js';
import { TYPE, GRID, STROKE, type Palette } from '../shared/tokens.js';
import { frame, head, rail, fit, fitted, SECTIONS } from '../shared/panel.js';
import type { Telemetry } from '../shared/telemetry-types.js';

const W = GRID.width;
const H = 446;
const L = GRID.margin;
const R = GRID.right;

const Y = {
  distLabel: 92,
  firstRow: 132,
  rowPitch: 36,
  midRail: 306,
  actLabel: 342,
} as const;

/** The distribution track: name column to the left of it, share to the right. */
const TRACK_X = 280;
const TRACK_W = 440;
const TRACK_H = 8;

/**
 * Activity plot geometry, exported so the scene test can recompute every bar's
 * position and height from the snapshot and assert the emitted rects against
 * its own arithmetic. Counting rects proved almost nothing: a chart that drew
 * the right number of bars in the wrong places passed.
 */
export const PLOT = {
  barWidth: 11,
  barGap: 4,
  maxBarHeight: 62,
  /** Zero weeks still draw this much, so the series reads as a floor not a hole. */
  zeroStub: 1.5,
} as const;

/** Left edge of the first bar, for a plot of `weeks` columns. */
export function plotStartX(weeks: number): number {
  const plotWidth = weeks * PLOT.barWidth + (weeks - 1) * PLOT.barGap;
  return GRID.margin + (GRID.contentWidth - plotWidth) / 2;
}

/** Baseline the bars stand on. */
export const PLOT_BASELINE = 420;

/** Languages drawn individually before the measured remainder. */
const NAMED_LANGUAGES = 4;

export interface SignalInput {
  telemetry: Telemetry;
}

/**
 * Share of source not covered by the named languages.
 *
 * Derived, not measured — which is exactly why it is computed in one place and
 * exported: the validators and the honesty tests import this rather than
 * hard-coding a figure, so the number on the panel and the number they permit
 * cannot drift apart.
 */
export function remainderShare(telemetry: Telemetry): number {
  const named = telemetry.languages.slice(0, NAMED_LANGUAGES);
  return 1 - named.reduce((sum, language) => sum + language.share, 0);
}

export function renderSignal(input: SignalInput, palette: Palette): RenderedAsset {
  const t = input.telemetry;
  const canvas = new Canvas(W, H, palette, `hdu-signal-${palette.name}`);
  const p = palette;

  if (t.languages.length <= NAMED_LANGUAGES) {
    throw new Error(
      `Signal panel expects more than ${NAMED_LANGUAGES} languages so the remainder row means something; ` +
        `telemetry has ${t.languages.length}.`,
    );
  }

  canvas.add(
    frame(canvas, p),
    // No "MEASURED <date>" rail here: the README's provenance line already
    // carries the date, and a second copy on the panel was both a duplication
    // and the driest thing on the page.
    head(canvas, p, { index: SECTIONS.signal, name: 'SIGNAL' }),
  );

  // -- source distribution --------------------------------------------------

  const megabytes = `${(t.totalSourceBytes / 1e6).toFixed(2)} MB`;
  const distLabel = 'SOURCE DISTRIBUTION';
  const distLabelW = fitted(canvas, distLabel, TYPE.label, GRID.contentWidth, 'distribution label');
  const megabytesW = fitted(canvas, megabytes, TYPE.label, GRID.contentWidth, 'source volume');
  fit('distribution header row', distLabelW + 24 + megabytesW, GRID.contentWidth);

  canvas.add(
    canvas.text(distLabel, TYPE.label, { x: L, y: Y.distLabel, fill: p.text.tertiary }),
    canvas.text(megabytes, TYPE.label, { x: R, y: Y.distLabel, anchor: 'end', fill: p.text.tertiary }),
  );

  const named = t.languages.slice(0, NAMED_LANGUAGES);
  const remainder = remainderShare(t);
  const rows = [
    ...named.map((language, index) => ({
      name: language.name.toUpperCase(),
      share: language.share,
      fill: p.series[index] as string,
      measured: true,
    })),
    {
      name: 'OTHER',
      share: remainder,
      fill: p.seriesRemainder,
      // A residual, not a measured category. Outlined rather than filled so the
      // difference is visible rather than asserted.
      measured: false,
    },
  ];

  rows.forEach((row, index) => {
    const y = Y.firstRow + index * Y.rowPitch;
    const percent = `${(row.share * 100).toFixed(1)}%`;

    fitted(canvas, row.name, TYPE.label, TRACK_X - L - GRID.gutter, `language name ${row.name}`);
    fitted(canvas, percent, TYPE.label, R - (TRACK_X + TRACK_W) - 24, `language share ${percent}`);

    const trackY = y - 9;
    const width = TRACK_W * row.share;

    canvas.add(
      canvas.text(row.name, TYPE.label, { x: L, y, fill: p.text.tertiary }),
      // The unfilled remainder of every track, so all five rows are read
      // against one common length rather than against each other.
      el('rect', { x: TRACK_X, y: trackY, width: TRACK_W, height: TRACK_H, fill: p.surface.raised }),
      row.measured
        ? el('rect', { x: TRACK_X, y: trackY, width, height: TRACK_H, fill: row.fill })
        : el('rect', {
            x: TRACK_X + 0.5,
            y: trackY + 0.5,
            width: Math.max(0, width - 1),
            height: TRACK_H - 1,
            fill: 'none',
            stroke: row.fill,
            'stroke-width': STROKE.hairline,
          }),
      canvas.text(percent, TYPE.label, { x: R, y, anchor: 'end', fill: p.text.secondary }),
    );
  });

  canvas.add(rail(p, Y.midRail));

  // -- contribution activity -------------------------------------------------

  const weekly = t.activity.weekly;
  const actLabel = 'CONTRIBUTIONS';
  const actMeta = `${t.activity.total} IN ${weekly.length} WEEKS, MAX ${t.activity.max}`;
  const actLabelW = fitted(canvas, actLabel, TYPE.label, GRID.contentWidth, 'activity label');
  const actMetaW = fitted(canvas, actMeta, TYPE.label, GRID.contentWidth, 'activity meta');
  fit('activity header row', actLabelW + 24 + actMetaW, GRID.contentWidth);

  canvas.add(
    canvas.text(actLabel, TYPE.label, { x: L, y: Y.actLabel, fill: p.text.tertiary }),
    canvas.text(actMeta, TYPE.label, { x: R, y: Y.actLabel, anchor: 'end', fill: p.text.secondary }),
  );

  const plotWidth = weekly.length * PLOT.barWidth + (weekly.length - 1) * PLOT.barGap;
  fit('activity plot', plotWidth, GRID.contentWidth);
  const startX = plotStartX(weekly.length);

  const bars: string[] = [];
  const stubs: string[] = [];
  let peakBar = '';

  weekly.forEach((count, index) => {
    const x = startX + index * (PLOT.barWidth + PLOT.barGap);
    if (count === 0) {
      stubs.push(linePath(x, PLOT_BASELINE - PLOT.zeroStub / 2, x + PLOT.barWidth, PLOT_BASELINE - PLOT.zeroStub / 2));
      return;
    }
    const barHeight = t.activity.max > 0 ? (count / t.activity.max) * PLOT.maxBarHeight : 0;
    // The peak week is the one signal-coloured mark on this panel.
    const drawn = el('rect', {
      x,
      y: PLOT_BASELINE - barHeight,
      width: PLOT.barWidth,
      height: barHeight,
      fill: index === t.activity.maxIndex ? p.signal : p.series[1],
    });
    if (index === t.activity.maxIndex) peakBar = drawn;
    else bars.push(drawn);
  });

  canvas.add(
    el('path', {
      d: linePath(L, PLOT_BASELINE + 0.75, R, PLOT_BASELINE + 0.75),
      stroke: p.rule.strong,
      'stroke-width': STROKE.strong,
      fill: 'none',
    }),
    el('path', { d: stubs.join(''), stroke: p.rule.tick, 'stroke-width': PLOT.zeroStub, fill: 'none' }),
    ...bars,
    peakBar,
  );

  const breakdown = named.map((l) => `${l.name} ${(l.share * 100).toFixed(1)} percent`).join(', ');
  const desc =
    `Measured signal. Source distribution across ${megabytes} of public source: ${breakdown}, ` +
    `with ${(remainder * 100).toFixed(1)} percent across all other languages. ` +
    `Public contributions: ${t.activity.total} across ${weekly.length} weeks to ${t.activity.end}, ` +
    `in ${t.activity.activeWeeks} active weeks, at most ${t.activity.max} in a single week. ` +
    `Measured ${t.capturedAt.slice(0, 10)}.`;

  return canvas.build({ id: 'signal', title: 'Measured signal - source distribution and activity', desc });
}
