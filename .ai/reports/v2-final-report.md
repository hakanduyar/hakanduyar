# Profile v2 — final report

**Final verdict: PASS** (Codex, round 3, `.ai/v2/05-review-3.md`)

## What changed

v1 was engineering-sound and compositionally wrong. Its README ran
image → paragraph → image → paragraph for 147 lines: eight Markdown headings,
four identity paragraphs, a nine-row metrics table restating figures the
graphics already drew, twelve bullets under the project plates, five operating
principles. It read as a technical audit sheet with illustrations.

v2 keeps the engine and replaces the composition. **The panels are the page.**
Each draws its own section mark, so the README carries no headings at all and
only three lines of prose: the strapline, the channels link line, provenance.

| | v1 | v2 |
|---|---|---|
| README | 147 lines, 8.4 KB | 58 lines, 3.8 KB |
| Markdown headings | 8 | 0 |
| Generated assets | 18 (4 animated) | 16, all static |
| Payload | 376 KB | 295 KB |
| Tests | 62 | 75 |

## The stack

| # | Panel | Carries |
|---|---|---|
| — | `identity` | The name at 72u, one discipline line, three measured readouts |
| 01 | `focus` | Four domains, one capability line each |
| 02 | `system-*` ×4 | Repository, what it is, what distinguishes it, its stack, its last push — each plate its own link |
| 03 | `signal` | Source distribution, five lengths against one common track, closing on two sentence-case facts |
| 04 | `channels` | Four verified destinations |

## Reused

The whole engine: the deterministic SVG pipeline, the fontkit type system that
outlines every string, the token system with its contrast tests and
opposite-direction series ramps, the text-manifest lint that sees what grep
cannot, the drift gates, the GraphQL snapshot, the material-change guard, CI.

## Replaced

Every scene module (`hero`, `core-modules`, `telemetry`, `activity` → `identity`,
`focus`, `signal`, `channels`, plus a rebuilt `system-plate`), the README
assembler, and the composition-level tests and validators.

## Removed

- **All animation.** The hero's 2.4s entrance, its index drift, both static
  variants, the reduced-motion `<picture>` ladder, `Canvas`'s animation
  register, the motion tokens, and the `<img>` liveness assertion. The engine is
  now static *by construction*: `checkSvg` fails the build on keyframes,
  `animation`, `transition`, SMIL or a motion query.
- **Every duplicated metric.** The nine-row table, and — caught in review — the
  primary-language share that was live on two panels at once.
- **The 52-week histogram**, which failed the non-dashboard gate. Its figures
  survive as two sentence-case lines.

## Guards against drifting back to v1

- `validate-all` caps prose outside the panels at three lines and fails on any
  heading, bullet list or table.
- Every presented figure has exactly one owning panel, asserted in both
  directions.
- The generated directory must equal the build set — no missing panel, no orphan.
- Visual QA proves *stillness* (pixel-identical recapture) instead of liveness,
  at 890px and 360px.
- The type scale must contain only steps a panel actually draws.

## Review record

| Round | Verdict | Outcome |
|---|---|---|
| 1 | FAIL | 1 CRITICAL, 5 MAJOR. All accepted, none argued down. |
| 2 | FAIL | CRITICAL resolved, gate H flipped to PASS. Gate E and 2 MAJORs open. |
| 3 | **PASS** | All eight gates. No CRITICAL or MAJOR. Two cosmetic items, since cleared. |

Findings and resolutions are ledgered in `.ai/v2/02-status.md`, including four
declared deviations from the backlog — three accepted by review, one (the
`recentPushes` claim) withdrawn because it was factually wrong.

## Gates, final run

| Gate | Result |
|---|---|
| `tsc --noEmit` | clean |
| `vitest run` | 75/75 |
| `render --check` | 16/16 byte-identical |
| README / tokens drift | byte-stable |
| `validate` | 0 errors, 294.9 KB |
| `qa:visual` | no overflow at 890px or 360px; 8 panels pixel-identical across 2.5s |
| `qa:github` | 8 `<picture>` blocks, every asset reference and alt preserved, no headings, 8/8 links answer |

## How to preview

```
npm ci
npm run render          # emit the 16 assets
npm run readme          # regenerate README.md
npm run validate        # offline harness
npm run qa:visual       # captures to .ai/evidence/visual (needs Chrome)
```

`.ai/evidence/visual/page-{dark,light}-{desktop,mobile}.png` is the profile as a
reader sees it at both widths. The directory is git-ignored; regenerate it.

## Non-blocking notes

- **Payload headroom.** 295 KB against a 400 KB budget. The margin exists
  because path precision moved to one decimal; at two, the same content measures
  412 KB.
- **`data/telemetry.json` was hand-edited once** to strip the obsolete
  `recentPushes` block, so the file matches what the generator now produces. No
  measured value changed — verified by diffing every remaining key against
  `main`. Review ruled this an acceptable one-time schema migration.
- **`activity.max`, `maxIndex`, `activeWeeks` and `methods` are measured but
  undrawn.** Retained as provenance for the series they derive from, documented
  in place.
- **The snapshot was not refreshed.** `npm run data:snapshot` needs a GitHub
  token; `gh auth token` is unavailable on this machine (gh 2.4.0 predates that
  subcommand). The committed snapshot is current — measured 2026-08-23, one day
  before this work. Refreshing it would move every number on the page mid-review
  for no benefit.
- **The environment is Linux, not Windows.** The brief specified `C:\GitHub\hakanduyar`;
  this machine is native Ubuntu with no Windows filesystem, so the canonical path
  is `/home/hakan/GitHub/hakanduyar`, alongside the owner's other repositories.
