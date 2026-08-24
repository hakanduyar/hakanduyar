/**
 * Typography engine tests: determinism, measurement, and outline generation.
 */

import { describe, it, expect } from 'vitest';
import { layout, measure, anchorOffset, loadFont } from '../src/shared/type.js';
import { TYPE } from '../src/shared/tokens.js';

describe('font loading', () => {
  it('loads every vendored weight', () => {
    for (const id of ['w400', 'w500', 'w700', 'w800'] as const) {
      const font = loadFont(id);
      expect(font.unitsPerEm).toBeGreaterThan(0);
    }
  });
});

describe('layout', () => {
  it('is deterministic', () => {
    const a = layout('HAKAN DUYAR', TYPE.display);
    const b = layout('HAKAN DUYAR', TYPE.display);
    expect(a.d).toBe(b.d);
    expect(a.width).toBe(b.width);
  });

  it('produces path data for every non-space glyph', () => {
    const run = layout('ABC 123', TYPE.label);
    const drawn = run.glyphs.filter((g) => !g.blank);
    expect(drawn).toHaveLength(6);
    for (const glyph of drawn) expect(glyph.d).toMatch(/^M/);
  });

  it('uppercases when the style says so', () => {
    const run = layout('abc', { size: 26, font: 'w500', tracking: 0, upper: true });
    const lower = layout('abc', { size: 26, font: 'w500', tracking: 0, upper: false });
    expect(run.d).not.toBe(lower.d);
  });

  it('emits only 2-decimal coordinates (byte-stability contract)', () => {
    const run = layout('HDU 64.2%', TYPE.metric);
    const numbers = run.d.match(/-?\d+\.\d{3,}/g);
    expect(numbers).toBeNull();
  });

  it('measure() agrees with layout().width', () => {
    for (const text of ['REPOSITORIES', 'SOURCE DISTRIBUTION', 'a b c']) {
      expect(measure(text, TYPE.label)).toBeCloseTo(layout(text, TYPE.label).width, 6);
    }
  });

  it('tracking widens the run', () => {
    const tracked = measure('TELEMETRY', { size: 26, font: 'w500', tracking: 0.18, upper: true });
    const plain = measure('TELEMETRY', { size: 26, font: 'w500', tracking: 0, upper: true });
    expect(tracked).toBeGreaterThan(plain);
  });

  it('monospace advance is uniform, so columns align by arithmetic', () => {
    const one = measure('0', TYPE.metric);
    const ten = measure('0000000000', TYPE.metric);
    expect(ten).toBeCloseTo(one * 10, 3);
  });
});

describe('anchorOffset', () => {
  it('start / middle / end behave like SVG text-anchor', () => {
    expect(anchorOffset(100, 'start')).toBe(0);
    expect(anchorOffset(100, 'middle')).toBe(-50);
    expect(anchorOffset(100, 'end')).toBe(-100);
  });
});
