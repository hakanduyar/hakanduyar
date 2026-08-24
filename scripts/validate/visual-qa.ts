/**
 * Visual QA capture.
 *
 * Produces the evidence a reviewer needs to fail the work without running it:
 *
 *   1. Every asset, both themes, at its natural size.
 *   2. A README-shaped page at desktop and mobile widths, in both themes,
 *      proving the stack scales without horizontal overflow.
 *   3. A stillness assertion: two captures of the same asset, seconds apart,
 *      must be byte-identical.
 *
 * Point 3 replaces v1's liveness assertion, and the inversion is the point.
 * v1 had to prove the hero *did* animate inside `<img>`, because GitHub only
 * ever renders SVGs that way and the whole animated strategy rested on it. v2
 * ships nothing that moves, so the risk runs the other way: motion creeping
 * back in unnoticed. A pixel-identical recapture is what rules that out at the
 * rendered level, where a grep for `@keyframes` cannot reach.
 *
 * Output: .ai/evidence/visual/
 */

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Browser } from 'puppeteer-core';
import { launch, newPage } from './browser.js';
import { REPO_ROOT } from '../../src/shared/emit.js';
import { PANEL_IDS } from '../../src/build.js';

const OUT = resolve(REPO_ROOT, '.ai/evidence/visual');
const GENERATED = resolve(REPO_ROOT, 'assets/generated');

/**
 * Widths to prove. 890 is GitHub's profile content column; 360 is the narrow
 * end of real phones — v1 only ever checked 390 and never saw what the stack
 * did below it.
 */
const WIDTHS = [
  ['desktop', 890],
  ['mobile', 360],
] as const;

const THEMES = ['dark', 'light'] as const;

function assetFile(id: string, theme: string): string {
  return `${id}-${theme}.svg`;
}

async function captureAssets(browser: Browser): Promise<void> {
  for (const theme of THEMES) {
    for (const id of PANEL_IDS) {
      const file = assetFile(id, theme);
      const svg = readFileSync(resolve(GENERATED, file), 'utf8');
      const viewBox = /viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/.exec(svg);
      const width = Number(viewBox?.[1] ?? 890);
      const height = Number(viewBox?.[2] ?? 300);

      const page = await newPage(browser, { width, height, scheme: theme });
      await page.goto(pathToFileURL(resolve(GENERATED, file)).href, { waitUntil: 'load' });
      writeFileSync(resolve(OUT, `asset-${id}-${theme}.png`), await page.screenshot({ type: 'png' }));
      await page.close();
    }
  }
}

/**
 * Prove the assets are still. Any CSS animation, SMIL, or transition that
 * survived the rewrite would show up as a difference between two captures of
 * the same document taken seconds apart.
 */
async function assertStillness(browser: Browser): Promise<void> {
  for (const id of PANEL_IDS) {
    const file = resolve(GENERATED, assetFile(id, 'dark'));
    const page = await newPage(browser, { width: 890, height: 460, scheme: 'dark' });
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
    const first = (await page.screenshot({ type: 'png' })) as Buffer;
    await new Promise((r) => setTimeout(r, 2500));
    const second = (await page.screenshot({ type: 'png' })) as Buffer;
    await page.close();
    if (!first.equals(second)) {
      writeFileSync(resolve(OUT, `stillness-${id}-a.png`), first);
      writeFileSync(resolve(OUT, `stillness-${id}-b.png`), second);
      throw new Error(
        `${assetFile(id, 'dark')} changed between two captures 2.5s apart: it is not static. ` +
          'v2 ships no motion — find what animates and remove it.',
      );
    }
  }
  console.log(`  stillness: ${PANEL_IDS.length} panels pixel-identical across 2.5s`);
}

async function captureReadmePage(browser: Browser): Promise<void> {
  for (const theme of THEMES) {
    for (const [label, width] of WIDTHS) {
      const bg = theme === 'dark' ? '#0d1117' : '#ffffff';
      const html =
        `<!doctype html><meta charset="utf-8">` +
        `<body style="margin:0;background:${bg};padding:16px">` +
        `<div style="max-width:${width - 32}px;margin:0 auto">` +
        PANEL_IDS.map(
          (id) =>
            `<img src="../../../assets/generated/${assetFile(id, theme)}" ` +
            `style="display:block;width:100%;max-width:100%;margin-bottom:16px">`,
        ).join('') +
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
    console.log('[visual-qa] asserting stillness...');
    await assertStillness(browser);
    console.log(`\n[visual-qa] evidence written to ${OUT}`);
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error('[visual-qa] FAILED:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
