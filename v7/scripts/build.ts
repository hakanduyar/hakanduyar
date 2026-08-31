// Deterministic V7 evidence build: generate.ts -> SVG (source of truth) ->
// PNG raster (visual proof, via sharp, no browser required).
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { generateVariant, type Device, type Mode } from '../src/generate.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SVG_DIR = resolve(ROOT, 'assets/generated');
const EVIDENCE_DIR = resolve(ROOT, 'evidence/v7.2-dual-motion');

// Both themes ship, switched by `prefers-color-scheme` in the README.
const variants: Array<{ mode: Mode; device: Device }> = [
  { mode: 'dark', device: 'desktop' },
  { mode: 'dark', device: 'mobile' },
  { mode: 'light', device: 'desktop' },
  { mode: 'light', device: 'mobile' },
];

async function main() {
  mkdirSync(SVG_DIR, { recursive: true });
  mkdirSync(EVIDENCE_DIR, { recursive: true });

  for (const { mode, device } of variants) {
    const { svg, width } = generateVariant(mode, device);
    const svgName = `v7-${device}-${mode}.svg`;
    const svgPath = resolve(SVG_DIR, svgName);
    writeFileSync(svgPath, svg, 'utf8');

    const pngName = `v7-${device}-${mode}.png`;
    const pngPath = resolve(EVIDENCE_DIR, pngName);
    await sharp(Buffer.from(svg, 'utf8'), { density: 144 })
      .resize({ width: width * 2 })
      .png()
      .toFile(pngPath);

    console.log(`wrote ${svgPath}`);
    console.log(`wrote ${pngPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
