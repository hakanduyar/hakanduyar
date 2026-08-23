/**
 * README assembler.
 *
 * The README is generated, not hand-edited: every number in it comes from the
 * telemetry snapshot, and every image reference matches what the renderer
 * emits. Markdown carries the content; the images are the frame. If every
 * image on the page failed to load, the page would still do its whole job.
 *
 * Reduced motion: a `prefers-reduced-motion` query inside the SVGs themselves
 * misfires (see docs/github-platform-constraints.md), so the hero's <picture>
 * declares static sources first — the README document evaluates those media
 * attributes correctly.
 */

import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from '../../src/shared/emit.js';
import { PROFILE } from '../../src/shared/profile.js';
import { CHANNELS, FEATURED_REPOS, LOGIN } from '../../src/shared/config.js';
import type { Telemetry } from '../../src/shared/telemetry-types.js';

const OUT = resolve(REPO_ROOT, 'README.md');

function loadTelemetry(): Telemetry {
  return JSON.parse(readFileSync(resolve(REPO_ROOT, 'data/telemetry.json'), 'utf8')) as Telemetry;
}

/** A themed <picture> block. Reduced-motion sources must come first: the first matching <source> wins. */
function picture(opts: {
  base: string;
  alt: string;
  animated: boolean;
  width?: number;
  link?: string;
}): string {
  const a = (name: string): string => `assets/generated/${name}.svg`;
  const sources: string[] = [];
  if (opts.animated) {
    sources.push(
      `  <source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="${a(`${opts.base}-static-dark`)}">`,
      `  <source media="(prefers-reduced-motion: reduce)" srcset="${a(`${opts.base}-static-light`)}">`,
    );
  }
  sources.push(`  <source media="(prefers-color-scheme: dark)" srcset="${a(`${opts.base}-dark`)}">`);
  const img = `  <img src="${a(`${opts.base}-light`)}" alt="${opts.alt}" width="${opts.width ?? 890}">`;
  const inner = `<picture>\n${sources.join('\n')}\n${img}\n</picture>`;
  return opts.link ? `<a href="${opts.link}">\n${inner}\n</a>` : inner;
}

