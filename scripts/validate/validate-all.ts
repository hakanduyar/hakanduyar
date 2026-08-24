/**
 * The validation harness — everything that can be checked without a browser.
 *
 * Run by `npm run validate`, by the unit tests, and by CI. A failure here is a
 * build failure; there are no advisory warnings that scroll past unread.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from '../../src/shared/emit.js';
import { buildAll, loadTelemetry, expectedAssetPaths } from '../../src/build.js';
import {
  checkSvg,
  checkEnglishOnly,
  checkAltText,
  checkAssetsResolve,
  checkPictureSources,
  SIZE_LIMITS,
  type Finding,
} from './checks.js';
import { MIN_INFO_TYPE_SIZE } from '../../src/shared/tokens.js';
import { remainderShare } from '../../src/signal/signal.js';
import { SECTIONS } from '../../src/shared/panel.js';

/**
 * Words that would put the profile straight back into the genre it is built to
 * avoid. Sourced from the design brief's banned lexicon; checked against the
 * README and against every string drawn inside every asset.
 */
const BANNED_LEXICON = [
  // The full build-failing list from the design brief, section 5.2.
  'MISSION CONTROL', 'DIRECTIVES', 'END TRANSMISSION', 'INITIALIZING', 'INITIALISING',
  'BOOT', 'BOOT SEQUENCE', 'ACCESS GRANTED', 'SYSTEM ONLINE', 'ONLINE', 'NOMINAL',
  'STATUS: OK', '[OK]', '[FAIL]', 'UPLINK', 'DOWNLINK', 'SUBSYSTEM', 'PROTOCOL',
  'NEURAL', 'QUANTUM', 'CLASSIFIED', 'CLEARANCE', 'TARGET', 'LOCKED', 'ENGAGE',
  'OPERATOR', 'WELCOME', 'LOADING', 'SYNCING', 'AI-POWERED', 'NEXT-GEN', 'CYBER',
  'MATRIX', 'HACKER', 'NINJA', 'ROCKSTAR', 'GURU', 'WIZARD', '10X', 'PASSIONATE',
  'PIXEL-PERFECT',
] as const;

function checkLexicon(text: string, label: string): Finding[] {
  const findings: Finding[] = [];
  const upper = text.toUpperCase();
  for (const term of BANNED_LEXICON) {
    // Word-boundary match so e.g. "cybersecurity" in a repo name cannot
    // trip "CYBER" — the ban is on the register, not on substrings.
    const pattern = new RegExp(`(?<![A-Z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Z0-9])`, 'i');
    if (pattern.test(upper)) {
      findings.push({ level: 'error', check: 'lexicon', message: `${label} contains banned term "${term}"` });
    }
  }
  return findings;
}

