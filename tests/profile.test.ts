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

  it('renders two visible pictures followed by an image-only native disclosure', () => {
    expect(readme).not.toMatch(/<(?:img|source)[^>]+(?:src|srcset)="https?:/i);
    const withoutComments = readme.replace(/<!--[\s\S]*?-->/g, '');
    const visible = withoutComments.trim();
    expect(visible).not.toMatch(/\r?\n[\t ]*\r?\n/);
    expect(visible).not.toMatch(/<(?:p|br)\b|&nbsp;|\u00a0|\u200b/i);
    const blocks = withoutComments.match(/<picture>[\s\S]*?<\/picture>/g) ?? [];
    const sceneBlocks = blocks.filter((block) => !block.includes('assets/generated/expand-dark.svg'));
    expect(blocks).toHaveLength(5);
    expect(sceneBlocks).toHaveLength(4);
    expect(withoutComments).not.toMatch(/<a\b/);
    expect(withoutComments).not.toMatch(/<details\b[^>]*\bopen(?:\s|=|>)/i);
    const skeleton = withoutComments
      .replace(/<picture>[\s\S]*?<\/picture>/g, 'PICTURE')
      .replace(/<summary>[\s\S]*?<\/summary>/g, 'SUMMARY')
      .replace(/\s+/g, ' ')
      .trim();
    expect(skeleton).toBe('PICTUREPICTURE<details>SUMMARYPICTUREPICTURE</details>');
    expect(withoutComments.match(/<\/picture><picture>/g)).toHaveLength(2);
    expect(withoutComments).toContain('</picture><details><summary><picture>');
    expect(withoutComments).toContain('</picture></summary><picture>');
    expect(withoutComments).toContain('</picture></details>');

    const details = withoutComments.match(/<details>\s*([\s\S]*?)\s*<\/details>/)?.[1] ?? '';
    const summary = details.match(/<summary>\s*([\s\S]*?)\s*<\/summary>/)?.[1] ?? '';
    expect(summary.match(/<img\b[^>]*>/g)).toHaveLength(1);
    expect(summary.match(/<picture>[\s\S]*?<\/picture>/g)).toHaveLength(1);
    expect(summary.match(/<source\b[^>]*>/g)).toHaveLength(1);
    expect(summary).toMatch(/^<picture>\s*<source media="\(max-width: 1080px\)" srcset="assets\/generated\/expand-mobile-dark\.svg">\s*<img\b[^>]*>\s*<\/picture>$/);
    expect(summary).toContain('srcset="assets/generated/expand-mobile-dark.svg"');
    expect(summary).toContain('src="assets/generated/expand-dark.svg"');
    expect(summary).toContain('alt="Show architecture and public signal"');
    expect(summary).toContain('width="95%"');
    expect(summary).toContain('align="middle"');
    expect(summary).not.toMatch(/<a\b/);
    expect(summary.replace(/<picture>[\s\S]*?<\/picture>/g, '').trim()).toBe('');
    const detailsContent = details.replace(/<summary>[\s\S]*?<\/summary>/, '');
    expect(detailsContent.match(/<picture>[\s\S]*?<\/picture>/g)).toHaveLength(2);
    expect(detailsContent).toContain('assets/generated/architecture-dark.svg');
    expect(detailsContent).toContain('assets/generated/signal-dark.svg');
    expect(
      withoutComments
        .replace(/<picture>[\s\S]*?<\/picture>/g, '')
        .replace(/<summary>[\s\S]*?<\/summary>/g, '')
        .replace(/<\/?details>/g, '')
        .trim(),
    ).toBe('');
    for (const block of sceneBlocks) {
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
      expect(block).toMatch(/<img\b[^>]*\balign="top"/);
    }
    for (const system of FEATURED_SYSTEMS) expect(readme).toContain(system.summary);
    expect(readme).toContain(`${telemetry.totalCommits} default-branch commits`);
    expect(readme).not.toMatch(/theme-control|prefers-color-scheme|-light\.svg/);
    expect(readme).toContain('assets/generated/hero-dark.svg');
    expect(readme).toContain('assets/generated/hero-static-dark.svg');
  });

  it('provides animated, responsive, and reduced-motion sources for every intelligence scene', () => {
    for (const scene of ['systems', 'architecture', 'signal']) {
      for (const suffix of [
        'dark.svg',
        'static-dark.svg',
        'mobile-dark.svg',
        'mobile-static-dark.svg',
      ]) {
        expect(readme).toContain(`assets/generated/${scene}-${suffix}`);
      }
    }
  });
});
