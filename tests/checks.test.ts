/**
 * Unit tests for the validator itself.
 *
 * A validation harness that silently stops catching things is worse than none:
 * these tests feed known-bad inputs and assert the checks still fire, and feed
 * known-good edge cases and assert they pass.
 */

import { describe, it, expect } from 'vitest';
import {
  checkEnglishOnly,
  checkAltText,
  checkPictureSources,
  sizeBudgetFor,
  SIZE_LIMITS,
} from '../scripts/validate/checks.js';

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

describe('checkPictureSources', () => {
  const staticPicture = `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="a-dark.svg">
  <img src="a-light.svg" alt="a sufficiently descriptive alternative text">
</picture>`;

  const animatedPicture = `<picture>
  <source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="identity-static-dark.svg">
  <source media="(prefers-reduced-motion: reduce)" srcset="identity-static-light.svg">
  <source media="(prefers-color-scheme: dark)" srcset="identity-dark.svg">
  <img src="identity-light.svg" alt="a sufficiently descriptive alternative text">
</picture>`;

  it('accepts a plain dark source with a light fallback for static panels', () => {
    expect(checkPictureSources(staticPicture)).toHaveLength(0);
  });

  it('accepts the four-source reduced-motion ladder for animated panels', () => {
    expect(checkPictureSources(animatedPicture)).toHaveLength(0);
  });

  it('rejects a reduced-motion ladder with the wrong order or filenames', () => {
    const v1 = `<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="a-static-light.svg">
  <source media="(prefers-color-scheme: dark)" srcset="a-dark.svg">
  <img src="a-light.svg" alt="a sufficiently descriptive alternative text">
</picture>`;
    const findings = checkPictureSources(v1);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => /source ladder/.test(f.message))).toBe(true);
  });

  it('rejects a picture with no dark source at all', () => {
    const noDark = `<picture>
  <img src="a-light.svg" alt="a sufficiently descriptive alternative text">
</picture>`;
    expect(checkPictureSources(noDark).length).toBeGreaterThan(0);
  });
});

describe('sizeBudgetFor', () => {
  it('applies one static budget to every asset, with no per-name exemption', () => {
    for (const name of ['identity-dark.svg', 'signal-light.svg', 'hero-dark.svg']) {
      expect(sizeBudgetFor(name)).toBe(SIZE_LIMITS.staticAsset);
    }
  });
});
