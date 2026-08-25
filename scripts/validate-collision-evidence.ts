import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from '../src/emit.js';
import { GENERATED_ASSET_NAMES } from '../src/assets.js';

interface AuditResult {
  name: string;
  scene: 'hero' | 'systems' | 'architecture' | 'signal' | 'theme-control';
  theme: 'dark' | 'light';
  layout: 'desktop' | 'mobile' | 'intermediate';
  frame: string;
  renderedWidth: number;
  overlaps: string[];
  geometryHits: string[];
  outOfBounds: string[];
}

interface CollisionEvidence {
  version: string;
  sourceDigest: string;
  widths: { desktop: number; intermediate: number; mobile: number };
  results: AuditResult[];
}

interface PageSourceResult {
  file: string;
  broken: number;
  innerWidth: number;
  scrollWidth: number;
  sources: string[];
  nativeText: string;
  readmeElements: string[];
}

interface PageSourceEvidence {
  version: string;
  previewDigest: string;
  results: PageSourceResult[];
}

const evidencePath = resolve(REPO_ROOT, '.ai/evidence/visual/v4.2/collision-audit.json');
const pageSourcePath = resolve(REPO_ROOT, '.ai/evidence/visual/v4.2/page-source-audit.json');
if (!existsSync(evidencePath)) throw new Error('V4.2 browser collision evidence is missing');
if (!existsSync(pageSourcePath)) throw new Error('V4.2 preview source-selection evidence is missing');

const generatedDir = resolve(REPO_ROOT, 'assets/generated');
const files = readdirSync(generatedDir).filter((name) => name.endsWith('.svg')).sort();
const expectedFiles = [...GENERATED_ASSET_NAMES].sort();
if (JSON.stringify(files) !== JSON.stringify(expectedFiles)) throw new Error(`Generated SVG directory does not match the canonical ${expectedFiles.length}-asset manifest`);
const hash = createHash('sha256');
for (const file of files) {
  hash.update(file);
  hash.update('\0');
  hash.update(readFileSync(resolve(generatedDir, file)));
  hash.update('\0');
}

const evidence = JSON.parse(readFileSync(evidencePath, 'utf8')) as CollisionEvidence;
if (evidence.version !== '4.2') throw new Error(`Unexpected collision evidence version: ${evidence.version}`);
if (evidence.sourceDigest !== hash.digest('hex')) throw new Error('V4.2 collision evidence does not match the generated SVGs');
if (evidence.widths.desktop !== 890 || evidence.widths.mobile !== 390 || evidence.widths.intermediate < 600) {
  throw new Error('V4.2 collision evidence is missing a required rendered width');
}
const required = [
  'hero-dark-desktop-flight',
  'hero-dark-desktop-flight-signal-early',
  'hero-dark-desktop-flight-signal-mid',
  'hero-dark-desktop-signal-resolved',
  'hero-dark-desktop-signal-spatial-mid',
  'hero-dark-desktop-spatial-resolved',
  'hero-dark-desktop-spatial-flight-mid',
  'hero-dark-desktop-loop-boundary',
  'hero-light-desktop-flight',
  'hero-light-desktop-signal-resolved',
  'hero-light-desktop-spatial-resolved',
];
for (const scene of ['systems', 'architecture', 'signal']) {
  for (const layout of ['desktop', 'mobile']) {
    for (const frame of ['start', 'acquire', 'mid', 'resolved', 'reset']) required.push(`${scene}-dark-${layout}-${frame}`);
    required.push(`${scene}-light-${layout}-resolved`);
  }
  for (const theme of ['dark', 'light']) {
    for (const layout of ['desktop', 'mobile']) required.push(`${scene}-${theme}-${layout}-static`);
    for (const frame of ['mid', 'resolved']) required.push(`${scene}-${theme}-intermediate-${frame}`);
  }
}
for (const theme of ['dark', 'light']) {
  for (const layout of ['desktop', 'mobile']) required.push(`theme-control-${theme}-${layout}-static`);
}

