/**
 * The hero identity plate — the only animated asset in the system.
 *
 * Layout note. The design brief specified this plate with a 72u wordmark inside
 * a 415u box and label/value pairs sharing a baseline inside a 252u column.
 * Those figures were derived for a proportional face. The system uses JetBrains
 * Mono, whose advance is a flat 0.6em, so the specified strings measured
 * 590u, 665u and 239u respectively and overflowed their boxes by wide margins.
 *
 * The composition below keeps every rule of the brief — the 890u grid, the type
 * scale, the token palette, one signal element, the 2400ms entrance ceiling —
 * and re-derives the geometry from measured widths. Bands run the full content
 * width instead of being split into left/right halves, which is what buys the
 * wordmark the room to stay at its specified 72u. Every placement is asserted
 * against its box at build time by `fit()`, so a future copy change that no
 * longer fits fails the build instead of silently colliding.
 */

import { Canvas, type RenderedAsset } from '../shared/canvas.js';
import { el, chamferRect, linePath, n } from '../shared/svg.js';
import { TYPE, GRID, STROKE, RADIUS, DUR, EASE, type Palette, type TypeStyle } from '../shared/tokens.js';
import type { Telemetry } from '../shared/telemetry-types.js';

const W = GRID.width;
const H = 300;
const L = GRID.margin; // 40
const R = GRID.right; // 850

/** Vertical structure. Every value sits on the 4u sub-grid of the 8u rhythm. */
const Y = {
  headerRail: 172.5 - 128, // 44.5
  markTop: 10.25,
  markSize: 31.5,
  headerBaseline: 31,
  nameBaseline: 124,
  subBaseline: 156,
  bandRail: 172.5,
  keyBaseline: 196,
  valueBaseline: 236,
  scaleCentre: 254,
  bottomRail: 268.5,
  footerBaseline: 290,
  rulingTop: 48,
  rulingBottom: 268,
} as const;

/** The three readout cells of the instrument band. */
const CELL_X = [40, 310, 580] as const;
/** The measurement scale shares the third cell's column and runs to the margin. */
const SCALE_X = 580;
const SCALE_W = R - SCALE_X; // 270

/**
 * Assert a laid-out string fits its allotted box.
 * Layout bugs in generated art are invisible until someone looks at the image;
 * this turns them into build failures with the arithmetic attached.
 */
function fit(label: string, measured: number, available: number): void {
  if (measured > available) {
    throw new Error(
      `Hero layout overflow: ${label} measures ${measured.toFixed(1)}u but only ${available.toFixed(1)}u is available ` +
        `(over by ${(measured - available).toFixed(1)}u). Shorten the string or drop a step on the type scale.`,
    );
  }
}

export interface HeroInput {
  telemetry: Telemetry;
  /** Displayed as the plate's discipline line. */
  discipline: string;
}

