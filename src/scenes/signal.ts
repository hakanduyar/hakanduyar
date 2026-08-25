import { assertCollisionSpec, type CollisionSpec } from '../layout.js';
import { FONT_MONO, FONT_SANS, el, line, node, number, svgDocument, text } from '../svg.js';
import type { Telemetry } from '../telemetry.js';
import type { Theme } from '../theme.js';

export const SIGNAL_COLLISION_SPECS: Record<'desktop' | 'mobile', CollisionSpec> = {
  desktop: {
    name: 'signal-desktop', width: 960, height: 440, margin: 12,
    textZones: [
      { id: 'heading', x: 54, y: 42, width: 570, height: 92 },
      { id: 'chart-dates', x: 54, y: 314, width: 550, height: 18 },
      { id: 'language-typescript', x: 748, y: 120, width: 124, height: 18 },
      { id: 'language-go', x: 894, y: 228, width: 54, height: 18 },
      { id: 'language-vue', x: 760, y: 336, width: 100, height: 18 },
      { id: 'language-javascript', x: 622, y: 228, width: 104, height: 18 },
      { id: 'metrics', x: 54, y: 382, width: 620, height: 34 },
      { id: 'source', x: 776, y: 394, width: 130, height: 18 },
    ],
    nodeZones: [
      { id: 'typescript-node', cx: 810, cy: 158, radius: 5 },
      { id: 'go-node', cx: 878, cy: 240, radius: 5 },
      { id: 'vue-node', cx: 810, cy: 320, radius: 5 },
      { id: 'javascript-node', cx: 742, cy: 240, radius: 5 },
    ],
    avoidBands: [{ id: 'activity-trace', x: 54, y: 152, width: 550, height: 154 }],
  },
  mobile: {
    name: 'signal-mobile', width: 390, height: 650, margin: 12,
    textZones: [
      { id: 'heading', x: 24, y: 28, width: 342, height: 104 },
      { id: 'chart-dates', x: 24, y: 314, width: 342, height: 18 },
      { id: 'metrics', x: 24, y: 340, width: 342, height: 48 },
      { id: 'language-typescript', x: 132, y: 398, width: 126, height: 18 },
      { id: 'language-go', x: 282, y: 492, width: 84, height: 18 },
      { id: 'language-vue', x: 148, y: 594, width: 94, height: 14 },
      { id: 'language-javascript', x: 24, y: 468, width: 108, height: 18 },
      { id: 'source', x: 24, y: 620, width: 342, height: 18 },
    ],
    nodeZones: [
      { id: 'typescript-node', cx: 195, cy: 432, radius: 5 },
      { id: 'go-node', cx: 268, cy: 505, radius: 5 },
      { id: 'vue-node', cx: 195, cy: 578, radius: 5 },
      { id: 'javascript-node', cx: 132, cy: 505, radius: 5 },
    ],
    avoidBands: [{ id: 'activity-trace', x: 24, y: 152, width: 342, height: 154 }],
  },
};

function weeklyPath(values: readonly number[], x: number, width: number, baseY: number, height: number): string {
  if (values.length !== 52) throw new Error(`Signal needs 52 weekly values; received ${values.length}`);
  const max = Math.max(...values, 1);
  return values.map((value, index) => {
    const pointX = x + (index / 51) * width;
    const pointY = baseY - (value / max) * height;
    return `${index === 0 ? 'M' : 'L'}${number(pointX)} ${number(pointY)}`;
  }).join('');
}

function styles(theme: Theme, compact = false): string {
  return `<style>
    text{font-family:${FONT_SANS};fill:${theme.text}}
    .mono{font-family:${FONT_MONO}}
    .muted{fill:${theme.muted}}
    .micro{font-size:${compact ? 10 : 10.5}px;letter-spacing:${compact ? 1.3 : 1.6}px;font-weight:650}
    .tiny{font-size:${compact ? 9 : 9.3}px;letter-spacing:${compact ? .65 : .85}px}
    .value{font-size:${compact ? 20 : 23}px;font-weight:650;letter-spacing:-.7px}
    .copy{font-size:${compact ? 11.5 : 12.5}px}
  </style>`;
}

