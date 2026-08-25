import { assertCollisionSpec, type CollisionSpec } from '../layout.js';
import { FONT_MONO, FONT_SANS, el, line, node, svgDocument, text } from '../svg.js';
import type { Theme } from '../theme.js';

export const ARCHITECTURE_COLLISION_SPECS: Record<'desktop' | 'mobile', CollisionSpec> = {
  desktop: {
    name: 'architecture-desktop', width: 960, height: 460, margin: 12,
    textZones: [
      { id: 'heading', x: 54, y: 44, width: 540, height: 92 },
      { id: 'flow', x: 54, y: 202, width: 334, height: 54 },
      { id: 'ai-copy', x: 54, y: 298, width: 350, height: 48 },
      { id: 'interface-layer', x: 528, y: 166, width: 350, height: 24 },
      { id: 'state-layer', x: 528, y: 232, width: 350, height: 24 },
      { id: 'services-layer', x: 528, y: 298, width: 350, height: 24 },
      { id: 'delivery-layer', x: 528, y: 364, width: 350, height: 24 },
      { id: 'status', x: 54, y: 426, width: 852, height: 18 },
    ],
  },
  mobile: {
    name: 'architecture-mobile', width: 390, height: 665, margin: 12,
    textZones: [
      { id: 'heading', x: 24, y: 28, width: 342, height: 110 },
      { id: 'flow', x: 24, y: 158, width: 342, height: 50 },
      { id: 'interface-layer', x: 52, y: 266, width: 286, height: 24 },
      { id: 'state-layer', x: 52, y: 351, width: 286, height: 24 },
      { id: 'services-layer', x: 52, y: 436, width: 286, height: 24 },
      { id: 'delivery-layer', x: 52, y: 521, width: 286, height: 24 },
      { id: 'ai-copy', x: 24, y: 600, width: 342, height: 42 },
    ],
  },
};

function styles(theme: Theme, compact = false): string {
  return `<style>
    text{font-family:${FONT_SANS};fill:${theme.text}}
    .mono{font-family:${FONT_MONO}}
    .muted{fill:${theme.muted}}
    .micro{font-size:${compact ? 10 : 10.5}px;letter-spacing:${compact ? 1.3 : 1.6}px;font-weight:650}
    .tiny{font-size:${compact ? 8.2 : 9.2}px;letter-spacing:${compact ? .65 : .9}px}
    .layer{font-size:${compact ? 15.5 : 16.5}px;font-weight:650;letter-spacing:-.15px}
    .copy{font-size:${compact ? 11.5 : 12.5}px}
  </style>`;
}

function definitions(theme: Theme): string {
  return `<defs>
    <linearGradient id="architecture-spectrum" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${theme.violet}"/><stop offset=".5" stop-color="${theme.blue}"/><stop offset="1" stop-color="${theme.mint}"/></linearGradient>
    <filter id="architecture-shadow" x="-20%" y="-60%" width="150%" height="240%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="${theme.text}" flood-opacity=".08"/></filter>
  </defs>`;
}

