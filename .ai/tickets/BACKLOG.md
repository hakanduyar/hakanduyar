# BACKLOG — HDU // ENGINEERING RECORD

Authority: SPEC AUTHORITY. Date: 2026-08-23.
Binding documents: `.ai/project/02-audit.md` (rulings), `.ai/project/03-design-brief.md` (design spec),
`.ai/project/00-context.md` and `.ai/project/01-link-verification.md` (verified facts).

Tickets are ordered so that dependencies come first. A ticket may not be started until every ticket
in its DEPENDENCIES field is complete. `STATUS` is owned by the implementer; every other field is
owned by the spec authority and must not be edited without a written amendment in this file.

**Canonical commands** (defined in T-001, used by every later ticket):

| Command | Script | Purpose |
|---|---|---|
| `pnpm run fetch` | `scripts/fetch-data.mjs` | Refresh `data/profile.json` from the GitHub GraphQL API |
| `pnpm run build` | `scripts/build.mjs` | Render all SVG assets into `assets/generated/` |
| `pnpm run build:readme` | `scripts/build-readme.mjs` | Assemble `README.md` from `src/readme/` |
| `pnpm run validate` | `scripts/validate.mjs` | All static content, safety, budget and data-integrity checks |
| `pnpm run probe` | `scripts/probe-csp.mjs` | CSP/camo conformance probe under the raw-host policy |
| `pnpm run capture` | `scripts/capture.mjs` | Headless Chrome screenshots at 890 px and 390 px, dark and light |
| `pnpm test` | `node --test` | Unit tests (Node 22 built-in runner) |
| `pnpm run check` | composite | `build` + `build:readme` + `validate` + `test`, then `git diff --exit-code -- assets/generated README.md` |

---

## T-001 — REPOSITORY SCAFFOLD, TOOLCHAIN, AND VERIFIED DATA SNAPSHOT
STATUS: PLANNED

OBJECTIVE:
Establish the pure-Node project skeleton, the dependency set, the canonical script names, and a
committed `data/profile.json` that is the single source of every number the profile will ever
display — including the per-week contribution data that the current evidence file lacks.

RATIONALE:
Nothing else can be built without a data contract. `02-audit.md` §0 records that
`.ai/evidence/github-graphql-raw.json` contains only `contributionCalendar.totalContributions` and no
per-day or per-week data, so the activity visualisation (T-007) is currently unbuildable. RULE 3 of
the design brief ("no metric without a measurement") requires a machine-readable fact store that the
validator can check assets against; that store must exist before any asset does.

SCOPE:
- `package.json` with `"type": "module"`, `"engines": { "node": ">=22" }`, `packageManager` pinned to
  the verified pnpm version, and the eight scripts in the table above.
