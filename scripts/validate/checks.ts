/**
 * The validation rule set.
 *
 * Each check is a pure function over the repository contents so it can be
 * called from the CLI harness (`validate-all.ts`) and from the unit tests
 * without duplicating logic.
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { REPO_ROOT } from '../../src/shared/emit.js';

export interface Finding {
  level: 'error' | 'warn';
  check: string;
  message: string;
}

/**
 * Size budgets, in bytes — the design brief's figures (section 9), not
 * comfortable multiples of them. The whole payload is meant to cost roughly
 * one medium photograph.
 */
export const SIZE_LIMITS = {
  /** Any generated asset, including the two animated panels and their fallbacks. */
  staticAsset: 45 * 1024,
  /** Everything the README pulls in, combined. */
  totalPayload: 400 * 1024,
};

/**
 * Budget that applies to a generated file.
 *
 * Motion does not get a per-name exemption: the four generated variants of
 * identity and signal must fit the same per-file ceiling as every static plate.
 */
export function sizeBudgetFor(_fileName: string): number {
  return SIZE_LIMITS.staticAsset;
}

/** Animated output is limited to the two panels with explicit motion design. */
export function isAnimatedAssetPath(relPath: string): boolean {
  return /(?:^|\/)\b(?:identity|signal)-(?:dark|light)\.svg$/.test(relPath);
}

// ---------------------------------------------------------------------------
// Markdown / README checks
// ---------------------------------------------------------------------------

/**
 * Turkish-specific characters. The profile's public copy must be English;
 * this catches a Turkish string surviving a copy edit. `ç`, `ö` and `ü` are
 * excluded on purpose — they occur in loanwords and other languages, so they
 * would produce false positives without catching anything these five miss.
 */
const TURKISH_CHARS = /[ıİğĞşŞ]/g;

// Unicode-aware boundaries: a plain \b splits at any accented letter, so
// "naïve" would otherwise match the embedded Turkish word "ve".
const TURKISH_WORDS =
  /(?<!\p{L})(ve|ile|için|bir|bu|olarak|geliştirici|merhaba|hakkımda|projelerim|teknolojiler|iletişim|ben)(?!\p{L})/giu;

export function checkEnglishOnly(text: string, label: string): Finding[] {
  const findings: Finding[] = [];
  const chars = [...new Set(text.match(TURKISH_CHARS) ?? [])];
  if (chars.length) {
    findings.push({
      level: 'error',
      check: 'language',
      message: `${label} contains Turkish-specific characters: ${chars.join(' ')}`,
    });
  }
  const words = [...new Set(text.match(TURKISH_WORDS) ?? [])].map((w) => w.toLowerCase());
  if (words.length) {
    findings.push({
      level: 'error',
      check: 'language',
      message: `${label} contains Turkish words: ${words.join(', ')}`,
    });
  }
  return findings;
}

/** Every `<img>` needs a non-empty, non-lazy alt. */
export function checkAltText(readme: string): Finding[] {
  const findings: Finding[] = [];
  const images = readme.match(/<img\b[^>]*>/g) ?? [];
  for (const tag of images) {
    const alt = /\balt="([^"]*)"/.exec(tag);
    if (!alt) {
      findings.push({ level: 'error', check: 'a11y', message: `<img> without alt: ${tag.slice(0, 90)}` });
      continue;
    }
    const value = alt[1] ?? '';
    if (value.trim().length < 12) {
      findings.push({
        level: 'error',
        check: 'a11y',
        message: `alt text too thin (${value.length} chars) on: ${tag.slice(0, 90)}`,
      });
    }
  }
  const mdImages = readme.match(/!\[([^\]]*)\]\(/g) ?? [];
  for (const md of mdImages) {
    const value = /!\[([^\]]*)\]/.exec(md)?.[1] ?? '';
    if (value.trim().length < 12) {
      findings.push({ level: 'error', check: 'a11y', message: `Markdown image alt too thin: ${md}` });
    }
  }
  return findings;
}

