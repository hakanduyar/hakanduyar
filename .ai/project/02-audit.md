# 02 — INDEPENDENT AUDIT AND RULINGS

Authority: SPEC AUTHORITY (independent review). Not the implementer.
Date: 2026-08-23.
Evidence base: `.ai/project/00-context.md`, `.ai/project/01-link-verification.md`,
`.ai/evidence/github-graphql-raw.json` (58 repository nodes, re-derived below), and `README.md` at HEAD.

Everything numeric in this document was recomputed from `github-graphql-raw.json`. Nothing is estimated.

---

## 0. Additional facts derived from the evidence file (not previously written down)

These are computed, not guessed. The implementer must treat them as canonical alongside `00-context.md`.

| Fact | Value | Derivation |
|---|---|---|
| Public non-fork repositories | 58 | `repositories.totalCount`, 58 nodes present |
| Commits on default branches, all 58 repos | **962** | sum of `defaultBranchRef.target.history.totalCount` |
| Total stargazers, all repos | **5** | `crm-fe` 3, `Flutter-Tutorial` 2, everything else 0 |
| Repositories with a non-empty description | **11 of 58 (19%)** | `description != null` |
| Repositories with 0 stars | 56 of 58 | — |
| Archived repositories | 0 | `isArchived` false everywhere |
| Public source bytes | 3,935,869 | sum of `languages.edges[].size` |
| TypeScript | 2,474,685 B = **62.9%** | — |
| JavaScript | 685,224 B = **17.4%** | — |
| HTML | 449,304 B = **11.4%** | — |
| CSS | 135,894 B = **3.5%** | — |
| All other (Dart, SCSS, PLpgSQL, Swift, Kotlin, Java, Obj-C, Shell, Dockerfile) | 190,762 B = **4.8%** | — |
| Repos pushed in the trailing 12 months | **9 of 58** | `pushedAt >= 2025-08-23` |
| Most recent public push | **2026-08-16** (`Hunnes-Academy-motion-system`) | — |
| Earliest repository created | 2022-03-18 (`Flutter-Tutorial`) | account joined 2021-02-20 |
| Repos created per year | 2022:6, 2023:22, 2024:16, 2025:12, 2026:2 | — |

### Gaps in the evidence — these block work and must be fixed in T-001

1. `contributionsCollection.contributionCalendar` contains **only `totalContributions: 136`**. There is
   **no per-day or per-week data** in the evidence file. Any contribution visualisation is therefore
   currently unbuildable. The GraphQL query must be extended with
   `contributionCalendar { weeks { contributionDays { date contributionCount } } }`.
2. There is no `repositoryTopics`, no `licenseInfo`, no README content per repo, and no
   `openGraphImageUrl`. Do not assert anything about topics or licences.
3. `bio`, `blog`, `location`, `company` are verified EMPTY. Any "IDENTITY" panel that displays a
   location, an employer, a job title or a years-of-experience figure would be **fabricated**. Banned
   unless the owner supplies the value as an explicit claim about himself.

---

## 1. What is wrong with the current README

The file is 73 lines / ~5.5 KB. The critique below cites lines.

### 1.1 It is in the wrong language for its audience
- **Line 1** `# Merhaba 👋, ben Hakan Duyar` and every heading and paragraph through **line 64** are
  Turkish. This is a direct violation of the stated language policy and it silently removes the
  profile from consideration by every non-Turkish reader who lands on it.
- **Line 70** compounds this: the third-party stats card is requested with `&locale=tr`, so even the
  generated image speaks Turkish.

### 1.2 It is 100% claim and 0% evidence
- **58 public repositories exist. The README links to none of them.** Not one. The single question a
  visitor arrives with — "show me something you built" — is unanswered across all 73 lines.
- **Line 3** claims work that is "piksel mükemmelliğinde" (pixel-perfect). Unfalsifiable
  self-assessment, the exact register a senior reader discounts.
- **Line 9** "Şu anda ... bilgilerimi genişletiyorum" (currently expanding my knowledge in state
  management, testing and front-end performance) places a self-declared learning gap in the top ten
  lines of the document. In an English-language market this reads as junior positioning, and it is
  the third thing on the page.

### 1.3 The technology list is keyword stuffing
- **Lines 16-25** assert ~40 technologies as a flat list with no proficiency, no dates and no
  evidence. It claims Tailwind **and** Sass **and** Styled Components **and** Material UI **and**
  Ant Design **and** Chakra UI **and** ShadCN **and** Bootstrap simultaneously. Eight styling systems
  is not a specialism, it is a search-term list.
