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
      .nucleus-orbit-a{transform-origin:${CX}px ${CY}px;animation:nucleus-orbit-a 12s linear infinite}
      .nucleus-orbit-b{transform-origin:${CX}px ${CY}px;animation:nucleus-orbit-b 12s linear infinite}
      .nucleus-orbit-c{transform-origin:${CX}px ${CY}px;animation:nucleus-orbit-c 12s linear infinite}
      .nucleus-event{transform-origin:${CX}px ${CY}px;animation:nucleus-event 6s ease-in-out infinite}
      .transition-fs{animation:fs-shell 12s linear infinite}
      .transition-ss{animation:ss-shell 12s linear infinite}
      .transition-sf{animation:sf-shell 12s linear infinite}
      .fs-source{transform-origin:${CX}px ${CY}px;animation:fs-source 12s ease-in-out infinite}
      .fs-scan{animation:fs-scan 12s ease-in-out infinite}
      .fs-detect-a{animation:fs-detect-a 12s ease-in-out infinite}
      .fs-detect-b{animation:fs-detect-b 12s ease-in-out infinite}
      .fs-detect-c{animation:fs-detect-c 12s ease-in-out infinite}
      .fs-extract-a{animation:fs-extract-a 12s ease-in-out infinite}
      .fs-extract-b{animation:fs-extract-b 12s ease-in-out infinite}
      .fs-extract-c{animation:fs-extract-c 12s ease-in-out infinite}
      .fs-classify{animation:fs-classify 12s ease-in-out infinite}
      .fs-relation{stroke-dasharray:5 10;animation:fs-relation 12s ease-in-out infinite}
      .fs-resolve{animation:fs-resolve 12s ease-in-out infinite}
      .fs-note-trace{animation:fs-note-trace 12s ease-in-out infinite}
      .fs-note-detect{animation:fs-note-detect 12s ease-in-out infinite}
      .fs-note-classify{animation:fs-note-classify 12s ease-in-out infinite}
      .fs-note-resolve{animation:fs-note-resolve 12s ease-in-out infinite}
      .ss-graph{animation:ss-graph 12s ease-in-out infinite}
      .ss-cluster-a{animation:ss-cluster-a 12s ease-in-out infinite}
      .ss-cluster-b{animation:ss-cluster-b 12s ease-in-out infinite}
      .ss-map{stroke-dasharray:6 11;animation:ss-map 12s ease-in-out infinite}
      .ss-align{animation:ss-align 12s ease-in-out infinite}
      .ss-plane-1{animation:ss-plane-1 12s ease-in-out infinite}
      .ss-plane-2{animation:ss-plane-2 12s ease-in-out infinite}
      .ss-plane-3{animation:ss-plane-3 12s ease-in-out infinite}
      .ss-plane-4{animation:ss-plane-4 12s ease-in-out infinite}
      .ss-note-cluster{animation:ss-note-cluster 12s ease-in-out infinite}
      .ss-note-classify{animation:ss-note-classify 12s ease-in-out infinite}
      .ss-note-resolve{animation:ss-note-resolve 12s ease-in-out infinite}
      .sf-layer-1{transform-origin:${CX}px ${CY}px;animation:sf-layer-1 12s ease-in-out infinite}
      .sf-layer-2{transform-origin:${CX}px ${CY}px;animation:sf-layer-2 12s ease-in-out infinite}
      .sf-layer-3{transform-origin:${CX}px ${CY}px;animation:sf-layer-3 12s ease-in-out infinite}
      .sf-layer-4{transform-origin:${CX}px ${CY}px;animation:sf-layer-4 12s ease-in-out infinite}
      .sf-scan{animation:sf-scan 12s ease-in-out infinite}
      .sf-coordinate{animation:sf-coordinate 12s ease-in-out infinite}
      .sf-reacquire{transform-origin:${CX}px ${CY}px;animation:sf-reacquire 12s ease-in-out infinite}
      .sf-orbit{transform-origin:${CX}px ${CY}px;animation:sf-orbit 12s ease-in-out infinite}
      .sf-note-scan{animation:sf-note-scan 12s ease-in-out infinite}
      .sf-note-resolve{animation:sf-note-resolve 12s ease-in-out infinite}
      .sf-note-calibrate{animation:sf-note-calibrate 12s ease-in-out infinite}
      .rail-flight{animation:rail-flight 12s ease-in-out infinite}
      .rail-signal{animation:rail-signal 12s ease-in-out infinite}
      .rail-spatial{animation:rail-spatial 12s ease-in-out infinite}
      @keyframes flight-state{0%,19.5%{opacity:1;transform:translateY(0)}22.5%,97.5%{opacity:0;transform:translateY(-5px)}99%{opacity:.56;transform:translateY(-2px)}100%{opacity:1;transform:translateY(0)}}
      @keyframes signal-state{0%,32.5%{opacity:0;transform:scale(.985)}35%,52.5%{opacity:1;transform:scale(1)}55%{opacity:0;transform:scale(1.012)}100%{opacity:0}}
      @keyframes spatial-state{0%,66%{opacity:0;transform:translateY(6px)}69%,85.5%{opacity:1;transform:translateY(0)}88.5%{opacity:0;transform:translateY(-5px)}100%{opacity:0}}
      @keyframes orbit{to{transform:rotate(360deg)}}
      @keyframes orbit-reverse{to{transform:rotate(-360deg)}}
      @keyframes signal-flow{to{stroke-dashoffset:-64}}
      @keyframes node-breathe{0%,100%{opacity:.72}50%{opacity:1}}
      @keyframes plane-drift{from{transform:translateY(-1px)}to{transform:translateY(2px)}}
      @keyframes core-breathe{0%,100%{transform:scale(.985);opacity:.9}50%{transform:scale(1.025);opacity:1}}
      @keyframes nucleus-orbit-a{to{transform:rotate(360deg)}}
      @keyframes nucleus-orbit-b{to{transform:rotate(-360deg)}}
      @keyframes nucleus-orbit-c{to{transform:rotate(360deg)}}
      @keyframes nucleus-event{0%,100%{transform:scale(.94);opacity:.82}18%,22%,38%,42%,70%,74%{transform:scale(1.08);opacity:1}50%{transform:scale(.98);opacity:.9}}
      @keyframes fs-shell{0%,19%,36.5%,100%{opacity:0}20.5%,35%{opacity:1}}
      @keyframes fs-source{0%,19%{opacity:0;transform:rotate(0)}20%{opacity:.82}24%{opacity:1;transform:rotate(24deg)}27%{opacity:0;transform:rotate(42deg)}100%{opacity:0}}
      @keyframes fs-scan{0%,20.5%{opacity:0;stroke-dashoffset:42}22%{opacity:1}26%{opacity:.82;stroke-dashoffset:-28}28%{opacity:0;stroke-dashoffset:-52}100%{opacity:0}}
      @keyframes fs-detect-a{0%,21.5%{opacity:0}23%,26.5%{opacity:1}28%{opacity:.2}29%,100%{opacity:0}}
      @keyframes fs-detect-b{0%,22.5%{opacity:0}24%,27.5%{opacity:1}29%{opacity:.2}30%,100%{opacity:0}}
      @keyframes fs-detect-c{0%,23.5%{opacity:0}25%,28.5%{opacity:1}30%{opacity:.2}31%,100%{opacity:0}}
      @keyframes fs-extract-a{0%,23.5%{opacity:0;transform:scale(.35)}25%,31.5%{opacity:1;transform:scale(1)}35%{opacity:.22}36.5%,100%{opacity:0}}
      @keyframes fs-extract-b{0%,24.5%{opacity:0;transform:scale(.35)}26%,32.5%{opacity:1;transform:scale(1)}35%{opacity:.22}36.5%,100%{opacity:0}}
      @keyframes fs-extract-c{0%,25.5%{opacity:0;transform:scale(.35)}27%,33.5%{opacity:1;transform:scale(1)}35%{opacity:.22}36.5%,100%{opacity:0}}
      @keyframes fs-classify{0%,26%{opacity:0;transform:translateY(3px)}28%,31.5%{opacity:1;transform:translateY(0)}34%{opacity:.25}35.5%,100%{opacity:0}}
      @keyframes fs-relation{0%,26%{opacity:0;stroke-dashoffset:58}28%{opacity:.34}30%,34%{opacity:1;stroke-dashoffset:0}36%{opacity:0;stroke-dashoffset:-22}100%{opacity:0}}
      @keyframes fs-resolve{0%,29.5%{opacity:0;transform:scale(.88)}31.5%,34.5%{opacity:1;transform:scale(1)}36.5%,100%{opacity:0;transform:scale(1.02)}}
      @keyframes fs-note-trace{0%,19%{opacity:0}20%,22.5%{opacity:1}24%,100%{opacity:0}}
      @keyframes fs-note-detect{0%,22%{opacity:0}23.5%,26.5%{opacity:1}28%,100%{opacity:0}}
      @keyframes fs-note-classify{0%,26%{opacity:0}27.5%,30.5%{opacity:1}32%,100%{opacity:0}}
      @keyframes fs-note-resolve{0%,30%{opacity:0}31.5%,35%{opacity:1}36.5%,100%{opacity:0}}
      @keyframes ss-shell{0%,52.5%,70.5%,100%{opacity:0}54%,69%{opacity:1}}
      @keyframes ss-graph{0%,52%{opacity:0}53.5%,57.5%{opacity:1}60%{opacity:.16}61%,100%{opacity:0}}
      @keyframes ss-cluster-a{0%,54.5%{opacity:0;transform:scale(.86)}56%,60.5%{opacity:1;transform:scale(1)}62%{opacity:.18}63%,100%{opacity:0}}
      @keyframes ss-cluster-b{0%,56%{opacity:0;transform:scale(.86)}57.5%,62%{opacity:1;transform:scale(1)}63.5%{opacity:.18}64.5%,100%{opacity:0}}
      @keyframes ss-map{0%,57.5%{opacity:0;stroke-dashoffset:54}59%{opacity:.5}61.5%,65.5%{opacity:1;stroke-dashoffset:0}68%{opacity:.18}69.5%,100%{opacity:0}}
      @keyframes ss-align{0%,59%{opacity:0}61%,67%{opacity:1}69.5%{opacity:.18}70.5%,100%{opacity:0}}
      @keyframes ss-plane-1{0%,60.5%{opacity:0;transform:translateX(-10px)}62%,68.5%{opacity:1;transform:translateX(0)}70.5%,100%{opacity:0}}
      @keyframes ss-plane-2{0%,61.5%{opacity:0;transform:translateX(-10px)}63%,68.5%{opacity:1;transform:translateX(0)}70.5%,100%{opacity:0}}
      @keyframes ss-plane-3{0%,62.5%{opacity:0;transform:translateX(-10px)}64%,68.5%{opacity:1;transform:translateX(0)}70.5%,100%{opacity:0}}
      @keyframes ss-plane-4{0%,63.5%{opacity:0;transform:translateX(-10px)}65%,68.5%{opacity:1;transform:translateX(0)}70.5%,100%{opacity:0}}
      @keyframes ss-note-cluster{0%,53%{opacity:0}54.5%,58%{opacity:1}59.5%,100%{opacity:0}}
      @keyframes ss-note-classify{0%,57.5%{opacity:0}59%,63%{opacity:1}64.5%,100%{opacity:0}}
      @keyframes ss-note-resolve{0%,63%{opacity:0}64.5%,69%{opacity:1}70.5%,100%{opacity:0}}
      @keyframes sf-shell{0%,85.5%{opacity:0}87%,99.8%{opacity:1}100%{opacity:0}}
      @keyframes sf-layer-1{0%,86%{opacity:0;transform:translateY(0) scaleX(1)}88%{opacity:1}93.5%{opacity:.72;transform:translateY(86px) scaleX(.42)}95%,100%{opacity:0;transform:translateY(86px) scaleX(.2)}}
      @keyframes sf-layer-2{0%,86.5%{opacity:0;transform:translateY(0) scaleX(1)}88.5%{opacity:1}93.5%{opacity:.72;transform:translateY(29px) scaleX(.42)}95%,100%{opacity:0;transform:translateY(29px) scaleX(.2)}}
      @keyframes sf-layer-3{0%,87%{opacity:0;transform:translateY(0) scaleX(1)}89%{opacity:1}93.5%{opacity:.72;transform:translateY(-29px) scaleX(.42)}95%,100%{opacity:0;transform:translateY(-29px) scaleX(.2)}}
      @keyframes sf-layer-4{0%,87.5%{opacity:0;transform:translateY(0) scaleX(1)}89.5%{opacity:1}93.5%{opacity:.72;transform:translateY(-86px) scaleX(.42)}95%,100%{opacity:0;transform:translateY(-86px) scaleX(.2)}}
      @keyframes sf-scan{0%,87%{opacity:0;stroke-dashoffset:48}88.5%,92.5%{opacity:1;stroke-dashoffset:0}94.5%,100%{opacity:0;stroke-dashoffset:-24}}
      @keyframes sf-coordinate{0%,90.5%{opacity:0}92%,95.5%{opacity:1}97.5%,100%{opacity:0}}
      @keyframes sf-reacquire{0%,92.5%{opacity:0;transform:scale(1.35)}94.5%,97.5%{opacity:1;transform:scale(1)}99.5%,100%{opacity:0;transform:scale(.98)}}
      @keyframes sf-orbit{0%,94.5%{opacity:0;transform:rotate(-22deg) scale(.78)}96%{opacity:.72}98%{opacity:1;transform:rotate(0) scale(1)}99.5%{opacity:.35}100%{opacity:0;transform:rotate(0) scale(1)}}
      @keyframes sf-note-scan{0%,86.5%{opacity:0}88%,91.5%{opacity:1}93%,100%{opacity:0}}
      @keyframes sf-note-resolve{0%,91%{opacity:0}92.5%,95.5%{opacity:1}97%,100%{opacity:0}}
      @keyframes sf-note-calibrate{0%,95%{opacity:0}96.5%,99.6%{opacity:1}100%{opacity:0}}
      @keyframes rail-flight{0%,20%,100%{opacity:1}25%,94%{opacity:.2}98%{opacity:.55}}
      @keyframes rail-signal{0%,29%,64%,100%{opacity:.2}34%,53%{opacity:1}58%{opacity:.5}}
      @keyframes rail-spatial{0%,61%,98%,100%{opacity:.2}68%,86%{opacity:1}91%{opacity:.5}}
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
    .flight-orbit,.flight-orbit-reverse,.core-breathe,.nucleus-orbit-a,.nucleus-orbit-b,.nucleus-orbit-c,.nucleus-event,.fs-source,.fs-resolve,.sf-layer-1,.sf-layer-2,.sf-layer-3,.sf-layer-4,.sf-reacquire,.sf-orbit{transform-box:view-box}
    .fs-extract-a,.fs-extract-b,.fs-extract-c,.ss-cluster-a,.ss-cluster-b{transform-box:fill-box;transform-origin:center}
    ${animation}
  </style>`;
}
function commonDefinitions(theme: Theme): string {
  const glowOpacity = theme.name === 'light' ? { blue: .32, violet: .13 } : { blue: .22, violet: .08 };
  return `<defs>
    <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${theme.blue}" stop-opacity="${glowOpacity.blue}"/>
      <stop offset=".48" stop-color="${theme.violet}" stop-opacity="${glowOpacity.violet}"/>
      <stop offset="1" stop-color="${theme.blue}" stop-opacity="0"/>
    </radialGradient>
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
  const gridOpacity = theme.name === 'light' ? .92 : .48;
  const minorOpacity = theme.name === 'light' ? .72 : .34;
  const majorOpacity = theme.name === 'light' ? .92 : .55;
  const vertical = Array.from({ length: 14 }, (_, index) =>
    line(430 + index * 38, 54, 430 + index * 38, 394, { stroke: theme.lineSoft, opacity: index % 2 ? minorOpacity : majorOpacity }),
  );
  const horizontal = Array.from({ length: 10 }, (_, index) =>
    line(404, 60 + index * 37, 942, 60 + index * 37, { stroke: theme.lineSoft, opacity: index % 2 ? minorOpacity : majorOpacity }),
  );
  return node('g', { opacity: gridOpacity }, [...vertical, ...horizontal]);
}