function main(): void {
  const findings: Finding[] = [];
  const telemetry = loadTelemetry();
  const readme = readFileSync(resolve(REPO_ROOT, 'README.md'), 'utf8');

  // -- README ------------------------------------------------------------------
  findings.push(...checkEnglishOnly(readme, 'README.md'));
  findings.push(...checkLexicon(readme, 'README.md'));
  findings.push(...checkAltText(readme));
  findings.push(...checkAssetsResolve(readme));
  findings.push(...checkPictureSources(readme));

  if (!/GENERATED FILE/.test(readme)) {
    findings.push({ level: 'error', check: 'readme', message: 'README.md is missing its generated-file header' });
  }

  // -- v2 composition: the panels are the page ---------------------------------
  //
  // These are the checks that keep the redesign from decaying back into v1. The
  // failure mode is not dramatic — it is someone adding "just one line" of
  // explanation under a panel, four times, until the page is a document again.
  const body = readme.replace(/<!--[\s\S]*?-->/g, '');
  const structural: [RegExp, string][] = [
    [/^#{1,6}\s/m, 'a Markdown heading (each panel draws its own section mark)'],
    [/^\s*[-*+]\s/m, 'a Markdown bullet list'],
    [/^\s*\|/m, 'a Markdown table'],
    [/hero-(static-)?(dark|light)\.svg/, 'a v1 hero asset'],
    [/(core-modules|telemetry|activity)-(dark|light)\.svg/, 'a v1 asset that v2 replaced'],
    [/ENGINEERING RECORD/i, 'the v1 "engineering record" framing'],
  ];
  for (const [pattern, description] of structural) {
    if (pattern.test(body)) {
      findings.push({ level: 'error', check: 'composition', message: `README.md contains ${description}` });
    }
  }

  // Prose budget. Outside the panels the page may carry the strapline, the
  // channels link line and the provenance line - and nothing else.
  const proseLines = body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !/^<\/?(picture|source|img|a)\b/.test(line));
  if (proseLines.length > 3) {
    findings.push({
      level: 'error',
      check: 'composition',
      message:
        `README.md carries ${proseLines.length} lines of prose outside the panels; the budget is 3 ` +
        `(strapline, channels links, provenance). Offending lines: ${proseLines.slice(3).join(' | ').slice(0, 160)}`,
    });
  }
  // Emoji ban: the profile communicates through composition, not decoration.
  const emoji = readme.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) ?? [];
  if (emoji.length) {
    findings.push({
      level: 'error',
      check: 'readme',
      message: `README.md contains ${emoji.length} emoji (${[...new Set(emoji)].join(' ')}); the target is zero`,
    });
  }
  // Third-party rendering services are banned outright.
  const badHosts =
    /(github-readme-stats|streak-stats|shields\.io|vercel\.app|herokuapp\.com|vectorlogo|devicons|alipayobjects)/i;
  const badHostHits = readme.match(badHosts) ?? [];
  if (badHostHits.length) {
    findings.push({
      level: 'error',
      check: 'readme',
      message: `README.md references a third-party rendering service: ${badHostHits[0]}`,
    });
  }

  // -- numbers in the README must be traceable ----------------------------------
  // Every standalone integer >= 10 in the prose must exist in the telemetry
  // snapshot. (Smaller integers appear in ordinary English; every headline
  // metric on this page is >= 10.)
  const known = new Set<string>();
  const collect = (value: unknown): void => {
    if (typeof value === 'number') {
      known.add(String(value));
      // Shares are stored as 0..1 fractions but quoted as percentages.
      if (value > 0 && value < 1) {
        known.add((value * 100).toFixed(1));
        known.add((value * 100).toFixed(0));
      }
    }
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
    else if (typeof value === 'string') {
      for (const number of value.match(/\d+(?:\.\d+)?/g) ?? []) known.add(number);
    }
  };
  collect(telemetry);
  // The one derived figure the page is allowed to state: the share of source
  // not covered by the four named languages. It is computed from measured
  // shares by the same function the panel draws with, so the number permitted
  // here and the number rendered cannot drift apart.
  known.add((remainderShare(telemetry) * 100).toFixed(1));
  // Section ordinals (01-04) are page structure, not measurements.
  for (const ordinal of Object.values(SECTIONS)) known.add(ordinal);
  const prose = readme
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\((?:https?:|mailto:)[^)]*\)/g, '')
    .replace(/(?:src|srcset|href|alt|media|width)="[^"]*"/g, '');
  for (const match of prose.matchAll(/(?<![\d.\w-])(\d{2,})(?:\.(\d+))?%?(?![\d\w-])/g)) {
    const whole = match[2] ? `${match[1]}.${match[2]}` : match[1]!;
    if (!known.has(whole)) {
      findings.push({
        level: 'error',
        check: 'numbers',
        message: `README.md states "${whole}", which does not occur anywhere in data/telemetry.json`,
      });
    }
  }

  // -- vendored fonts must carry their licence --------------------------------------
  // Ruled in .ai/project/02-audit.md section 3.4: font binaries with no licence
  // file alongside them fail the build.
  const fontsDir = resolve(REPO_ROOT, 'assets/fonts');
  const fontFiles = readdirSync(fontsDir).filter((f) => /.(woff2?|ttf|otf)$/i.test(f));
  const licenceFiles = readdirSync(fontsDir).filter((f) => /licen[cs]e/i.test(f));
  if (fontFiles.length > 0 && licenceFiles.length === 0) {
    findings.push({
      level: 'error',
      check: 'font-licence',
      message: `assets/fonts contains ${fontFiles.length} font binaries but no licence file`,
    });
  }
  if (fontFiles.length > 0 && !existsSync(resolve(fontsDir, 'PROVENANCE.md'))) {
    findings.push({
      level: 'error',
      check: 'font-licence',
      message: 'assets/fonts has no PROVENANCE.md recording where the binaries came from',
    });
  }

  // -- generated assets -----------------------------------------------------------
  const generatedDir = resolve(REPO_ROOT, 'assets/generated');
  const svgFiles = readdirSync(generatedDir).filter((f) => f.endsWith('.svg'));
  let totalBytes = 0;
  for (const file of svgFiles) {
    const relPath = `assets/generated/${file}`;
    findings.push(...checkSvg(relPath));
    totalBytes += statSync(resolve(generatedDir, file)).size;
  }
  if (totalBytes > SIZE_LIMITS.totalPayload) {
    findings.push({
      level: 'error',
      check: 'size',
      message: `Generated assets total ${(totalBytes / 1024).toFixed(0)} KB, over the ${SIZE_LIMITS.totalPayload / 1024} KB budget`,
    });
  }

  // The generated directory must be exactly the build set: no missing panel,
  // and no orphan left behind by a rename.
  const expected = new Set(expectedAssetPaths().map((p) => p.split('/').pop() as string));
  for (const file of expected) {
    if (!svgFiles.includes(file)) {
      findings.push({ level: 'error', check: 'assets', message: `assets/generated is missing ${file}` });
    }
  }
  for (const file of svgFiles) {
    if (!expected.has(file)) {
      findings.push({
        level: 'error',
        check: 'assets',
        message: `assets/generated/${file} is an orphan: no panel in the build set produces it`,
      });
    }
  }
  if (expected.size !== expectedAssetPaths().length) {
    findings.push({
      level: 'error',
      check: 'assets',
      message: `the build set declares ${expected.size} files, expected ${expectedAssetPaths().length} for the panel/mode contract`,
    });
  }

  // -- in-memory scene checks -------------------------------------------------------
  // The text manifests see what grep cannot: strings that were outlined.
  const builds = buildAll(telemetry);
  for (const build of builds) {
    for (const text of build.asset.texts) {
      findings.push(...checkEnglishOnly(text.value, `${build.path} [text "${text.value}"]`));
      findings.push(...checkLexicon(text.value, `${build.path} [text "${text.value}"]`));
      if (text.size < MIN_INFO_TYPE_SIZE) {
        findings.push({
          level: 'error',
          check: 'legibility',
          message:
            `${build.path} draws "${text.value}" at ${text.size}u - below the ${MIN_INFO_TYPE_SIZE}u floor ` +
            'for information-carrying text (unreadable at mobile scale)',
        });
      }
    }
    if (build.mode === 'static' && /@keyframes|animation\s*:/.test(build.asset.svg)) {
      findings.push({
        level: 'error',
        check: 'motion',
        message: `${build.path} is static but contains animation`,
      });
    }
    if (build.mode === 'animated' && !/@keyframes/.test(build.asset.svg)) {
      findings.push({
        level: 'error',
        check: 'motion',
        message: `${build.path} is animated but contains no controlled keyframes`,
      });
    }
  }

  // -- report -------------------------------------------------------------------------
  const errors = findings.filter((f) => f.level === 'error');
  const warnings = findings.filter((f) => f.level === 'warn');
  for (const finding of findings) {
    console[finding.level === 'error' ? 'error' : 'warn'](
      `  ${finding.level.toUpperCase().padEnd(5)} [${finding.check}] ${finding.message}`,
    );
  }
  console.log(
    `\n[validate] ${svgFiles.length} assets (${(totalBytes / 1024).toFixed(1)} KB), ` +
      `${builds.reduce((n, b) => n + b.asset.texts.length, 0)} manifest strings, ` +
      `${errors.length} error(s), ${warnings.length} warning(s)`,
  );
  if (errors.length) process.exitCode = 1;
}

main();
