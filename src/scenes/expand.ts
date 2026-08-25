import { FONT_MONO, el, line, node, svgDocument, text } from '../svg.js';
import { THEMES } from '../theme.js';

const WIDTH = 400;
const HEIGHT = 64;

export function renderExpand(): string {
  const theme = THEMES.dark;
  const styles = `<style>
    text{font-family:${FONT_MONO};fill:${theme.text}}
    .label{font-size:10.5px;font-weight:700;letter-spacing:1.35px}
  </style>`;

  const frame = el('rect', {
    x: 1,
    y: 1,
    width: WIDTH - 2,
    height: HEIGHT - 2,
    rx: 10,
    fill: theme.surface,
    stroke: theme.line,
  });

  const signal = node('g', { 'aria-hidden': 'true' }, [
    line(24, 32, 88, 32, { stroke: theme.line, 'stroke-width': 1 }),
    line(24, 32, 46, 32, { stroke: theme.blue, 'stroke-width': 1.5 }),
    line(46, 32, 67, 32, { stroke: theme.mint, 'stroke-width': 1.5 }),
    line(67, 32, 88, 32, { stroke: theme.violet, 'stroke-width': 1.5 }),
    el('circle', { cx: 24, cy: 32, r: 3, fill: theme.blue }),
    el('circle', { cx: 46, cy: 32, r: 3, fill: theme.mint }),
    el('circle', { cx: 67, cy: 32, r: 3, fill: theme.violet }),
    el('circle', { cx: 88, cy: 32, r: 3, fill: theme.red }),
  ]);

  const disclosure = node('g', { 'aria-hidden': 'true' }, [
    el('circle', { cx: 370, cy: 32, r: 14, fill: theme.bg, stroke: theme.line }),
    el('path', {
      d: 'M364 29L370 35L376 29',
      fill: 'none',
      stroke: theme.blue,
      'stroke-width': 1.8,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }),
    el('circle', { cx: 370, cy: 19, r: 1.5, fill: theme.red }),
  ]);

  const body = [
    styles,
    frame,
    signal,
    text(112, 36, 'VIEW ARCHITECTURE + SIGNAL', { class: 'label' }),
    disclosure,
  ].join('');

  return svgDocument({
    width: WIDTH,
    height: HEIGHT,
    id: 'expand-profile',
    title: 'View architecture and signal',
    description: 'Expand the profile to view the architecture and signal visualizations.',
    background: theme.bg,
    body,
  });
}
