# 03 — DESIGN BRIEF (binding)

Authority: SPEC AUTHORITY. Date: 2026-08-23.
Depends on: `02-audit.md` (rulings), `00-context.md` (verified data), `01-link-verification.md`.

This document is written so that two implementers working independently would produce the same
artefact. Where a value is given, it is a specification, not a suggestion. Where latitude exists, it
says so explicitly.

Working name (ruled in `02-audit.md` §6): **`HDU // ENGINEERING RECORD`**.

---

## 0. The governing rules

Four rules override every other instruction in this document. When any later detail conflicts with
one of these, the rule wins.

**RULE 1 — The no-ornament rule.** Every mark on every canvas must encode either a **fact** (a value
from `data/profile.json`) or a **structure** (a grid line, a rule, a container edge, an axis, a tick
that indexes a real scale). Marks that encode neither are deleted. There is no third category. This
single rule is what separates the intended result from the template genre, and it is the first thing
a reviewer checks.

**RULE 2 — Markdown-first.** Images are the frame. Markdown is the carrier. Every project name, every
URL, every headline number and every sentence of prose exists as literal Markdown text in
`README.md`. If the images fail to load, the page must still fully do its job.

**RULE 3 — No metric without a measurement.** No number, unit, percentage, timestamp or status word
may appear anywhere unless it is read from `data/profile.json`. No `ms`, no `%`, no `req/s`, no
uptime, no coordinates, no version numbers for a person, no serial numbers.

**RULE 4 — Restraint is the brand.** The reference points are Linear and Vercel, not a film UI reel.
When in doubt: fewer elements, larger whitespace, one accent, no extra stroke.

---

## 1. Colour

### 1.1 Two palettes, two different design logics

The light theme is **not** an inversion of the dark theme, and this is enforceable in review by a
single question: *what is the physical metaphor?*

- **Dark = emitted light on a dark instrument face.** Brightness means presence. The panel is a
  recessed well; values glow out of it. Data is drawn with luminance *added* to darkness.
- **Light = deposited ink on technical paper.** Darkness means presence. The sheet is warm, slightly
  off-white, like plotter paper or a laboratory record sheet. Data is drawn with ink *density* on a
  bright ground.

Concretely, this means the series ramps run in **opposite directions**: on dark the largest value is
the *brightest* segment; on light the largest value is the *darkest* segment. An implementer who
inverts the dark palette will produce a light theme whose largest value is the lightest segment,
which is immediately wrong and immediately visible.

### 1.2 Dark palette

Every contrast ratio below is measured (WCAG 2.x relative luminance) against `surface.base #0B0E14`.

| Token | Hex | Contrast vs base | Permitted use |
|---|---|---|---|
| `surface.base` | `#0B0E14` | — | The asset's own background. Opaque, always. |
| `surface.panel` | `#10141C` | 1.06 | Inset panels, the telemetry well |
| `surface.raised` | `#161B25` | 1.13 | The single raised element per asset, if any |
| `surface.well` | `#070910` | 1.16 | Deepest recess: the interior of a measurement track |
| `rule.hairline` | `#1E2632` | 1.27 | 1 u structural rules and panel edges. **Structure only, never text.** |
| `rule.strong` | `#2E3846` | 1.63 | 1.5 u emphasis rules, container edges. Structure only. |
| `rule.tick` | `#52606E` | 3.00 | Scale ticks and axis marks. Structure only, never text. |
| `text.primary` | `#E9EFF7` | **16.70** | Wordmark, headline values |
| `text.secondary` | `#A3B4C8` | **9.12** | Sub-lines, secondary values |
| `text.tertiary` | `#78899A` | **5.38** | All uppercase micro-labels. This is the floor for text. |
| `signal` | `#FF9E2C` | **9.36** | Instrument amber. The **only** chroma in the system. |
| `signal.trace` | `#7A5216` | 2.80 | The unfilled portion of a track the signal travels along. Fill only, never text. |
| `series.1` | `#DCE6F2` | 15.31 | Largest data segment |
| `series.2` | `#AEC0D4` | 10.39 | |
| `series.3` | `#8496AC` | 6.38 | |
| `series.4` | `#66788C` | 4.26 | Smallest filled data segment |
| `series.remainder` | stroke `#78899A`, no fill | 5.38 | The "other" bucket, drawn as an outlined segment |

