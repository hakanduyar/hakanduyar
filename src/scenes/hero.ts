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
      .signal-path{stroke-dasharray:5 12;animation:signal-flow 3.2s linear infinite}
      .signal-node{animation:node-breathe 4.8s ease-in-out infinite}
      .spatial-plane{animation:plane-drift 5.4s ease-in-out infinite alternate}
      .core-breathe{transform-origin:${CX}px ${CY}px;animation:core-breathe 6s ease-in-out infinite}
      .transition-fs{animation:fs-state 12s ease-in-out infinite}
      .transition-ss{animation:ss-state 12s ease-in-out infinite}
      .transition-sf{animation:sf-state 12s ease-in-out infinite}
      .transition-edge{stroke-dasharray:4 10;animation:transition-flow 1.6s linear infinite}
      .transition-scan{stroke-dasharray:18 12 2 12;animation:transition-flow 1.2s linear infinite}
      .rail-flight{animation:rail-flight 12s ease-in-out infinite}
      .rail-signal{animation:rail-signal 12s ease-in-out infinite}
      .rail-spatial{animation:rail-spatial 12s ease-in-out infinite}
      @keyframes flight-state{0%,23%{opacity:1;transform:translateY(0)}27%,98.5%{opacity:0;transform:translateY(-6px)}100%{opacity:1;transform:translateY(0)}}
      @keyframes signal-state{0%,33%{opacity:0;transform:scale(.98)}36%,57%{opacity:1;transform:scale(1)}61%,100%{opacity:0;transform:scale(1.015)}}
      @keyframes spatial-state{0%,66%{opacity:0;transform:translateY(7px)}69%,90%{opacity:1;transform:translateY(0)}94%,100%{opacity:0;transform:translateY(-6px)}}
      @keyframes orbit{to{transform:rotate(360deg)}}
      @keyframes orbit-reverse{to{transform:rotate(-360deg)}}
      @keyframes signal-flow{to{stroke-dashoffset:-64}}
      @keyframes node-breathe{0%,100%{opacity:.68}50%{opacity:1}}
      @keyframes plane-drift{from{transform:translateY(-2px)}to{transform:translateY(3px)}}
      @keyframes core-breathe{0%,100%{transform:scale(.97);opacity:.86}50%{transform:scale(1.04);opacity:1}}
      @keyframes fs-state{0%,22.5%,35.5%,100%{opacity:0;transform:scale(.95) rotate(-2deg)}25%{opacity:.45}27.5%,31.5%{opacity:1;transform:scale(1) rotate(0)}34.5%{opacity:.18;transform:scale(1.02)}}
      @keyframes ss-state{0%,57%,69.5%,100%{opacity:0;transform:translateY(-7px)}59.5%{opacity:.4}62%,65.5%{opacity:1;transform:translateY(0)}68.5%{opacity:.18;transform:translateY(5px)}}
      @keyframes sf-state{0%,90%,100%{opacity:0;transform:scale(1.05)}92%{opacity:.42}94%,97.5%{opacity:1;transform:scale(1)}99.5%{opacity:.2;transform:scale(.97)}}
      @keyframes transition-flow{to{stroke-dashoffset:-52}}
      @keyframes rail-flight{0%,24%,100%{opacity:1}29%,93%{opacity:.2}97%{opacity:.48}}
      @keyframes rail-signal{0%,28%,67%,100%{opacity:.2}33%,58%{opacity:1}63%{opacity:.48}}
      @keyframes rail-spatial{0%,61%,99%,100%{opacity:.2}67%,91%{opacity:1}96%{opacity:.48}}
    `
    : `
      .mode-flight{opacity:1}.mode-signal,.mode-spatial{opacity:0}
      .transition{opacity:0}
      .rail-flight{opacity:1}.rail-signal,.rail-spatial{opacity:.18}
    `;

  return `<style>
    text{font-family:${FONT_SANS};fill:${theme.text}}
    .mono{font-family:${FONT_MONO}}
    .muted{fill:${theme.muted}}
    .micro{font-size:10px;letter-spacing:1.8px;font-weight:650}
    .tiny{font-size:9px;letter-spacing:1.05px}
    .label{font-size:12px;letter-spacing:1.25px;font-weight:650}
    .title{font-size:63px;letter-spacing:-3.9px;font-weight:560}
    .subtitle{font-size:16px;letter-spacing:-.2px}
    .mode{transform-box:view-box;transform-origin:center;will-change:opacity,transform}
    .transition{transform-box:view-box;transform-origin:${CX}px ${CY}px;will-change:opacity,transform}
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
    text(58, 160, 'Hakan', { class: 'title' }),
    text(58, 246, 'Duyar', { class: 'title muted', 'font-weight': 430 }),
    text(60, 300, 'Front-end · systems · AI-assisted development', { class: 'subtitle muted' }),
    line(60, 332, 323, 332, { stroke: theme.line }),
    el('circle', { cx: 60, cy: 332, r: 3.5, fill: theme.blue }),
    text(60, 359, 'REACT / TYPESCRIPT / NODE', { class: 'mono tiny muted' }),
    text(60, 378, 'INTERFACES THAT HOLD UP UNDER REAL USE', { class: 'mono tiny muted' }),
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
  return node('g', { class: 'mode mode-flight', 'data-hero-state': 'flight', 'aria-label': 'Mode 01 Flight' }, [
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
  return node('g', { class: 'mode mode-signal', 'data-hero-state': 'signal', 'aria-label': 'Mode 02 Signal' }, [
    ...edges.map(([x1, y1, x2, y2], index) => line(x1, y1, x2, y2, {
      class: index === 1 || index === 6 || index === 4 ? 'signal-path' : '',
      stroke: index === 1 || index === 6 || index === 4 ? theme.red : theme.line,
      'stroke-width': index === 1 || index === 6 || index === 4 ? 1.5 : 1,
      opacity: .85,
    })),
    ...nodes.flatMap(([x, y, label], index) => {
      const typeScript = index === 2;
      return [
        el('circle', { class: 'signal-node', cx: x, cy: y, r: index === 7 ? 7 : 5, fill: theme.bg, stroke: index === 1 || index === 4 || index === 7 ? theme.red : theme.muted, 'stroke-width': 1.4 }),
        text(typeScript ? x : x + (x > CX ? 9 : -9), typeScript ? y - 22 : y - 11, label, { class: 'mono tiny', fill: index === 1 || index === 4 || index === 7 ? theme.red : theme.muted, 'text-anchor': typeScript ? 'middle' : x > CX ? 'start' : 'end' }),
      ];
    }),
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
    { y: 138, color: theme.violet, label: 'INTERFACE' },
    { y: 201, color: theme.blue, label: 'STATE' },
    { y: 264, color: theme.mint, label: 'SERVICES' },
    { y: 327, color: theme.amber, label: 'DELIVERY' },
  ];
  return node('g', { class: 'mode mode-spatial', 'data-hero-state': 'spatial', 'aria-label': 'Mode 03 Spatial' }, [
    ...planes.flatMap((plane, index) => [
      el('path', { class: 'spatial-plane', d: `M520 ${plane.y}L724 ${plane.y - 38}L880 ${plane.y + 5}L677 ${plane.y + 43}Z`, fill: theme.bg, 'fill-opacity': .64, stroke: plane.color, 'stroke-opacity': .78 }),
      text(545, plane.y + 14, plane.label, { class: 'mono tiny', fill: plane.color }),
      text(882, plane.y + 22, `LAYER 0${index + 1}`, { class: 'mono tiny muted', 'text-anchor': 'end' }),
    ]),
    line(CX, 102, CX, 383, { stroke: theme.line, 'stroke-dasharray': '2 9' }),
    el('circle', { cx: CX, cy: 138, r: 4, fill: theme.violet }),
    el('circle', { cx: CX, cy: 201, r: 4, fill: theme.blue }),
    el('circle', { cx: CX, cy: 264, r: 4, fill: theme.mint }),
    el('circle', { cx: CX, cy: 327, r: 4, fill: theme.amber }),
    text(846, 79, 'MODE 03', { class: 'mono micro', fill: theme.violet }),
    text(846, 98, 'SPATIAL', { class: 'label' }),
    text(846, 118, 'LAYERS COMPOSED', { class: 'mono tiny muted' }),
    text(468, 378, 'ARCHITECTURE / RESOLVED', { class: 'mono tiny', fill: theme.violet }),
  ]);
}

function acquisitionBracket(x: number, y: number, color: string): string {
  return el('path', {
    d: `M${x - 10} ${y - 4}V${y - 10}H${x - 4}M${x + 4} ${y - 10}H${x + 10}V${y - 4}M${x + 10} ${y + 4}V${y + 10}H${x + 4}M${x - 4} ${y + 10}H${x - 10}V${y + 4}`,
    fill: 'none',
    stroke: color,
    'stroke-width': 1.2,
  });
}

function flightToSignal(theme: Theme): string {
  const acquired = [
    [574, 151], [628, 101], [795, 110], [872, 197], [830, 317], [583, 305],
  ] as const;
  const relationships = [
    [574, 151, CX, CY], [628, 101, CX, CY], [795, 110, CX, CY],
    [872, 197, CX, CY], [830, 317, CX, CY], [583, 305, CX, CY],
    [574, 151, 628, 101], [795, 110, 872, 197], [830, 317, 583, 305],
  ] as const;
  return node('g', { class: 'transition transition-fs', 'data-hero-transition': 'flight-to-signal', opacity: 0 }, [
    node('g', { fill: 'none' }, [
      el('circle', { class: 'transition-scan', cx: CX, cy: CY, r: 151, stroke: theme.blue, 'stroke-width': 1.2 }),
      el('circle', { cx: CX, cy: CY, r: 117, stroke: theme.line, 'stroke-dasharray': '2 9' }),
      ...relationships.map(([x1, y1, x2, y2], index) => line(x1, y1, x2, y2, {
        class: 'transition-edge', stroke: index < 6 ? theme.red : theme.line, 'stroke-width': index < 6 ? 1.2 : 1,
      })),
      el('path', { d: `M535 281C604 341 765 351 862 282`, stroke: theme.blue, 'stroke-dasharray': '42 16 3 12' }),
    ]),
    ...acquired.flatMap(([x, y], index) => [
      acquisitionBracket(x, y, index % 2 ? theme.red : theme.blue),
      el('circle', { cx: x, cy: y, r: 3.6, fill: index % 2 ? theme.red : theme.blue }),
    ]),
    text(468, 83, 'ACQUIRE / INTERSECTIONS', { class: 'mono tiny', fill: theme.blue }),
    text(468, 101, 'RELATIONSHIP INDEX / 06', { class: 'mono tiny muted' }),
    text(468, 363, 'ORBIT FIELD → TOPOLOGY', { class: 'mono tiny', fill: theme.red }),
  ]);
}

function signalToSpatial(theme: Theme): string {
  const lanes = [128, 192, 256, 320] as const;
  const colors = [theme.violet, theme.blue, theme.mint, theme.amber];
  return node('g', { class: 'transition transition-ss', 'data-hero-transition': 'signal-to-spatial', opacity: 0 }, [
    node('g', { fill: 'none' }, [
      ...lanes.flatMap((y, index) => {
        const color = colors[index];
        return [
          el('path', { class: 'transition-edge', d: `M${CX} ${CY}C${650 + index * 18} ${y + 18} ${770 - index * 12} ${y - 10} 878 ${y}`, stroke: color, 'stroke-width': 1.2 }),
          line(520, y, 886, y, { stroke: color, 'stroke-opacity': .62, 'stroke-dasharray': '30 12 3 12' }),
          acquisitionBracket(700, y, color ?? theme.line),
        ];
      }),
      el('path', { d: 'M510 111H527V337H510M896 111H879V337H896', stroke: theme.violet, 'stroke-width': 1.2 }),
      line(700, 96, 700, 350, { stroke: theme.line, 'stroke-dasharray': '2 9' }),
    ]),
    ...lanes.map((y, index) => el('circle', { cx: 700, cy: y, r: 3.8, fill: colors[index] })),
    text(468, 83, 'CLASSIFY / LAYER MAP', { class: 'mono tiny', fill: theme.violet }),
    text(468, 101, 'TOPOLOGY / RE-ROUTED', { class: 'mono tiny muted' }),
    text(468, 363, 'RELATIONSHIPS → STRUCTURE', { class: 'mono tiny', fill: theme.mint }),
  ]);
}

function spatialToFlight(theme: Theme): string {
  const radii = [44, 82, 126] as const;
  const spokes = Array.from({ length: 8 }, (_, index) => {
    const angle = index * Math.PI / 4;
    return line(
      CX + Math.cos(angle) * 48,
      CY + Math.sin(angle) * 48,
      CX + Math.cos(angle) * 145,
      CY + Math.sin(angle) * 145,
      { class: 'transition-edge', stroke: index % 2 ? theme.amber : theme.blue, 'stroke-opacity': .72 },
    );
  });
  return node('g', { class: 'transition transition-sf', 'data-hero-transition': 'spatial-to-flight', opacity: 0 }, [
    node('g', { fill: 'none' }, [
      ...radii.map((radius, index) => el('circle', { class: index === 2 ? 'transition-scan' : '', cx: CX, cy: CY, r: radius, stroke: index === 0 ? theme.blue : index === 1 ? theme.line : theme.amber, 'stroke-dasharray': index === 0 ? '2 8' : undefined })),
      ...spokes,
      el('path', { d: `M540 134L${CX} ${CY}L860 134M540 314L${CX} ${CY}L860 314`, stroke: theme.violet, 'stroke-opacity': .62 }),
      el('path', { d: `M555 ${CY}C610 158 790 158 845 ${CY}C790 290 610 290 555 ${CY}`, stroke: theme.blue, 'stroke-dasharray': '44 14 3 12' }),
      acquisitionBracket(CX, CY, theme.blue),
    ]),
    text(468, 83, 'ALIGN / NUCLEUS LOCK', { class: 'mono tiny', fill: theme.amber }),
    text(468, 101, 'COORDINATE SOLUTION / STABLE', { class: 'mono tiny muted' }),
    text(468, 363, 'LAYERS → ORBIT CALIBRATION', { class: 'mono tiny', fill: theme.blue }),
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
    flightToSignal(theme),
    signalToSpatial(theme),
    spatialToFlight(theme),
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
