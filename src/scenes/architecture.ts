import { FONT_MONO, FONT_SANS, el, line, node, svgDocument, text } from '../svg.js';
import type { Theme } from '../theme.js';

const WIDTH = 960;
const HEIGHT = 390;

export function renderArchitecture(theme: Theme): string {
  const styles = `<style>
    text{font-family:${FONT_SANS};fill:${theme.text}}
    .mono{font-family:${FONT_MONO}}
    .muted{fill:${theme.muted}}
    .micro{font-size:9px;letter-spacing:1.8px;font-weight:600}
    .tiny{font-size:8px;letter-spacing:1.15px}
    .layer{font-size:15px;font-weight:650}
    .copy{font-size:11px}
  </style>`;

  const defs = `<defs>
    <linearGradient id="architecture-spectrum" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${theme.violet}"/><stop offset=".5" stop-color="${theme.blue}"/><stop offset="1" stop-color="${theme.mint}"/></linearGradient>
    <filter id="architecture-shadow" x="-20%" y="-50%" width="150%" height="220%"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="${theme.text}" flood-opacity=".08"/></filter>
  </defs>`;

  const heading = node('g', {}, [
    line(54, 54, 88, 54, { stroke: theme.violet, 'stroke-width': 2 }),
    text(104, 58, 'ARCHITECTURE / COMPOSED', { class: 'mono micro', fill: theme.violet }),
    text(54, 104, 'A clear path from interface to delivery.', { 'font-size': 25, 'font-weight': 600, 'letter-spacing': -1.1 }),
    text(54, 130, 'Spatial layers keep system boundaries visible without turning them into boxes.', { class: 'copy muted' }),
  ]);

  const layers = [
    { y: 52, title: 'Interface', detail: 'REACT / ACCESSIBILITY / MOTION', color: theme.violet },
    { y: 118, title: 'State', detail: 'TYPESCRIPT / DATA / OFFLINE', color: theme.blue },
    { y: 184, title: 'Services', detail: 'NODE / API / TRANSACTIONS', color: theme.mint },
    { y: 250, title: 'Delivery', detail: 'TEST / PERFORMANCE / RELEASE', color: theme.amber },
  ] as const;
  const layerShapes = layers.flatMap((layer, index) => {
    const x = 483 + index * 15;
    return [
      el('path', { d: `M${x} ${layer.y + 74}L${x + 223} ${layer.y + 31}L896 ${layer.y + 72}L${673 + index * 12} ${layer.y + 115}Z`, fill: theme.bg, 'fill-opacity': .82, stroke: layer.color, 'stroke-opacity': .74, filter: 'url(#architecture-shadow)' }),
      text(x + 26, layer.y + 81, layer.title, { class: 'layer' }),
      text(864, layer.y + 72, layer.detail, { class: 'mono tiny muted', 'text-anchor': 'end' }),
      el('circle', { cx: 698 + index * 12, cy: layer.y + 73, r: 3.5, fill: layer.color }),
    ];
  });

  const flow = node('g', {}, [
    line(54, 194, 380, 194, { stroke: theme.line }),
    ...['INTERFACE', 'STATE', 'SERVICES', 'DELIVERY'].flatMap((label, index) => {
      const x = 54 + index * 108;
      const colors = [theme.violet, theme.blue, theme.mint, theme.amber];
      return [
        el('circle', { cx: x, cy: 194, r: 7, fill: theme.bg, stroke: colors[index], 'stroke-width': 1.4 }),
        text(x, 223, label, { class: 'mono tiny muted', 'text-anchor': index === 0 ? 'start' : index === 3 ? 'end' : 'middle' }),
        index < 3 ? el('path', { d: `M${x + 12} 194H${x + 96}`, stroke: theme.line, 'stroke-dasharray': '3 8' }) : '',
      ];
    }),
    text(54, 278, 'AI-ASSISTED DEVELOPMENT', { class: 'mono micro', fill: theme.blue }),
    text(54, 302, 'Automation supports the path. Engineering judgment owns it.', { class: 'copy muted' }),
    line(54, 332, 392, 332, { stroke: 'url(#architecture-spectrum)', 'stroke-width': 2 }),
  ]);

  return svgDocument({
    width: WIDTH,
    height: HEIGHT,
    id: `architecture-${theme.name}`,
    title: 'Spatial engineering architecture from interface through delivery',
    description: 'Four connected layers: interface, state, services, and delivery. AI-assisted development supports the process while engineering judgment remains accountable.',
    body: [styles, defs, heading, flow, ...layerShapes].join(''),
  });
}
