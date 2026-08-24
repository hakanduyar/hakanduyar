/**
 * The platform probes behind docs/github-platform-constraints.md.
 *
 * Everything that document claims was measured is measured HERE, from a clean
 * clone, with one command: `npm run probe:platform`. Re-run it whenever GitHub
 * changes its sanitiser or Chromium changes SVG-as-image behaviour, and update
 * the doc from the output — never the other way round.
 *
 * These probes are diagnostics, not part of the build. They are what the v2
 * static-first decision rests on: probes 1-3 are the measurement showing that a
 * `prefers-reduced-motion` guard inside an SVG image does not report the
 * viewer's real setting, which is why shipping motion here was never safely
 * accessible. Keep them runnable so the reasoning stays checkable.
 *
 * Probes:
 *   1. Does CSS keyframe animation run inside an SVG referenced via <img>?
 *   2. Does SMIL run there?
 *   3. Do prefers-reduced-motion guards behave inside the image document?
 *   4. Does prefers-color-scheme inherit the host page inside the image?
 *   5. Does GitHub's sanitiser preserve <picture>/<source media> and compound
 *      media queries? (needs network + a GitHub token)
 */

import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
import { launch, newPage } from '../validate/browser.js';

const FIXTURES = {
  'css-plain.svg':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">' +
    '<rect width="400" height="120" fill="#0b0e13"/><rect class="b" x="10" y="40" width="60" height="40" fill="#fff"/>' +
    '<style>.b{animation:mv 4s linear infinite both}@keyframes mv{0%{transform:translateX(0)}50%{transform:translateX(300px)}100%{transform:translateX(0)}}</style></svg>',
  'css-guarded.svg':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">' +
    '<rect width="400" height="120" fill="#0b0e13"/><rect class="b" x="10" y="40" width="60" height="40" fill="#fff"/>' +
    '<style>@media (prefers-reduced-motion:no-preference){.b{animation:mv 4s linear infinite both}}@keyframes mv{0%{transform:translateX(0)}50%{transform:translateX(300px)}100%{transform:translateX(0)}}</style></svg>',
  'css-reduce-override.svg':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">' +
    '<rect width="400" height="120" fill="#0b0e13"/><rect class="b" x="10" y="40" width="60" height="40" fill="#fff"/>' +
    '<style>.b{animation:mv 4s linear infinite both}@media (prefers-reduced-motion:reduce){.b{animation:none}}@keyframes mv{0%{transform:translateX(0)}50%{transform:translateX(300px)}100%{transform:translateX(0)}}</style></svg>',
  'smil.svg':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">' +
    '<rect width="400" height="120" fill="#0b0e13"/><rect x="10" y="40" width="60" height="40" fill="#fff">' +
    '<animateTransform attributeName="transform" type="translate" values="0 0;300 0;0 0" dur="4s" repeatCount="indefinite"/></rect></svg>',
  'scheme.svg':
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">' +
    '<rect width="400" height="120" fill="#0b0e13"/><rect class="q" x="170" y="40" width="60" height="40" fill="#fff"/>' +
    '<style>@media (prefers-color-scheme:light){.q{fill:#000}}</style></svg>',
};

/** Centroid x of near-white pixels — moves iff the bar animates; -1 if none. */
function whiteCentroid(buf: Buffer): number {
  const png = PNG.sync.read(buf);
  let sum = 0;
  let count = 0;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const i = (png.width * y + x) << 2;
      if (png.data[i]! > 200 && png.data[i + 1]! > 200 && png.data[i + 2]! > 200) {
        sum += x;
        count++;
      }
    }
  }
  return count ? Math.round(sum / count) : -1;
}

async function main(): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), 'hdu-probe-'));
  try {
    for (const [name, svg] of Object.entries(FIXTURES)) writeFileSync(join(dir, name), svg);
    const ids = Object.keys(FIXTURES).map((n) => n.replace('.svg', ''));
    writeFileSync(
      join(dir, 'host.html'),
      '<!doctype html><meta charset="utf-8"><body style="margin:0;background:#222">' +
        Object.keys(FIXTURES)
          .map((n) => `<img id="${n.replace('.svg', '')}" src="${n}" width="400" height="120">`)
          .join('') +
        '</body>',
    );

    const browser = await launch();
    const results: string[] = [];
    try {
      for (const [scheme, reduced] of [
        ['dark', false],
        ['light', false],
        ['dark', true],
      ] as const) {
        const page = await newPage(browser, { width: 460, height: 700, scheme });
        // Emulated here rather than in `newPage`: the shipped assets contain no
        // motion, so the shared harness has no reason to carry a motion knob.
        // This probe is the one place the preference still matters — it is what
        // measures the misfire that docs/github-platform-constraints.md records.
        await page.emulateMediaFeatures([
          { name: 'prefers-color-scheme', value: scheme },
          { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' },
        ]);
        await page.goto(pathToFileURL(join(dir, 'host.html')).href, { waitUntil: 'load' });
        const samples: Record<string, number[]> = Object.fromEntries(ids.map((id) => [id, []]));
        for (let i = 0; i < 3; i++) {
          if (i) await new Promise((r) => setTimeout(r, 800));
          for (const id of ids) {
            const handle = await page.$(`#${id}`);
            samples[id]!.push(whiteCentroid((await handle!.screenshot({ type: 'png' })) as Buffer));
          }
        }
        for (const id of ids) {
          const values = samples[id]!;
          const animated = new Set(values).size > 1;
          results.push(
            `host=${scheme}${reduced ? '+reduce' : ''}  ${id.padEnd(20)} ` +
              `x=[${values.join(',')}]  ${id === 'scheme' ? `whitePresent=${values[0] !== -1}` : `animates=${animated}`}`,
          );
        }
        await page.close();
      }
    } finally {
      await browser.close();
    }
    console.log('--- SVG-as-<img> behaviour (Chromium) ---');
    for (const line of results) console.log('  ' + line);

    // 5) GitHub sanitiser probe.
    console.log('--- GitHub sanitiser (POST /markdown) ---');
    const token =
      process.env['GITHUB_TOKEN'] ??
      process.env['GH_TOKEN'] ??
      execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', shell: true }).trim();
    const probeMd = [
      '<picture>',
      '  <source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="a.svg">',
      '  <source media="(prefers-reduced-motion: reduce)" srcset="b.svg">',
      '  <source media="(prefers-color-scheme: dark)" srcset="c.svg">',
      '  <img alt="probe alternative text" src="d.svg">',
      '</picture>',
    ].join('\n');
    const response = await fetch('https://api.github.com/markdown', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'hdu-probe' },
      body: JSON.stringify({ mode: 'gfm', text: probeMd }),
    });
    const html = await response.text();
    console.log(`  <picture> preserved: ${html.includes('<picture>')}`);
    console.log(`  compound media query preserved: ${html.includes('(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)')}`);
    console.log(`  <source> count in = 3, out = ${(html.match(/<source /g) ?? []).length}`);

    console.log('\nInterpretation guide: docs/github-platform-constraints.md');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error('[probe] FAILED:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
