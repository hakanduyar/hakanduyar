// Offline structural validation for the V6 static README + assets.
// No network, no browser — safe to run in CI on every push.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLValidator } from 'fast-xml-parser';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const readme = readFileSync(resolve(ROOT, 'README.md'), 'utf8');
const failures = [];
const expect = (cond, msg) => { if (!cond) failures.push(msg); };

// Every referenced asset must exist, be well-formed XML, self-contained,
// and free of anything that would make GitHub sanitise or refuse it.
const assetRefs = [...new Set(readme.match(/assets\/v6\/[\w-]+\.svg/g) ?? [])];
expect(assetRefs.length === 14, `expected 14 distinct asset references, found ${assetRefs.length}`);

for (const ref of assetRefs) {
  const path = resolve(ROOT, ref);
  expect(existsSync(path), `${ref} referenced in README but missing on disk`);
  if (!existsSync(path)) continue;
  const svg = readFileSync(path, 'utf8');

  const xml = XMLValidator.validate(svg);
  expect(xml === true, `${ref} is not well-formed XML: ${xml === true ? '' : JSON.stringify(xml)}`);

  expect(!/class="/.test(svg), `${ref} still has a CSS class attribute (should be flattened)`);
  expect(!/var\(--/.test(svg), `${ref} still references a CSS custom property`);
  expect(!/<script/i.test(svg), `${ref} contains a <script> element`);
  expect(!/https?:\/\//.test(svg.replace('http://www.w3.org/2000/svg', '')), `${ref} references an external host`);
  expect(/role="img"/.test(svg) && /aria-label="/.test(svg), `${ref} is missing role="img"/aria-label`);

  // Mobile-legibility floor: authored width must keep the display width
  // close enough to native scale that ~9.5px labels don't fall below ~5px
  // once GitHub scales the image down to a narrow viewport.
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  if (vb) {
    const w = Number(vb[1]);
    expect(w <= 700, `${ref} viewBox width ${w} exceeds the 700px mobile-legibility ceiling`);
  }
}

// Every <picture> must carry both a dark source and a light img fallback.
const pictureBlocks = readme.match(/<picture>[\s\S]*?<\/picture>/g) ?? [];
expect(pictureBlocks.length === 7, `expected 7 <picture> blocks (hero, legend, 4 systems, route), found ${pictureBlocks.length}`);
for (const block of pictureBlocks) {
  expect(/prefers-color-scheme: dark/.test(block), 'a <picture> block is missing the dark media source');
  expect(/<img /.test(block) && /alt="[^"]{15,}"/.test(block), 'a <picture> block is missing a substantive alt attribute');
}

// Claim-boundary spot checks (per HANDOFF §5 claim audit): each system's
// boundary line must be present verbatim, disclaiming the specific things
// the design brief ruled out of scope.
const boundaries = [
  'no issue/PR automation, orchestration, deployment, or control-room UI built',
  'no automated test suite claimed',
  'not a full design system; no WCAG AAA claim',
  'shared-book UI, selector, and invitation flow not claimed',
];
for (const line of boundaries) {
  expect(readme.includes(line), `claim-boundary line missing verbatim: "${line}"`);
}

if (failures.length) {
  for (const f of failures) console.error('  FAIL', f);
  process.exitCode = 1;
} else {
  console.log(`[validate] ${assetRefs.length} assets, ${pictureBlocks.length} picture blocks — 0 errors`);
}
