/**
 * Scene-graph invariants, asserted on the in-memory builds.
 *
 * These run against `buildAll()` rather than the emitted files, so they hold
 * even if SVGO's behaviour changes — and they can see the text manifests,
 * which the emitted files (outlined glyphs) cannot expose to grep.
 *
 * v2 assertions name their panels. A test that only counts assets passes
 * happily while the build emits the wrong ones.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { buildAll, loadTelemetry, expectedAssetPaths, PANEL_IDS, type AssetBuild } from '../src/build.js';
import { DARK, LIGHT, TYPE } from '../src/shared/tokens.js';
import { PROFILE } from '../src/shared/profile.js';
import { CHANNELS, FEATURED_REPOS } from '../src/shared/config.js';
import { remainderShare } from '../src/signal/signal.js';
import { SECTIONS } from '../src/shared/panel.js';
import type { Telemetry } from '../src/shared/telemetry-types.js';

let telemetry: Telemetry;
let builds: AssetBuild[];

/** Hex colours appear uppercase pre-SVGO and lowercase after; count both. */
function countInsensitive(haystack: string, needle: string): number {
  return haystack.toLowerCase().split(needle.toLowerCase()).length - 1;
}

function panel(id: string, theme: 'dark' | 'light' = 'dark'): AssetBuild {
  const found = builds.find((b) => b.id === id && b.theme === theme);
  if (!found) throw new Error(`No build for panel "${id}" (${theme})`);
  return found;
}

/** Every string drawn on a panel, joined — for "does the panel say X" checks. */
/** Megabytes as the panel prints them. */
function t18n(bytes: number): string {
  return (bytes / 1e6).toFixed(2);
}

function manifest(id: string, theme: 'dark' | 'light' = 'dark'): string[] {
  return panel(id, theme).asset.texts.map((t) => t.value);
}

beforeAll(() => {
  telemetry = loadTelemetry();
  builds = buildAll(telemetry);
});