function renderDesktop(theme: Theme): string {
  const styles = `<style>
    text{font-family:${FONT_SANS};fill:${theme.text}}
    .mono{font-family:${FONT_MONO}}
    .muted{fill:${theme.muted}}
    .micro{font-size:10.5px;letter-spacing:1.6px;font-weight:650}
    .tiny{font-size:9.2px;letter-spacing:.9px}
    .layer{font-size:16.5px;font-weight:650;letter-spacing:-.15px}
    .copy{font-size:12.5px}
  </style>`;

  const heading = node('g', { 'data-audit-text': 'heading' }, [
    line(54, 54, 88, 54, { stroke: theme.violet, 'stroke-width': 2 }),
    text(104, 59, 'ARCHITECTURE / COMPOSED', { class: 'mono micro', fill: theme.violet }),
    text(54, 100, 'A clear path from interface to delivery.', { 'font-size': 28, 'font-weight': 620, 'letter-spacing': -1.15 }),
    text(54, 128, 'Spatial layers keep system boundaries visible without turning them into boxes.', { class: 'copy muted' }),
  ]);

  const layers = [
    { center: 180, title: 'Interface', detail: 'REACT / ACCESSIBILITY / MOTION', color: theme.violet },
    { center: 246, title: 'State', detail: 'TYPESCRIPT / DATA / OFFLINE', color: theme.blue },
    { center: 312, title: 'Services', detail: 'NODE / API / TRANSACTIONS', color: theme.mint },
    { center: 378, title: 'Delivery', detail: 'TEST / PERFORMANCE / RELEASE', color: theme.amber },
  ] as const;
  const layerShapes = layers.flatMap((layer, index) => {
    return [
      el('path', { 'data-audit-geometry': 'plane', d: `M500 ${layer.center}L700 ${layer.center - 29}L906 ${layer.center}L706 ${layer.center + 29}Z`, fill: theme.bg, 'fill-opacity': .88, stroke: layer.color, 'stroke-opacity': .8, filter: 'url(#architecture-shadow)' }),
      node('g', { 'data-audit-text': `layer-${index + 1}` }, [
        text(530, layer.center + 6, layer.title, { class: 'layer' }),
        text(878, layer.center + 4, layer.detail, { class: 'mono tiny muted', 'text-anchor': 'end' }),
      ]),
      el('circle', { cx: 706, cy: layer.center, r: 3.6, fill: layer.color }),
    ];
  });

  const flow = node('g', { 'data-audit-text': 'flow' }, [
    line(54, 218, 376, 218, { stroke: theme.line }),
    ...['INTERFACE', 'STATE', 'SERVICES', 'DELIVERY'].flatMap((label, index) => {
      const x = 54 + index * 107;
      const colors = [theme.violet, theme.blue, theme.mint, theme.amber];
      return [
        el('circle', { cx: x, cy: 218, r: 7, fill: theme.bg, stroke: colors[index], 'stroke-width': 1.4 }),
        text(x, 249, label, { class: 'mono tiny muted', 'text-anchor': index === 0 ? 'start' : index === 3 ? 'end' : 'middle' }),
        index < 3 ? el('path', { d: `M${x + 12} 218H${x + 95}`, stroke: theme.line, 'stroke-dasharray': '3 9' }) : '',
      ];
    }),
  ]);

  const acquisition = node('g', { fill: 'none', opacity: .72 }, [
    el('path', { d: 'M375 218H430V378', stroke: theme.line, 'stroke-dasharray': '3 9' }),
    ...layers.map((layer) => el('path', { d: `M430 ${layer.center}H490`, stroke: layer.color, 'stroke-opacity': .55, 'stroke-dasharray': '3 9' })),
    text(430, 408, 'ACQUISITION SPINE', { class: 'mono tiny muted', 'text-anchor': 'middle' }),
  ]);

  const ai = node('g', { 'data-audit-text': 'ai-copy' }, [
    text(54, 310, 'AI-ASSISTED DEVELOPMENT', { class: 'mono micro', fill: theme.blue }),
    text(54, 337, 'Automation supports the path. Engineering judgment owns it.', { class: 'copy muted' }),
    line(54, 368, 390, 368, { stroke: 'url(#architecture-spectrum)', 'stroke-width': 2 }),
  ]);

  const status = node('g', { 'data-audit-text': 'status' }, [
    line(54, 421, 906, 421, { stroke: theme.line }),
    text(54, 442, 'SYSTEM COORDINATE / INTERFACE → DELIVERY', { class: 'mono tiny muted' }),
    text(906, 442, 'LAYERS / ALIGNED', { class: 'mono tiny muted', 'text-anchor': 'end' }),
  ]);

  return svgDocument({
    width: 960,
    height: 460,
    id: `architecture-${theme.name}`,
    title: 'Spatial engineering architecture from interface through delivery',
    description: 'Four connected layers: interface, state, services, and delivery. AI-assisted development supports the process while engineering judgment remains accountable.',
    body: [styles, definitions(theme), heading, flow, acquisition, ai, ...layerShapes, status].join(''),
  });
}