/**
 * Animated panels use the four-source reduced-motion/theme ladder. Static
 * panels retain the two-source dark/light pair. The exact source order is
 * checked because the first matching `<source>` wins.
 */
export function checkPictureSources(readme: string): Finding[] {
  const findings: Finding[] = [];
  const pictures = readme.match(/<picture>[\s\S]*?<\/picture>/g) ?? [];
  for (const block of pictures) {
    const firstAsset = /(?:srcset|src)="([^"\s]+)\.svg"/.exec(block)?.[1];
    const basePath = firstAsset?.replace(/-static-(?:dark|light)$|-(?:dark|light)$/, '');
    const slash = basePath?.lastIndexOf('/') ?? -1;
    const prefix = slash >= 0 ? basePath!.slice(0, slash + 1) : '';
    const base = slash >= 0 ? basePath!.slice(slash + 1) : basePath;
    const animated = base === 'identity' || base === 'signal';
    const sourcePairs = [...block.matchAll(/<source\b[^>]*media="([^"]+)"[^>]*srcset="([^"]+)"/g)].map((m) => [
      m[1] as string,
      m[2] as string,
    ] as const);
    const img = /<img\b[^>]*src="([^"]+)"/.exec(block)?.[1];
    const asset = (name: string): string => `${prefix}${name}.svg`;
    const expectedSources = animated
      ? [
          ['(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)', asset(`${base}-static-dark`)],
          ['(prefers-reduced-motion: reduce)', asset(`${base}-static-light`)],
          ['(prefers-color-scheme: dark)', asset(`${base}-dark`)],
        ]
      : [['(prefers-color-scheme: dark)', asset(`${base}-dark`)]];
    const sameSources =
      sourcePairs.length === expectedSources.length &&
      sourcePairs.every(
        ([media, srcset], index) => media === expectedSources[index]![0] && srcset === expectedSources[index]![1],
      );
    if (!sameSources || img !== asset(`${base}-light`)) {
      findings.push({
        level: 'error',
        check: 'picture',
        message:
          `${animated ? 'animated' : 'static'} panel picture has the wrong source ladder: ` +
          `${JSON.stringify({ sources: sourcePairs, img })}`,
      });
    }
  }
  return findings;
}

