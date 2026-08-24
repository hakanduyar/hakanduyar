# Fix pass 1 — confirmed findings from independent review

Source: .ai/v3/review-1.md, VERDICT FAIL. Only the MAJOR doc-staleness finding
needs your work. Do not touch motion design, geometry, effect names, timing,
the build contract, or any test — those were not faulted. The other MAJOR
(evidence directory hygiene in visual-qa.ts) and both MINORs have already been
fixed outside this pass; do not re-touch scripts/validate/visual-qa.ts or
src/shared/emit.ts.

## The one thing to fix

These files still describe the V2 static-only engine and are now false against
the committed V3 reality (20 files, identity+signal animated with unguarded
CSS keyframes, four-source <picture> ladder on those two panels only, every
other panel still static two-source):

- docs/visual-system.md (around lines 88-101 per the review, but read the
  whole "Motion" section — verify the actual current line numbers yourself)
- docs/architecture.md (motion section, asset-count references, "why nothing
  animates" section — this needs to become "why most things don't animate" or
  similar, not deleted)
- docs/github-platform-constraints.md (the "static SVG only" current-ruling
  section added in V2 needs updating — the underlying platform MEASUREMENT
  stays true and must not be touched: a prefers-reduced-motion query still
  misfires inside an SVG image, which is exactly why the reduced-motion
  strategy is a static-fallback <picture> ladder rather than an in-SVG guard.
  State the CURRENT ruling accurately: two panels animate via unguarded CSS
  keyframes with a static <picture> fallback; the rest remain static by the
  same reasoning V2 established)
- docs/maintenance.md (asset-count / build-set references)

Read each file fully before editing — do not pattern-match on the review's
line numbers, they may have shifted. Correct only statements that are now
factually false. Do not rewrite sections that are still accurate (e.g. the
platform measurement table, the contrast/token rules, the panel-ownership
rules — none of that changed).

After editing, run and confirm clean: npx tsc --noEmit; npx vitest run;
npx tsx scripts/render/render-all.ts --check; npx tsx scripts/validate/validate-all.ts.
None of these should be affected by a docs-only change, but confirm nothing
broke. Do not touch any file under assets/generated/, src/, scripts/generate/,
or tests/.

When done, overwrite .ai/v3/implementation.md with a short note: which doc
files you corrected and what specifically was wrong in each (one line per
file). Do not restate the whole V3 implementation.
