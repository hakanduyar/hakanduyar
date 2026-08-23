/**
 * Core modules strip — four capability domains, each with the public
 * repository that evidences it.
 *
 * Laid out as rows rather than the four side-by-side cells the brief sketched:
 * at 890u wide, four columns leave 184u each, and the evidence repository names
 * measure up to 453u in the system's monospace face. Rows give every name its
 * full width and read as a register, which suits the material better than four
 * cramped cards.
 */

import { Canvas, type RenderedAsset } from '../shared/canvas.js';
import { el, linePath, chamferRect } from '../shared/svg.js';
import { TYPE, GRID, STROKE, RADIUS, type Palette } from '../shared/tokens.js';
import type { Telemetry } from '../shared/telemetry-types.js';
import type { CapabilityModule } from '../shared/profile.js';

const W = GRID.width;
const H = 240;
const L = GRID.margin;
const R = GRID.right;

/** Baselines for the four rows, on the 8u rhythm. */
const ROW_BASELINES = [60, 108, 156, 204] as const;
const NAME_X = 64;
const EVIDENCE_X = 264;

export interface CoreModulesInput {
  telemetry: Telemetry;
  modules: readonly CapabilityModule[];
}

export function renderCoreModules(input: CoreModulesInput, palette: Palette): RenderedAsset {
  const canvas = new Canvas(W, H, palette, `hdu-modules-${palette.name}`, false);
  const p = palette;

  canvas.add(
    el('path', {
      d: chamferRect(0.5, 0.5, W - 1, H - 1, 0, {}),
      fill: 'none',
      stroke: p.rule.hairline,
      'stroke-width': STROKE.hairline,
      rx: RADIUS,
    }),
  );

  const byKey = new Map(input.telemetry.featured.map((f) => [f.key, f]));
  const separators: string[] = [];
  const names: string[] = [];

  input.modules.forEach((module, index) => {
    const baseline = ROW_BASELINES[index];
    if (baseline === undefined) throw new Error(`core-modules supports 4 rows, got module ${index + 1}`);
    const featured = byKey.get(module.evidence);
    if (!featured) {
      throw new Error(
        `Module "${module.name}" cites evidence "${module.evidence}", which is not a featured repository. ` +
          'Every capability claim must point at a repository the reader can open.',
      );
    }

    // The index bar: a marker that spans the row's cap height, not a bullet.
    const capTop = baseline - TYPE.label.size * 0.73;
    names.push(
      el('path', {
        d: linePath(L + 0.75, capTop, L + 0.75, baseline + 2),
        stroke: p.rule.strong,
        'stroke-width': STROKE.strong,
        fill: 'none',
      }),
      canvas.text(module.name, TYPE.label, { x: NAME_X, y: baseline, fill: p.text.primary }),
      canvas.text(featured.name, TYPE.micro, { x: EVIDENCE_X, y: baseline, fill: p.text.tertiary, decorative: true }),
    );

    if (index < input.modules.length - 1) {
      // Midway between this baseline and the next row cap-top: 14.5u clear on
      // each side, so the rule can never read as a strikethrough.
      separators.push(linePath(L, baseline + 14.5, R, baseline + 14.5));
    }
  });

  canvas.add(
    el('path', {
      d: separators.join(''),
      stroke: p.rule.hairline,
      'stroke-width': STROKE.hairline,
      fill: 'none',
    }),
    ...names,
  );

  const desc =
    'Four capability domains, each paired with the public repository that evidences it: ' +
    input.modules
      .map((m) => `${m.name.toLowerCase()} in ${byKey.get(m.evidence)?.name ?? m.evidence}`)
      .join(', ') +
    '.';

  return canvas.build({ id: 'core-modules', title: 'Core modules and their evidence repositories', desc });
}
