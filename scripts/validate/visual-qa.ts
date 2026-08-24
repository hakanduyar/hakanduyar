/**
 * Visual QA capture.
 *
 * Produces the evidence a reviewer needs to fail the work without running it:
 *
 *   1. Every asset, both themes, at desktop scale.
 *   2. The hero's entrance sampled at exact timeline offsets. Animations are
 *      paused and seeked rather than screenshotted "about now", so the frames
 *      are reproducible.
 *   3. A README-shaped page at desktop and mobile widths, in both themes,
 *      proving the assets scale without overflow.
 *   4. A liveness assertion that the animated hero actually animates when it is
 *      embedded through <img>, which is the only way GitHub ever renders it.
 *
 * Output: .ai/evidence/visual/
 */

import { mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PNG } from 'pngjs';
import type { Browser } from 'puppeteer-core';
import { launch, newPage, seekAnimations } from './browser.js';
import { REPO_ROOT } from '../../src/shared/emit.js';

const OUT = resolve(REPO_ROOT, '.ai/evidence/visual');
const GENERATED = resolve(REPO_ROOT, 'assets/generated');

/** Offsets through the 2400ms entrance, plus one well past it. */
const HERO_FRAMES = [0, 0.3, 0.6, 1.0, 1.5, 2.0, 2.4, 4.0];

function assetFiles(): string[] {
  return readdirSync(GENERATED)
    .filter((f) => f.endsWith('.svg'))
    .sort();
}

/** Mean absolute per-pixel difference, 0-255. */
function meanDiff(a: Buffer, b: Buffer): number {
  const pa = PNG.sync.read(a);
  const pb = PNG.sync.read(b);
  if (pa.width !== pb.width || pa.height !== pb.height) return 255;
  let total = 0;
  for (let i = 0; i < pa.data.length; i += 4) {
    total += Math.abs(pa.data[i]! - pb.data[i]!);
  }
  return total / (pa.data.length / 4);
}

async function captureAssets(browser: Browser): Promise<void> {
  for (const file of assetFiles()) {
    const theme = file.includes('-light') ? 'light' : 'dark';
    const svg = readFileSync(resolve(GENERATED, file), 'utf8');
    const viewBox = /viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/.exec(svg);
    const width = Number(viewBox?.[1] ?? 890);
    const height = Number(viewBox?.[2] ?? 300);

    const page = await newPage(browser, { width, height, scheme: theme });
    await page.goto(pathToFileURL(resolve(GENERATED, file)).href, { waitUntil: 'load' });
    // Freeze at the composed final state so the still is comparable run to run.
    await seekAnimations(page, 10);
    writeFileSync(resolve(OUT, `asset-${file.replace('.svg', '')}.png`), await page.screenshot({ type: 'png' }));
    await page.close();
  }
}

async function captureHeroTimeline(browser: Browser): Promise<void> {
  for (const theme of ['dark', 'light'] as const) {
    const file = resolve(GENERATED, `hero-${theme}.svg`);
    const page = await newPage(browser, { width: 890, height: 300, scheme: theme });
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
    for (const t of HERO_FRAMES) {
      const count = await seekAnimations(page, t);
      if (count === 0) throw new Error(`hero-${theme}.svg declares no animations`);
      writeFileSync(
        resolve(OUT, `hero-${theme}-t${String(t).replace('.', '_')}s.png`),
        await page.screenshot({ type: 'png' }),
      );
    }
    await page.close();
  }
}

/**
 * Prove the hero animates inside <img>. CSS animation in an SVG image is
 * suppressed under some conditions, so this is asserted rather than assumed —
 * it is the single behaviour the whole animated-SVG strategy rests on.
 */
