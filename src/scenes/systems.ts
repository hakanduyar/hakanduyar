import { FEATURED_SYSTEMS } from '../config.js';
import { FONT_MONO, FONT_SANS, el, line, node, svgDocument, text } from '../svg.js';
import type { Telemetry } from '../telemetry.js';
import type { Theme } from '../theme.js';

const WIDTH = 960;
const HEIGHT = 420;

export function renderSystems(theme: Theme, telemetry: Telemetry): string {
  const byKey = new Map(telemetry.featured.map((repo) => [repo.key, repo]));
  const positions = [
    { x: 118, y: 211, labelY: 286 },
    { x: 358, y: 159, labelY: 86 },
    { x: 608, y: 232, labelY: 307 },
    { x: 842, y: 178, labelY: 104 },
  ] as const;

  const styles = `<style>
    text{font-family:${FONT_SANS};fill:${theme.text}}
    .mono{font-family:${FONT_MONO}}
    .muted{fill:${theme.muted}}
    .micro{font-size:9px;letter-spacing:1.8px;font-weight:600}
    .tiny{font-size:8px;letter-spacing:1.15px}
    .name{font-size:15px;font-weight:650}
    .copy{font-size:11px}
  </style>`;

  const defs = `<defs>
    <linearGradient id="systems-route" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="${theme.blue}"/><stop offset=".45" stop-color="${theme.red}"/><stop offset="1" stop-color="${theme.violet}"/>
    </linearGradient>
    <filter id="systems-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;

  const title = node('g', {}, [
    line(54, 54, 88, 54, { stroke: theme.blue, 'stroke-width': 2 }),
    text(104, 58, 'SELECTED SYSTEMS / 04', { class: 'mono micro', fill: theme.blue }),
    text(54, 94, 'Tracked work in one mission graph.', { 'font-size': 25, 'font-weight': 600, 'letter-spacing': -1.1 }),
    text(54, 118, 'Four public systems, each carrying a different engineering signal.', { class: 'copy muted' }),
  ]);

  const route = node('g', { fill: 'none' }, [
    el('path', { d: 'M68 236C175 184 244 204 358 159S497 194 608 232s147-78 284-50', stroke: theme.line, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: .16 }),
    el('path', { d: 'M68 236C175 184 244 204 358 159S497 194 608 232s147-78 284-50', stroke: 'url(#systems-route)', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
    el('path', { d: 'M118 211C255 329 414 333 608 232', stroke: theme.line, 'stroke-dasharray': '3 10' }),
    el('path', { d: 'M358 159C503 60 674 70 842 178', stroke: theme.line, 'stroke-dasharray': '3 10' }),
  ]);

  const nodes = FEATURED_SYSTEMS.flatMap((system, index) => {
    const repo = byKey.get(system.key);
    if (!repo) throw new Error(`Missing telemetry for ${system.key}`);
    const position = positions[index];
    if (!position) throw new Error(`Missing system position ${index}`);
    const above = index === 1 || index === 3;
    const anchor = index > 1 ? 'end' : 'start';
    const labelX = position.x + (anchor === 'end' ? -16 : 16);
    const month = repo.pushedAt.slice(0, 7);
    const stack = system.stack.join(' · ');
    const connectorY = above ? position.labelY + 38 : position.labelY - 26;
    return [
      line(position.x, position.y, position.x, connectorY, { stroke: theme.line }),
      el('circle', { cx: position.x, cy: position.y, r: 16, fill: theme.bg, stroke: index === 0 ? theme.blue : index === 1 ? theme.red : index === 2 ? theme.mint : theme.violet, 'stroke-width': 1.5 }),
      el('circle', { cx: position.x, cy: position.y, r: 5, fill: index === 0 ? theme.blue : index === 1 ? theme.red : index === 2 ? theme.mint : theme.violet, filter: 'url(#systems-glow)' }),
      text(labelX, position.labelY, `${system.code} / ${system.role}`, { class: 'mono tiny', fill: index === 0 ? theme.blue : index === 1 ? theme.red : index === 2 ? theme.mint : theme.violet, 'text-anchor': anchor }),
      text(labelX, position.labelY + 23, repo.name, { class: 'name', 'text-anchor': anchor }),
      text(labelX, position.labelY + 42, stack, { class: 'mono tiny muted', 'text-anchor': anchor }),
      text(labelX, position.labelY + 59, `PUBLIC PUSH ${month}`, { class: 'mono tiny muted', 'text-anchor': anchor }),
    ];
  });

  const status = node('g', {}, [
    line(54, 380, 906, 380, { stroke: theme.line }),
    el('circle', { cx: 58, cy: 398, r: 3, fill: theme.mint }),
    text(71, 401, 'NETWORK STATUS / FOUR SYSTEMS RESOLVED', { class: 'mono tiny muted' }),
    text(906, 401, `MEASURED ${telemetry.capturedAt.slice(0, 10)}`, { class: 'mono tiny muted', 'text-anchor': 'end' }),
  ]);

  return svgDocument({
    width: WIDTH,
    height: HEIGHT,
    id: `systems-${theme.name}`,
    title: 'Selected public systems mapped as a mission and relationship graph',
    description: FEATURED_SYSTEMS.map((system) => `${system.repo}: ${system.summary}`).join(' '),
    body: [styles, defs, title, route, ...nodes, status].join(''),
  });
}