- Dependencies, minimal and pure JS: `opentype.js`, `svgo`, `puppeteer-core`. Dev: none beyond those
  (tests use Node's built-in `node:test`).
- Directory skeleton: `src/tokens/`, `src/assets/`, `src/readme/`, `scripts/`, `data/`,
  `assets/fonts/`, `assets/generated/`, `docs/`, `.ai/visual/`.
- `scripts/fetch-data.mjs`: executes the GraphQL query via `gh api graphql`, normalises the response,
  and writes `data/profile.json` with stable key order and a trailing newline.
- The query must retrieve, at minimum: `login`, `name`, `createdAt`; `repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC)`
  with `totalCount` and per-node `name`, `url`, `description`, `pushedAt`, `createdAt`,
  `stargazerCount`, `isArchived`, `primaryLanguage`, `languages(first: 10) { edges { size node { name } } }`,
  `defaultBranchRef { target { ... on Commit { history { totalCount } } } }`; and
  `contributionsCollection { totalCommitContributions totalPullRequestContributions totalIssueContributions totalRepositoryContributions contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } }`.
- Derived fields computed at fetch time and written into `data/profile.json`: `publicRepoCount`,
  `defaultBranchCommitTotal`, `totalSourceBytes`, `languageShares[]` (name, bytes, percent to one
  decimal), `lastPublicPushAt`, `activeSinceYear`, `weeklyContributions[]` (52 entries, ISO week
  start date + count), `weeklyMax`, `measuredAt` (ISO-8601 date).
- `data/profile.schema.json` describing the shape, and a loader that validates against it.
- `.gitignore`, `.editorconfig`, `.gitattributes` with `* text=auto eol=lf` so generated SVG is
  byte-identical on Windows and Linux runners.

OUT OF SCOPE:
Tokens, any rendering, any README change, any workflow file.

DEPENDENCIES:
None.

IMPLEMENTATION CONSTRAINTS:
- Pure Node 22 / pnpm. No Python, no FFmpeg, no ImageMagick, no native build steps.
- `scripts/fetch-data.mjs` must **fail loudly** (non-zero exit, no file write) if any of
  `publicRepoCount`, `defaultBranchCommitTotal`, `totalSourceBytes` or
  `contributionCalendar.totalContributions` is absent, zero, or lower than 50% of the value currently
  in `data/profile.json`. A partial or unauthenticated response must never overwrite good data with
  zeros.
- `README.md` must not be modified by this ticket.
- Numbers must never be typed by hand into a source file. Only `fetch-data.mjs` writes numbers.

ACCEPTANCE CRITERIA:
1. `pnpm install --frozen-lockfile` completes on a clean checkout with no native compilation step.
2. `node --version` reported by the project's `engines` check is >= 22; `pnpm run fetch` runs to
   completion and exits 0.
3. `data/profile.json` exists, parses as JSON, validates against `data/profile.schema.json`, and
   contains `weeklyContributions` with exactly 52 entries.
4. `data/profile.json` reports `publicRepoCount === 58`, `defaultBranchCommitTotal === 962`,
   `totalSourceBytes === 3935869`, `contributions.trailingYearTotal === 136`, and
   `lastPublicPushAt === "2026-08-16"` when run against the account at audit date. Any divergence
   must be explained in the PR description as a real change in the account, not a bug.
5. `languageShares` contains TypeScript at 62.9, JavaScript at 17.4, HTML at 11.4, CSS at 3.5, and a
   single `Other` bucket at 4.8, each to one decimal, summing to 100.0 +/- 0.1.
6. Running `pnpm run fetch` twice in succession produces a byte-identical file (apart from
   `measuredAt` when the date has changed).
7. A simulated failure (unset/invalid token) causes `pnpm run fetch` to exit non-zero and leaves
   `data/profile.json` unmodified, verified by comparing the file hash before and after.
8. Every one of the eight canonical script names resolves; scripts not yet implemented exit 0 with a
   printed `not implemented` notice rather than failing.

REQUIRED TESTS:
- `pnpm install --frozen-lockfile`
- `pnpm run fetch && node -e "JSON.parse(require('fs').readFileSync('data/profile.json','utf8'))"`
- `pnpm test` covering: schema validation of `data/profile.json`; the fail-loud guard (feed the
  normaliser a zeroed response and assert it throws); `languageShares` summing to 100.0 +/- 0.1;
  `weeklyContributions.length === 52`.
- `git diff --exit-code -- README.md` (must be clean).

VISUAL ACCEPTANCE CRITERIA:
n/a — non-visual ticket.

REGRESSION RISKS:
- GitHub GraphQL rate limits or scope changes silently degrade the response. Mitigated by the
  fail-loud guard, which must be tested, not assumed.
- `contributionsCollection` behaves differently for app tokens than for user tokens; this ticket
  establishes the behaviour that T-010 depends on, so record the observed result in `docs/`.
- CRLF line endings on Windows would make generated output differ from the CI runner's; mitigated by
  `.gitattributes`.

---

## T-002 — DESIGN TOKEN SYSTEM (DARK + LIGHT) WITH CONTRAST GATE
STATUS: PLANNED

OBJECTIVE:
Encode the two palettes, the type scale, the spacing scale, the grid and the motion timings from
`03-design-brief.md` as a single machine-readable source of truth, and make WCAG contrast a build
gate rather than a review opinion.

RATIONALE:
Two independently authored themes with opposite design logic (emitted light vs deposited ink) will
drift the moment colours are typed into asset modules. Making the contrast ratios computable and
failing the build on a violation is the only way the accessibility constraint survives a year of
edits.

SCOPE:
- `src/tokens/tokens.json`: the exact hex values, sizes, spacing, grid and motion tokens from
  `03-design-brief.md` §1-§4, keyed by theme where a theme distinction exists.
- Each colour token carries a `role` field with one of: `surface`, `text`, `signal`, `series`,
  `rule`. Tokens with role `rule` or the `signal.trace` token are flagged `textAllowed: false`.
- `src/tokens/contrast.mjs`: WCAG 2.x relative-luminance and contrast-ratio functions.
- `src/tokens/validate-tokens.mjs`: the contrast gate, invoked by `pnpm run validate`.
- A generated `docs/tokens.md` table listing every token, its hex, its role and its measured contrast
  against `surface.base`, `surface.panel` and `surface.raised`.

OUT OF SCOPE:
Any SVG output, any font work, any README change.

DEPENDENCIES:
T-001.

IMPLEMENTATION CONSTRAINTS:
- Hex values are transcribed exactly from `03-design-brief.md` §1.2 and §1.3. Changing any value
  requires a written amendment to the design brief first.
- No colour may exist anywhere in `src/` outside `tokens.json`. Asset modules receive tokens as an
  argument.
- Contrast functions must be pure and unit-tested against published reference pairs
  (`#000000`/`#FFFFFF` = 21.00; `#767676`/`#FFFFFF` = 4.54).

ACCEPTANCE CRITERIA:
1. `src/tokens/tokens.json` contains both `dark` and `light` palettes with every token named in
   `03-design-brief.md` §1.2 and §1.3, and no additional colour tokens.
2. The contrast gate fails the build if any token with `role: "text"` scores below **4.5:1** against
   `surface.base`, `surface.panel` **and** `surface.raised` in its own theme.
3. The contrast gate fails the build if any token with `role: "series"` and a fill scores below
   **3.0:1** against `surface.base` in its own theme.
4. The contrast gate fails the build if any token with `textAllowed: false` is referenced from a text
   node by an asset module.
5. Measured values match the brief: dark `text.tertiary` `#78899A` = 5.38 and light `text.tertiary`
   `#616872` = 5.38 against their respective `surface.base`, each to two decimals.
6. Exactly one token per theme has `role: "signal"` and a chromatic hue; a test asserts that no other
   token has a saturation above 0.15 in HSL.
7. On dark, `series.1` has the **highest** relative luminance of the series ramp; on light, `series.1`
   has the **lowest**. A test asserts both, which is the machine-checkable form of "the light theme is
   not an inversion".
8. `docs/tokens.md` is generated by the build and matches `tokens.json` (drift-checked by
   `git diff --exit-code`).

REQUIRED TESTS:
- `pnpm test` covering: reference contrast pairs; every text token >= 4.5:1 against all three
  surfaces; every series fill >= 3.0:1 against `surface.base`; the series-direction assertion in AC7;
  the single-chroma assertion in AC6.
- `pnpm run validate` exits 0.
- A deliberately mutated token (e.g. dark `text.tertiary` set to `#5A6570`) makes `pnpm run validate`
  exit non-zero. This negative test must be committed as a test case, not performed by hand.

VISUAL ACCEPTANCE CRITERIA:
`docs/tokens.md` renders as a readable table on GitHub in both themes, with each hex swatch's measured
ratio beside it.

REGRESSION RISKS:
- Adding a colour "just for this one asset" bypasses the gate. Mitigated by AC1 plus a validator rule
  banning hex literals in `src/assets/**`.
- Someone "fixes" the light palette by inverting the dark one; AC7 is the specific guard.

---

## T-003 — SVG RENDER PIPELINE: OUTLINED TYPOGRAPHY, THEME/MOTION VARIANTS, DETERMINISTIC SVGO
STATUS: PLANNED

OBJECTIVE:
Build the deterministic pure-Node pipeline that turns an asset module plus tokens plus data into four
SVG files (dark/light x animated/static), with all text converted to vector outlines and a declared
string manifest.

RATIONALE:
`02-audit.md` §3.2 rules animated SVG the primary format and §3.4 rules that all in-asset text is
outlined. Outlining makes strings ungreppable, which would blind the content lint exactly where it
matters; the `texts[]` manifest contract exists to solve that and must be enforced by the pipeline
itself, not by convention.

SCOPE:
- Asset module contract: `export default function render({ tokens, data, theme, motion }) => { svg: string, texts: string[], width: number, height: number }`.
- `src/pipeline/text.mjs`: `opentype.js` wrapper that loads the vendored font, subsets per string, and
  returns path data at a fixed float precision, plus measured advance widths so the caller can
  right-align value columns exactly.
- `src/pipeline/svgo.mjs`: two SVGO configurations — one for animated documents, one for static.
- `scripts/build.mjs`: renders every registered asset x {dark, light} x {animated, static} into
  `assets/generated/`, writes `assets/generated/manifest.json` listing every emitted file with its
  byte size and its `texts[]`.
- Vendored `assets/fonts/` containing the font binaries and the licence file shipped with that exact
  release.

OUT OF SCOPE:
The content of any specific asset. Validation logic (T-004). README assembly (T-009).

DEPENDENCIES:
T-001, T-002.

IMPLEMENTATION CONSTRAINTS:
- **Output must be byte-stable.** Fix `floatPrecision` explicitly in both the outliner and SVGO; sort
  all generated attribute and key order deterministically; emit LF line endings.
- **Animated SVGO config must set `cleanupIds: false`, `inlineStyles: false`, `minifyStyles: false`,
  `collapseGroups: false`, `removeUselessDefs: false`, `removeViewBox: false`.** SVGO will silently
  destroy CSS animations otherwise; this is the single most likely way this ticket fails.
- No `<text>` element may appear in output except inside `<title>` or `<desc>`.
- No `<script>`, `<foreignObject>`, `@import`, `@font-face`, `<image>`, external `href`/`xlink:href`,
  or `url(http...)` may appear in output.
- Every animated document wraps all animation in `@media (prefers-reduced-motion: no-preference)`.
- The static variant is produced from the same module with `motion: false` and must be the resting
  state, not the animated file with the `<style>` block stripped.
- The build must throw if an asset module emits a rendered string that is not present in its declared
  `texts[]`.

ACCEPTANCE CRITERIA:
1. `pnpm run build` exits 0 and writes files to `assets/generated/` for every registered asset in all
   four variants.
2. Running `pnpm run build` twice produces byte-identical output; verified by
   `git diff --exit-code -- assets/generated`.
3. Building on Windows and on `ubuntu-latest` produces byte-identical output for the same commit,
   evidenced by a CI job that rebuilds and diffs.
4. No generated file contains any of: `<script`, `<foreignObject`, `@import`, `@font-face`, `<image`,
   `xlink:href`, `href="http`, `url(http`. Grep-checkable.
5. No generated file contains a `<text` element outside `<title>`/`<desc>`. Grep-checkable.
6. Every animated file contains exactly one `@media (prefers-reduced-motion: no-preference)` block,
   and every `@keyframes` rule name used in the document is referenced inside that block.
7. `assets/generated/manifest.json` lists every emitted file with `bytes` and `texts[]`, and the union
   of all `texts[]` reproduces every human-readable string in the design.
8. A test that renders a module emitting an undeclared string causes `pnpm run build` to exit
   non-zero.
9. After SVGO, a round-trip test confirms the animated document still contains its media query, all
   its keyframe names and all element ids referenced by CSS selectors.
10. `assets/fonts/` contains at least one licence file; the build fails if font binaries are present
    without one.

REQUIRED TESTS:
- `pnpm run build && pnpm run build && git diff --exit-code -- assets/generated`
- `pnpm test` covering: the undeclared-string guard (AC8); the SVGO round-trip preservation (AC9);
  advance-width measurement against a known string; the font-licence guard (AC10).
- Grep gates (also wired into `pnpm run validate` in T-004):
  `grep -RlE "<script|<foreignObject|@import|@font-face|<image|xlink:href|href=\"http|url\(http" assets/generated` must return nothing.

VISUAL ACCEPTANCE CRITERIA:
A throwaway probe asset rendering the full type scale in both themes opens correctly in Chrome, glyph
outlines are closed and correctly filled (no stray winding-rule holes), and right-aligned numerals sit
on a single measured right edge across all six type roles.

REGRESSION RISKS:
- SVGO destroying animation is the classic failure; AC9 is the specific guard and must be a committed
  test, not a manual look.
- `opentype.js` winding rules can invert counters in glyphs such as `8`, `0`, `%`, `#`. Inspect those
  glyphs specifically.
- A font version bump changes every path in the repository and produces an enormous diff; pin the font
  file and record its version and hash in `docs/`.

---

## T-004 — VERIFICATION HARNESS: STATIC VALIDATION, CSP CONFORMANCE PROBE, HEADLESS CAPTURE
STATUS: PLANNED

OBJECTIVE:
Build the harness that can fail the project. Three parts: a static validator over generated output
and `README.md`; a CSP/camo conformance probe that renders assets under the exact policy GitHub's raw
host applies; and a headless-Chrome capture that produces reviewable screenshots at both breakpoints
in both themes.

RATIONALE:
`02-audit.md` R7 identifies folklore-driven asset decisions as a real risk: the community "knows"
what GitHub allows, but almost nobody measures it. Discovering that a construct is blocked *after*
publishing to a profile page is the expensive way to learn. Equally, RULE 3 (no metric without a
measurement) and the English-only policy are unenforceable by review alone once text is outlined.

SCOPE:
Part A — `scripts/validate.mjs`, running all of:
- **Language policy:** fail on any of `ç ğ ı İ ö ş ü Ç Ğ Ö Ş Ü` or `lang="tr"` in `README.md`, in any
  `texts[]` in the manifest, in any `<title>`/`<desc>`, or in any `alt` attribute. Fail on a
  configurable Turkish stop-word list.
- **Banned lexicon:** the list in `03-design-brief.md` §5.2, case-insensitive, over `README.md` and
  every `texts[]`.
- **Safety:** the grep gates from T-003 AC4/AC5, re-run as a validation step.
- **Anti-fabrication (RULE 3):** every numeric literal of two or more digits, every `%`, and every
  ISO date appearing in a `texts[]` entry or in `README.md` must be present as a value in
  `data/profile.json`, reachable through the declared `fact()` accessor. Anything else fails with the
  offending string and its source file. **This is the most important check in the project.**
- **Markdown-first (RULE 2):** assert that `58`, `962`, `62.9`, `136`, `2026-08-16`, each of the four
  selected repository names, each of the four repository URLs, and each of the four contact URLs
  appear as literal text in `README.md` and not only inside an image.
- **Accessibility:** every `<img>` in `README.md` has a non-empty `alt` that is not the filename, is
  not duplicated across images, and is at least 20 characters; every `<picture>` has exactly one
  `prefers-color-scheme: dark` source, one light source and an `<img>` fallback.
- **Budgets:** the table in `03-design-brief.md` §9.
- **Motion budget:** at most one looping animation per document; loop period >= 6000 ms; entrance
  total <= 2400 ms; all keyframes inside the reduced-motion media query.
- **Token discipline:** no hex literal in `src/assets/**`; no reference to a `textAllowed: false`
  token from a text node.
- **Link check:** every URL in `README.md` returns 200, using a browser user agent for
  `medium.com` per `01-link-verification.md`.

Part B — `scripts/probe-csp.mjs`:
- A local static server that serves `assets/generated/**` with the header
  `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`.
- A probe page loading each asset via `<img>`, plus a matrix of deliberate control cases: inline CSS
  keyframes, SMIL `<animate>`, `@font-face` with an external URL, `@font-face` with a base64 data URI,
  `<image>` with a data URI, `prefers-reduced-motion` honoured inside SVG-as-image, and
  `prefers-color-scheme` honoured inside SVG-as-image.
- Records which controls render, which animate and which are blocked, into
  `.ai/project/04-csp-probe-results.md`.

Part C — `scripts/capture.mjs`:
- `puppeteer-core` against the verified Chrome path, rendering a local page that embeds the README's
  `<picture>` markup exactly as GitHub would, at viewport widths **890** and **390**, in
  `prefers-color-scheme` **dark** and **light**, with `prefers-reduced-motion` both **no-preference**
  and **reduce**, and with the animated hero captured at t = 0 ms, 1200 ms and 3000 ms.
- Writes PNGs to `.ai/visual/<breakpoint>-<theme>-<motion>[-<t>].png`.

OUT OF SCOPE:
Fixing anything the harness finds. Publishing. The workflow files (T-010).

DEPENDENCIES:
T-001, T-002, T-003.

IMPLEMENTATION CONSTRAINTS:
- `puppeteer-core` only, with `executablePath` pointing at the verified Chrome install; no browser
  download.
- The probe must default to **assuming a construct is blocked** and only mark it available on a
  positive observation. A probe that cannot run must exit non-zero, never "pass".
- Screenshots are captured with `deviceScaleFactor: 2` so retina crispness is reviewable.
- The validator must report **all** failures in one run, not stop at the first.
- The validator must be usable on a checkout with no network by skipping only the link check, which
  must be flagged as skipped rather than passed.

ACCEPTANCE CRITERIA:
1. `pnpm run validate` exits 0 on a correct tree and prints a summary line per check with a
   pass/fail/skip verdict.
2. Nine committed negative fixtures each cause `pnpm run validate` to exit non-zero with a message
   naming the offending file and string: a Turkish character; a banned lexicon term; an `<img>` with
   no `alt`; a duplicated `alt`; a `<picture>` missing its light source; a fabricated number not in
   `data/profile.json`; an oversize asset; a two-loop animated document; a hex literal in an asset
   module.
3. The anti-fabrication check demonstrably rejects a hand-inserted `99.98%` and a hand-inserted
   `LATENCY 12MS` in an asset's `texts[]`.
4. `pnpm run probe` exits 0 and writes `.ai/project/04-csp-probe-results.md` containing an explicit
   verdict (`AVAILABLE` / `BLOCKED` / `INCONCLUSIVE`) for each of the seven control cases in Part B.
5. The probe result for **inline CSS keyframes** is `AVAILABLE`. If it is not, T-005 is blocked and
   the fallback in `02-audit.md` §3.2 is triggered; this must be raised before any hero work begins.
6. `pnpm run capture` exits 0 and writes exactly 8 breakpoint/theme/motion PNGs plus 3 hero timeline
   PNGs to `.ai/visual/`.
7. Every captured PNG is non-blank (a mean-pixel-variance check rejects an all-one-colour image).
8. The link check reports 200 for all four contact URLs and all four repository URLs, with the Medium
   check using a browser user agent.

REQUIRED TESTS:
- `pnpm run validate`
- `pnpm test` covering the nine negative fixtures in AC2 as assertions, not as manual steps.
- `pnpm run probe`
- `pnpm run capture`
- `node -e "..."` blank-image check as part of `pnpm test`.

VISUAL ACCEPTANCE CRITERIA:
The 11 PNGs in `.ai/visual/` are legible; the 390 px captures show no text smaller than ~10 CSS px and
no horizontal clipping; the two `prefers-reduced-motion: reduce` captures at t = 0 ms and t = 3000 ms
are pixel-identical to each other.

REGRESSION RISKS:
- A validator that is slow or noisy gets bypassed. Keep the full run under 30 s excluding the link
  check.
- The anti-fabrication check will produce false positives on legitimate strings such as `2021` or
  `#0B0E14`. Resolve with an explicit, small, reviewed allowlist committed in the repository — never
  by loosening the rule.
- Chrome's path differs on the CI runner; parameterise `executablePath` via an environment variable
  with the verified Windows path as the default.

---

## T-005 — HERO IDENTITY PLATE WITH ENTRANCE SEQUENCE
STATUS: PLANNED

OBJECTIVE:
Build the single animated asset: the 890 x 300 identity plate specified in `03-design-brief.md` §6, in
dark and light, animated and static.

RATIONALE:
This is the 20-second budget (R8). It must carry the name, the discipline and three verifiable facts
above the fold, and it is the only place in the project where motion is permitted.

SCOPE:
- `src/assets/hero.mjs` implementing §6.1 geometry exactly and §6.2 timing exactly.
- Four outputs: `hero-dark.svg`, `hero-dark.static.svg`, `hero-light.svg`, `hero-light.static.svg`.
- `<title>`, `<desc>` and `role="img"` per §6.1.

OUT OF SCOPE:
Every other asset. README wiring (T-009).

DEPENDENCIES:
T-002, T-003, T-004 (specifically T-004 AC5 must be satisfied before starting).

IMPLEMENTATION CONSTRAINTS:
- Coordinates are taken from `03-design-brief.md` §6.1 without reinterpretation. Where the brief gives
  an exact value, use it.
- The index line's resting x-position is computed as `598 + (typescriptShare / 100) * 252` from
  `data/profile.json`, never hard-coded. If the share changes, the line moves.
- Exactly one `signal`-coloured element (the index line).
- Exactly one looping animation, period 9000 ms, amplitude +/- 6 u.
- All animation inside `@media (prefers-reduced-motion: no-preference)`; the static file is the
  resting state produced by the same module with `motion: false`.
- No avatar, no tagline, no badge, no logo, no second amber element.
- `MEASURED <date>` is injected from `data/profile.json.measuredAt`.

ACCEPTANCE CRITERIA:
1. All four files exist in `assets/generated/`, each with `viewBox="0 0 890 300"` and no `width` or
   `height` attribute on the root `<svg>`.
2. `hero-dark.svg` <= 90 KB and `hero-light.svg` <= 90 KB; both static variants <= 45 KB.
3. Each animated file contains exactly one `@media (prefers-reduced-motion: no-preference)` block and
   zero animation declarations outside it.
4. Exactly one CSS rule in each animated file has `animation-iteration-count: infinite`, and its
   `animation-duration` is `9s`.
5. Every other animation declaration has `animation-iteration-count: 1` and
   `animation-fill-mode: forwards`; the largest `animation-delay + animation-duration` sum is
   <= 2400 ms.
6. Diffing `hero-dark.static.svg` against `hero-dark.svg` shows the static file differs only by the
   absence of the `<style>` animation block and any transform used solely as an animation start
   state — i.e. the geometry is identical.
7. The literal strings `58`, `962` and `62.9%` appear in the hero's declared `texts[]` and every one
   of them resolves to a value in `data/profile.json`.
8. The index line's `x` attribute in the static file equals `756.5` +/- 0.5 for a TypeScript share of
   62.9%.
9. `<title>` is exactly `HDU // ENGINEERING RECORD - Hakan Duyar`; `<desc>` contains the full text
   content of the plate; the root `<svg>` carries `role="img"`.
10. `pnpm run validate` passes with the hero registered.

REQUIRED TESTS:
- `pnpm run build && pnpm run validate`
- `pnpm test` covering: the single-infinite-animation assertion (AC4); the 2400 ms ceiling (AC5); the
  index-line position computed from a synthetic 40% share landing at `x = 698.8` (AC8, proving the
  value is derived and not hard-coded); the static/animated geometry equality (AC6).
- `pnpm run capture` producing the three hero timeline frames.

VISUAL ACCEPTANCE CRITERIA:
1. At 890 px dark and 890 px light, the resting composition is complete and balanced with no
   unintentional empty region larger than one grid cell.
2. At 390 px, `HAKAN DUYAR`, all three instrument values and both rail labels remain legible; nothing
   is clipped.
3. The `t = 0 ms`, `t = 1200 ms` and `t = 3000 ms` captures show, respectively: frame and grid only
   (never a blank canvas); the wordmark mid-wipe with the instrument rows appearing; and the complete
   resting state.
4. Under `prefers-reduced-motion: reduce`, `t = 0 ms` and `t = 3000 ms` are pixel-identical.
5. The light variant reads as ink on warm paper, not as an inverted dark plate: its `surface.base` is
   `#FAFAF7` and its heaviest elements are the darkest, not the lightest.
6. Placed on GitHub's dark canvas, the plate reads as a recessed panel with a visible hairline edge,
   not as a floating black rectangle.

REGRESSION RISKS:
- The perimeter `stroke-dashoffset` value must match the actual rounded-rectangle path length or the
  frame draw will stutter or leave a gap; compute it, do not estimate it.
- A `clip-path` wipe on outlined text can be dropped by some renderers; the probe must confirm
  `clip-path` inside SVG-as-image before this technique is committed to, with an
  `opacity` + `translateX` reveal as the pre-approved substitute.
- Adding a second amber element during polish is the most likely drift; AC in T-004 enforces one.

---

## T-006 — STRUCTURAL ASSETS: CORE MODULES STRIP AND SELECTED SYSTEM PLATES
STATUS: PLANNED

OBJECTIVE:
Build the five static structural assets: the 890 x 132 core modules strip and four 890 x 92 selected
system plates, in both themes.

RATIONALE:
This is where the profile replaces 40 unverifiable technology claims with four capability domains
that each name their evidence, and where it finally answers "show me something you built" — the
question the current README ignores across all 73 lines.

SCOPE:
- `src/assets/core-modules.mjs` per `03-design-brief.md` §7.1.
- `src/assets/system-plate.mjs`, parameterised, rendered once per selected repository.
- The four repositories are fixed by `02-audit.md` §4.1: `dropspot-project`, `spark`,
  `stock-management-system`, `Hunnes-Academy-motion-system`.
- Ten output files (5 assets x 2 themes).

OUT OF SCOPE:
Telemetry and activity (T-007). Setting descriptions on the repositories themselves (T-008). README
wiring (T-009).

DEPENDENCIES:
T-002, T-003, T-004.

IMPLEMENTATION CONSTRAINTS:
- Static only. No `<style>` animation block in any output.
- Exactly four modules in the strip. No icons, no logos, no technology marks anywhere.
- Plates show language and last-push month only. **No stars, no commit counts, no brand colours, no
  screenshots** (`02-audit.md` §4.1).
- Each plate's capability line is at most 40 characters and states what is *implemented*, not how good
  it is (`03-design-brief.md` §5.4).
- `LAST PUSH` values are read from `data/profile.json`, never typed.
- No repository outside the four named above may appear in any output.

ACCEPTANCE CRITERIA:
1. Ten files exist in `assets/generated/`; each is <= 45 KB; each has the viewBox specified in
   `03-design-brief.md` §3.3.
2. No output file contains a `<style>` block containing `@keyframes` or `animation`.
3. The core modules strip contains exactly four module names and four evidence-repository references,
   and every referenced repository is one of the four selected.
4. Each system plate's `texts[]` contains the repository name, one capability line of <= 40
   characters, the primary language and a `YYYY-MM` last-push value; all four values resolve to
   `data/profile.json`.
5. `grep -c "star\|Star\|commits\|Commits" assets/generated/*.svg` returns zero matches across all ten
   files.
6. No banned repository name (the list in `02-audit.md` §4.2) appears in any generated file or in
   `README.md`.
7. Each plate contains exactly one `rule.strong` index bar and zero `signal`-coloured elements
   (`signal` is reserved for the hero and the telemetry maximum).
8. `pnpm run validate` passes with all five assets registered.

REQUIRED TESTS:
- `pnpm run build && pnpm run validate`
- `pnpm test` asserting: the four-module cap; the 40-character capability-line cap; the absence of any
  banned repository name (AC6) as an explicit list assertion; the zero-star/zero-commit-count check
  (AC5).

VISUAL ACCEPTANCE CRITERIA:
1. At 890 px, the four modules sit on the 10-column grid with identical internal spacing; no module
   name wraps.
2. At 390 px, every module name and every plate line is legible and nothing is clipped.
3. The four plates read as a stack of identical instrument rows — same baseline positions, same right
   edge for the language/last-push column — so any misalignment is immediately visible.
4. Both themes verified; the light variant is ink-on-paper, not inverted.

REGRESSION RISKS:
- The core modules strip drifting back toward a technology list is the single most likely regression;
  the four-module cap and the mandatory evidence reference are the guards.
- A future contributor adding a fifth project weakens the four above it (`02-audit.md` §4.1); the
  count is fixed at four and any change requires a spec amendment.
- Capability lines that describe quality rather than implementation will pass automated checks and
  must be caught in review against `03-design-brief.md` §5.4.

---

## T-007 — DATA ASSETS: TELEMETRY PANEL AND 52-WEEK ACTIVITY STRIP
STATUS: PLANNED

OBJECTIVE:
Build the two static data assets: the 890 x 200 telemetry panel and the 890 x 160 weekly activity
strip, in both themes.

RATIONALE:
This is the ticket where the project is most likely to become dishonest. `02-audit.md` §5 fixes
exactly which numbers may appear and how; §5.4 rules out the 53 x 7 daily grid on the arithmetic that
136 contributions across 365 days leaves roughly 229 empty days, which reads worse than showing
nothing.

SCOPE:
- `src/assets/telemetry.mjs` per `03-design-brief.md` §7.3.
- `src/assets/activity.mjs` per `03-design-brief.md` §7.4.
- Four output files.
- The Markdown mirror tables consumed by T-009 are produced as data, not as prose, so that the image
  and the table cannot disagree.

OUT OF SCOPE:
Any metric not in the SHOW list of `02-audit.md` §5.2. README wiring (T-009).

DEPENDENCIES:
T-001 (specifically `weeklyContributions`), T-002, T-003, T-004.

IMPLEMENTATION CONSTRAINTS:
- **Permitted metrics, exhaustively:** public repositories (58), commits on default branches (962),
  TypeScript share (62.9%), last public push (2026-08-16), active since (2021), the language
  distribution, and the trailing-12-month contribution total (136) as an axis caption only.
- **Banned, exhaustively:** followers, stars, streaks, issue counts, PR counts, rank or grade, trophy
  counts, WakaTime, years of experience, and any invented operational unit
  (`02-audit.md` §5.3).
- Every headline value carries a method line.
- The language bar renders four filled segments plus one outlined remainder, with 3 u gaps of
  `surface.base` between segments.
- The activity strip is 52 weekly columns. Zero weeks render as a 1.5 u `rule.tick` baseline stub. The
  y-axis is scaled to the actual weekly maximum, and that maximum is labelled.
- The activity strip must not use green.
- 136 must not be rendered at any size above `t-label`.

ACCEPTANCE CRITERIA:
1. Four files exist, each <= 45 KB, with the viewBoxes specified in `03-design-brief.md` §3.3.
2. The telemetry panel displays exactly three `t-metric-xl` values, and they are `58`, `962` and
   `62.9%`.
3. Each of the three headline values has a `t-label` key above it and a `t-micro` method line below
   it; all three method lines are present in `texts[]`.
4. The language bar's segment widths are proportional to `languageShares` to within 1 u, verified by
   a unit test that recomputes them from `data/profile.json`.
5. The bar has exactly four filled segments and one outlined remainder segment, with four 3 u gaps.
6. The activity strip contains exactly 52 columns.
7. The tallest column corresponds to `weeklyMax` from `data/profile.json`, and the value of
   `weeklyMax` appears as a label in `texts[]`.
8. Exactly one column is `signal`-coloured (the maximum week); all others use `series.2`.
9. No token used in the activity strip has a hue between 90 and 160 degrees in HSL (the machine-
   checkable form of "not green").
10. The strings `followers`, `stars`, `streak`, `issues`, `trophy`, `rank` and `uptime` appear in no
    generated file and in no `texts[]`, case-insensitively.
11. `136` appears in `texts[]` only within the axis caption, at `t-label` size or smaller.
12. `pnpm run validate` passes with both assets registered.

REQUIRED TESTS:
- `pnpm run build && pnpm run validate`
- `pnpm test` covering: segment-width proportionality (AC4); the 52-column assertion (AC6); the
  weekly-maximum assertion (AC7); the not-green hue assertion (AC9); the banned-substring assertion
  (AC10); a synthetic dataset where every week is zero renders 52 baseline stubs and does not divide
  by zero.
- The anti-fabrication check in `pnpm run validate` must specifically pass over these two assets, as
  they contain the highest density of numbers in the project.

VISUAL ACCEPTANCE CRITERIA:
1. At 890 px, the three headline values sit on one optical baseline with equal cell widths, and the
   language bar's segments are visually distinct thanks to the gaps.
2. At 390 px, all three headline values remain legible (60 u scales to ~24 CSS px) and the language
   bar remains readable as five distinct regions.
3. The activity strip reads as a measured instrument with real week-to-week variation — not as a
   sparse field of gaps and not as a GitHub contribution widget.
4. The strip is not green in either theme.
5. Both themes verified; on light the largest language segment is the darkest, on dark the brightest.

REGRESSION RISKS:
- The greatest risk in the project: someone adds followers or stars "to fill the panel". AC10 is the
  guard and it must be enforced in `validate`, not only in tests.
- A very low `weeklyMax` (2 or 3) makes the strip almost flat. That is the truth and it must not be
  fixed by rescaling. If the strip is genuinely unreadable at the real maximum, reduce the strip
  height rather than distorting the scale, and raise it for a spec decision.
- `weeklyContributions` week boundaries must be consistent between fetches or the strip will jitter
  week to week for no real reason; pin the week start day and record it in `docs/`.

---

## T-008 — CROSS-REPOSITORY PREREQUISITE: ENGLISH DESCRIPTIONS, TOPICS, AND PROFILE BIO
STATUS: PLANNED

OBJECTIVE:
Set an English one-line description and relevant topics on all four selected repositories, and fill
the empty GitHub profile bio.

RATIONALE:
`02-audit.md` §0 and §4.2: only 11 of 58 repositories have any description, and three of the four
selected ones — `dropspot-project`, `stock-management-system`, `Hunnes-Academy-motion-system` — have
none. Sending a visitor from a meticulously engineered profile to a bare repository page destroys the
effect in a single click. Separately, `bio`, `blog`, `location` and `company` are verified EMPTY, so
the sidebar beside the README currently says nothing. These are the cheapest high-leverage
improvements available and they are a **blocking precondition for publishing** (`02-audit.md` §4.2).

SCOPE:
- English descriptions on the four selected repositories, each stating what is implemented.
- Three to five topics per repository, drawn from real stack facts.
- A one-line English GitHub profile bio consistent with the README's identity line.
- A short record in `docs/` of what was set and when.

OUT OF SCOPE:
The other 54 repositories. Renaming, archiving or deleting anything. Editing any other repository's
README. Setting `location`, `company` or `blog` (owner's personal choice; `blog` in particular must
stay empty because `01-link-verification.md` establishes there is no public portfolio).

DEPENDENCIES:
T-006 (the capability lines written there are the source text for the descriptions, so the two must
agree word for word where they overlap).

IMPLEMENTATION CONSTRAINTS:
- Uses `gh repo edit` and `gh api` with the already-authenticated CLI; scopes `repo` and `workflow`
  are verified present.
- **All descriptions in professional English.** `goal-compass-daily` has a Turkish description and is
  a reminder of the failure mode, but it is out of scope and must not be touched.
- Descriptions state what is implemented, never how good it is.
- Maximum 100 characters per description so it is not truncated in listings.
- This ticket changes state outside this repository. It must be executed by, or explicitly approved
  by, the repository owner, and the exact commands must be recorded before execution.

ACCEPTANCE CRITERIA:
1. `gh repo view hakanduyar/<name> --json description,repositoryTopics` returns a non-empty English
   description for each of the four selected repositories.
2. Each description is <= 100 characters and contains no Turkish-specific characters.
3. Each of the four repositories has between 3 and 5 topics, and every topic corresponds to a
   technology actually present in that repository.
4. `gh api users/hakanduyar --jq .bio` returns a non-empty English string.
5. The bio is consistent with the README identity line — same discipline wording, no contradictory
   claim.
6. Re-running `pnpm run fetch` picks up the new descriptions, and `data/profile.json` shows
   `description != null` for all four selected repositories.
7. A record of the commands executed and the values set exists in `docs/`.

REQUIRED TESTS:
- `gh repo view hakanduyar/dropspot-project --json description,repositoryTopics` (and the same for
  `spark`, `stock-management-system`, `Hunnes-Academy-motion-system`).
- `gh api users/hakanduyar --jq .bio`
- `pnpm run fetch && node -e "const d=require('./data/profile.json'); const sel=['dropspot-project','spark','stock-management-system','Hunnes-Academy-motion-system']; const bad=d.repositories.filter(r=>sel.includes(r.name)&&!r.description); if(bad.length) throw new Error('missing descriptions: '+bad.map(r=>r.name).join(','))"`
- `pnpm run validate` (the Turkish-character check covers the fetched descriptions once they are in
  `data/profile.json`).

VISUAL ACCEPTANCE CRITERIA:
Each of the four repository pages, opened in a browser, shows a description in the sidebar and topic
pills beneath it. The profile page shows a bio beside the README.

REGRESSION RISKS:
- Descriptions can be edited later in the GitHub UI and drift from the plates in T-006. Mitigated by
  AC6 plus a validator warning when a plate's capability line and the fetched description disagree
  materially.
- Topics chosen aspirationally rather than factually would reintroduce the current README's central
  defect at a different address; AC3 requires each topic to correspond to something in the repository.
- Acting on repositories outside this one without the owner's explicit approval.

---

## T-009 — README ASSEMBLY: STRUCTURE, ACCESSIBILITY, RESPONSIVENESS, ENGLISH-ONLY
STATUS: PLANNED

OBJECTIVE:
Generate `README.md` from source partials, wiring every asset into `<picture>` blocks with real alt
text and mirroring every fact as literal Markdown, replacing the current Turkish badge-wall file.

RATIONALE:
RULE 2 (Markdown-first) is the mitigation for R1, the project's most dangerous failure mode. This is
the ticket where the profile stops being a picture of a profile. It is also where the language policy
is finally satisfied end to end.

SCOPE:
- `src/readme/` partials, one per section, in the order fixed by `03-design-brief.md` §8.
- `scripts/build-readme.mjs` assembling them plus the generated asset manifest into `README.md`.
- `<picture>` blocks for all nine image slots, each with a dark source, a light source, an `<img>`
  fallback, `width="890"` and descriptive `alt`.
- The four selected-system plates wrapped in Markdown links to their repositories, with the
  repository name also present as a Markdown link in the text beneath.
- The four channel links: GitHub, LinkedIn, Medium, Email — plain Markdown links, no badges.
- The provenance footer replacing the deleted `END TRANSMISSION`.
- A `DO NOT EDIT - generated by scripts/build-readme.mjs` comment as the first line.

OUT OF SCOPE:
Any asset content change. Any git push. The workflows (T-010).

DEPENDENCIES:
T-005, T-006, T-007, T-008.

IMPLEMENTATION CONSTRAINTS:
- Only the HTML subset GitHub permits: `<picture>`, `<source>`, `<img>`, `<a>`, `<div align>`,
  `<table>`, `<details>`. **No `<script>`, no `<style>`, no `<iframe>`, no inline `style` attributes.**
- No emoji anywhere. The current file has five; the target is zero.
- No `<details>` around primary content; permitted only for an optional full repository index at the
  very bottom.
- No badge services, no shields.io, no `github-readme-stats`, no `github-readme-streak-stats`, no
  devicon hot-links, no `vectorlogo.zone`, no `gw.alipayobjects.com`. Every image is a relative path
  into `assets/generated/`.
- Image paths are relative so GitHub serves them first-party from this repository.
- Every number in the prose is interpolated from `data/profile.json` at build time; no number is typed
  into a partial.
- No location, employer, job title or years-of-experience figure (all verified EMPTY —
  `02-audit.md` §0).
- Exactly one sentence about private work, with no repository names and no counts.

ACCEPTANCE CRITERIA:
1. `pnpm run build:readme` exits 0 and `README.md` begins with the DO-NOT-EDIT comment.
2. `README.md` contains zero Turkish-specific characters and zero emoji, verified by the validator.
3. `README.md` contains nine `<picture>` blocks, each with exactly one
   `media="(prefers-color-scheme: dark)"` source, one light source and one `<img>` fallback carrying
   `width="890"`.
4. Every `<img>` has an `alt` of at least 20 characters that is not the filename and is unique across
   the document.
5. The literal strings `58`, `962`, `62.9`, `136` and `2026-08-16` each appear as Markdown text
   outside any HTML attribute.
6. All four selected repository names appear as Markdown links to their `https://github.com/hakanduyar/...`
   URLs; no other repository URL appears anywhere in the file.
7. The four channel links resolve to `https://github.com/hakanduyar`,
   `https://linkedin.com/in/hakanduyar`, `https://medium.com/@hakanduyar` and
   `mailto:iamhakanduyar@gmail.com`, and no portfolio or personal-site link appears
   (`01-link-verification.md`).
8. `README.md` contains no `<script`, no `<iframe`, no `style=`, and no URL whose host is not
   `github.com`, `linkedin.com` or `medium.com`.
9. The section headings are exactly: `Identity`, `Core modules`, `Selected systems`, `Telemetry`,
   `Activity`, `Active work`, `Operating principles`, `Channels`.
10. The provenance footer is present and contains the `measuredAt` date from `data/profile.json`.
11. `pnpm run validate` passes, including the link check and the Markdown-first assertions.
12. Editing a partial and re-running `pnpm run build:readme` reproduces the change; running it twice
    is a no-op (`git diff --exit-code -- README.md`).

REQUIRED TESTS:
- `pnpm run build && pnpm run build:readme && pnpm run validate`
- `pnpm run build:readme && git diff --exit-code -- README.md` (idempotence)
- `pnpm test` covering: the nine-`<picture>` assertion; alt uniqueness and length; the
  Markdown-first literal-string assertions (AC5); the allowed-host assertion (AC8).
- `pnpm run capture` at 890 px and 390 px, both themes.

VISUAL ACCEPTANCE CRITERIA:
1. At 890 px in both themes the page reads as one coherent instrument: consistent left edge, consistent
   vertical rhythm between an image and the text below it, no image wider than its container.
2. At 390 px nothing scrolls horizontally, no image is clipped, and **at least one selected-system
   link is reachable within the first two screens** (R8).
3. With all images blocked (simulating a camo failure), the page is still complete and useful: every
   fact and every link is present as text.
4. No broken-image glyph appears in any capture.
5. Rendered on the live profile page the README occupies the full content column with no horizontal
   overflow — checked in T-012.

REGRESSION RISKS:
- Hand-editing the generated `README.md` is the obvious failure; the DO-NOT-EDIT header plus the CI
  drift gate in T-010 are the guards.
- GitHub's Markdown sanitiser silently drops attributes it dislikes; verify the rendered output on
  GitHub, not only locally.
- Relative image paths behave differently on the profile page than in the repository view; T-012 must
  confirm both.
- Alt text degenerating into filenames during later edits.

---

## T-010 — GITHUB ACTIONS: SCHEDULED TELEMETRY REFRESH AND GENERATED-OUTPUT DRIFT CI
STATUS: PLANNED

OBJECTIVE:
Two workflows: a scheduled job that refreshes the data and rebuilds everything, and a CI job that
fails any change where the committed generated output does not match its source.

RATIONALE:
R4 (maintenance decay): a profile that proudly displays a measurement date going stale is worse than
one with no date. And the whole reproducibility constraint is worthless without a gate that proves
the committed output actually came from the committed source.

SCOPE:
- `.github/workflows/refresh.yml`: `schedule` weekly (`0 6 * * 1`) plus `workflow_dispatch`. Steps:
  checkout, setup-node 22, pnpm install, `pnpm run fetch`, `pnpm run build`, `pnpm run build:readme`,
  `pnpm run validate`, `pnpm test`, commit and push only if there is a diff.
- `.github/workflows/ci.yml`: on `push` and `pull_request`. Steps: checkout, setup-node 22, pnpm
  install, `pnpm run build`, `pnpm run build:readme`, `pnpm run validate`, `pnpm test`, then
  `git diff --exit-code -- assets/generated README.md docs/tokens.md`.
- Token strategy: attempt the default `GITHUB_TOKEN` first; if `contributionsCollection` returns
  absent or zero values under it, switch to a fine-grained PAT in the `PROFILE_READ_TOKEN` secret with
  read-only user scope. The observed behaviour is recorded in `docs/` per T-001.

OUT OF SCOPE:
Deployment anywhere other than this repository. Any schedule more frequent than weekly.

DEPENDENCIES:
T-001, T-003, T-004, T-009.

IMPLEMENTATION CONSTRAINTS:
- `permissions: contents: write` on the refresh workflow only; `contents: read` on CI.
- A `concurrency` group so two refreshes cannot race.
- The refresh commit message must be deterministic and include the measurement date; append
  `[skip ci]` so the refresh does not retrigger CI.
- **The refresh must fail the workflow rather than commit** if `pnpm run fetch` fails its fail-loud
  guard, if `pnpm run validate` fails, or if any metric decreased by more than 50%. A failed refresh
  leaves the last good profile in place — a stale-but-correct profile always beats a fresh-but-wrong
  one.
- No third-party actions beyond `actions/checkout`, `actions/setup-node` and `pnpm/action-setup`, each
  pinned to a commit SHA.
- The refresh must not run the link check against Medium on every scheduled run (avoid looking like a
  bot); run it in CI only.
- Weekly, not daily. A daily commit purely to bump a date is contribution-graph padding and is exactly
  the vanity behaviour `02-audit.md` §5.3 rules out.

ACCEPTANCE CRITERIA:
1. Both workflow files exist and pass `actionlint` (or an equivalent YAML/schema check) with no
   errors.
2. `workflow_dispatch` on `refresh.yml` completes successfully and, when data is unchanged, produces
   no commit.
3. A dispatch run against deliberately stale committed data produces exactly one commit touching only
   `data/profile.json`, `assets/generated/**`, `README.md` and `docs/tokens.md`.
4. The commit message matches the fixed template and ends with `[skip ci]`.
5. With an invalid token, the refresh workflow **fails** and produces no commit; verified by a dry run
   with a deliberately broken secret.
6. `ci.yml` fails on a branch where `assets/generated/**` has been hand-edited away from what the
   source produces, and the failure names the drifting file.
7. `ci.yml` fails on a branch where `README.md` has been hand-edited.
8. CI reproduces byte-identical generated output on `ubuntu-latest` compared with the Windows-authored
   commit (T-003 AC3).
9. Total scheduled run time is under 5 minutes.
10. Both workflows use pinned action SHAs, verified by inspection.

REQUIRED TESTS:
- `actionlint .github/workflows/*.yml` (or `gh workflow view` plus a schema check).
- `gh workflow run refresh.yml && gh run watch`
- A branch with a hand-edited `assets/generated/hero-dark.svg` pushed to confirm `ci.yml` fails.
- A branch with a hand-edited `README.md` pushed to confirm `ci.yml` fails.
- `gh run list --workflow=refresh.yml` showing a successful scheduled execution.

VISUAL ACCEPTANCE CRITERIA:
n/a — non-visual ticket. (The visual consequence — that the profile's measurement date stays current —
is verified in T-012.)

REGRESSION RISKS:
- `GITHUB_TOKEN` returning zeroed `contributionsCollection` data is the most likely failure and would
  silently publish an empty activity strip; the fail-loud guard from T-001 is the specific defence and
  must be proven by AC5, not assumed.
- A bot commit every week inflates the owner's own contribution graph, which is the metric the profile
  displays. Weekly cadence keeps this negligible (about 52 commits a year against a 962-commit
  all-time base) but it must be disclosed in `docs/` — a profile that measures itself should say so.
- Pinned action SHAs go stale and eventually break; note the review cadence in `docs/`.
- A scheduled workflow in a repository with no other activity is disabled by GitHub after 60 days of
  repository inactivity; document this and the `workflow_dispatch` remedy.

---

## T-011 — DOCUMENTATION AND ARCHITECTURE DECISION RECORD
STATUS: PLANNED

OBJECTIVE:
Document the pipeline so a competent stranger — or the owner in a year — can rebuild, extend or debug
it without reverse-engineering the scripts, and record the decisions that are non-obvious enough to be
undone by accident.

RATIONALE:
This repository's `README.md` is the product, so build documentation cannot live there. Several of the
most important constraints in this project are invisible in the code: why animation is SVG and not
GIF, why text is outlined, why only the hero animates, why the activity strip is weekly, and why
followers and stars are absent. Each will be "fixed" by a future contributor unless the reasoning is
written down where they will look.

SCOPE:
- `docs/PIPELINE.md`: prerequisites, install, the eight commands, the data flow from
  `gh api graphql` -> `data/profile.json` -> asset modules -> `assets/generated/` -> `README.md`, and
  how to add a new asset.
- `docs/DECISIONS.md`: one short record per decision, each with context, the decision, and the
  consequences accepted. At minimum: animated SVG over GIF/APNG; outlined text over embedded or system
  fonts; hero-only animation; weekly aggregation over the daily grid; the excluded metrics; the four
  selected repositories and why the others were excluded; the naming change from
  `PERSONAL DEVELOPMENT SYSTEM` to `ENGINEERING RECORD`.
- `docs/tokens.md`: generated by T-002.
- `docs/CSP.md`: the probe results from T-004 and what they mean for future asset work.
- `docs/OPERATIONS.md`: what the weekly workflow does, how to force a refresh, what to do when it
  fails, the token strategy, the self-measurement disclosure from T-010, and the pinned-action review
  cadence.
- A record of the font version and its hash (T-003), and the week-start convention (T-007).

OUT OF SCOPE:
Any change to `README.md`, any asset, any script behaviour.

DEPENDENCIES:
T-003, T-004, T-007, T-010.

IMPLEMENTATION CONSTRAINTS:
- Documentation lives in `docs/`, never in `README.md`.
- Every command shown must be copy-pasteable and must actually work on Windows PowerShell and on
  bash — no Python, no FFmpeg, no ImageMagick anywhere in the instructions.
- Decision records state the alternatives that were rejected and why, not only the choice.
- All documentation in English.

ACCEPTANCE CRITERIA:
1. `docs/PIPELINE.md`, `docs/DECISIONS.md`, `docs/CSP.md` and `docs/OPERATIONS.md` all exist and are
   non-empty.
2. `docs/DECISIONS.md` contains at least the seven decisions listed in SCOPE, each with context,
   decision and consequences.
3. Every command appearing in `docs/PIPELINE.md` matches a script in `package.json`; a test asserts
   there is no documented command that does not exist and no script that is undocumented.
4. `docs/PIPELINE.md` contains a step-by-step "add a new asset" procedure that names the module
   contract from T-003 and the `texts[]` requirement.
5. `docs/CSP.md` reproduces the seven probe verdicts from `.ai/project/04-csp-probe-results.md`.
6. `docs/OPERATIONS.md` documents the token strategy, the failure mode when the fetch guard trips, the
   60-day scheduled-workflow deactivation behaviour, and the self-measurement disclosure.
7. No documentation file contains Turkish characters.
8. Following `docs/PIPELINE.md` from a clean clone reproduces `assets/generated/**` and `README.md`
   byte-identically; performed by someone other than the pipeline's author.

REQUIRED TESTS:
- `pnpm test` covering AC3 (documented commands vs `package.json` scripts, both directions).
- `pnpm run validate` (the Turkish-character check extended to `docs/**`).
- A clean-clone reproduction run:
  `git clone . /tmp/hdu-verify && cd /tmp/hdu-verify && pnpm install --frozen-lockfile && pnpm run build && pnpm run build:readme && git diff --exit-code`

VISUAL ACCEPTANCE CRITERIA:
n/a — non-visual ticket.

REGRESSION RISKS:
- Documentation drifting from the scripts; AC3's bidirectional check is the only durable guard.
- Decision records written as conclusions without the rejected alternatives are worthless when someone
  later proposes exactly the rejected alternative.
- Putting build instructions in `README.md` by habit, which would corrupt the product.

---

## T-012 — FINAL INTEGRATION AND PUBLISHED VERIFICATION
STATUS: PLANNED

OBJECTIVE:
Publish, then verify the result on the real GitHub profile page across both themes and both
breakpoints, and sign off against every ruling in `02-audit.md` and every checklist item in
`03-design-brief.md` §10.

RATIONALE:
Local emulation is a model, not the truth. Camo behaviour, the Markdown sanitiser, the profile page's
actual content width, lazy image decoding and the GitHub mobile renderer can only be confirmed on the
live page. This ticket is the only one whose evidence is a screenshot of github.com.

SCOPE:
- Final pre-publish gate: `pnpm run check` green with a clean working tree.
- Confirm T-008 is complete (descriptions, topics and bio are live) — a hard precondition.
- Commit and push to `main`.
- Verify on `https://github.com/hakanduyar` in: desktop light, desktop dark, desktop dark-dimmed,
  mobile web (~390 px) light, mobile web dark, and with `prefers-reduced-motion: reduce` set at OS
  level.
- Verify the repository view of `README.md` as well as the profile view.
- Verify with images blocked.
- Capture and commit evidence to `.ai/visual/published/`.
- A sign-off table in `.ai/project/05-signoff.md` mapping every ruling in `02-audit.md` §7 and every
  item in `03-design-brief.md` §10 to a verdict and its evidence.

OUT OF SCOPE:
New features. Any asset redesign — a failure here reopens the owning ticket rather than being patched
in this one.

DEPENDENCIES:
T-005, T-006, T-007, T-008, T-009, T-010, T-011.

IMPLEMENTATION CONSTRAINTS:
- Publishing is the only step in the project that pushes to `main`; it requires explicit owner
  approval.
- If any verification fails, reopen the owning ticket. Do not hand-patch `README.md` or a generated
  asset — that would break the drift gate and the reproducibility guarantee simultaneously.
- Verification screenshots must be of the live github.com page, not of a local render.
- Allow for camo/raw caching: re-check any suspected stale asset after 10 minutes before declaring a
  failure.

ACCEPTANCE CRITERIA:
1. `pnpm run check` exits 0 on a clean tree immediately before the publish commit.
2. `README.md` on `https://github.com/hakanduyar` renders with all nine images loading — zero
   broken-image glyphs — in desktop light and desktop dark.
3. The hero animates in desktop dark and desktop light on first load, and resolves to the resting
   composition.
4. With OS-level `prefers-reduced-motion: reduce`, the hero shows the resting composition and never
   animates.
5. At a ~390 px viewport there is no horizontal scrolling, no clipped image and no text below roughly
   10 CSS px; at least one selected-system link is reachable within the first two screens.
6. With images blocked, every fact and every link is still present as Markdown text and the page is
   still useful.
7. All four selected-system links and all four channel links resolve to a 200 from a browser; each of
   the four repositories shows an English description and topics.
8. The GitHub profile sidebar shows a non-empty English bio.
9. No Turkish text appears anywhere on the rendered profile page, including in repository descriptions
   surfaced by pinned repositories.
10. The light variant reads as its own design (ink on warm paper) and the dark variant as a recessed
    instrument panel; neither is an inversion of the other. Confirmed by side-by-side screenshots.
11. `.ai/visual/published/` contains at least eight screenshots covering the six surfaces plus the
    reduced-motion and images-blocked cases.
12. `.ai/project/05-signoff.md` records a verdict and evidence for each of the 11 consolidated rulings
    in `02-audit.md` §7 and each of the 15 checklist items in `03-design-brief.md` §10, with no item
    left unaddressed.
13. `git log` shows the generated output committed by the pipeline, and `ci.yml` is green on the
    publish commit.
14. Seven days after publish, the scheduled refresh has run at least once and either produced a valid
    commit or reported a clean no-op.

REQUIRED TESTS:
- `pnpm run check`
- `pnpm run capture` (final local baseline committed to `.ai/visual/`)
- `curl -s -o /dev/null -w "%{http_code}" <url>` for all eight external URLs, with a browser user
  agent for Medium.
- `gh run list --limit 5` confirming `ci.yml` green on the publish commit.
- Manual browser verification across the six surfaces listed in SCOPE, with screenshots committed.
- `gh api users/hakanduyar --jq '{bio,name}'`

VISUAL ACCEPTANCE CRITERIA:
1. Side-by-side desktop light and desktop dark screenshots of the live profile show two intentional
   designs, not one design and its negative.
2. The hero occupies the full content column with no horizontal overflow and no visible seam against
   GitHub's canvas beyond its intended hairline edge.
3. Mobile screenshots show the hero legible and the first selected-system link visible without
   excessive scrolling.
4. The activity strip on the live page reads as a measured instrument, not as a sparse grid and not as
   a GitHub contribution widget.
5. Nothing on the page is recognisable as a profile-README template: no badge wall, no logo grid, no
   stat card, no trophy row, no typing banner.
6. The whole page can be read in under 20 seconds and, in that time, communicates: who he is, what he
   builds, four things he built, and how to reach him.

REGRESSION RISKS:
- Camo or raw caching serving a stale asset immediately after publish and being mistaken for a bug;
  the 10-minute re-check is the mitigation.
- GitHub's mobile app renders README HTML more conservatively than mobile web; if a `<picture>`
  degrades there, the `<img>` fallback must still be correct — check it, and if it fails, the fallback
  ruling in `02-audit.md` §3.2 applies.
- The profile page's content width differing from the assumed ~890 px, making assets slightly
  scaled; measure it and record the real value in `docs/`.
- Fixing a live failure by hand-editing `README.md`, which silently breaks the drift gate for
  everything that follows.
