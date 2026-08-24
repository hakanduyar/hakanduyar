# Visual system

The design language is a measurement instrument, not a sci-fi set. Four rules
govern everything; when a detail conflicts with a rule, the rule wins.

- **RULE 1 — No ornament.** Every mark encodes a fact (a value from
  `data/telemetry.json`) or a structure (a real grid line, rule, axis or tick).
  There is no third category.
- **RULE 2 — Markdown first.** Images are the frame; Markdown is the carrier.
  Every name, URL and number exists as literal text in `README.md`.
- **RULE 3 — No metric without a measurement.** No number or unit appears
  anywhere unless it is read from the snapshot.
- **RULE 4 — Restraint is the brand.** Reference points are Linear and Vercel,
  not a film UI reel. Fewer elements, more whitespace, one accent.

## Colour

Two palettes with two *different physical metaphors* — the light theme is not
an inversion of the dark theme:

- **Dark — emitted light on an instrument face.** Brightness means presence.
  The largest data segment is the *brightest* (`series[0] #DCE6F2`).
- **Light — deposited ink on technical paper.** Density means presence. The
  largest data segment is the *darkest* (`series[0] #171B20`). The ground is
  warm paper (`#FAFAF7`), not white, so the asset reads as a sheet laid on
  GitHub's canvas.

The series ramps therefore run in opposite directions, and
`tests/tokens.test.ts` fails any edit that aligns them.

Exactly one chromatic hue exists: instrument amber (`#FF9E2C` dark /
`#9C520F` light). **At most one signal-coloured element per asset**, marking
that asset's single most important value — the identity plate's primary-language
share, the signal panel's peak contribution week. No green anywhere: a green dot implies a running service,
and nothing here is a running service. No language brand colours: the language
bar uses the neutral ramp, which is what keeps it from looking like a stat-card
widget.

All token values and their measured contrast ratios live in
`src/shared/tokens.ts`; the floors (text 4.5:1, graphics 3:1) are asserted in
`tests/tokens.test.ts`.

## Typography

One family inside assets: **JetBrains Mono** (vendored in `assets/fonts/` with
its OFL licence; see `PROVENANCE.md` there). Monospace advance means value
columns align by arithmetic. All in-asset text is converted to vector outlines
at build time; prose lives in Markdown and renders in the reader's own font.

| Role | Size (u) | Weight | Use |
|---|---|---|---|
| display | 72 | 800 | The wordmark. Once per document. |
| metricXl | 60 | 500 | Headline telemetry values |
| metric | 40 | 500 | Secondary values |
| heading | 32 | 700 | In-asset headings |
| label | 26 | 500 | **The floor for information-carrying text.** ~10.5 CSS px at a 360px viewport. |
| micro | 22 | 400 | Annotation only, and only when duplicated verbatim in Markdown. Absolute floor 16u. |

Uppercase with tracking for labels; sentence case never appears inside an
asset. No italics, no glow, no text stroke.

## Grid

`viewBox="0 0 890 H"`, width/height stripped at emit so GitHub scales the
asset to its column. 10 columns × 63u, 20u gutters, 40u margins
(40 + 630 + 180 + 40 = 890, exact). 8u vertical rhythm; hairlines sit on .5
coordinates so a 1u stroke covers one device pixel at 1×. Spacing scale:
4 8 12 16 24 32 48 64 96 — no other values.

Every asset paints its own opaque ground and draws its own hairline border:
GitHub ships several dark canvases and `<picture>` only distinguishes light
from dark, so transparency would sit on an unpredictable colour.


## Motion

There is none. Every asset is static, and the engine cannot produce anything
else: `Canvas` has no animation register, and `scripts/validate/checks.ts`
fails the build on CSS keyframes, an `animation` or `transition` property, a
SMIL element, or a `prefers-reduced-motion` query in any generated file.

v1 animated the identity plate — a 2.4s entrance and one 9s index drift — and
paired it with a static variant selected by a reduced-motion `<source>`. The
reasoning behind that pairing is still sound and still documented in
[github-platform-constraints.md](github-platform-constraints.md); what changed
is the judgement that the entrance was worth its cost. It played once, above
the fold, and resolved to the composition that actually carries the page.
Shipping that resting state directly is what v2 does.

## Vocabulary

Section labels: FOCUS, SELECTED SYSTEMS, SIGNAL, CHANNELS — drawn inside the
panels as a zero-padded ordinal and a name over a hairline rail, never as
Markdown headings. The identity plate carries no label at all; the name is the
label. The banned lexicon (MISSION CONTROL, SYSTEM
ONLINE, INITIALIZING, END TRANSMISSION, NEURAL, 10X, PASSIONATE, ...) is
enforced by `scripts/validate/validate-all.ts` against both the README and
every string drawn inside every asset — outlining text does not exempt it,
because the `Canvas` manifest records everything that was drawn.
