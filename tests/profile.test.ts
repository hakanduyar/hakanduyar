import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FEATURED_SYSTEMS } from '../src/config.js';
import { REPO_ROOT } from '../src/emit.js';
import type { Telemetry } from '../src/telemetry.js';

describe('generated profile', () => {
  const telemetry = JSON.parse(readFileSync(resolve(REPO_ROOT, 'data/telemetry.json'), 'utf8')) as Telemetry;
  const readme = readFileSync(resolve(REPO_ROOT, 'README.md'), 'utf8');

  it('keeps the selected system order aligned with the live pins', () => {
    expect(FEATURED_SYSTEMS.map((system) => system.repo)).toEqual([
      'software-factory',
      'spark',
      'built-in-layers',
      'jointledger',
    ]);
  });

  it('uses measured complete-week activity', () => {
    expect(telemetry.activity.weekly).toHaveLength(52);
    expect(telemetry.activity.total).toBe(telemetry.activity.weekly.reduce((sum, value) => sum + value, 0));
  });

  it('renders the visible README as five local picture blocks with one official appearance link', () => {
    expect(readme).not.toMatch(/<(?:img|source)[^>]+(?:src|srcset)="https?:/i);
    const withoutComments = readme.replace(/<!--[\s\S]*?-->/g, '');
    const blocks = withoutComments.match(/<picture>[\s\S]*?<\/picture>/g) ?? [];
    expect(blocks).toHaveLength(5);
    const appearanceOpen = '<a href="https://github.com/settings/appearance">';
    expect(withoutComments.match(/<a\b/g)).toHaveLength(1);
    expect(withoutComments).toContain(appearanceOpen);
    const appearanceBlock = withoutComments.match(/<a\b[\s\S]*?<\/a>/)?.[0] ?? '';
    expect(appearanceBlock.match(/<picture>/g)).toHaveLength(1);
    expect(
      withoutComments
        .replace(appearanceOpen, '')
        .replace('</a>', '')
        .replace(/<picture>[\s\S]*?<\/picture>/g, '')
        .trim(),
    ).toBe('');
    for (const block of blocks) {
      expect(block.match(/<img\b/g)).toHaveLength(1);
      expect(
        block
          .replace(/^<picture>\s*/, '')
          .replace(/\s*<\/picture>$/, '')
          .replace(/<source\b[^>]*>/g, '')
          .replace(/<img\b[^>]*>/g, '')
          .trim(),
      ).toBe('');
      expect(block).toMatch(/<img\b[^>]*\balt="[^"]+"/);
    }
    for (const system of FEATURED_SYSTEMS) expect(readme).toContain(system.summary);
    expect(readme).toContain(`${telemetry.totalCommits} default-branch commits`);
    expect(readme).toContain('assets/generated/theme-control-light.svg');
    expect(readme).toContain('assets/generated/theme-control-dark.svg');
    expect(readme).toContain('assets/generated/theme-control-mobile-light.svg');
    expect(readme).toContain('assets/generated/theme-control-mobile-dark.svg');
  });

  it('provides animated, responsive, and reduced-motion sources for every intelligence scene', () => {
    for (const scene of ['systems', 'architecture', 'signal']) {
      for (const suffix of [
        'light.svg',
        'dark.svg',
        'static-light.svg',
        'static-dark.svg',
        'mobile-light.svg',
        'mobile-dark.svg',
        'mobile-static-light.svg',
        'mobile-static-dark.svg',
      ]) {
        expect(readme).toContain(`assets/generated/${scene}-${suffix}`);
      }
    }
  });
});
