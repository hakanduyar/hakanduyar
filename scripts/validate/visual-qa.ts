/**
 * Visual QA capture.
 *
 * Produces the evidence a reviewer needs to fail the work without running it:
 * every generated asset, deterministic stillness for static output, liveness
 * for the two animated panels, and README-shaped captures at the required
 * desktop/mobile widths in both themes.
 */

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Browser } from 'puppeteer-core';
import { launch, newPage, seekAnimations } from './browser.js';
import { REPO_ROOT } from '../../src/shared/emit.js';
import { expectedAssetPaths, PANEL_IDS } from '../../src/build.js';

const OUT = resolve(REPO_ROOT, '.ai/evidence/visual');
const GENERATED = resolve(REPO_ROOT, 'assets/generated');
const THEMES = ['dark', 'light'] as const;
const ANIMATED_IDS = new Set(['identity', 'signal']);
const MOTION_IDS = ['identity', 'signal'] as const;

const WIDTHS = [
  ['desktop', 890],
  ['mobile', 360],
] as const;

function isAnimated(id: string): boolean {
  return ANIMATED_IDS.has(id);
}

function assetFile(id: string, theme: string, mode: 'animated' | 'static' = 'animated'): string {
  return mode === 'static' && isAnimated(id) ? `${id}-static-${theme}.svg` : `${id}-${theme}.svg`;
}

function generatedAsset(name: string): string {
  return `../../../assets/generated/${name}`;
}

function viewBoxSize(file: string): { width: number; height: number } {
  const svg = readFileSync(resolve(GENERATED, file), 'utf8');
  const viewBox = /viewBox="0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/.exec(svg);
  return { width: Number(viewBox?.[1] ?? 890), height: Number(viewBox?.[2] ?? 300) };
}

async function captureAssets(browser: Browser): Promise<void> {
  const files = expectedAssetPaths().map((path) => path.split('/').pop() as string);
  for (const file of files) {
    const theme = file.includes('-light.svg') ? 'light' : 'dark';
    const { width, height } = viewBoxSize(file);
    const page = await newPage(browser, { width, height, scheme: theme });
    await page.goto(pathToFileURL(resolve(GENERATED, file)).href, { waitUntil: 'load' });
    writeFileSync(resolve(OUT, `asset-${file.replace('.svg', '')}.png`), await page.screenshot({ type: 'png' }));
    await page.close();
  }
}

async function assertStillness(browser: Browser): Promise<void> {
  const files: { id: string; theme: (typeof THEMES)[number]; file: string }[] = [];
  for (const theme of THEMES) {
    for (const id of PANEL_IDS) {
      if (!isAnimated(id)) files.push({ id, theme, file: assetFile(id, theme, 'static') });
    }
    for (const id of MOTION_IDS) files.push({ id, theme, file: assetFile(id, theme, 'static') });
  }

  for (const { id, theme, file } of files) {
    const path = resolve(GENERATED, file);
    const { width, height } = viewBoxSize(file);
    const page = await newPage(browser, { width, height, scheme: theme });
    await page.goto(pathToFileURL(path).href, { waitUntil: 'load' });
    const first = (await page.screenshot({ type: 'png' })) as Buffer;
    await new Promise((resolveWait) => setTimeout(resolveWait, 1200));
    const second = (await page.screenshot({ type: 'png' })) as Buffer;
    await page.close();
    if (!first.equals(second)) {
      writeFileSync(resolve(OUT, `stillness-${id}-${theme}-a.png`), first);
      writeFileSync(resolve(OUT, `stillness-${id}-${theme}-b.png`), second);
      throw new Error(`${file} changed between captures 1.2s apart; static output is not pixel-identical`);
    }
  }
  console.log(`  stillness: ${files.length} static assets pixel-identical across 1.2s`);
}

async function assertTimelineLiveness(browser: Browser): Promise<void> {
  for (const theme of THEMES) {
    for (const id of MOTION_IDS) {
      const file = assetFile(id, theme);
      const path = resolve(GENERATED, file);
      const { width, height } = viewBoxSize(file);
      const page = await newPage(browser, { width, height, scheme: theme });
      await page.goto(pathToFileURL(path).href, { waitUntil: 'load' });
      const count = await seekAnimations(page, id === 'identity' ? 0.25 : 0.4);
      if (count === 0) throw new Error(`${file} declares no browser animations`);
      const first = (await page.screenshot({ type: 'png' })) as Buffer;
      await seekAnimations(page, id === 'identity' ? 1.25 : 3.4);
      const second = (await page.screenshot({ type: 'png' })) as Buffer;
      await page.close();
      if (first.equals(second)) {
        writeFileSync(resolve(OUT, `timeline-${id}-${theme}-a.png`), first);
        writeFileSync(resolve(OUT, `timeline-${id}-${theme}-b.png`), second);
        throw new Error(`${file} produced identical frames at its liveness timeline offsets`);
      }
    }
  }
  console.log('  timeline liveness: identity and signal differ at controlled offsets in both themes');
}

