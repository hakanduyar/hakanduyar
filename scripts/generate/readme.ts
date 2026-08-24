/**
 * README assembler.
 *
 * The README is generated, not hand-edited: every image reference matches what
 * the renderer emits, and every number on the page lives inside a panel that
 * was drawn from the telemetry snapshot.
 *
 * v2 changed what this file is for. v1 assembled a document — eight `##`
 * headings, four identity paragraphs, a nine-row metrics table, twelve bullets
 * and five principles — and hung images off it. The prose was the page and the
 * graphics illustrated it, which is exactly why the result read as a report.
 *
 * Here the panels are the page. This assembler emits almost nothing of its own:
 * a stack of `<picture>` blocks, one strapline, one channels link line, one
 * provenance line. No headings at all — each panel draws its own section mark,
 * so a Markdown heading above it would say the same thing twice in two
 * typefaces.
 *
 * The accessible reading of the page therefore rests on `alt` text rather than
 * on body copy, and each `alt` is written to stand alone: read in order with no
 * images loaded, they still say who this is, what he works on, what he built
 * and how to reach him.
 *
 * That is why alt text is the one place the page repeats a figure. The
 * no-duplicate-metrics rule exists so a sighted reader is not told the same
 * number twice in two registers; alt text is not a second telling, it is the
 * same telling for a reader who cannot see the panel. Stripping the numbers out
 * of it to satisfy the rule would leave that reader with strictly less than
 * everyone else. `tests/readme.test.ts` states this exemption explicitly and
 * asserts the panels themselves still obey the rule.
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from '../../src/shared/emit.js';
import { PROFILE } from '../../src/shared/profile.js';
import { CHANNELS, FEATURED_REPOS, LOGIN } from '../../src/shared/config.js';
import { loadTelemetry, PANEL_IDS } from '../../src/build.js';
import { remainderShare } from '../../src/signal/signal.js';

const OUT = resolve(REPO_ROOT, 'README.md');

/**
 * A themed `<picture>`. Animated panels put the reduced-motion pair first,
 * because the README document evaluates that preference correctly even though
 * an SVG image document does not.
 */
function picture(opts: { base: string; alt: string; animated?: boolean; link?: string }): string {
  const asset = (name: string): string => `assets/generated/${name}.svg`;
  const sources: string[] = [];
  if (opts.animated) {
    sources.push(
      `  <source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="${asset(`${opts.base}-static-dark`)}">`,
      `  <source media="(prefers-reduced-motion: reduce)" srcset="${asset(`${opts.base}-static-light`)}">`,
    );
  }
  sources.push(`  <source media="(prefers-color-scheme: dark)" srcset="${asset(`${opts.base}-dark`)}">`);
  const inner =
    '<picture>\n' +
    sources.join('\n') +
    '\n' +
    `  <img src="${asset(`${opts.base}-light`)}" alt="${opts.alt}" width="890">\n` +
    '</picture>';
  return opts.link ? `<a href="${opts.link}">\n${inner}\n</a>` : inner;
}

function main(): void {
  const t = loadTelemetry();
  const primary = t.languages[0];
  if (!primary) throw new Error('No language data in telemetry');

  const capturedDate = t.capturedAt.slice(0, 10);
  const share = (value: number): string => `${(value * 100).toFixed(1)} percent`;
  const byKey = new Map(t.featured.map((f) => [f.key, f]));

  const lines: string[] = [];
  const push = (...items: string[]): void => {
    lines.push(...items);
  };

  push(
    '<!-- GENERATED FILE - do not edit by hand.',
    '     Source: scripts/generate/readme.ts',
    `     Data:   data/telemetry.json (measured ${capturedDate})`,
    '     Build:  npm run build -->',
    '',
  );

  // -- 00 identity -----------------------------------------------------------

  push(
    picture({
      base: 'identity',
      animated: true,
      alt:
        `${t.name}, interface and systems engineer. ` +
        `${t.publicRepos} public repositories, ${t.totalCommits} commits on default branches, ` +
        `${primary.name} ${share(primary.share)} of public source.`,
    }),
    '',
    // The one line of real text on the page: what search, screen readers and a
    // failed image load all fall back to.
    `**${PROFILE.strapline}**`,
    '',
  );

  // -- 01 focus --------------------------------------------------------------

  push(
    picture({
      base: 'focus',
      alt:
        'Focus, four engineering domains. ' +
        PROFILE.modules
          .map((m) => `${m.name.charAt(0)}${m.name.slice(1).toLowerCase()}: ${m.capability}`)
          .join('. ') +
        '.',
    }),
    '',
  );

  // -- 02 selected systems ---------------------------------------------------
  //
  // Each plate is its own link. One image, one repository, one anchor — so the
  // section needs no list of links underneath it.

  for (const repo of FEATURED_REPOS) {
    const featured = byKey.get(repo.key);
    if (!featured) throw new Error(`Featured key "${repo.key}" missing from telemetry`);
    push(
      picture({
        base: `system-${repo.key}`,
        link: featured.url,
        alt:
          `${featured.name}: ${repo.headline} ` +
          `Built with ${repo.stack.join(', ')}. Last public push ${featured.pushedAt.slice(0, 7)}.`,
      }),
      '',
    );
  }

  // -- 03 signal -------------------------------------------------------------

  const named = t.languages.slice(0, 4);
  push(
    picture({
      base: 'signal',
      animated: true,
      // Describes what the panel draws, and no more: the active-week count and
      // the peak week left the page with the histogram.
      alt:
        `Measured signal. Source distribution across ${(t.totalSourceBytes / 1e6).toFixed(2)} MB of public source: ` +
        named.map((l) => `${l.name} ${share(l.share)}`).join(', ') +
        `, and ${share(remainderShare(t))} across all other languages. ` +
        `${t.activity.total} contributions in the ${t.activity.weekly.length} weeks to ${t.activity.end}.`,
    }),
    '',
  );

  // -- 04 channels -----------------------------------------------------------
  //
  // The one place a link line is unavoidable: four destinations cannot live in
  // one anchor. It carries the link words only — the handles are drawn in the
  // panel and are not repeated here.

  push(
    picture({
      base: 'channels',
      alt: 'Channels: ' + CHANNELS.map((c) => `${c.display}, ${c.detail}`).join('; ') + '.',
    }),
    '',
    CHANNELS.map((c) => `[${c.display}](${c.href})`).join(' · '),
    '',
    `*${PROFILE.provenanceNote} Measured ${capturedDate}. ` +
      `Source: [${LOGIN}/${LOGIN}](https://github.com/${LOGIN}/${LOGIN}).*`,
    '',
  );

  const readme = lines.join('\n');

  // The assembler and the build set must reference the same panels. This is the
  // cheap half of that guarantee; validate-all checks the emitted files too.
  for (const id of PANEL_IDS) {
    if (!readme.includes(`assets/generated/${id}-dark.svg`)) {
      throw new Error(`README does not reference panel "${id}", which buildAll() produces`);
    }
  }

  writeFileSync(OUT, readme, 'utf8');
  const words = readme.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  console.log(`[readme] ${lines.length} lines, ${PANEL_IDS.length} panels, ~${words} words of markup and copy`);
}

main();