export function renderHero(input: HeroInput, palette: Palette, animated: boolean): RenderedAsset {
  const { telemetry } = input;
  const canvas = new Canvas(W, H, palette, `hdu-hero-${palette.name}`, animated);
  const p = palette;

  const primaryLanguage = telemetry.languages[0];
  if (!primaryLanguage) throw new Error('Telemetry has no language data');
  const sharePct = primaryLanguage.share;

  // -- structure ------------------------------------------------------------

  // Frame. Drawn as an explicit path rather than a <rect> so the entrance can
  // stroke it on with a dash offset whose length we can compute exactly.
  const framePerimeter = 2 * (W - 1 + (H - 1));
  canvas.add(
    el('path', {
      d: chamferRect(0.5, 0.5, W - 1, H - 1, 0, {}),
      fill: 'none',
      stroke: p.rule.hairline,
      'stroke-width': STROKE.hairline,
      class: 'fr',
      rx: RADIUS,
    }),
  );

  // Column ruling: the layout grid made visible. This is the honest version of
  // "technical decoration" — every line is a real column boundary.
  const ruling: string[] = [];
  for (let i = 1; i <= GRID.columns - 1; i++) {
    const x = L + i * GRID.pitch - GRID.gutter / 2 - 0.5;
    ruling.push(linePath(x, Y.rulingTop, x, Y.rulingBottom));
  }
  canvas.add(
    el('path', {
      d: ruling.join(''),
      stroke: p.rule.hairline,
      'stroke-width': STROKE.hairline,
      fill: 'none',
      class: 'rl',
    }),
  );

  const rail = (y: number, cls: string): string =>
    el('path', {
      d: linePath(L, y, R, y),
      stroke: p.rule.hairline,
      'stroke-width': STROKE.hairline,
      fill: 'none',
      class: cls,
    });

  // -- header band ----------------------------------------------------------

  const markX = L + 0.25;
  const markStyle: TypeStyle = { size: 16, font: 'w800', tracking: 0.02, upper: true };
  const markWidth = canvas.measureText('HDU', markStyle);
  fit('HDU monogram', markWidth, Y.markSize - 2);

  const headerLabel = 'ENGINEERING RECORD';
  const headerLabelX = L + 48;
  const headerLabelW = canvas.measureText(headerLabel, TYPE.label);

  // Two-tone: the key is tertiary, the measured value is secondary, so the eye
  // lands on the date rather than the word.
  const pushKey = 'LAST PUSH ';
  const pushValue = telemetry.lastPush.at.slice(0, 10);
  const pushKeyW = canvas.measureText(pushKey, TYPE.micro);
  const pushValueW = canvas.measureText(pushValue, TYPE.micro);
  const pushX = R - (pushKeyW + pushValueW);
  fit('header row', headerLabelW + 24 + pushKeyW + pushValueW, R - headerLabelX);

  canvas.addGroup(
    { class: 'hd' },
    el('path', {
      d: chamferRect(markX, Y.markTop, Y.markSize, Y.markSize, 0, {}),
      fill: 'none',
      stroke: p.rule.strong,
      'stroke-width': STROKE.strong,
      rx: RADIUS,
    }),
    canvas.text('HDU', markStyle, {
      x: markX + Y.markSize / 2,
      y: Y.markTop + Y.markSize / 2 + 16 * 0.365,
      anchor: 'middle',
      fill: p.text.primary,
      // A three-letter monogram cannot meet the 26u information floor; the same
      // mark is written out as text in the README heading.
      decorative: true,
    }),
    canvas.text(headerLabel, TYPE.label, { x: headerLabelX, y: Y.headerBaseline, fill: p.text.tertiary }),
    // Duplicated in the telemetry table, so annotation size is permitted.
    canvas.text(pushKey, TYPE.micro, { x: pushX, y: Y.headerBaseline, fill: p.text.tertiary, decorative: true }),
    canvas.text(pushValue, TYPE.micro, { x: pushX + pushKeyW, y: Y.headerBaseline, fill: p.text.secondary, decorative: true }),
    rail(Y.headerRail, 'hr'),
  );

  // -- identity band --------------------------------------------------------

  const nameWidth = canvas.measureText(telemetry.name, TYPE.display);
  fit('wordmark', nameWidth, GRID.contentWidth);
  const subWidth = canvas.measureText(input.discipline, TYPE.label);
  fit('discipline line', subWidth, GRID.contentWidth);

  canvas.add(
    // The wipe reveals the wordmark left to right; the clip is applied to a
    // wrapper so the glyph paths themselves stay untouched.
    `<g class="nm">${canvas.text(telemetry.name, TYPE.display, {
      x: L,
      y: Y.nameBaseline,
      fill: p.text.primary,
    })}</g>`,
    canvas.text(input.discipline, TYPE.label, {
      x: L,
      y: Y.subBaseline,
      fill: p.text.secondary,
      cls: 'sb',
    }),
    rail(Y.bandRail, 'br1'),
  );

  // -- instrument band ------------------------------------------------------

  const readouts: { key: string; value: string }[] = [
    { key: 'REPOSITORIES', value: String(telemetry.publicRepos) },
    { key: 'COMMITS', value: String(telemetry.totalCommits) },
    { key: primaryLanguage.name.toUpperCase(), value: `${(sharePct * 100).toFixed(1)}%` },
  ];

  readouts.forEach((readout, index) => {
    const x = CELL_X[index] as number;
    const limit = (CELL_X[index + 1] ?? R + GRID.gutter) - x - GRID.gutter;
    fit(`readout key ${readout.key}`, canvas.measureText(readout.key, TYPE.label), limit);
    fit(`readout value ${readout.value}`, canvas.measureText(readout.value, TYPE.metric), limit);
    canvas.addGroup(
      { class: `ro r${index}` },
      canvas.text(readout.key, TYPE.label, { x, y: Y.keyBaseline, fill: p.text.tertiary }),
      canvas.text(readout.value, TYPE.metric, { x, y: Y.valueBaseline, fill: p.text.primary }),
    );
  });

  // The measurement scale. Its index position encodes the primary-language
  // share: this is the element's entire reason to exist, and if the value
  // changes the line moves. It is the one signal-coloured mark on the plate.
  const tickCount = 10;
  const minorTicks: string[] = [];
  const majorTicks: string[] = [];
  for (let i = 0; i <= tickCount; i++) {
    const x = SCALE_X + (SCALE_W * i) / tickCount;
    const height = i % 3 === 0 ? 14 : 8;
    (i % 3 === 0 ? majorTicks : minorTicks).push(
      linePath(x, Y.scaleCentre - height / 2, x, Y.scaleCentre + height / 2),
    );
  }
  const indexX = SCALE_X + SCALE_W * sharePct;

  canvas.addGroup(
    { class: 'sc' },
    el('path', {
      d: linePath(SCALE_X, Y.scaleCentre, R, Y.scaleCentre),
      stroke: p.signalTrace,
      'stroke-width': STROKE.track,
      'stroke-linecap': 'butt',
      fill: 'none',
    }),
    el('path', { d: minorTicks.join(''), stroke: p.rule.tick, 'stroke-width': STROKE.hairline, fill: 'none' }),
    el('path', { d: majorTicks.join(''), stroke: p.rule.tick, 'stroke-width': STROKE.hairline, fill: 'none' }),
  );

  // Two nested groups: the outer one runs the entrance travel, the inner one
  // carries the single permitted loop. Keeping them separate means the loop
  // never fights the entrance for the same transform.
  canvas.add(
    `<g class="ix"><g class="ixd">${el('path', {
      d: linePath(indexX, Y.scaleCentre - 10, indexX, Y.scaleCentre + 10),
      stroke: p.signal,
      'stroke-width': STROKE.index,
      fill: 'none',
    })}</g></g>`,
  );

  // -- footer band ----------------------------------------------------------

  const activeSince = `ACTIVE SINCE ${telemetry.memberSince.slice(0, 4)}`;
  const measured = `MEASURED ${telemetry.capturedAt.slice(0, 10)}`;
  const activeW = canvas.measureText(activeSince, TYPE.label);
  const methodW = canvas.measureText(measured, TYPE.micro);
  fit('footer row', activeW + 24 + methodW, GRID.contentWidth);

  canvas.addGroup(
    { class: 'ft' },
    rail(Y.bottomRail, 'br2'),
    canvas.text(activeSince, TYPE.label, { x: L, y: Y.footerBaseline, fill: p.text.tertiary }),
    // Duplicated in the README provenance line.
    canvas.text(measured, TYPE.micro, { x: R, y: Y.footerBaseline, anchor: 'end', fill: p.text.tertiary, decorative: true }),
  );

  // -- motion ---------------------------------------------------------------
  //
  // One entrance, then hold. No perpetual banner animation: the reader is
  // trying to read a document. The single exception is the index drift, which
  // starts only after the entrance has finished.
  //
  // There is deliberately no `prefers-reduced-motion` query here — inside an
  // SVG rendered as an image it does not report the viewer's real setting
  // (docs/github-platform-constraints.md). Reduced motion is served by the
  // separate static variant, selected by the README's <picture>.

  if (animated) {
    const ms = (v: number): string => `${v}ms`;
    canvas.rule(
      `.fr{stroke-dasharray:${n(framePerimeter)};stroke-dashoffset:${n(framePerimeter)};` +
        `animation:fr ${ms(320)} ${EASE.entrance} forwards}` +
        `@keyframes fr{to{stroke-dashoffset:0}}`,
    );
    canvas.rule(
      `.rl{opacity:0;animation:fade ${ms(DUR.short)} ${EASE.standard} ${ms(200)} forwards}` +
        `.hd{opacity:0;animation:rise ${ms(DUR.short)} ${EASE.entrance} ${ms(320)} forwards}` +
        `.sb{opacity:0;animation:rise ${ms(DUR.short)} ${EASE.entrance} ${ms(760)} forwards}` +
        `.r0{animation-delay:${ms(900)}}.r1{animation-delay:${ms(960)}}.r2{animation-delay:${ms(1020)}}` +
        `.ro{opacity:0;animation:rise ${ms(DUR.short)} ${EASE.entrance} forwards}` +
        `.sc{opacity:0;animation:fade ${ms(DUR.short)} ${EASE.standard} ${ms(1200)} forwards}` +
        `.ft{opacity:0;animation:fade ${ms(DUR.short)} ${EASE.entrance} ${ms(1700)} forwards}`,
    );
    canvas.keyframes('fade', '@keyframes fade{to{opacity:1}}');
    canvas.keyframes('rise', '@keyframes rise{from{transform:translateY(4px)}to{opacity:1;transform:none}}');

    // The wordmark wipe. clip-path is animatable on an SVG group in Chromium
    // and rasterises far more cheaply than an animated mask.
    canvas.rule(
      `.nm{clip-path:inset(0 100% 0 0);animation:wipe ${ms(DUR.long)} ${EASE.entrance} ${ms(480)} forwards}` +
        `@keyframes wipe{to{clip-path:inset(0 0 0 0)}}`,
    );

    // The needle travels from the start of the scale to its measured reading.
    const travel = indexX - SCALE_X;
    canvas.rule(
      `.ix{transform:translateX(${n(-travel)}px);opacity:0;` +
        `animation:ix 900ms ${EASE.instrument} ${ms(1500)} forwards}` +
        `@keyframes ix{to{transform:none;opacity:1}}`,
    );
    // The one permitted loop: +/-6u about the resting reading, 9s period, no
    // opacity change. Starts after the entrance so the two never overlap.
    canvas.rule(
      `.ixd{animation:drift 9000ms ${EASE.linear} ${ms(DUR.sequenceMax)} infinite}` +
        `@keyframes drift{0%,100%{transform:none}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`,
    );
  }

  const desc =
    `Identity plate for ${telemetry.name}. ${input.discipline}. ` +
    `${telemetry.publicRepos} public repositories, ${telemetry.totalCommits} commits on default branches, ` +
    `${primaryLanguage.name} ${(sharePct * 100).toFixed(1)} percent of ${(telemetry.totalSourceBytes / 1e6).toFixed(2)} MB of public source. ` +
    `Active since ${telemetry.memberSince.slice(0, 4)}. Last public push ${pushValue}. Measured ${telemetry.capturedAt.slice(0, 10)}.`;

  return canvas.build({
    id: 'hero',
    title: `HDU // ENGINEERING RECORD - ${telemetry.name}`,
    desc,
  });
}