### 1.3 Light palette

Measured against `surface.base #FAFAF7`.

| Token | Hex | Contrast vs base | Permitted use |
|---|---|---|---|
| `surface.base` | `#FAFAF7` | — | Warm paper. Deliberately *not* `#FFFFFF`, so the asset reads as a sheet laid on GitHub's white canvas rather than dissolving into it. |
| `surface.panel` | `#F2F2EC` | 1.04 | Inset panels |
| `surface.raised` | `#E9E9E1` | 1.09 | The single raised element per asset |
| `surface.well` | `#FFFFFF` | 1.05 | Inverted role: the *brightest* area is the measuring field |
| `rule.hairline` | `#DBDBD1` | 1.33 | 1 u structural rules. Structure only. |
| `rule.strong` | `#B2B2A4` | 2.05 | 1.5 u emphasis rules. Structure only. |
| `rule.tick` | `#9AA0A8` | 2.52 | Scale ticks. Structure only, never text. |
| `text.primary` | `#14171B` | **17.19** | Wordmark, headline values |
| `text.secondary` | `#474D55` | **8.16** | Sub-lines, secondary values |
| `text.tertiary` | `#616872` | **5.38** | All uppercase micro-labels. Floor for text. |
| `signal` | `#9C520F` | **5.54** | Burnt amber. The same signal, adapted to ink. |
| `signal.trace` | `#E0C9A4` | 1.54 | Unfilled track. Fill only, never text. |
| `series.1` | `#171B20` | 16.54 | Largest data segment (**darkest** — note the reversal) |
| `series.2` | `#3E454E` | 9.27 | |
| `series.3` | `#5F6771` | 5.48 | |
| `series.4` | `#7C848E` | 3.62 | Smallest filled data segment |
| `series.remainder` | stroke `#616872`, no fill | 5.38 | Outlined "other" bucket |

### 1.4 Colour rules

1. **Monochrome plus one signal.** The palettes contain exactly one chromatic hue (amber). There is
   no second accent, no green, no cyan, no purple, no red. If a state needs distinguishing, use
   luminance or a shape, not a new hue.
2. **No green "online" indicator, ever.** A green dot implies a running service. Nothing here is a
   running service. Recency is expressed with `signal`; dormancy with `text.tertiary`.
3. **No language brand colours.** The language bar uses the `series.*` ramp, never TypeScript blue /
   JavaScript yellow. Brand colours are what make an asset look like a generic stat card.
4. **Backgrounds are opaque.** GitHub ships at least four dark themes with different canvases
   (`#0d1117`, `#010409`, `#212830`, plus high-contrast). `<picture>` distinguishes only light from
   dark, so a transparent asset would sit on an unpredictable ground. Every asset paints
   `surface.base` edge to edge and defines its own edge with a `rule.hairline` stroke.
   Dark `surface.base` sits at 1.02:1 against GitHub's default dark canvas — near-invisible as a
   boundary, which is intended: it reads as a recessed instrument well, and the hairline supplies
   the edge.
5. **The `signal` colour is rationed.** At most **one** signal-coloured element per asset, and it
   must mark the single most important value in that asset. Two amber elements on one canvas means
   neither is important.
6. **`rule.*` and `*.trace` tokens must never carry text.** They are below the text contrast floor by
   design. The validator enforces this.
7. Both `text.tertiary` values land at exactly 5.38:1, which is deliberate: label weight reads
   identically across themes.

---

## 2. Typography

### 2.1 Font decision (ruled in `02-audit.md` §3.4)

- **One family inside assets: JetBrains Mono**, weights 400 / 500 / 700 / 800, vendored under
  `assets/fonts/` with the licence file shipped with that exact release. Fallback family if that
  licence is not unambiguously permissive for outline embedding: **IBM Plex Mono (SIL OFL 1.1)**.
- **All text inside every shipped SVG is converted to vector outlines** with `opentype.js`, subsetted
  per string. No `<text>` element ships except inside `<title>` / `<desc>` (which are not rendered
  and exist for assistive technology).
