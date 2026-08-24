# Maintenance

How to change the profile without breaking its guarantees.

## Routine: nothing to do

`refresh-telemetry.yml` re-measures the data every Monday and commits only if
something the owner did changed (a push, new commits, a new repository, a
language shift). The capture timestamp and the sliding 52-week window do not
count, so quiet weeks produce no commit. `ci.yml` blocks any push where the
committed assets or README no longer match their generators.

Known refresh exception: contributions that touch no owned public default
branch (issues or PRs on other accounts' repositories, work on non-default
branches) change only the sliding activity fields, which are deliberately
excluded from the material-change view. The activity strip then refreshes with
the next owned public push rather than immediately. Accepted trade-off; the
alternative is a weekly metronome commit.

Collapse guard: the refresh refuses to commit (and fails loudly) if any
headline gauge (repositories, commits, source bytes, trailing-year
contributions) falls to zero or by more than half against the committed
snapshot - the signature of a degraded API response, not of normal activity.
If the account genuinely changed that much (repositories made private or
deleted), re-run the workflow manually with the allow_metric_drop input.

Token note: the refresh workflow reads public data with the repository's own
`GITHUB_TOKEN`. If a run's snapshot step ever fails with empty contribution
data under that token, create a fine-grained PAT with public-repository read
access, store it as the `PROFILE_READ_TOKEN` secret, and the workflow will
prefer it automatically.

GitHub automatically disables cron-scheduled workflows after 60 days without
repository activity. If the profile has been quiet for two months, re-enable
the workflow from the Actions tab (one click) or push any commit.

## Changing the copy

Curated text lives in exactly two files:

- `src/shared/profile.ts` — identity paragraphs, strapline, capability
  modules, operating principles, private-work sentence, provenance note.
- `src/shared/config.ts` — featured repositories: headline, signals, stack,
  the 27-character plate line, and the verified contact channels.

After editing: `npm run build`. The renderers re-measure every string; if a new
string overflows its box the build fails with the arithmetic in the error
rather than shipping a collision. All public copy must be English — the
validator rejects Turkish characters and words, in Markdown and inside the
outlined SVG strings alike.

## Changing the featured repositories

Edit `FEATURED_REPOS` in `src/shared/config.ts` (key, repo name, copy), then
`npm run build`. The snapshot fails loudly if a featured repository is renamed,
archived or private. Keep it at four: the plates are sized for a shortlist, not
a directory. Candidates should carry real engineering signal — the point of
the section is depth, not recency.

## Changing the design

Tokens (colour, type scale, grid, motion) live in `src/shared/tokens.ts`.
`tests/tokens.test.ts` asserts the contrast floors and the opposite-direction
series ramps, so a palette edit that breaks accessibility or theme logic fails
`npm test`. Scene geometry lives in the five modules under `src/`; each module
asserts its own layout fits before it will emit.

## Adding an asset

1. Write a scene module returning `RenderedAsset` via `Canvas`.
2. Register it in `src/build.ts` (both themes; animated only if it is the hero
   — the one-animated-asset rule is deliberate).
3. Reference it from `scripts/generate/readme.ts` with a `<picture>` block and
   a real-text mirror of anything it displays.
4. `npm run build` and let the harness complain until it stops.

## Regenerating everything from scratch

```
npm ci
npm run build        # snapshot -> render -> readme -> validate
npm test
npm run qa:github    # GitHub's own renderer must preserve every construct
npm run qa:visual    # screenshots + <img> animation liveness (needs Chrome)
```

`qa:visual` writes evidence under `.ai/evidence/visual/` (git-ignored except
when intentionally committed for review).

## Things that look like improvements and are not

- **Adding a webfont or `<text>` to an SVG** — cannot load / shifts per-OS.
  The build rejects both.
- **Wrapping animations in `prefers-reduced-motion`** — misfires inside
  SVG-as-image (always-true/never-true; measured). Reduced motion is handled
  by the `<picture>` static sources. The validator rejects the query in assets.
- **Re-enabling SVGO's `removeHiddenElems`** — deletes every element whose
  entrance starts at `opacity:0` (it once stripped 19 of the hero's 25 paths).
- **Showing follower/star counts or a daily contribution grid** — ruled out on
  content grounds in `.ai/project/02-audit.md` §5; the numbers at this scale
  read against the owner.
- **A second accent colour** — the single-chroma rule is what makes the amber
  read as a signal. Tests enforce one signal element per asset.
