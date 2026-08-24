# Architecture

The repository is a build system whose output happens to be a GitHub profile.
`README.md` and everything under `assets/generated/` are build products; the
system of record is the TypeScript under `src/` and `scripts/`, plus one data
snapshot.

## Data flow

```
GitHub GraphQL API
        |
        |  scripts/generate/snapshot.ts   (network happens here, and only here)
        v
data/telemetry.json          <- committed snapshot; single source of every number
        |
        |  src/build.ts                    (pure, deterministic)
        v
in-memory scene graph        <- 18 RenderedAssets, each with a text manifest
        |                       |
        |  scripts/render/      |  scripts/validate/validate-all.ts
        |  render-all.ts        |  (lints the manifests grep cannot see)
        v                       v
assets/generated/*.svg      findings -> exit code
        |
        |  scripts/generate/readme.ts
        v
README.md
```

Two properties carry the whole design:

1. **The network boundary.** Only the snapshot script talks to the API.
   Renderers read the committed JSON, so a build is reproducible from a
   checkout, and every number on the profile is traceable to one file with a
   capture timestamp.

2. **Determinism.** Same snapshot in, byte-identical SVG out (fixed 2-decimal
   precision, no clocks, no randomness). This is what lets CI run
   `npm run render -- --check` and fail if the committed assets were hand-edited
   or drifted from their source.

## Modules

| Path | Responsibility |
|---|---|
| `src/shared/svg.ts` | Element builders, escaping, numeric precision |
| `src/shared/type.ts` | Text -> vector outlines via fontkit (vendored JetBrains Mono) |
| `src/shared/tokens.ts` | Palettes, type scale, grid, motion tokens, contrast math |
| `src/shared/canvas.ts` | Drawing surface; records every drawn string in a manifest |
| `src/shared/config.ts` | Featured repositories, channels — decisions, not data |
| `src/shared/profile.ts` | Curated English copy — decisions, not data |
| `src/identity/` `src/focus/` `src/systems/` `src/signal/` `src/channels/` | One scene module per panel |
| `src/shared/panel.ts` | Panel chrome: the frame, section head and fit guards every panel shares |
| `src/build.ts` | The scene graph: every asset, both themes, both variants |
| `scripts/generate/` | Snapshot, README assembly, material-change guard |
| `scripts/render/` | Emit + SVGO optimise + drift check |
| `scripts/validate/` | Offline harness, GitHub-renderer check, visual QA capture |
| `tests/` | Invariants: contrast, ramps, motion caps, parity, honesty, language |

## Why text is outlined

An SVG referenced through `<img>` (how GitHub renders every README asset)
cannot fetch a webfont, and named system stacks have different metrics on every
OS — which breaks measured layouts. So `src/shared/type.ts` converts every
string to path outlines at build time. The trade-off (no selectable text, no
grep) is paid back in two ways: every asset carries `<title>`/`<desc>`, and the
`Canvas` records every drawn string in a manifest that the validator lints —
there is no way to draw text without registering it.

Full platform findings, with the probes that produced them:
[github-platform-constraints.md](github-platform-constraints.md).

## Why nothing animates

v1 animated the hero: a 2.4-second entrance plus one slow index drift, shipped
alongside a static variant that a `prefers-reduced-motion` source in the
README's `<picture>` selected. It worked, and it was measured to work — the
probes in `scripts/probe/platform-probes.ts` are what established that a motion
query *inside* an SVG image does not report the viewer's real setting, which is
why the variant ladder had to live in the README document instead.

v2 removed all of it. The entrance played once, above the fold, before most
readers had arrived, and the composition it resolved to was the composition
that carried the page. Shipping that resting state directly costs nothing a
reader would notice and removes the variant pairing, the reduced-motion ladder,
the animation register in `Canvas`, and the liveness assertion in visual QA.

The engine is now static by construction rather than by policy: `Canvas` has no
way to emit a keyframe, and `checkSvg` fails the build on CSS animation, SMIL
or a motion query in any generated file.

## Commands

| Command | What it does |
|---|---|
| `npm run build` | snapshot -> render -> readme -> validate |
| `npm run data:snapshot` | refresh `data/telemetry.json` from the API |
| `npm run render` | emit all 16 assets (`-- --check` = drift gate only) |
| `npm run readme` | regenerate `README.md` |
| `npm run validate` | offline validation harness |
| `npm run qa:github` | render the README through GitHub's real Markdown API |
| `npm run qa:visual` | headless-Chrome screenshots at 890px and 360px + stillness proof |
| `npm test` / `npm run typecheck` | vitest / tsc |

## CI

- `ci.yml` — every push/PR: typecheck, tests, asset drift gate (both directions:
  stale files and orphaned files), README drift gate, validation.
- `refresh-telemetry.yml` — Mondays 06:17 UTC + manual: new snapshot, rebuild,
  full verification, commit **only when owner-driven data changed** — the
  capture timestamp and the sliding 52-week window boundaries are excluded, so
  a week in which nothing was pushed produces no commit
  (`scripts/generate/material-change.mjs`; crash and no-change are distinct
  exit codes, so a failure can never masquerade as a quiet week).
