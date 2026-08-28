# Claude independent review — browser QA

Date: 2026-08-28

Prototype: `../prototypes/system-brief-refined/index.html`

This verification was performed after Claude's independent review and R7 880px composition fix. Claude did not claim browser verification; these results are the separate Codex render pass requested by the review.

## Result

PASS

- Desktop dark at 1440 × 1000: 1220px page, no horizontal overflow.
- GitHub-width dark at 880 × 1000: 720px page, no horizontal overflow.
- GitHub-width light at 880 × 1000: 720px page, no horizontal overflow.
- Intermediate dark and light at 1080 × 1000: 1017px page, no horizontal overflow.
- Mobile dark at 390 × 845: 347px page, no horizontal overflow.
- Mobile light at 390 × 845: 347px page, no horizontal overflow.
- Exact application order in every render: Software Factory → Spark → Built in Layers → JointLedger.
- One `h1`, five main sections, and the engineering-identity thesis remain intact.
- Minimum computed font size among visible HTML elements is 10px; no sub-10px visible annotation remains.
- All four capability calibration keys remain one line at 1440, 1080, 880, and 390px.
- The JointLedger claim uses the full 679px content measure at 880px; the narrow override lands.
- Both reduced-motion paths park request/evidence tokens at their endpoints: OS-level `prefers-reduced-motion: reduce` and `?motion=reduce`.
- The preview harness is explicitly labelled and remains preview-only.

## Density comparison

Visible words per complete application article:

| Application | Before | After | Change |
|---|---:|---:|---:|
| Software Factory | 198 | 167 | −15.7% |
| Spark | 137 | 116 | −15.3% |
| Built in Layers | 153 | 130 | −15.0% |
| JointLedger | 248 | 207 | −16.5% |
| Total | 736 | 620 | −15.8% |

The reduction is concentrated where it was most useful. JointLedger retains the upstream-ownership boundary, missing frontend/selector, schema-only invitations, owner-scoped transaction path, idempotent backfill, runtime contribution, and unmerged/unreleased status.

## Rendered contrast spot-check

Computed foreground/background colours were sampled from the final rendered page at 880px and checked with WCAG relative luminance.

| Surface | Dark | Light |
|---|---:|---:|
| Mobile/narrow core-layer tint | 4.51:1 | 4.54:1 |
| Human-authority workflow step | 4.75:1 | 5.00:1 |
| Durable-domain tint | 4.91:1 | 5.03:1 |
| Core capability tier | 14.14:1 | 16.03:1 |

All sampled small-text surfaces meet the 4.5:1 AA threshold. The final tokens are dark `--faint: #858F9D` and light `--faint: #5E666E`.

## Visual review

- At 880px the former 560px dead-field problem is resolved. The 720px document measure has balanced margins and readable line lengths.
- Software Factory remains visually dominant through title size, placement, full-width treatment, and its domain/worker diagram.
- Spark, Built in Layers, and JointLedger remain peer case studies below the flagship.
- JointLedger's boundary panel remains prominent but no longer overwhelms the case narrative.
- Light mode retains sufficient visual definition; dark mode remains restrained rather than HUD-like.
- The 390px composition is unaffected by R7 and remains a true stacked recomposition.

## Evidence

- `../evidence/claude-independent-review/desktop-dark.png`
- `../evidence/claude-independent-review/desktop-light.png`
- `../evidence/claude-independent-review/github-880-dark.png`
- `../evidence/claude-independent-review/github-880-light.png`
- `../evidence/claude-independent-review/github-880-applications.png`
- `../evidence/claude-independent-review/github-880-jointledger.png`
- `../evidence/claude-independent-review/github-880-jointledger-bottom.png`
- `../evidence/claude-independent-review/capability-1080-light.png`
- `../evidence/claude-independent-review/mobile-dark.png`
- `../evidence/claude-independent-review/mobile-light.png`

## Scope

This pass did not replace the root README, publish, merge, push, or productionize the concept.
