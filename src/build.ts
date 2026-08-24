/**
 * The scene graph: every asset the profile ships, built in memory.
 *
 * Kept separate from the CLI so tests and validators can inspect the built
 * assets — including each asset's declared text manifest — without writing
 * files or shelling out.
 *
 * V3 keeps eight logical panels, but only identity and signal have animated
 * variants. `PANEL_IDS` remains the contract the validators and README
 * assembler both check themselves against, while the mode list expands only
 * those two panels to four files each.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from './shared/emit.js';
import { PALETTES, THEMES, type ThemeName } from './shared/tokens.js';
import type { Telemetry } from './shared/telemetry-types.js';
import type { MotionMode, RenderedAsset } from './shared/canvas.js';
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
  mode: MotionMode;
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

const ANIMATED_PANEL_IDS = new Set(['identity', 'signal']);
const ANIMATED_MODES = ['animated', 'static'] as const;
const STATIC_MODES = ['static'] as const;

function modesForPanel(id: string): readonly MotionMode[] {
  return ANIMATED_PANEL_IDS.has(id) ? ANIMATED_MODES : STATIC_MODES;
}

function assetName(id: string, theme: ThemeName, mode: MotionMode): string {
  return mode === 'static' && ANIMATED_PANEL_IDS.has(id)
    ? `${id}-static-${theme}`
    : `${id}-${theme}`;
}

export function loadTelemetry(): Telemetry {
  return JSON.parse(readFileSync(resolve(REPO_ROOT, 'data/telemetry.json'), 'utf8')) as Telemetry;
}

/** Every file the build produces, as repo-relative paths. */
export function expectedAssetPaths(): string[] {
  return THEMES.flatMap((theme) =>
    PANEL_IDS.flatMap((id) => modesForPanel(id).map((mode) => `assets/generated/${assetName(id, theme, mode)}.svg`)),
  );
}

export function buildAll(telemetry: Telemetry): AssetBuild[] {
  const builds: AssetBuild[] = [];
  const out = (name: string): string => `assets/generated/${name}.svg`;

  for (const theme of THEMES) {
    const palette = PALETTES[theme];
    const push = (id: string, mode: MotionMode, asset: RenderedAsset): void => {
      builds.push({ id, theme, mode, path: out(assetName(id, theme, mode)), asset });
    };

    for (const mode of ANIMATED_MODES) {
      push('identity', mode, renderIdentity({ telemetry, discipline: PROFILE.discipline }, palette, mode));
    }
    push('focus', 'static', renderFocus({ modules: PROFILE.modules }, palette));

    // Iterated in configured order, not snapshot order, so the build set and
    // PANEL_IDS are derived from the same list and cannot disagree.
    // Only the first plate opens the section, so the four read as one rack.
    FEATURED_REPOS.forEach((repo, index) => {
      push(
        `system-${repo.key}`,
        'static',
        renderSystemPlate({ telemetry, key: repo.key, sectionHead: index === 0 }, palette),
      );
    });

    for (const mode of ANIMATED_MODES) {
      push('signal', mode, renderSignal({ telemetry }, palette, mode));
    }
    push(
      'channels',
      'static',
      renderChannels({ channels: CHANNELS.map((c) => ({ label: c.label, detail: c.detail })) }, palette),
    );
  }

  return builds;
}
