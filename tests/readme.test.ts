/**
 * README composition invariants, run against the generated file.
 *
 * v1's version of this file asserted a document: eight `##` headings in a fixed
 * order, a metrics table quoting the snapshot, a prose line under the activity
 * strip. Those tests passed right up to the moment someone looked at the page
 * and saw a report.
 *
 * These assert the opposite property — that the page is a panel stack and stays
 * one. The strongest test here is the prose budget: it is what stops the README
 * drifting back into commentary one helpful line at a time.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from '../src/shared/emit.js';
import { loadTelemetry, PANEL_IDS } from '../src/build.js';
import { PROFILE } from '../src/shared/profile.js';
import { CHANNELS, FEATURED_REPOS } from '../src/shared/config.js';
import type { Telemetry } from '../src/shared/telemetry-types.js';

let readme: string;
let body: string;
let telemetry: Telemetry;

beforeAll(() => {
  readme = readFileSync(resolve(REPO_ROOT, 'README.md'), 'utf8');
  body = readme.replace(/<!--[\s\S]*?-->/g, '');
  telemetry = loadTelemetry();
});

describe('the panel stack', () => {
  it('carries the generated-file header', () => {
    expect(readme).toMatch(/^<!-- GENERATED FILE/);
  });

  it('references every panel exactly once, in build order', () => {
    const referenced = [...readme.matchAll(/assets\/generated\/([a-z-]+)-light\.svg/g)].map((m) => m[1]!);
    expect(referenced).toEqual([...PANEL_IDS]);
  });

  it('pairs every panel with its dark variant and nothing else', () => {
    const all = [...readme.matchAll(/assets\/generated\/([a-z-]+)\.svg/g)].map((m) => m[1]!);
    expect(all).toHaveLength(PANEL_IDS.length * 2);
    for (const id of PANEL_IDS) {
      expect(all.filter((name) => name === `${id}-dark`)).toHaveLength(1);
      expect(all.filter((name) => name === `${id}-light`)).toHaveLength(1);
    }
  });

  it('references no v1 asset', () => {
    expect(readme).not.toMatch(/hero-|core-modules-|telemetry-|activity-|-static-/);
  });

  it('every <picture> is a plain dark source with a light fallback', () => {
    const pictures = readme.match(/<picture>[\s\S]*?<\/picture>/g) ?? [];
    expect(pictures).toHaveLength(PANEL_IDS.length);
    for (const block of pictures) {
      const sources = [...block.matchAll(/<source[^>]*media="([^"]+)"/g)].map((m) => m[1]!);
      expect(sources).toEqual(['(prefers-color-scheme: dark)']);
      expect(block).toContain('-light.svg" alt="');
      expect(block).not.toMatch(/prefers-reduced-motion/);
    }
  });
});

describe('the prose budget', () => {
  it('carries no heading, bullet list or table', () => {
    expect(body).not.toMatch(/^#{1,6}\s/m);
    expect(body).not.toMatch(/^\s*[-*+]\s/m);
    expect(body).not.toMatch(/^\s*\|/m);
  });

  it('carries exactly three lines of prose: strapline, channel links, provenance', () => {
    const prose = body
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !/^<\/?(picture|source|img|a)\b/.test(line));
    expect(prose).toHaveLength(3);
    expect(prose[0]).toBe(`**${PROFILE.strapline}**`);
    expect(prose[1]).toContain('[LinkedIn](');
    expect(prose[2]).toMatch(/^\*.*\*$/);
  });

  it('states no metric in prose — every figure lives inside a panel', () => {
    // Tag stripping also removes alt text, which is deliberately exempt: see
    // the alt-text exemption test below.
    const prose = body.replace(/<[^>]*>/g, ' ');
    for (const figure of [String(telemetry.publicRepos), String(telemetry.totalCommits)]) {
      expect(prose).not.toContain(figure);
    }
  });

  it('contains no emoji and no third-party rendering service', () => {
    expect(readme.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu)).toBeNull();
    expect(readme).not.toMatch(
      /(github-readme-stats|streak-stats|shields\.io|herokuapp|vectorlogo|devicons|alipayobjects)/i,
    );
  });
});

describe('navigation', () => {
  it('every system panel is itself the link to its repository', () => {
    for (const repo of FEATURED_REPOS) {
      const featured = telemetry.featured.find((f) => f.key === repo.key)!;
      const anchor = new RegExp(
        `<a href="${featured.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">\\s*<picture>[\\s\\S]*?system-${repo.key}-light\\.svg`,
      );
      expect(anchor.test(readme), `${featured.name} plate is not wrapped in its own link`).toBe(true);
    }
  });

  it('the channels line carries every verified destination and no unverified one', () => {
    for (const channel of CHANNELS) {
      expect(readme).toContain(`[${channel.display}](${channel.href})`);
    }
    // No portfolio site exists publicly; linking one would be fabrication.
    expect(readme).not.toMatch(/portfolio/i);
  });

  it('banned metrics never appear: followers, stars, streaks', () => {
    expect(readme).not.toMatch(/followers?/i);
    expect(readme).not.toMatch(/\bstars?\b/i);
    expect(readme).not.toMatch(/streak/i);
  });
});

describe('accessibility carries the page when images fail', () => {
  it('every image has alt text substantial enough to replace the panel', () => {
    const alts = [...readme.matchAll(/<img[^>]*\balt="([^"]*)"/g)].map((m) => m[1]!);
    expect(alts).toHaveLength(PANEL_IDS.length);
    for (const alt of alts) expect(alt.length).toBeGreaterThan(40);
  });

  it('the identity alt names the person, because nothing else on the page does', () => {
    const first = /<img[^>]*\balt="([^"]*)"/.exec(readme)?.[1] ?? '';
    expect(first).toContain(telemetry.name);
  });

  it('alt text is exempt from the no-duplicate-metrics rule, and uses the exemption', () => {
    // The rule stops a sighted reader being told the same number twice. Alt
    // text is not a second telling — it is the only telling for a reader who
    // cannot see the panel, so it carries the figures the panel draws.
    const alts = [...readme.matchAll(/<img[^>]*\balt="([^"]*)"/g)].map((m) => m[1]!);
    const identityAlt = alts[0]!;
    expect(identityAlt).toContain(String(telemetry.publicRepos));
    expect(identityAlt).toContain(String(telemetry.totalCommits));

    const signalAlt = alts.find((alt) => alt.startsWith('Measured signal'))!;
    expect(signalAlt).toContain(`${(telemetry.languages[0]!.share * 100).toFixed(1)} percent`);
    expect(signalAlt).toContain(String(telemetry.activity.total));
  });
});