- **All prose lives in Markdown** and is rendered in the reader's own font. Long English sentences
  set in monospace inside an image are the worst of both worlds; they are banned.

### 2.2 Type scale

All sizes are in **SVG user units**, in a coordinate space where 1 u = 1 CSS px at GitHub's ~890 px
desktop content width (see §3.1).

| Role | Size | Weight | Tracking | Case | Colour | Usage |
|---|---|---|---|---|---|---|
| `t-display` | 72 | 800 | +0.16 em | UPPER | `text.primary` | The wordmark. Hero only. Once per document. |
| `t-metric-xl` | 60 | 500 | 0 | — | `text.primary` | Headline telemetry values. Tabular figures. |
| `t-metric` | 40 | 500 | 0 | — | `text.primary` | Secondary values |
| `t-heading` | 32 | 700 | +0.20 em | UPPER | `text.secondary` | In-asset section headings |
| `t-label` | 26 | 500 | +0.18 em | UPPER | `text.tertiary` | Micro-labels, keys, axis labels. **This is the minimum size for any text that carries information.** |
| `t-micro` | 22 | 400 | +0.14 em | UPPER | `text.tertiary` | Non-essential annotation only. **Must be duplicated in Markdown.** |

Line height: 1.0 for metrics (they are single-line and vertically centred on a defined baseline),
1.35 for labels, 1.5 for any two-line label block. Because text is outlined, "line height" means the
distance between the baselines the build places glyphs on; it is a build-time constant, not CSS.

### 2.3 Typographic rules

1. **Minimum information-carrying size is 26 u.** At a 360 px mobile viewport an 890 u canvas scales
   by 0.404, so 26 u renders at ~10.5 CSS px. Anything smaller is unreadable on a phone, and phones
   are a large share of GitHub profile traffic.
2. **Figures are tabular and right-aligned in columns.** Value columns align on their right edge, not
   on the decimal point (all values here are integers or one-decimal percentages).
3. **Uppercase with tracking for labels; sentence case never appears inside an asset.** Sentence case
   is the Markdown layer's job.
4. **No italics. No underline. No text shadow. No glow. No stroke on text.** Outlined glyphs are
   filled with a flat token colour and nothing else.
5. **Maximum 40 characters per line inside any asset.** Longer strings belong in Markdown.
6. **Maximum 5 distinct type sizes per asset.** In practice most assets use three.
7. Hyphens and standard ASCII punctuation only. No typographic quotes, no em dashes, no ellipsis
   characters inside assets — they widen the required glyph subset for no benefit.

---

## 3. Grid, geometry and spacing

### 3.1 Coordinate system

- Every asset is authored with `viewBox="0 0 890 H"`, **no `width` or `height` attributes**, and
  `preserveAspectRatio="xMidYMid meet"`.
- In the README each asset is referenced with `<img width="890" ...>` so desktop renders 1:1 and
  mobile scales down proportionally.
- 1 u therefore equals 1 CSS px at desktop and ~0.404 CSS px at a 360 px viewport.

### 3.2 The grid

- **10 columns of 63 u, 20 u gutters, 40 u outer margins.**
  Check: `40 + (10 x 63) + (9 x 20) + 40 = 40 + 630 + 180 + 40 = 890`. Exact, no rounding.
- Column *n* (1-indexed) starts at `x = 40 + (n-1) * 83`.
- **Vertical rhythm: 8 u baseline grid.** Every baseline, every rule and every panel edge lands on a
  multiple of 8 (offset by 0.5 for hairlines, see §3.4).
- **Spacing scale (u): 4, 8, 12, 16, 24, 32, 48, 64, 96.** No other spacing values exist.

### 3.3 Canvas sizes (fixed)

| Asset | viewBox | Animated | Files |
|---|---|---|---|
| Hero identity plate | `0 0 890 300` | **Yes** (the only one) | `hero.svg`, `hero.static.svg` x dark/light = 4 |
| Core modules strip | `0 0 890 132` | No | 2 |
| Selected system plate (x4) | `0 0 890 92` | No | 8 |
| Telemetry panel | `0 0 890 200` | No | 2 |
| Activity strip | `0 0 890 160` | No | 2 |