function nucleus(theme: Theme): string {
  const calibrationTicks = Array.from({ length: 12 }, (_, index) => {
    const angle = index * Math.PI / 6;
    const inner = 108;
    const outer = index % 3 === 0 ? 117 : 113;
    return line(
      CX + Math.cos(angle) * inner,
      CY + Math.sin(angle) * inner,
      CX + Math.cos(angle) * outer,
      CY + Math.sin(angle) * outer,
      { stroke: index % 3 === 0 ? theme.blue : theme.line, 'stroke-opacity': index % 3 === 0 ? .64 : .48 },
    );
  });

  return node('g', {
    'aria-label': 'Abstract computational atom identity nucleus',
    'data-nucleus': 'computational-atom',
  }, [
    el('circle', { cx: CX, cy: CY, r: 174, fill: 'url(#hero-glow)', opacity: .82 }),
    el('circle', { cx: CX, cy: CY, r: 108, fill: 'none', stroke: theme.line, 'stroke-width': 1, 'stroke-dasharray': '2 10', 'stroke-opacity': .72 }),
    node('g', { opacity: .82 }, calibrationTicks),
    node('g', { class: 'nucleus-orbit-a', 'data-nucleus-orbit': 'primary' }, [
      node('g', { transform: `rotate(-18 ${CX} ${CY})`, fill: 'none' }, [
        el('ellipse', { cx: CX, cy: CY, rx: 91, ry: 31, stroke: theme.blue, 'stroke-width': 1.15, 'stroke-dasharray': '36 11 2 10', 'stroke-opacity': .68 }),
        el('circle', { cx: CX + 91, cy: CY, r: 3.2, fill: theme.blue, stroke: theme.bg, 'stroke-width': 1 }),
      ]),
    ]),
    node('g', { class: 'nucleus-orbit-b', 'data-nucleus-orbit': 'secondary' }, [
      node('g', { transform: `rotate(48 ${CX} ${CY})`, fill: 'none' }, [
        el('ellipse', { cx: CX, cy: CY, rx: 76, ry: 43, stroke: theme.violet, 'stroke-width': 1, 'stroke-dasharray': '23 12 2 13', 'stroke-opacity': .5 }),
        el('circle', { cx: CX - 76, cy: CY, r: 2.7, fill: theme.violet, stroke: theme.bg, 'stroke-width': 1 }),
      ]),
    ]),
    node('g', { class: 'nucleus-orbit-c', 'data-nucleus-orbit': 'tertiary' }, [
      node('g', { transform: `rotate(112 ${CX} ${CY})`, fill: 'none' }, [
        el('ellipse', { cx: CX, cy: CY, rx: 55, ry: 22, stroke: theme.mint, 'stroke-width': 1, 'stroke-dasharray': '15 9 2 8', 'stroke-opacity': .46 }),
        el('circle', { cx: CX + 55, cy: CY, r: 2.4, fill: theme.mint, stroke: theme.bg, 'stroke-width': 1 }),
      ]),
    ]),
    el('circle', { cx: CX, cy: CY, r: 33, fill: theme.bg, 'fill-opacity': .72, stroke: theme.blue, 'stroke-width': 1.2, 'stroke-opacity': .72 }),
    el('circle', { class: 'core-breathe', cx: CX, cy: CY, r: 18, fill: theme.blueSoft, stroke: theme.blue, 'stroke-width': 1 }),
    node('g', { class: 'nucleus-event', 'data-nucleus-layer': 'signal-event' }, [
      el('circle', { cx: CX, cy: CY, r: 7, fill: theme.bg, stroke: theme.blue, 'stroke-width': 1.1 }),
      el('circle', { cx: CX, cy: CY, r: 3.6, fill: theme.blue, filter: 'url(#hero-soft-glow)' }),
    ]),
    line(CX - 29, CY, CX - 12, CY, { stroke: theme.line, 'stroke-width': 1 }),
    line(CX + 12, CY, CX + 29, CY, { stroke: theme.line, 'stroke-width': 1 }),
    line(CX, CY - 29, CX, CY - 12, { stroke: theme.line, 'stroke-width': 1 }),
    line(CX, CY + 12, CX, CY + 29, { stroke: theme.line, 'stroke-width': 1 }),
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
    [540, 130], [609, 84], [797, 104], [864, 190], [830, 322], [556, 310],
  ] as const;
  const relationships = [
    [540, 130, CX, CY], [609, 84, CX, CY], [797, 104, CX, CY],
    [864, 190, CX, CY], [830, 322, CX, CY], [556, 310, CX, CY],
    [540, 130, 609, 84], [609, 84, 797, 104], [797, 104, 864, 190],
    [864, 190, 830, 322], [830, 322, 556, 310],
  ] as const;
  const phases = ['fs-detect-a', 'fs-detect-b', 'fs-detect-c'] as const;
  const extractPhases = ['fs-extract-a', 'fs-extract-b', 'fs-extract-c'] as const;

  return node('g', {
    class: 'transition transition-fs',
    'data-hero-transition': 'flight-to-signal',
    'data-operation': 'trajectory-to-relationship',
    opacity: 0,
  }, [
    node('g', { class: 'fs-source', fill: 'none', 'data-operation-stage': 'trace' }, [
      el('ellipse', { cx: CX, cy: CY, rx: 168, ry: 82, transform: `rotate(-18 ${CX} ${CY})`, stroke: theme.blue, 'stroke-width': 1.3, 'stroke-dasharray': '46 15 3 17' }),
      el('ellipse', { cx: CX, cy: CY, rx: 145, ry: 56, transform: `rotate(54 ${CX} ${CY})`, stroke: theme.amber, 'stroke-width': 1.15, 'stroke-dasharray': '31 17 2 11' }),
      el('path', { d: 'M520 278C595 338 785 344 884 265', stroke: theme.blue, 'stroke-dasharray': '39 15 3 11', 'stroke-opacity': .72 }),
    ]),
    node('g', { fill: 'none', 'data-operation-stage': 'detect' }, [
      el('circle', { class: 'fs-scan', cx: CX, cy: CY, r: 151, stroke: theme.blue, 'stroke-width': 1.2, 'stroke-dasharray': '18 12 2 12' }),
      ...acquired.map(([x, y], index) => node('g', { class: phases[Math.floor(index / 2)] }, [
        acquisitionBracket(x, y, index % 2 ? theme.red : theme.blue),
        line(x - 4, y, x + 4, y, { stroke: index % 2 ? theme.red : theme.blue, 'stroke-width': 1 }),
        line(x, y - 4, x, y + 4, { stroke: index % 2 ? theme.red : theme.blue, 'stroke-width': 1 }),
      ])),
    ]),
    node('g', { 'data-operation-stage': 'extract' }, acquired.map(([x, y], index) => node('g', { class: extractPhases[Math.floor(index / 2)] }, [
      el('circle', { cx: x, cy: y, r: 4.2, fill: theme.bg, stroke: index % 2 ? theme.red : theme.blue, 'stroke-width': 1.4 }),
      el('circle', { cx: x, cy: y, r: 1.9, fill: index % 2 ? theme.red : theme.blue }),
    ]))),
    node('g', { class: 'fs-classify', 'data-operation-stage': 'classify' }, [
      text(754, 61, 'NODE 03 / TYPED', { class: 'mono tiny', fill: theme.red }),
      text(916, 350, 'NODE 05 / DELIVERY', { class: 'mono tiny', fill: theme.red, 'text-anchor': 'end' }),
      text(468, 350, 'NODE 06 / SYSTEM', { class: 'mono tiny', fill: theme.blue }),
    ]),
    node('g', { fill: 'none', 'data-operation-stage': 'infer' }, relationships.map(([x1, y1, x2, y2], index) => line(x1, y1, x2, y2, {
      class: 'fs-relation',
      stroke: index < 6 ? theme.red : theme.line,
      'stroke-width': index < 6 ? 1.3 : 1,
      'stroke-opacity': index < 6 ? .86 : .7,
    }))),
    node('g', { class: 'fs-resolve', fill: 'none', 'data-operation-stage': 'resolve' }, [
      el('circle', { cx: CX, cy: CY, r: 84, stroke: theme.red, 'stroke-dasharray': '3 9', 'stroke-opacity': .76 }),
      el('circle', { cx: CX, cy: CY, r: 118, stroke: theme.line, 'stroke-dasharray': '2 12', 'stroke-opacity': .72 }),
      acquisitionBracket(CX, CY, theme.red),
    ]),
    text(468, 58, 'TRACE / ORBIT ACTIVE', { class: 'mono tiny fs-note-trace', fill: theme.blue }),
    text(468, 58, 'DETECT / INTERSECTIONS', { class: 'mono tiny fs-note-detect', fill: theme.blue }),
    text(468, 58, 'CLASSIFY / EXTRACTED NODES', { class: 'mono tiny fs-note-classify', fill: theme.red }),
    text(468, 58, 'RESOLVE / SIGNAL TOPOLOGY', { class: 'mono tiny fs-note-resolve', fill: theme.red }),
    text(468, 394, 'MOTION → RELATIONSHIP MODEL', { class: 'mono tiny fs-note-resolve', fill: theme.red }),
  ]);
}

function signalToSpatial(theme: Theme): string {
  const lanes = [138, 201, 264, 327] as const;
  const colors = [theme.violet, theme.blue, theme.mint, theme.amber];
  const planeClasses = ['ss-plane-1', 'ss-plane-2', 'ss-plane-3', 'ss-plane-4'] as const;
  const planeLabels = ['INTERFACE', 'STATE', 'SERVICES', 'DELIVERY'] as const;

  return node('g', {
    class: 'transition transition-ss',
    'data-hero-transition': 'signal-to-spatial',
    'data-operation': 'relationship-to-architecture',
    opacity: 0,
  }, [
    node('g', { class: 'ss-graph', fill: 'none', 'data-operation-stage': 'relationships' }, [
      line(540, 130, 609, 84, { stroke: theme.line }),
      line(609, 84, CX, CY, { stroke: theme.red, 'stroke-width': 1.25 }),
      line(797, 104, CX, CY, { stroke: theme.line }),
      line(864, 190, CX, CY, { stroke: theme.red, 'stroke-width': 1.25 }),
      line(830, 322, CX, CY, { stroke: theme.red, 'stroke-width': 1.25 }),
      line(556, 310, CX, CY, { stroke: theme.line }),
      ...[[540, 130], [609, 84], [797, 104], [864, 190], [830, 322], [556, 310]].map(([x, y], index) =>
        el('circle', { cx: x, cy: y, r: 4, fill: theme.bg, stroke: index % 2 ? theme.red : theme.muted, 'stroke-width': 1.2 }),
      ),
    ]),
    node('g', { class: 'ss-cluster-a', fill: 'none', 'data-operation-stage': 'cluster' }, [
      el('path', { d: 'M514 101H529M514 101V155M514 155H529M654 101H639M654 101V155M654 155H639', stroke: theme.violet, 'stroke-width': 1.1 }),
      el('ellipse', { cx: 584, cy: 128, rx: 61, ry: 35, stroke: theme.violet, 'stroke-dasharray': '3 8', 'stroke-opacity': .68 }),
      text(524, 177, 'CLUSTER / INTERFACE', { class: 'mono tiny', fill: theme.violet }),
    ]),
    node('g', { class: 'ss-cluster-b', fill: 'none', 'data-operation-stage': 'classify' }, [
      el('path', { d: 'M784 174H799M784 174V341M784 341H799M884 174H869M884 174V341M884 341H869', stroke: theme.mint, 'stroke-width': 1.1 }),
      el('ellipse', { cx: 834, cy: 257, rx: 43, ry: 75, stroke: theme.mint, 'stroke-dasharray': '3 8', 'stroke-opacity': .68 }),
      text(866, 365, 'CLASS / SERVICE PATH', { class: 'mono tiny', fill: theme.mint, 'text-anchor': 'end' }),
    ]),
    node('g', { fill: 'none', 'data-operation-stage': 'reorganize' }, [
      ...lanes.map((y, index) => {
        const sourceX = index % 2 ? 834 : 584;
        const sourceY = index < 2 ? 128 : 257;
        const color = colors[index] ?? theme.line;
        return el('path', {
          class: 'ss-map',
          d: `M${sourceX} ${sourceY}C${620 + index * 26} ${sourceY} ${655 + index * 12} ${y} ${CX} ${y}`,
          stroke: color,
          'stroke-width': 1.15,
        });
      }),
    ]),
    node('g', { class: 'ss-align', fill: 'none', 'data-operation-stage': 'align' }, [
      el('path', { d: 'M507 102H525M507 102V355M507 355H525M899 102H881M899 102V355M899 355H881', stroke: theme.violet, 'stroke-width': 1.1 }),
      line(CX, 94, CX, 374, { stroke: theme.line, 'stroke-dasharray': '2 9' }),
      ...lanes.flatMap((y, index) => [
        line(520, y, 884, y, { stroke: colors[index] ?? theme.line, 'stroke-opacity': .48, 'stroke-dasharray': '28 12 3 12' }),
        acquisitionBracket(CX, y, colors[index] ?? theme.line),
      ]),
    ]),
    ...lanes.map((y, index) => node('g', {
      class: planeClasses[index] ?? planeClasses[0],
      'data-operation-stage': 'resolve-layer',
    }, [
      el('path', { d: `M520 ${y}L724 ${y - 38}L880 ${y + 5}L677 ${y + 43}Z`, fill: theme.bg, 'fill-opacity': .56, stroke: colors[index] ?? theme.line, 'stroke-opacity': .82 }),
      el('circle', { cx: CX, cy: y, r: 3.8, fill: colors[index] ?? theme.line }),
      text(545, y + 14, planeLabels[index] ?? '', { class: 'mono tiny', fill: colors[index] ?? theme.muted }),
    ])),
    text(468, 58, 'DETECT / FUNCTIONAL CLUSTERS', { class: 'mono tiny ss-note-cluster', fill: theme.red }),
    text(468, 58, 'CLASSIFY / NODE FUNCTION', { class: 'mono tiny ss-note-classify', fill: theme.violet }),
    text(468, 58, 'RESOLVE / LAYER MAP', { class: 'mono tiny ss-note-resolve', fill: theme.mint }),
    text(468, 394, 'RELATIONSHIPS → ARCHITECTURE', { class: 'mono tiny ss-note-resolve', fill: theme.mint }),
  ]);
}

function spatialToFlight(theme: Theme): string {
  const layers = [
    { y: 138, color: theme.violet, className: 'sf-layer-1' },
    { y: 201, color: theme.blue, className: 'sf-layer-2' },
    { y: 264, color: theme.mint, className: 'sf-layer-3' },
    { y: 327, color: theme.amber, className: 'sf-layer-4' },
  ];
  const spokes = Array.from({ length: 8 }, (_, index) => {
    const angle = index * Math.PI / 4;
    return line(
      CX + Math.cos(angle) * 45,
      CY + Math.sin(angle) * 45,
      CX + Math.cos(angle) * 136,
      CY + Math.sin(angle) * 136,
      { stroke: index % 2 ? theme.amber : theme.blue, 'stroke-opacity': .66, 'stroke-dasharray': '5 9' },
    );
  });

  return node('g', {
    class: 'transition transition-sf',
    'data-hero-transition': 'spatial-to-flight',
    'data-operation': 'architecture-to-calibrated-orbit',
    opacity: 0,
  }, [
    ...layers.map((layer) => node('g', { class: layer.className, 'data-operation-stage': 'converge' }, [
      el('path', { d: `M520 ${layer.y}L724 ${layer.y - 38}L880 ${layer.y + 5}L677 ${layer.y + 43}Z`, fill: theme.bg, 'fill-opacity': .42, stroke: layer.color, 'stroke-opacity': .76 }),
    ])),
    node('g', { class: 'sf-scan', fill: 'none', 'data-operation-stage': 'scan' }, [
      el('path', { d: 'M505 96H523M505 96V359M505 359H523M901 96H883M901 96V359M901 359H883', stroke: theme.violet, 'stroke-width': 1.1, 'stroke-dasharray': '18 10 2 10' }),
      line(520, CY, 884, CY, { stroke: theme.amber, 'stroke-width': 1.2, 'stroke-dasharray': '28 12 3 12' }),
      line(CX, 94, CX, 374, { stroke: theme.line, 'stroke-dasharray': '2 9' }),
    ]),
    node('g', { class: 'sf-coordinate', fill: 'none', 'data-operation-stage': 'coordinate' }, [
      el('circle', { cx: CX, cy: CY, r: 44, stroke: theme.blue, 'stroke-dasharray': '2 8' }),
      el('circle', { cx: CX, cy: CY, r: 82, stroke: theme.line, 'stroke-dasharray': '3 11' }),
      el('circle', { cx: CX, cy: CY, r: 126, stroke: theme.amber, 'stroke-dasharray': '18 12 2 12', 'stroke-opacity': .74 }),
      ...spokes,
      text(716, 119, 'Y / RESOLVED', { class: 'mono tiny', fill: theme.amber }),
      text(840, 218, 'X / RESOLVED', { class: 'mono tiny', fill: theme.blue }),
    ]),
    node('g', { class: 'sf-reacquire', fill: 'none', 'data-operation-stage': 'reacquire' }, [
      el('circle', { cx: CX, cy: CY, r: 34, stroke: theme.blue, 'stroke-width': 1.4 }),
      el('circle', { cx: CX, cy: CY, r: 16, stroke: theme.blue, 'stroke-dasharray': '3 6' }),
      acquisitionBracket(CX, CY, theme.blue),
      el('circle', { cx: CX, cy: CY, r: 3.8, fill: theme.blue, stroke: 'none' }),
    ]),
    node('g', { class: 'sf-orbit', fill: 'none', 'data-operation-stage': 'calibrate' }, [
      el('ellipse', { cx: CX, cy: CY, rx: 168, ry: 82, transform: `rotate(-18 ${CX} ${CY})`, stroke: theme.blue, 'stroke-width': 1.35, 'stroke-dasharray': '48 16 3 18' }),
      el('ellipse', { cx: CX, cy: CY, rx: 145, ry: 56, transform: `rotate(54 ${CX} ${CY})`, stroke: theme.amber, 'stroke-width': 1.15, 'stroke-dasharray': '32 18 2 12' }),
      el('circle', { cx: CX, cy: CY, r: 138, stroke: theme.line, 'stroke-dasharray': '2 16', 'stroke-opacity': .68 }),
    ]),
    text(468, 58, 'SCAN / ARCHITECTURE LAYERS', { class: 'mono tiny sf-note-scan', fill: theme.violet }),
    text(468, 58, 'RESOLVE / COORDINATE FIELD', { class: 'mono tiny sf-note-resolve', fill: theme.amber }),
    text(468, 58, 'CALIBRATE / ORBIT RESTORED', { class: 'mono tiny sf-note-calibrate', fill: theme.blue }),
    text(468, 394, 'NUCLEUS / REACQUIRED', { class: 'mono tiny sf-note-calibrate', fill: theme.blue }),
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
    animated ? signalMode(theme) : '',
    animated ? spatialMode(theme) : '',
    nucleus(theme),
    animated ? flightToSignal(theme) : '',
    animated ? signalToSpatial(theme) : '',
    animated ? spatialToFlight(theme) : '',
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
