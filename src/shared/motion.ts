/**
 * Motion system.
 *
 * Every animated asset in this repository runs on a single master loop.
 * Instead of giving each element its own duration and delay (which drifts out
 * of phase after a few iterations and produces a visible seam), every animated
 * element shares one `animation-duration` equal to the master loop length, and
 * each element's timing is expressed as *percentages of that master loop*.
 *
 * The result: all elements restart on the same frame, forever, and the loop
 * point is mathematically seamless rather than approximately seamless.
 *
 * Times are given in seconds against the master timeline and converted here.
 */

/** Cubic-bezier easings. Motion is decelerating and calm — nothing bounces. */
export const EASE = {
  /** Default: fast out, long settle. Used for reveals. */
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Symmetric, for sweeps and traversals. */
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  /** Mechanical, for instrument needles and scanning lines. */
  linear: 'linear',
  /** Sharp arrival, for status flips that should feel like a relay closing. */
  snap: 'cubic-bezier(0.2, 0.9, 0.1, 1)',
} as const;

export type Easing = (typeof EASE)[keyof typeof EASE];

export interface Stop {
  /** Absolute time on the master timeline, in seconds. */
  at: number;
  /** CSS declarations active at this stop. */
  props: Record<string, string | number>;
  /** Easing used to travel from this stop to the next one. */
  ease?: Easing;
}

function pct(time: number, master: number): string {
  const value = (time / master) * 100;
  const rounded = Math.round(value * 1000) / 1000;
  return `${rounded}%`;
}

function declarations(props: Record<string, string | number>, ease?: Easing): string {
  const parts = Object.entries(props).map(([k, v]) => `${k}:${v}`);
  if (ease) parts.push(`animation-timing-function:${ease}`);
  return parts.join(';');
}

/**
 * Build a `@keyframes` rule from absolute timeline stops.
 *
 * Stops must be sorted and must fall inside [0, master]. A stop is emitted at
 * its exact percentage, so an element that is only active between 2.0s and
 * 3.2s of an 11s loop simply holds its start state before 18.18% and its end
 * state after 29.09% — no separate delay needed.
 */
export function keyframes(name: string, master: number, stops: Stop[]): string {
  if (stops.length < 2) throw new Error(`Keyframe "${name}" needs at least two stops`);
  const frames: string[] = [];
  let previous = -Infinity;
  for (const stop of stops) {
    if (stop.at < 0 || stop.at > master) {
      throw new Error(`Keyframe "${name}" stop at ${stop.at}s falls outside the ${master}s master loop`);
    }
    if (stop.at < previous) throw new Error(`Keyframe "${name}" stops are not sorted (${stop.at}s after ${previous}s)`);
    previous = stop.at;
    frames.push(`${pct(stop.at, master)}{${declarations(stop.props, stop.ease)}}`);
  }
  return `@keyframes ${name}{${frames.join('')}}`;
}

/** The `animation` shorthand every element on the master loop uses. */
export function loopAnimation(name: string, master: number): string {
  return `animation:${name} ${master}s linear infinite both`;
}

/**
 * A reveal that fades and lifts an element into place, then holds.
 * `hold` is where the element starts fading out again; omit to hold to the end.
 */
export function revealStops(
  master: number,
  start: number,
  duration: number,
  options: { lift?: number; from?: number; to?: number; out?: { at: number; duration: number } } = {},
): Stop[] {
  const { lift = 8, from = 0, to = 1, out } = options;
  const stops: Stop[] = [
    { at: 0, props: { opacity: from, transform: `translateY(${lift}px)` } },
    { at: start, props: { opacity: from, transform: `translateY(${lift}px)` }, ease: EASE.out },
    { at: start + duration, props: { opacity: to, transform: 'translateY(0)' } },
  ];
  if (out) {
    stops.push({ at: out.at, props: { opacity: to, transform: 'translateY(0)' }, ease: EASE.inOut });
    stops.push({ at: out.at + out.duration, props: { opacity: 0, transform: `translateY(${-lift / 2}px)` } });
  }
  if (stops[stops.length - 1]!.at < master) {
    const last = stops[stops.length - 1]!;
    stops.push({ at: master, props: { ...last.props } });
  }
  return stops;
}

/** Evenly spaced start times for a staggered group. */
export function stagger(index: number, start: number, step: number): number {
  return start + index * step;
}

/**
 * The reduced-motion contract — deliberately NOT implemented here.
 *
 * A `prefers-reduced-motion` media query inside an SVG that is rendered as an
 * image does not report the viewer's real setting. Measured in Chromium
 * (see docs/github-platform-constraints.md):
 *
 *   @media (prefers-reduced-motion: reduce)        -> always matches
 *   @media (prefers-reduced-motion: no-preference) -> never matches
 *
 * So a `no-preference` guard disables the animation for *everyone*, and a
 * `reduce` override does the same. Either one is a silent, total failure.
 *
 * Reduced motion is instead honoured one level up, in the README: every
 * animated asset also ships a `-static` variant holding the composed final
 * frame, selected by a `<picture>` `media` attribute that the README document
 * evaluates correctly. See `scripts/generate/readme.ts`.
 *
 * `tests/motion.test.ts` fails the build if any generated asset contains a
 * `prefers-reduced-motion` query, so this cannot regress by accident.
 */
export const REDUCED_MOTION_IS_HANDLED_IN_THE_README = true;

/**
 * Render an asset's CSS with animation either live or frozen.
 *
 * The static variant is produced from the *same* scene definition as the
 * animated one, so the two can never drift apart: the only difference is that
 * the animation declarations are dropped and every element renders in its
 * resting state.
 */
export function animationBlock(css: string, animated: boolean): string {
  return animated ? css : '';
}