Total shipped assets: **18 files**. Size budgets in §7.

### 3.4 Geometry rules

1. **Hairlines: `stroke-width: 1`, centred on a `.5` coordinate** (e.g. `y = 36.5`), so at 1x the
   stroke covers exactly one device pixel. Vector scaling handles higher DPRs automatically.
2. **Any structural line that must survive mobile uses `stroke-width: 1.5`.** A 1 u line scales to
   0.4 px on a phone and fades; that is acceptable for background ruling and unacceptable for a panel
   edge or an axis.
3. **Corner radius: 2 u on containers, 0 elsewhere.** Instrument panels, not app cards. Radii above
   4 u are banned.
4. **No drop shadows. No gradients on containers.** A single linear gradient is permitted **once per
   document**, only on a data element, only between two tokens already in the palette, and only when
   it encodes a value (RULE 1).
5. **No blur filters** except `feGaussianBlur` with `stdDeviation <= 2` on at most one element per
   document. Filters are expensive to rasterise and are the usual cause of a soft, cheap-looking SVG.
6. **Information density cap for mobile legibility: maximum 3 data columns per horizontal band.**
   Four columns of numbers at 0.4x is a grey blur.
7. Every asset draws its own border: a `rule.hairline` rectangle inset 0.5 u from the viewBox edge.

---

## 4. Motion

Applies to the hero only. Everything else is static (ruled in `02-audit.md` §3.2).

### 4.1 The shape of the motion

> **One entrance sequence, then hold. Not a loop.**

The hero plays a single ~2400 ms entrance and then rests permanently in a finished composition. This
is the most important motion decision in the project: a perpetually animating banner on a document
someone is trying to read is both fatiguing and the loudest possible template signal.

**Exactly one element is permitted to loop**, subject to all of: amplitude <= 4% of canvas area,
period >= 6000 ms, no opacity flicker, and it must represent something real. In this design that
element is the signal index line on the hero's measurement scale.

### 4.2 Timing tokens

| Token | Duration |
|---|---|
| `dur-micro` | 120 ms |
| `dur-short` | 240 ms |
| `dur-medium` | 420 ms |
| `dur-long` | 720 ms |
| `dur-sequence-max` | **2400 ms** (hard ceiling for the whole entrance) |
| `stagger` | 60 ms between siblings, **maximum 8 staggered items** (480 ms total) |

### 4.3 Easing tokens

