import { FONT_MONO, FONT_SANS, el, line, node, svgDocument, text } from '../svg.js';
import type { Theme } from '../theme.js';

function sunIcon(x: number, y: number, color: string): string {
  const rays = Array.from({ length: 8 }, (_, index) => {
    const angle = index * Math.PI / 4;
    return line(
      x + Math.cos(angle) * 12,
      y + Math.sin(angle) * 12,
      x + Math.cos(angle) * 18,
      y + Math.sin(angle) * 18,
      { stroke: color, 'stroke-width': 1.8, 'stroke-linecap': 'round' },
    );
  });
  return node('g', { 'aria-hidden': 'true' }, [
    el('circle', { cx: x, cy: y, r: 7, fill: 'none', stroke: color, 'stroke-width': 1.8 }),
    ...rays,
  ]);
}

function moonIcon(x: number, y: number, color: string): string {
  return el('path', {
    d: `M${x + 8} ${y - 13}A16 16 0 1 0 ${x + 13} ${y + 8}A13 13 0 0 1 ${x + 8} ${y - 13}Z`,
    fill: 'none',
    stroke: color,
    'stroke-width': 1.8,
    'stroke-linejoin': 'round',
  });
}

export function renderThemeControl(theme: Theme, compact = false): string {
  const width = compact ? 390 : 960;
  const height = compact ? 92 : 120;
  const lightActive = theme.name === 'light';
  const activeText = theme.bg;
  const lightText = lightActive ? activeText : theme.muted;
  const darkText = lightActive ? theme.muted : activeText;
  const activeX = compact ? (lightActive ? 197 : 284) : (lightActive ? 598 : 763);

  const styles = `<style>
    text{font-family:${FONT_SANS};fill:${theme.text}}
    .mono{font-family:${FONT_MONO}}
    .label{font-size:${compact ? 13 : 20}px;font-weight:680;letter-spacing:.25px}
    .caption{font-size:${compact ? 8.5 : 12.5}px;font-weight:560;letter-spacing:.45px}
    .choice{font-size:${compact ? 10.5 : 15}px;font-weight:720;letter-spacing:${compact ? .85 : 1.4}px}
    .muted{fill:${theme.muted}}
    .light-choice{fill:${lightText}}
    .dark-choice{fill:${darkText}}
  </style>`;

  const frame = compact
    ? node('g', { 'data-audit-geometry': 'appearance-control' }, [
        el('rect', { x: 8, y: 8, width: 374, height: 76, rx: 18, fill: theme.surface, 'fill-opacity': .72, stroke: theme.line, 'stroke-width': 1.5 }),
        line(20, 68, 178, 68, { stroke: theme.lineSoft, 'stroke-width': 1.2 }),
        el('circle', { cx: 171, cy: 68, r: 3, fill: theme.blue }),
        el('rect', { x: 192, y: 14, width: 180, height: 64, rx: 32, fill: theme.bg, stroke: theme.line, 'stroke-width': 1.5 }),
        el('rect', { x: activeX, y: 19, width: 83, height: 54, rx: 27, fill: theme.blue }),
        line(282, 27, 282, 65, { stroke: theme.line, 'stroke-width': 1, 'stroke-opacity': .7 }),
        sunIcon(215, 46, lightText),
        moonIcon(300, 46, darkText),
      ])
    : node('g', { 'data-audit-geometry': 'appearance-control' }, [
        el('rect', { x: 18, y: 12, width: 924, height: 96, rx: 24, fill: theme.surface, 'fill-opacity': .72, stroke: theme.line, 'stroke-width': 1.5 }),
        line(44, 94, 536, 94, { stroke: theme.lineSoft, 'stroke-width': 1.2 }),
        el('circle', { cx: 526, cy: 94, r: 3.5, fill: theme.blue }),
        el('rect', { x: 592, y: 20, width: 336, height: 80, rx: 40, fill: theme.bg, stroke: theme.line, 'stroke-width': 1.5 }),
        el('rect', { x: activeX, y: 26, width: 159, height: 68, rx: 34, fill: theme.blue }),
        line(760, 35, 760, 85, { stroke: theme.line, 'stroke-width': 1, 'stroke-opacity': .7 }),
        sunIcon(625, 60, lightText),
        moonIcon(793, 60, darkText),
      ]);

  const labels = compact
    ? node('g', { 'data-audit-text': 'appearance-copy' }, [
        text(20, 41, 'APPEARANCE', { class: 'label' }),
        text(20, 59, 'GITHUB SETTINGS ↗', { class: 'mono caption muted' }),
        text(239, 50, 'LIGHT', { class: 'mono choice light-choice' }),
        text(325, 50, 'DARK', { class: 'mono choice dark-choice' }),
      ])
    : node('g', { 'data-audit-text': 'appearance-copy' }, [
        text(44, 57, 'GITHUB APPEARANCE', { class: 'label' }),
        text(44, 81, 'Choose light or dark · opens your GitHub setting ↗', { class: 'mono caption muted' }),
        text(651, 66, 'LIGHT', { class: 'mono choice light-choice' }),
        text(819, 66, 'DARK', { class: 'mono choice dark-choice' }),
      ]);

  return svgDocument({
    width,
    height,
    id: `theme-control${compact ? '-mobile' : ''}-${theme.name}`,
    title: 'GitHub light and dark appearance settings',
    description: 'Open GitHub Appearance settings to choose light or dark mode. Profile visuals follow that preference automatically.',
    body: [styles, frame, labels].join(''),
  });
}
