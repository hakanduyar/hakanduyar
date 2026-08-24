/**
 * Generate docs/tokens.md — the reviewable token table with measured contrast
 * ratios, produced from the same source the renderers consume so it can never
 * drift from reality. CI regenerates it and fails on a diff.
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from '../../src/shared/emit.js';
import {
  DARK,
  LIGHT,
  TYPE,
  contrastRatio,
  TEXT_CONTRAST_FLOOR,
  GRAPHIC_CONTRAST_FLOOR,
  type Palette,
} from '../../src/shared/tokens.js';

function paletteTable(p: Palette): string {
  const base = p.surface.base;
  const row = (token: string, hex: string, use: string): string =>
    `| \`${token}\` | \`${hex}\` | ${contrastRatio(hex, base).toFixed(2)} | ${use} |`;

  const rows = [
    row('surface.base', p.surface.base, 'The asset ground. Opaque, always.'),
    row('surface.panel', p.surface.panel, 'Inset panels'),
    row('surface.raised', p.surface.raised, 'The single raised element per asset, if any'),
    row('surface.well', p.surface.well, 'Deepest recess of a measurement track'),
    row('rule.hairline', p.rule.hairline, 'Structural rules and panel edges. Never text.'),
    row('rule.strong', p.rule.strong, 'Emphasis rules; survives the mobile downscale. Never text.'),
    row('rule.tick', p.rule.tick, 'Scale ticks and axis marks. Never text.'),
    row('text.primary', p.text.primary, 'Wordmark, headline values'),
    row('text.secondary', p.text.secondary, 'Sub-lines, secondary values'),
    row('text.tertiary', p.text.tertiary, 'Uppercase micro-labels. The floor for text.'),
    row('signal', p.signal, 'The only chroma. At most one element per asset.'),
    row('signal.trace', p.signalTrace, 'Unfilled track portion. Fill only, never text.'),
    ...p.series.map((hex, i) => row(`series.${i + 1}`, hex, i === 0 ? 'Largest data segment' : `Data segment ${i + 1}`)),
    row('series.remainder', p.seriesRemainder, 'The "other" bucket - outlined, never filled'),
  ];
  return ['| Token | Hex | Contrast vs base | Use |', '|---|---|---:|---|', ...rows].join('\n');
}

function main(): void {
  const out = [
    '<!-- GENERATED FILE - do not edit by hand.',
    '     Source: scripts/generate/tokens-doc.ts (values from src/shared/tokens.ts)',
    '     Regenerate: npm run docs:tokens -->',
    '',
    '# Design tokens - measured',
    '',
    'Contrast ratios are WCAG 2.x relative-luminance ratios against each',
    `palette's own \`surface.base\`, computed at generation time from the same`,
    'module the renderers import. Floors enforced by `tests/tokens.test.ts`:',
    `text >= ${TEXT_CONTRAST_FLOOR}:1, data fills and signal >= ${GRAPHIC_CONTRAST_FLOOR}:1.`,
    '',
    '## Dark - emitted light on an instrument face',
    '',
    'Brightness means presence: the largest data segment is the brightest.',
    '',
    paletteTable(DARK),
    '',
    '## Light - deposited ink on technical paper',
    '',
    'Density means presence: the largest data segment is the darkest. The two',
    'series ramps run in opposite directions by design; a light theme produced',
    'by inverting the dark one fails `tests/tokens.test.ts`.',
    '',
    paletteTable(LIGHT),
    '',
    '## Type scale',
    '',
    '| Role | Size (u) | Weight | Tracking | Case |',
    '|---|---:|---:|---:|---|',
    ...Object.entries(TYPE).map(
      ([name, t]) =>
        `| ${name} | ${t.size} | ${t.font.slice(1)} | ${t.tracking}em | ${t.upper ? 'UPPER' : 'as written'} |`,
    ),
    '',
    'The 26u `label` size is the floor for information-carrying text',
    '(~10.5 CSS px at a 360px viewport); `micro` is annotation only and must be',
    'duplicated in Markdown. Enforced by `scripts/validate/validate-all.ts`.',
    '',
  ].join('\n');

  writeFileSync(resolve(REPO_ROOT, 'docs/tokens.md'), out, 'utf8');
  console.log('[tokens-doc] wrote docs/tokens.md');
}

main();