describe('the build set', () => {
  it('emits exactly the eight v2 panels in two themes, by name', () => {
    expect(PANEL_IDS).toEqual([
      'identity',
      'focus',
      'system-dropspot',
      'system-motion-system',
      'system-stock',
      'system-spark',
      'signal',
      'channels',
    ]);
    expect(builds).toHaveLength(16);
    expect(builds.map((b) => b.path).sort()).toEqual(expectedAssetPaths().sort());
    for (const theme of ['dark', 'light'] as const) {
      expect(builds.filter((b) => b.theme === theme).map((b) => b.id)).toEqual([...PANEL_IDS]);
    }
  });

  it('builds no v1 panel: no hero, core-modules, telemetry or activity asset', () => {
    for (const build of builds) {
      expect(build.id).not.toMatch(/^(hero|core-modules|telemetry|activity)/);
      expect(build.path).not.toMatch(/-static-/);
    }
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

describe('static by construction', () => {
  it('no build emits animation of any kind', () => {
    for (const build of builds) {
      for (const pattern of [
        /@keyframes/,
        /animation\s*:/,
        /transition\s*:/,
        /<animate/,
        /<set[\s>]/,
        /prefers-reduced-motion/,
      ]) {
        expect(pattern.test(build.asset.svg), `${build.path} matches ${pattern}`).toBe(false);
      }
    }
  });

  it('the RenderedAsset contract carries no animation flag', () => {
    expect(Object.keys(panel('identity').asset)).not.toContain('animated');
    expect(Object.keys(panel('identity'))).not.toContain('animated');
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

describe('panel contents', () => {
  it('identity leads with the name and drops the v1 framing', () => {
    const texts = manifest('identity');
    expect(texts).toContain(telemetry.name.toUpperCase());
    expect(texts).toContain(PROFILE.discipline);
    expect(texts).toContain(String(telemetry.publicRepos));
    expect(texts).toContain(String(telemetry.totalCommits));
    expect(texts.join(' ')).not.toMatch(/ENGINEERING RECORD/i);
    expect(panel('identity').asset.title).not.toMatch(/ENGINEERING RECORD/i);
    // The name is set at the largest step on the scale and nothing else is.
    const display = panel('identity').asset.texts.filter((t) => t.size === TYPE.display.size);
    expect(display.map((t) => t.value)).toEqual([telemetry.name.toUpperCase()]);
  });

  it('focus states all four domains and their capability lines', () => {
    const texts = manifest('focus');
    for (const module of PROFILE.modules) {
      expect(texts).toContain(module.name);
      expect(texts).toContain(module.capability);
    }
    // The evidence repositories belong to panel 02; naming them here too was
    // the duplication the redesign removed.
    for (const repo of FEATURED_REPOS) {
      expect(texts.join(' ')).not.toContain(repo.repo);
    }
  });

  it('each system plate carries its repository, what it is, its stack and its last push', () => {
    for (const repo of FEATURED_REPOS) {
      const featured = telemetry.featured.find((f) => f.key === repo.key)!;
      const texts = manifest(`system-${repo.key}`);
      // The repository name is drawn in true case, exactly as it is on GitHub.
      expect(texts).toContain(featured.name);
      expect(texts).toContain(repo.subject);
      expect(texts).toContain(repo.plateLine);
      expect(texts).toContain(repo.stack.join(' · '));
      expect(texts).toContain(featured.pushedAt.slice(0, 7));
    }
  });

  it('only the first plate opens the section, so the four read as one rack', () => {
    const opening = manifest(`system-${FEATURED_REPOS[0]!.key}`);
    expect(opening).toContain('SELECTED SYSTEMS');
    for (const repo of FEATURED_REPOS.slice(1)) {
      expect(manifest(`system-${repo.key}`).join(' ')).not.toContain('SELECTED SYSTEMS');
    }
  });

  it('signal carries the distribution and the activity, and neither identity metric', () => {
    const texts = manifest('signal');
    for (const language of telemetry.languages.slice(0, 4)) {
      expect(texts).toContain(language.name.toUpperCase());
      expect(texts).toContain(`${(language.share * 100).toFixed(1)}%`);
    }
    expect(texts).toContain(`${(remainderShare(telemetry) * 100).toFixed(1)}%`);
    // The figures the removed histogram used to carry, now stated.
    expect(texts.join(' ')).toContain(`${t18n(telemetry.totalSourceBytes)} MB of public source`);
    expect(texts.join(' ')).toContain(
      `${telemetry.activity.total} contributions in the ${telemetry.activity.weekly.length} weeks`,
    );
  });

  it('channels lists the four verified destinations and nothing else', () => {
    const texts = manifest('channels');
    for (const channel of CHANNELS) {
      expect(texts).toContain(channel.label);
      expect(texts).toContain(channel.detail);
    }
    expect(texts.join(' ')).not.toMatch(/portfolio|twitter|instagram/i);
  });
});

describe('metric ownership', () => {
  /**
   * The v1 failure this encodes: the repository and commit counts appeared on
   * the hero, again on the telemetry panel, and a third time in a Markdown
   * table.
   *
   * Round-1 review caught this test being too narrow — it covered two counts
   * while the primary-language share was live on two panels at once. Every
   * figure the page presents is now assigned an owner, and the assertion runs
   * in both directions: the owner must draw it, and nobody else may.
   */
  function ownership(): { figure: string; owner: string }[] {
    const entries: { figure: string; owner: string }[] = [
      { figure: String(telemetry.publicRepos), owner: 'identity' },
      { figure: String(telemetry.totalCommits), owner: 'identity' },
      { figure: telemetry.memberSince.slice(0, 4), owner: 'identity' },
      { figure: String(telemetry.activity.total), owner: 'signal' },
      { figure: `${(remainderShare(telemetry) * 100).toFixed(1)}%`, owner: 'signal' },
    ];
    for (const language of telemetry.languages.slice(0, 4)) {
      entries.push({ figure: `${(language.share * 100).toFixed(1)}%`, owner: 'signal' });
    }
    return entries;
  }

  it('every presented figure is drawn by its owning panel', () => {
    for (const { figure, owner } of ownership()) {
      expect(manifest(owner).some((text) => text.includes(figure)), `${owner} should draw "${figure}"`).toBe(
        true,
      );
    }
  });

  it('no presented figure is drawn by any other panel', () => {
    for (const { figure, owner } of ownership()) {
      const others = PANEL_IDS.filter((id) => id !== owner).filter((id) =>
        manifest(id).some((text) => text.includes(figure)),
      );
      expect(others, `"${figure}" belongs to ${owner} but is also drawn by ${others.join(', ')}`).toEqual([]);
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
    // The single derived figure, from the same function the panel draws with.
    known.add((remainderShare(telemetry) * 100).toFixed(1));
    // Section ordinals are page structure, not measurements.
    for (const ordinal of Object.values(SECTIONS)) known.add(ordinal);

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


  it('every distribution bar is exactly as long as its measured share', () => {
    // Geometry is restated here rather than imported from the renderer. Round-2
    // review made the point on the version of this test that imported the
    // constants: renderer and test sharing one source can agree on a wrong
    // number and both pass. These are the design contract — a renderer that
    // moves the track has to come here and say so.
    const TRACK_X = 280;
    const TRACK_W = 440;
    const TRACK_H = 8;
    const FIRST_ROW = 108;
    const ROW_PITCH = 36;

    const svg = panel('signal').asset.svg;
    const named = telemetry.languages.slice(0, 4);
    const shares = [...named.map((l) => l.share), remainderShare(telemetry)];
    const round = (value: number): string => {
      const fixed = value.toFixed(2);
      return fixed.includes('.') ? fixed.replace(/\.?0+$/, '') : fixed;
    };

    shares.forEach((share, index) => {
      const trackY = FIRST_ROW + index * ROW_PITCH - 9;
      // The full-length track every row is read against.
      expect(svg, `row ${index} track`).toContain(
        `<rect x="${TRACK_X}" y="${round(trackY)}" width="${TRACK_W}" height="${TRACK_H}"`,
      );
      if (index < named.length) {
        expect(svg, `row ${index} fill at share ${share}`).toContain(
          `<rect x="${TRACK_X}" y="${round(trackY)}" width="${round(TRACK_W * share)}" height="${TRACK_H}"`,
        );
      } else {
        // The remainder is outlined, inset by half a hairline.
        expect(svg, 'remainder is outlined, not filled').toContain(
          `<rect x="${round(TRACK_X + 0.5)}" y="${round(trackY + 0.5)}" ` +
            `width="${round(TRACK_W * share - 1)}" height="${TRACK_H - 1}" fill="none"`,
        );
      }
    });

    // The largest share is the page's single chromatic mark.
    expect(countInsensitive(svg, DARK.signal)).toBe(1);
    expect(svg).toContain(`width="${round(TRACK_W * shares[0]!)}" height="${TRACK_H}" fill="${DARK.signal}"`);
  });

  it('the page spends its one chromatic mark exactly once, on one panel', () => {
    const coloured = PANEL_IDS.filter(
      (id) => countInsensitive(panel(id).asset.svg, DARK.signal) > 0,
    );
    expect(coloured).toEqual(['signal']);
  });
});

describe('legibility and language policy inside assets', () => {
  it('no information-carrying string is drawn below the mobile floor', () => {
    for (const build of builds) {
      for (const text of build.asset.texts) {
        expect(text.size, `${build.path}: "${text.value}"`).toBeGreaterThanOrEqual(TYPE.label.size);
      }
    }
  });

  it('the type scale offers no step below the floor to reach for', () => {
    // v1 exempted strings the README repeated in Markdown. There is no Markdown
    // to fall back on now, so the exemption and the sub-floor tier are both gone.
    for (const style of Object.values(TYPE)) {
      expect(style.size, JSON.stringify(style)).toBeGreaterThanOrEqual(TYPE.label.size);
    }
  });

  it('no Turkish-specific characters in any manifest string', () => {
    for (const build of builds) {
      for (const text of build.asset.texts) {
        expect(/[ıİğĞşŞ]/.test(text.value), `${build.path}: "${text.value}"`).toBe(false);
      }
    }
  });
});
