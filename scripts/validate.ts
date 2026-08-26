import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { XMLValidator } from 'fast-xml-parser';
import { FEATURED_SYSTEMS } from '../src/config.js';
import { GENERATED_ASSET_NAMES } from '../src/assets.js';
import { REPO_ROOT } from '../src/emit.js';
import type { Telemetry } from '../src/telemetry.js';

const assets = GENERATED_ASSET_NAMES;

const errors: string[] = [];
const fail = (message: string): void => {
  errors.push(message);
};

if (assets.length !== 16) fail(`asset manifest: expected exactly 16 dark-only SVGs, found ${assets.length}`);
if (new Set(assets).size !== assets.length) fail('asset manifest: duplicate SVG name detected');
for (const disclosureAsset of ['expand-dark.svg', 'expand-mobile-dark.svg'] as const) {
  if (!assets.includes(disclosureAsset)) fail(`asset manifest: ${disclosureAsset} is missing`);
}
for (const asset of assets) {
  if (!asset.endsWith('-dark.svg') || asset.includes('-light.svg') || asset.includes('theme-control')) {
    fail(`asset manifest: unexpected non-dark public asset ${asset}`);
  }
}

for (const asset of assets) {
  const path = resolve(REPO_ROOT, 'assets/generated', asset);
  if (!existsSync(path)) {
    fail(`missing asset: ${asset}`);
    continue;
  }
  const source = readFileSync(path, 'utf8');
  const result = XMLValidator.validate(source);
  if (result !== true) fail(`${asset}: invalid XML`);
  const viewBox = source.match(/<svg\b[^>]*\bviewBox="0 0 (\d+) (\d+)"/);
  if (!viewBox) fail(`${asset}: missing viewBox`);
  const [, width, height] = viewBox ?? [];
  if (width && height) {
    const opaqueDarkRect = new RegExp(`<rect\\b(?=[^>]*\\bwidth="${width}")(?=[^>]*\\bheight="${height}")(?=[^>]*\\bfill="#0d1117")[^>]*>`);
    const optimizedDarkPath = new RegExp(`<path\\b(?=[^>]*\\bfill="#0d1117")(?=[^>]*\\bd="M0 0h${width}v${height}H0z")[^>]*>`);
    if (!opaqueDarkRect.test(source) && !optimizedDarkPath.test(source)) {
      fail(`${asset}: missing full-canvas opaque dark background`);
    }
  }
  if (!/<svg\b[^>]*\brole="img"/.test(source)) fail(`${asset}: missing image role`);
  if (!/<title\b/.test(source) || !/<desc\b/.test(source)) fail(`${asset}: missing accessible title or description`);
  if (/<svg\b[^>]*\b(?:width|height)=/.test(source)) fail(`${asset}: fixed dimensions survived optimization`);
  if (/<(?:script|foreignObject|image)\b/i.test(source)) fail(`${asset}: contains a forbidden SVG element`);
  if (/\b(?:href|src)=["']https?:/i.test(source) || /data:/i.test(source)) fail(`${asset}: contains an external resource`);
  if (/<polygon\b/i.test(source)) fail(`${asset}: rejected polygon identity returned`);
  if (/\bHDU\b/.test(source)) fail(`${asset}: rejected HDU monogram returned`);
  if (!asset.startsWith('expand-') && !asset.startsWith('hero-') && (!source.includes('data-audit-text') || !source.includes('data-audit-geometry'))) {
    fail(`${asset}: collision-audit hooks are missing`);
  }
  const limit = asset.includes('static') ? 25_000 : asset.startsWith('hero-') ? 80_000 : 35_000;
  if (statSync(path).size > limit) fail(`${asset}: exceeds ${limit.toLocaleString()} byte budget`);
}

const totalBytes = assets.reduce((sum, asset) => {
  const path = resolve(REPO_ROOT, 'assets/generated', asset);
  return sum + (existsSync(path) ? statSync(path).size : 0);
}, 0);
const totalBudget = 320_000;
if (totalBytes > totalBudget) fail(`generated profile: ${totalBytes.toLocaleString()} bytes exceeds ${totalBudget.toLocaleString()} byte total budget`);

for (const theme of ['dark'] as const) {
  const motion = readFileSync(resolve(REPO_ROOT, `assets/generated/hero-${theme}.svg`), 'utf8');
  const reduced = readFileSync(resolve(REPO_ROOT, `assets/generated/hero-static-${theme}.svg`), 'utf8');
  for (const mode of ['MODE 01', 'MODE 02', 'MODE 03']) {
    if (!motion.includes(mode)) fail(`hero-${theme}.svg: missing ${mode}`);
  }
  if (!motion.includes('@keyframes') || !motion.includes('12s')) fail(`hero-${theme}.svg: master timeline is missing`);
  for (const transition of ['flight-to-signal', 'signal-to-spatial', 'spatial-to-flight']) {
    if (!motion.includes(`data-hero-transition="${transition}"`)) fail(`hero-${theme}.svg: missing ${transition} choreography`);
  }
  for (const semantic of ['DETECT / INTERSECTIONS', 'CLASSIFY / NODE FUNCTION', 'RESOLVE / COORDINATE FIELD']) {
    if (!motion.includes(semantic)) fail(`hero-${theme}.svg: missing transition semantic ${semantic}`);
  }
  if (!motion.includes('animation:orbit-reverse 12s') || !motion.includes('animation:core-breathe 6s')) {
    fail(`hero-${theme}.svg: idle motion does not close cleanly on the 12s loop`);
  }
  if (reduced.includes('@keyframes') || reduced.includes('12s')) fail(`hero-static-${theme}.svg: reduced-motion asset still animates`);
}

for (const scene of ['systems', 'architecture', 'signal'] as const) {
  for (const theme of ['dark'] as const) {
    for (const mobile of ['', '-mobile'] as const) {
      const motionName = `${scene}${mobile}-${theme}.svg`;
      const staticName = `${scene}${mobile}-static-${theme}.svg`;
      const motion = readFileSync(resolve(REPO_ROOT, 'assets/generated', motionName), 'utf8');
      const reduced = readFileSync(resolve(REPO_ROOT, 'assets/generated', staticName), 'utf8');
      if (!motion.includes('@keyframes') || !/\b6(?:\.\d+)?s\b/.test(motion)) fail(`${motionName}: six-second interpretation loop is missing`);
      for (const phase of ['ACQUIRE', 'TRACE', 'CLASSIFY', 'RESOLVE', 'QUIET']) {
        if (!motion.includes(phase)) fail(`${motionName}: ${phase} phase notation is missing`);
      }
      if (reduced.includes('@keyframes') || /\banimation(?:-[a-z-]+)?\s*:/.test(reduced)) fail(`${staticName}: reduced-motion asset still animates`);
    }
  }
}

const readmePath = resolve(REPO_ROOT, 'README.md');
const readme = readFileSync(readmePath, 'utf8');
if (!readme.startsWith('<!-- GENERATED FILE:')) fail('README.md: generated-file marker is missing');
const readmeWithoutComments = readme.replace(/<!--[\s\S]*?-->/g, '');
const visibleReadme = readmeWithoutComments.trim();
if (/\r?\n[\t ]*\r?\n/.test(visibleReadme)) fail('README.md: blank line survived in the visible profile fragment');
if (/<(?:p|br)\b|&nbsp;|\u00a0|\u200b/i.test(visibleReadme)) {
  fail('README.md: paragraph, line-break, or invisible spacing markup detected');
}
const pictureBlocks = readmeWithoutComments.match(/<picture>[\s\S]*?<\/picture>/g) ?? [];
if (pictureBlocks.length !== 5) fail(`README.md: expected four scene pictures and one summary picture, found ${pictureBlocks.length}`);
const scenePictureBlocks = pictureBlocks.filter((block) => !block.includes('assets/generated/expand-dark.svg'));
if (scenePictureBlocks.length !== 4) fail(`README.md: expected exactly four scene picture blocks, found ${scenePictureBlocks.length}`);
const appearanceLinks = readmeWithoutComments.match(/<a\b/gi) ?? [];
if (appearanceLinks.length !== 0) fail(`README.md: expected no visible links, found ${appearanceLinks.length}`);

const topLevel = readmeWithoutComments.match(
  /^\s*(<picture>[\s\S]*?<\/picture>)\s*(<details>[\s\S]*<\/details>)\s*$/,
);
if (!topLevel) {
  fail('README.md: top-level structure must be one hero picture followed by one disclosure');
}
if ((readmeWithoutComments.match(/<\/picture><picture>/g) ?? []).length !== 2
  || !readmeWithoutComments.includes('</picture><details>')
  || !readmeWithoutComments.includes('<details><summary>')
  || !readmeWithoutComments.includes('</summary><picture>')
  || !readmeWithoutComments.includes('</picture></details>')) {
  fail('README.md: adjacent image boundaries must remain compact to avoid GitHub inline baseline gaps');
}

const detailsBlocks = readmeWithoutComments.match(/<details\b[\s\S]*?<\/details>/g) ?? [];
const summaryBlocks = readmeWithoutComments.match(/<summary\b[\s\S]*?<\/summary>/g) ?? [];
if (detailsBlocks.length !== 1) fail(`README.md: expected exactly one details disclosure, found ${detailsBlocks.length}`);
if (summaryBlocks.length !== 1) fail(`README.md: expected exactly one summary control, found ${summaryBlocks.length}`);
if (/<details\b[^>]*\bopen(?:\s|=|>)/i.test(readmeWithoutComments)) fail('README.md: disclosure must remain closed by default');

const details = detailsBlocks[0] ?? '';
const detailsStructure = details.match(
  /^<details>\s*(<summary>[\s\S]*?<\/summary>)\s*(<picture>[\s\S]*?<\/picture>)\s*(<picture>[\s\S]*?<\/picture>)\s*(<picture>[\s\S]*?<\/picture>)\s*<\/details>$/,
);
if (!detailsStructure) {
  fail('README.md: disclosure must contain only its image summary, systems, architecture, and signal pictures');
}

const summary = summaryBlocks[0] ?? '';
if ((summary.match(/<img\b/g) ?? []).length !== 1) fail('README.md: summary must contain exactly one image');
if ((summary.match(/<picture>/g) ?? []).length !== 1) fail('README.md: summary must contain exactly one picture');
if ((summary.match(/<source\b/g) ?? []).length !== 1) fail('README.md: summary must contain exactly one responsive source');
const summaryResidue = summary
  .replace(/^<summary><picture>\s*/, '')
  .replace(/\s*<\/picture><\/summary>$/, '')
  .replace(/<source\b[^>]*>/g, '')
  .replace(/<img\b[^>]*>/g, '')
  .trim();
if (summaryResidue) fail('README.md: summary contains visible native text or markup');
if (!/^<summary><picture><source media="\(max-width: 1080px\)" srcset="assets\/generated\/expand-mobile-dark\.svg"><img\b[^>]*><\/picture><\/summary>$/.test(summary)) {
  fail('README.md: summary mobile source and desktop fallback ordering is invalid');
}
if (!/<source media="\(max-width: 1080px\)" srcset="assets\/generated\/expand-mobile-dark\.svg">/.test(summary)) {
  fail('README.md: summary must use the mobile expand source');
}
if (!/<img\b[^>]*\bsrc="assets\/generated\/expand-dark\.svg"/.test(summary)) {
  fail('README.md: summary must use expand-dark.svg');
}
if (!/<img\b[^>]*\bwidth="95%"/.test(summary)) fail('README.md: summary image must reserve space for the native disclosure marker');
if (!/<img\b[^>]*\balign="middle"/.test(summary)) fail('README.md: summary image must align with the native disclosure marker');
if (!/<img\b[^>]*\balt="Show systems, architecture, and public signal"/.test(summary)) {
  fail('README.md: summary image must keep the exact English accessible label');
}

const expectedPictureOrder = ['hero', 'systems', 'architecture', 'signal'] as const;
for (const [index, block] of scenePictureBlocks.entries()) {
  if ((block.match(/<img\b/g) ?? []).length !== 1) fail(`README.md: picture block ${index + 1} must contain exactly one image`);
  const innerResidue = block
    .replace(/^<picture>\s*/, '')
    .replace(/\s*<\/picture>$/, '')
    .replace(/<source\b[^>]*>/g, '')
    .replace(/<img\b[^>]*>/g, '')
    .trim();
  if (innerResidue) fail(`README.md: picture block ${index + 1} contains visible native content`);
  if (!/<img\b[^>]*\balt="[^"]+"/.test(block)) fail(`README.md: picture block ${index + 1} is missing non-empty alt text`);
  if (!/<img\b[^>]*\balign="top"/.test(block)) fail(`README.md: picture block ${index + 1} must remove GitHub's inline baseline gap`);
  const expectedScene = expectedPictureOrder[index];
  if (expectedScene && !block.includes(`src="assets/generated/${expectedScene}-dark.svg"`)) {
    fail(`README.md: picture block ${index + 1} must render ${expectedScene}-dark.svg`);
  }
}
if (/<(?:img|source)\b[^>]*(?:src|srcset)="https?:/i.test(readme) || /!\[[^\]]*\]\(https?:/i.test(readme)) {
  fail('README.md: remote image dependency detected');
}
const publishedAssets = assets.filter((asset) => !asset.includes('-static-'));
for (const asset of publishedAssets) {
  if (!readme.includes(`assets/generated/${asset}`)) fail(`README.md: ${asset} is not referenced`);
}
if (/theme-control|prefers-color-scheme|-light\.svg/.test(readme)) {
  fail('README.md: light-theme or appearance-control residue detected');
}
if (/prefers-reduced-motion|assets\/generated\/[^"']*-static-dark\.svg/.test(readme)) {
  fail('README.md: public profile must always select animated assets');
}
for (const mobileScene of ['systems', 'architecture', 'signal']) {
  const mobileDark = `<source media="(max-width: 1080px)" srcset="assets/generated/${mobileScene}-mobile-dark.svg">`;
  const desktopDark = `<img src="assets/generated/${mobileScene}-dark.svg"`;
  const positions = [mobileDark, desktopDark].map((source) => readme.indexOf(source));
  if (positions.some((position) => position < 0) || positions[1]! <= positions[0]!) {
    fail(`README.md: ${mobileScene} responsive source ordering is invalid`);
  }
}
const normalDark = readme.indexOf('<img src="assets/generated/hero-dark.svg"');
if (normalDark < 0) fail('README.md: animated dark hero is missing');
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
  console.log(`[validate] ${assets.length} SVG assets (${totalBytes.toLocaleString()} bytes), README, telemetry, accessibility, budgets, and compatibility passed`);
}
