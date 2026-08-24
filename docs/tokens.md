<!-- GENERATED FILE - do not edit by hand.
     Source: scripts/generate/tokens-doc.ts (values from src/shared/tokens.ts)
     Regenerate: npm run docs:tokens -->

# Design tokens - measured

Contrast ratios are WCAG 2.x relative-luminance ratios against each
palette's own `surface.base`, computed at generation time from the same
module the renderers import. Floors enforced by `tests/tokens.test.ts`:
text >= 4.5:1, data fills and signal >= 3:1.

## Dark - emitted light on an instrument face

Brightness means presence: the largest data segment is the brightest.

| Token | Hex | Contrast vs base | Use |
|---|---|---:|---|
| `surface.base` | `#0B0E14` | 1.00 | The asset ground. Opaque, always. |
| `surface.panel` | `#10141C` | 1.05 | Inset panels |
| `surface.raised` | `#161B25` | 1.12 | The single raised element per asset, if any |
| `surface.well` | `#070910` | 1.03 | Deepest recess of a measurement track |
| `rule.hairline` | `#1E2632` | 1.27 | Structural rules and panel edges. Never text. |
| `rule.strong` | `#2E3846` | 1.63 | Emphasis rules; survives the mobile downscale. Never text. |
| `rule.tick` | `#52606E` | 3.00 | Scale ticks and axis marks. Never text. |
| `text.primary` | `#E9EFF7` | 16.70 | Wordmark, headline values |
| `text.secondary` | `#A3B4C8` | 9.12 | Sub-lines, secondary values |
| `text.tertiary` | `#78899A` | 5.38 | Uppercase micro-labels. The floor for text. |
| `signal` | `#FF9E2C` | 9.36 | The only chroma. At most one element per asset. |
| `signal.trace` | `#7A5216` | 2.80 | Unfilled track portion. Fill only, never text. |
| `series.1` | `#DCE6F2` | 15.31 | Largest data segment |
| `series.2` | `#AEC0D4` | 10.39 | Data segment 2 |
| `series.3` | `#8496AC` | 6.38 | Data segment 3 |
| `series.4` | `#66788C` | 4.26 | Data segment 4 |
| `series.remainder` | `#78899A` | 5.38 | The "other" bucket - outlined, never filled |

## Light - deposited ink on technical paper

Density means presence: the largest data segment is the darkest. The two
series ramps run in opposite directions by design; a light theme produced
by inverting the dark one fails `tests/tokens.test.ts`.

| Token | Hex | Contrast vs base | Use |
|---|---|---:|---|
| `surface.base` | `#FAFAF7` | 1.00 | The asset ground. Opaque, always. |
| `surface.panel` | `#F2F2EC` | 1.07 | Inset panels |
| `surface.raised` | `#E9E9E1` | 1.17 | The single raised element per asset, if any |
| `surface.well` | `#FFFFFF` | 1.05 | Deepest recess of a measurement track |
| `rule.hairline` | `#DBDBD1` | 1.33 | Structural rules and panel edges. Never text. |
| `rule.strong` | `#B2B2A4` | 2.05 | Emphasis rules; survives the mobile downscale. Never text. |
| `rule.tick` | `#9AA0A8` | 2.52 | Scale ticks and axis marks. Never text. |
| `text.primary` | `#14171B` | 17.19 | Wordmark, headline values |
| `text.secondary` | `#474D55` | 8.16 | Sub-lines, secondary values |
| `text.tertiary` | `#616872` | 5.38 | Uppercase micro-labels. The floor for text. |
| `signal` | `#9C520F` | 5.54 | The only chroma. At most one element per asset. |
| `signal.trace` | `#E0C9A4` | 1.54 | Unfilled track portion. Fill only, never text. |
| `series.1` | `#171B20` | 16.54 | Largest data segment |
| `series.2` | `#3E454E` | 9.27 | Data segment 2 |
| `series.3` | `#5F6771` | 5.48 | Data segment 3 |
| `series.4` | `#7C848E` | 3.62 | Data segment 4 |
| `series.remainder` | `#616872` | 5.38 | The "other" bucket - outlined, never filled |

## Type scale

| Role | Size (u) | Weight | Tracking | Case |
|---|---:|---:|---:|---|
| display | 72 | 800 | 0.16em | UPPER |
| metricXl | 60 | 500 | 0em | as written |
| metric | 40 | 500 | 0em | as written |
| heading | 32 | 700 | 0.2em | UPPER |
| label | 26 | 500 | 0.18em | UPPER |
| body | 26 | 400 | 0.02em | as written |
| strong | 28 | 700 | 0.02em | as written |
| micro | 22 | 400 | 0.14em | UPPER |

The 26u `label` size is the floor for information-carrying text
(~10.5 CSS px at a 360px viewport); `micro` is annotation only and must be
duplicated in Markdown. Enforced by `scripts/validate/validate-all.ts`.