function main(): void {
  const t = loadTelemetry();
  const primary = t.languages[0];
  if (!primary) throw new Error('No language data in telemetry');

  const capturedDate = t.capturedAt.slice(0, 10);
  const megabytes = (t.totalSourceBytes / 1e6).toFixed(2);
  const byKey = new Map(t.featured.map((f) => [f.key, f]));
  const featured = (key: string) => {
    const entry = byKey.get(key);
    if (!entry) throw new Error(`Featured key "${key}" missing from telemetry`);
    return entry;
  };

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

  // -- hero -------------------------------------------------------------------

  push(
    picture({
      base: 'hero',
      animated: true,
      alt:
        `HDU engineering record. ${t.name}, interface and systems engineering. ` +
        `${t.publicRepos} public repositories, ${t.totalCommits} commits on default branches, ` +
        `${primary.name} ${(primary.share * 100).toFixed(1)} percent of public source. ` +
        `Active since ${t.memberSince.slice(0, 4)}, last public push ${t.lastPush.at.slice(0, 10)}.`,
    }),
    '',
    `**${PROFILE.strapline}**`,
    '',
  );

  // -- identity -----------------------------------------------------------------

  push('## Identity', '');
  for (const paragraph of PROFILE.identity) push(paragraph, '');

  // -- core modules ---------------------------------------------------------------

  push(
    '## Core modules',
    '',
    picture({
      base: 'core-modules',
      animated: false,
      alt:
        'Four capability domains, each with its evidence repository: ' +
        PROFILE.modules.map((m) => `${m.name.toLowerCase()} (${featured(m.evidence).name})`).join(', ') +
        '.',
    }),
    '',
  );
  for (const module of PROFILE.modules) {
    const repo = featured(module.evidence);
    push(`- **${module.name.charAt(0) + module.name.slice(1).toLowerCase()}** — ${module.summary} Evidence: [${repo.name}](${repo.url}).`);
  }
  push('');

  // -- selected systems ------------------------------------------------------------

  push('## Selected systems', '');
  for (const config of FEATURED_REPOS) {
    const repo = featured(config.key);
    push(
      picture({
        base: `system-${config.key}`,
        animated: false,
        alt: `${repo.name}: ${config.plateLine}. ${repo.language ?? ''}, last push ${repo.pushedAt.slice(0, 7)}.`,
        link: repo.url,
      }),
      '',
      `**[${repo.name}](${repo.url})** — ${config.headline}`,
      '',
    );
    for (const signal of config.signals) push(`- ${signal}`);
    push('', `Stack: ${config.stack.join(' · ')}. Last public push: ${repo.pushedAt.slice(0, 7)}.`, '');
  }

  // -- telemetry -------------------------------------------------------------------

  push(
    '## Telemetry',
    '',
    picture({
      base: 'telemetry',
      animated: false,
      alt:
        `Measured telemetry: ${t.publicRepos} public repositories, ${t.totalCommits} commits on default branches, ` +
        `${primary.name} ${(primary.share * 100).toFixed(1)} percent of ${megabytes} MB of public source.`,
    }),
    '',
    '| Measure | Value | Method |',
    '|---|---:|---|',
    `| Public repositories | ${t.publicRepos} | ${t.methods.publicRepos.toLowerCase()} |`,
    `| Commits | ${t.totalCommits} | ${t.methods.totalCommits.toLowerCase()} |`,
  );
  for (const language of t.languages.slice(0, 4)) {
    push(
      `| ${language.name} | ${(language.share * 100).toFixed(1)}% | share of ${megabytes} MB public source |`,
    );
  }
  const remainder = 1 - t.languages.slice(0, 4).reduce((sum, l) => sum + l.share, 0);
  push(
    `| All other languages | ${(remainder * 100).toFixed(1)}% | ${t.languages.length - 4} languages |`,
    `| Active since | ${t.memberSince.slice(0, 4)} | ${t.methods.activeSince.toLowerCase()} |`,
    `| Last public push | ${t.lastPush.at.slice(0, 10)} | ${t.methods.lastPush.toLowerCase()} |`,
    '',
    `Measured ${capturedDate} from the GitHub API. No estimated or third-party figures.`,
    '',
  );

  // -- activity --------------------------------------------------------------------

  push(
    '## Activity',
    '',
    picture({
      base: 'activity',
      animated: false,
      alt:
        `Weekly public contributions for the 52 weeks to ${t.activity.end}: ${t.activity.total} total across ` +
        `${t.activity.activeWeeks} active weeks, peak week ${t.activity.max}. Work arrives in bursts.`,
    }),
    '',
    `${t.activity.total} public contributions in the 52 weeks to ${t.activity.end}, concentrated in ` +
      `${t.activity.activeWeeks} active weeks with a peak of ${t.activity.max} in one week. ` +
      PROFILE.privateWork,
    '',
  );

  // -- operating principles ----------------------------------------------------------

  push('## Operating principles', '');
  for (const principle of PROFILE.principles) push(`- ${principle}`);
  push('');

  // -- channels ------------------------------------------------------------------------

  push('## Channels', '');
  for (const channel of CHANNELS) {
    const label = channel.label.charAt(0) + channel.label.slice(1).toLowerCase();
    push(`- ${label}: [${channel.detail}](${channel.href})`);
  }
  push('');

  // -- provenance ------------------------------------------------------------------------

  push(
    '---',
    '',
    `*${PROFILE.provenanceNote} Data measured ${capturedDate}. ` +
      `Source: [${LOGIN}/${LOGIN}](https://github.com/${LOGIN}/${LOGIN}). Build: \`npm run build\`.*`,
    '',
  );

  writeFileSync(OUT, lines.join('\n'), 'utf8');
  console.log(`[readme] wrote ${OUT} (${lines.length} lines)`);
}

main();
