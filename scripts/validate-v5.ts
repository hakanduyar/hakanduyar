import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { XMLValidator } from 'fast-xml-parser';
import { GENERATED_ASSET_NAMES } from '../src/assets.js';
import { REPO_ROOT } from '../src/emit.js';
import { V5_PROJECTS } from '../src/v5/content.js';

const errors: string[] = [];
const fail = (message: string): void => { errors.push(message); };

if (GENERATED_ASSET_NAMES.length !== 44) fail(`asset manifest: expected 44 V5 assets, found ${GENERATED_ASSET_NAMES.length}`);
if (new Set(GENERATED_ASSET_NAMES).size !== GENERATED_ASSET_NAMES.length) fail('asset manifest: duplicate name detected');

let totalBytes = 0;
for (const asset of GENERATED_ASSET_NAMES) {
  const absolute = resolve(REPO_ROOT, 'assets/generated', asset);
  if (!existsSync(absolute)) {
    fail(`missing asset: ${asset}`);
    continue;
  }
  const bytes = statSync(absolute).size;
  totalBytes += bytes;
  if (asset.endsWith('.svg')) {
    const source = readFileSync(absolute, 'utf8');
    if (XMLValidator.validate(source) !== true) fail(`${asset}: invalid XML`);
    if (!/<svg\b[^>]*\bviewBox="0 0 \d+ \d+"/.test(source)) fail(`${asset}: missing numeric viewBox`);
    if (!/<svg\b[^>]*\brole="img"/.test(source)) fail(`${asset}: missing role=img`);
    if (!/<title\b/.test(source) || !/<desc\b/.test(source)) fail(`${asset}: missing accessible title/description`);
    if (/<svg\b[^>]*\b(?:width|height)=/.test(source)) fail(`${asset}: fixed root dimensions survived optimization`);
    if (/<(?:script|foreignObject|image)\b/i.test(source)) fail(`${asset}: forbidden SVG element detected`);
    if (/\b(?:href|src)=["']https?:|data:/i.test(source)) fail(`${asset}: external SVG dependency detected`);
    if (/@keyframes|animation(?:-[a-z-]+)?\s*:|<animate/i.test(source)) fail(`${asset}: static/reduced-motion SVG contains animation`);
    if (bytes > 45_000) fail(`${asset}: ${bytes.toLocaleString()} bytes exceeds the 45 KB vector budget`);
  } else if (asset.endsWith('.gif')) {
    const source = readFileSync(absolute);
    if (source.subarray(0, 6).toString('ascii') !== 'GIF89a') fail(`${asset}: invalid GIF header`);
    if (bytes > 220_000) fail(`${asset}: ${bytes.toLocaleString()} bytes exceeds the 220 KB motion budget`);
    const metadata = await sharp(absolute, { animated: true }).metadata();
    if ((metadata.pages ?? 0) < 6) fail(`${asset}: expected at least six animation frames`);
    if (!metadata.pageHeight || metadata.pageHeight < 700) fail(`${asset}: invalid animation page height`);
    if (metadata.loop !== 0) fail(`${asset}: animation must loop continuously`);
    if (!metadata.delay?.every((delay) => delay > 0)) fail(`${asset}: invalid frame delay`);
  } else {
    fail(`${asset}: unsupported extension`);
  }
}
if (totalBytes > 2_000_000) fail(`generated profile: ${totalBytes.toLocaleString()} bytes exceeds the 2 MB total budget`);

const readme = readFileSync(resolve(REPO_ROOT, 'README.md'), 'utf8');
if (!readme.startsWith('<!-- GENERATED FILE:')) fail('README.md: generated-file marker is missing');
const visible = readme.replace(/<!--[\s\S]*?-->/g, '').trim();
if (/\r?\n[\t ]*\r?\n/.test(visible)) fail('README.md: visible blank line can create an image seam');
if (/<(?:p|br|h[1-6]|ul|ol|table)\b/i.test(visible)) fail('README.md: native visible prose interrupted the image composition');
if (/<details\b[^>]*\bopen(?:\s|=|>)/i.test(visible)) fail('README.md: Show more disclosure must stay closed by default');
if ((visible.match(/<details\b/g) ?? []).length !== 1) fail('README.md: expected one details disclosure');
if ((visible.match(/<summary\b/g) ?? []).length !== 1) fail('README.md: expected one summary');
const pictures = visible.match(/<picture>[\s\S]*?<\/picture>/g) ?? [];
if (pictures.length !== 9) fail(`README.md: expected nine picture blocks, found ${pictures.length}`);
for (const [index, picture] of pictures.entries()) {
  if ((picture.match(/<img\b/g) ?? []).length !== 1) fail(`README.md: picture ${index + 1} must contain one img`);
  if (!/<img\b[^>]*\balt="[^"]+"/.test(picture)) fail(`README.md: picture ${index + 1} has no alt text`);
  if (!/<img\b[^>]*\balign="(?:top|middle)"/.test(picture)) fail(`README.md: picture ${index + 1} has no alignment guard`);
}
if (/<(?:img|source)\b[^>]*(?:src|srcset)="https?:/i.test(readme)) fail('README.md: remote image dependency detected');
if (!readme.includes('<details><summary><picture>')) fail('README.md: Show more control does not immediately follow the identity scene');
if (!readme.includes('alt="Show more: architecture, selected applications, AI engineering workflow, and calibrated capability record."')) {
  fail('README.md: English Show more label is missing');
}
for (const scene of ['identity', 'project-factory', 'project-spark', 'project-layers', 'project-ledger', 'capability', 'expand']) {
  for (const suffix of ['light.svg', 'dark.svg', 'mobile-light.svg', 'mobile-dark.svg']) {
    if (!readme.includes(`assets/generated/${scene}-${suffix}`)) fail(`README.md: missing ${scene}-${suffix}`);
  }
}
for (const scene of ['architecture', 'ai']) {
  for (const suffix of ['light.gif', 'dark.gif', 'mobile-light.gif', 'mobile-dark.gif', 'static-light.svg', 'static-dark.svg', 'mobile-static-light.svg', 'mobile-static-dark.svg']) {
    if (!readme.includes(`assets/generated/${scene}-${suffix}`)) fail(`README.md: missing ${scene}-${suffix}`);
  }
}
if (!readme.includes('prefers-color-scheme: dark')) fail('README.md: automatic theme selection is missing');
if (!readme.includes('prefers-reduced-motion: reduce')) fail('README.md: reduced-motion fallback is missing');

let previousPosition = -1;
for (const project of V5_PROJECTS) {
  const position = readme.indexOf(`href="${project.repo}"`);
  if (position < 0) fail(`README.md: ${project.name} link is missing`);
  if (position <= previousPosition) fail(`README.md: project order is wrong at ${project.name}`);
  previousPosition = position;
}

const residue = visible
  .replace(/<picture>[\s\S]*?<\/picture>/g, '')
  .replace(/<\/?(?:details|summary)>/g, '')
  .replace(/<\/?a\b[^>]*>/g, '')
  .trim();
if (residue) fail(`README.md: visible non-image residue detected: ${residue.slice(0, 80)}`);
if (/\b(?:merhaba|hakkında|iletişim|projeler|teknoloji|geliştirme)\b/i.test(readme)) fail('README.md: public copy must remain English');

const combined = `${readme}\n${GENERATED_ASSET_NAMES.filter((asset) => asset.endsWith('.svg')).map((asset) => readFileSync(resolve(REPO_ROOT, 'assets/generated', asset), 'utf8')).join('\n')}`;
for (const label of ['React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker']) {
  if (!combined.includes(label)) fail(`identity: missing technology anchor ${label}`);
}
if (/(?:ghp_|github_pat_|AKIA)[A-Za-z0-9_\-]{12,}/.test(combined)) fail('generated output: possible credential detected');

if (errors.length) {
  console.error(errors.map((error) => `[validate] ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`[validate] ${GENERATED_ASSET_NAMES.length} V5 assets (${totalBytes.toLocaleString()} bytes), README structure, theme/motion fallbacks, project order, and accessibility passed`);
}