- The verified language distribution is TypeScript 62.9% / JavaScript 17.4% / HTML 11.4% / CSS 3.5% /
  SCSS 1.1%. There is no public evidence for Chakra UI, Ant Design, GraphQL, Docker, WebSocket or
  JIRA anywhere in the 58 repositories. The list is therefore not merely unverifiable, parts of it
  are **unsupported by the owner's own public record**.

### 1.4 Two sections have the same title
- **Line 13** `### 🛠️ Teknolojiler` and **line 29** `### ⚡ Teknolojiler`. The same heading twice,
  once as a list and once as an icon grid. Nobody proofread this file. On a page whose entire
  purpose is to demonstrate care about detail, this is the most damaging single defect.

### 1.5 The icon wall is fragile, third-party and legally careless
- **Lines 31-59** issue **27 external image requests** to **four uncontrolled hosts**:
  `raw.githubusercontent.com/devicons`, `cdn.worldvectorlogo.com` (line 35),
  `www.vectorlogo.zone` (lines 37, 45, 47, 48, 56, 57, 58) and `gw.alipayobjects.com` (line 53).
  Three of those four are third parties under no obligation to keep serving those paths. Any 404
  leaves a broken-image glyph permanently on the profile.
- **Line 53** is the worst offender: the Ant Design mark is hot-linked from an Alibaba object store
  (`gw.alipayobjects.com/zos/rmsportal/...`). That is an opaque, versionless CDN key.
- These are third-party **trademarks** used decoratively at 40x40 with no attribution and no
  licence review.

### 1.6 The icon wall is broken in dark mode, which is most readers
- Several devicons referenced are `-wordmark` variants whose wordmark is rendered in near-black:
  `nodejs-original-wordmark` (line 36), `express-original-wordmark` (line 39),
  `mongodb-original-wordmark` (line 41), `postgresql-original-wordmark` (line 42),
  `bootstrap-plain-wordmark` (line 54). On GitHub's dark canvas (`#0d1117`) these are effectively
  invisible. There is no `<picture>`, no `prefers-color-scheme` handling and no dark variant
  anywhere in the file. A large fraction of visitors currently see a row of holes.

### 1.7 Alt text is noise
- **Lines 32-58** every `alt` is the lowercase tool name (`alt="javascript"`, `alt="nextjs"`, ...).
  A screen-reader user hears 27 consecutive product names with no structure and no meaning. This is
  technically "has alt text" and practically worse than `alt=""`.

### 1.8 The stats cards depend on infrastructure that is unreliable or dead
- **Line 70** `github-readme-stats.vercel.app` — a community Vercel deployment that is routinely
  rate-limited and returns an error card instead of data.
- **Line 71** `github-readme-streak-stats.herokuapp.com` — **Heroku terminated free dynos in
  November 2022.** This host is at best unreliable and most likely dead. There is very probably a
  broken image on the live profile right now.
- **Line 71** also ends in a dangling `&` (`?user=hakanduyar&`) — copied without reading.
- **Lines 69-72** use `<img align="center">` inside a `<p>` with no `width`/`height`, so the two
  cards reflow unpredictably between desktop and mobile and cause layout shift.
- All three of these violate the "reproducible from source in-repo" constraint outright: the profile's
  most data-dense elements are rendered by servers the owner does not control.

### 1.9 Miscellaneous
- Emoji headings at lines 1, 13, 29, 63, 68 (👋 🛠️ ⚡ 📫 📊) — decorative, non-informative, and the
  brief bans emoji overload.
- **Line 64** puts the three contact links in a single undifferentiated pipe-separated run at the
  very bottom, below a 27-icon wall. The call to action is the least prominent element on the page.
- The GitHub `bio` field is EMPTY (verified). The sidebar next to this README is blank. Even if the
  README were excellent, the surrounding profile chrome currently says nothing.

**Summary judgement:** the current README is a 2021-era template. Its defects are not stylistic; it
is factually thin, partially broken in the default theme, dependent on two failing third-party
services, and it withholds the only thing a visitor came for.

---

## 2. Critique of the risks in the stated product goal

I do not accept the brief uncritically. "Futuristic HUD profile" is a genre with a high and
well-documented failure rate. Nine specific ways this project can fail, and the required mitigation.

### R1 — The profile becomes a picture of a profile (severity: critical)
The dominant failure. Content moves into images; GitHub's search, screen readers, mobile users,
text-only mirrors and the GitHub mobile app all get nothing. A beautiful unreadable page is worse
than an ugly readable one.
**Mitigation, mandatory:** Markdown-first. Every project name, every URL, every headline number must
exist as literal Markdown text. Images are the *frame*, never the sole *carrier*. Enforced by an
automated check (T-004 AC).

