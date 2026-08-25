import { FEATURED_SYSTEMS } from '../config.js';
import { assertCollisionSpec, type CollisionSpec } from '../layout.js';
import { FONT_MONO, FONT_SANS, el, line, node, svgDocument, text } from '../svg.js';
import type { Telemetry } from '../telemetry.js';
import type { Theme } from '../theme.js';

export const SYSTEMS_COLLISION_SPECS: Record<'desktop' | 'mobile', CollisionSpec> = {
  desktop: {
    name: 'systems-desktop', width: 960, height: 500, margin: 10,
    textZones: [
      { id: 'heading', x: 54, y: 44, width: 510, height: 88 },
      { id: 'spark-label', x: 294, y: 150, width: 188, height: 80 },
      { id: 'motion-label', x: 684, y: 150, width: 222, height: 80 },
      { id: 'dropspot-label', x: 54, y: 346, width: 230, height: 82 },
      { id: 'stock-label', x: 510, y: 362, width: 252, height: 82 },
      { id: 'status', x: 54, y: 468, width: 852, height: 18 },
    ],
    nodeZones: [
      { id: 'dropspot-node', cx: 130, cy: 274, radius: 17 },
      { id: 'spark-node', cx: 365, cy: 258, radius: 17 },
      { id: 'stock-node', cx: 610, cy: 310, radius: 17 },
      { id: 'motion-node', cx: 835, cy: 270, radius: 17 },
    ],
    avoidBands: [{ id: 'mission-trajectory', x: 54, y: 238, width: 852, height: 92 }],
  },
  mobile: {
    name: 'systems-mobile', width: 390, height: 650, margin: 16,
    textZones: [
      { id: 'heading', x: 24, y: 28, width: 342, height: 100 },
      { id: 'dropspot-label', x: 78, y: 154, width: 282, height: 78 },
      { id: 'spark-label', x: 78, y: 264, width: 282, height: 78 },
      { id: 'stock-label', x: 78, y: 374, width: 282, height: 78 },
      { id: 'motion-label', x: 78, y: 484, width: 282, height: 78 },
      { id: 'status', x: 24, y: 614, width: 342, height: 18 },
    ],
    nodeZones: [
      { id: 'dropspot-node', cx: 46, cy: 184, radius: 14 },
      { id: 'spark-node', cx: 46, cy: 294, radius: 14 },
      { id: 'stock-node', cx: 46, cy: 404, radius: 14 },
      { id: 'motion-node', cx: 46, cy: 514, radius: 14 },
    ],
  },
};

function colors(theme: Theme): readonly string[] {
  return [theme.blue, theme.red, theme.mint, theme.violet];
}

