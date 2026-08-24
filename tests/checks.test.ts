/**
 * Unit tests for the validator itself.
 *
 * A validation harness that silently stops catching things is worse than none:
 * these tests feed known-bad inputs and assert the checks still fire, and feed
 * known-good edge cases and assert they pass.
 */

import { describe, it, expect } from 'vitest';
import { checkEnglishOnly, checkAltText, checkReducedMotionSources } from '../scripts/validate/checks.js';

describe('checkEnglishOnly', () => {
  it('flags Turkish-specific characters', () => {
    const findings = checkEnglishOnly('SİSTEM ÇEVRİMİÇİ', 'probe');
    expect(findings.some((f) => f.check === 'language')).toBe(true);
  });

  it('flags common Turkish words as whole words', () => {
    expect(checkEnglishOnly('merhaba ben Hakan', 'probe').length).toBeGreaterThan(0);
    expect(checkEnglishOnly('projelerim ve teknolojiler', 'probe').length).toBeGreaterThan(0);
  });

  it('does not flag English that merely contains Turkish substrings', () => {
    // "ve" inside "developer", "bir" inside "birthday" must not fire.
    expect(checkEnglishOnly('developer birthday drive', 'probe')).toHaveLength(0);
  });

  it('does not flag ordinary loanword diacritics', () => {
    expect(checkEnglishOnly('café naïve résumé', 'probe')).toHaveLength(0);
  });
});

describe('checkAltText', () => {
  it('rejects a missing alt', () => {
    expect(checkAltText('<img src="x.svg">').some((f) => f.check === 'a11y')).toBe(true);
  });

  it('rejects a thin alt', () => {
    expect(checkAltText('<img src="x.svg" alt="logo">').some((f) => f.check === 'a11y')).toBe(true);
  });

  it('accepts a descriptive alt', () => {
    expect(checkAltText('<img src="x.svg" alt="Weekly contribution activity for 52 weeks">')).toHaveLength(0);
  });
});

describe('checkReducedMotionSources', () => {
  const staticFirst = `<picture>
  <source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="a-static-dark.svg">
  <source media="(prefers-reduced-motion: reduce)" srcset="a-static-light.svg">
  <source media="(prefers-color-scheme: dark)" srcset="a-dark.svg">
  <img src="a-light.svg" alt="a sufficiently descriptive alternative text">
</picture>`;

  it('accepts reduced-motion sources declared first', () => {
    expect(checkReducedMotionSources(staticFirst)).toHaveLength(0);
  });

  it('rejects a picture whose reduced-motion source is not first (first match wins)', () => {
    const wrongOrder = `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="a-dark.svg">
  <source media="(prefers-reduced-motion: reduce)" srcset="a-static-light.svg">
  <img src="a-light.svg" alt="a sufficiently descriptive alternative text">
</picture>`;
    expect(checkReducedMotionSources(wrongOrder).length).toBeGreaterThan(0);
  });

  it('rejects a static asset reference with no reduced-motion source at all', () => {
    const missing = `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="a-static-dark.svg">
  <img src="a-light.svg" alt="a sufficiently descriptive alternative text">
</picture>`;
    expect(checkReducedMotionSources(missing).length).toBeGreaterThan(0);
  });
});
