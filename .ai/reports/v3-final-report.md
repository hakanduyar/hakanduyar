# Profile v3 — motion pass — final report

**Final verdict: PASS** (Codex, round 3 confirmation, `.ai/v3/review-3.md`; substantive PASS in round 2, `.ai/v3/review-2.md`)

## Orchestration model

This pass followed a Codex-first architecture: Codex was the primary visual
designer, motion designer, and implementer throughout. Claude's role was
narrow — inspect repo state, prepare Codex tasks, launch and wait for Codex,
run deterministic verification Codex's own sandbox couldn't reach (Chrome
launch, live network calls), route confirmed findings back to Codex as scoped
fix tasks, and handle two mechanical corrections that needed no design
judgment. **Fable usage: 0** — never invoked; no problem in this pass met the
brief's bar for it.

## What changed

V2 (`feat/profile-v2-integrated-visual`) made the rendering engine static by
construction: `Canvas` had no animation register, and the validator rejected
any keyframe, `animation`, `transition`, SMIL, or motion query in any
generated asset. This pass reverses that decision for two panels only.

- **identity**: a one-shot acquisition bracket draws around the wordmark over
  2.4s, then a low-amplitude 9s tracking pulse repeats. `HAKAN DUYAR` and the
  three readouts never fade, translate, or otherwise depend on the animation.
- **signal**: a neutral 1.5u scan cursor sweeps the five distribution tracks
  every 7s. The measured bar lengths themselves are static; only the
  observation pass moves.
- **system plates** (4, still static): gained an observation rail — branch
  nodes off the existing index rule — so the selected repositories read as
  tracked entities even at rest.
- **focus** and **channels**: unchanged.

## How motion is GitHub-compatible

No JavaScript enters the README. Motion is unguarded CSS `@keyframes` inside
the SVG — proven by this repo's own `docs/github-platform-constraints.md`
measurement to run when GitHub embeds the file via `<img>`. An in-SVG
`prefers-reduced-motion` guard is proven by the same measurement to misfire
for every viewer, so the reduced-motion strategy is a `<picture>` fallback
ladder, not an in-SVG guard: identity and signal each ship four files
(`-dark`, `-light`, `-static-dark`, `-static-light`) behind a four-source
`<picture>` in this order — reduced-motion+dark-static, reduced-motion+
light-static, dark-animated, light-animated fallback — so the reduced-motion
sources win under first-match-wins semantics. Every other panel keeps its
original single dark-source/light-fallback picture.

## Content stability

`data/telemetry.json`, `src/shared/config.ts`, `src/shared/profile.ts`,
project selection, and metric ownership are byte-for-byte unchanged from V2.
Nothing about what the page says was revisited — only how two panels move.

## Numbers

| | V2 | V3 |
|---|---|---|
| Generated assets | 16, all static | 20 (identity + signal × 4 files each, 6 panels × 2 files) |
| Payload | 295.0 KB | 363.1 KB (400 KB budget) |
| Tests | 75 | 77 |
| README prose lines outside panels | 3 | 3 (unchanged) |

## Review record

Each review ran Codex in a **fresh context that did not inherit the
implementation conversation**, per the brief's independence rule, and was
told explicitly to assume the implementation might be wrong.

| Round | Verdict | Outcome |
|---|---|---|
| 1 | FAIL | 0 critical. 2 major: (a) four docs still described the V2 static-only engine — false against the committed 20-asset reality; (b) the evidence directory mixed current captures with stale, never-cleaned V1 files (a removed "ENGINEERING RECORD" HUD sequence). 2 non-blocking minor. |
| 2 | **PASS** | Both majors independently reverified as resolved against the tree, not the commit message. Zero critical/major remaining. The 2 minors from round 1 persisted, still non-blocking. |
| 3 | **PASS** | Narrow confirmation that the follow-up commit fixed exactly those 2 minors and touched no motion-design, content, test, or build-contract file. |

Full text: `.ai/v3/review-1.md`, `.ai/v3/review-2.md`, `.ai/v3/review-3.md`.

### What Claude fixed directly (not routed to Codex)

Two items were mechanical enough not to need a Codex implementation pass:

- `scripts/validate/visual-qa.ts` now clears the evidence directory before
  every capture, and both liveness assertions (timeline and `<img>`-embedded)
  save their before/after frame pair unconditionally rather than only on
  failure — a passing run that leaves no visual proof of motion is
  indistinguishable from one that was never checked.
- `src/shared/emit.ts`'s stale V2 byte-figure comment, and
  `scripts/validate/github-render.ts`'s `shell: true` token lookup plus
  undifferentiated error reporting (a missing-credential path now reports
  `SKIPPED`, distinct from a real renderer assertion `FAILED`).

Everything else — the animation register, the two animated panels, the
observation rails, the `<picture>` ladder, the doc corrections — was
implemented by Codex.

## Gates, final run

Codex's own review sandbox could not launch Chrome (`Crashpad ... setsockopt:
Operation not permitted`) or reach the network with valid credentials, so its
review reports describe "equivalent" `node --import tsx` commands for some
checks. This environment does not have that restriction; the literal commands
below were run directly.

| Gate | Result |
|---|---|
| `tsc --noEmit` | clean |
| `vitest run` | 77/77 |
| `render --check` | 20/20 byte-identical |
| README generation | idempotent (regenerating changes nothing already on disk) |
| `validate` | 0 errors, 363.1 KB |
| `qa:visual` | 16 static assets pixel-identical across 1.2s; identity and signal proven to differ at controlled timeline offsets, in the source renderer **and** embedded as `<img>`, in both themes; reduced-motion correctly selects the static variant |
| `qa:github` | 8 `<picture>` blocks / 12 `<source>` elements preserved, every asset reference and alt text intact, no headings rendered, 8/8 external links answer (verified live against `POST /markdown`) |

## How to preview

```
npm ci
npm run render          # emit the 20 assets
npm run readme           # regenerate README.md
npm run validate         # offline harness
npm run qa:visual        # → .ai/evidence/visual (needs Chrome; CHROME_PATH if not auto-detected)
```

`.ai/evidence/visual/page-{dark,light}-{desktop,mobile}.png` show the resting
frame at both widths. `.ai/evidence/visual/timeline-{identity,signal}-{dark,
light}-{a,b}.png` and `img-liveness-{identity,signal}-{dark,light}-{a,b}.png`
are before/after pairs proving the motion actually differs — a/b are always
distinct SHA-256s. The directory is git-ignored; regenerate it.

## Non-blocking notes

- `qa:github` timed out in this session's shell on first attempt due to an
  `HTTPS_PROXY` this Node version's `fetch` doesn't read automatically
  (`NODE_USE_ENV_PROXY=1` resolves it, or run without the proxy env set). Not
  a repository defect — verified by direct diagnosis, not assumed.
- Payload headroom is 37 KB against the 400 KB budget (363.1 / 400). No
  further motion should be added without re-measuring.
