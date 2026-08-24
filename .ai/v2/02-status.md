# v2 ticket status

Backlog: [01-backlog-raw.md](01-backlog-raw.md) (authored by Codex from a
read-only audit of the v1 tree). Brief: [00-brief.md](00-brief.md).

| Ticket | Title | State |
|---|---|---|
| T2-01 | Lock the v2 panel and data contract | implemented |
| T2-02 | Remove animation and variant machinery | implemented |
| T2-03 | Identity, focus and channels panels | implemented |
| T2-04 | Recompose systems, merge telemetry with activity | implemented |
| T2-05 | Rewrite the README generator | implemented |
| T2-06 | Replace v1 validator branches | implemented |
| T2-07 | Rewrite scene and README acceptance tests | implemented |
| T2-08 | Update browser, GitHub, probe and doc QA | implemented |
| T2-09 | Regenerate, remove orphans, final acceptance | implemented |

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

**T2-01 — `recentPushes` is left in the snapshot.** Nothing consumes it
(`rg recentPushes` finds only `data/telemetry.json` and its type). Removing the
field from `snapshot.ts` would require regenerating the snapshot against the
live API, which would move every measured number on the page in the middle of a
review. It is measured data sitting unused, not a rendering pathway.
