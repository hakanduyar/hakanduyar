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
  opts: { width: number; height: number; scheme: ColorScheme },
): Promise<Page> {
  const page = await browser.newPage();
  await page.setViewport({ width: opts.width, height: opts.height, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: opts.scheme }]);
  return page;
}