| Token | Curve | Use |
|---|---|---|
| `ease-entrance` | `cubic-bezier(0.16, 1, 0.3, 1)` | Reveals, wipes, rises. The default. |
| `ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Anything that both starts and stops in view |
| `ease-instrument` | `cubic-bezier(0.33, 0, 0.15, 1)` | The index line travelling to its resting value. Decisive start, long settle — a needle finding a reading. |
| `linear` | — | **Permitted only** for the single continuous loop. Banned everywhere else. |

### 4.4 Motion rules

1. **Motion is opt-in, not opt-out.** The resting state is the SVG's declared, default state. All
   animation lives inside `@media (prefers-reduced-motion: no-preference) { ... }`. If the media
   query fails to evaluate in any renderer, the reader gets the good static composition. This is
   strictly safer than declaring animation and overriding it under `reduce`.
2. **The resting state must be a finished composition on its own**, judged with the animation
   removed. `hero.static.svg` is generated from the same source module and is exactly this state.
3. **No element may hold opacity 0 for longer than 720 ms** from document start. A reader who arrives
   mid-sequence must never see a half-empty banner.
4. **Overshoot is capped at 3%.** No bounce, no elastic, no spring.
5. **Banned motions, absolutely:** typewriter/typing text, glitch or RGB-split, scanline sweeps
   across the canvas, radar sweeps, flicker, pulsing or throbbing glow, rotating anything, particle
   drift, fake boot logs or progress bars, counters that count up, and any loop shorter than 6 s.
6. **No animated `filter` and no animated `stroke-width`.** Both force expensive re-rasterisation and
   are visibly janky in an `<img>` context. Animate `opacity`, `transform`, `clip-path` and
   `stroke-dashoffset` only.

---

## 5. Vocabulary

### 5.1 Permitted lexicon

Every term below must map to something real on the page. Using one of these words for something it
does not describe is a RULE 1 violation.

`IDENTITY`, `CORE MODULES`, `CAPABILITIES`, `SELECTED SYSTEMS`, `TELEMETRY`, `ACTIVITY`,
`ACTIVE WORK`, `OPERATING PRINCIPLES`, `CHANNELS`, `RECORD`, `INDEX`, `SOURCE`, `BUILD`,
`GENERATED`, `MEASURED`, `METHOD`, `WINDOW`, `SCALE`, `MAX`, `TOTAL`, `SHARE`, `PUBLIC`,
`DEFAULT BRANCH`, `LAST PUSH`, `ACTIVE SINCE`, `STACK`, `IMPLEMENTED`, `PRIVATE`.

### 5.2 Banned lexicon (build-failing)

`MISSION CONTROL`, `DIRECTIVES`, `END TRANSMISSION`, `INITIALIZING`, `INITIALISING`, `BOOT`,
`BOOT SEQUENCE`, `ACCESS GRANTED`, `SYSTEM ONLINE`, `ONLINE`, `NOMINAL`, `STATUS: OK`, `[OK]`,
`[FAIL]`, `UPLINK`, `DOWNLINK`, `SUBSYSTEM`, `PROTOCOL`, `NEURAL`, `QUANTUM`, `CLASSIFIED`,
`CLEARANCE`, `TARGET`, `LOCKED`, `ENGAGE`, `OPERATOR`, `WELCOME`, `LOADING`, `SYNCING`,
`AI-POWERED`, `NEXT-GEN`, `CYBER`, `MATRIX`, `HACKER`, `NINJA`, `ROCKSTAR`, `GURU`, `WIZARD`,
`10X`, `PASSIONATE`, `PIXEL-PERFECT`.

Also banned: any coordinate, heading, altitude, velocity or bearing; any version number applied to a
person; any serial or ID number that is not a real repository name; any unit (`ms`, `%`, `req/s`,
`fps`, `°`, `KB/s`) not backed by a measurement in `data/profile.json`.

### 5.3 Banned visual clichés (review-failing)

Crosshairs or reticles over nothing; radar sweeps; corner brackets on every panel; hexagon meshes;
circuit-trace decoration; world maps or globes; ASCII art; barcode or QR strips; dot matrices with no
data behind them; progress bars sitting at 100%; "terminal window" chrome with a fake prompt; three
coloured traffic-light dots; contribution snakes; typing-SVG banners; badge walls; technology logo
grids; trophy or rank cards; wave dividers; animated GIF capybaras.

### 5.4 Tone of written copy

- Declarative, past or present tense, first person only where it is unavoidable. No exclamation
  marks. No emoji anywhere in the README (the current file has five; the target is zero).
- **State what was built and what it does. Never state how good it is.** "Idempotent order handling
  with transactional stock reservation" is evidence. "Clean, scalable architecture" is noise.
- Opinions are labelled as opinions (that is what `OPERATING PRINCIPLES` is for) and are at most one
  line each.
- Private work gets one sentence, no repository names, no counts, no metrics.

---

## 6. Composition of the hero

`viewBox="0 0 890 300"`. Dark and light variants are separate files, identical geometry, different
tokens. Coordinates below are exact.

### 6.1 Static structure (the resting state)

**Frame.** `surface.base` fills the full canvas. A `rule.hairline` rectangle at
`x=0.5 y=0.5 w=889 h=299`, radius 2, `stroke-width: 1`, no fill.

**Background ruling (structure, RULE 1 compliant).** Vertical `rule.hairline` lines at
`stroke-width: 1` at each of the 9 internal column boundaries — `x = 40 + n*83 - 10.5` for
`n = 1..9` — running from `y = 48` to `y = 252`. This is the layout grid made visible, which is the
honest version of "technical decoration".

**Top rail.** A horizontal `rule.hairline` at `y = 44.5`, from `x = 40` to `x = 850`.
- The `HDU` mark: a `rule.strong` square, `stroke-width: 1.5`, `x=40.25 y=12.25 w=27.5 h=27.5`,
  radius 2; inside it the outlined letters `HDU` at 16 u, weight 800, `text.primary`, optically
  centred.
- At `x = 80`, baseline `y = 31`: `ENGINEERING RECORD` at `t-label` (26 u), `text.tertiary`.
- Right-aligned to `x = 850`, baseline `y = 31`: `MEASURED 2026-08-23` at `t-micro` (22 u),
  `text.tertiary`. The date is injected from `data/profile.json.measuredAt` — never hard-coded.

**Wordmark block (columns 1-6, `x` 40 to 455).**
- Baseline `y = 168`: `HAKAN DUYAR` at `t-display` (72 u, weight 800, +0.16 em, `text.primary`).
- Baseline `y = 208`: `INTERFACE AND SYSTEMS ENGINEERING` at `t-label` (26 u, `text.secondary`).
  Note "AND", not an ampersand — the ampersand at this tracking reads poorly and widens the glyph
  subset.

**Instrument block (columns 7-10, right edge `x = 850`).** Three key/value rows, keys left-aligned at
`x = 598`, values right-aligned to `x = 850`, baselines at `y = 96`, `y = 132`, `y = 168`:

| Key (`t-label`, `text.tertiary`) | Value (`t-metric`, 40 u, `text.primary`) |
|---|---|
| `REPOSITORIES` | `58` |
| `COMMITS` | `962` |
| `TYPESCRIPT` | `62.9%` |

All three values come from `data/profile.json`. Between the rows, `rule.hairline` at
`stroke-width: 1` from `x = 598` to `x = 850` at `y = 108.5` and `y = 144.5`.

**Measurement scale (the single signal element).** A horizontal track from `x = 598` to `x = 850`
(252 u) at `y = 196`:
- Track: `signal.trace`, `stroke-width: 4`, `stroke-linecap: butt`.
- Ticks: `rule.tick`, `stroke-width: 1`, 8 u tall, every 25.2 u (11 ticks); every third tick is 14 u.
- Index line: `signal`, `stroke-width: 2`, 20 u tall, centred on the track, resting at
  `x = 598 + 0.629 * 252 = 756.5`. **The position encodes the TypeScript share.** It is not
  decorative — this is the RULE 1 justification for the whole element, and if the value changes, the
  line moves.
- Beneath, baseline `y = 218`, right-aligned to `x = 850`: `SHARE OF 3.94 MB PUBLIC SOURCE` at
  `t-micro`, `text.tertiary`.

**Bottom rail.** `rule.hairline` at `y = 252.5`, `x = 40` to `x = 850`.
- Left, baseline `y = 276`: `ACTIVE SINCE 2021` at `t-label`, `text.tertiary`.
- Right-aligned to `x = 850`, baseline `y = 276`: `LAST PUSH 2026-08-16` at `t-label`,
  `text.tertiary`, with the date value in `text.secondary`.

**Accessibility.** `<title>` = `HDU // ENGINEERING RECORD - Hakan Duyar`. `<desc>` = the full text
content of the plate as one sentence. `role="img"` on the root `<svg>`.

