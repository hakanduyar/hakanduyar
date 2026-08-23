/**
 * Geometry primitives for the HUD vocabulary.
 *
 * These build `d` strings only — no colour, no stroke, no animation. Keeping
 * them free of styling is what lets the same primitive serve the dark
 * instrument palette and the light blueprint palette without a branch.
 */

import { linePath, pointOnCircle, n } from './svg.js';

/**
 * A ring of radial ticks. `major` every `majorEvery` ticks is drawn longer,
 * which is what reads as an instrument rather than a decoration.
 */
export function tickRing(
  cx: number,
  cy: number,
  radius: number,
  opts: { count: number; length: number; majorEvery?: number; majorLength?: number; from?: number; to?: number },
): { minor: string; major: string } {
  const { count, length, majorEvery = 0, majorLength = length * 2, from = 0, to = 360 } = opts;
  const span = to - from;
  const minor: string[] = [];
  const major: string[] = [];
  for (let i = 0; i < count; i++) {
    const deg = from + (span * i) / count;
    const isMajor = majorEvery > 0 && i % majorEvery === 0;
    const len = isMajor ? majorLength : length;
    const [x1, y1] = pointOnCircle(cx, cy, radius - len, deg);
    const [x2, y2] = pointOnCircle(cx, cy, radius, deg);
    (isMajor ? major : minor).push(linePath(x1, y1, x2, y2));
  }
  return { minor: minor.join(''), major: major.join('') };
}

/** Corner brackets — four L shapes marking a rectangle without boxing it in. */
export function cornerBrackets(x: number, y: number, w: number, h: number, arm: number): string {
  return [
    `M${n(x)} ${n(y + arm)}L${n(x)} ${n(y)}L${n(x + arm)} ${n(y)}`,
    `M${n(x + w - arm)} ${n(y)}L${n(x + w)} ${n(y)}L${n(x + w)} ${n(y + arm)}`,
    `M${n(x + w)} ${n(y + h - arm)}L${n(x + w)} ${n(y + h)}L${n(x + w - arm)} ${n(y + h)}`,
    `M${n(x + arm)} ${n(y + h)}L${n(x)} ${n(y + h)}L${n(x)} ${n(y + h - arm)}`,
  ].join('');
}

/** A ruled measurement scale: a baseline with graduated ticks along it. */
export function ruler(
  x: number,
  y: number,
  width: number,
  opts: { count: number; length: number; majorEvery?: number; majorLength?: number; up?: boolean },
): { axis: string; minor: string; major: string } {
  const { count, length, majorEvery = 5, majorLength = length * 2.2, up = false } = opts;
  const dir = up ? -1 : 1;
  const minor: string[] = [];
  const major: string[] = [];
  for (let i = 0; i <= count; i++) {
    const tx = x + (width * i) / count;
    const isMajor = i % majorEvery === 0;
    const len = isMajor ? majorLength : length;
    (isMajor ? major : minor).push(linePath(tx, y, tx, y + len * dir));
  }
  return { axis: linePath(x, y, x + width, y), minor: minor.join(''), major: major.join('') };
}

/** Uniform dot field — the substrate a technical grid sits on. */
export function dotGrid(x: number, y: number, w: number, h: number, step: number, r: number): string {
  const parts: string[] = [];
  for (let py = y; py <= y + h + 0.001; py += step) {
    for (let px = x; px <= x + w + 0.001; px += step) {
      parts.push(`M${n(px - r)} ${n(py)}a${n(r)} ${n(r)} 0 1 0 ${n(r * 2)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-r * 2)} 0`);
    }
  }
  return parts.join('');
}

/** Orthogonal routed connector — the circuit-trace look, never a diagonal. */
export function routedTrace(
  from: readonly [number, number],
  to: readonly [number, number],
  opts: { bend?: number; axis?: 'h' | 'v' } = {},
): string {
  const { bend = 8, axis = 'h' } = opts;
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = Math.sign(x2 - x1);
  const dy = Math.sign(y2 - y1);
  const cut = Math.min(bend, Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2);

  if (Math.abs(y2 - y1) < 0.5) return linePath(x1, y1, x2, y2);
  if (Math.abs(x2 - x1) < 0.5) return linePath(x1, y1, x2, y2);

  if (axis === 'h') {
    const mid = x1 + (x2 - x1) / 2;
    return (
      `M${n(x1)} ${n(y1)}L${n(mid - cut * dx)} ${n(y1)}` +
      `L${n(mid)} ${n(y1 + cut * dy)}L${n(mid)} ${n(y2 - cut * dy)}` +
      `L${n(mid + cut * dx)} ${n(y2)}L${n(x2)} ${n(y2)}`
    );
  }
  const mid = y1 + (y2 - y1) / 2;
  return (
    `M${n(x1)} ${n(y1)}L${n(x1)} ${n(mid - cut * dy)}` +
    `L${n(x1 + cut * dx)} ${n(mid)}L${n(x2 - cut * dx)} ${n(mid)}` +
    `L${n(x2)} ${n(mid + cut * dy)}L${n(x2)} ${n(y2)}`
  );
}

/** Crosshair with a gap at the centre, as used for a registration mark. */
export function crosshair(cx: number, cy: number, size: number, gap: number): string {
  return [
    linePath(cx - size, cy, cx - gap, cy),
    linePath(cx + gap, cy, cx + size, cy),
    linePath(cx, cy - size, cx, cy - gap),
    linePath(cx, cy + gap, cx, cy + size),
  ].join('');
}

/**
 * Total length of a path made only of M/L commands.
 * Needed to set `stroke-dasharray`/`stroke-dashoffset` for a draw-on animation
 * without measuring in a browser.
 */
export function polylineLength(path: string): number {
  const commands = path.match(/[ML][^ML]*/g) ?? [];
  let total = 0;
  let px = 0;
  let py = 0;
  for (const command of commands) {
    const [x, y] = command
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number) as [number, number];
    if (command[0] === 'L') total += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return total;
}

/** Map a value from one range to another, clamped. */
export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if (inMax === inMin) return outMin;
  const t = Math.min(1, Math.max(0, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}
