# V2 implementation backlog

## V1 dependency inventory

The redesign affects more than `README.md`:

- `src/build.ts` hardcodes 18 outputs, animated/static hero variants, and separate `telemetry`/`activity` assets.
- `src/hero/hero.ts` contains `ENGINEERING RECORD`, the `animated` parameter, all keyframes, and duplicated telemetry.
- `src/shared/canvas.ts`, `src/shared/tokens.ts`, and `src/shared/emit.ts` contain animation-only machinery.
- `scripts/generate/readme.ts` hardcodes every v1 section, telemetry table, active-work list, principles list, reduced-motion sources, and linked system images.
- `scripts/validate/checks.ts` contains `sizeBudgetFor`, `checkReducedMotionSources`, and `checkVariantPair` v1 branches.
- `scripts/validate/validate-all.ts`, `scripts/validate/github-render.ts`, `scripts/validate/visual-qa.ts`, `scripts/probe/platform-probes.ts`, and `scripts/validate/browser.ts` all assume motion or v1 asset/heading structure.
- `scripts/generate/snapshot.ts` and `scripts/generate/material-change.mjs` maintain the now-unused `recentPushes`/Active work path.
- The affected tests are the named tests in `tests/scene.test.ts`, `tests/readme.test.ts`, `tests/checks.test.ts`, and the `measure() agrees with layout().width` fixture in `tests/type.test.ts`.

## T2-01 — Lock the v2 panel and data contract

### Objective

Define the exact v2 asset set and assign every displayed metric to one panel only. Remove profile fields that existed solely to generate v1 prose.

### Scope (files touched)

- New `src/shared/panel-contract.ts`
- `src/shared/profile.ts`
- `src/shared/telemetry-types.ts`
- `scripts/generate/snapshot.ts`
- `scripts/generate/material-change.mjs`
- `src/shared/config.ts`
- `package.json`
- `data/telemetry.json` only through the snapshot generator

### Constraints

- The eight logical panels are `identity`, `focus`, four `system-*` panels, `signal`, and `channels`.
- The output is exactly 16 assets: two themes × eight panels.
- `data/telemetry.json` remains the sole source of measured numbers.
- Do not manually change telemetry values or replace measured values with claims.
- Remove or stop producing `PROFILE.identity`, `PROFILE.principles`, `PROFILE.privateWork`, and the `recentPushes` Active work pathway.
- Preserve the four configured featured repositories and four verified channels.

### Acceptance criteria

- A shared contract enumerates the eight logical panel IDs and expected themed filenames.
- A metric ownership map exists in code or tests; no metric appears in more than one panel manifest or in README prose.
- `rg` finds no consumer of `PROFILE.identity`, `PROFILE.principles`, `PROFILE.privateWork`, or `recentPushes`.
- The package description no longer uses `ENGINEERING RECORD`.

### Required tests

- `npm run typecheck`
- Snapshot sanity checks in `scripts/generate/snapshot.ts`
- Material-change exit-code behavior in `scripts/generate/material-change.mjs`

### Regression risks

Removing `recentPushes` without updating `materialView()` can stop legitimate telemetry refreshes from being classified as material. Removing profile fields too early can leave `readme.ts` or renderer imports broken.

## T2-02 — Remove animation and variant machinery

### Objective

Make the rendering engine statically incapable of producing animated SVGs or hero variants.

### Scope (files touched)

- `src/shared/canvas.ts`
- `src/shared/tokens.ts`
- `src/shared/emit.ts`
- `src/build.ts`
- `src/hero/hero.ts` or its replacement identity renderer
- `scripts/validate/checks.ts`
- `tests/scene.test.ts`

### Constraints

- Preserve SVG accessibility, outlined text, viewBox scaling, theme palettes, and the 26u information floor.
- Keep `<picture>` for color-scheme selection only.
- Do not retain an `animated: false` compatibility field; static-only should be structural.

### Acceptance criteria

- `AssetBuild`, `RenderedAsset`, and `Canvas` have no animation flag.
- `Canvas.rule()`, `Canvas.keyframes()`, `DUR`, and `EASE` are removed or unused and deleted.
- No generated or in-memory SVG contains `@keyframes`, `animation:`, SMIL animation, or `prefers-reduced-motion`.
- `buildAll()` cannot emit `hero-dark.svg`, `hero-light.svg`, `hero-static-dark.svg`, or `hero-static-light.svg`.
- Static SVG optimization no longer depends on animation-preservation comments or branches.

### Required tests

- Update the `tests/scene.test.ts` build-set and static-motion assertions.
- `npm run typecheck`
- `npm run render -- --check`

