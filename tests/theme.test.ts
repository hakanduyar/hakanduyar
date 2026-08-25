import { describe, expect, it } from 'vitest';
import { GENERATED_ASSET_NAMES } from '../src/assets.js';
import { THEMES } from '../src/theme.js';

function luminance(hex: string): number {
  const channels = hex.slice(1).match(/.{2}/g)?.map((channel) => Number.parseInt(channel, 16) / 255) ?? [];
  const linear = channels.map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  return .2126 * (linear[0] ?? 0) + .7152 * (linear[1] ?? 0) + .0722 * (linear[2] ?? 0);
}

function contrast(first: string, second: string): number {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return ((values[0] ?? 0) + .05) / ((values[1] ?? 0) + .05);
}

describe('dark-only public profile', () => {
  it('publishes only the fifteen canonical dark assets', () => {
    expect(GENERATED_ASSET_NAMES).toHaveLength(15);
    for (const asset of GENERATED_ASSET_NAMES) {
      expect(asset).toMatch(/-dark\.svg$/);
      expect(asset).not.toMatch(/theme-control|-light\.svg/);
    }
  });

  it('keeps the dark palette legible and atmospheric', () => {
    const dark = THEMES.dark;
    expect(contrast(dark.text, dark.bg)).toBeGreaterThanOrEqual(10);
    expect(contrast(dark.muted, dark.bg)).toBeGreaterThanOrEqual(4.5);
    for (const accent of [dark.blue, dark.amber, dark.red, dark.violet, dark.mint]) {
      expect(contrast(accent, dark.bg)).toBeGreaterThanOrEqual(3);
    }
  });
});
