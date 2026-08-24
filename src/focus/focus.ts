/**
 * Panel 01 — focus.
 *
 * Four domains, one line each. v1 drew the same four domains and then repeated
 * every one of them underneath the image as a Markdown bullet carrying a
 * two-clause sentence and a repository link — the graphic said INTERFACE, the
 * prose said Interface, and the reader read it twice.
 *
 * Here the line lives inside the panel and nowhere else. The evidence
 * repositories are gone from this panel too: they are the entire subject of
 * panel 02, and naming them twice on one page is the duplication the redesign
 * exists to remove.
 */

import { Canvas, type RenderedAsset } from '../shared/canvas.js';
import { TYPE, GRID, type Palette } from '../shared/tokens.js';
import { frame, head, rail, fitted, SECTIONS } from '../shared/panel.js';
import type { CapabilityModule } from '../shared/profile.js';

const W = GRID.width;
const H = 268;
const L = GRID.margin;
const R = GRID.right;

/** Where the capability column starts. Clears the longest domain name. */
const CAPABILITY_X = 240;
const ROW_BASELINES = [98, 144, 190, 236] as const;

export interface FocusInput {
  modules: readonly CapabilityModule[];
}

export function renderFocus(input: FocusInput, palette: Palette): RenderedAsset {
  const canvas = new Canvas(W, H, palette, `hdu-focus-${palette.name}`);
  const p = palette;

  if (input.modules.length !== ROW_BASELINES.length) {
    throw new Error(
      `Focus panel is laid out for ${ROW_BASELINES.length} modules but was given ${input.modules.length}. ` +
        'Add a baseline and re-derive the panel height before adding a domain.',
    );
  }

  canvas.add(frame(canvas, p), head(canvas, p, { index: SECTIONS.focus, name: 'FOCUS' }));

  input.modules.forEach((module, index) => {
    const y = ROW_BASELINES[index] as number;

    fitted(canvas, module.name, TYPE.label, CAPABILITY_X - L - GRID.gutter, `focus domain ${module.name}`);
    fitted(canvas, module.capability, TYPE.body, R - CAPABILITY_X, `focus capability ${module.name}`);

    // A hairline above every row but the first: the rows are a register, and
    // the rule is what makes them one instead of four floating strings.
    if (index > 0) canvas.add(rail(p, y - 30));

    canvas.add(
      canvas.text(module.name, TYPE.label, { x: L, y, fill: p.text.tertiary }),
      canvas.text(module.capability, TYPE.body, { x: CAPABILITY_X, y, fill: p.text.primary }),
    );
  });

  const spoken = input.modules
    .map((m) => `${m.name.charAt(0)}${m.name.slice(1).toLowerCase()}: ${m.capability}`)
    .join('. ');
  return canvas.build({
    id: 'focus',
    title: 'Focus - four engineering domains',
    desc: `Four domains of practice. ${spoken}.`,
  });
}
