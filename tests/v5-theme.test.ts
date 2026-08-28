import { describe, expect, it } from 'vitest';
import { V5_THEMES } from '../src/v5/theme.js';

function luminance(hex: string): number {
  const channels = hex.slice(1).match(/.{2}/g)?.map((channel) => Number.parseInt(channel, 16) / 255) ?? [];
  const linear = channels.map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  return .2126 * (linear[0] ?? 0) + .7152 * (linear[1] ?? 0) + .0722 * (linear[2] ?? 0);
}

function contrast(first: string, second: string): number {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return ((values[0] ?? 0) + .05) / ((values[1] ?? 0) + .05);
}

describe('V5 document themes', () => {
  for (const [name, theme] of Object.entries(V5_THEMES)) {
    it(`${name} keeps primary and annotation text above the production contrast floor`, () => {
      expect(contrast(theme.ink, theme.sheet)).toBeGreaterThanOrEqual(10);
      expect(contrast(theme.muted, theme.sheet)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(theme.faint, theme.sheet2)).toBeGreaterThanOrEqual(4.5);
    });
  }

  it('uses authored light and dark documents instead of an inversion', () => {
    expect(V5_THEMES.light.bg).not.toBe(V5_THEMES.dark.bg);
    expect(V5_THEMES.light.sheet).not.toBe(V5_THEMES.dark.sheet);
    expect(V5_THEMES.light.flow).not.toBe(V5_THEMES.dark.flow);
  });
});
