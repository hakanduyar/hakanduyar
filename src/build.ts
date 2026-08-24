/**
 * The scene graph: every asset the profile ships, built in memory.
 *
 * Kept separate from the CLI so tests and validators can inspect the built
 * assets — including each asset's declared text manifest — without writing
 * files or shelling out.
 *
 * v2 is static throughout. There is no animated/static split, so the build set
 * is simply every panel in every theme: eight logical panels, two themes,
 * sixteen files. `PANEL_IDS` is the contract the validators and the README
 * assembler both check themselves against, so an asset can never be added to
 * the page without also being added here.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from './shared/emit.js';
import { PALETTES, THEMES, type ThemeName } from './shared/tokens.js';
import type { Telemetry } from './shared/telemetry-types.js';
import type { RenderedAsset } from './shared/canvas.js';
import { PROFILE } from './shared/profile.js';
import { CHANNELS, FEATURED_REPOS } from './shared/config.js';
import { renderIdentity } from './identity/identity.js';
import { renderFocus } from './focus/focus.js';
import { renderSystemPlate } from './systems/system-plate.js';
import { renderSignal } from './signal/signal.js';
import { renderChannels } from './channels/channels.js';

export interface AssetBuild {
  /** Logical asset name, shared across themes. */
  id: string;
  theme: ThemeName;
  /** Repo-relative output path. */
  path: string;
  asset: RenderedAsset;
}

/**
 * The eight logical panels, in the order the README stacks them.
 *
 * Derived from `FEATURED_REPOS` rather than written out, so promoting a
 * different repository cannot leave the contract and the build disagreeing.
 */
export const PANEL_IDS: readonly string[] = [
  'identity',
  'focus',
  ...FEATURED_REPOS.map((repo) => `system-${repo.key}`),
  'signal',
  'channels',
];

export function loadTelemetry(): Telemetry {
  return JSON.parse(readFileSync(resolve(REPO_ROOT, 'data/telemetry.json'), 'utf8')) as Telemetry;
}

/** Every file the build produces, as repo-relative paths. */
export function expectedAssetPaths(): string[] {
  return THEMES.flatMap((theme) => PANEL_IDS.map((id) => `assets/generated/${id}-${theme}.svg`));
}

export function buildAll(telemetry: Telemetry): AssetBuild[] {
  const builds: AssetBuild[] = [];
  const out = (name: string): string => `assets/generated/${name}.svg`;

  for (const theme of THEMES) {
    const palette = PALETTES[theme];
    const push = (id: string, asset: RenderedAsset): void => {
      builds.push({ id, theme, path: out(`${id}-${theme}`), asset });
    };

    push('identity', renderIdentity({ telemetry, discipline: PROFILE.discipline }, palette));
    push('focus', renderFocus({ modules: PROFILE.modules }, palette));

    // Iterated in configured order, not snapshot order, so the build set and
    // PANEL_IDS are derived from the same list and cannot disagree.
    // Only the first plate opens the section, so the four read as one rack.
    FEATURED_REPOS.forEach((repo, index) => {
      push(
        `system-${repo.key}`,
        renderSystemPlate({ telemetry, key: repo.key, sectionHead: index === 0 }, palette),
      );
    });

    push('signal', renderSignal({ telemetry }, palette));
    push(
      'channels',
      renderChannels({ channels: CHANNELS.map((c) => ({ label: c.label, detail: c.detail })) }, palette),
    );
  }

  return builds;
}
