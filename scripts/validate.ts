import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { XMLValidator } from 'fast-xml-parser';
import { FEATURED_SYSTEMS } from '../src/config.js';
import { REPO_ROOT } from '../src/emit.js';
import type { Telemetry } from '../src/telemetry.js';

const assets = [
  'hero-light.svg',
  'hero-dark.svg',
  'hero-static-light.svg',
  'hero-static-dark.svg',
  'systems-light.svg',
  'systems-dark.svg',
  'architecture-light.svg',
  'architecture-dark.svg',
  'signal-light.svg',
  'signal-dark.svg',
] as const;

const errors: string[] = [];
const fail = (message: string): void => {
  errors.push(message);
};

for (const asset of assets) {
  const path = resolve(REPO_ROOT, 'assets/generated', asset);
  if (!existsSync(path)) {
    fail(`missing asset: ${asset}`);
    continue;
  }
  const source = readFileSync(path, 'utf8');
  const result = XMLValidator.validate(source);
  if (result !== true) fail(`${asset}: invalid XML`);
  if (!/<svg\b[^>]*\bviewBox="0 0 \d+ \d+"/.test(source)) fail(`${asset}: missing viewBox`);
  if (!/<svg\b[^>]*\brole="img"/.test(source)) fail(`${asset}: missing image role`);
  if (!/<title\b/.test(source) || !/<desc\b/.test(source)) fail(`${asset}: missing accessible title or description`);
  if (/<svg\b[^>]*\b(?:width|height)=/.test(source)) fail(`${asset}: fixed dimensions survived optimization`);
  if (/<(?:script|foreignObject|image)\b/i.test(source)) fail(`${asset}: contains a forbidden SVG element`);
  if (/\b(?:href|src)=["']https?:/i.test(source) || /data:/i.test(source)) fail(`${asset}: contains an external resource`);
  if (/<polygon\b/i.test(source)) fail(`${asset}: rejected polygon identity returned`);
  if (/\bHDU\b/.test(source)) fail(`${asset}: rejected HDU monogram returned`);
  const limit = asset.startsWith('hero-') ? 80_000 : 70_000;
  if (statSync(path).size > limit) fail(`${asset}: exceeds ${limit.toLocaleString()} byte budget`);
}

for (const theme of ['light', 'dark'] as const) {
  const motion = readFileSync(resolve(REPO_ROOT, `assets/generated/hero-${theme}.svg`), 'utf8');
  const reduced = readFileSync(resolve(REPO_ROOT, `assets/generated/hero-static-${theme}.svg`), 'utf8');
  for (const mode of ['MODE 01', 'MODE 02', 'MODE 03']) {
    if (!motion.includes(mode)) fail(`hero-${theme}.svg: missing ${mode}`);
  }
  if (!motion.includes('@keyframes') || !motion.includes('12s')) fail(`hero-${theme}.svg: master timeline is missing`);
  if (reduced.includes('@keyframes') || reduced.includes('12s')) fail(`hero-static-${theme}.svg: reduced-motion asset still animates`);
}

const readmePath = resolve(REPO_ROOT, 'README.md');
const readme = readFileSync(readmePath, 'utf8');
if (!readme.startsWith('<!-- GENERATED FILE:')) fail('README.md: generated-file marker is missing');
if (/<(?:img|source)\b[^>]*(?:src|srcset)="https?:/i.test(readme) || /!\[[^\]]*\]\(https?:/i.test(readme)) {
  fail('README.md: remote image dependency detected');
}
for (const asset of assets) {
  if (!readme.includes(`assets/generated/${asset}`)) fail(`README.md: ${asset} is not referenced`);
}
const reducedDark = readme.indexOf('<source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)"');
const reducedLight = readme.indexOf('<source media="(prefers-reduced-motion: reduce)"');
const normalDark = readme.indexOf('<source media="(prefers-color-scheme: dark)"');
if (!(reducedDark >= 0 && reducedLight > reducedDark && normalDark > reducedLight)) {
  fail('README.md: reduced-motion and dark-mode source ordering is invalid');
}
if (/\b(?:merhaba|hakkında|iletişim|projeler|teknoloji|geliştirme)\b/i.test(readme)) {
  fail('README.md: public copy must remain English');
}
if (/\bHDU\b/.test(readme)) fail('README.md: rejected HDU monogram returned');

const telemetry = JSON.parse(readFileSync(resolve(REPO_ROOT, 'data/telemetry.json'), 'utf8')) as Telemetry;
if (telemetry.login !== 'hakanduyar') fail('telemetry: unexpected GitHub login');
if (telemetry.activity.weekly.length !== 52) fail('telemetry: expected 52 complete weekly buckets');
if (telemetry.publicRepos < 1 || telemetry.totalCommits < 1 || telemetry.activity.total < 1) {
  fail('telemetry: sanity floor failed');
}
if (telemetry.featured.length !== FEATURED_SYSTEMS.length) fail('telemetry: featured system set is incomplete');
if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00Z$/.test(telemetry.capturedAt)) fail('telemetry: capturedAt is not minute-normalized');

const combined = `${readme}\n${assets.map((asset) => readFileSync(resolve(REPO_ROOT, 'assets/generated', asset), 'utf8')).join('\n')}`;
if (/(?:ghp_|github_pat_|AKIA)[A-Za-z0-9_\-]{12,}/.test(combined)) fail('generated output: possible credential detected');

if (errors.length) {
  console.error(errors.map((error) => `[validate] ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`[validate] ${assets.length} SVG assets, README, telemetry, accessibility, budgets, and compatibility passed`);
}