async function assertImgLiveness(browser: Browser): Promise<void> {
  for (const theme of THEMES) {
    for (const id of MOTION_IDS) {
      const file = assetFile(id, theme);
      const host = resolve(OUT, `liveness-${id}-${theme}.html`);
      writeFileSync(
        host,
        `<!doctype html><meta charset="utf-8"><body style="margin:0;background:${theme === 'dark' ? '#0d1117' : '#ffffff'}">` +
          `<img id="asset" src="${generatedAsset(file)}" width="890"></body>`,
      );
      const page = await newPage(browser, { width: 900, height: 420, scheme: theme });
      await page.goto(pathToFileURL(host).href, { waitUntil: 'load' });
      await page.waitForSelector('img#asset');
      const image = await page.$('img#asset');
      const first = (await image!.screenshot({ type: 'png' })) as Buffer;
      await new Promise((resolveWait) => setTimeout(resolveWait, id === 'identity' ? 1200 : 1800));
      const second = (await image!.screenshot({ type: 'png' })) as Buffer;
      await page.close();
      if (first.equals(second)) {
        writeFileSync(resolve(OUT, `img-liveness-${id}-${theme}-a.png`), first);
        writeFileSync(resolve(OUT, `img-liveness-${id}-${theme}-b.png`), second);
        throw new Error(`${file} did not animate when embedded through <img>`);
      }
    }
  }
  console.log('  <img> liveness: identity and signal differ when embedded as images in both themes');
}

function pictureHtml(id: string, theme: string): string {
  const asset = (name: string): string => generatedAsset(name);
  const sources = isAnimated(id)
    ? [
        `<source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="${asset(`${id}-static-dark.svg`)}">`,
        `<source media="(prefers-reduced-motion: reduce)" srcset="${asset(`${id}-static-light.svg`)}">`,
      ]
    : [];
  sources.push(`<source media="(prefers-color-scheme: dark)" srcset="${asset(`${id}-${theme}.svg`)}">`);
  return `<picture>${sources.join('')}<img src="${asset(`${id}-${theme}.svg`)}" width="890" ` +
    `style="display:block;width:100%;max-width:100%;margin-bottom:16px"></picture>`;
}

async function assertReducedMotionSelection(browser: Browser): Promise<void> {
  for (const theme of THEMES) {
    const host = resolve(OUT, `reduced-motion-${theme}.html`);
    writeFileSync(
      host,
      `<!doctype html><meta charset="utf-8">${MOTION_IDS.map((id) => pictureHtml(id, theme)).join('')}`,
    );
    const page = await newPage(browser, { width: 900, height: 420, scheme: theme, reducedMotion: true });
    await page.goto(pathToFileURL(host).href, { waitUntil: 'load' });
    const sources = await page.evaluate(() =>
      [...document.querySelectorAll('img')].map((img) => img.currentSrc),
    );
    await page.close();
    for (const id of MOTION_IDS) {
      if (!sources.some((source) => source.includes(`${id}-static-${theme}.svg`))) {
        throw new Error(`reduced-motion page selected an animated or wrong-theme source for ${id} in ${theme}`);
      }
    }
  }
  console.log('  reduced motion: identity and signal select static theme variants');
}

async function captureReadmePage(browser: Browser): Promise<void> {
  for (const theme of THEMES) {
    for (const [label, width] of WIDTHS) {
      const bg = theme === 'dark' ? '#0d1117' : '#ffffff';
      const html =
        `<!doctype html><meta charset="utf-8">` +
        `<body style="margin:0;background:${bg};padding:16px">` +
        `<div style="max-width:${width - 32}px;margin:0 auto">` +
        PANEL_IDS.map((id) => pictureHtml(id, theme)).join('') +
        `</div></body>`;
      const host = resolve(OUT, `page-${theme}-${label}.html`);
      writeFileSync(host, html);
      const page = await newPage(browser, { width, height: 1200, scheme: theme });
      await page.goto(pathToFileURL(host).href, { waitUntil: 'load' });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      if (overflow) throw new Error(`Horizontal overflow at ${label} width (${width}px) in ${theme} theme`);
      writeFileSync(
        resolve(OUT, `page-${theme}-${label}.png`),
        await page.screenshot({ type: 'png', fullPage: true }),
      );
      await page.close();
    }
  }
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const browser = await launch();
  try {
    console.log('[visual-qa] capturing assets...');
    await captureAssets(browser);
    console.log('[visual-qa] rendering README pages at 890px and 360px...');
    await captureReadmePage(browser);
    await assertReducedMotionSelection(browser);
    console.log('[visual-qa] asserting static stillness...');
    await assertStillness(browser);
    console.log('[visual-qa] asserting animation liveness...');
    await assertTimelineLiveness(browser);
    await assertImgLiveness(browser);
    console.log(`\n[visual-qa] evidence written to ${OUT}`);
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error('[visual-qa] FAILED:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
