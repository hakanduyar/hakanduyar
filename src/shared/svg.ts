/**
 * Minimal, allocation-cheap SVG document builder.
 *
 * Everything the HDU system emits goes through here so that escaping, numeric
 * precision and attribute ordering stay deterministic — byte-identical output
 * for identical input is a hard requirement of the validation harness.
 */

export type Attrs = Record<string, string | number | undefined | null | false>;

/** Coordinate precision used across every emitted path/shape. */
export const PRECISION = 2;

/** Round to PRECISION and strip trailing zeros: 12.500 -> 12.5, 12.00 -> 12 */
export function n(value: number, precision = PRECISION): string {
  if (!Number.isFinite(value)) throw new Error(`Non-finite coordinate: ${value}`);
  const fixed = value.toFixed(precision);
  return fixed.includes('.') ? fixed.replace(/\.?0+$/, '') : fixed;
}

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

/** Escape a value for use inside an XML attribute or text node. */
export function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => XML_ESCAPES[c] as string);
}

function serializeAttrs(attrs: Attrs): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    const raw = typeof value === 'number' ? n(value) : value;
    parts.push(`${key}="${esc(raw)}"`);
  }
  return parts.length ? ' ' + parts.join(' ') : '';
}

/** Self-closing element: `<rect x="1" .../>` */
export function el(tag: string, attrs: Attrs = {}): string {
  return `<${tag}${serializeAttrs(attrs)}/>`;
}

/** Container element with children: `<g ...>...</g>` */
export function group(tag: string, attrs: Attrs, children: (string | null | undefined | false)[]): string {
  const body = children.filter(Boolean).join('');
  return `<${tag}${serializeAttrs(attrs)}>${body}</${tag}>`;
}

/** `<g>` shorthand. */
export function g(attrs: Attrs, ...children: (string | null | undefined | false)[]): string {
  return group('g', attrs, children);
}

/** A `<style>` block. CSS is emitted verbatim — it must already be minified. */
export function style(css: string): string {
  return `<style>${css}</style>`;
}

/**
 * Root `<svg>` element.
 *
 * `title` and `desc` are emitted as the first children and wired up with
 * `role="img"` + `aria-labelledby` so assistive technology reads the asset
 * even when it is embedded through GitHub's camo image proxy.
 */
export interface SvgDocOptions {
  width: number;
  height: number;
  title: string;
  desc?: string;
  idPrefix: string;
}

export function svgDocument(opts: SvgDocOptions, body: string): string {
  const titleId = `${opts.idPrefix}-title`;
  const descId = opts.desc ? `${opts.idPrefix}-desc` : undefined;
  const labelledBy = descId ? `${titleId} ${descId}` : titleId;
  const head =
    `<title id="${titleId}">${esc(opts.title)}</title>` +
    (opts.desc ? `<desc id="${descId}">${esc(opts.desc)}</desc>` : '');

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `viewBox="0 0 ${n(opts.width)} ${n(opts.height)}" ` +
    `width="${n(opts.width)}" height="${n(opts.height)}" ` +
    `role="img" aria-labelledby="${labelledBy}" ` +
    `font-kerning="none">` +
    head +
    body +
    `</svg>`
  );
}

/** Build a `d` attribute from absolute polyline points. */
export function polylinePath(points: readonly (readonly [number, number])[], close = false): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points as [readonly [number, number], ...(readonly [number, number])[]];
  let d = `M${n(first[0])} ${n(first[1])}`;
  for (const [x, y] of rest) d += `L${n(x)} ${n(y)}`;
  return close ? d + 'Z' : d;
}

/** Axis-aligned line as a path (cheaper than <line> once minified). */
export function linePath(x1: number, y1: number, x2: number, y2: number): string {
  return `M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}`;
}

/**
 * Arc along a circle, drawn clockwise from `startDeg` to `endDeg`.
 * 0deg points to 12 o'clock; degrees increase clockwise.
 */
export function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const sweep = endDeg - startDeg;
  if (Math.abs(sweep) < 1e-6) return '';
  // A single <path> arc cannot express a full circle; callers wanting 360deg
  // should use <circle> instead. Guard rather than silently drawing nothing.
  if (Math.abs(sweep) >= 360) throw new Error('arcPath cannot draw a full circle — use a <circle>');
  const p0 = pointOnCircle(cx, cy, r, startDeg);
  const p1 = pointOnCircle(cx, cy, r, endDeg);
  const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
  const sweepFlag = sweep > 0 ? 1 : 0;
  return `M${n(p0[0])} ${n(p0[1])}A${n(r)} ${n(r)} 0 ${largeArc} ${sweepFlag} ${n(p1[0])} ${n(p1[1])}`;
}

/** Point on a circle. 0deg = 12 o'clock, clockwise-positive. */
export function pointOnCircle(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

/** Rounded-corner rect path with independent corner radii (HUD panel chamfers). */
export function chamferRect(
  x: number,
  y: number,
  w: number,
  h: number,
  cut: number,
  corners: { tl?: boolean; tr?: boolean; br?: boolean; bl?: boolean } = { tl: true, br: true },
): string {
  const { tl = false, tr = false, br = false, bl = false } = corners;
  const pts: string[] = [];
  pts.push(`M${n(x + (tl ? cut : 0))} ${n(y)}`);
  pts.push(`L${n(x + w - (tr ? cut : 0))} ${n(y)}`);
  if (tr) pts.push(`L${n(x + w)} ${n(y + cut)}`);
  pts.push(`L${n(x + w)} ${n(y + h - (br ? cut : 0))}`);
  if (br) pts.push(`L${n(x + w - cut)} ${n(y + h)}`);
  pts.push(`L${n(x + (bl ? cut : 0))} ${n(y + h)}`);
  if (bl) pts.push(`L${n(x)} ${n(y + h - cut)}`);
  pts.push(`L${n(x)} ${n(y + (tl ? cut : 0))}`);
  pts.push('Z');
  return pts.join('');
}
