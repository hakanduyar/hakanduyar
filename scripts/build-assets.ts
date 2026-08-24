import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { emitSvg, REPO_ROOT } from '../src/emit.js';
import { renderArchitecture } from '../src/scenes/architecture.js';
import { renderHero } from '../src/scenes/hero.js';
import { renderSignal } from '../src/scenes/signal.js';
import { renderSystems } from '../src/scenes/systems.js';
import type { Telemetry } from '../src/telemetry.js';
import { THEMES } from '../src/theme.js';

const telemetry = JSON.parse(readFileSync(resolve(REPO_ROOT, 'data/telemetry.json'), 'utf8')) as Telemetry;
const outputs: { path: string; bytes: number; changed: boolean }[] = [];

for (const [name, theme] of Object.entries(THEMES)) {
  outputs.push(emitSvg(`assets/generated/hero-${name}.svg`, renderHero(theme, true)));
  outputs.push(emitSvg(`assets/generated/hero-static-${name}.svg`, renderHero(theme, false)));
  outputs.push(emitSvg(`assets/generated/systems-${name}.svg`, renderSystems(theme, telemetry)));
  outputs.push(emitSvg(`assets/generated/architecture-${name}.svg`, renderArchitecture(theme)));
  outputs.push(emitSvg(`assets/generated/signal-${name}.svg`, renderSignal(theme, telemetry)));
}

for (const output of outputs) {
  console.log(`[render] ${output.changed ? 'wrote' : 'kept '} ${output.path} (${output.bytes.toLocaleString()} bytes)`);
}
