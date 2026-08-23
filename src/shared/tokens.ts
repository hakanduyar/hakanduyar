/**
 * The design system, as data.
 *
 * Two palettes with two different physical metaphors, not one palette and its
 * inverse:
 *
 *   dark  = emitted light on a dark instrument face. Brightness means presence,
 *           so the largest data segment is the *brightest*.
 *   light = deposited ink on technical paper. Density means presence, so the
 *           largest data segment is the *darkest*.
 *
 * The series ramps therefore run in opposite directions. `tests/tokens.test.ts`
 * asserts that, along with every contrast ratio quoted in docs/visual-system.md,
 * so a well-meaning "let me just invert it" edit fails the build.
 */

export type ThemeName = 'dark' | 'light';

export interface Palette {
  name: ThemeName;
  surface: { base: string; panel: string; raised: string; well: string };
  rule: { hairline: string; strong: string; tick: string };
  text: { primary: string; secondary: string; tertiary: string };
  /** The single chromatic hue in the system. Rationed to one element per asset. */
  signal: string;
  /** Unfilled portion of a track the signal travels along. Fill only, never text. */
  signalTrace: string;
  /** Data ramp, index 0 = largest segment. Direction differs per theme by design. */
  series: readonly [string, string, string, string];
  /** The "other" bucket: outlined, never filled. */
  seriesRemainder: string;
}

export const DARK: Palette = {
  name: 'dark',
  surface: { base: '#0B0E14', panel: '#10141C', raised: '#161B25', well: '#070910' },
  rule: { hairline: '#1E2632', strong: '#2E3846', tick: '#52606E' },
  text: { primary: '#E9EFF7', secondary: '#A3B4C8', tertiary: '#78899A' },
  signal: '#FF9E2C',
  signalTrace: '#7A5216',
  series: ['#DCE6F2', '#AEC0D4', '#8496AC', '#66788C'],
  seriesRemainder: '#78899A',
};

export const LIGHT: Palette = {
  name: 'light',
  // Warm paper, deliberately not #FFFFFF, so the asset reads as a sheet laid on
  // GitHub's white canvas rather than dissolving into it.
  surface: { base: '#FAFAF7', panel: '#F2F2EC', raised: '#E9E9E1', well: '#FFFFFF' },
  rule: { hairline: '#DBDBD1', strong: '#B2B2A4', tick: '#9AA0A8' },
  text: { primary: '#14171B', secondary: '#474D55', tertiary: '#616872' },
  signal: '#9C520F',
  signalTrace: '#E0C9A4',
  series: ['#171B20', '#3E454E', '#5F6771', '#7C848E'],
  seriesRemainder: '#616872',
};

export const PALETTES: Record<ThemeName, Palette> = { dark: DARK, light: LIGHT };
export const THEMES: readonly ThemeName[] = ['dark', 'light'];

// ---------------------------------------------------------------------------
// Type scale
// ---------------------------------------------------------------------------

import type { FontId } from './type.js';

export interface TypeStyle {
  size: number;
  font: FontId;
  tracking: number;
  upper: boolean;
}

/**
 * Sizes are SVG user units. At GitHub's ~890px desktop column, 1u = 1 CSS px;
 * at a 360px viewport the same unit is ~0.404 CSS px. `t-label` at 26u is the
 * floor for information-carrying text because it lands at ~10.5 CSS px there.
 */
export const TYPE = {
  display: { size: 72, font: 'w800', tracking: 0.16, upper: true },
  metricXl: { size: 60, font: 'w500', tracking: 0, upper: false },
  metric: { size: 40, font: 'w500', tracking: 0, upper: false },
  heading: { size: 32, font: 'w700', tracking: 0.2, upper: true },
  label: { size: 26, font: 'w500', tracking: 0.18, upper: true },
  micro: { size: 22, font: 'w400', tracking: 0.14, upper: true },
} as const satisfies Record<string, TypeStyle>;

/** Smallest size permitted for text that carries information. */
export const MIN_INFO_TYPE_SIZE = TYPE.label.size;

// ---------------------------------------------------------------------------
// Grid and spacing
// ---------------------------------------------------------------------------

/**
 * 10 columns of 63u, 20u gutters, 40u outer margins.
 *   40 + (10 x 63) + (9 x 20) + 40 = 890. Exact, no rounding.
 */
export const GRID = {
  width: 890,
  margin: 40,
  columns: 10,
  columnWidth: 63,
  gutter: 20,
  /** Distance between the left edges of adjacent columns. */
  get pitch(): number {
    return this.columnWidth + this.gutter;
  },
  /** Usable content width between the margins. */
  get contentWidth(): number {
    return this.width - this.margin * 2;
  },
  /** Right edge of the content area. */
  get right(): number {
    return this.width - this.margin;
  },
} as const;

/** Left edge of column `n`, 1-indexed. */
export function col(n: number): number {
  return GRID.margin + (n - 1) * GRID.pitch;
}

/** Right edge of column `n`, 1-indexed. */
export function colEnd(n: number): number {
  return col(n) + GRID.columnWidth;
}

/** Span from column `from` to column `to` inclusive. */
export function span(from: number, to: number): { x: number; width: number } {
  return { x: col(from), width: colEnd(to) - col(from) };
}

/** The only spacing values that exist. Anything else is a review failure. */
export const SPACE = [4, 8, 12, 16, 24, 32, 48, 64, 96] as const;

/** 8u vertical rhythm. Baselines and rules land on multiples of this. */
export const BASELINE = 8;

/** Hairlines sit on a .5 coordinate so a 1u stroke covers exactly one pixel at 1x. */
export function hairlineY(y: number): number {
  return Math.round(y) + 0.5;
}

export const STROKE = {
  /** Structural rules and panel edges. */
  hairline: 1,
  /** Anything that must survive the ~0.4x mobile downscale. */
  strong: 1.5,
  /** Data tracks. */
  track: 4,
  /** The signal index line. */
  index: 2,
} as const;

/** Containers are instrument panels, not app cards. Radii above 4 are banned. */
export const RADIUS = 2;

// ---------------------------------------------------------------------------
// Motion tokens
// ---------------------------------------------------------------------------

export const DUR = {
  micro: 120,
  short: 240,
  medium: 420,
  long: 720,
  /** Hard ceiling for the entire entrance sequence. */
  sequenceMax: 2400,
  /** Between staggered siblings; at most 8 items. */
  stagger: 60,
} as const;

export const EASE = {
  /** Reveals, wipes, rises. The default. */
  entrance: 'cubic-bezier(0.16,1,0.3,1)',
  /** Anything that both starts and stops in view. */
  standard: 'cubic-bezier(0.4,0,0.2,1)',
  /** A needle finding a reading: decisive start, long settle. */
  instrument: 'cubic-bezier(0.33,0,0.15,1)',
  /** Permitted only for the single continuous loop. */
  linear: 'linear',
} as const;

// ---------------------------------------------------------------------------
// Contrast (WCAG 2.x relative luminance)
// ---------------------------------------------------------------------------

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`Not a 6-digit hex colour: ${hex}`);
  const int = parseInt(match[1] as string, 16);
  const r = channel((int >> 16) & 0xff);
  const g = channel((int >> 8) & 0xff);
  const b = channel(int & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG AA for normal text. */
export const TEXT_CONTRAST_FLOOR = 4.5;
/** WCAG AA for graphical objects and UI components. */
export const GRAPHIC_CONTRAST_FLOOR = 3;