function renderMobile(theme: Theme): string {
  const layers = [
    { center: 280, title: 'Interface', detail: 'REACT / ACCESSIBILITY', color: theme.violet },
    { center: 365, title: 'State', detail: 'TYPESCRIPT / DATA', color: theme.blue },
    { center: 450, title: 'Services', detail: 'NODE / API', color: theme.mint },
    { center: 535, title: 'Delivery', detail: 'TEST / RELEASE', color: theme.amber },
  ] as const;
  const body = [
    styles(theme, true), definitions(theme),
    node('g', { 'data-audit-text': 'heading' }, [
      line(24, 38, 54, 38, { stroke: theme.violet, 'stroke-width': 2 }),
      text(67, 42, 'ARCHITECTURE / COMPOSED', { class: 'mono micro', fill: theme.violet }),
      text(24, 82, 'A clear path from interface to delivery.', { 'font-size': 20.5, 'font-weight': 620, 'letter-spacing': -.65 }),
      text(24, 110, 'Spatial layers keep system boundaries visible.', { class: 'copy muted' }),
      text(24, 130, 'Each layer remains distinct, legible, and accountable.', { class: 'copy muted' }),
    ]),
    node('g', { 'data-audit-text': 'flow' }, [
      line(24, 170, 366, 170, { stroke: theme.line }),
      ...['INTERFACE', 'STATE', 'SERVICES', 'DELIVERY'].flatMap((label, index) => {
        const x = 24 + index * 114;
        const color = [theme.violet, theme.blue, theme.mint, theme.amber][index];
        return [
          el('circle', { cx: x, cy: 170, r: 6.5, fill: theme.bg, stroke: color, 'stroke-width': 1.4 }),
          text(x, 201, label, { class: 'mono tiny muted', 'text-anchor': index === 0 ? 'start' : index === 3 ? 'end' : 'middle' }),
        ];
      }),
    ]),
    el('path', { d: 'M195 216V242', stroke: theme.line, 'stroke-dasharray': '3 8' }),
    text(208, 232, 'ACQUIRE / ALIGN', { class: 'mono tiny muted' }),
    ...layers.flatMap((layer, index) => [
      el('path', { 'data-audit-geometry': 'plane', d: `M36 ${layer.center}L195 ${layer.center - 27}L354 ${layer.center}L195 ${layer.center + 27}Z`, fill: theme.bg, 'fill-opacity': .9, stroke: layer.color, 'stroke-opacity': .82, filter: 'url(#architecture-shadow)' }),
      node('g', { 'data-audit-text': `layer-${index + 1}` }, [
        text(58, layer.center + 6, layer.title, { class: 'layer' }),
        text(334, layer.center + 4, layer.detail, { class: 'mono tiny muted', 'text-anchor': 'end' }),
      ]),
      el('circle', { cx: 195, cy: layer.center, r: 3.5, fill: layer.color }),
    ]),
    node('g', { 'data-audit-text': 'ai-copy' }, [
      line(24, 588, 366, 588, { stroke: 'url(#architecture-spectrum)', 'stroke-width': 2 }),
      text(24, 614, 'AI-ASSISTED DEVELOPMENT', { class: 'mono micro', fill: theme.blue }),
      text(24, 640, 'Automation supports the path. Engineering judgment owns it.', { class: 'copy muted' }),
    ]),
  ];
  return svgDocument({
    width: 390,
    height: 665,
    id: `architecture-mobile-${theme.name}`,
    title: 'Mobile spatial engineering architecture from interface through delivery',
    description: 'Four separated spatial layers: interface, state, services, and delivery. AI-assisted development supports an accountable engineering process.',
    body: body.join(''),
  });
}

export function renderArchitecture(theme: Theme, compact = false): string {
  assertCollisionSpec(ARCHITECTURE_COLLISION_SPECS[compact ? 'mobile' : 'desktop']);
  return compact ? renderMobile(theme) : renderDesktop(theme);
}
