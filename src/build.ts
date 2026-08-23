/**
 * The scene graph: every asset the profile ships, built in memory.
 *
 * Kept separate from the CLI so tests and validators can inspect the built
 * assets — including each asset's declared text manifest — without writing
 * files or shelling out.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from './shared/emit.js';
import { PALETTES, THEMES, type ThemeName } from './shared/tokens.js';
import type { Telemetry } from './shared/telemetry-types.js';
import type { RenderedAsset } from './shared/canvas.js';
import { PROFILE } from './shared/profile.js';
import { renderHero } from './hero/hero.js';
import { renderCoreModules } from './modules/core-modules.js';
import { renderSystemPlate } from './systems/system-plate.js';
import { renderTelemetryPanel } from './telemetry/telemetry-panel.js';
import { renderActivityStrip } from './activity/activity-strip.js';

export interface AssetBuild {
  /** Logical asset name, shared across themes and variants. */
  id: string;
  theme: ThemeName;
  animated: boolean;
  /** Repo-relative output path. */
  path: string;
  asset: RenderedAsset;
}

export function loadTelemetry(): Telemetry {
  return JSON.parse(readFileSync(resolve(REPO_ROOT, 'data/telemetry.json'), 'utf8')) as Telemetry;
}

export function buildAll(telemetry: Telemetry): AssetBuild[] {
  const builds: AssetBuild[] = [];
  const out = (name: string): string => `assets/generated/${name}.svg`;

  for (const theme of THEMES) {
    const palette = PALETTES[theme];

    // The hero is the only animated asset, so it is the only one built twice.
    // Both variants come from one module, which is what stops the resting
    // composition from drifting away from the animated one.
    for (const animated of [true, false]) {
      const name = animated ? `hero-${theme}` : `hero-static-${theme}`;
      builds.push({
        id: 'hero',
        theme,
        animated,
        path: out(name),
        asset: renderHero({ telemetry, discipline: PROFILE.discipline }, palette, animated),
      });
    }

    builds.push({
      id: 'core-modules',
      theme,
      animated: false,
      path: out(`core-modules-${theme}`),
      asset: renderCoreModules({ telemetry, modules: PROFILE.modules }, palette),
    });

    for (const featured of telemetry.featured) {
      builds.push({
        id: `system-${featured.key}`,
        theme,
        animated: false,
        path: out(`system-${featured.key}-${theme}`),
        asset: renderSystemPlate({ telemetry, key: featured.key }, palette),
      });
    }

    builds.push({
      id: 'telemetry',
      theme,
      animated: false,
      path: out(`telemetry-${theme}`),
      asset: renderTelemetryPanel({ telemetry }, palette),
    });

    builds.push({
      id: 'activity',
      theme,
      animated: false,
      path: out(`activity-${theme}`),
      asset: renderActivityStrip({ telemetry }, palette),
    });
  }

  return builds;
}
