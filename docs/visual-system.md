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
that asset's single most important value — the hero's index line, the activity
strip's peak week. No green anywhere: a green dot implies a running service,
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

One entrance (≤2400ms), then hold. Element order: frame draw-on → column
ruling → header → wordmark wipe → discipline line → readouts (staggered 60ms)
→ scale → index travel → footer. Easings: `cubic-bezier(0.16,1,0.3,1)` for
reveals, `cubic-bezier(0.33,0,0.15,1)` for the needle. The single loop — index
drift, ±6u, 9s, linear — starts only after the entrance ends.

Banned: typewriter text, glitch, scanlines, radar sweeps, flicker, pulsing
glow, rotation, particles, boot logs, count-up counters, loops under 6s,
animated filters, animated stroke-width.

The static variants are built from the same scene modules with animation
disabled, so the resting composition can never drift from the animated one.

## Vocabulary

Section labels: IDENTITY, CORE MODULES, SELECTED SYSTEMS, TELEMETRY, ACTIVITY,
OPERATING PRINCIPLES, CHANNELS. The banned lexicon (MISSION CONTROL, SYSTEM
ONLINE, INITIALIZING, END TRANSMISSION, NEURAL, 10X, PASSIONATE, ...) is
enforced by `scripts/validate/validate-all.ts` against both the README and
every string drawn inside every asset — outlining text does not exempt it,
because the `Canvas` manifest records everything that was drawn.
