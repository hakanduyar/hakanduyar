import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const preview = readFileSync(resolve(process.cwd(), 'preview/index.html'), 'utf8');
const stage = readFileSync(resolve(process.cwd(), 'preview/scene-stage.html'), 'utf8');

describe('preview asset selection smoke coverage', () => {
  it('emits four dark-only profile visuals with every required responsive fallback', () => {
    expect(preview.match(/class="profile-visual"/g)).toHaveLength(4);
    expect(preview.match(/class="expand-visual"/g)).toHaveLength(1);
    expect(preview).toContain('src="../assets/generated/expand-dark.svg"');
    expect(preview).toContain('srcset="../assets/generated/expand-mobile-dark.svg"');
    expect(preview).toContain('width="95%" align="middle"');
    expect(preview).not.toContain('href="https://github.com/settings/appearance"');
    expect(preview).not.toContain('theme-control');
    expect(preview).not.toMatch(/assets\/generated\/[^"']+-light\.svg/);
    expect(preview).toContain('data-desktop="../assets/generated/hero-dark.svg"');
    expect(preview).toContain('data-static="../assets/generated/hero-static-dark.svg"');
    for (const scene of ['systems', 'architecture', 'signal']) {
      expect(preview).toContain(`data-desktop="../assets/generated/${scene}-dark.svg"`);
      expect(preview).toContain(`data-static="../assets/generated/${scene}-static-dark.svg"`);
      expect(preview).toContain(`data-mobile="../assets/generated/${scene}-mobile-dark.svg"`);
      expect(preview).toContain(`data-mobile-static="../assets/generated/${scene}-mobile-static-dark.svg"`);
    }
  });

  it('keeps the simulated README hierarchy and native disclosure image-only', () => {
    const body = preview.match(/<div class="markdown">\s*([\s\S]*?)\s*<\/div><\/article>/)?.[1] ?? '';
    expect(body).not.toMatch(/>\s+</);
    expect(body).not.toMatch(/<a\b/);
    expect(body).not.toMatch(/<details\b[^>]*\bopen(?:\s|=|>)/i);
    expect(body.match(/<img\b[^>]*class="profile-visual"[^>]*>/g)).toHaveLength(4);
    const hierarchy = body
      .replace(/<img\b[^>]*class="profile-visual"[^>]*>/g, ' IMG ')
      .replace(/<img\b[^>]*class="expand-visual"[^>]*>/g, ' EXPAND ')
      .replace(/<source\b[^>]*>/g, ' SOURCE ')
      .replace(/<picture\b[^>]*>/g, ' PICTURE ')
      .replace(/<\/picture>/g, ' /PICTURE ')
      .replace(/<details\b[^>]*>/g, ' DETAILS ')
      .replace(/<summary\b[^>]*>/g, ' SUMMARY ')
      .replace(/<\/summary>/g, ' /SUMMARY ')
      .replace(/<\/details>/g, ' /DETAILS ')
      .replace(/\s+/g, ' ')
      .trim();
    expect(hierarchy).toBe('IMG IMG DETAILS SUMMARY PICTURE SOURCE EXPAND /PICTURE /SUMMARY IMG IMG /DETAILS');

    const details = body.match(/<details\b[^>]*>\s*([\s\S]*?)\s*<\/details>/)?.[1] ?? '';
    const summary = details.match(/<summary>\s*([\s\S]*?)\s*<\/summary>/)?.[1] ?? '';
    expect(summary.match(/<img\b[^>]*>/g)).toHaveLength(1);
    expect(summary.match(/<picture>[\s\S]*?<\/picture>/g)).toHaveLength(1);
    expect(summary.match(/<source\b[^>]*>/g)).toHaveLength(1);
    expect(summary).toMatch(/^<picture><source media="\(max-width: 1080px\)" srcset="\.\.\/assets\/generated\/expand-mobile-dark\.svg"><img\b[^>]*><\/picture>$/);
    expect(summary).toContain('srcset="../assets/generated/expand-mobile-dark.svg"');
    expect(summary).toContain('src="../assets/generated/expand-dark.svg"');
    expect(summary).toContain('alt="Show architecture and public signal"');
    expect(summary).toContain('width="95%" align="middle"');
    expect(summary).not.toMatch(/<a\b/);
    expect(summary.replace(/<picture>[\s\S]*?<\/picture>/g, '').trim()).toBe('');
    const detailsContent = details.replace(/<summary>[\s\S]*?<\/summary>/, '');
    expect(detailsContent.match(/<img\b[^>]*class="profile-visual"[^>]*>/g)).toHaveLength(2);
    expect(detailsContent).toContain('data-desktop="../assets/generated/architecture-dark.svg"');
    expect(detailsContent).toContain('data-desktop="../assets/generated/signal-dark.svg"');
    expect(body.replace(/<[^>]+>/g, '').trim()).toBe('');
  });

  it('offers a deterministic expanded QA hook without adding an app control', () => {
    expect(preview).toContain("const expanded=params.get('expanded')==='1'");
    expect(preview).toContain("document.querySelector('.profile-details').open=expanded");
    expect(preview).not.toContain('data-action="expanded"');
  });

  it('selects reduced mobile before reduced desktop, then animated mobile and desktop', () => {
    const selector = preview.match(/function render\(\)\{.+?\}\n/s)?.[0] ?? '';
    const order = [
      'reduced&&compact&&image.dataset.mobileStatic?',
      ':reduced&&image.dataset.static?',
      ':compact&&image.dataset.mobile?',
      ':image.dataset.desktop',
    ].map((token) => selector.indexOf(token));
    expect(order.every((position) => position >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('builds deterministic dark-only QA-stage names for all four scenes', () => {
    expect(stage).not.toContain('theme-control');
    for (const scene of ['hero', 'systems', 'architecture', 'signal']) expect(stage).toContain(`'${scene}'`);
    expect(stage).toContain("if(mobile)parts.push('mobile')");
    expect(stage).toContain("if(reduced)parts.push('static')");
    expect(stage).toContain("parts.push('dark')");
    expect(stage).not.toMatch(/parts\.push\([^\n]*light/);
    expect(stage).toContain("run?'?run='+encodeURIComponent(run):''");
  });
});