/** Local asset references in the README must exist on disk. */
export function checkAssetsResolve(readme: string): Finding[] {
  const findings: Finding[] = [];
  const refs = new Set<string>();
  for (const m of readme.matchAll(/(?:src|srcset)="([^"]+)"/g)) refs.add(m[1] as string);
  for (const m of readme.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) refs.add(m[1] as string);
  for (const ref of refs) {
    if (/^(https?:|mailto:|#)/.test(ref)) continue;
    if (!existsSync(resolve(REPO_ROOT, ref))) {
      findings.push({ level: 'error', check: 'assets', message: `README references a missing file: ${ref}` });
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// SVG asset checks
// ---------------------------------------------------------------------------

export function checkSvg(relPath: string): Finding[] {
  const findings: Finding[] = [];
  const absolute = resolve(REPO_ROOT, relPath);
  const svg = readFileSync(absolute, 'utf8');
  const bytes = statSync(absolute).size;

  const valid = XMLValidator.validate(svg);
  if (valid !== true) {
    findings.push({
      level: 'error',
      check: 'svg-xml',
      message: `${relPath} is not well-formed XML: ${valid.err.msg} (line ${valid.err.line})`,
    });
    return findings;
  }

  const budget = sizeBudgetFor(relPath.split('/').pop() ?? relPath);
  if (bytes > budget) {
    findings.push({
      level: 'error',
      check: 'svg-size',
      message: `${relPath} is ${(bytes / 1024).toFixed(1)} KB, over its ${budget / 1024} KB budget`,
    });
  }

  const animated = isAnimatedAssetPath(relPath);
  const panel = /(?:^|\/)(identity|signal)-(?:dark|light)\.svg$/.exec(relPath)?.[1];
  const allowedEffects = panel === 'identity' ? ['identity-acquire', 'identity-pulse'] : ['signal-scan'];
  const keyframes = [...svg.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1] as string);
  const animations = [...svg.matchAll(/animation\s*:\s*([\w-]+)/g)].map((match) => match[1] as string);

  // Static assets reject every motion primitive. Animated assets may contain
  // only the named effect set for their own panel; transitions, SMIL and
  // reduced-motion queries remain forbidden everywhere.
  const motion: [RegExp, string][] = [
    [/transition\s*:/, 'a CSS transition property'],
    [/<animate|<animateTransform|<animateMotion|<set[\s>]/, 'a SMIL animation element'],
    [/prefers-reduced-motion/, 'a prefers-reduced-motion query'],
  ];
  for (const [pattern, label] of motion) {
    if (pattern.test(svg)) {
      findings.push({
        level: 'error',
        check: 'svg-motion',
        message: `${relPath} contains ${label}; this SVG motion is not permitted`,
      });
    }
  }

  if (!animated) {
    if (keyframes.length || animations.length) {
      findings.push({
        level: 'error',
        check: 'svg-motion',
        message: `${relPath} contains CSS motion; static assets must contain no keyframes or animation declarations`,
      });
    }
  } else {
    const unknownKeyframes = keyframes.filter((name) => !allowedEffects.includes(name));
    const unknownAnimations = animations.filter((name) => !allowedEffects.includes(name));
    if (unknownKeyframes.length || unknownAnimations.length) {
      findings.push({
        level: 'error',
        check: 'svg-motion',
        message:
          `${relPath} contains uncontrolled motion names: ` +
          [...new Set([...unknownKeyframes, ...unknownAnimations])].join(', '),
      });
    }
    for (const effect of allowedEffects) {
      if (!keyframes.includes(effect) || !animations.includes(effect)) {
        findings.push({
          level: 'error',
          check: 'svg-motion',
          message: `${relPath} is animated but does not declare the controlled ${effect} effect`,
        });
      }
    }
  }

  // Nothing may reach the network: SVG images cannot load external resources.
  const external = svg.match(/(?:href|xlink:href|src)="(https?:)?\/\/[^"]*"/g) ?? [];
  if (external.length) {
    findings.push({
      level: 'error',
      check: 'svg-external',
      message: `${relPath} references external resources: ${external.slice(0, 3).join(', ')}`,
    });
  }

  if (/<script/i.test(svg) || /\son\w+=/.test(svg)) {
    findings.push({ level: 'error', check: 'svg-script', message: `${relPath} contains script content` });
  }

  // Named font families do not resolve inside an SVG image; text must be paths.
  if (/font-family\s*[:=]/.test(svg)) {
    findings.push({
      level: 'error',
      check: 'svg-font',
      message: `${relPath} names a font-family, but webfonts cannot load inside an SVG image — outline the text`,
    });
  }
  if (/<text[\s>]/.test(svg)) {
    findings.push({
      level: 'error',
      check: 'svg-font',
      message: `${relPath} uses a <text> element; all copy must be converted to outlines`,
    });
  }

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@' });
  const doc = parser.parse(svg) as { svg?: Record<string, unknown> };
  const root = doc.svg;
  if (!root) {
    findings.push({ level: 'error', check: 'svg-root', message: `${relPath} has no <svg> root` });
    return findings;
  }
  if (!root['@viewBox']) {
    findings.push({ level: 'error', check: 'svg-root', message: `${relPath} has no viewBox — it will not scale` });
  }
  if (root['@width'] || root['@height']) {
    findings.push({
      level: 'error',
      check: 'svg-root',
      message: `${relPath} still has width/height; strip them so GitHub can scale the asset`,
    });
  }
  if (!root['@role'] || !root['@aria-labelledby']) {
    findings.push({
      level: 'error',
      check: 'svg-a11y',
      message: `${relPath} is missing role="img" / aria-labelledby`,
    });
  }
  if (!root['title']) {
    findings.push({ level: 'error', check: 'svg-a11y', message: `${relPath} has no <title>` });
  }

  findings.push(...checkEnglishOnly(svg, relPath));
  return findings;
}
