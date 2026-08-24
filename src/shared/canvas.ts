/**
 * The drawing surface every asset is built on.
 *
 * One responsibility beyond emitting markup: **the text manifest.** All copy is
 * converted to vector outlines, which makes it invisible to grep — exactly
 * where the content lint (banned lexicon, Turkish characters, unmeasured
 * numbers) matters most. `Canvas` solves that by recording every string as a
 * side effect of drawing it, so the manifest cannot drift from what is actually
 * on the canvas. There is no way to draw text without registering it.
 *
 * V3 restores a constrained animation register. Scenes can opt into one of
 * three named effects, while a static build still has no path to CSS output.
 *
 * The `decorative` flag went with it. It existed so a string could be drawn
 * below the information floor when the README repeated it verbatim in Markdown;
 * v2 has no Markdown to fall back on, so every string on a panel has to carry
 * itself and there is nothing left to exempt.
 */

import { el, svgDocument, n } from './svg.js';
import { layout, anchorOffset, type Anchor, type TextOptions } from './type.js';
import type { Palette, TypeStyle } from './tokens.js';

export interface TextPlacement {
  /** Baseline origin. */
  x: number;
  y: number;
  anchor?: Anchor;
  fill: string;
}

export interface RegisteredText {
  value: string;
  size: number;
}

export type MotionMode = 'animated' | 'static';

/** The only motion primitives this renderer is permitted to emit. */
export type MotionEffect = 'identity-acquire' | 'identity-pulse' | 'signal-scan';

export interface MotionRegistration {
  effect: MotionEffect;
  /** A class selector owned by the scene that registered the effect. */
  selector: string;
}

const MOTION_EFFECTS: readonly MotionEffect[] = ['identity-acquire', 'identity-pulse', 'signal-scan'];

const MOTION_ANIMATIONS: Record<MotionEffect, string> = {
  'identity-acquire': 'identity-acquire 2.4s linear both',
  'identity-pulse': 'identity-pulse 9s linear infinite',
  'signal-scan': 'signal-scan 7s linear infinite',
};

const MOTION_KEYFRAMES: Record<MotionEffect, string> = {
  'identity-acquire':
    '@keyframes identity-acquire{0%{stroke-dashoffset:1000;opacity:0}12%{opacity:1}100%{stroke-dashoffset:0;opacity:.55}}',
  'identity-pulse':
    '@keyframes identity-pulse{0%,100%{opacity:.18;transform:translateX(0)}50%{opacity:.55;transform:translateX(12px)}}',
  'signal-scan':
    '@keyframes signal-scan{0%{opacity:.18;transform:translateX(0)}10%{opacity:.75}90%{opacity:.75}100%{opacity:.18;transform:translateX(440px)}}',
};

export interface RenderedAsset {
  id: string;
  theme: string;
  mode: MotionMode;
  svg: string;
  /** Every string drawn on the canvas, for the content lint. */
  texts: RegisteredText[];
  title: string;
  desc: string;
}

export class Canvas {
  private readonly body: string[] = [];
  private readonly motions: MotionRegistration[] = [];
  readonly texts: RegisteredText[] = [];

  constructor(
    readonly width: number,
    readonly height: number,
    readonly palette: Palette,
    readonly idPrefix: string,
    readonly mode: MotionMode = 'static',
  ) {}

  /** Append raw markup. */
  add(...markup: (string | null | undefined | false)[]): void {
    for (const item of markup) if (item) this.body.push(item);
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
    this.texts.push({ value: style.upper ? value.toUpperCase() : value, size: style.size });
    return el('path', {
      d: run.d,
      fill: place.fill,
      transform: `translate(${n(place.x + dx)} ${n(place.y)})`,
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

  /**
   * Register one of the renderer's fixed motion effects against a scene class.
   * The registration is retained for both modes; `build()` decides whether
   * the CSS is emitted, so the static variant remains a faithful no-CSS build.
   */
  registerMotion(effect: MotionEffect, selector: string): void;
  registerMotion(motion: MotionRegistration): void;
  registerMotion(effectOrMotion: MotionEffect | MotionRegistration, selector?: string): void {
    const motion: MotionRegistration =
      typeof effectOrMotion === 'string'
        ? { effect: effectOrMotion, selector: selector ?? '' }
        : effectOrMotion;
    if (!motion.selector) throw new Error(`Motion effect "${motion.effect}" needs a selector`);
    if (!this.motions.some((registered) => registered.effect === motion.effect && registered.selector === motion.selector)) {
      this.motions.push(motion);
    }
  }

  private motionStyle(mode: MotionMode): string | undefined {
    if (mode !== 'animated' || this.motions.length === 0) return undefined;

    const registrations = this.motions
      .map(({ effect, selector }) => `${selector}{animation:${MOTION_ANIMATIONS[effect]}}`)
      .join('');
    const effects = MOTION_EFFECTS
      .filter((effect) => this.motions.some((motion) => motion.effect === effect))
      .map((effect) => MOTION_KEYFRAMES[effect])
      .join('');
    return registrations + effects;
  }

  build(opts: { id: string; title: string; desc: string; mode?: MotionMode }): RenderedAsset {
    const mode = opts.mode ?? this.mode;
    // Every asset paints its own opaque ground: GitHub ships several dark
    // canvases and <picture> only distinguishes light from dark, so a
    // transparent asset would sit on an unpredictable colour.
    const ground = el('rect', { width: this.width, height: this.height, fill: this.palette.surface.base });

    const svg = svgDocument(
      {
        width: this.width,
        height: this.height,
        title: opts.title,
        desc: opts.desc,
        idPrefix: this.idPrefix,
        style: this.motionStyle(mode),
      },
      ground + this.body.join(''),
    );

    return {
      id: opts.id,
      theme: this.palette.name,
      mode,
      svg,
      texts: this.texts,
      title: opts.title,
      desc: opts.desc,
    };
  }
}
