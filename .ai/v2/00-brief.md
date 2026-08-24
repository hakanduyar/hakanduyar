# Profile v2 — Integrated Visual System

## Why v2

v1 shipped a correct, well-engineered system with the wrong public composition.
The README alternates image → paragraph → image → paragraph for 147 lines, repeats
metrics that are already inside the graphics (the telemetry table), and frames the
whole page as an "engineering record" — a technical audit sheet, not an identity.

v2 keeps the engine and replaces the composition.

## Objective

The README must read as ONE designed visual composition: a small stack of cohesive
panels, with almost no prose between them.

## Hard requirements

- Name-first. `Hakan Duyar` is the dominant hero element.
- No animated hero, no boot sequence, no HUD theatre. **Static-only** — v2 removes
  the animated variants entirely. Bias is static-first; nothing on the page depends
  on motion.
- Drop the "ENGINEERING RECORD" framing and every bureaucratic label with it.
- Public prose is reduced to near-zero. Content lives INSIDE the panels.
- No duplicated metrics. The telemetry table is deleted; the numbers exist once,
  in the panel that draws them.
- Every number remains measured from `data/telemetry.json`. No fabricated claims.
- Professional English only.
- Must hold together at 890px desktop and ~360px mobile. The 26u information floor
  (≈10.5 CSS px at 360px) is the guard and stays enforced.

## Panel stack

| # | Asset | Carries |
|---|---|---|
| 1 | `identity` | Name (display), discipline line, three measured readouts |
| 2 | `focus` | Four capability domains, one capability line each |
| 3 | `system-<key>` ×4 | One compact linked row per project: name, what it is, stack, last push |
| 4 | `signal` | Telemetry + activity merged into one panel (replaces two + a table) |
| 5 | `channels` | The four verified channels as a designed strip |

Total 16 static assets (2 themes × 8 logical panels).

## Prose budget

Outside the panels the README may contain only:
- the generated-file header comment
- one bold strapline under the hero (screen readers / search / image-off fallback)
- one link line under Channels — an image cannot carry four separate links, so
  this line is functional navigation, not prose
- one provenance line

Nothing else. No section paragraphs, no bullet lists, no tables.

## Explicitly out of scope

GitHub Pages. This is README-only.


## Two decisions taken against the first draft of this brief

**Focus drops the evidence repositories.** The draft had panel 02 name the
repository that evidences each domain. Those four repositories are `stock`,
`dropspot`, `spark` and `motion-system` — precisely the four that panel 03 is
made of. Naming them in both places is the duplication this redesign exists to
remove, so panel 02 states the practice and panel 03 states the evidence.

**System plates are wrapped in `<a>`, so there is no systems link line.** The
draft assumed images cannot carry links and budgeted a Markdown line for them.
A single image *can* be wrapped in a single anchor, and one plate is one
repository, so each plate links to its own repository directly. That deletes a
line of prose and makes the whole plate the click target. The channels panel
genuinely cannot do this — it carries four destinations in one image — so the
channels link line stays.
