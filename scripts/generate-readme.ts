import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FEATURED_SYSTEMS, PROFILE_COPY } from '../src/config.js';
import { REPO_ROOT } from '../src/emit.js';
import type { Telemetry } from '../src/telemetry.js';

const telemetry = JSON.parse(readFileSync(resolve(REPO_ROOT, 'data/telemetry.json'), 'utf8')) as Telemetry;

function escapeAttribute(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] ?? character);
}

function picture(name: string, alt: string, animated = false, responsive = false): string {
  const sources: string[] = [];
  if (animated && responsive) {
    sources.push(`  <source media="(prefers-reduced-motion: reduce) and (max-width: 1080px)" srcset="assets/generated/${name}-mobile-static-dark.svg">`);
  }
  if (animated) {
    sources.push(`  <source media="(prefers-reduced-motion: reduce)" srcset="assets/generated/${name}-static-dark.svg">`);
  }
  if (responsive) {
    sources.push(`  <source media="(max-width: 1080px)" srcset="assets/generated/${name}-mobile-dark.svg">`);
  }
  return ['<picture>', ...sources, `  <img src="assets/generated/${name}-dark.svg" alt="${escapeAttribute(alt)}" width="960" align="top">`, '</picture>'].join('\n');
}

const measuredThrough = telemetry.activity.end;
const systemsAlt = FEATURED_SYSTEMS
  .map((system) => `${system.label}: ${system.summary} Stack: ${system.stack.join(', ')}.`)
  .join(' ');
const languagesAlt = telemetry.languages
  .slice(0, 4)
  .map((language) => `${language.name} ${(language.share * 100).toFixed(1)} percent`)
  .join(', ');

const readme = `<!-- GENERATED FILE: edit src/ and scripts/, then run npm run build. -->

${picture(
  'hero',
  `Hakan Duyar. ${PROFILE_COPY.strapline} ${PROFILE_COPY.introduction} A circular signal nucleus transitions through Flight, Signal, and Spatial engineering modes.`,
  true,
)}${picture(
  'systems',
  `Four selected systems arranged as a connected mission path. ${systemsAlt}`,
  true,
  true,
)}<details><summary><picture>
  <source media="(max-width: 1080px)" srcset="assets/generated/expand-mobile-dark.svg">
  <img src="assets/generated/expand-dark.svg" alt="Show architecture and public signal" width="95%" align="middle">
</picture></summary>${picture(
  'architecture',
  'A layered architecture moving from interface through state and services into delivery, with an accountable engineering feedback loop.',
  true,
  true,
)}${picture(
  'signal',
  `Measured public GitHub activity: ${telemetry.activity.total} contributions across 52 complete weeks ending ${measuredThrough}; ${telemetry.publicRepos} public non-fork repositories; ${telemetry.totalCommits} default-branch commits. Public source languages: ${languagesAlt}. Snapshot ${telemetry.capturedAt.slice(0, 10)}.`,
  true,
  true,
)}</details>
`;

writeFileSync(resolve(REPO_ROOT, 'README.md'), readme, 'utf8');
console.log('[readme] wrote README.md');
