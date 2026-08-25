import { describe, expect, it } from 'vitest';
import { renderThemeControl } from '../src/scenes/theme-control.js';
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

function composite(foreground: string, background: string, alpha: number): string {
  const foregroundChannels = foreground.slice(1).match(/.{2}/g)?.map((channel) => Number.parseInt(channel, 16)) ?? [];
  const backgroundChannels = background.slice(1).match(/.{2}/g)?.map((channel) => Number.parseInt(channel, 16)) ?? [];
  const channels = foregroundChannels.map((channel, index) => (
    Math.round(channel * alpha + (backgroundChannels[index] ?? 0) * (1 - alpha))
  ));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

describe('light-theme visibility', () => {
  const light = THEMES.light;

  it('keeps readable text and accents comfortably above WCAG AA against white', () => {
    expect(contrast(light.text, light.bg)).toBeGreaterThanOrEqual(18);
    expect(contrast(light.muted, light.bg)).toBeGreaterThanOrEqual(9);
    for (const accent of [light.blue, light.amber, light.red, light.violet, light.mint]) {
      expect(contrast(accent, light.bg)).toBeGreaterThanOrEqual(6.5);
    }
  });

  it('keeps structural lines visible instead of dissolving into the GitHub canvas', () => {
    expect(contrast(light.line, light.bg)).toBeGreaterThanOrEqual(3.5);
    expect(contrast(light.line, light.surface)).toBeGreaterThanOrEqual(3);
    expect(contrast(light.lineSoft, light.bg)).toBeGreaterThanOrEqual(2.5);
  });

  it('keeps composited grid lines visible at their rendered opacity', () => {
    const heroMinorGrid = composite(light.lineSoft, light.bg, .92 * .72);
    const heroMajorGrid = composite(light.lineSoft, light.bg, .92 * .92);
    const signalGrid = composite(light.lineSoft, light.bg, .82);

    expect(contrast(heroMinorGrid, light.bg)).toBeGreaterThanOrEqual(1.75);
    expect(contrast(heroMajorGrid, light.bg)).toBeGreaterThanOrEqual(2.1);
    expect(contrast(signalGrid, light.bg)).toBeGreaterThanOrEqual(2);
  });

  it('renders an accessible, static appearance control in both themes', () => {
    for (const theme of Object.values(THEMES)) {
      for (const compact of [false, true]) {
        const source = renderThemeControl(theme, compact);
        expect(source).toContain('GitHub light and dark appearance settings');
        expect(source).toContain(compact ? '>APPEARANCE<' : '>GITHUB APPEARANCE<');
        expect(source).toContain(compact ? 'viewBox="0 0 390 92"' : 'viewBox="0 0 960 120"');
        expect(source).toContain('LIGHT');
        expect(source).toContain('DARK');
        expect(source).toContain('data-audit-text');
        expect(source).toContain('data-audit-geometry');
        expect(source).toContain(`.light-choice{fill:${theme.name === 'light' ? theme.bg : theme.muted}}`);
        expect(source).toContain(`.dark-choice{fill:${theme.name === 'dark' ? theme.bg : theme.muted}}`);
        expect(source).not.toMatch(/<script|@keyframes|<polygon/i);
      }
    }
  });
});