### R2 — The aesthetic writes cheques the data cannot cash (severity: critical)
This is the deepest risk and the brief does not acknowledge it. A mission-control aesthetic implies
fleet operations, live services, scale. The verified record is a solo practitioner: 136 contributions
in the trailing year, 5 stars across 58 repositories, 0 issues, 27 followers. If the visual language
promises NASA and the numbers deliver a personal side-project log, the reader does not conclude
"modest engineer" — they conclude **"stylist, not engineer"**, which is strictly worse than the
current honest-but-dull README.
**Mitigation, mandatory:** invert the usual ratio. Very few numbers, each stated with its
measurement method and timestamp. Precision, not magnitude, is the register. Drop every
operations-theatre label that implies running production systems (see §6).

### R3 — Template convergence (severity: high)
The genre has about six moves: corner brackets on every panel, a scanline sweep, a crosshair over
nothing, a hexagon mesh, a fake boot log, and a green "SYSTEM ONLINE" dot. If a stranger can name the
template in three seconds, the intended effect inverts completely.
**Mitigation:** the no-ornament rule (§3 of the design brief): every mark on the canvas must encode a
fact or a structure. Single accent hue. Entrance-then-hold motion instead of perpetual looping.
No third-party card services at all.

### R4 — Maintenance decay (severity: high)
Hard-coded numbers rot. A profile that reads "LAST UPDATED 2026-08" while the calendar says 2027-11
is actively worse than one with no date, because it proves the owner stopped caring, in his own
handwriting.
**Mitigation:** scheduled rebuild from live data; a visible generated-on line; and — critically — a
**fail-loud** fetch (§5) so an auth failure never silently republishes zeros.

### R5 — Motion fatigue and accessibility harm (severity: high)
Infinitely looping animation in a document the reader is trying to *read* is hostile. It also cannot
be turned off by the reader in a raster format.
**Mitigation:** one entrance sequence, above the fold only, that resolves to a permanent static
resting state; at most one low-amplitude loop with a period >= 6 s; all motion gated behind
`prefers-reduced-motion: no-preference`.

### R6 — Theme neglect (severity: medium-high)
Most dark-HUD profiles are unreadable in light mode because the light variant is an inverted dark
asset. The current README already fails this (§1.6).
**Mitigation:** two independently authored palettes with different *design logic*, not one palette
and its inverse (see design brief §1: emitted light vs deposited ink).

### R7 — Folklore-driven asset decisions break silently in production (severity: medium-high)
"Animated SVG works on GitHub" is true, but the surrounding rules (CSP on the raw host, what camo
does or does not proxy, whether a data-URI font or a data-URI raster survives) are widely repeated
and rarely measured. Building on folklore means discovering the failure on the live profile.
**Mitigation:** a **CSP/camo conformance probe** (T-004) that renders every candidate construct under
the exact `default-src 'none'; style-src 'unsafe-inline'; sandbox` policy before any of it is
committed, plus a mandatory post-publish verification on the real profile page (T-012).

### R8 — The 20-second budget (severity: medium-high)
A recruiter or a peer gives this page roughly 20 seconds. If the first 300 px is a wordmark and a
decorative scale with no evidence, the page has failed at its actual job regardless of craft.
**Mitigation:** the hero must carry three verifiable facts, and at least one project link must be
reachable within the first screen on a 390 px viewport.

### R9 — The private-work problem (severity: medium)
The most interesting current work is private (`hunnes-ikas-theme`, `software-factory`, `portfolio`,
`jointledger`). The public record therefore under-represents the owner, and the temptation is to hint
at invisible work to compensate. Hinting reads as evasion.
**Mitigation:** make the *public* work legible instead. 47 of 58 repositories have no description at
all; fixing the four linked ones (T-008) is the single highest-leverage, lowest-effort improvement
available to this profile. Private work gets **one** sentence, no repo names, no counts, no metrics.

---

## 3. RULING — Asset strategy

### 3.1 The comparison

Assumed hero: 890 x 300 CSS px, ~2.4 s entrance sequence, dark and light variants, retina target 2x.
Toolchain is Node 22 / npm / pnpm / Chrome only. No Python, no FFmpeg, no ImageMagick.

