export type Attrs = Record<string, string | number | boolean | null | undefined>;

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export function esc(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ESCAPES[character] ?? character);
}

export function number(value: number): string {
  if (!Number.isFinite(value)) throw new Error(`Non-finite SVG number: ${value}`);
  return value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}

function attrs(input: Attrs): string {
  const output: string[] = [];
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === false) continue;
    output.push(`${key}="${esc(typeof value === 'number' ? number(value) : String(value))}"`);
  }
  return output.length ? ` ${output.join(' ')}` : '';
}

export function el(tag: string, input: Attrs = {}): string {
  return `<${tag}${attrs(input)}/>`;
}

export function node(tag: string, input: Attrs, children: readonly string[]): string {
  return `<${tag}${attrs(input)}>${children.join('')}</${tag}>`;
}

export function text(x: number, y: number, value: string, input: Attrs = {}): string {
  return `<text${attrs({ x, y, ...input })}>${esc(value)}</text>`;
}

export function line(x1: number, y1: number, x2: number, y2: number, input: Attrs = {}): string {
  return el('line', { x1, y1, x2, y2, ...input });
}

export function svgDocument(options: {
  width: number;
  height: number;
  id: string;
  title: string;
  description: string;
  background: string;
  body: string;
}): string {
  const titleId = `${options.id}-title`;
  const descId = `${options.id}-desc`;
  const background = el('rect', { width: options.width, height: options.height, fill: options.background });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${options.width} ${options.height}" role="img" aria-labelledby="${titleId} ${descId}"><title id="${titleId}">${esc(options.title)}</title><desc id="${descId}">${esc(options.description)}</desc>${background}${options.body}</svg>`;
}

export const FONT_SANS = "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
export const FONT_MONO = "ui-monospace,SFMono-Regular,Consolas,'Liberation Mono',monospace";
