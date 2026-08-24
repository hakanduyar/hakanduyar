/**
 * Panel 03 — signal. What the public source is made of.
 *
 * v1 shipped this as three things: a telemetry panel, a nine-row Markdown
 * table restating the same figures with a Method column, and a separate
 * activity strip with a sentence under it restating its caption. The table was
 * the clearest symptom of the problem the redesign exists to fix — the page
 * drew a number, then printed it again in case the drawing was not trusted.
 *
 * v2 merged all three into one panel. Round-2 review then failed it on feel:
 * a distribution chart stacked on a 52-week histogram, each under its own
 * uppercase register label, read as a dashboard rather than as a page someone
 * designed. Two charts is one more than this much data can justify.
 *
 * So the histogram is gone and its figures survive as a sentence. The weekly
 * series was mostly empty anyway — 9 active weeks in 52 — and a mostly-blank
 * plot states "nothing happened" far louder than it states anything else. The
 * distribution stays, because it is the one place where the shape genuinely
 * carries meaning a sentence cannot: five lengths compared against one common
 * track.
 *
 * Every figure here appears exactly once on the page. The headline counts
 * (repositories, commits, longevity) are not here at all — they belong to the
 * identity plate, and repeating them is what the Markdown table was doing.
 */

import { Canvas, type RenderedAsset } from '../shared/canvas.js';
import { el } from '../shared/svg.js';
import { TYPE, GRID, STROKE, type Palette } from '../shared/tokens.js';
import { frame, head, rail, fitted, SECTIONS } from '../shared/panel.js';
import type { Telemetry } from '../shared/telemetry-types.js';

const W = GRID.width;
const H = 380;
const L = GRID.margin;
const R = GRID.right;

const Y = {
  firstRow: 108,
  rowPitch: 36,
  volume: 300,
  activity: 336,
} as const;

/** The distribution track: name column to its left, share to its right. */
const TRACK_X = 280;
const TRACK_W = 440;
const TRACK_H = 8;

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

  canvas.add(frame(canvas, p), head(canvas, p, { index: SECTIONS.signal, name: 'SIGNAL' }));

  const named = t.languages.slice(0, NAMED_LANGUAGES);
  const remainder = remainderShare(t);
  const rows = [
    ...named.map((language, index) => ({
      name: language.name.toUpperCase(),
      share: language.share,
      // The largest share carries the page's single chromatic mark. It moves
      // if the measurement moves, which is the only reason it is allowed to
      // be coloured at all.
      fill: index === 0 ? p.signal : (p.series[index] as string),
      measured: true,
    })),
    {
      name: 'OTHER',
      share: remainder,
      fill: p.seriesRemainder,
      // A residual, not a measured category. Outlined rather than filled so
      // the difference is visible rather than asserted.
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

  canvas.add(rail(p, Y.volume - 32));

  // The two facts the removed histogram used to carry, stated rather than
  // plotted. Sentence case on purpose: after five rows of uppercase register
  // labels, the panel closes in the voice of the page rather than the voice of
  // an instrument.
  const megabytes = `${(t.totalSourceBytes / 1e6).toFixed(2)} MB of public source`;
  const contributions =
    `${t.activity.total} contributions in the ${t.activity.weekly.length} weeks to ${t.activity.end}`;
  fitted(canvas, megabytes, TYPE.body, GRID.contentWidth, 'source volume');
  fitted(canvas, contributions, TYPE.body, GRID.contentWidth, 'activity summary');

  canvas.add(
    canvas.text(megabytes, TYPE.body, { x: L, y: Y.volume, fill: p.text.secondary }),
    canvas.text(contributions, TYPE.body, { x: L, y: Y.activity, fill: p.text.secondary }),
  );

  const breakdown = named.map((l) => `${l.name} ${(l.share * 100).toFixed(1)} percent`).join(', ');
  // The description says what the panel says, and stops there. It used to
  // carry the active-week count and the peak week too — figures that belonged
  // to the removed histogram. Describing more than the image shows leaves a
  // screen-reader user unable to trust that the description matches the page.
  const desc =
    `Measured signal. Source distribution across ${megabytes}: ${breakdown}, ` +
    `and ${(remainder * 100).toFixed(1)} percent across all other languages. ` +
    `${contributions}.`;

  return canvas.build({
    id: 'signal',
    title: 'Measured signal - source distribution and contribution volume',
    desc,
  });
}
