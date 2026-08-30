// Offline structural QA for the V7.1 visual-proof evidence set.
// No network, no browser. Validates the generated SVGs against the owner's
// V7.1 requirements: real local logo marks for every displayed technology,
// React + TypeScript as the two largest marks, exact project order with
// truth markers, one integrated delivery path, and motion safety.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLValidator } from 'fast-xml-parser';
import { architecture, systems, deliveryPath, footer } from '../data/content.js';
import { logoMarks, type LogoSlug } from '../src/logos.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SVG_DIR = resolve(ROOT, 'assets/generated');
const EVIDENCE_DIR = resolve(ROOT, 'evidence/v7.1-visual-proof');
const LOGO_DIR = resolve(ROOT, 'assets/logos');

const failures: string[] = [];
const expect = (cond: boolean, msg: string) => {
  if (!cond) failures.push(msg);
};

// Owner-required marks that must appear as visual logos in every variant.
const requiredMarks: LogoSlug[] = [
  'react',
  'typescript',
  'kubernetes',
  'docker',
  'nginx',
  'apache',
  'redis',
  'elasticsearch',
  'linux',
  'ubuntu',
  'debian',
];

// Content-model cross-check: every technology the proof displays must have a
// vendored mark, and each vendored mark file must exist locally.
const displayedSlugs = new Set<LogoSlug>();
for (const plane of architecture) for (const m of plane.marks) displayedSlugs.add(m.slug);
for (const s of systems) for (const m of s.marks) displayedSlugs.add(m.slug);
for (const slug of displayedSlugs) {
  expect(slug in logoMarks, `displayed technology "${slug}" has no vendored mark in v7/src/logos.ts`);
  expect(existsSync(resolve(LOGO_DIR, `${slug}.svg`)), `v7/assets/logos/${slug}.svg missing — run vendor-logos`);
}
expect(existsSync(resolve(LOGO_DIR, 'SOURCES.md')), 'v7/assets/logos/SOURCES.md missing (license strategy)');
for (const slug of requiredMarks) {
  expect(displayedSlugs.has(slug), `required technology "${slug}" is not displayed by the content model`);
}
expect(systems.length === 4, 'content model must define exactly four systems');
expect(
  systems.map((s) => s.name).join('|') === 'Software Factory|Spark|Built in Layers|JointLedger',
  'systems must appear in the exact required order',
);

// Production ships dark mode only — no light-source variant is validated.
const variants = [
  { device: 'desktop', mode: 'dark', maxWidth: Infinity },
  { device: 'mobile', mode: 'dark', maxWidth: 390 },
];

for (const v of variants) {
  const name = `v7-${v.device}-${v.mode}`;
  const file = resolve(SVG_DIR, `${name}.svg`);
  expect(existsSync(file), `${file} missing — run npm run v7:build`);
  if (!existsSync(file)) continue;
  const svg = readFileSync(file, 'utf8');

  const xml = XMLValidator.validate(svg);
  expect(xml === true, `${name} is not well-formed XML: ${xml === true ? '' : JSON.stringify(xml)}`);

  expect(!/<script/i.test(svg), `${name} contains a <script> element`);
  expect(!/<image/i.test(svg), `${name} embeds an <image> element (marks must be inline paths)`);
  expect(
    !/https?:\/\//.test(svg.replace('http://www.w3.org/2000/svg', '')),
    `${name} references an external host`,
  );
  expect(/role="img"/.test(svg) && /aria-label="/.test(svg), `${name} is missing role="img"/aria-label`);
  expect(!/var\(--/.test(svg), `${name} references a CSS custom property (must be flattened, GitHub-safe)`);

  const vb = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
  expect(!!vb, `${name} missing viewBox`);
  if (vb && Number.isFinite(v.maxWidth)) {
    expect(Number(vb[1]) <= v.maxWidth, `${name} width ${vb[1]} exceeds mobile ceiling ${v.maxWidth}`);
  }

  // Logo marks: every required technology rendered as a real vendored path.
  const sizes = new Map<string, number>();
  for (const m of svg.matchAll(/data-logo="([a-z]+)" data-px="([\d.]+)"/g)) {
    const slug = m[1]!;
    const px = Number(m[2]);
    sizes.set(slug, Math.max(sizes.get(slug) ?? 0, px));
    const mark = logoMarks[slug as LogoSlug];
    expect(!!mark, `${name} renders unknown mark "${slug}"`);
    if (mark) {
      expect(svg.includes(mark.path), `${name} mark "${slug}" does not use the vendored path data`);
    }
  }
  for (const slug of requiredMarks) {
    expect(sizes.has(slug), `${name} missing required logo mark "${slug}"`);
  }
  // React and TypeScript must be the two largest marks in the composition.
  const reactPx = sizes.get('react') ?? 0;
  const tsPx = sizes.get('typescript') ?? 0;
  for (const [slug, px] of sizes) {
    if (slug === 'react' || slug === 'typescript') continue;
    expect(px < reactPx && px < tsPx, `${name} mark "${slug}" (${px}px) is not smaller than React (${reactPx}px) / TypeScript (${tsPx}px)`);
  }

  // Systems: exact order in the document, with truth markers present.
  let lastIdx = -1;
  for (const s of systems) {
    const idx = svg.indexOf(s.name);
    expect(idx >= 0, `${name} missing system "${s.name}"`);
    expect(idx > lastIdx, `${name} system "${s.name}" out of required order`);
    lastIdx = idx;
  }
  for (const marker of ['CONCEPT', 'BUILT', 'CONTRIBUTION']) {
    expect(svg.includes(marker), `${name} missing truth marker "${marker}"`);
  }

  // Architecture planes + delivery path present.
  for (const plane of architecture) {
    expect(svg.includes(plane.label), `${name} missing architecture plane "${plane.label}"`);
  }
  for (const node of deliveryPath.nodes) {
    expect(svg.includes(node.label), `${name} missing delivery-path node "${node.label}"`);
  }
  expect((svg.match(/HUMAN GATE/g) ?? []).length >= 2, `${name} must show two human gates`);

  // Contact email inside the art must be the current address, exclusively.
  const contactEmail = footer.contact.split(' · ')[1]!;
  expect(svg.includes(contactEmail), `${name} missing contact email ${contactEmail}`);
  expect(!/hakanbtgm@gmail\.com/.test(svg), `${name} still references the retired hakanbtgm@gmail.com address`);

  // Motion safety: any animation must be opt-in via prefers-reduced-motion,
  // and the base (unanimated) geometry must be the resolved drawing.
  if (/animation/.test(svg)) {
    expect(
      /@media \(prefers-reduced-motion: no-preference\)/.test(svg),
      `${name} animates outside a prefers-reduced-motion: no-preference guard`,
    );
    expect(!/<animate/i.test(svg), `${name} uses SMIL animation (CSS-guarded only)`);
  }

  // Rendered evidence must exist for each variant.
  expect(
    existsSync(resolve(EVIDENCE_DIR, `${name}.png`)),
    `evidence PNG for ${name} missing — run npm run v7:build`,
  );
}

if (failures.length) {
  console.error(`V7.1 QA: ${failures.length} failure(s)`);
  for (const f of failures) console.error(` - ${f}`);
  process.exit(1);
}
console.log(`V7.1 QA: all checks passed across ${variants.length} variants`);