function definitions(theme: Theme): string {
  return `<defs>
    <linearGradient id="signal-trace" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${theme.blue}"/><stop offset=".52" stop-color="${theme.red}"/><stop offset="1" stop-color="${theme.violet}"/></linearGradient>
    <radialGradient id="signal-field"><stop stop-color="${theme.violet}" stop-opacity=".16"/><stop offset="1" stop-color="${theme.violet}" stop-opacity="0"/></radialGradient>
    <filter id="signal-endpoint" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;
}

function renderDesktop(theme: Theme, telemetry: Telemetry): string {
  const primary = telemetry.languages[0];
  if (!primary) throw new Error('Telemetry has no language data');

  const heading = node('g', { 'data-audit-text': 'heading' }, [
    line(54, 52, 88, 52, { stroke: theme.red, 'stroke-width': 2 }),
    text(104, 57, 'PUBLIC SIGNAL / MEASURED', { class: 'mono micro', fill: theme.red }),
    text(54, 98, 'Activity as a trace, not a leaderboard.', { 'font-size': 28, 'font-weight': 620, 'letter-spacing': -1.15 }),
    text(54, 126, 'Fifty-two complete weeks from GitHub; no estimates and no third-party cards.', { class: 'copy muted' }),
  ]);

  const grid = node('g', { opacity: .65 }, [
    ...Array.from({ length: 5 }, (_, index) => line(54, 166 + index * 34, 604, 166 + index * 34, { stroke: theme.lineSoft })),
    ...Array.from({ length: 12 }, (_, index) => line(54 + index * 50, 152, 54 + index * 50, 304, { stroke: theme.lineSoft })),
  ]);

  const trace = node('g', { fill: 'none' }, [
    el('path', { 'data-audit-geometry': 'trajectory', d: weeklyPath(telemetry.activity.weekly, 54, 550, 304, 138), stroke: theme.line, 'stroke-width': 7, opacity: .12, 'stroke-linejoin': 'round' }),
    el('path', { 'data-audit-geometry': 'trajectory', d: weeklyPath(telemetry.activity.weekly, 54, 550, 304, 138), stroke: 'url(#signal-trace)', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    el('circle', { cx: 54, cy: 304 - (telemetry.activity.weekly[0] ?? 0) / Math.max(...telemetry.activity.weekly, 1) * 138, r: 3.5, fill: theme.bg, stroke: theme.blue }),
    el('circle', { cx: 54 + (telemetry.activity.maxIndex / 51) * 550, cy: 166, r: 5, fill: theme.red, filter: 'url(#signal-endpoint)' }),
    el('circle', { cx: 604, cy: 304 - (telemetry.activity.weekly[51] ?? 0) / Math.max(...telemetry.activity.weekly, 1) * 138, r: 5, fill: theme.bg, stroke: theme.violet, 'stroke-width': 2 }),
    line(604, 304, 604, 318, { stroke: theme.violet }),
    node('g', { 'data-audit-text': 'chart-dates' }, [
      text(54, 329, telemetry.activity.start, { class: 'mono tiny muted' }),
      text(604, 329, telemetry.activity.end, { class: 'mono tiny muted', 'text-anchor': 'end' }),
    ]),
  ]);

  const fieldCx = 810;
  const fieldCy = 240;
  const languages = telemetry.languages.slice(0, 4);
  const colors = [theme.blue, theme.violet, theme.mint, theme.amber];
  const positions = [
    { x: 810, y: 158, labelX: 810, labelY: 132, anchor: 'middle' },
    { x: 878, y: 240, labelX: 894, labelY: 244, anchor: 'start' },
    { x: 810, y: 320, labelX: 810, labelY: 350, anchor: 'middle' },
    { x: 742, y: 240, labelX: 726, labelY: 244, anchor: 'end' },
  ] as const;
  const constellation = node('g', {}, [
    el('circle', { cx: fieldCx, cy: fieldCy, r: 108, fill: 'url(#signal-field)' }),
    el('circle', { cx: fieldCx, cy: fieldCy, r: 72, fill: 'none', stroke: theme.line, 'stroke-dasharray': '2 9' }),
    el('circle', { cx: fieldCx, cy: fieldCy, r: 42, fill: theme.bg, stroke: theme.blue }),
    el('circle', { cx: fieldCx, cy: fieldCy, r: 6, fill: theme.blue }),
    ...languages.flatMap((language, index) => {
      const position = positions[index];
      const color = colors[index];
      if (!position || !color) throw new Error(`Missing language position ${index}`);
      return [
        line(fieldCx, fieldCy, position.x, position.y, { stroke: color, opacity: .68 }),
        el('circle', { 'data-audit-geometry': 'node', cx: position.x, cy: position.y, r: 4.8, fill: color }),
        node('g', { 'data-audit-text': `language-${language.name.toLowerCase()}` }, [
          text(position.labelX, position.labelY, `${language.name.toUpperCase()} ${(language.share * 100).toFixed(1)}%`, { class: 'mono tiny', fill: color, 'text-anchor': position.anchor }),
        ]),
      ];
    }),
  ]);

  const measured = node('g', { 'data-audit-text': 'metrics' }, [
    line(54, 372, 906, 372, { stroke: theme.line }),
    text(54, 408, `${telemetry.activity.total}`, { class: 'value' }),
    text(116, 406, 'PUBLIC CONTRIBUTIONS / 52 COMPLETE WEEKS', { class: 'mono tiny muted' }),
    text(448, 408, `${telemetry.publicRepos}`, { class: 'value' }),
    text(490, 406, 'PUBLIC NON-FORK REPOSITORIES', { class: 'mono tiny muted' }),
    text(906, 406, `SOURCE ${telemetry.capturedAt.slice(0, 10)}`, { class: 'mono tiny muted', 'text-anchor': 'end' }),
  ]);

  return svgDocument({
    width: 960,
    height: 440,
    id: `signal-${theme.name}`,
    title: 'Measured public engineering signal',
    description: `${telemetry.activity.total} public contributions across 52 complete weeks ending ${telemetry.activity.end}; ${telemetry.publicRepos} public non-fork repositories; primary public source language ${primary.name} at ${(primary.share * 100).toFixed(1)} percent.`,
    body: [styles(theme), definitions(theme), heading, grid, trace, constellation, measured].join(''),
  });
}

function renderMobile(theme: Theme, telemetry: Telemetry): string {
  const primary = telemetry.languages[0];
  if (!primary) throw new Error('Telemetry has no language data');
  const languages = telemetry.languages.slice(0, 4);
  const palette = [theme.blue, theme.violet, theme.mint, theme.amber];
  const positions = [
    { x: 195, y: 432, labelX: 195, labelY: 414, anchor: 'middle' },
    { x: 268, y: 505, labelX: 282, labelY: 509, anchor: 'start' },
    { x: 195, y: 578, labelX: 195, labelY: 604, anchor: 'middle' },
    { x: 132, y: 505, labelX: 24, labelY: 480, anchor: 'start' },
  ] as const;
  const max = Math.max(...telemetry.activity.weekly, 1);
  const body = [
    styles(theme, true), definitions(theme),
    node('g', { 'data-audit-text': 'heading' }, [
      line(24, 38, 54, 38, { stroke: theme.red, 'stroke-width': 2 }),
      text(67, 42, 'PUBLIC SIGNAL / MEASURED', { class: 'mono micro', fill: theme.red }),
      text(24, 82, 'Activity as a trace, not a leaderboard.', { 'font-size': 20.5, 'font-weight': 620, 'letter-spacing': -.65 }),
      text(24, 110, 'Fifty-two complete weeks from GitHub.', { class: 'copy muted' }),
      text(24, 130, 'No estimates. No third-party statistic cards.', { class: 'copy muted' }),
    ]),
    node('g', { opacity: .65 }, [
      ...Array.from({ length: 5 }, (_, index) => line(24, 166 + index * 34, 366, 166 + index * 34, { stroke: theme.lineSoft })),
      ...Array.from({ length: 7 }, (_, index) => line(24 + index * 57, 152, 24 + index * 57, 304, { stroke: theme.lineSoft })),
    ]),
    el('path', { 'data-audit-geometry': 'trajectory', d: weeklyPath(telemetry.activity.weekly, 24, 342, 304, 138), fill: 'none', stroke: theme.line, 'stroke-width': 7, opacity: .12, 'stroke-linejoin': 'round' }),
    el('path', { 'data-audit-geometry': 'trajectory', d: weeklyPath(telemetry.activity.weekly, 24, 342, 304, 138), fill: 'none', stroke: 'url(#signal-trace)', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    el('circle', { cx: 24 + telemetry.activity.maxIndex / 51 * 342, cy: 166, r: 5, fill: theme.red, filter: 'url(#signal-endpoint)' }),
    el('circle', { cx: 366, cy: 304 - (telemetry.activity.weekly[51] ?? 0) / max * 138, r: 5, fill: theme.bg, stroke: theme.violet, 'stroke-width': 2 }),
    node('g', { 'data-audit-text': 'chart-dates' }, [
      text(24, 328, telemetry.activity.start, { class: 'mono tiny muted' }),
      text(366, 328, telemetry.activity.end, { class: 'mono tiny muted', 'text-anchor': 'end' }),
    ]),
    node('g', { 'data-audit-text': 'metrics' }, [
      text(24, 359, `${telemetry.activity.total}`, { class: 'value' }),
      text(78, 357, 'PUBLIC CONTRIBUTIONS / 52 WEEKS', { class: 'mono tiny muted' }),
      text(24, 387, `${telemetry.publicRepos}`, { class: 'value' }),
      text(66, 385, 'PUBLIC NON-FORK REPOSITORIES', { class: 'mono tiny muted' }),
    ]),
    el('circle', { cx: 195, cy: 505, r: 105, fill: 'url(#signal-field)' }),
    el('circle', { cx: 195, cy: 505, r: 73, fill: 'none', stroke: theme.line, 'stroke-dasharray': '2 9' }),
    el('circle', { cx: 195, cy: 505, r: 41, fill: theme.bg, stroke: theme.blue }),
    el('circle', { cx: 195, cy: 505, r: 6, fill: theme.blue }),
    ...languages.flatMap((language, index) => {
      const position = positions[index];
      const color = palette[index];
      if (!position || !color) throw new Error(`Missing mobile language position ${index}`);
      return [
        line(195, 505, position.x, position.y, { stroke: color, opacity: .68 }),
        el('circle', { 'data-audit-geometry': 'node', cx: position.x, cy: position.y, r: 4.8, fill: color }),
        node('g', { 'data-audit-text': `language-${language.name.toLowerCase()}` }, [
          text(position.labelX, position.labelY, `${language.name.toUpperCase()} ${(language.share * 100).toFixed(1)}%`, { class: 'mono tiny', fill: color, 'text-anchor': position.anchor }),
        ]),
      ];
    }),
    line(24, 616, 366, 616, { stroke: theme.line }),
    node('g', { 'data-audit-text': 'source' }, [
      text(24, 638, `PRIMARY / ${primary.name.toUpperCase()}`, { class: 'mono tiny muted' }),
      text(366, 638, `SOURCE ${telemetry.capturedAt.slice(0, 10)}`, { class: 'mono tiny muted', 'text-anchor': 'end' }),
    ]),
  ];
  return svgDocument({
    width: 390,
    height: 650,
    id: `signal-mobile-${theme.name}`,
    title: 'Mobile measured public engineering signal',
    description: `${telemetry.activity.total} public contributions across 52 complete weeks ending ${telemetry.activity.end}; ${telemetry.publicRepos} public non-fork repositories; primary public source language ${primary.name} at ${(primary.share * 100).toFixed(1)} percent.`,
    body: body.join(''),
  });
}

export function renderSignal(theme: Theme, telemetry: Telemetry, compact = false): string {
  assertCollisionSpec(SIGNAL_COLLISION_SPECS[compact ? 'mobile' : 'desktop']);
  return compact ? renderMobile(theme, telemetry) : renderDesktop(theme, telemetry);
}
