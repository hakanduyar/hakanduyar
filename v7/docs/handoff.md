# V7.1 visual proof — handoff

## V7.2 update (dual-theme + corporate motion)

Implements `v7/docs/v7.2-dual-motion-task.md` on top of the V7.1 composition below, without changing the visual identity:

- **Mobile overflow fixed** — the RUNTIME plane's "operating foundation" annotation was a single un-hyphenated phrase, so the mobile role-note wrapper (which only splits on ` · `) never wrapped it, letting it run past the 390px viewBox. `wrapRoleNote` in `v7/src/generate.ts` now falls back to word-wrap when a segment has no dot to break on. No font or logo size changed.
- **Desktop footer collision fixed** — the left/right footer lines were long enough to overlap on desktop (visible in the previously shipped dark asset). `renderFooter` now measures both strings and stacks them instead of overlapping when they don't fit side by side.
- **Light theme restored** — `v7/scripts/build.ts` and `v7/scripts/qa.ts` generate and validate all four `desktop/mobile × light/dark` variants again (V7.1's "dark ships alone" restriction is lifted). The README `<picture>` now switches on `prefers-color-scheme` (combined with the existing `max-width` mobile breakpoint) instead of shipping dark-only.
- **Corporate motion pass** — `v7/src/generate.ts` adds, all CSS-only and guarded by `@media (prefers-reduced-motion: no-preference)`, with the base SVG attribute state remaining the fully resolved drawing:
  - a `spine-*` draw-in of the hero's central axis (the request/data path travelling down through the five planes);
  - a `reveal` fade/lift stagger on each system's technology marks (`pm-*` ids);
  - a `path-*` draw-in of the AI delivery line (specify → release);
  - a restrained `emphasize` stroke-width pulse on the two human-gate diamonds, timed to when the delivery line reaches them;
  - the existing per-plane connector resolve and review→implement repair-loop draw are unchanged.
- Evidence now builds to `v7/evidence/v7.2-dual-motion/` (four PNGs); `v7/preview/index.html` shows all four variants side by side for local review.
- Version labels inside the artwork (masthead kicker, footer, `aria-label`) were bumped V7.1 → V7.2; the V6-derived visual language, architecture, systems order, and delivery path are unchanged.

---

## Scope and status

Isolated visual proof on `feat/hdu-profile-v7-visual-proof`, replacing the rejected first V7 draft. It does not replace `README.md`, modify `main`, or publish anything. **Stops at the owner visual-proof gate.**

## What changed from the rejected V7

The first draft was a flat, card-heavy dashboard (pill chips, uniform boxes, GitHub-blue accents) with no logos. V7.1 rebuilds the proof on V6's editorial print language instead of flattening it:

- **Architecture-led hero** — one exploded axonometric section (the V6 hero's skeleton: central axis, side rails, stacked planes, monospace annotations with leader lines), extended to five planes: interface, application, data, delivery, runtime. Real technology marks stand on the planes as pinned semantic elements. **React and TypeScript are the two largest marks** and anchor the interface and application planes; QA enforces this.
- **Real, local logos** — every displayed technology renders its recognizable mark from `v7/assets/logos/` (vendored simple-icons path data, inlined as `<path>`; no external URLs, no `<image>`). Source/license strategy: `v7/assets/logos/SOURCES.md`.
- **Systems as an editorial ledger, not four uniform cards** — full-width numbered entries with serif names, hairline separators, natural height variation, and small monochrome truth markers (filled square = built, dashed square = concept, half-filled square = contribution). Each built system carries its technology marks; the concept carries a dashed "not built — direction" glyph instead.
- **AI workflow as one integrated path** — a single delivery line (specify → plan → approve ◇ → implement → verify → review → release ◇) with two human-gate diamonds and a dashed repair return from review to implement. Horizontal on desktop, vertical on mobile.
- **Typography** — serif display (Georgia stack) + monospace annotations (Consolas stack) replacing the generic UI-sans look. Warm paper / charcoal grounds from V6.
- **Motion** — only meaningful resolving connections (pin stems, leader lines, repair return) draw in once, via CSS guarded by `@media (prefers-reduced-motion: no-preference)`. The base SVG attribute state **is** the resolved drawing, so reduced-motion viewers and the PNG raster path see the identical final image. No SMIL, no scripts.

## Evidence

- `v7/assets/generated/v7-{desktop,mobile}-{light,dark}.svg` — deterministic, repository-local source assets (1240 / 430 wide).
- `v7/evidence/v7.1-visual-proof/v7-{desktop,mobile}-{light,dark}.png` — rendered review evidence (2× raster via sharp).
- `v7/preview/index.html` — theme-aware side-by-side preview.
- `npm run v7:logos` — re-vendors logo marks from the pinned simple-icons package into repo-local files.
- `npm run v7:build` — regenerates every asset and proof image.
- `npm run v7:qa` — validates XML well-formedness, no scripts/external hosts/`<image>`/custom properties, required logo marks present and using vendored path data, React/TypeScript primacy over every other mark, exact system order and truth markers, five architecture planes, delivery-path nodes with two human gates, reduced-motion guard, mobile viewBox ceiling, and evidence PNG presence.
- `npm run typecheck` — validates the V7 TypeScript source.

## Claim boundaries (unchanged truth)

| System | Marker | Boundary |
| --- | --- | --- |
| Software Factory | Concept | Direction only; no issue/PR automation, orchestration, deployment, or control-room UI built. |
| Spark | Built | Local-first React/TypeScript PWA; on-device only — no backend, login, cloud sync, or claimed test suite. |
| Built in Layers | Built | Deterministic typed content/delivery evidence; not a full design system, no WCAG AAA claim. |
| JointLedger | Contribution | Docker + PostgreSQL runtime contribution; engine and UI inherited from upstream, unreleased shared-book areas not claimed. |

Vue (JointLedger's inherited UI) is deliberately not displayed as a technology mark — see the exclusions note in `SOURCES.md`.

## Known gaps before production

1. Owner must approve or redirect this visual direction (current gate).
2. Production integration would convert the approved composition into README `<picture>` blocks (likely re-cut into hero/systems/delivery assets at README widths) without changing truth boundaries.
3. The CSS resolve animation should be verified on github.com rendering separately before any animated asset ships; the static state is already the production-safe baseline.
4. PNG rasters depend on locally installed Georgia/Consolas; the SVGs carry full fallback stacks for other viewers.
