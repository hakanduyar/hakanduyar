import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderArchitecture } from '../src/scenes/architecture.js';
import { renderSignal } from '../src/scenes/signal.js';
import type { Telemetry } from '../src/telemetry.js';
import { THEMES } from '../src/theme.js';

const telemetry = JSON.parse(readFileSync(resolve(process.cwd(), 'data/telemetry.json'), 'utf8')) as Telemetry;
const motionCss = /@keyframes|animation\s*:/;
const phaseGrammar = ['ACQUIRE', 'TRACE', 'CLASSIFY', 'RESOLVE', 'QUIET'] as const;

describe('spatial architecture motion', () => {
  for (const [themeName, theme] of Object.entries(THEMES)) {
    for (const compact of [false, true]) {
      const viewport = compact ? 'mobile' : 'desktop';
      it(`${themeName} ${viewport} emits a six-second resolution loop and a motion-free static equivalent`, () => {
        const animated = renderArchitecture(theme, compact, true);
        const staticSvg = renderArchitecture(theme, compact, false);

        expect(animated).toMatch(/animation:[^;}]*6s/);
        expect(animated).toContain('@keyframes architecture-align');
        expect(animated).toContain('architecture-step-4');
        for (const phase of phaseGrammar) expect(animated).toContain(phase);
        for (const layer of ['Interface', 'State', 'Services', 'Delivery']) {
          expect(animated).toContain(layer);
          expect(staticSvg).toContain(layer);
        }
        expect(staticSvg).not.toMatch(motionCss);
        expect(staticSvg).toContain('data-audit-geometry="plane"');
      });
    }
  }
});

describe('public signal observation motion', () => {
  for (const [themeName, theme] of Object.entries(THEMES)) {
    for (const compact of [false, true]) {
      const viewport = compact ? 'mobile' : 'desktop';
      it(`${themeName} ${viewport} observes fixed telemetry and keeps static output motion-free`, () => {
        const animated = renderSignal(theme, telemetry, compact, true);
        const staticSvg = renderSignal(theme, telemetry, compact, false);

        expect(animated).toMatch(/animation:[^;}]*6s/);
        expect(animated).toContain('@keyframes signal-trace-inspection');
        expect(animated).toContain('@keyframes signal-classification-sweep');
        for (const phase of phaseGrammar) expect(animated).toContain(phase);
        for (const language of telemetry.languages.slice(0, 4)) {
          const measured = `${language.name.toUpperCase()} ${(language.share * 100).toFixed(1)}%`;
          expect(animated).toContain(measured);
          expect(staticSvg).toContain(measured);
        }
        expect(animated).toContain(`>${telemetry.activity.total}<`);
        expect(staticSvg).toContain(`>${telemetry.activity.total}<`);
        expect(staticSvg).not.toMatch(motionCss);
        expect(staticSvg).toContain('data-audit-geometry="trajectory"');
      });
    }
  }
});