### Regression risks

All existing renderer constructors use the current `Canvas` signature. Removing animation APIs can create partial migrations where one renderer still depends on them. SVGO output may change after animation-specific overrides are removed.

## T2-03 — Build the identity, focus, and channels panels

### Objective

Replace the v1 hero/core-modules composition with three static panels that carry the v2 identity stack.

### Scope (files touched)

- Replace `src/hero/hero.ts` with `src/identity/identity-panel.ts`, or convert it in place
- Replace `src/modules/core-modules.ts` with `src/focus/focus-panel.ts`, or convert it in place
- New `src/channels/channels-panel.ts`
- `src/build.ts`
- `src/shared/profile.ts`
- `src/shared/config.ts`

### Constraints

- Identity must be name-first: `Hakan Duyar` is the dominant display element.
- Identity contains only the discipline line and exactly three measured readouts.
- Remove `headerLabel = 'ENGINEERING RECORD'`, bureaucratic labels, motion code, and duplicated footer/header metrics.
- Focus must show all four capability domains and their evidence repositories.
- Channels must use only the four entries in `CHANNELS`.
- Informational text remains at or above the 26u floor.

### Acceptance criteria

- The identity manifest contains the name, discipline, and three telemetry-derived readouts.
- The identity title/description contains no `ENGINEERING RECORD`.
- The focus manifest contains all four module names and the four matching featured repository names.
- The channels manifest contains GitHub, LinkedIn, Medium, and Email only.
- All three renderers are static, deterministic, and theme-aware.

### Required tests

- `tests/scene.test.ts`: title/description, manifest, language, signal, and identity checks.
- Update the `tests/type.test.ts` `measure() agrees with layout().width` fixture if `LAST PUSH 2026-08-16` is no longer valid panel copy.
- Add renderer-specific overflow tests for the identity name, focus evidence names, and email channel.

### Regression risks

The current JetBrains Mono measurements make long identity and repository strings easy to overflow. Removing `PROFILE.modules.summary` can leave focus content empty if the renderer was relying on it for labels.

## T2-04 — Recompose systems and merge telemetry with activity

### Objective

Make each project a compact system row and replace the separate telemetry panel, activity strip, and Markdown table with one `signal` panel.

### Scope (files touched)

- `src/systems/system-plate.ts`
- New `src/signal/signal-panel.ts`
- Replace or remove `src/telemetry/telemetry-panel.ts`
- Replace or remove `src/activity/activity-strip.ts`
- `src/build.ts`
- `src/shared/config.ts`
- `src/shared/telemetry-types.ts`

### Constraints

- Each system row must carry repository name, what it is, curated stack, and measured last-push value.
- Use `FEATURED_REPOS.headline` and `FEATURED_REPOS.stack`; do not reintroduce v1 signal bullet lists.
- Keep activity based on the 52 complete weekly buckets, not `contributions.total` (`137` versus the plotted `135` in the current snapshot).
- The signal panel must merge the language/telemetry visualization and weekly activity visualization without duplicating identity metrics.
- All four system rows remain represented in both themes.

### Acceptance criteria

- Exactly four `system-*` logical assets are built.
- Each system manifest includes the configured repository name, headline, stack, and `featured.pushedAt` month.
- Exactly one `signal` asset exists per theme; no `telemetry-*` or `activity-*` build remains.
- The signal manifest contains both telemetry and weekly activity content.
- A duplicate-metric test proves that the same labeled value is not emitted by identity and signal.
- No system SVG contains a per-item external link; navigation is supplied by the README link line.

### Required tests

- Update `tests/scene.test.ts`:
  - `the hero index line position encodes the primary-language share`
  - `activity bars match the weekly series exactly (count and the marked maximum)`
  - `every number drawn inside an asset exists in the telemetry snapshot`
- Add signal manifest and four-system content assertions.
- `npm run render -- --check`

### Regression risks

Merging two canvases can exceed the 45 KB per-static-asset budget or violate the mobile information floor. The existing activity test assumes `id === 'activity'` and the existing telemetry layout assumes three fixed cells; both must be replaced rather than left as dead selectors.

## T2-05 — Rewrite the README generator for the v2 composition

### Objective

Generate one cohesive static panel stack with only the prose explicitly allowed by the brief.

### Scope (files touched)

- `scripts/generate/readme.ts`
- `README.md`
- `src/shared/profile.ts` if strapline/provenance fields change
- `tests/readme.test.ts`

### Constraints

- Remove the `picture()` `animated` option and all reduced-motion source generation.
- Use one dark source and one light fallback per panel.
- Images cannot carry per-item links; system and channel links must be emitted as the two allowed navigation lines.
- Do not hand-edit `README.md`.

