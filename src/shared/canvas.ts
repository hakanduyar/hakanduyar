/**
 * The drawing surface every asset is built on.
 *
 * Two responsibilities beyond emitting markup:
 *
 * 1. **The text manifest.** All copy is converted to vector outlines, which
 *    makes it invisible to grep — exactly where the content lint (banned
 *    lexicon, Turkish characters, unmeasured numbers) matters most. `Canvas`
 *    solves that by recording every string as a side effect of drawing it, so
 *    the manifest cannot drift from what is actually on the canvas. There is no
 *    way to draw text without registering it.
 *
 * 2. **The animation register.** An asset declares animations against a named
 *    class; `Canvas` collects the keyframes and emits one `<style>` block. The
 *    same scene can then be built twice — once animated, once at rest — from a
 *    single definition, which is what keeps the static variant honest.
 */

import { el, g, esc, svgDocument, n, type Attrs } from './svg.js';
import { layout, anchorOffset, type Anchor, type TextOptions } from './type.js';
import type { Palette, TypeStyle } from './tokens.js';

export interface TextPlacement {
  /** Baseline origin. */
  x: number;
  y: number;
  anchor?: Anchor;
  fill: string;
  /** CSS class for animation targeting. */
  cls?: string;
  /**
   * Set when the string is decorative or duplicated verbatim in the README,
   * so the legibility check can allow it below the information-carrying floor.
   */
  decorative?: boolean;
}

export interface RegisteredText {
  value: string;
  size: number;
  decorative: boolean;
}

export interface RenderedAsset {
  id: string;
  theme: string;
  animated: boolean;
  svg: string;
  /** Every string drawn on the canvas, for the content lint. */
  texts: RegisteredText[];
  title: string;
  desc: string;
}

export class Canvas {
  private readonly body: string[] = [];
  private readonly css: string[] = [];
  private readonly keyframeNames = new Set<string>();
  readonly texts: RegisteredText[] = [];

  constructor(
    readonly width: number,
    readonly height: number,
    readonly palette: Palette,
    readonly idPrefix: string,
    /** When false, no animation CSS is emitted and the scene renders at rest. */
    readonly animated: boolean,
  ) {}

  /** Append raw markup. */
  add(...markup: (string | null | undefined | false)[]): void {
    for (const item of markup) if (item) this.body.push(item);
  }

  /** Append a `<g>` wrapper around markup. */
  addGroup(attrs: Attrs, ...children: (string | null | undefined | false)[]): void {
    this.body.push(g(attrs, ...children));
  }

  /**
   * Draw a string as outlines and register it in the manifest.
   *
   * Returns the markup rather than appending it, so callers can nest it inside
   * a group; `text()` still registers the string either way.
   */
  text(value: string, style: TypeStyle, place: TextPlacement): string {
    const options: TextOptions = {
      font: style.font,
      size: style.size,
      tracking: style.tracking,
      upper: style.upper,
    };
    const run = layout(value, options);
    const dx = anchorOffset(run.width, place.anchor ?? 'start');
    this.texts.push({
      value: style.upper ? value.toUpperCase() : value,
      size: style.size,
      decorative: place.decorative ?? false,
    });
    return el('path', {
      d: run.d,
      fill: place.fill,
      transform: `translate(${n(place.x + dx)} ${n(place.y)})`,
      class: place.cls,
    });
  }

  /** Measured width of a string in the given style, for layout planning. */
  measureText(value: string, style: TypeStyle): number {
    return layout(value, {
      font: style.font,
      size: style.size,
      tracking: style.tracking,
      upper: style.upper,
    }).width;
  }

  /** Append a CSS rule. Ignored entirely when building the static variant. */
  rule(css: string): void {
    if (this.animated) this.css.push(css);
  }

  /**
   * Register a `@keyframes` block once, by name. Repeated registration of the
   * same name is a no-op, so a shared reveal can be requested per element
   * without duplicating the rule.
   */
  keyframes(name: string, block: string): void {
    if (!this.animated || this.keyframeNames.has(name)) return;
    this.keyframeNames.add(name);
    this.css.push(block);
  }

  /** Namespaced id, so two assets on the same page cannot collide. */
  id(local: string): string {
    return `${this.idPrefix}-${local}`;
  }

  build(opts: { id: string; title: string; desc: string }): RenderedAsset {
    // Every asset paints its own opaque ground: GitHub ships several dark
    // canvases and <picture> only distinguishes light from dark, so a
    // transparent asset would sit on an unpredictable colour.
    const ground = el('rect', { width: this.width, height: this.height, fill: this.palette.surface.base });
    const style = this.css.length ? `<style>${this.css.join('')}</style>` : '';

    const svg = svgDocument(
      {
        width: this.width,
        height: this.height,
        title: opts.title,
        desc: opts.desc,
        idPrefix: this.idPrefix,
      },
      style + ground + this.body.join(''),
    );

    return {
      id: opts.id,
      theme: this.palette.name,
      animated: this.animated,
      svg,
      texts: this.texts,
      title: opts.title,
      desc: opts.desc,
    };
  }
}

/** Escape helper re-exported so scene modules need only one import. */
export { esc };
