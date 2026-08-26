import { FONT_MONO, el, line, node, svgDocument, text } from '../svg.js';
import { THEMES } from '../theme.js';

const DESKTOP_WIDTH = 940;
const MOBILE_WIDTH = 390;
const HEIGHT = 64;

export function renderExpand(mobile = false): string {
  const theme = THEMES.dark;
  const width = mobile ? MOBILE_WIDTH : DESKTOP_WIDTH;
  const signalX = mobile ? [18, 30, 42, 54] as const : [24, 46, 67, 88] as const;
  const disclosureX = mobile ? 366 : 910;
  const disclosureRadius = mobile ? 12 : 14;
  const chevronHalfWidth = mobile ? 5 : 6;
  const styles = `<style>
    text{font-family:${FONT_MONO};fill:${theme.text}}
    .label{font-size:${mobile ? 11.5 : 12}px;font-weight:750;letter-spacing:${mobile ? 1.6 : 2.1}px}
  </style>`;

  const frame = el('rect', {
    x: 1,
    y: 1,
    width: width - 2,
    height: HEIGHT - 2,
    rx: 10,
    fill: theme.surface,
    stroke: theme.line,
  });

  const signal = node('g', { 'aria-hidden': 'true' }, [
    line(signalX[0], 32, signalX[3], 32, { stroke: theme.line, 'stroke-width': 1 }),
    line(signalX[0], 32, signalX[1], 32, { stroke: theme.blue, 'stroke-width': 1.5 }),
    line(signalX[1], 32, signalX[2], 32, { stroke: theme.mint, 'stroke-width': 1.5 }),
    line(signalX[2], 32, signalX[3], 32, { stroke: theme.violet, 'stroke-width': 1.5 }),
    el('circle', { cx: signalX[0], cy: 32, r: mobile ? 2.5 : 3, fill: theme.blue }),
    el('circle', { cx: signalX[1], cy: 32, r: mobile ? 2.5 : 3, fill: theme.mint }),
    el('circle', { cx: signalX[2], cy: 32, r: mobile ? 2.5 : 3, fill: theme.violet }),
    el('circle', { cx: signalX[3], cy: 32, r: mobile ? 2.5 : 3, fill: theme.red }),
  ]);

  const disclosure = node('g', { 'aria-hidden': 'true' }, [
    el('circle', { cx: disclosureX, cy: 32, r: disclosureRadius, fill: theme.bg, stroke: theme.line }),
    el('path', {
      d: `M${disclosureX - chevronHalfWidth} 29L${disclosureX} 35L${disclosureX + chevronHalfWidth} 29`,
      fill: 'none',
      stroke: theme.blue,
      'stroke-width': 1.8,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }),
    el('circle', { cx: disclosureX, cy: mobile ? 21 : 19, r: mobile ? 1.3 : 1.5, fill: theme.red }),
  ]);

  const body = [
    styles,
    frame,
    signal,
    text(width / 2, 36, 'SHOW MORE', { class: 'label', 'text-anchor': 'middle' }),
    disclosure,
  ].join('');

  return svgDocument({
    width,
    height: HEIGHT,
    id: mobile ? 'expand-profile-mobile' : 'expand-profile',
    title: 'Show more',
    description: 'Show more profile content to view systems, architecture, and signal visualizations.',
    background: theme.bg,
    body,
  });
}
