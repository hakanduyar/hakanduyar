import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CHANNELS, FEATURED_SYSTEMS, PROFILE_COPY } from '../src/config.js';
import { REPO_ROOT } from '../src/emit.js';
import type { Telemetry } from '../src/telemetry.js';

const telemetry = JSON.parse(readFileSync(resolve(REPO_ROOT, 'data/telemetry.json'), 'utf8')) as Telemetry;

function picture(name: string, alt: string, animated = false, mobileName?: string): string {
  const reduced = animated
    ? `  <source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="assets/generated/${name}-static-dark.svg">\n` +
      `  <source media="(prefers-reduced-motion: reduce)" srcset="assets/generated/${name}-static-light.svg">\n`
    : '';
  const mobile = mobileName
    ? `  <source media="(max-width: 1080px) and (prefers-color-scheme: dark)" srcset="assets/generated/${mobileName}-dark.svg">\n` +
      `  <source media="(max-width: 1080px)" srcset="assets/generated/${mobileName}-light.svg">`
    : '';
  return [
    '<picture>',
    reduced.trimEnd(),
    mobile,
    `  <source media="(prefers-color-scheme: dark)" srcset="assets/generated/${name}-dark.svg">`,
    `  <img src="assets/generated/${name}-light.svg" alt="${alt}" width="960">`,
    '</picture>',
  ]
    .filter(Boolean)
    .join('\n');
}

function month(value: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

const featuredLinks = FEATURED_SYSTEMS.map((system) => {
  const data = telemetry.featured.find((entry) => entry.key === system.key);
  if (!data) throw new Error(`Missing telemetry for ${system.repo}`);
  return `- [${data.name}](${data.url}) — ${system.summary} _${system.stack.join(' · ')}_`;
}).join('\n');

const pushes = telemetry.recentPushes
  .map((push) => `- [${push.repo}](${push.url}) — pushed ${month(push.at)}${push.description ? `; ${push.description}` : ''}`)
  .join('\n');

const channels = CHANNELS.map((channel) => `[${channel.label}](${channel.href})`).join(' · ');
const measuredThrough = telemetry.activity.end;

const readme = `<!-- GENERATED FILE: edit src/ and scripts/, then run npm run build. -->

${picture(
  'hero',
  'Hakan Duyar identity field: a circular signal nucleus transitions through Flight, Signal, and Spatial engineering modes.',
  true,
)}

**${PROFILE_COPY.strapline}**

${PROFILE_COPY.introduction}

## Selected systems

${picture(
  'systems',
  'Four selected systems arranged as a connected mission path: DropSpot, Spark, Stock Management System, and Hunnes Academy Motion System.',
  false,
  'systems-mobile',
)}

${featuredLinks}

## Architecture

${picture(
  'architecture',
  'A layered architecture moving from interface through state and services into delivery, with an accountable engineering feedback loop.',
  false,
  'architecture-mobile',
)}

${PROFILE_COPY.architecture}

## Public signal

${picture(
  'signal',
  `Measured public GitHub activity across 52 complete weeks ending ${measuredThrough}, plus the language distribution of public non-fork repositories.`,
  false,
  'signal-mobile',
)}

The signal above is generated from GitHub's public GraphQL data: **${telemetry.activity.total.toLocaleString('en-US')} contributions across 52 complete weeks**, **${telemetry.publicRepos} public repositories**, and **${telemetry.totalCommits.toLocaleString('en-US')} default-branch commits**. Snapshot: ${telemetry.capturedAt.slice(0, 10)}.

## Current public work

${pushes}

## Channels

${channels}

<sub>${PROFILE_COPY.provenance}</sub>
`;

writeFileSync(resolve(REPO_ROOT, 'README.md'), readme, 'utf8');
console.log('[readme] wrote README.md');
