/**
 * Panel chrome — the grammar every v2 section is drawn in.
 *
 * v1's sections were announced by Markdown `##` headings sitting above the
 * images. That is what made the page read as a document with illustrations
 * rather than as one composition: the heading belonged to the page, the
 * graphic belonged to itself, and nothing tied them together.
 *
 * v2 moves the heading inside the asset. Every section opens with the same
 * two-part mark — a zero-padded index and a section name — over the same
 * hairline rail, at the same baselines, on the same 890u grid. Repetition is
 * the whole point: four sections sharing one opening gesture read as parts of
 * one system, and the README needs no headings at all.
 *
 * The identity plate is the exception and takes no head. It is not a section
 * of the document; it is what the document is about, and a numbered rail above
 * the name would rank it against the sections beneath it.
 */

import type { Canvas } from './canvas.js';
import { el, linePath } from './svg.js';
import { TYPE, GRID, STROKE, RADIUS, type Palette, type TypeStyle } from './tokens.js';

const L = GRID.margin;
const R = GRID.right;

/**
 * The section ordinals, in page order.
 *
 * These are the only integers drawn on the page that are not measurements, so
 * they live here rather than being typed into four renderers: the data-honesty
 * checks import this list and permit exactly these strings, which keeps "a
 * number the snapshot does not contain" a hard failure everywhere else.
 */
export const SECTIONS = {
  focus: '01',
  systems: '02',
  signal: '03',
  channels: '04',
} as const;

/** Baselines for the panel opening. Shared by every panel, never overridden. */
export const HEAD = {
  /** Index and section name sit here. */
  baseline: 34,
  /** The rule under the header. Content starts below it. */
  rail: 52,
  /** Gap between the index numeral and the section name. */
  indexGap: 22,
} as const;

/**
 * Assert a laid-out string fits its allotted box.
 *
 * Overflow in generated art is invisible until a human looks at the image, and
 * nobody looks at 16 SVGs on every commit. This turns a collision into a build
 * failure with the arithmetic attached.
 */
export function fit(label: string, measured: number, available: number): void {
  if (measured > available) {
    throw new Error(
      `Layout overflow: ${label} measures ${measured.toFixed(1)}u but only ${available.toFixed(1)}u is available ` +
        `(over by ${(measured - available).toFixed(1)}u). Shorten the string or drop a step on the type scale.`,
    );
  }
}

/** The outer frame. Every panel is the same drawn object at the same weight. */
export function frame(canvas: Canvas, palette: Palette): string {
  return el('rect', {
    x: 0.5,
    y: 0.5,
    width: canvas.width - 1,
    height: canvas.height - 1,
    rx: RADIUS,
    fill: 'none',
    stroke: palette.rule.hairline,
    'stroke-width': STROKE.hairline,
  });
}

/** A full-width hairline rule at `y`. */
export function rail(palette: Palette, y: number): string {
  return el('path', {
    d: linePath(L, y, R, y),
    stroke: palette.rule.hairline,
    'stroke-width': STROKE.hairline,
    fill: 'none',
  });
}

export interface PanelHeadOptions {
  /** Zero-padded section index, e.g. '01'. */
  index: string;
  /** Section name. Uppercased by the type style. */
  name: string;
  /** Optional right-aligned annotation, e.g. a measurement date. */
  meta?: string;
}

/**
 * Draw the panel opening: index, section name, optional right-aligned meta,
 * and the rail beneath them. Returns the markup; the caller appends it.
 */
export function head(canvas: Canvas, palette: Palette, opts: PanelHeadOptions): string {
  const indexWidth = canvas.measureText(opts.index, TYPE.label);
  const nameX = L + indexWidth + HEAD.indexGap;
  const nameWidth = canvas.measureText(opts.name, TYPE.label);

  const parts: string[] = [
    // The index is the brighter of the two: it is what makes five separate
    // images read as an ordered set rather than five unrelated pictures.
    canvas.text(opts.index, TYPE.label, { x: L, y: HEAD.baseline, fill: palette.text.secondary }),
    canvas.text(opts.name, TYPE.label, { x: nameX, y: HEAD.baseline, fill: palette.text.tertiary }),
  ];

  let used = indexWidth + HEAD.indexGap + nameWidth;
  if (opts.meta) {
    // Set at the information floor, not below it. v1 could drop provenance to
    // annotation size because the Markdown beneath repeated it verbatim; v2 has
    // no Markdown beneath, so every drawn string has to carry itself.
    const metaWidth = canvas.measureText(opts.meta, TYPE.label);
    used += 32 + metaWidth;
    parts.push(
      canvas.text(opts.meta, TYPE.label, {
        x: R,
        y: HEAD.baseline,
        anchor: 'end',
        fill: palette.text.tertiary,
      }),
    );
  }
  fit(`panel head "${opts.index} ${opts.name}"`, used, GRID.contentWidth);

  parts.push(rail(palette, HEAD.rail));
  return parts.join('');
}

/** Measure a string and assert it fits, in one call. */
export function fitted(
  canvas: Canvas,
  value: string,
  style: TypeStyle,
  available: number,
  label: string,
): number {
  const width = canvas.measureText(value, style);
  fit(label, width, available);
  return width;
}
