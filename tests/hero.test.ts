import { describe, expect, it } from 'vitest';
import { optimizeSvg } from '../src/emit.js';
import { renderHero } from '../src/scenes/hero.js';
import { THEMES } from '../src/theme.js';

describe('V4 hero identity', () => {
  for (const theme of Object.values(THEMES)) {
    it(`renders one three-mode ${theme.name} timeline`, () => {
      const source = renderHero(theme, true);
      expect(source).toContain('MODE 01');
      expect(source).toContain('MODE 02');
      expect(source).toContain('MODE 03');
      expect(source).toContain('12s');
      expect(source).toContain('data-hero-transition="flight-to-signal"');
      expect(source).toContain('data-hero-transition="signal-to-spatial"');
      expect(source).toContain('data-hero-transition="spatial-to-flight"');
      expect(source).toContain('data-operation="trajectory-to-relationship"');
      expect(source).toContain('data-operation="relationship-to-architecture"');
      expect(source).toContain('data-operation="architecture-to-calibrated-orbit"');
      expect(source).toContain('DETECT / INTERSECTIONS');
      expect(source).toContain('CLASSIFY / NODE FUNCTION');
      expect(source).toContain('RESOLVE / COORDINATE FIELD');
      expect(source).toContain('MOTION → RELATIONSHIP MODEL');
      expect(source).toContain('RELATIONSHIPS → ARCHITECTURE');
      expect(source).toContain('NUCLEUS / REACQUIRED');
      expect(source).toContain('data-nucleus="computational-atom"');
      expect(source.match(/data-nucleus-orbit=/g)).toHaveLength(3);
      expect(source.match(/data-operation-stage=/g)?.length).toBeGreaterThanOrEqual(15);
      expect(source).toContain('animation:orbit-reverse 12s');
      expect(source).toContain('animation:core-breathe 6s');
      expect(source).not.toContain('animation:orbit-reverse 15s');
      expect(source).toContain('Hakan');
      expect(source).toContain('Duyar');
      expect(source.match(/<svg/g)).toHaveLength(1);
      expect(source).not.toMatch(/<polygon\b/);
      expect(source).not.toMatch(/\bHDU\b/);
      expect(Buffer.byteLength(optimizeSvg(source), 'utf8')).toBeLessThan(80 * 1024);
    });

    it(`provides a genuinely static ${theme.name} fallback`, () => {
      const source = renderHero(theme, false);
      expect(source).not.toContain('@keyframes');
      expect(source).not.toContain('12s');
      expect(source).toContain('reduced-motion hero');
    });

    it(`optimizes ${theme.name} deterministically`, () => {
      const source = renderHero(theme, true);
      expect(optimizeSvg(source)).toBe(optimizeSvg(source));
    });
  }
});
