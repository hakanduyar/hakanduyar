import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { GENERATED_ASSET_NAMES } from '../src/assets.js';
import { REPO_ROOT } from '../src/emit.js';
import { V5_PROJECTS } from '../src/v5/content.js';
import { V5_SCENE_DIMENSIONS } from '../src/v5/scenes-compact.js';

describe('V5 production profile', () => {
  const readme = readFileSync(resolve(REPO_ROOT, 'README.md'), 'utf8');

  it('publishes a generated, image-led identity followed by one Show more disclosure', () => {
    const visible = readme.replace(/<!--[\s\S]*?-->/g, '').trim();
    expect(visible).toMatch(/^<picture>[\s\S]*?<\/picture><details><summary><picture>/);
    expect(visible.match(/<details\b/g)).toHaveLength(1);
    expect(visible.match(/<summary\b/g)).toHaveLength(1);
    expect(visible.match(/<picture>/g)).toHaveLength(9);
    expect(visible).not.toMatch(/<details\b[^>]*\bopen/);
    expect(visible).not.toMatch(/<(?:p|br|h[1-6]|ul|ol|table)\b/i);
  });

  it('keeps the owner-specified application order and direct project links', () => {
    expect(V5_PROJECTS.map((project) => project.name)).toEqual([
      'Software Factory',
      'Spark',
      'Built in Layers',
      'JointLedger',
    ]);
    const positions = V5_PROJECTS.map((project) => readme.indexOf(project.repo));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('keeps GitHub theme sources separate from viewport and reduced-motion conditions', () => {
    expect(readme).toContain('prefers-color-scheme: dark');
    expect(readme).toContain('prefers-reduced-motion: reduce');
    expect(readme).not.toMatch(/media="[^"]*prefers-color-scheme[^"]*\band\b|media="[^"]*\band\b[^"]*prefers-color-scheme/);
    for (const scene of ['architecture', 'ai']) {
      expect(readme).toContain(`assets/generated/${scene}-dark.gif`);
      expect(readme).toContain(`assets/generated/${scene}-light.gif`);
      expect(readme).toContain(`assets/generated/${scene}-static-dark.svg`);
      expect(readme).toContain(`assets/generated/${scene}-mobile-static-dark.svg`);
      expect(readme).not.toContain(`assets/generated/${scene}-mobile-light.gif`);
    }
  });

  it('tracks exactly the forty-four generated V5 assets', () => {
    expect(GENERATED_ASSET_NAMES).toHaveLength(44);
    expect(new Set(GENERATED_ASSET_NAMES).size).toBe(44);
  });

  it('uses concise evidence labels instead of visible defensive paragraphs', () => {
    const sceneNames = ['project-factory-dark.svg', 'project-spark-dark.svg', 'project-layers-dark.svg', 'project-ledger-dark.svg', 'capability-dark.svg'];
    const scenes = sceneNames.map((name) => readFileSync(resolve(REPO_ROOT, 'assets/generated', name), 'utf8')).join('\n');
    expect(scenes).toContain('Four systems. Four evidence paths.');
    expect(scenes).toContain('Agents work. Human release authority remains separate.');
    expect(scenes).toContain('CONTRIBUTION');
    expect(scenes).not.toMatch(/NOT CLAIMED|SCOPE BOUNDARY|WORKING FAMILIARITY/i);
  });

  it('keeps the expanded visual narrative below the compression budgets', () => {
    const svgHeight = (name: string): number => {
      const source = readFileSync(resolve(REPO_ROOT, 'assets/generated', name), 'utf8');
      const match = source.match(/viewBox="0 0 \d+ (\d+)"/);
      return Number(match?.[1] ?? 0);
    };
    const projectNames = ['factory', 'spark', 'layers', 'ledger'];
    const desktop = V5_SCENE_DIMENSIONS.architecture.desktop[1]
      + V5_SCENE_DIMENSIONS.ai.desktop[1]
      + svgHeight('capability-dark.svg')
      + projectNames.reduce((sum, name) => sum + svgHeight(`project-${name}-dark.svg`), 0);
    const mobile = V5_SCENE_DIMENSIONS.architecture.mobile[1]
      + V5_SCENE_DIMENSIONS.ai.mobile[1]
      + svgHeight('capability-mobile-dark.svg')
      + projectNames.reduce((sum, name) => sum + svgHeight(`project-${name}-mobile-dark.svg`), 0);
    expect(desktop).toBeLessThanOrEqual(2_000);
    expect(mobile).toBeLessThanOrEqual(3_000);
  });
});
