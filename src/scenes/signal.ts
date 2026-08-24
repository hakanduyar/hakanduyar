import { FONT_MONO, FONT_SANS, el, line, node, number, svgDocument, text } from '../svg.js';
import type { Telemetry } from '../telemetry.js';
import type { Theme } from '../theme.js';

const WIDTH = 960;
const HEIGHT = 380;

function weeklyPath(values: readonly number[]): string {
  if (values.length !== 52) throw new Error(`Signal needs 52 weekly values; received ${values.length}`);
  const max = Math.max(...values, 1);
  return values.map((value, index) => {
    const x = 54 + (index / 51) * 620;
    const y = 280 - (value / max) * 128;
    return `${index === 0 ? 'M' : 'L'}${number(x)} ${number(y)}`;
  }).join('');
}
export function renderSignal(theme: Theme, telemetry: Telemetry): string {
  const primary = telemetry.languages[0];
  if (!primary) throw new Error('Telemetry has no language data');
  const styles = `<style>
    text{font-family:${FONT_SANS};fill:${theme.text}}
    .mono{font-family:${FONT_MONO}}
    .muted{fill:${theme.muted}}
    .micro{font-size:9px;letter-spacing:1.8px;font-weight:600}
    .tiny{font-size:8px;letter-spacing:1.1px}
    .value{font-size:22px;font-weight:650;letter-spacing:-.8px}
    .copy{font-size:11px}
  </style>`;

  const defs = `<defs>
    <linearGradient id="signal-trace" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${theme.blue}"/><stop offset=".52" stop-color="${theme.red}"/><stop offset="1" stop-color="${theme.violet}"/></linearGradient>
    <radialGradient id="signal-field"><stop stop-color="${theme.violet}" stop-opacity=".16"/><stop offset="1" stop-color="${theme.violet}" stop-opacity="0"/></radialGradient>
  </defs>`;

  const heading = node('g', {}, [
    line(54, 52, 88, 52, { stroke: theme.red, 'stroke-width': 2 }),
    text(104, 56, 'PUBLIC SIGNAL / MEASURED', { class: 'mono micro', fill: theme.red }),
    text(54, 96, 'Activity as a trace, not a leaderboard.', { 'font-size': 25, 'font-weight': 600, 'letter-spacing': -1.1 }),
    text(54, 120, 'Fifty-two complete weeks from GitHub; no estimates and no third-party cards.', { class: 'copy muted' }),
  ]);

  const grid = node('g', { opacity: .65 }, [
    ...Array.from({ length: 5 }, (_, index) => line(54, 152 + index * 32, 674, 152 + index * 32, { stroke: theme.lineSoft })),
    ...Array.from({ length: 13 }, (_, index) => line(54 + index * 51.7, 142, 54 + index * 51.7, 294, { stroke: theme.lineSoft })),
  ]);

  const trace = node('g', { fill: 'none' }, [
    el('path', { d: weeklyPath(telemetry.activity.weekly), stroke: theme.line, 'stroke-width': 8, opacity: .12, 'stroke-linejoin': 'round' }),
    el('path', { d: weeklyPath(telemetry.activity.weekly), stroke: 'url(#signal-trace)', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    el('circle', { cx: 54 + (telemetry.activity.maxIndex / 51) * 620, cy: 152, r: 5, fill: theme.red }),
    text(54, 317, telemetry.activity.start, { class: 'mono tiny muted' }),
    text(674, 317, telemetry.activity.end, { class: 'mono tiny muted', 'text-anchor': 'end' }),
  ]);

  const fieldCx = 810;
  const fieldCy = 227;
  const languages = telemetry.languages.slice(0, 4);
  const colors = [theme.blue, theme.violet, theme.mint, theme.amber];
  const constellation = node('g', {}, [
    el('circle', { cx: fieldCx, cy: fieldCy, r: 108, fill: 'url(#signal-field)' }),
    el('circle', { cx: fieldCx, cy: fieldCy, r: 76, fill: 'none', stroke: theme.line, 'stroke-dasharray': '2 8' }),
    el('circle', { cx: fieldCx, cy: fieldCy, r: 35, fill: theme.bg, stroke: theme.blue }),
    el('circle', { cx: fieldCx, cy: fieldCy, r: 6, fill: theme.blue }),
    ...languages.flatMap((language, index) => {
      const angle = (-Math.PI / 2) + index * (Math.PI * 2 / languages.length);
      const distance = 58 + language.share * 42;
      const x = fieldCx + Math.cos(angle) * distance;
      const y = fieldCy + Math.sin(angle) * distance;
      const anchor = x < fieldCx ? 'end' : 'start';
      return [
        line(fieldCx, fieldCy, x, y, { stroke: colors[index], opacity: .68 }),
        el('circle', { cx: x, cy: y, r: 4.5, fill: colors[index] }),
        text(x + (anchor === 'start' ? 9 : -9), y + (y < fieldCy ? -7 : 14), `${language.name.toUpperCase()} ${(language.share * 100).toFixed(1)}%`, { class: 'mono tiny', fill: colors[index], 'text-anchor': anchor }),
      ];
    }),
  ]);

  const measured = node('g', {}, [
    text(54, 352, `${telemetry.activity.total}`, { class: 'value' }),
    text(113, 351, 'PUBLIC CONTRIBUTIONS / 52 COMPLETE WEEKS', { class: 'mono tiny muted' }),
    text(442, 352, `${telemetry.publicRepos}`, { class: 'value' }),
    text(481, 351, 'PUBLIC NON-FORK REPOSITORIES', { class: 'mono tiny muted' }),
    text(906, 352, `SOURCE ${telemetry.capturedAt.slice(0, 10)}`, { class: 'mono tiny muted', 'text-anchor': 'end' }),
  ]);

  return svgDocument({
    width: WIDTH,
    height: HEIGHT,
    id: `signal-${theme.name}`,
    title: 'Measured public engineering signal',
    description: `${telemetry.activity.total} public contributions across 52 complete weeks ending ${telemetry.activity.end}; ${telemetry.publicRepos} public non-fork repositories; primary public source language ${primary.name} at ${(primary.share * 100).toFixed(1)} percent.`,
    body: [styles, defs, heading, grid, trace, constellation, measured].join(''),
  });
}
