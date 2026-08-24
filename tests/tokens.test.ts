/**
 * Design-token invariants.
 *
 * These encode the rules of docs/visual-system.md as executable assertions,
 * so a well-meaning palette edit that breaks a contrast floor or inverts a
 * ramp direction fails the build instead of shipping.
 */

import { describe, it, expect } from 'vitest';
import {
  DARK,
  LIGHT,
  GRID,
  TYPE,
  contrastRatio,
  relativeLuminance,
  TEXT_CONTRAST_FLOOR,
  GRAPHIC_CONTRAST_FLOOR,
  col,
  colEnd,
} from '../src/shared/tokens.js';

describe('palette contrast', () => {
  for (const palette of [DARK, LIGHT]) {
    const base = palette.surface.base;

    it(`${palette.name}: every text token meets WCAG AA (${TEXT_CONTRAST_FLOOR}:1)`, () => {
      for (const [name, hex] of Object.entries(palette.text)) {
        const ratio = contrastRatio(hex, base);
        expect(ratio, `text.${name} ${hex} vs ${base}`).toBeGreaterThanOrEqual(TEXT_CONTRAST_FLOOR);
      }
    });

    it(`${palette.name}: signal and every filled series segment meet the graphic floor (${GRAPHIC_CONTRAST_FLOOR}:1)`, () => {
      expect(contrastRatio(palette.signal, base)).toBeGreaterThanOrEqual(GRAPHIC_CONTRAST_FLOOR);
      for (const [index, hex] of palette.series.entries()) {
        expect(
          contrastRatio(hex, base),
          `series[${index}] ${hex} vs ${base}`,
        ).toBeGreaterThanOrEqual(GRAPHIC_CONTRAST_FLOOR);
      }
    });

    it(`${palette.name}: tick rule meets the graphic floor, hairline stays structural`, () => {
      expect(contrastRatio(palette.rule.tick, base)).toBeGreaterThanOrEqual(2.5);
      // Hairlines are deliberately below text contrast: they must never carry text.
      expect(contrastRatio(palette.rule.hairline, base)).toBeLessThan(TEXT_CONTRAST_FLOOR);
    });
  }

  it('label-weight text reads identically across themes (both tertiary tokens at the same ratio)', () => {
    const dark = contrastRatio(DARK.text.tertiary, DARK.surface.base);
    const light = contrastRatio(LIGHT.text.tertiary, LIGHT.surface.base);
    expect(Math.abs(dark - light)).toBeLessThan(0.05);
  });
});

describe('series ramp direction', () => {
  it('dark: the largest data segment is the BRIGHTEST (emitted light)', () => {
    const luminances = DARK.series.map(relativeLuminance);
    for (let i = 1; i < luminances.length; i++) {
      expect(luminances[i]!, `dark series[${i}] must be dimmer than series[${i - 1}]`).toBeLessThan(
        luminances[i - 1]!,
      );
    }
  });

  it('light: the largest data segment is the DARKEST (deposited ink)', () => {
    const luminances = LIGHT.series.map(relativeLuminance);
    for (let i = 1; i < luminances.length; i++) {
      expect(luminances[i]!, `light series[${i}] must be lighter than series[${i - 1}]`).toBeGreaterThan(
        luminances[i - 1]!,
      );
    }
  });

  it('the two ramps run in opposite directions (an inverted-dark light theme fails here)', () => {
    const darkDirection = relativeLuminance(DARK.series[0]) - relativeLuminance(DARK.series[3]);
    const lightDirection = relativeLuminance(LIGHT.series[0]) - relativeLuminance(LIGHT.series[3]);
    expect(Math.sign(darkDirection)).not.toBe(Math.sign(lightDirection));
  });
});

describe('single-chroma rule', () => {
  /** Rough chroma proxy: spread between the RGB channels. */
  function channelSpread(hex: string): number {
    const int = parseInt(hex.slice(1), 16);
    const r = (int >> 16) & 0xff;
    const g = (int >> 8) & 0xff;
    const b = int & 0xff;
    return Math.max(r, g, b) - Math.min(r, g, b);
  }

  for (const palette of [DARK, LIGHT]) {
    it(`${palette.name}: only the signal tokens are strongly chromatic`, () => {
      const spreads = [
        ...Object.values(palette.text),
        ...palette.series,
        ...Object.values(palette.rule),
        palette.seriesRemainder,
      ].map(channelSpread);
      // Everything except signal/signalTrace stays near-neutral.
      for (const spread of spreads) expect(spread).toBeLessThan(60);
      expect(channelSpread(palette.signal)).toBeGreaterThan(80);
    });
  }
});

describe('grid arithmetic', () => {
  it('margins + columns + gutters add up to exactly 890, no rounding', () => {
    expect(GRID.margin * 2 + GRID.columns * GRID.columnWidth + (GRID.columns - 1) * GRID.gutter).toBe(
      GRID.width,
    );
  });

  it('column edges land where the formula says', () => {
    expect(col(1)).toBe(40);
    expect(colEnd(10)).toBe(850);
    expect(col(2) - colEnd(1)).toBe(GRID.gutter);
  });
});

describe('type scale', () => {
  it('the information floor is the label size', () => {
    expect(TYPE.label.size).toBe(26);
    expect(TYPE.micro.size).toBeLessThan(TYPE.label.size);
  });

  it('sizes descend display > metricXl > metric > heading > label > micro', () => {
    const sizes = [TYPE.display, TYPE.metricXl, TYPE.metric, TYPE.heading, TYPE.label, TYPE.micro].map(
      (t) => t.size,
    );
    for (let i = 1; i < sizes.length; i++) expect(sizes[i]!).toBeLessThan(sizes[i - 1]!);
  });
});
