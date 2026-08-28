import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from '../emit.js';
import { el, esc, node, text } from '../svg.js';
import type { V5Theme } from './theme.js';

export const FONT_SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";
export const FONT_MONO = "'SFMono-Regular',Consolas,'Liberation Mono',monospace";

export interface TextOptions {
  size?: number;
  weight?: number;
  fill?: string;
  family?: 'sans' | 'mono';
  anchor?: 'start' | 'middle' | 'end';
  spacing?: number;
  opacity?: number;
}

export function txt(x: number, y: number, value: string, options: TextOptions = {}): string {
  return text(x, y, value, {
    fill: options.fill ?? '#000000',
    'font-family': options.family === 'mono' ? FONT_MONO : FONT_SANS,
    'font-size': options.size ?? 14,
    'font-weight': options.weight ?? 500,
    'text-anchor': options.anchor,
    'letter-spacing': options.spacing,
    opacity: options.opacity,
  });
}

export function multiline(
  x: number,
  y: number,
  lines: readonly string[],
  options: TextOptions & { lineHeight?: number } = {},
): string {
  const lineHeight = options.lineHeight ?? (options.size ?? 14) * 1.38;
  const tspans = lines.map((line, index) => node('tspan', { x, dy: index === 0 ? 0 : lineHeight }, [esc(line)]));
  return node('text', {
    x,
    y,
    fill: options.fill ?? '#000000',
    'font-family': options.family === 'mono' ? FONT_MONO : FONT_SANS,
    'font-size': options.size ?? 14,
    'font-weight': options.weight ?? 500,
    'text-anchor': options.anchor,
    'letter-spacing': options.spacing,
    opacity: options.opacity,
  }, tspans);
}

export function rect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke?: string,
  radius = 0,
  extra: Record<string, string | number | boolean | null | undefined> = {},
): string {
  return el('rect', { x, y, width, height, rx: radius || undefined, fill, stroke, ...extra });
}

export function rule(x1: number, y1: number, x2: number, y2: number, color: string, width = 1): string {
  return el('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': width });
}

export function circle(cx: number, cy: number, radius: number, fill: string, extra: Record<string, string | number | boolean | null | undefined> = {}): string {
  return el('circle', { cx, cy, r: radius, fill, ...extra });
}

export function path(d: string, input: Record<string, string | number | boolean | null | undefined> = {}): string {
  return el('path', { d, ...input });
}

export function monoLabel(x: number, y: number, value: string, theme: V5Theme, color = theme.faint, anchor: TextOptions['anchor'] = 'start'): string {
  return txt(x, y, value.toUpperCase(), { family: 'mono', size: 10, weight: 650, fill: color, spacing: 1.35, anchor });
}

export function sectionHeading(
  theme: V5Theme,
  index: string,
  label: string,
  titleLines: readonly string[],
  x: number,
  y: number,
  compact = false,
): string {
  return [
    monoLabel(x, y, `${index} / ${label}`, theme),
    multiline(x, y + (compact ? 36 : 42), titleLines, {
      size: compact ? 28 : 34,
      lineHeight: compact ? 31 : 37,
      weight: 650,
      fill: theme.ink,
      spacing: -1.1,
    }),
  ].join('');
}

export function blend(foreground: string, background: string, alpha: number): string {
  const parse = (value: string): [number, number, number] => {
    const hex = value.replace('#', '');
    return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16)) as [number, number, number];
  };
  const fg = parse(foreground);
  const bg = parse(background);
  const mixed = fg.map((channel, index) => Math.round(channel * alpha + (bg[index] ?? 0) * (1 - alpha)));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

type LogoName = 'react' | 'typescript' | 'nextjs' | 'nodejs' | 'postgresql' | 'docker';

const LOGO_PATHS: Record<LogoName, string> = {
  react: 'v5-exploration/prototypes/system-brief-refined/assets/react.svg',
  typescript: 'v5-exploration/prototypes/system-brief-refined/assets/typescript.svg',
  nextjs: 'v5-exploration/prototypes/system-brief-refined/assets/nextjs.svg',
  nodejs: 'v5-exploration/prototypes/system-brief-refined/assets/nodejs.svg',
  postgresql: 'v5-exploration/prototypes/system-brief-refined/assets/postgresql.svg',
  docker: 'v5-exploration/prototypes/system-brief-refined/assets/docker.svg',
};

interface LogoSource { viewBox: string; fill: string; body: string }

const LOGOS = new Map<LogoName, LogoSource>();

function loadLogo(name: LogoName): LogoSource {
  const cached = LOGOS.get(name);
  if (cached) return cached;
  const source = readFileSync(resolve(REPO_ROOT, LOGO_PATHS[name]), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const svgMatch = source.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/);
  if (!svgMatch) throw new Error(`Unable to parse ${name} logo`);
  const attributes = svgMatch[1] ?? '';
  const viewBox = attributes.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 24 24';
  const fill = attributes.match(/fill="([^"]+)"/)?.[1] ?? 'currentColor';
  const body = (svgMatch[2] ?? '').replace(/<title>[\s\S]*?<\/title>/g, '');
  const parsed = { viewBox, fill, body };
  LOGOS.set(name, parsed);
  return parsed;
}

export function logo(name: LogoName, x: number, y: number, size: number, theme: V5Theme): string {
  const source = loadLogo(name);
  const fill = source.fill === 'currentColor' ? theme.next : source.fill;
  const [, , rawWidth = '24', rawHeight = '24'] = source.viewBox.split(/\s+/);
  const viewWidth = Number.parseFloat(rawWidth);
  const viewHeight = Number.parseFloat(rawHeight);
  const scale = size / Math.max(viewWidth, viewHeight);
  return node('g', {
    transform: `translate(${x} ${y}) scale(${scale})`,
    fill,
    'aria-hidden': 'true',
  }, [source.body.replaceAll('currentColor', fill)]);
}

export function baseStyle(): string {
  return '<style>text{font-kerning:normal;text-rendering:geometricPrecision}path,line,rect,circle{shape-rendering:geometricPrecision}</style>';
}

export function plate(
  theme: V5Theme,
  x: number,
  y: number,
  size: number,
  brand: string,
): string {
  return rect(x, y, size, size, blend(brand, theme.sheet, theme.name === 'dark' ? .14 : .09), blend(brand, theme.rule, theme.name === 'dark' ? .32 : .26));
}