function renderDesktop(theme: Theme, telemetry: Telemetry): string {
  const byKey = new Map(telemetry.featured.map((repo) => [repo.key, repo]));
  const positions = [
    { x: 130, y: 274, labelX: 54, labelY: 354, anchor: 'start' },
    { x: 365, y: 258, labelX: 294, labelY: 158, anchor: 'start' },
    { x: 610, y: 310, labelX: 510, labelY: 370, anchor: 'start' },
    { x: 835, y: 270, labelX: 906, labelY: 158, anchor: 'end' },
  ] as const;

  const styles = `<style>
    text{font-family:${FONT_SANS};fill:${theme.text}}
    .mono{font-family:${FONT_MONO}}
    .muted{fill:${theme.muted}}
    .micro{font-size:10.5px;letter-spacing:1.65px;font-weight:650}
    .tiny{font-size:9.5px;letter-spacing:.95px}
    .name{font-size:17px;font-weight:650;letter-spacing:-.2px}
    .copy{font-size:12.5px}
  </style>`;

  const defs = `<defs>
    <linearGradient id="systems-route" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="${theme.blue}"/><stop offset=".45" stop-color="${theme.red}"/><stop offset="1" stop-color="${theme.violet}"/>
    </linearGradient>
    <filter id="systems-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;

  const title = node('g', {}, [
    line(54, 54, 88, 54, { stroke: theme.blue, 'stroke-width': 2 }),
    text(104, 59, 'SELECTED SYSTEMS / 04', { class: 'mono micro', fill: theme.blue }),
    text(54, 96, 'Tracked work in one mission graph.', { 'font-size': 28, 'font-weight': 620, 'letter-spacing': -1.15 }),
    text(54, 123, 'Four public systems, each carrying a distinct engineering signal.', { class: 'copy muted' }),
  ]);

  const route = node('g', { fill: 'none' }, [
    el('path', { 'data-audit-geometry': 'trajectory', d: 'M68 294C91 283 111 275 130 274C218 266 285 300 365 258C454 211 527 276 610 310C696 345 761 248 835 270C861 278 885 281 910 275', stroke: theme.line, 'stroke-width': 8, 'stroke-linecap': 'round', opacity: .14 }),
    el('path', { 'data-audit-geometry': 'trajectory', d: 'M68 294C91 283 111 275 130 274C218 266 285 300 365 258C454 211 527 276 610 310C696 345 761 248 835 270C861 278 885 281 910 275', stroke: 'url(#systems-route)', 'stroke-width': 1.7, 'stroke-linecap': 'round' }),
    el('path', { 'data-audit-geometry': 'trajectory', d: 'M130 274C252 334 470 334 610 310', stroke: theme.line, 'stroke-dasharray': '3 11', opacity: .82 }),
    el('path', { 'data-audit-geometry': 'trajectory', d: 'M365 258C508 232 690 231 835 270', stroke: theme.line, 'stroke-dasharray': '3 11', opacity: .82 }),
    text(520, 218, 'RELATIONSHIP TRACE / 02', { class: 'mono tiny muted', 'text-anchor': 'middle' }),
    text(906, 342, 'MISSION VECTOR / RESOLVED', { class: 'mono tiny muted', 'text-anchor': 'end' }),
  ]);

  const nodes = FEATURED_SYSTEMS.flatMap((system, index) => {
    const repo = byKey.get(system.key);
    if (!repo) throw new Error(`Missing telemetry for ${system.key}`);
    const position = positions[index];
    if (!position) throw new Error(`Missing system position ${index}`);
    const month = repo.pushedAt.slice(0, 7);
    const stack = system.stack.join(' · ');
    const above = index === 1 || index === 3;
    const accent = colors(theme)[index];
    return [
      line(position.x, position.y + (above ? -17 : 17), position.x, above ? 237 : position.labelY - 17, { stroke: theme.line }),
      el('circle', { 'data-audit-geometry': 'node', cx: position.x, cy: position.y, r: 17, fill: theme.bg, stroke: accent, 'stroke-width': 1.6 }),
      el('circle', { cx: position.x, cy: position.y, r: 5, fill: accent, filter: 'url(#systems-glow)' }),
      node('g', { 'data-audit-text': `system-${system.key}` }, [
        text(position.labelX, position.labelY, `${system.code} / ${system.role}`, { class: 'mono tiny', fill: accent, 'text-anchor': position.anchor }),
        text(position.labelX, position.labelY + 24, repo.name, { class: 'name', 'text-anchor': position.anchor }),
        text(position.labelX, position.labelY + 46, stack, { class: 'mono tiny muted', 'text-anchor': position.anchor }),
        text(position.labelX, position.labelY + 65, `PUBLIC PUSH ${month}`, { class: 'mono tiny muted', 'text-anchor': position.anchor }),
      ]),
    ];
  });

  const status = node('g', {}, [
    line(54, 463, 906, 463, { stroke: theme.line }),
    el('circle', { cx: 58, cy: 481, r: 3, fill: theme.mint }),
    text(72, 484, 'NETWORK STATUS / FOUR SYSTEMS RESOLVED', { class: 'mono tiny muted' }),
    text(906, 484, `MEASURED ${telemetry.capturedAt.slice(0, 10)}`, { class: 'mono tiny muted', 'text-anchor': 'end' }),
  ]);

  return svgDocument({
    width: 960,
    height: 500,
    id: `systems-${theme.name}`,
    title: 'Selected public systems mapped as a mission and relationship graph',
    description: FEATURED_SYSTEMS.map((system) => `${system.repo}: ${system.summary}`).join(' '),
    body: [styles, defs, title, route, ...nodes, status].join(''),
  });
}

function renderMobile(theme: Theme, telemetry: Telemetry): string {
  const byKey = new Map(telemetry.featured.map((repo) => [repo.key, repo]));
  const labelY = [162, 272, 382, 492] as const;
  const nodeY = [184, 294, 404, 514] as const;
  const palette = colors(theme);
  const styles = `<style>
    text{font-family:${FONT_SANS};fill:${theme.text}}
    .mono{font-family:${FONT_MONO}}
    .muted{fill:${theme.muted}}
    .micro{font-size:10px;letter-spacing:1.35px;font-weight:650}
    .tiny{font-size:9px;letter-spacing:.7px}
    .name{font-size:16.5px;font-weight:650;letter-spacing:-.15px}
    .copy{font-size:11.5px}
  </style>`;
  const body = [
    styles,
    `<defs><filter id="systems-mobile-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`,
    node('g', { 'data-audit-text': 'heading' }, [
      line(24, 38, 54, 38, { stroke: theme.blue, 'stroke-width': 2 }),
      text(67, 42, 'SELECTED SYSTEMS / 04', { class: 'mono micro', fill: theme.blue }),
      text(24, 82, 'Tracked work in one mission graph.', { 'font-size': 21.5, 'font-weight': 620, 'letter-spacing': -.7 }),
      text(24, 110, 'Four public systems across distinct engineering signals.', { class: 'copy muted' }),
    ]),
    el('path', { 'data-audit-geometry': 'trajectory', d: 'M46 145C31 178 61 216 46 250S31 322 46 360S61 432 46 470S31 538 46 566', fill: 'none', stroke: theme.line, 'stroke-width': 7, opacity: .14, 'stroke-linecap': 'round' }),
    el('path', { 'data-audit-geometry': 'trajectory', d: 'M46 145C31 178 61 216 46 250S31 322 46 360S61 432 46 470S31 538 46 566', fill: 'none', stroke: theme.blue, 'stroke-width': 1.4, 'stroke-dasharray': '28 10 3 10' }),
    ...FEATURED_SYSTEMS.flatMap((system, index) => {
      const repo = byKey.get(system.key);
      if (!repo) throw new Error(`Missing telemetry for ${system.key}`);
      const y = nodeY[index];
      const baseline = labelY[index];
      const accent = palette[index];
      if (y === undefined || baseline === undefined || accent === undefined) throw new Error(`Missing mobile system position ${index}`);
      return [
        line(60, y, 70, y, { stroke: theme.line }),
        el('circle', { 'data-audit-geometry': 'node', cx: 46, cy: y, r: 14, fill: theme.bg, stroke: accent, 'stroke-width': 1.5 }),
        el('circle', { cx: 46, cy: y, r: 4, fill: accent, filter: 'url(#systems-mobile-glow)' }),
        node('g', { 'data-audit-text': `system-${system.key}` }, [
          text(78, baseline, `${system.code} / ${system.role}`, { class: 'mono tiny', fill: accent }),
          text(78, baseline + 25, repo.name, { class: 'name' }),
          text(78, baseline + 47, system.stack.join(' · '), { class: 'mono tiny muted' }),
          text(78, baseline + 66, `PUBLIC PUSH ${repo.pushedAt.slice(0, 7)}`, { class: 'mono tiny muted' }),
        ]),
      ];
    }),
    line(24, 603, 366, 603, { stroke: theme.line }),
    el('circle', { cx: 28, cy: 622, r: 3, fill: theme.mint }),
    text(41, 625, 'FOUR SYSTEMS / RESOLVED', { class: 'mono tiny muted' }),
    text(366, 625, telemetry.capturedAt.slice(0, 10), { class: 'mono tiny muted', 'text-anchor': 'end' }),
  ];
  return svgDocument({
    width: 390,
    height: 650,
    id: `systems-mobile-${theme.name}`,
    title: 'Selected public systems in a mobile mission graph',
    description: FEATURED_SYSTEMS.map((system) => `${system.repo}: ${system.summary}`).join(' '),
    body: body.join(''),
  });
}

export function renderSystems(theme: Theme, telemetry: Telemetry, compact = false): string {
  assertCollisionSpec(SYSTEMS_COLLISION_SPECS[compact ? 'mobile' : 'desktop']);
  return compact ? renderMobile(theme, telemetry) : renderDesktop(theme, telemetry);
}