### 6.2 Entrance sequence

Total 2400 ms. All of it inside `@media (prefers-reduced-motion: no-preference)`.

| # | Element | Start | Duration | Property | Easing |
|---|---|---|---|---|---|
| 1 | Frame rectangle | 0 | 320 ms | `stroke-dashoffset` 3376 -> 0 (perimeter draw, starting top-left, clockwise) | `ease-entrance` |
| 2 | Column ruling (9 lines) | 200 ms | 240 ms each, `stagger` 20 ms | `opacity` 0 -> 1 | `ease-standard` |
| 3 | Top rail + `HDU` mark + rail labels | 320 ms | 240 ms | `opacity` 0 -> 1, `translateY` 4 -> 0 | `ease-entrance` |
| 4 | `HAKAN DUYAR` | 480 ms | 720 ms | `clip-path: inset(0 100% 0 0)` -> `inset(0 0 0 0)` (left-to-right wipe) | `ease-entrance` |
| 5 | Sub-line | 760 ms | 240 ms | `opacity` 0 -> 1, `translateY` 2 -> 0 | `ease-entrance` |
| 6 | Instrument rows (3) | 900 ms | 240 ms each, `stagger` 60 ms | `opacity` 0 -> 1, `translateY` 4 -> 0 | `ease-entrance` |
| 7 | Scale track + ticks | 1200 ms | 240 ms | `opacity` 0 -> 1 | `ease-standard` |
| 8 | Index line | 1500 ms | 900 ms | `translateX` from `x=598` to `x=756.5` | `ease-instrument` |
| 9 | Bottom rail + labels | 1700 ms | 240 ms | `opacity` 0 -> 1 | `ease-entrance` |

