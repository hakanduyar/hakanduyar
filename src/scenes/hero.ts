import { FONT_MONO, FONT_SANS, el, line, node, svgDocument, text } from '../svg.js';
import type { Theme } from '../theme.js';

const WIDTH = 960;
const HEIGHT = 470;
const CX = 700;
const CY = 224;

function heroStyles(theme: Theme, animated: boolean): string {
  const animation = animated
    ? `
      .mode-flight{animation:flight-state 12s ease-in-out infinite}
      .mode-signal{animation:signal-state 12s ease-in-out infinite}
      .mode-spatial{animation:spatial-state 12s ease-in-out infinite}
      .flight-orbit{transform-origin:${CX}px ${CY}px;animation:orbit 12s linear infinite}
      .flight-orbit-reverse{transform-origin:${CX}px ${CY}px;animation:orbit-reverse 12s linear infinite}
      .signal-path{stroke-dasharray:5 11;animation:signal-flow 2.4s linear infinite}
      .signal-node{animation:node-breathe 2.8s ease-in-out infinite}
      .spatial-plane{animation:plane-drift 3.4s ease-in-out infinite alternate}
      .core-breathe{transform-origin:${CX}px ${CY}px;animation:core-breathe 4s ease-in-out infinite}
      .transition-field{animation:transition-field 12s ease-in-out infinite}
      .rail-flight{animation:rail-flight 12s ease-in-out infinite}
      .rail-signal{animation:rail-signal 12s ease-in-out infinite}
      .rail-spatial{animation:rail-spatial 12s ease-in-out infinite}
      @keyframes flight-state{0%,26%{opacity:1;transform:translateY(0)}31%,95%{opacity:0;transform:translateY(-8px)}100%{opacity:1;transform:translateY(0)}}
      @keyframes signal-state{0%,27%{opacity:0;transform:scale(.97)}33%,59%{opacity:1;transform:scale(1)}65%,100%{opacity:0;transform:scale(1.02)}}
      @keyframes spatial-state{0%,60%{opacity:0;transform:translateY(10px)}67%,92%{opacity:1;transform:translateY(0)}98%,100%{opacity:0;transform:translateY(-8px)}}
      @keyframes orbit{to{transform:rotate(360deg)}}
      @keyframes orbit-reverse{to{transform:rotate(-360deg)}}
      @keyframes signal-flow{to{stroke-dashoffset:-64}}
      @keyframes node-breathe{0%,100%{opacity:.58}50%{opacity:1}}
      @keyframes plane-drift{from{transform:translateY(-3px)}to{transform:translateY(5px)}}
      @keyframes core-breathe{0%,100%{transform:scale(.96);opacity:.82}50%{transform:scale(1.06);opacity:1}}
      @keyframes transition-field{0%,25%,35%,58%,68%,91%,100%{opacity:0;stroke-dashoffset:180}28%,31%,62%,65%,94%,97%{opacity:.72;stroke-dashoffset:0}}
      @keyframes rail-flight{0%,26%,100%{opacity:1}31%,95%{opacity:.18}}
      @keyframes rail-signal{0%,27%,65%,100%{opacity:.18}33%,59%{opacity:1}}
      @keyframes rail-spatial{0%,60%,98%,100%{opacity:.18}67%,92%{opacity:1}}
    `
    : `
      .mode-flight{opacity:1}.mode-signal,.mode-spatial{opacity:0}
      .rail-flight{opacity:1}.rail-signal,.rail-spatial{opacity:.18}
    `;

  return `<style>
    text{font-family:${FONT_SANS};fill:${theme.text}}
    .mono{font-family:${FONT_MONO}}
    .muted{fill:${theme.muted}}
    .micro{font-size:9px;letter-spacing:2.1px;font-weight:600}
    .tiny{font-size:8px;letter-spacing:1.45px}
    .label{font-size:11px;letter-spacing:1.4px;font-weight:600}
    .title{font-size:61px;letter-spacing:-3.8px;font-weight:550}
    .subtitle{font-size:15px;letter-spacing:-.2px}
    .mode{transform-box:view-box;transform-origin:center;will-change:opacity,transform}
    .struct{fill:none;stroke:${theme.line};stroke-width:1}
    .soft{fill:none;stroke:${theme.lineSoft};stroke-width:1}
    .blue{stroke:${theme.blue}}
    .amber{stroke:${theme.amber}}
    .red{stroke:${theme.red}}
    .violet{stroke:${theme.violet}}
    .mint{stroke:${theme.mint}}
    ${animation}
  </style>`;
}
function commonDefinitions(theme: Theme): string {
  return `<defs>
    <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${theme.blue}" stop-opacity=".22"/>
      <stop offset=".48" stop-color="${theme.violet}" stop-opacity=".08"/>
      <stop offset="1" stop-color="${theme.blue}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="hero-spectrum" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="${theme.blue}"/><stop offset=".5" stop-color="${theme.violet}"/><stop offset="1" stop-color="${theme.mint}"/>
    </linearGradient>
    <filter id="hero-soft-glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="7" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;
}

function identity(theme: Theme): string {
  return node('g', { 'aria-label': 'Hakan Duyar, front-end and systems engineering' }, [
    line(58, 81, 92, 81, { stroke: theme.blue, 'stroke-width': 2 }),
    text(108, 85, 'ENGINEERING SYSTEM / ACTIVE', { class: 'mono micro', fill: theme.blue }),
    text(58, 167, 'Hakan', { class: 'title' }),
    text(58, 225, 'Duyar', { class: 'title muted', 'font-weight': 430 }),
    text(60, 269, 'Front-end · systems · AI-assisted development', { class: 'subtitle muted' }),
    line(60, 300, 323, 300, { stroke: theme.line }),
    el('circle', { cx: 60, cy: 300, r: 3.5, fill: theme.blue }),
    text(60, 327, 'REACT / TYPESCRIPT / NODE', { class: 'mono tiny muted' }),
    text(60, 345, 'INTERFACES THAT HOLD UP UNDER REAL USE', { class: 'mono tiny muted' }),
  ]);
}

function fieldGrid(theme: Theme): string {
  const vertical = Array.from({ length: 14 }, (_, index) =>
    line(430 + index * 38, 54, 430 + index * 38, 394, { stroke: theme.lineSoft, opacity: index % 2 ? .34 : .55 }),
  );
  const horizontal = Array.from({ length: 10 }, (_, index) =>
    line(404, 60 + index * 37, 942, 60 + index * 37, { stroke: theme.lineSoft, opacity: index % 2 ? .34 : .55 }),
  );
  return node('g', { opacity: .48 }, [...vertical, ...horizontal]);
}

function nucleus(theme: Theme): string {
  return node('g', { 'aria-label': 'Abstract circular identity nucleus' }, [
    el('circle', { cx: CX, cy: CY, r: 178, fill: 'url(#hero-glow)' }),
    el('circle', { cx: CX, cy: CY, r: 104, fill: 'none', stroke: theme.line, 'stroke-width': 1, 'stroke-dasharray': '2 10' }),
    el('circle', { cx: CX, cy: CY, r: 63, fill: 'none', stroke: theme.blue, 'stroke-opacity': .46 }),
    el('circle', { cx: CX, cy: CY, r: 31, fill: theme.blueSoft, stroke: theme.blue, 'stroke-width': 1.4 }),
    el('circle', { class: 'core-breathe', cx: CX, cy: CY, r: 9, fill: theme.blue, filter: 'url(#hero-soft-glow)' }),
    line(CX - 20, CY, CX + 20, CY, { stroke: theme.line, 'stroke-width': 1 }),
    line(CX, CY - 20, CX, CY + 20, { stroke: theme.line, 'stroke-width': 1 }),
  ]);
}

function flightMode(theme: Theme): string {
  const ticks = Array.from({ length: 24 }, (_, index) => {
    const angle = (index / 24) * Math.PI * 2;
    const inner = index % 3 === 0 ? 125 : 131;
    const outer = 138;
    return line(
      CX + Math.cos(angle) * inner,
      CY + Math.sin(angle) * inner,
      CX + Math.cos(angle) * outer,
      CY + Math.sin(angle) * outer,
      { stroke: index % 6 === 0 ? theme.amber : theme.line, 'stroke-width': index % 6 === 0 ? 1.8 : 1 },
    );
  });
  return node('g', { class: 'mode mode-flight', 'aria-label': 'Mode 01 Flight' }, [
    node('g', { class: 'flight-orbit', fill: 'none' }, [
      el('ellipse', { cx: CX, cy: CY, rx: 168, ry: 82, transform: `rotate(-18 ${CX} ${CY})`, stroke: theme.blue, 'stroke-width': 1.4, 'stroke-dasharray': '48 16 3 18' }),
      el('circle', { cx: CX - 157, cy: CY + 53, r: 4, fill: theme.amber, stroke: 'none' }),
    ]),
    node('g', { class: 'flight-orbit-reverse', fill: 'none' }, [
      el('ellipse', { cx: CX, cy: CY, rx: 145, ry: 56, transform: `rotate(54 ${CX} ${CY})`, stroke: theme.amber, 'stroke-width': 1.2, 'stroke-dasharray': '32 18 2 12' }),
      el('circle', { cx: CX + 102, cy: CY - 101, r: 3.5, fill: theme.blue, stroke: 'none' }),
    ]),
    node('g', {}, ticks),
    text(846, 103, 'MODE 01', { class: 'mono micro', fill: theme.blue }),
    text(846, 122, 'FLIGHT', { class: 'label' }),
    text(846, 142, 'ORBIT CALIBRATED', { class: 'mono tiny muted' }),
    text(474, 109, 'VECTOR / 07', { class: 'mono tiny muted' }),
    text(468, 337, 'IDENTITY LOCK / STABLE', { class: 'mono tiny', fill: theme.amber }),
  ]);
}

function signalMode(theme: Theme): string {
  const nodes = [
    [540, 130, 'INTERFACE'], [609, 84, 'REACT'], [797, 104, 'TYPESCRIPT'], [864, 190, 'DELIVERY'],
    [830, 322, 'AI-ASSIST'], [706, 355, 'OPERATIONS'], [556, 310, 'MOTION'], [610, 242, 'SYSTEMS'],
  ] as const;
  const edges = [
    [540, 130, 609, 84], [609, 84, CX, CY], [797, 104, CX, CY], [864, 190, CX, CY],
    [830, 322, CX, CY], [706, 355, CX, CY], [556, 310, 610, 242], [610, 242, CX, CY],
    [609, 84, 797, 104], [556, 310, 706, 355], [706, 355, 830, 322],
  ] as const;
  return node('g', { class: 'mode mode-signal', 'aria-label': 'Mode 02 Signal' }, [
    ...edges.map(([x1, y1, x2, y2], index) => line(x1, y1, x2, y2, {
      class: index === 1 || index === 6 || index === 4 ? 'signal-path' : '',
      stroke: index === 1 || index === 6 || index === 4 ? theme.red : theme.line,
      'stroke-width': index === 1 || index === 6 || index === 4 ? 1.5 : 1,
      opacity: .85,
    })),
    ...nodes.flatMap(([x, y, label], index) => [
      el('circle', { class: 'signal-node', cx: x, cy: y, r: index === 7 ? 7 : 5, fill: theme.bg, stroke: index === 1 || index === 4 || index === 7 ? theme.red : theme.muted, 'stroke-width': 1.4 }),
      text(x + (x > CX ? 9 : -9), y - 11, label, { class: 'mono tiny', fill: index === 1 || index === 4 || index === 7 ? theme.red : theme.muted, 'text-anchor': x > CX ? 'start' : 'end' }),
    ]),
    el('circle', { cx: CX, cy: CY, r: 84, fill: 'none', stroke: theme.red, 'stroke-dasharray': '3 9', opacity: .7 }),
    el('circle', { cx: CX, cy: CY, r: 118, fill: 'none', stroke: theme.line, 'stroke-dasharray': '2 12', opacity: .7 }),
    text(846, 103, 'MODE 02', { class: 'mono micro', fill: theme.red }),
    text(846, 122, 'SIGNAL', { class: 'label' }),
    text(846, 142, 'FIELD RESOLVED', { class: 'mono tiny muted' }),
    text(468, 337, 'RELATIONSHIP GRAPH / COHERENT', { class: 'mono tiny', fill: theme.red }),
  ]);
}

function spatialMode(theme: Theme): string {
  const planes = [
    { y: 118, color: theme.violet, label: 'INTERFACE' },
    { y: 181, color: theme.blue, label: 'STATE' },
    { y: 244, color: theme.mint, label: 'SERVICES' },
    { y: 307, color: theme.amber, label: 'DELIVERY' },
  ];
  return node('g', { class: 'mode mode-spatial', 'aria-label': 'Mode 03 Spatial' }, [
    ...planes.flatMap((plane, index) => [
      el('path', { class: 'spatial-plane', d: `M520 ${plane.y}L724 ${plane.y - 38}L880 ${plane.y + 5}L677 ${plane.y + 43}Z`, fill: theme.bg, 'fill-opacity': .64, stroke: plane.color, 'stroke-opacity': .78 }),
      text(545, plane.y + 14, plane.label, { class: 'mono tiny', fill: plane.color }),
      text(816, plane.y + 9, `LAYER 0${index + 1}`, { class: 'mono tiny muted' }),
    ]),
    line(CX, 87, CX, 363, { stroke: theme.line, 'stroke-dasharray': '2 9' }),
    el('circle', { cx: CX, cy: 118, r: 4, fill: theme.violet }),
    el('circle', { cx: CX, cy: 181, r: 4, fill: theme.blue }),
    el('circle', { cx: CX, cy: 244, r: 4, fill: theme.mint }),
    el('circle', { cx: CX, cy: 307, r: 4, fill: theme.amber }),
    text(846, 103, 'MODE 03', { class: 'mono micro', fill: theme.violet }),
    text(846, 122, 'SPATIAL', { class: 'label' }),
    text(846, 142, 'LAYERS COMPOSED', { class: 'mono tiny muted' }),
    text(468, 337, 'ARCHITECTURE / RESOLVED', { class: 'mono tiny', fill: theme.violet }),
  ]);
}

function transitionField(theme: Theme): string {
  return node('g', { class: 'transition-field', opacity: 0, fill: 'none' }, [
    el('circle', { cx: CX, cy: CY, r: 151, stroke: theme.text, 'stroke-width': 1, 'stroke-dasharray': '180 520' }),
    line(470, CY, 925, CY, { stroke: theme.blue, 'stroke-width': 1 }),
    line(CX, 62, CX, 382, { stroke: theme.red, 'stroke-width': 1 }),
  ]);
}

function modeRail(theme: Theme): string {
  const rail = [
    { x: 505, key: '01', name: 'FLIGHT', color: theme.blue, className: 'rail-flight' },
    { x: 655, key: '02', name: 'SIGNAL', color: theme.red, className: 'rail-signal' },
    { x: 805, key: '03', name: 'SPATIAL', color: theme.violet, className: 'rail-spatial' },
  ];
  return node('g', { transform: 'translate(0 414)' }, rail.flatMap((item) => [
    line(item.x, 0, item.x + 100, 0, { class: item.className, stroke: item.color, 'stroke-width': 2 }),
    text(item.x, 20, item.key, { class: `mono tiny ${item.className}`, fill: item.color }),
    text(item.x + 26, 20, item.name, { class: `mono tiny ${item.className}`, fill: theme.muted }),
  ]));
}

export function renderHero(theme: Theme, animated: boolean): string {
  const body = [
    heroStyles(theme, animated),
    commonDefinitions(theme),
    fieldGrid(theme),
    identity(theme),
    flightMode(theme),
    signalMode(theme),
    spatialMode(theme),
    nucleus(theme),
    transitionField(theme),
    modeRail(theme),
  ].join('');

  return svgDocument({
    width: WIDTH,
    height: HEIGHT,
    id: `hero-${theme.name}${animated ? '-motion' : '-static'}`,
    title: `Hakan Duyar engineering system — ${animated ? 'three-mode animated hero' : 'reduced-motion hero'}`,
    description: animated
      ? 'A single twelve-second loop transitions from orbital flight calibration to a relationship signal field, then to spatial architecture layers, before returning to flight.'
      : 'A reduced-motion view of the circular identity nucleus in flight calibration mode.',
    body,
  });
}
