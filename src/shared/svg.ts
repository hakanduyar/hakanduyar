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

/** Axis-aligned line as a path (cheaper than <line> once minified). */
export function linePath(x1: number, y1: number, x2: number, y2: number): string {
  return `M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}`;
}
