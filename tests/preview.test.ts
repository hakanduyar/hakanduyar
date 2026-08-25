import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const preview = readFileSync(resolve(process.cwd(), 'preview/index.html'), 'utf8');
const stage = readFileSync(resolve(process.cwd(), 'preview/scene-stage.html'), 'utf8');

describe('preview asset selection smoke coverage', () => {
  it('emits one profile image per scene with every required responsive fallback', () => {
    expect(preview.match(/class="profile-visual"/g)).toHaveLength(4);
    expect(preview).toContain('data-static-light="../assets/generated/hero-static-light.svg"');
    for (const scene of ['systems', 'architecture', 'signal']) {
      expect(preview).toContain(`data-static-dark="../assets/generated/${scene}-static-dark.svg"`);
      expect(preview).toContain(`data-mobile-light="../assets/generated/${scene}-mobile-light.svg"`);
      expect(preview).toContain(`data-mobile-static-dark="../assets/generated/${scene}-mobile-static-dark.svg"`);
    }
  });

  it('keeps the simulated README body image-only', () => {
    const body = preview.match(/<div class="markdown">\s*([\s\S]*?)\s*<\/div><\/article>/)?.[1] ?? '';
    expect(body.match(/<img\b[^>]*class="profile-visual"[^>]*>/g)).toHaveLength(4);
    expect(body.replace(/<img\b[^>]*>/g, '').trim()).toBe('');
  });

  it('selects reduced mobile before reduced desktop, then animated mobile and desktop', () => {
    const selector = preview.match(/function render\(\)\{.+?\}\n/s)?.[0] ?? '';
    const order = [
      'reduced&&compact&&image.dataset[mobileStaticKey]',
      'reduced&&image.dataset[staticKey]',
      'compact&&image.dataset[mobileKey]',
      'image.dataset[key]',
    ].map((token) => selector.indexOf(token));
    expect(order.every((position) => position >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('builds deterministic QA-stage names for all four scenes', () => {
    for (const scene of ['hero', 'systems', 'architecture', 'signal']) expect(stage).toContain(`'${scene}'`);
    expect(stage).toContain("if(mobile)parts.push('mobile')");
    expect(stage).toContain("if(reduced)parts.push('static')");
    expect(stage).toContain("parts.push(dark?'dark':'light')");
    expect(stage).toContain("run?'?run='+encodeURIComponent(run):''");
  });
});
