/**
 * README structure and content invariants, run against the generated file.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from '../src/shared/emit.js';
import { loadTelemetry } from '../src/build.js';
import type { Telemetry } from '../src/shared/telemetry-types.js';

let readme: string;
let telemetry: Telemetry;

beforeAll(() => {
  readme = readFileSync(resolve(REPO_ROOT, 'README.md'), 'utf8');
  telemetry = loadTelemetry();
});

describe('structure', () => {
  it('carries the generated-file header', () => {
    expect(readme).toMatch(/^<!-- GENERATED FILE/);
  });

  it('contains every section in the fixed order', () => {
    const sections = [
      '## Identity',
      '## Core modules',
      '## Selected systems',
      '## Telemetry',
      '## Activity',
      '## Active work',
      '## Operating principles',
      '## Channels',
    ];
    let cursor = -1;
    for (const section of sections) {
      const index = readme.indexOf(section);
      expect(index, `${section} present`).toBeGreaterThan(cursor);
      cursor = index;
    }
  });

  it('the strapline is real bold Markdown text directly after the hero', () => {
    expect(readme).toContain('**Hakan Duyar');
  });

  it('contains no emoji', () => {
    expect(readme.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu)).toBeNull();
  });

  it('references no third-party rendering service', () => {
    expect(readme).not.toMatch(
      /(github-readme-stats|streak-stats|shields\.io|herokuapp|vectorlogo|devicons|alipayobjects)/i,
    );
  });
});

describe('the hero picture block', () => {
  it('declares reduced-motion sources before colour-scheme sources', () => {
    const block = /<picture>[\s\S]*?<\/picture>/.exec(readme)?.[0] ?? '';
    const sources = [...block.matchAll(/<source media="([^"]+)"/g)].map((m) => m[1]!);
    expect(sources.length).toBeGreaterThanOrEqual(3);
    expect(sources[0]).toContain('prefers-reduced-motion: reduce');
    expect(sources[sources.length - 1]).toBe('(prefers-color-scheme: dark)');
  });

  it('falls back to the light animated asset for clients that ignore <source>', () => {
    const block = /<picture>[\s\S]*?<\/picture>/.exec(readme)?.[0] ?? '';
    expect(block).toContain('src="assets/generated/hero-light.svg"');
  });
});

describe('content honesty', () => {
  it('every featured repository is linked as literal Markdown text', () => {
    for (const featured of telemetry.featured) {
      expect(readme).toContain(`**[${featured.name}](${featured.url})**`);
    }
  });

  it('the telemetry table quotes the snapshot values verbatim', () => {
    expect(readme).toContain(`| Public repositories | ${telemetry.publicRepos} |`);
    expect(readme).toContain(`| Commits | ${telemetry.totalCommits} |`);
    const primary = telemetry.languages[0]!;
    expect(readme).toContain(`| ${primary.name} | ${(primary.share * 100).toFixed(1)}% |`);
  });

  it('the activity line states the plotted total and window, not the larger year figure', () => {
    expect(readme).toContain(`${telemetry.activity.total} public contributions in the 52 weeks to ${telemetry.activity.end}`);
  });

  it('every verified channel is present and no unverified one is', () => {
    expect(readme).toContain('https://www.linkedin.com/in/hakanduyar');
    expect(readme).toContain('https://medium.com/@hakanduyar');
    expect(readme).toContain('mailto:iamhakanduyar@gmail.com');
    // No portfolio site exists publicly; linking one would be fabrication.
    expect(readme).not.toMatch(/portfolio/i);
  });

  it('banned metrics never appear: followers, stars, streaks', () => {
    expect(readme).not.toMatch(/followers?/i);
    expect(readme).not.toMatch(/\bstars?\b/i);
    expect(readme).not.toMatch(/streak/i);
  });
});
