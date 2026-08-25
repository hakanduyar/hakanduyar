import { describe, expect, it } from 'vitest';
import { optimizeSvg } from '../src/emit.js';
import { renderExpand } from '../src/scenes/expand.js';
import { THEMES } from '../src/theme.js';

describe('dark-only profile disclosure', () => {
  it('renders an accessible static image control', () => {
    const source = renderExpand();

    expect(source).toContain('role="img" aria-labelledby="expand-profile-title expand-profile-desc"');
    expect(source).toContain('<title id="expand-profile-title">View architecture and signal</title>');
    expect(source).toContain('<desc id="expand-profile-desc">Expand the profile to view the architecture and signal visualizations.</desc>');
    expect(source).toContain(`<rect width="400" height="64" fill="${THEMES.dark.bg}"/>`);
    expect(source).toContain('VIEW ARCHITECTURE + SIGNAL');
    expect(source).not.toMatch(/<script\b|<animate\b|<animateTransform\b|@keyframes|animation:/);
    expect(source).not.toMatch(/<polygon\b|\bHDU\b/);
  });

  it('optimizes deterministically', () => {
    const first = optimizeSvg(renderExpand());
    const second = optimizeSvg(renderExpand());

    expect(first).toBe(second);
    expect(optimizeSvg(first)).toBe(first);
  });
});
