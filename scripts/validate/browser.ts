/**
 * Headless Chrome plumbing shared by the visual QA tooling.
 *
 * The repository deliberately does not depend on a downloaded browser binary:
 * `puppeteer-core` drives whichever Chrome or Edge is already installed. That
 * keeps `npm install` small and makes CI configuration explicit rather than
 * implicit.
 */

import { existsSync } from 'node:fs';
import puppeteer, { type Browser, type Page } from 'puppeteer-core';

const CANDIDATE_PATHS = [
  process.env['CHROME_PATH'],
  process.env['PUPPETEER_EXECUTABLE_PATH'],
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter((p): p is string => typeof p === 'string' && p.length > 0);

export function findChrome(): string {
  for (const candidate of CANDIDATE_PATHS) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(
    'No Chrome/Edge binary found. Set CHROME_PATH to a Chromium-based browser executable.\n' +
      `Looked in:\n  ${CANDIDATE_PATHS.join('\n  ')}`,
  );
}

export async function launch(headless = true): Promise<Browser> {
  return puppeteer.launch({
    executablePath: findChrome(),
    headless,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--force-device-scale-factor=2',
      '--hide-scrollbars',
      '--disable-lcd-text',
    ],
  });
}

export type ColorScheme = 'dark' | 'light';

export async function newPage(
  browser: Browser,
  opts: { width: number; height: number; scheme: ColorScheme; reducedMotion?: boolean },
): Promise<Page> {
  const page = await browser.newPage();
  await page.setViewport({ width: opts.width, height: opts.height, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: opts.scheme },
    { name: 'prefers-reduced-motion', value: opts.reducedMotion ? 'reduce' : 'no-preference' },
  ]);
  return page;
}

/**
 * Freeze every CSS animation in the current document and seek it to `seconds`.
 *
 * This is what makes animation QA deterministic: instead of screenshotting
 * "roughly two seconds in" and hoping, the timeline is placed at an exact
 * offset, so the same command always produces the same pixels.
 *
 * Only works when the SVG is loaded as the top-level document — animations
 * inside an <img> live in a document the automation cannot reach, which is
 * precisely why `img-animation` is verified separately by difference instead.
 */
export async function seekAnimations(page: Page, seconds: number): Promise<number> {
  return page.evaluate((t: number) => {
    const animations = document.getAnimations();
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = t * 1000;
    }
    return animations.length;
  }, seconds);
}
