/**
 * Typography engine.
 *
 * Text inside an SVG that is embedded as an <img> (which is how GitHub renders
 * every README asset, behind the camo proxy) cannot load a webfont: external
 * requests from inside the image are blocked. Relying on generic family stacks
 * would make the layout shift between macOS, Windows and Linux viewers.
 *
 * So every glyph is converted to a vector outline at build time. The rendered
 * result is byte-identical for every viewer, at any zoom level, with no network
 * dependency — at the cost of the text no longer being selectable, which is why
 * every asset also carries a <title>/<desc> pair and the README repeats all
 * critical information as real Markdown.
 */

import * as fontkit from 'fontkit';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { n } from './svg.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '../..');

/**
 * Weights of the single vendored family. The design system uses one family
 * everywhere inside assets (see docs/visual-system.md): monospace metrics keep
 * value columns aligned without hand-tuning, and one family means one glyph
 * subset to reason about.
 */
export type FontId = 'w400' | 'w500' | 'w700' | 'w800';

const FONT_FILES: Record<FontId, string> = {
  w400: 'assets/fonts/JetBrainsMono-400.woff2',
  w500: 'assets/fonts/JetBrainsMono-500.woff2',
  w700: 'assets/fonts/JetBrainsMono-700.woff2',
  w800: 'assets/fonts/JetBrainsMono-800.woff2',
};

type LoadedFont = fontkit.Font;
const cache = new Map<FontId, LoadedFont>();

export function loadFont(id: FontId): LoadedFont {
  const hit = cache.get(id);
  if (hit) return hit;
  const path = resolve(REPO_ROOT, FONT_FILES[id]);
  const font = fontkit.openSync(path);
  if ('fonts' in font) throw new Error(`${id} resolved to a font collection, expected a single face`);
  cache.set(id, font);
  return font;
}

export interface TextOptions {
  font: FontId;
  /** Cap-to-baseline agnostic: this is the em size, as in CSS `font-size`. */
  size: number;
  /** Letter-spacing in em units (CSS `letter-spacing: 0.08em` -> 0.08). */
  tracking?: number;
  /** Uppercase the string before layout. */
  upper?: boolean;
}

export interface GlyphOutline {
  /** Absolute `d`, already scaled, y-flipped and offset by `x`. */
  d: string;
  /** Pen position of this glyph relative to the text origin. */
  x: number;
  /** Advance consumed by this glyph, including tracking. */
  advance: number;
  /** True for glyphs with no contours (space). */
  blank: boolean;
}

export interface LaidOutText {
  /** Every glyph as its own path, so a caller can measure or place one at a time. */
  glyphs: GlyphOutline[];
  /** All glyph outlines concatenated into a single `d`. */
  d: string;
  /** Total advance width including trailing tracking removal. */
  width: number;
  /** Distance from baseline up to the font ascender, in user units. */
  ascent: number;
  /** Distance from baseline down to the font descender (positive), in user units. */
  descent: number;
  /** Cap height in user units — the metric to align technical labels on. */
  capHeight: number;
}

/**
 * Serialize a fontkit glyph path, scaling to `size`, flipping the y axis into
 * SVG space and rounding aggressively. Rounding here is the single biggest
 * lever on output size: full float precision roughly triples the byte count
 * with zero visible difference at README scale.
 */
function serializeGlyph(path: fontkit.Path, scale: number, dx: number): string {
  let d = '';
  for (const cmd of path.commands) {
    const a = cmd.args;
    switch (cmd.command) {
      case 'moveTo':
        d += `M${n(a[0]! * scale + dx)} ${n(-a[1]! * scale)}`;
        break;
      case 'lineTo':
        d += `L${n(a[0]! * scale + dx)} ${n(-a[1]! * scale)}`;
        break;
      case 'quadraticCurveTo':
        d += `Q${n(a[0]! * scale + dx)} ${n(-a[1]! * scale)} ${n(a[2]! * scale + dx)} ${n(-a[3]! * scale)}`;
        break;
      case 'bezierCurveTo':
        d += `C${n(a[0]! * scale + dx)} ${n(-a[1]! * scale)} ${n(a[2]! * scale + dx)} ${n(-a[3]! * scale)} ${n(a[4]! * scale + dx)} ${n(-a[5]! * scale)}`;
        break;
      case 'closePath':
        d += 'Z';
        break;
      default:
        throw new Error(`Unhandled path command: ${(cmd as { command: string }).command}`);
    }
  }
  return d;
}

/**
 * Lay out a string into absolute outlines with the text origin at (0, baseline).
 * Kerning comes from the font's own layout engine; tracking is applied on top.
 */
export function layout(text: string, opts: TextOptions): LaidOutText {
  const source = opts.upper ? text.toUpperCase() : text;
  const font = loadFont(opts.font);
  const scale = opts.size / font.unitsPerEm;
  const trackingPx = (opts.tracking ?? 0) * opts.size;

  const run = font.layout(source);
  const glyphs: GlyphOutline[] = [];
  let pen = 0;

  for (let i = 0; i < run.glyphs.length; i++) {
    const glyph = run.glyphs[i]!;
    const pos = run.positions[i]!;
    const path = glyph.path;
    const blank = path.commands.length === 0;
    const advance = pos.xAdvance * scale + trackingPx;
    glyphs.push({
      d: blank ? '' : serializeGlyph(path, scale, pen + pos.xOffset * scale),
      x: pen,
      advance,
      blank,
    });
    pen += advance;
  }

  // Trailing tracking is visual padding, not part of the measured width.
  const width = source.length > 0 ? pen - trackingPx : 0;

  return {
    glyphs,
    d: glyphs.map((glyph) => glyph.d).join(''),
    width,
    ascent: font.ascent * scale,
    descent: Math.abs(font.descent) * scale,
    capHeight: (font.capHeight || font.ascent * 0.72) * scale,
  };
}

/** Measure without building outlines — used by layout planners. */
export function measure(text: string, opts: TextOptions): number {
  const source = opts.upper ? text.toUpperCase() : text;
  if (source.length === 0) return 0;
  const font = loadFont(opts.font);
  const scale = opts.size / font.unitsPerEm;
  const trackingPx = (opts.tracking ?? 0) * opts.size;
  const run = font.layout(source);
  return run.advanceWidth * scale + trackingPx * (run.glyphs.length - 1);
}

export type Anchor = 'start' | 'middle' | 'end';

/** x offset to apply so that a run of `width` sits at `anchor` relative to `x`. */
export function anchorOffset(width: number, anchor: Anchor): number {
  if (anchor === 'middle') return -width / 2;
  if (anchor === 'end') return -width;
  return 0;
}
