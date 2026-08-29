// Render the README through GitHub's own Markdown pipeline and verify
// nothing the design depends on was sanitised away. Needs network + a
// GitHub token (gh auth token, or GITHUB_TOKEN/GH_TOKEN env), so this is
// `npm run qa:github`, not part of the offline `npm run validate`.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function token() {
  const fromEnv = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (fromEnv) return fromEnv;
  return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', shell: true }).trim();
}

async function main() {
  const readme = readFileSync(resolve(ROOT, 'README.md'), 'utf8');

  const response = await fetch('https://api.github.com/markdown', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
      'User-Agent': 'hdu-profile-v6',
    },
    body: JSON.stringify({ mode: 'gfm', text: readme, context: 'hakanduyar/hakanduyar' }),
  });
  if (!response.ok) throw new Error(`POST /markdown responded ${response.status}`);
  const html = await response.text();

  const failures = [];
  const expect = (cond, msg) => { if (!cond) failures.push(msg); };

  const pictureCount = (readme.match(/<picture>/g) ?? []).length;
  expect((html.match(/<picture>/g) ?? []).length === pictureCount, 'a <picture> block was sanitised away');
  expect(html.includes('media="(prefers-color-scheme: dark)"'), 'the colour-scheme media attribute was stripped');

  for (const asset of readme.match(/assets\/v6\/[\w-]+\.svg/g) ?? []) {
    expect(html.includes(asset), `${asset} missing from rendered HTML`);
  }
  for (const [, alt] of readme.matchAll(/alt="([^"]{15,60})/g)) {
    expect(html.includes(`alt="${alt}`), `alt text truncated or dropped: "${alt.slice(0, 40)}..."`);
  }
  for (const heading of ['Hakan Duyar', 'Selected systems', 'Verified agentic delivery']) {
    expect(html.includes(heading), `heading text "${heading}" not present in rendered HTML`);
  }

  const urls = [...new Set([...readme.matchAll(/\((https?:[^)\s]+)\)|href="(https?:[^"]+)"/g)]
    .map((m) => m[1] ?? m[2])
    .filter(Boolean))];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36' },
        signal: AbortSignal.timeout(20000),
      });
      const ok = res.status < 400 || (res.status === 999 && new URL(url).hostname.endsWith('linkedin.com'));
      expect(ok, `link check: ${url} answered ${res.status}`);
      console.log(`  link ${ok ? 'ok' : 'BAD'} ${res.status}  ${url}`);
    } catch (error) {
      expect(false, `link check: ${url} unreachable (${error instanceof Error ? error.message : error})`);
    }
  }

  if (failures.length) {
    for (const f of failures) console.error('  FAIL', f);
    process.exitCode = 1;
    return;
  }
  console.log(`[qa:github] renderer preserved all ${pictureCount} <picture> blocks, every asset reference, alt text and heading; ${urls.length} external links answered`);
}

main().catch((error) => {
  console.error('[qa:github] FAILED:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
