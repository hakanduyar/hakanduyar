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
excluded from the material-change view. The signal panel's activity summary
then refreshes with the next owned public push rather than immediately.
Accepted trade-off; the alternative is a weekly metronome commit.

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

- `src/shared/profile.ts` — the discipline line, the strapline, the four
  capability modules, and the provenance note.
- `src/shared/config.ts` — featured repositories: the subject line (max 30
  characters), the plate line (max 25), the stack, the headline that becomes
  alt text and `<desc>`, and the verified contact channels.

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

Tokens (colour, type scale, grid) live in `src/shared/tokens.ts`.
`tests/tokens.test.ts` asserts the contrast floors and the opposite-direction
series ramps, so a palette edit that breaks accessibility or theme logic fails
`npm test`. Panel chrome — frame, section head, fit guards — lives in
`src/shared/panel.ts`; scene geometry lives in the five panel modules under
`src/`, and each asserts its own layout fits before it will emit.

## Adding an asset

1. Write a scene module returning `RenderedAsset` via `Canvas`, opening with
   `frame()` and `head()` from `src/shared/panel.ts` so it joins the system
   rather than sitting next to it.
2. Add its id to `PANEL_IDS` and build it in `src/build.ts` (both themes).
   `expectedAssetPaths()` derives from that list, so the validators pick up the
   new panel automatically.
3. Reference it from `scripts/generate/readme.ts` with a `<picture>` block and
   alt text that can stand in for the panel when the image does not load.
4. `npm run build` and let the harness complain until it stops.

Note the prose budget: the README allows three lines of text outside the
panels. Anything the new panel needs to say, it says by drawing it.

## Regenerating everything from scratch

```
npm ci
npm run build        # snapshot -> render -> readme -> validate
npm test
npm run qa:github    # GitHub's own renderer must preserve every construct
npm run qa:visual    # screenshots at 890px/360px + stillness proof (needs Chrome)
```

`qa:visual` writes evidence under `.ai/evidence/visual/` (git-ignored except
when intentionally committed for review).

## Things that look like improvements and are not

- **Adding a webfont or `<text>` to an SVG** — cannot load / shifts per-OS.
  The build rejects both.
- **Adding "just a subtle" animation** — v2 is static by construction, and the
  validator rejects keyframes, `animation`, `transition`, SMIL and motion
  queries in any asset. The reasoning is in
  [architecture.md](architecture.md#why-nothing-animates); the platform
  measurement behind it is in
  [github-platform-constraints.md](github-platform-constraints.md).
- **Adding one line of explanation under a panel** — this is how v1 became a
  report. `validate-all.ts` caps prose outside the panels at three lines.
- **Showing follower/star counts or a daily contribution grid** — ruled out on
  content grounds in `.ai/project/02-audit.md` §5; the numbers at this scale
  read against the owner.
- **A second accent colour** — the single-chroma rule is what makes the amber
  read as a signal. Tests enforce one signal element per asset.
