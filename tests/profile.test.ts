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
      'dropspot-project',
      'spark',
      'stock-management-system',
      'Hunnes-Academy-motion-system',
    ]);
  });

  it('uses measured complete-week activity', () => {
    expect(telemetry.activity.weekly).toHaveLength(52);
    expect(telemetry.activity.total).toBe(telemetry.activity.weekly.reduce((sum, value) => sum + value, 0));
  });

  it('keeps every image local and every selected repository linked', () => {
    expect(readme).not.toMatch(/<(?:img|source)[^>]+(?:src|srcset)="https?:/i);
    for (const system of FEATURED_SYSTEMS) expect(readme).toContain(`https://github.com/hakanduyar/${system.repo}`);
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
