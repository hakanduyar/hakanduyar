import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { emitSvg, REPO_ROOT } from '../src/emit.js';
import { renderExpand } from '../src/scenes/expand.js';
import { renderArchitecture } from '../src/scenes/architecture.js';
import { renderHero } from '../src/scenes/hero.js';
import { renderSignal } from '../src/scenes/signal.js';
import { renderSystems } from '../src/scenes/systems.js';
import type { Telemetry } from '../src/telemetry.js';
import { THEMES } from '../src/theme.js';
import { GENERATED_ASSET_NAMES } from '../src/assets.js';

const telemetry = JSON.parse(readFileSync(resolve(REPO_ROOT, 'data/telemetry.json'), 'utf8')) as Telemetry;
const outputs: { path: string; bytes: number; changed: boolean }[] = [];
const theme = THEMES.dark;

outputs.push(emitSvg('assets/generated/expand-dark.svg', renderExpand()));
outputs.push(emitSvg('assets/generated/expand-mobile-dark.svg', renderExpand(true)));
outputs.push(emitSvg('assets/generated/hero-dark.svg', renderHero(theme, true)));
outputs.push(emitSvg('assets/generated/hero-static-dark.svg', renderHero(theme, false)));
outputs.push(emitSvg('assets/generated/systems-dark.svg', renderSystems(theme, telemetry, false, true)));
outputs.push(emitSvg('assets/generated/systems-static-dark.svg', renderSystems(theme, telemetry, false, false)));
outputs.push(emitSvg('assets/generated/systems-mobile-dark.svg', renderSystems(theme, telemetry, true, true)));
outputs.push(emitSvg('assets/generated/systems-mobile-static-dark.svg', renderSystems(theme, telemetry, true, false)));
outputs.push(emitSvg('assets/generated/architecture-dark.svg', renderArchitecture(theme, false, true)));
outputs.push(emitSvg('assets/generated/architecture-static-dark.svg', renderArchitecture(theme, false, false)));
outputs.push(emitSvg('assets/generated/architecture-mobile-dark.svg', renderArchitecture(theme, true, true)));
outputs.push(emitSvg('assets/generated/architecture-mobile-static-dark.svg', renderArchitecture(theme, true, false)));
outputs.push(emitSvg('assets/generated/signal-dark.svg', renderSignal(theme, telemetry, false, true)));
outputs.push(emitSvg('assets/generated/signal-static-dark.svg', renderSignal(theme, telemetry, false, false)));
outputs.push(emitSvg('assets/generated/signal-mobile-dark.svg', renderSignal(theme, telemetry, true, true)));
outputs.push(emitSvg('assets/generated/signal-mobile-static-dark.svg', renderSignal(theme, telemetry, true, false)));

for (const output of outputs) {
  console.log(`[render] ${output.changed ? 'wrote' : 'kept '} ${output.path} (${output.bytes.toLocaleString()} bytes)`);
}

const emitted = outputs.map((output) => output.path.split('/').at(-1)).sort();
const expected = [...GENERATED_ASSET_NAMES].sort();
if (JSON.stringify(emitted) !== JSON.stringify(expected)) throw new Error('Generated asset manifest and renderer outputs diverged');
