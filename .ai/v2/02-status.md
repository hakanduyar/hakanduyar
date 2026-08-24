# v2 ticket status

Backlog: [01-backlog-raw.md](01-backlog-raw.md) (authored by Codex from a
read-only audit of the v1 tree). Brief: [00-brief.md](00-brief.md).

| Ticket | Title | State |
|---|---|---|
| T2-01 | Lock the v2 panel and data contract | implemented, round-1 findings resolved |
| T2-02 | Remove animation and variant machinery | implemented, round-1 findings resolved |
| T2-03 | Identity, focus and channels panels | implemented, round-1 findings resolved |
| T2-04 | Recompose systems, merge telemetry with activity | implemented, round-1 findings resolved |
| T2-05 | Rewrite the README generator | implemented, round-1 findings resolved |
| T2-06 | Replace v1 validator branches | implemented, round-1 findings resolved |
| T2-07 | Rewrite scene and README acceptance tests | implemented, round-1 findings resolved |
| T2-08 | Update browser, GitHub, probe and doc QA | implemented, round-1 findings resolved |
| T2-09 | Regenerate, remove orphans, final acceptance | implemented, round-1 findings resolved |

## Deviations from the backlog, with grounds

**T2-03 — focus does not name the evidence repositories.** The backlog asks for
each domain plus its evidence repository, following the first draft of the
brief. Those four repositories are exactly the four that panel 02 is made of,
so naming them in both places reproduces the duplication the redesign exists to
remove. Panel 01 states the practice; panel 02 states the evidence.
`tests/scene.test.ts` asserts the focus manifest contains no repository name.

**T2-05 — system plates are wrapped in `<a>`, and there is no systems link
line.** The backlog assumes images cannot carry links and budgets a Markdown
line for them. One image *can* be wrapped in one anchor, and one plate is one
repository, so each plate links to its own repository. That removes a line of
prose and makes the whole plate the click target. `qa:github` proves the
anchors survive GitHub's sanitiser. The channels panel genuinely cannot do this
— four destinations, one image — so its link line stays.

**T2-08 — the motion probes are kept, not deleted.** The backlog asks for the
CSS-animation, SMIL and reduced-motion probes to be removed from
`scripts/probe/platform-probes.ts`. They are the measurement establishing that
a `prefers-reduced-motion` guard inside an SVG image does not report the
viewer's real setting, which is the evidence behind going static. Deleting them
would delete the reasoning. `browser.ts` did lose its `reducedMotion` option as
the backlog requires; the probe now emulates the feature itself, so the shared
harness carries no motion knob.

**T2-01 — `recentPushes`: deviation withdrawn, finding upheld.** The original
claim here was that nothing consumed the field. That was wrong, and round-1
review caught it: `materialView()` in `scripts/generate/material-change.mjs`
included `recentPushes`, so a push to any repository still counted as a
material telemetry change even though v2 draws no section from it. The field is
now gone from the material view, from `Telemetry`, and from `snapshot.ts`, and
the stale block has been removed from the committed snapshot so the data file
matches what the generator now produces. No measured value changed. A push
still registers through `lastPush`.


## Round-1 review outcome

Codex returned **FAIL** on commit `5208351` with one CRITICAL and five MAJOR
findings. Full text: [03-review-1.md](03-review-1.md). Every finding was
accepted; none was argued down.

| Finding | Resolution |
|---|---|
| CRITICAL — TypeScript 49.1% drawn on both identity and signal | Identity's third readout is now `2021 / ACTIVE SINCE`, a fact no other panel carries. The signal-coloured track went with it, so the page now spends its single chroma exactly once, on the peak contribution week. |
| MAJOR — plates draw `plateLine`, never say what the system *is* | New `subject` field, drawn as the plate's first content line. A reader now learns dropspot-project is a limited-stock drop platform *and* that it does idempotent claim handling. |
| MAJOR — `recentPushes` still in the material-change pathway | Removed from the material view, the type, the generator and the committed snapshot. |
| MAJOR — SVGO animation-preservation branches and comments | Already removed in `daea134`, before the review landed. |
| MAJOR — activity test asserts only a rect count | Plot geometry is exported; the test now recomputes every one of the 52 weeks from the snapshot and asserts each bar's x, y, width and height, each zero-week stub, and the peak week's chroma. |
| MAJOR — docs still instruct maintainers to ship animation | `github-platform-constraints.md` fixed in `36acb05`; `architecture.md`, `maintenance.md`, `panel.ts`, `type.ts` and `telemetry-types.ts` corrected in this round. |
| MINOR — alt text repeats panel metrics | Kept, and the exemption is now explicit in `readme.ts` and asserted in `readme.test.ts`. Alt text is not a second telling of a figure; it is the only telling for a reader who cannot see the panel. |
| MINOR — unused `signals`, token steps, legacy fields | `FEATURED_REPOS.signals`, `TYPE.heading` and `TYPE.metricXl` removed; the token test now asserts every step on the scale is drawn. `methods` is kept deliberately — it is the recorded provenance of each figure, and its docstring now says so. |
| MINOR — stale comments across docs and source | Corrected. |

The fourth plate line pushed the generated payload to 412 KB, over the 400 KB
budget. Rather than raise the budget, path precision dropped from two decimals
to one — 0.1 user units, which is 0.1 CSS px in the profile column and 0.04 px
on a phone. Verified against captures at both widths. The set is now 296 KB.


## Round-2 review outcome

Codex returned **FAIL** again on `2f64dd4`. Full text:
[04-review-2.md](04-review-2.md). The CRITICAL and three of five MAJORs were
confirmed resolved; gate H flipped to PASS. What remained:

| Finding | Resolution |
|---|---|
| MAJOR — the activity test imported the renderer's own constants, so both could agree on a wrong number | Dissolved by the gate-E fix below: the histogram is gone. The distribution test that replaced it restates the track geometry locally, so a renderer that moves the track has to come to the test and say so. |
| MAJOR — `github-platform-constraints.md` still carried the ruling "use unguarded CSS keyframes" | The animation ruling is now explicitly marked historical, with the current ruling — static SVG only — stated beneath it. The measurement table stays: the row showing that a reduced-motion guard does not work inside an SVG image is a large part of *why* v2 does not animate. |
| MINOR — the `412 KB → 296 KB` figure in `emit.ts` was not reproducible from history | It was measured against an uncommitted intermediate. The comment now states a check anyone can run: set the precision back to 2, re-render, and the same content measures 412 KB against 295 KB at one decimal. Both figures verified. |
| MINOR — `subject` was not regression-tested | Asserted in the system-plate manifest test. |
| MINOR — stale precision, animation and token documentation | `emit.ts` header, `architecture.md`, `visual-system.md` and the generated `tokens.md` corrected. |
| **GATE E — still FAIL**: numbered rails, five tracks, MAX metadata and a 52-week histogram still read as a dashboard | The 52-week histogram is removed and its figures survive as two sentence-case lines. The panel is now one composition — five lengths against one common track — closing in the voice of the page rather than of an instrument. |

### On the ordinals, which round 2 also asked to reduce

Kept. `01`–`04` over a shared rail is the device that makes five separately
rendered images read as one system; it is what allows the README to carry no
headings at all. Removing it would trade the cohesion the redesign is built on
for a small reduction in register. The dashboard feel came from two stacked
charts, and that is what was removed instead.

### The accent moved

With the histogram gone, the peak-week mark went with it, so the page's single
chromatic element is now the largest share in the distribution. It is still
load-bearing — it moves when the measurement moves — and a test asserts that
`signal` is the only chromatic panel on the page.
