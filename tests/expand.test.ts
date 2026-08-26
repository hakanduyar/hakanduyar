import { describe, expect, it } from 'vitest';
import { optimizeSvg } from '../src/emit.js';
import { renderExpand } from '../src/scenes/expand.js';
import { THEMES } from '../src/theme.js';

describe('dark-only profile disclosure', () => {
  for (const variant of [
    { name: 'desktop', mobile: false, width: 940, id: 'expand-profile', labelX: 470, fontSize: 12 },
    { name: 'mobile', mobile: true, width: 390, id: 'expand-profile-mobile', labelX: 195, fontSize: 11.5 },
  ] as const) {
    it(`renders an accessible static ${variant.name} image control`, () => {
      const source = renderExpand(variant.mobile);

      expect(source).toContain(`role="img" aria-labelledby="${variant.id}-title ${variant.id}-desc"`);
      expect(source).toContain(`<title id="${variant.id}-title">Show more</title>`);
      expect(source).toContain(`<desc id="${variant.id}-desc">Show more profile content to view the architecture and signal visualizations.</desc>`);
      expect(source).toContain(`viewBox="0 0 ${variant.width} 64"`);
      expect(source).toContain(`<rect width="${variant.width}" height="64" fill="${THEMES.dark.bg}"/>`);
      expect(source).toContain(`font-size:${variant.fontSize}px`);
      expect(source).toContain(`<text x="${variant.labelX}" y="36" class="label" text-anchor="middle">SHOW MORE</text>`);
      expect(source).not.toMatch(/<script\b|<animate\b|<animateTransform\b|@keyframes|animation:/);
      expect(source).not.toMatch(/<polygon\b|\bHDU\b/);
    });
  }

  it('optimizes both variants deterministically', () => {
    for (const mobile of [false, true]) {
      const first = optimizeSvg(renderExpand(mobile));
      const second = optimizeSvg(renderExpand(mobile));

      expect(first).toBe(second);
      expect(optimizeSvg(first)).toBe(first);
    }
  });
});
