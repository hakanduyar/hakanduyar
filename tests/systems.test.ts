import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FEATURED_SYSTEMS } from '../src/config.js';
import { renderSystems, SYSTEMS_MOTION_DURATION_SECONDS } from '../src/scenes/systems.js';
import type { Telemetry } from '../src/telemetry.js';
import { THEMES } from '../src/theme.js';

const telemetry = JSON.parse(readFileSync(resolve(process.cwd(), 'data/telemetry.json'), 'utf8')) as Telemetry;

describe('selected systems motion assets', () => {
  for (const compact of [false, true]) {
    const variant = compact ? 'mobile' : 'desktop';

    it(`${variant} keeps the five-phase intelligence loop in the animated asset`, () => {
      const svg = renderSystems(THEMES.dark, telemetry, compact, true);
      expect(svg).toContain(`OBSERVATION CYCLE / ${SYSTEMS_MOTION_DURATION_SECONDS.toFixed(1)}S`);
      expect(svg).toContain('@keyframes sys-acquire');
      expect(svg).toContain('@keyframes sys-trace');
      expect(svg).toContain('@keyframes sys-node-4');
      expect(svg).toContain('@keyframes sys-resolve');
      expect(svg).toContain('QUIET / OBSERVE');
    });

    it(`${variant} static asset has complete content and no motion declarations`, () => {
      const svg = renderSystems(THEMES.light, telemetry, compact, false);
      expect(svg).not.toMatch(/@keyframes|animation(?:-[a-z-]+)?\s*:/);
      for (const system of FEATURED_SYSTEMS) {
        const repo = telemetry.featured.find((candidate) => candidate.key === system.key);
        expect(repo).toBeDefined();
        expect(svg).toContain(`${system.code} / ${system.role}`);
        expect(svg).toContain(system.label);
        expect(svg).toContain(system.stack.join(' · '));
        expect(svg).toContain(repo?.pushedAt.slice(0, 7));
      }
    });
  }
});