All animations use `animation-fill-mode: forwards` and `animation-iteration-count: 1`.

**The one permitted loop.** From 2400 ms onward the index line drifts +/- 6 u about its resting
position with a 9000 ms period, `linear`, opacity constant. Amplitude 12 u of an 890 x 300 canvas is
well inside the 4% cap. This is the only thing that moves after 2.4 s, and it is suppressed entirely
under `prefers-reduced-motion: reduce`.

### 6.3 What the hero must NOT contain

No photograph or avatar. No tagline about passion, learning or availability. No social icons. No
badge. No technology logo. No decorative bracket, reticle, mesh or circuit trace. No second amber
element. No number that is not in `data/profile.json`.

---

## 7. Other assets — composition rules

Full geometry is the implementer's, subject to §1-§5 and the following.

### 7.1 Core modules strip (`890 x 132`, static)
Four modules across the 10-column grid (columns 1-2 / 3-4 / 6-7 / 8-9, with column 5 and 10 as
breathing room, or four equal 190 u cells — implementer's choice, must be consistent). Each cell:
a `t-heading` module name, one `t-label` line naming the **evidence repository** for that capability,
and a 2 u `rule.strong` marker above the name. **Four modules maximum.** No icons. No logos. The
prose explanation of each module lives in Markdown beneath the image.

### 7.2 Selected system plates (`890 x 92` each, static, one per project)
Left: project name at `t-heading`. Below it: one `t-label` line, maximum 40 characters, stating what
is implemented. Right, right-aligned: `t-label` stack of `LANGUAGE` and `LAST PUSH YYYY-MM`.
A 1.5 u `rule.strong` vertical bar at `x = 40` spanning the plate's inner height acts as the index
mark. **No stars. No commit counts. No language brand colours. No screenshots.**
Each plate is wrapped in a Markdown link to its repository, and the repository name **also** appears
as a Markdown link in the text beneath (RULE 2).

### 7.3 Telemetry panel (`890 x 200`, static)
Three headline values at `t-metric-xl` across three cells (never four — §3.4 rule 6): `58`, `962`,
`62.9%`. Each with a `t-label` key above and a `t-micro` method line below. Beneath them, full width,
the language distribution bar: height 16 u, four filled `series.*` segments plus one outlined
remainder segment, **3 u gaps of `surface.base` between segments** (the gaps are what make the
segments meet the 3:1 non-text contrast requirement against a single common ground rather than
against each other). Segment widths are exactly proportional to the measured byte shares. Below the
bar, a `t-micro` method line: `SHARE OF 3.94 MB PUBLIC SOURCE ACROSS 58 PUBLIC REPOSITORIES`.
The same numbers are mirrored in a Markdown table below the image.

### 7.4 Activity strip (`890 x 160`, static)
**52 weekly columns, never a 53 x 7 daily grid** (`02-audit.md` §5.4). Column width 12 u, gap 4 u,
total `52*12 + 51*4 = 828` u, centred in the 810 u content width — reduce to width 11 u / gap 4 u
(`52*11 + 51*4 = 776`) and centre, or set the outer margin to 31 u; the implementer picks one and
documents it. Bars grow upward from a baseline. Zero-contribution weeks render as a 1.5 u
`rule.tick` baseline stub, not as absence. Y-axis scaled to the **actual maximum week**, with that
maximum labelled at `t-label`. Bars use `series.2`; the single maximum week uses `signal`.
Axis caption at `t-label`: `136 CONTRIBUTIONS - 12 MONTHS TO 2026-08-23`.
**Not green.** No day-of-week labels. No month labels (52 tick marks with four labelled quarters is
enough, and month labels at 22 u are unreadable on mobile).

---

## 8. README composition

Order is fixed. Everything is real Markdown except where an image is named.

1. **Hero** — `<picture>` with dark and light sources, `<img width="890">`, meaningful `alt`.
   Immediately beneath, one bold Markdown line: name, discipline, primary language. This line is what
   GitHub search and screen readers get first.
2. **`## Identity`** — two or three sentences of prose. No location, no employer, no job title, no
   years-of-experience figure (all verified EMPTY; asserting them is fabrication).
3. **`## Core modules`** — the strip image plus four Markdown bullets, each naming its evidence
   repository as a link.
4. **`## Selected systems`** — four linked plates, each followed by a Markdown line:
   `**[name](url)** - one sentence - stack - last push YYYY-MM`.
5. **`## Telemetry`** — the panel image plus a Markdown table of the same figures with a method
   column.
6. **`## Activity`** — the strip image plus one Markdown line stating the total and the window.
7. **`## Active work`** — two bullets derived from the two most recent pushes, plus **one** sentence
   about private work (no names, no counts).
8. **`## Operating principles`** — four to six single-line Markdown bullets. **No image.** These are
   opinions and are labelled as such.
9. **`## Channels`** — four plain Markdown links: GitHub, LinkedIn, Medium, Email. **No badges, no
   icons.** Medium is included on the strength of `01-link-verification.md` (200 with a browser UA,
   RSS feed confirms the profile exists); any automated link check must use a browser user agent for
   that host or allowlist it explicitly.
10. **Provenance footer** — one italic line, e.g.
    `Generated from source in this repository. Data measured 2026-08-23. Build: pnpm build.`
    This replaces the deleted `END TRANSMISSION`.

Rules: no `<details>` around primary content (it hides the evidence and is a template tic); permitted
only for an optional full repository index at the very bottom. No emoji. No horizontal rules other
than the ones Markdown headings already imply. `README.md` is **generated** and carries a
`DO NOT EDIT - generated by scripts/build-readme.mjs` comment at the top; the source partials live
under `src/readme/`.

---

## 9. Budgets

| Budget | Limit | Why |
|---|---|---|
| Hero, per theme, animated | **90 KB** | Above the fold; must paint fast on mobile data |
| Hero, per theme, static | 45 KB | |
| Any section asset, per theme | **45 KB** | |
| **Total of all generated assets** | **400 KB** | Roughly one medium photograph. A profile that pulls megabytes of images to say five numbers has failed its own thesis. |
| Distinct image requests in README | **<= 18 files / 9 `<picture>` blocks** | |
| Distinct type sizes per asset | 5 | |
| Signal-coloured elements per asset | **1** | |
| Looping animations per document | **1**, period >= 6000 ms | |
| Entrance sequence total | 2400 ms | |

---

## 10. Review checklist (a reviewer must be able to fail the work on any line)

1. Does every mark encode a fact or a structure? (RULE 1)
2. Does every number, link and project name exist as literal Markdown text? (RULE 2)
3. Is every number traceable to a key in `data/profile.json`? (RULE 3)
4. Is the light theme a different design logic (ink on paper), not an inverted dark asset?
5. Is the largest data segment the *brightest* on dark and the *darkest* on light?
6. Is there exactly one amber element per asset?
7. Do all text/background pairs meet 4.5:1? Do all data fills meet 3:1 against `surface.base`?
8. Is all in-asset text outlined, with no `<text>` outside `<title>`/`<desc>`?
9. Is all animation inside `@media (prefers-reduced-motion: no-preference)`, one-shot, <= 2400 ms,
   with at most one loop of period >= 6 s?
10. Is the static resting state a finished composition when judged alone?
11. Is every information-carrying string >= 26 u?
12. Does any banned lexicon term or banned cliché appear?
13. Is any content Turkish, or does any Turkish-specific character appear in public output?
14. Is the page legible and complete at both 890 px and 390 px, in both themes?
15. Are all size budgets met?