| Criterion | (a) GIF from headless Chrome frames | (b) Animated SVG + CSS keyframes | (c) Static SVG only | (d) APNG / animated WebP |
|---|---|---|---|---|
| **Encoder available in-toolchain** | Only via a pure-JS encoder (`gifenc`); no ffmpeg | Native — it is text | Native | APNG via `upng-js` works; **animated WebP realistically needs a native binary → unavailable** |
| **File size (hero, per theme)** | 58 frames at 24 fps of a dark gradient is the pathological case for a 256-colour palette: ~0.6–2.5 MB at 1x, ~3–9 MB at 2x | **15–70 KB**, resolution-independent | 8–35 KB | ~1.5–6 MB at 2x (true colour, so *larger* than GIF) |
| **Retina crispness** | 1x raster upscaled → soft type, soft hairlines. This design is *made of* hairlines. Fatal. | Perfect at any DPR | Perfect | Same raster problem; only fixable by doubling to a 4x-byte asset |
| **Mobile (890 → ~360 px)** | Downscaled raster = mush | Clean rescale | Clean rescale | Downscaled raster = mush |
| **GitHub camo** | Proxied and animates | Proxied and animates — demonstrated in the wild by the widely used typing-SVG services, which are animated SVG behind camo | Fine | Proxied; browsers animate APNG |
| **Dark/light** | Two full rasters → doubles the megabytes | Two text files → negligible cost | Negligible | Two full rasters |
| **`prefers-reduced-motion`** | **Impossible.** No mechanism exists. Direct violation of hard constraint 5. | Honoured: the media query is evaluated by the rendering browser inside the SVG document | N/A (no motion) | **Impossible.** Same violation. |
| **Accessibility** | `alt` only | `alt` + `<title>`/`<desc>` + reduced-motion + text mirrored in Markdown | Same, minus motion | `alt` only |
| **Reproducibility / byte-stability** | Headless capture timing is non-deterministic → output is **not byte-stable** → the "generated files are up to date" CI gate becomes impossible | Deterministic given fixed float precision → CI drift gate works | Deterministic | Deterministic input, but frames come from the same non-deterministic capture |
| **Build time** | Tens of seconds (browser launch + capture + encode) per asset per theme | Milliseconds | Milliseconds | Tens of seconds |
| **Motion-design ceiling** | Highest — anything the browser can render | High: transforms, opacity, `clip-path`, `stroke-dasharray`, staggers, filters. Sufficient for every move this design language needs. Cannot do JS physics, video, or heavy compositing. | None | Highest |
| **Diff / review quality** | Binary blob | Reviewable text diff | Reviewable text diff | Binary blob |

### 3.2 THE RULING

> **Primary strategy: (b) hand-generated animated SVG with CSS keyframes, emitted from a
> deterministic pure-Node pipeline.**

Three of the reasons are disqualifying for the alternatives rather than merely preferable:

1. **Reduced motion.** Hard constraint 5 requires honouring `prefers-reduced-motion` where feasible.
   In (a) and (d) it is not feasible at all — there is no mechanism. In (b) it is one media query. A
   raster format cannot satisfy a constraint the brief made mandatory.
2. **Hairlines at 2x.** This entire design language is 1 px rules, tick marks and tabular alignment.
   A rasterised 1x hairline on a retina display is a grey smear. The visual thesis dies in (a) and (d).
3. **Byte-stability.** The project requires reproducibility and a CI gate proving generated output
   matches source. Headless-capture pipelines are not byte-stable, so (a) and (d) destroy the single
   most valuable guard-rail in the plan.

Size is the fourth reason and it is not close: roughly 30–100x.

> **Mandatory companion: (c) static SVG.** Not an alternative — a required output of the same build.

Every animated asset must be emitted in **two files** from one source module:
`<name>.svg` (animated, all motion inside `@media (prefers-reduced-motion: no-preference)`) and
`<name>.static.svg` (the resting state alone). Rationale:
- It forces the author to design the resting state as a finished composition rather than as "what is
  left when the animation stops". This is the difference between motion design and a gimmick.
- It gives the visual-regression harness a stable diff target (T-004).
- It makes the fallback a one-line change in the README assembler if the conformance probe, or a
  future GitHub policy change, breaks animation on any surface.

> **Fallback is required — swap to `.static.svg` — when any of these is true:**
> 1. The conformance probe (T-004) shows animation stripped or degraded under the raw-host CSP.
> 2. Post-publish verification on the live profile (T-012) shows the animated variant failing in any
>    checked surface (github.com desktop light, desktop dark, mobile web).
> 3. The animated variant exceeds its size budget (hero 90 KB per theme) after SVGO.
> 4. The asset is **below the fold**. Rendering below-the-fold entrance animation is pointless: the
>    image may be lazily decoded and finish its one-shot sequence before the reader scrolls to it.
>    **Ruling: only the hero is animated. Every other asset ships static.** This is a design decision,
>    not a limitation — it also removes most of the risk surface.

### 3.3 Constructs that must be treated as unavailable inside an SVG-as-image