### Acceptance criteria

- README order is identity, focus, four systems, signal, channels.
- README references exactly these 16 assets:

  `identity-*`, `focus-*`, `system-dropspot-*`, `system-motion-system-*`, `system-stock-*`, `system-spark-*`, `signal-*`, and `channels-*`, each in dark/light form.

- README contains no `hero-*`, `hero-static-*`, `core-modules-*`, `telemetry-*`, or `activity-*` references.
- Outside panels, README contains only the generated header, bold strapline, one systems link line, one channels link line, and provenance.
- There are no Markdown tables, bullet lists, identity paragraphs, Active work, Operating principles, or duplicated metric prose.
- No `<a>` wraps a system image.
- No `ENGINEERING RECORD` or `prefers-reduced-motion` remains in README.
- Every image has descriptive alt text without repeating panel metrics.

### Required tests

- Rewrite `tests/readme.test.ts`:
  - `contains every section in the fixed order`
  - `declares reduced-motion sources before colour-scheme sources`
  - `falls back to the light animated asset for clients that ignore <source>`
  - `the telemetry table quotes the snapshot values verbatim`
  - `the activity line states the plotted total and window, not the larger year figure`
  - `every featured repository is linked as literal Markdown text`
- Add exact panel-count, filename, link-line, no-table, no-bullet, and no-duplicate assertions.

### Regression risks

Removing headings too aggressively can weaken navigation and GitHub-render acceptance. Removing alt text to meet the prose budget would violate `checkAltText`; alt text must remain descriptive but non-duplicative.

## T2-06 — Replace v1 validator branches with static-v2 validation

### Objective

Ensure validators enforce the new composition instead of requiring deleted animation variants and v1 structure.

### Scope (files touched)

- `scripts/validate/checks.ts`
- `scripts/validate/validate-all.ts`
- `tests/checks.test.ts`
- `tests/readme.test.ts` as needed

### Constraints

- Preserve English, lexicon, alt-text, SVG XML, external-resource, outlined-font, accessibility, size, and telemetry-number checks.
- Replace motion-pair validation with a universal static-only check.
- Keep the 45 KB static asset and 400 KB total-payload budgets unless the merged signal panel proves a brief-approved change is necessary.

### Acceptance criteria

- Delete `SIZE_LIMITS.heroAnimated` and the animated branch in `sizeBudgetFor()`.
- Delete `checkReducedMotionSources()` and its three branches:
  - `referencesStatic && !hasReduce`
  - `hasReduce && !referencesStatic`
  - reduced-motion source ordering.
- Delete `checkVariantPair()` and its calls in `validate-all.ts`.
- Remove `build.animated` checks and the `animated`/static split in `validate-all.ts`.
- Remove the v1 table-only `known.add(String(Math.max(0, telemetry.languages.length - 4)))` allowance.
- Add checks for the exact 16 expected assets, static-only SVGs, v2 README structure, and duplicate metrics.
- `checkSvg()` fails on any animation syntax, not only reduced-motion queries.

### Required tests

- Replace `describe('checkReducedMotionSources')` and its three tests in `tests/checks.test.ts` with static color-scheme and static-only tests.
- Add tests for `sizeBudgetFor()` applying one static budget.
- Run `npm run validate` against the regenerated output.

### Regression risks

Deleting reduced-motion validation without adding static-only validation could allow an animated SVG to ship. Simplifying README number validation could accidentally stop checking numbers inside generated prose or alt text.

## T2-07 — Rewrite scene and README acceptance tests

### Objective

Make the test suite fail on v1 output and prove the v2 composition, data honesty, and static behavior.

### Scope (files touched)

- `tests/scene.test.ts`
- `tests/readme.test.ts`
- `tests/type.test.ts`
- `tests/checks.test.ts` where shared fixtures overlap

### Constraints

- Tests must assert panel IDs and filenames, not merely count assets.
- Avoid selectors that can return `undefined` and make assertions pass vacuously.
- Preserve determinism, outlined text, text manifests, signal rationing, telemetry traceability, and language checks.

### Acceptance criteria

Update or remove these exact v1 tests:

- `emits exactly 18 assets: (hero x2 + 6 static) x 2 themes`
- `static builds contain no animation at all`
- `the entrance finishes inside the 2400ms ceiling`
- `exactly one loop, with a period of at least 6 seconds`
- `the animated and static hero draw the same scene (same manifest, same element count)`
- `the hero index line position encodes the primary-language share`
- `activity bars match the weekly series exactly (count and the marked maximum)`
- `contains every section in the fixed order`
- `declares reduced-motion sources before colour-scheme sources`
- `falls back to the light animated asset for clients that ignore <source>`
- `the telemetry table quotes the snapshot values verbatim`
- `the activity line states the plotted total and window, not the larger year figure`
- `every featured repository is linked as literal Markdown text`
- `measure() agrees with layout().width` using the `LAST PUSH 2026-08-16` fixture

