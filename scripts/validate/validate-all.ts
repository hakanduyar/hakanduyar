/**
 * The validation harness — everything that can be checked without a browser.
 *
 * Run by `npm run validate`, by the unit tests, and by CI. A failure here is a
 * build failure; there are no advisory warnings that scroll past unread.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { REPO_ROOT } from '../../src/shared/emit.js';
import { buildAll, loadTelemetry } from '../../src/build.js';
import {
  checkSvg,
  checkEnglishOnly,
  checkAltText,
  checkAssetsResolve,
  checkReducedMotionSources,
  checkVariantPair,
  SIZE_LIMITS,
  type Finding,
} from './checks.js';
import { MIN_INFO_TYPE_SIZE } from '../../src/shared/tokens.js';

/**
 * Words that would put the profile straight back into the genre it is built to
 * avoid. Sourced from the design brief's banned lexicon; checked against the
 * README and against every string drawn inside every asset.
 */
const BANNED_LEXICON = [
  'MISSION CONTROL', 'DIRECTIVES', 'END TRANSMISSION', 'INITIALIZING', 'INITIALISING',
  'BOOT SEQUENCE', 'ACCESS GRANTED', 'SYSTEM ONLINE', 'NOMINAL', 'STATUS: OK',
  'UPLINK', 'DOWNLINK', 'SUBSYSTEM', 'NEURAL', 'QUANTUM', 'CLASSIFIED', 'CLEARANCE',
  'AI-POWERED', 'NEXT-GEN', 'CYBER', 'MATRIX', 'HACKER', 'NINJA', 'ROCKSTAR', 'GURU',
  'WIZARD', '10X', 'PASSIONATE', 'PIXEL-PERFECT', 'WELCOME', 'LOADING',
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
  findings.push(...checkReducedMotionSources(readme));

  if (!/GENERATED FILE/.test(readme)) {
    findings.push({ level: 'error', check: 'readme', message: 'README.md is missing its generated-file header' });
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

  for (const theme of ['dark', 'light'] as const) {
    findings.push(
      ...checkVariantPair(`assets/generated/hero-${theme}.svg`, `assets/generated/hero-static-${theme}.svg`),
    );
  }

  // -- in-memory scene checks -------------------------------------------------------
  // The text manifests see what grep cannot: strings that were outlined.
  const builds = buildAll(telemetry);
  for (const build of builds) {
    for (const text of build.asset.texts) {
      findings.push(...checkEnglishOnly(text.value, `${build.path} [text "${text.value}"]`));
      findings.push(...checkLexicon(text.value, `${build.path} [text "${text.value}"]`));
      if (!text.decorative && text.size < MIN_INFO_TYPE_SIZE) {
        findings.push({
          level: 'error',
          check: 'legibility',
          message:
            `${build.path} draws "${text.value}" at ${text.size}u - below the ${MIN_INFO_TYPE_SIZE}u floor ` +
            'for information-carrying text (unreadable at mobile scale)',
        });
      }
      // Even annotation that is duplicated in Markdown has an absolute floor:
      // below 16u the string is pure texture, and texture violates RULE 1.
      if (text.decorative && text.size < 16) {
        findings.push({
          level: 'error',
          check: 'legibility',
          message: `${build.path} draws decorative text "${text.value}" at ${text.size}u, below the 16u absolute floor`,
        });
      }
    }
    const hasAnimation = /@keyframes/.test(build.asset.svg);
    if (build.animated && !hasAnimation) {
      findings.push({ level: 'error', check: 'variant', message: `${build.path} should animate but has no @keyframes` });
    }
    if (!build.animated && hasAnimation) {
      findings.push({ level: 'error', check: 'variant', message: `${build.path} is a static build but contains @keyframes` });
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