The raw host serves with a restrictive CSP (`default-src 'none'; style-src 'unsafe-inline'; sandbox`),
and browsers additionally block external loads for SVG referenced via `<img>`. Assume all of the
following fail, and let the probe *upgrade* the assumption rather than the reverse:
`<script>`, `<foreignObject>`, `@import`, `@font-face` with any URL, `<image href="...">` including
`data:` URIs, external `xlink:href`, CSS custom properties inherited from the host page, and any
network fetch whatsoever. Inline `<style>` with `@keyframes` and `@media` is the one rich capability
available, and the design must be built entirely on top of it.

SMIL (`<animate>`) is permitted as a narrow fallback if the probe finds a surface where CSS animation
in SVG-as-image is suppressed but SMIL is not. It must not be the default: CSS keyframes are easier
to gate behind `prefers-reduced-motion` and easier to review.

### 3.4 RULING — The font problem

The choice is between three real options and one fake one.

- **Option A — generic system stacks** (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`).
  Metrics differ per OS. A right-aligned tabular value column will either collide with its label or
  leave a ragged gap; a letter-spaced wordmark changes measured width by roughly 5–12% between macOS
  and Windows. In a design whose entire credibility rests on alignment, shipping an asset whose
  layout is different on every reader's machine is not acceptable. **Rejected for anything that must
  align.**
- **Option B — `@font-face` with an external URL.** Blocked by the CSP and by SVG-as-image rules.
  Guaranteed silent fallback to Option A, with extra bytes. **Rejected outright.**
- **Option C — `@font-face` with a base64 `data:` WOFF2.** `font-src` falls back to
  `default-src 'none'`, so this is very likely blocked. Even where it happens to work today it is
  undocumented behaviour that GitHub can change without notice, and it costs 25–90 KB per weight per
  file. **Rejected as a dependency.** The probe may test it; a positive result changes nothing,
  because the pipeline must not rely on it.
- **Option D — convert all text to vector outlines at build time** with `opentype.js` against a
  vendored font file, subsetting to only the glyphs each string actually uses.

> **RULING: Option D. All text inside every shipped SVG is converted to vector outlines. This is
> non-negotiable.**

Consequences, accepted deliberately:
- **No selectable or searchable text inside images.** This costs nothing here, because hard
  constraint 5 already requires the critical text to exist as real Markdown, and R1 makes that the
  governing rule of the whole project. The images were never allowed to be the sole carrier.
- **Outlined strings are not greppable**, so the normal content lint (banned lexicon, Turkish
  characters, fabricated numbers) would go blind exactly where it matters most. **Required
  mitigation:** every asset module must return `{ svg, texts: string[] }`, and the validator lints
  `texts[]`. An asset that emits a string it did not declare must fail the build. This is a hard
  architectural requirement, not a nicety — see T-003 and T-004.
- **Larger diffs.** Path data churns. Acceptable; mitigate with a fixed `floatPrecision` so the
  output is byte-stable and diffs only appear when content actually changes.
- Once subsetted, outlines are typically *smaller* than an embedded font file.

Font choice and licensing:
- **Primary: JetBrains Mono.** Single family for every glyph that appears inside an asset — labels,
  values, the wordmark. All long-form prose lives in Markdown and is rendered in the reader's own
  font, which is both more readable and more accessible than mono prose in an image.
- **Licensing is a gate, not a footnote.** The implementer must vendor the exact font binaries under
  `assets/fonts/` together with the licence file **shipped with that specific release**, and must
  read it before use. JetBrains Mono's licence changed between major versions; do not rely on
  recollection. If the vendored release's licence is not unambiguously permissive for outline
  embedding, fall back to **IBM Plex Mono (SIL OFL 1.1)** without further discussion.
- The validator must fail the build if `assets/fonts/` contains font binaries with no licence file
  alongside them.

---

## 4. RULING — Which repositories appear in "Selected systems"

(The section formerly called "Mission Control" — see §6 for the naming ruling.)

### 4.1 The four that ship

Ranked. Each was selected on demonstrable engineering substance, not commit count.

| # | Repository | Why it earns the slot |
|---|---|---|
| 1 | **`dropspot-project`** (JavaScript, 31 commits, pushed 2025-11-07) | The only repository in the record with genuine distributed-systems reasoning: limited-stock drops with a waitlist, priority scoring, **idempotency and transaction handling**, seeding, tests, and documented architecture. Idempotency under contention is a real problem that most portfolio projects do not know exists. This is the lead exhibit. |
| 2 | **`spark`** (TypeScript, 25 commits, pushed 2026-07-02) | Architecturally distinct from everything else: local-first PWA, Vite + React + TS, Dexie/IndexedDB, offline, **no backend**. Deliberately chosen constraints, and it is one of only 11 repos with a written description. Demonstrates judgement, not just assembly. |
| 3 | **`stock-management-system`** (TypeScript, 10 commits, pushed 2025-11-10) | The only credible server-side exhibit: NestJS + Next.js 14 + PostgreSQL + Prisma, JWT, **3-role RBAC**. Directly counters the "front-end only" read that the current README invites. Authorisation modelling is the specific signal here — say that, not "full-stack". |
| 4 | **`Hunnes-Academy-motion-system`** (JavaScript, 9 commits, pushed **2026-08-16**) | Most recent public activity, one week old at audit date, so it is what makes "active" true rather than asserted. And it is a *system*: `src/core.js`, `router.js`, 10 motion modules, 5 page modules, a built dist bundle. A modular motion architecture is exactly the discipline this whole profile is claiming; it is thematically load-bearing. |

Low commit counts on three of these are not a defect and must not be hidden or spun. **Do not display
commit counts for the selected projects** — 9 commits next to a claim of architectural depth invites
the reader to do arithmetic instead of reading code. Display language, last push month, and a
one-line statement of what is actually implemented.

### 4.2 What must NOT appear, and why

| Repository | Signal | Ruling |
|---|---|---|
| `goal-compass-daily` | 24 commits, but `00-context.md` records it as a **Lovable-generated scaffold README**, and its GitHub description is **in Turkish** | **BANNED.** Generated scaffold plus a language-policy violation on the destination page. |
| `planmaster-chronos-flow` (70 commits), `eat-fit-evolve` (57), `kilo-takip-dusler-alemi` (49) | All three **created 2025-06-21/22 within ~24 hours of each other**; two were pushed the same day they were created; none has a description | **BANNED.** High commit counts with same-day create-and-abandon is the fingerprint of generator output, not sustained engineering. Linking them invites precisely the scrutiny that destroys the page. Commit count is not depth. |
| `playable-ecommerce` | 9 commits, **created and last pushed on the same day** (2025-11-24), no description | **BANNED.** A one-day spike. Its Next + Express + Mongo story also duplicates `stock-management-system` without adding anything. |
| `crm-fe` | The profile's **highest-starred repo (3 stars)** — but an **empty README**, 12 commits, dormant since 2025-01 | **BANNED**, and this is the ruling most likely to be argued with. Three stars is not a reason to send a visitor to a page with nothing on it. A dead end costs more than the star gains. |
| `Flutter-Tutorial` (2 stars), `Frontend-Dersleri` (88 commits), `patika-dev`, `baykar-quiz-app`, `React-Quiz-App`, `Simon-Game`, `Drum-Kit`, `Dicee-Game`, `To-Do-List-App`, `Weather-App`, `card_component`, `random-quote-generator`, `login-signup`, `tic-tac-toe`, all `bootstrap-*`, all `*-clone` / `*_clone` | Course and tutorial output, 2022–2024 | **BANNED as a class.** `Frontend-Dersleri` has the second-highest commit count in the entire account (88) and is a lessons repository. This is the clearest possible proof that commit count must never drive selection. |
| `shop-app`, `blog_app`, `blog-app`, `kozmetik`, `medyanes-*`, `todoapp-medyanes`, `CaliskanAri----Medyanes-360-main` | 1–12 commits, no descriptions, several near-duplicate names | **BANNED.** Near-duplicate repository names on the same profile (`medyanes-smartboard-app` / `medyanes-smatboard-app` — note the typo, both public) are themselves a negative signal. Do not draw attention to that neighbourhood. |

**Count ruling: exactly 4.** Three is defensible and would also be fine. Five is not: the fifth-best
candidate is materially weaker than the fourth, and a weak fifth entry damages the four above it.

**Blocking precondition (see T-008):** three of the four — `dropspot-project`,
`stock-management-system`, `Hunnes-Academy-motion-system` — currently have **no GitHub description**.
Sending a visitor from a meticulously engineered profile to a bare repository page with no
description undercuts the entire exercise in one click. English descriptions and topics must be set
on all four **before** the new README is published.

---

## 5. RULING — Telemetry

### 5.1 The governing principle

> **Precision beats magnitude.** A small number stated exactly, with its measurement method and the
> date it was measured, reads as engineering rigour. The same number dressed up reads as insecurity.
> And: **prefer cumulative, durable measures over rate measures.** The cumulative record (58
> repositories, 962 commits, four and a half years) is genuinely respectable. The trailing-year rate
> (136) is the weakest number in the dataset. Lead with the record, not the rate.

The second principle is subtractive: **five numbers presented immaculately beat fifteen presented
adequately.** Every additional metric increases the chance one of them is unflattering, and dilutes
the ones that are not.

### 5.2 SHOW — truthful, verifiable, dignified

Each of these must carry its method and its measurement date. The method line is not fine print; it
*is* the aesthetic.

| Metric | Value | Required label |
|---|---|---|
| Public repositories | **58** | "public, non-fork" |
| Commits on default branches | **962** | "all-time, default branches, 58 public repositories" |
| Primary language share | **TypeScript 62.9%** | "share of 3.94 MB of public source" — the method label is mandatory, because language-by-bytes is a famously misleading metric when unlabelled |
| Last public push | **2026-08-16** | "last public push" — a live, honest recency signal, and the single most valuable fact on the page |
| Active since | **2021** | account created 2021-02-20; may alternatively be stated as "first public repository 2022-03" |
| Language distribution | TS 62.9 / JS 17.4 / HTML 11.4 / CSS 3.5 / other 4.8 | one bar, four filled segments plus an outlined remainder, values mirrored in Markdown |
| Trailing-12-month contributions | **136** | "contributions, trailing 12 months, as reported by GitHub" — see §5.4 for how |

### 5.3 DO NOT SHOW — vanity or misleading at this scale

| Idea | Verdict |
|---|---|
| **Followers (27)** | **BANNED.** A follower counter at 27 is a scoreboard the reader can see you losing. It converts a neutral fact into a negative one purely by framing it as a metric. |
| **Stars (5 total; 0 on all four selected projects)** | **BANNED**, and per-project star badges especially — four repeated zeros is self-harm rendered in a nice font. |
| **Streak counters** | **BANNED** three times over: the metric rewards trivia commits; the incumbent service is on a dead Heroku host (§1.8); and it violates "reproducible from source in-repo". |
| **Issues opened/closed (0), PRs (11)** | **BANNED.** Zero is not a number worth rendering, and 11 largely self-merged PRs does not describe collaboration. |
| **Any invented operational metric** — uptime %, latency ms, req/s, "SYSTEM NOMINAL 99.98%", CPU/memory gauges, a green "ONLINE" dot | **BANNED, absolutely.** This is the defining failure of the genre and the fastest way to be dismissed. **Rule: no unit may appear on this page unless a measurement behind it exists in `data/profile.json`.** |
| **Rank/grade cards (A+, S), trophy walls** | **BANNED.** Third-party, gamified, and universally read as a template. |
| **WakaTime hours / "hours coded"** | **BANNED.** No data source exists. Fabrication. |
| **"Years of experience: N", job title, location, company** | **BANNED as telemetry.** All four GitHub fields are verified EMPTY. If the owner wants to state experience, it belongs in prose as a first-person claim, never in an instrument panel where it masquerades as measured. |
| **Total commits across *all* branches, or lines-of-code** | **BANNED.** Not in the evidence, trivially inflatable, and LOC is a discredited measure. |

### 5.4 How to present 136 contributions with dignity

This is the hardest single question in the brief, so an explicit ruling.

**Do not render a 53 x 7 daily contribution grid.** 136 contributions across 365 days means roughly
**229+ empty days out of 365** — the grid would be an overwhelmingly blank field, which is a *worse*
statement than showing nothing at all. It also happens to be the most template-recognisable graphic
on GitHub.

**Render a 52-week aggregate strip instead.** 136 contributions over 52 weeks averages **2.6 per
week**, so a weekly strip has real, readable variation and legible rhythm where a daily grid has
holes. Rules for it:
1. Aggregate by ISO week. One column per week, 52 columns.
2. Scale the y-axis to the **actual maximum week**, and print that maximum as a label. Never
   normalise to an invented ceiling, and never clip.
3. Label the axis with the real total and the real window: "136 contributions, 12 months to
   2026-08-23".
4. Do not colour it green. Green is GitHub's own signal and importing it makes the asset look like a
   GitHub widget rather than an instrument.
5. Weeks with zero contributions render as a visible baseline tick, not as absence. Honest, and
   visually it reads as a measurement floor rather than a gap.

**Frame it as cadence, never as volume.** Do not put 136 in large type. It belongs as an axis label
on the activity strip. The large numbers on this page are 58, 962 and 62.9%.

**Say the window out loud.** "Trailing 12 months" stated plainly is confident. An unlabelled 136 is
the number the reader will assume you were hoping they would misread as something else.

---

## 6. RULING — Naming

### 6.1 `HDU // PERSONAL DEVELOPMENT SYSTEM` — reject the descriptor, keep the mark

`HDU` is good and stays. Three initials read as a unit designation, they are unambiguous, they set
the register in three characters, and they work at any size.

`PERSONAL DEVELOPMENT SYSTEM` must go, for one decisive reason and two supporting ones:

1. **Decisive: "personal development" is a fixed English idiom meaning self-improvement.** To a
   native English reader, "PERSONAL DEVELOPMENT SYSTEM" is a life-coaching product, not a software
   engineering practice. On a page whose entire premise is professional English, leading with a
   semantic collision that a native speaker will notice and a non-native speaker will not is the
   worst possible failure mode. This is an objective defect, not a taste preference, and it is
   sufficient on its own.
2. `SYSTEM` promises something the data cannot support (see R2). A "system" implies an operating
   platform. The page is a record of work.
3. The `//` separator plus an all-caps abstract noun is the single most common construction in the
   template genre being avoided.

### 6.2 The ruling

> **`HDU // ENGINEERING RECORD`**
>
> Sub-line: `Hakan Duyar — interface and systems engineering`

Why it is better, not merely different: **"record" makes a promise the data can keep.** A record is
a log of verifiable facts, which is exactly what this page contains and exactly what the visual
language is claiming. It converts the modest numbers from a liability into the point of the design.
"System" makes a promise the data cannot keep. It is also the only word in the shortlist with no
idiom collision, and it survives translation.

`//` is retained **only** in the hero wordmark, as a single deliberate typographic gesture, and is
banned everywhere else in the document.

Rejected alternates, for the record: `HDU // BUILD LOG` (too casual, and "build" collides with CI),
`HDU // SYSTEMS INDEX` (an index is a list, the page is more than that), `HDU OPERATIONS` (same
overclaim as R2), keeping the original (defect 1 above).

### 6.3 Section naming — the rest of the brief's vocabulary also needs pruning

Three of the proposed section names are the exact vocabulary of the template being avoided. Ruling
with mapping, so nothing is lost:

| Brief's name | Public label | Ruling |
|---|---|---|
| Identity | `IDENTITY` | **Keep.** Accurate, neutral. |
| Core modules | `CORE MODULES` | **Keep, conditionally.** Permitted only if each module is a genuine capability domain with named evidence attached. If it degenerates into a technology list, rename to `CAPABILITIES` and cut it to four items. It must never become the icon wall again. |
| Mission control | `SELECTED SYSTEMS` | **Rename.** "Mission control" implies operating live services under supervision. He is not. The rename costs nothing and removes an overclaim the reader can check. |
| Telemetry | `TELEMETRY` | **Keep.** Precisely the right word for measured facts with stated methods. Earns its place. |
| Contribution visualisation | `ACTIVITY` | **Rename.** Plain, honest, and does not oversell a 52-column strip. |
| Current operations | `ACTIVE WORK` | **Rename.** Same overclaim as "mission control", smaller. |
| Directives | `OPERATING PRINCIPLES` | **Rename.** "Directives" is the weakest item in the brief — it is pure costume, it implies orders issued to a crew of one, and it makes opinions sound like commands. These are opinions; label them as such and they gain authority. |
| Communication | `CHANNELS` | **Rename.** Shorter, and "communication" as a section header is oddly formal. |
| End transmission | **DELETED** | **Cut entirely.** Sci-fi cosplay with zero information content, and the single most template-identifying string that could appear on the page. **Replace with a real provenance line:** `Generated from source in this repository - data measured 2026-08-23 - build: pnpm build`. A genuine build stamp is far more on-brand for an engineering instrument than a fake sign-off, and it is true. |

---

## 7. Consolidated rulings (the implementer is bound by these)

1. Primary asset format: **deterministic, generated, animated SVG with inline CSS keyframes**;
   static SVG emitted from the same source as a mandatory companion and fallback.
2. **Only the hero animates.** Every other asset ships static.
3. **All SVG text is converted to vector outlines**; every asset module declares its strings in a
   `texts[]` manifest so the content lint can still see them.
4. **Markdown-first.** Every project name, URL and headline number exists as literal Markdown text.
5. Selected systems: **`dropspot-project`, `spark`, `stock-management-system`,
   `Hunnes-Academy-motion-system`** — exactly these four. No commit counts, no star counts.
6. Telemetry: **58 / 962 / TypeScript 62.9% / last push 2026-08-16 / active since 2021**, each with
   its method. **No followers, no stars, no streaks, no invented units.**
7. Activity: **52-week aggregate strip**, never a 53x7 daily grid, scaled to the real maximum, not
   green.
8. Name: **`HDU // ENGINEERING RECORD`**. Section labels per §6.3. `END TRANSMISSION` deleted.
9. **No third-party rendering services.** Nothing on the page may be produced by a server the owner
   does not control. This deletes `github-readme-stats`, `github-readme-streak-stats`, shields.io,
   devicon hot-links, vectorlogo.zone and `gw.alipayobjects.com`.
10. **Blocking precondition:** English descriptions and topics on all four selected repositories
    before publish.
11. **No metric without a measurement** in `data/profile.json`. Enforced by the validator, not by
    good intentions.
