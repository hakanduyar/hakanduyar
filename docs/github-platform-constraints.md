# GitHub README platform constraints — measured, not assumed

Every rule below was verified on 2026-08-23 against real Chromium and GitHub's
own Markdown pipeline, and every measurement is reproducible from a clean
clone with **`npm run probe:platform`** (`scripts/probe/platform-probes.ts`).
Do not change the asset architecture on the basis of a blog post; re-run the
probes and update this file from their output.

## 1. How the assets are embedded

GitHub rewrites `<img src="assets/...">` in a README to a proxied URL and
renders it as a replaced image. The SVG therefore executes as an **SVG image
document**, not as inline SVG. That single fact drives everything else.

## 2. Animation inside an SVG image

| Technique | Runs inside `<img>`? | Evidence |
|---|---|---|
| CSS `@keyframes` + `animation` (unguarded) | **YES** | bar centroid moved `186 → 596 → 393` across three samples |
| CSS animation wrapped in `@media (prefers-reduced-motion: no-preference)` | **NO** | centroid pinned at `80` for every sample, in both headless and headed Chrome |
| SMIL `<animate>` / `<animateTransform>` | **YES** | centroid moved `241 → 631 → 364` |

**Historical ruling — no longer in force.** When this repository shipped an
animated hero, the ruling was: use unguarded CSS keyframes, because they
compose better than SMIL and are the only technique giving per-glyph stagger
without an element explosion.

**Current ruling: static SVG only.** Nothing this repository generates
animates, and the engine cannot produce motion — `Canvas` has no animation
register and `checkSvg` fails the build on keyframes, `animation`,
`transition`, SMIL or a motion query. The table above is kept because it is the
measurement, and the row that matters most is the second one: a
`prefers-reduced-motion` guard *does not work* inside an SVG image, so any
future animation here would have to ship a second static file and choose
between them in the README document. That cost is a large part of why v2 does
not animate. See [architecture.md](architecture.md#why-nothing-animates).

## 3. Media queries inside an SVG image

| Feature | Behaviour inside the image document |
|---|---|
| `prefers-color-scheme` | **Correctly inherits the host page.** Dark host → dark rules; light host → light rules. |
| `prefers-reduced-motion: reduce` | **Always matches**, regardless of the real user setting. |
| `prefers-reduced-motion: no-preference` | **Never matches**, regardless of the real user setting. |

Consequence: **reduced motion cannot be honoured from inside the SVG.** A
`no-preference` guard silently disables the animation for everyone; a `reduce`
override silently disables it for everyone. Both were measured. Any code that
reintroduces either guard is a bug — the validation harness (`scripts/validate/checks.ts`) and `tests/scene.test.ts` fail the build if
an asset contains a `prefers-reduced-motion` media query.

## 4. Where reduced motion *is* honoured

`<picture>` `media` attributes are evaluated by the **README document**, which
does see the real user preference. GitHub's sanitizer preserves them, including
compound queries. Verified against `POST /markdown`:

```html
<source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="...-static-dark.svg">
<source media="(prefers-reduced-motion: reduce)" srcset="...-static-light.svg">
<source media="(prefers-color-scheme: dark)" srcset="...-dark.svg">
<img alt="..." src="...-light.svg">
```

survives verbatim. First matching `<source>` wins, so the reduced-motion pair
must be declared before the theme pair.

**This repository no longer uses that ladder.** It is recorded here because the
measurement is the reason it was ever needed: a `prefers-reduced-motion` guard
placed *inside* an SVG image does not report the viewer's real setting (§3), so
honouring the preference meant shipping a second file and choosing between them
in the README document. v2 ships nothing that moves, so every asset is a plain
dark/light pair and each `<picture>` declares exactly one `<source>`. Anyone
reintroducing motion here needs this section again — and needs to ship four
files per animated asset, not two.

## 5. What GitHub's sanitizer keeps and drops

Measured through `POST /markdown` with `mode=gfm`.

**Kept:** `<picture>`, `<source media srcset>`, `<img src alt width height align>`,
`<a href>`, `<div align>`, `<p align>`, `<h1-h6 align>`, `<table width>`,
`<details>`, `<summary>`, `<blockquote>`, `<hr>`, `<kbd>`, `<sub>`, `<sup>`.

**Dropped:** the `style` attribute on any element, `loading`, `decoding`, and
anything script-bearing. GitHub *injects* `style="max-width: 100%"` onto images
itself, which is what makes a `viewBox`-only SVG scale down on mobile.

**Auto-wrapped:** a bare `<img>` is wrapped in a link to the image file. To
control the destination, wrap the image in your own `<a href>`.

## 6. Sizing rule

Emitted SVGs have their `width`/`height` attributes stripped and keep only the
`viewBox` (see `src/shared/emit.ts`). Combined with GitHub's injected
`max-width: 100%`, the asset fills the README column on desktop (~890px) and
scales down cleanly to mobile (~360px) without horizontal overflow. Nothing in
an asset may rely on a fixed pixel size.

Because assets scale down by roughly 2.4x on mobile, the smallest type in any
asset is sized so that it stays legible at that scale — enforced by the
legibility checks in `scripts/validate/validate-all.ts`.

## 7. Fonts

An SVG image document cannot fetch anything: no webfont, no CSS import, no
external reference. Naming a font family only works if the viewer happens to
have it installed, and the fallback metrics differ per OS, which shifts every
layout that was measured at build time.

**Ruling: all text is converted to vector outlines at build time**
(`src/shared/type.ts`, via `fontkit`). Identical pixels for every viewer, at any
zoom. The cost is that the text is not selectable, which is mitigated by
`<title>`/`<desc>` on every asset and by the README repeating all critical
information as real Markdown.