The resulting suite must assert:

- 16 named static assets, eight per theme.
- No animation fields, CSS, keyframes, SMIL, or motion media queries.
- Correct identity/focus/system/signal/channels manifests.
- No Markdown table, bullet list, v1 heading block, or duplicated metric.
- All numbers in panel manifests trace to `data/telemetry.json`.

### Required tests

- `npm test`
- `npm run typecheck`
- `npm run validate`

### Regression risks

A broad “contains no animation” test can pass while the build still emits the wrong asset IDs. Exact ID and path assertions are required.

## T2-08 — Update browser, GitHub, probe, and documentation QA

### Objective

Make integration QA validate a static 16-asset stack at the brief’s desktop and mobile widths.

### Scope (files touched)

- `scripts/validate/visual-qa.ts`
- `scripts/validate/github-render.ts`
- `scripts/probe/platform-probes.ts`
- `scripts/validate/browser.ts`
- `docs/visual-system.md`
- `docs/architecture.md`
- `docs/github-platform-constraints.md`
- `docs/maintenance.md`
- `scripts/generate/tokens-doc.ts`

### Constraints

- Mobile QA must include approximately 360px, not only the current 390px case.
- Retain color-scheme and GitHub sanitization coverage.
- Remove claims that the repository ships animated/static pairs.

### Acceptance criteria

- `visual-qa.ts` removes `HERO_FRAMES`, `captureHeroTimeline()`, `assertImgLiveness()`, the direct `hero-dark.svg` fixture, and animation waits.
- Its README-shaped asset list contains the eight v2 logical panels and checks 890px and ~360px widths in both themes.
- It proves repeated captures of static assets are identical and detects horizontal overflow.
- `github-render.ts` removes reduced-motion assertions and the v1 heading array `['Identity', 'Core modules', 'Selected systems', 'Telemetry', 'Activity']`; it verifies the v2 panel stack, asset references, alt text, and functional link lines.
- `platform-probes.ts` removes the CSS animation, SMIL, and reduced-motion behavior probes; `browser.ts` removes the unused `reducedMotion` option.
- Documentation no longer describes animated heroes, static counterparts, v1 sections, or duplicated Markdown captions.

### Required tests

- `npm run qa:visual`
- `npm run qa:github` when credentials/network are available
- `npm run probe:platform` if the reduced probe is retained in a narrowed form

### Regression risks

Removing animation QA can leave the visual suite too weak. Static screenshot equality, exact asset lists, and mobile overflow checks must replace the deleted liveness coverage.

## T2-09 — Regenerate, remove orphaned assets, and run final acceptance

### Objective

Publish only the generated v2 artifacts and prove the repository is internally consistent.

### Scope (files touched)

- `assets/generated/`
- `README.md`
- `docs/tokens.md`
- `data/telemetry.json` only if regenerated by `scripts/generate/snapshot.ts`

### Constraints

- Generated files must come from the existing build commands.
- Do not retain compatibility copies of deleted v1 assets.
- Do not fabricate or hand-edit telemetry values.

### Acceptance criteria

`assets/generated/` contains exactly:

- `identity-dark.svg`, `identity-light.svg`
- `focus-dark.svg`, `focus-light.svg`
- `system-dropspot-dark.svg`, `system-dropspot-light.svg`
- `system-motion-system-dark.svg`, `system-motion-system-light.svg`
- `system-stock-dark.svg`, `system-stock-light.svg`
- `system-spark-dark.svg`, `system-spark-light.svg`
- `signal-dark.svg`, `signal-light.svg`
- `channels-dark.svg`, `channels-light.svg`

There are no `hero*`, `core-modules*`, `telemetry*`, or `activity*` files. `npm run render -- --check` reports no stale or orphaned assets, and regenerating README/assets produces no diff.

### Required tests

- `npm run render`
- `npm run readme`
- `npm run docs:tokens`
- `npm run render -- --check`
- `npm run typecheck`
- `npm test`
- `npm run validate`
- `npm run qa:visual`

### Regression risks

The merged signal panel may exceed payload limits, generated alt text may drift from panel manifests, and a refreshed telemetry snapshot may change the measured date. Final acceptance must verify both the current snapshot values and the generated-file provenance.