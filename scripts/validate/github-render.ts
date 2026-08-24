/**
 * Render the README through GitHub's own Markdown pipeline and assert that
 * nothing the page depends on is sanitised away.
 *
 * A local Markdown preview proves nothing about GitHub: GitHub runs its own
 * sanitiser with its own allowlist. This check POSTs the real README to
 * `POST /markdown` (mode=gfm, repository context) and verifies the constructs
 * the design depends on survive verbatim.
 *
 * Needs network + a GitHub token, so it is `npm run qa:github`, not part of
 * the offline `npm run validate`.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from '../../src/shared/emit.js';
import { LOGIN } from '../../src/shared/config.js';
import { PANEL_IDS } from '../../src/build.js';

function token(): string {
  const fromEnv = process.env['GITHUB_TOKEN'] ?? process.env['GH_TOKEN'];
  if (fromEnv) return fromEnv;
  return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', shell: true }).trim();
}

async function main(): Promise<void> {
  const readme = readFileSync(resolve(REPO_ROOT, 'README.md'), 'utf8');

  const response = await fetch('https://api.github.com/markdown', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
      'User-Agent': 'hdu-profile-system',
    },
    body: JSON.stringify({ mode: 'gfm', text: readme, context: `${LOGIN}/${LOGIN}` }),
  });
  if (!response.ok) throw new Error(`POST /markdown responded ${response.status}`);
  const html = await response.text();

  const failures: string[] = [];
  const expect = (condition: boolean, message: string): void => {
    if (!condition) failures.push(message);
  };

  // The <picture> mechanism is the entire theming strategy.
  const pictureCount = (html.match(/<picture>/g) ?? []).length;
  const sourceCount = (readme.match(/<source /g) ?? []).length;
  expect(pictureCount === (readme.match(/<picture>/g) ?? []).length, 'a <picture> block was sanitised away');
  expect((html.match(/<source /g) ?? []).length === sourceCount, 'a <source> element was dropped');
  expect(pictureCount === PANEL_IDS.length, `expected ${PANEL_IDS.length} panels, rendered ${pictureCount}`);
  expect(html.includes('media="(prefers-color-scheme: dark)"'), 'the colour-scheme media attribute was stripped');
  expect(!html.includes('prefers-reduced-motion'), 'a v1 reduced-motion source survived into the rendered page');

  // Every generated asset referenced must survive as an <img> src or srcset.
  for (const asset of readme.match(/assets\/generated\/[\w-]+\.svg/g) ?? []) {
    expect(html.includes(asset), `${asset} missing from rendered HTML`);
  }

  // Alt text must survive (it is the accessibility carrier for every image).
  for (const [, alt] of readme.matchAll(/alt="([^"]{12,60})/g)) {
    expect(html.includes(`alt="${alt}`), `alt text truncated or dropped: "${alt!.slice(0, 40)}..."`);
  }

  // v2 carries no headings at all — each panel draws its own section mark. A
  // heading appearing here means Markdown prose crept back onto the page.
  expect(!/<h[1-6][^>]*>/.test(html), 'the rendered page contains a heading; v2 sections live inside the panels');

  // The system plates are the navigation: each must survive as a real anchor
  // wrapping its own image, or four repositories become unreachable.
  for (const id of PANEL_IDS.filter((panel) => panel.startsWith('system-'))) {
    expect(
      new RegExp(`<a[^>]+href="[^"]*"[^>]*>[\\s\\S]{0,400}?${id}-light\\.svg`).test(html),
      `${id} plate did not survive as a linked image`,
    );
  }

  // External links: every URL on the page must answer. medium.com blocks
  // non-browser user agents, so it is probed through its RSS feed instead.
  const urls = [...new Set([...readme.matchAll(/\((https?:[^)\s]+)\)|href="(https?:[^"]+)"/g)]
    .map((m) => m[1] ?? m[2])
    .filter((u): u is string => Boolean(u)))];
  for (const url of urls) {
    const probe = url.startsWith('https://medium.com/@')
      ? url.replace('https://medium.com/@', 'https://medium.com/feed/@')
      : url;
    try {
      const res = await fetch(probe, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36' },
        signal: AbortSignal.timeout(20000),
      });
      // LinkedIn answers 999 to every non-browser client (its bot wall). The
      // wall proves the host is up; the profile itself was human-verified in
      // .ai/project/01-link-verification.md and is the owner's own handle.
      const ok = res.status < 400 || (res.status === 999 && new URL(url).hostname.endsWith('linkedin.com'));
      expect(ok, `link check: ${url} answered ${res.status}`);
      console.log(`  link ${ok ? 'ok' : 'BAD'} ${res.status}  ${url}`);
    } catch (error) {
      expect(false, `link check: ${url} unreachable (${error instanceof Error ? error.message : error})`);
    }
  }

  if (failures.length) {
    for (const failure of failures) console.error(`  FAIL ${failure}`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `[qa:github] renderer preserved all ${pictureCount} <picture> blocks, ${sourceCount} sources, ` +
      `every asset reference and alt text, with no headings; ${urls.length} external links answered`,
  );
}

main().catch((error: unknown) => {
  console.error('[qa:github] FAILED:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