async function assertImgLiveness(browser: Browser): Promise<boolean> {
  const host = resolve(OUT, 'liveness.html');
  writeFileSync(
    host,
    `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#0d1117">` +
      `<img id="h" src="../../../assets/generated/hero-dark.svg" width="890"></body>`,
  );
  const page = await newPage(browser, { width: 900, height: 320, scheme: 'dark' });
  // Two independent signals, because timing under load is not guaranteed:
  //   1. The entrance: first frame vs +1.5s. Large delta, but only if the
  //      early capture lands inside the 2.4s sequence.
  //   2. The drift loop: two frames 4.5s apart (half the 9s period, maximum
  //      index displacement). Small but permanent delta — the loop runs
  //      forever, so this signal cannot be missed by scheduling jitter.
  await page.goto(pathToFileURL(host).href, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('img#h');
  const img = await page.$('img#h');
  const early = (await img!.screenshot({ type: 'png' })) as Buffer;
  await new Promise((r) => setTimeout(r, 1500));
  const later = (await img!.screenshot({ type: 'png' })) as Buffer;
  writeFileSync(resolve(OUT, 'liveness-early.png'), early);
  writeFileSync(resolve(OUT, 'liveness-later.png'), later);
  const entranceDelta = meanDiff(early, later);

  await new Promise((r) => setTimeout(r, 1500)); // past the 2.4s entrance
  const driftA = (await img!.screenshot({ type: 'png' })) as Buffer;
  await new Promise((r) => setTimeout(r, 4500));
  const driftB = (await img!.screenshot({ type: 'png' })) as Buffer;
  const driftDelta = meanDiff(driftA, driftB);
  await page.close();

  // The drift moves a 2u line by up to 12u on an 890x300 canvas: mean deltas
  // of ~0.02-0.05 are the expected signature, hence the low threshold.
  const entranceSeen = entranceDelta > 1;
  const driftSeen = driftDelta > 0.005;
  console.log(
    `  <img> liveness: entrance delta ${entranceDelta.toFixed(3)} (seen=${entranceSeen}), ` +
      `drift delta over 4.5s ${driftDelta.toFixed(4)} (seen=${driftSeen})`,
  );
  return entranceSeen || driftSeen;
}

async function captureReadmePage(browser: Browser): Promise<void> {
  // A GitHub-shaped column: assets at 100% of a fixed content width.
  const files = [
    'hero-{t}.svg',
    'core-modules-{t}.svg',
    'system-dropspot-{t}.svg',
    'system-motion-system-{t}.svg',
    'system-stock-{t}.svg',
    'system-spark-{t}.svg',
    'telemetry-{t}.svg',
    'activity-{t}.svg',
  ];

  for (const theme of ['dark', 'light'] as const) {
    for (const [label, width] of [
      ['desktop', 890],
      ['mobile', 390],
    ] as const) {
      const bg = theme === 'dark' ? '#0d1117' : '#ffffff';
      const html =
        `<!doctype html><meta charset="utf-8">` +
        `<body style="margin:0;background:${bg};padding:16px">` +
        `<div style="max-width:${width - 32}px;margin:0 auto">` +
        files
          .map(
            (f) =>
              `<img src="../../../assets/generated/${f.replace('{t}', theme)}" ` +
              `style="display:block;width:100%;max-width:100%;margin-bottom:16px">`,
          )
          .join('') +
        `</div></body>`;
      const host = resolve(OUT, `page-${theme}-${label}.html`);
      writeFileSync(host, html);
      const page = await newPage(browser, { width, height: 1200, scheme: theme });
      await page.goto(pathToFileURL(host).href, { waitUntil: 'load' });
      // Let the hero's 2.4s entrance finish so the page still shows the
      // composed state, not a frame from the middle of the wipe.
      await new Promise((r) => setTimeout(r, 3200));
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      if (overflow) throw new Error(`Horizontal overflow at ${label} width in ${theme} theme`);
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
    console.log('[visual-qa] sampling the hero entrance...');
    await captureHeroTimeline(browser);
    console.log('[visual-qa] rendering README pages...');
    await captureReadmePage(browser);
    console.log('[visual-qa] checking <img> liveness...');
    const live = await assertImgLiveness(browser);
    if (!live) {
      throw new Error(
        'The animated hero does not animate inside <img>. GitHub only ever renders it that way, so the ' +
          'animated variant is pointless — switch the README to the static asset.',
      );
    }
    console.log(`\n[visual-qa] evidence written to ${OUT}`);
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error('[visual-qa] FAILED:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
