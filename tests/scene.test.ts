/**
 * Scene-graph invariants, asserted on the in-memory builds.
 *
 * These run against `buildAll()` rather than the emitted files, so they hold
 * even if SVGO's behaviour changes — and they can see the text manifests,
 * which the emitted files (outlined glyphs) cannot expose to grep.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { buildAll, loadTelemetry, type AssetBuild } from '../src/build.js';
import { DARK, LIGHT, DUR } from '../src/shared/tokens.js';
import type { Telemetry } from '../src/shared/telemetry-types.js';

let telemetry: Telemetry;
let builds: AssetBuild[];

/** Hex colours appear uppercase pre-SVGO and lowercase after; count both. */
function countInsensitive(haystack: string, needle: string): number {
  return haystack.toLowerCase().split(needle.toLowerCase()).length - 1;
}

beforeAll(() => {
  telemetry = loadTelemetry();
  builds = buildAll(telemetry);
});

describe('the build set', () => {
  it('emits exactly 18 assets: (hero x2 + 6 static) x 2 themes', () => {
    expect(builds).toHaveLength(18);
    expect(builds.filter((b) => b.animated)).toHaveLength(2);
    expect(builds.filter((b) => b.theme === 'dark')).toHaveLength(9);
  });

  it('is deterministic: two builds from the same snapshot are byte-identical', () => {
    const second = buildAll(telemetry);
    for (const [index, build] of builds.entries()) {
      expect(second[index]!.asset.svg).toBe(build.asset.svg);
    }
  });

  it('every asset carries a non-empty title and desc', () => {
    for (const build of builds) {
      expect(build.asset.title.length, build.path).toBeGreaterThan(10);
      expect(build.asset.desc.length, build.path).toBeGreaterThan(40);
    }
  });

  it('no asset uses a <text> element — all copy is outlined', () => {
    for (const build of builds) {
      expect(build.asset.svg.includes('<text'), build.path).toBe(false);
    }
  });

  it('every asset declares its strings in the manifest', () => {
    for (const build of builds) {
      expect(build.asset.texts.length, build.path).toBeGreaterThan(0);
    }
  });
});

describe('signal rationing', () => {
  it('at most one signal-coloured element per asset', () => {
    for (const build of builds) {
      const signal = build.theme === 'dark' ? DARK.signal : LIGHT.signal;
      const occurrences = countInsensitive(build.asset.svg, signal);
      expect(occurrences, `${build.path} uses ${signal}`).toBeLessThanOrEqual(1);
    }
  });
});

describe('motion constraints', () => {
  it('static builds contain no animation at all', () => {
    for (const build of builds.filter((b) => !b.animated)) {
      expect(build.asset.svg.includes('@keyframes'), build.path).toBe(false);
      expect(/animation\s*:/.test(build.asset.svg), build.path).toBe(false);
    }
  });

  it('no build ever emits a prefers-reduced-motion query (it misfires inside SVG images)', () => {
    for (const build of builds) {
      expect(build.asset.svg.includes('prefers-reduced-motion'), build.path).toBe(false);
    }
  });

  it('the entrance finishes inside the 2400ms ceiling', () => {
    for (const build of builds.filter((b) => b.animated)) {
      // Every one-shot animation: delay + duration <= ceiling.
      // Shorthand order emitted by the hero: name dur ease [delay] forwards.
      const oneShots = [
        ...build.asset.svg.matchAll(/animation:\s*[\w-]+ (\d+)ms [^;}]*? (\d+)ms forwards/g),
      ];
      expect(oneShots.length).toBeGreaterThan(0);
      for (const [, duration, delay] of oneShots) {
        expect(Number(duration) + Number(delay), build.path).toBeLessThanOrEqual(DUR.sequenceMax);
      }
    }
  });

  it('exactly one loop, with a period of at least 6 seconds', () => {
    for (const build of builds.filter((b) => b.animated)) {
      const loops = [...build.asset.svg.matchAll(/animation:[^;}]*?(\d+)ms[^;}]*infinite/g)];
      expect(loops, build.path).toHaveLength(1);
      expect(Number(loops[0]![1]), build.path).toBeGreaterThanOrEqual(6000);
    }
  });
});

describe('variant parity', () => {
  it('the animated and static hero draw the same scene (same manifest, same element count)', () => {
    for (const theme of ['dark', 'light'] as const) {
      const animated = builds.find((b) => b.id === 'hero' && b.theme === theme && b.animated)!;
      const still = builds.find((b) => b.id === 'hero' && b.theme === theme && !b.animated)!;
      expect(still.asset.texts.map((t) => t.value)).toEqual(animated.asset.texts.map((t) => t.value));
      const count = (svg: string): number => (svg.match(/<path/g) ?? []).length;
      expect(count(still.asset.svg)).toBe(count(animated.asset.svg));
    }
  });
});

describe('data honesty', () => {
  it('every number drawn inside an asset exists in the telemetry snapshot', () => {
    const known = new Set<string>();
    const collect = (value: unknown): void => {
      if (typeof value === 'number') {
        known.add(String(value));
        if (value > 0 && value < 1) {
          known.add((value * 100).toFixed(1));
          known.add((value * 100).toFixed(0));
        }
      } else if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === 'object') Object.values(value).forEach(collect);
      else if (typeof value === 'string') {
        for (const number of value.match(/\d+(?:\.\d+)?/g) ?? []) known.add(number);
      }
    };
    collect(telemetry);

    for (const build of builds) {
      for (const text of build.asset.texts) {
        for (const match of text.value.matchAll(/\d+(?:\.\d+)?/g)) {
          expect(
            known.has(match[0]),
            `${build.path} draws "${text.value}" containing ${match[0]}, absent from telemetry.json`,
          ).toBe(true);
        }
      }
    }
  });

  it('the hero index line position encodes the primary-language share', () => {
    const hero = builds.find((b) => b.id === 'hero' && b.theme === 'dark' && b.animated)!;
    const share = telemetry.languages[0]!.share;
    const expectedX = 580 + (850 - 580) * share;
    // The index line is the only signal-stroked path; its x appears twice (M/L).
    const signalPath = new RegExp(`M${expectedX.toFixed(2).replace(/\.?0+$/, '')} `);
    expect(hero.asset.svg).toMatch(signalPath);
  });

  it('activity bars match the weekly series exactly (count and the marked maximum)', () => {
    const strip = builds.find((b) => b.id === 'activity' && b.theme === 'dark')!;
    const nonZeroWeeks = telemetry.activity.weekly.filter((w) => w > 0).length;
    const rects = (strip.asset.svg.match(/<rect/g) ?? []).length;
    // Ground rect + frame rect + one bar per non-zero week.
    expect(rects).toBe(2 + nonZeroWeeks);
    const signalBars = countInsensitive(strip.asset.svg, DARK.signal);
    expect(signalBars).toBe(1);
  });
});

describe('language policy inside assets', () => {
  it('no Turkish-specific characters in any manifest string', () => {
    for (const build of builds) {
      for (const text of build.asset.texts) {
        expect(/[ıİğĞşŞ]/.test(text.value), `${build.path}: "${text.value}"`).toBe(false);
      }
    }
  });
});
