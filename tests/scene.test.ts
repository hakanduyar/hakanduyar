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
    expect(texts).toContain('SOURCE DISTRIBUTION');
    expect(texts).toContain('CONTRIBUTIONS');
    for (const language of telemetry.languages.slice(0, 4)) {
      expect(texts).toContain(language.name.toUpperCase());
      expect(texts).toContain(`${(language.share * 100).toFixed(1)}%`);
    }
    expect(texts).toContain(`${(remainderShare(telemetry) * 100).toFixed(1)}%`);
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
   * table. Each headline figure now belongs to exactly one panel.
   */
  it('no headline figure is drawn on two different panels', () => {
    const figures = [String(telemetry.publicRepos), String(telemetry.totalCommits)];
    for (const figure of figures) {
      const owners = PANEL_IDS.filter((id) => manifest(id).includes(figure));
      expect(owners, `"${figure}" is drawn on ${owners.join(' and ')}`).toHaveLength(1);
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

  it('the identity share track is drawn at the measured share, not a rounded one', () => {
    const identity = panel('identity');
    const share = telemetry.languages[0]!.share;
    // Track runs 580..850; the fill ends at the measured fraction of it.
    const expectedX = 580 + 270 * share;
    expect(identity.asset.svg).toContain(`L${expectedX.toFixed(2).replace(/\.?0+$/, '')} `);
  });

  it('activity bars match the weekly series exactly (count and the marked maximum)', () => {
    const signal = panel('signal');
    const nonZeroWeeks = telemetry.activity.weekly.filter((w) => w > 0).length;
    const rects = (signal.asset.svg.match(/<rect/g) ?? []).length;
    // Ground + frame + one track and one fill per distribution row, then one
    // bar per active week. Zero weeks draw a stub path, never a rect.
    const rows = telemetry.languages.slice(0, 4).length + 1;
    expect(rects).toBe(2 + rows * 2 + nonZeroWeeks);
    expect(countInsensitive(signal.asset.svg, DARK.signal)).toBe(1);
  });
});

describe('legibility and language policy inside assets', () => {
  it('no information-carrying string is drawn below the mobile floor', () => {
    for (const build of builds) {
      for (const text of build.asset.texts) {
        if (text.decorative) continue;
        expect(text.size, `${build.path}: "${text.value}"`).toBeGreaterThanOrEqual(TYPE.label.size);
      }
    }
  });

  it('v2 draws nothing decoratively: every string carries itself', () => {
    // v1 could drop strings below the floor because Markdown repeated them
    // verbatim. There is no Markdown to fall back on now.
    for (const build of builds) {
      const decorative = build.asset.texts.filter((t) => t.decorative);
      expect(decorative.map((t) => t.value), build.path).toEqual([]);
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