const names = evidence.results.map((result) => result.name);
if (new Set(names).size !== names.length) throw new Error('V4.2 collision evidence contains duplicate result names');
for (const name of required) {
  if (!names.includes(name)) throw new Error(`V4.2 collision evidence is missing ${name}`);
}
for (const result of evidence.results) {
  if (!['hero', 'systems', 'architecture', 'signal', 'theme-control'].includes(result.scene)) throw new Error(`${result.name}: invalid scene metadata`);
  if (!['dark', 'light'].includes(result.theme)) throw new Error(`${result.name}: invalid theme metadata`);
  if (!['desktop', 'mobile', 'intermediate'].includes(result.layout)) throw new Error(`${result.name}: invalid layout metadata`);
  if (result.name !== `${result.scene}-${result.theme}-${result.layout}-${result.frame}`) {
    throw new Error(`${result.name}: evidence metadata does not match its canonical name`);
  }
  const expectedWidth = result.layout === 'mobile' ? 390 : result.layout === 'intermediate' ? 530 : 890;
  if (result.renderedWidth !== expectedWidth) throw new Error(`${result.name}: expected rendered width ${expectedWidth}`);
}

const failures = evidence.results.flatMap((result) => [
  ...result.overlaps.map((issue) => `${result.name}: text overlap ${issue}`),
  ...result.geometryHits.map((issue) => `${result.name}: geometry collision ${issue}`),
  ...result.outOfBounds.map((issue) => `${result.name}: bounds failure ${issue}`),
]);
if (failures.length) throw new Error(failures.join('\n'));

const pageEvidence = JSON.parse(readFileSync(pageSourcePath, 'utf8')) as PageSourceEvidence;
const previewHash = createHash('sha256')
  .update(readFileSync(resolve(REPO_ROOT, 'preview/index.html')))
  .update('\0')
  .update(readFileSync(resolve(REPO_ROOT, 'preview/scene-stage.html')))
  .digest('hex');
if (pageEvidence.version !== '4.2' || pageEvidence.previewDigest !== previewHash) {
  throw new Error('V4.2 preview source-selection evidence is stale');
}
const expectedSources: Record<string, string[]> = {
  'page-dark-desktop-reduced-motion.png': ['theme-control-dark.svg', 'hero-static-dark.svg', 'systems-static-dark.svg', 'architecture-static-dark.svg', 'signal-static-dark.svg'],
  'page-light-desktop.png': ['theme-control-light.svg', 'hero-light.svg', 'systems-light.svg', 'architecture-light.svg', 'signal-light.svg'],
  'page-dark-mobile.png': ['theme-control-mobile-dark.svg', 'hero-dark.svg', 'systems-mobile-dark.svg', 'architecture-mobile-dark.svg', 'signal-mobile-dark.svg'],
  'page-light-mobile.png': ['theme-control-mobile-light.svg', 'hero-light.svg', 'systems-mobile-light.svg', 'architecture-mobile-light.svg', 'signal-mobile-light.svg'],
  'page-dark-mobile-reduced-motion.png': ['theme-control-mobile-dark.svg', 'hero-static-dark.svg', 'systems-mobile-static-dark.svg', 'architecture-mobile-static-dark.svg', 'signal-mobile-static-dark.svg'],
  'page-intermediate-light.png': ['theme-control-mobile-light.svg', 'hero-light.svg', 'systems-mobile-light.svg', 'architecture-mobile-light.svg', 'signal-mobile-light.svg'],
};
for (const [file, expected] of Object.entries(expectedSources)) {
  const result = pageEvidence.results.find((candidate) => candidate.file === file);
  if (!result) throw new Error(`Preview source evidence is missing ${file}`);
  const actual = result.sources.map((source) => source.split('/').at(-1));
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`${file}: unexpected responsive/reduced source selection`);
  if (result.broken !== 0 || result.scrollWidth > result.innerWidth) throw new Error(`${file}: broken image or horizontal overflow`);
  if (result.nativeText.trim() || JSON.stringify(result.readmeElements) !== JSON.stringify(['A', 'IMG', 'IMG', 'IMG', 'IMG'])) {
    throw new Error(`${file}: simulated README body is not image-only`);
  }
}

console.log(`[collision-evidence] ${evidence.results.length} rendered audits match ${files.length} SVGs; ${pageEvidence.results.length} preview source cases passed`);
