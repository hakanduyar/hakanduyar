/**
 * Activity strip — 52 weekly columns of real contribution counts.
 *
 * Not a 53x7 daily grid. With 136 contributions across 365 days, roughly 340
 * cells of that grid would be empty, and a mostly-blank field states "nothing
 * happened" far more loudly than it states anything else. It is also the single
 * most recognisable graphic on GitHub, which works against a page whose whole
 * argument is that it was built rather than assembled.
 *
 * The real shape of this data is bursts: 9 of 52 weeks carry activity, with a
 * clear maximum. Weekly aggregation shows that structure honestly. The y-axis
 * is scaled to the actual maximum week and that maximum is printed, so nothing
 * is normalised against an invented ceiling. Zero weeks draw a baseline stub
 * rather than nothing, which reads as a measurement floor instead of a hole.
 *
 * Not green: green is GitHub's own signal, and borrowing it would make a
 * first-party asset look like a third-party widget.
 */

import { Canvas, type RenderedAsset } from '../shared/canvas.js';
import { el, linePath } from '../shared/svg.js';
import { TYPE, GRID, STROKE, RADIUS, type Palette } from '../shared/tokens.js';
import type { Telemetry } from '../shared/telemetry-types.js';

const W = GRID.width;
const H = 160;
const L = GRID.margin;
const R = GRID.right;

const BAR_W = 11;
const BAR_GAP = 4;
const BASELINE = 120;
const MAX_BAR_H = 60;
/** Zero weeks still draw this much, so the series reads as a floor not a gap. */
const ZERO_STUB = 1.5;
const MAX_LABEL_BASELINE = 48;
const CAPTION_BASELINE = 150;

export interface ActivityStripInput {
  telemetry: Telemetry;
}

export function renderActivityStrip(input: ActivityStripInput, palette: Palette): RenderedAsset {
  const t = input.telemetry;
  const weekly = t.activity.weekly;
  const canvas = new Canvas(W, H, palette, `hdu-activity-${palette.name}`, false);
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
  );

  const plotWidth = weekly.length * BAR_W + (weekly.length - 1) * BAR_GAP;
  if (plotWidth > GRID.contentWidth) {
    throw new Error(`Activity plot is ${plotWidth}u wide, over the ${GRID.contentWidth}u content width`);
  }
  const startX = L + (GRID.contentWidth - plotWidth) / 2;

  const bars: string[] = [];
  const stubs: string[] = [];
  let signalBar = '';

  weekly.forEach((count, index) => {
    const x = startX + index * (BAR_W + BAR_GAP);
    if (count === 0) {
      stubs.push(linePath(x, BASELINE - ZERO_STUB / 2, x + BAR_W, BASELINE - ZERO_STUB / 2));
      return;
    }
    const height = t.activity.max > 0 ? (count / t.activity.max) * MAX_BAR_H : 0;
    const rect = el('rect', {
      x,
      y: BASELINE - height,
      width: BAR_W,
      height,
      // The single maximum week is the one signal-coloured mark on this asset.
      fill: index === t.activity.maxIndex ? p.signal : p.series[1],
    });
    if (index === t.activity.maxIndex) signalBar = rect;
    else bars.push(rect);
  });

  canvas.add(
    // Axis line, drawn at strong weight so it survives the mobile downscale.
    el('path', {
      d: linePath(L, BASELINE + 0.75, R, BASELINE + 0.75),
      stroke: p.rule.strong,
      'stroke-width': STROKE.strong,
      fill: 'none',
    }),
    el('path', {
      d: stubs.join(''),
      stroke: p.rule.tick,
      'stroke-width': ZERO_STUB,
      fill: 'none',
    }),
    ...bars,
    signalBar,
  );

  // The scale is stated, never implied.
  const maxLabel = `MAX ${t.activity.max} IN ONE WEEK`;
  canvas.add(
    canvas.text(maxLabel, TYPE.label, { x: R, y: MAX_LABEL_BASELINE, anchor: 'end', fill: p.text.tertiary }),
    // Mirrored word for word in the Markdown line beneath the image.
    canvas.text(t.methods.activity, TYPE.micro, { x: L, y: CAPTION_BASELINE, fill: p.text.tertiary, decorative: true }),
  );

  const desc =
    `Weekly public contribution counts for the 52 weeks ending ${t.activity.end}: ` +
    `${t.activity.total} contributions across ${t.activity.activeWeeks} active weeks, ` +
    `at most ${t.activity.max} in a single week.`;

  return canvas.build({ id: 'activity', title: 'Weekly public contribution activity', desc });
}
