# TICKET STATUS LEDGER

Implementer-owned. Verdicts are recorded only after an independent review in
`.ai/reviews/`; a ticket is DONE only with a PASS on file.

Reviewer note (2026-08-23): the Codex CLI is installed and authenticated but
its account quota is exhausted until 2026-09-22 (evidence:
`.ai/reviews/codex-availability.md`). Per the operating model, independent
review is performed by fresh, isolated reviewer contexts with no access to the
implementer's reasoning, using the same ticket + evidence + repository inputs
the Codex reviewer would receive. The harness in `.ai/reviews/PROMPTS/` is
written so the identical reviews can be re-run under `codex exec` when quota
returns.

| Ticket | Title | Status | Evidence |
|---|---|---|---|
| T-001 | Scaffold + data snapshot | CLAUDE_TESTED | `data/telemetry.json`, `scripts/generate/snapshot.ts`, snapshot runs in build log |
| T-002 | Design tokens | CLAUDE_TESTED | `src/shared/tokens.ts`, `tests/tokens.test.ts` (contrast + ramp direction) |
| T-003 | Render pipeline + text manifests | CLAUDE_TESTED | `src/shared/{canvas,type,svg,emit}.ts`, determinism test, drift gate `npm run render -- --check` |
| T-004 | Verification harness | CLAUDE_TESTED | `scripts/validate/*`, 62 unit tests, `npm run qa:github`, `npm run qa:visual` |
| T-005 | Hero (animated + static, both themes) | CLAUDE_TESTED | `src/hero/hero.ts`, timeline frames + `<img>` liveness proof under `.ai/evidence/visual/` |
| T-006 | Structural assets (core modules, system plates) | CLAUDE_TESTED | `src/modules/`, `src/systems/`, screenshots |
| T-007 | Data assets (telemetry panel, activity strip) | CLAUDE_TESTED | `src/telemetry/`, `src/activity/`, screenshots |
| T-008 | Cross-repo prerequisite (English descriptions + topics on featured repos) | CLAUDE_TESTED | `.ai/reports/cross-repo.md` - descriptions and topics verified via gh |
| T-009 | README assembly | CLAUDE_TESTED | `scripts/generate/readme.ts`, `tests/readme.test.ts`, GitHub-renderer check green |
| T-010 | GitHub Actions | CLAUDE_TESTED | `.github/workflows/{ci,refresh-telemetry}.yml`, material-change guard |
| T-011 | Documentation | CLAUDE_TESTED | `docs/architecture.md`, `docs/visual-system.md`, `docs/maintenance.md`, platform constraints doc |
| T-012 | Integration + final acceptance | PLANNED | awaits per-domain PASS on T-001..T-011 |

## Deviations from the backlog as specified (with grounds)

1. **Typography engine is `fontkit`, not `opentype.js`** (T-003). fontkit
   reads the vendored WOFF2 directly and applies the font's own kerning
   tables; opentype.js needs TTF/OTF and hand-rolled kerning. Same licence
   position, better output, one fewer conversion step.
2. **Reduced-motion guard is NOT inside the SVGs** (T-005). The brief assumed
   `@media (prefers-reduced-motion: no-preference)` works inside an SVG image.
   Measured in Chromium: `no-preference` never matches there and `reduce`
   always matches, so the specified guard would blank the animation for every
   viewer. The constraint is honoured one level up via `<picture>` sources —
   which GitHub's sanitiser preserves (probed against `POST /markdown`).
   Full evidence: `docs/github-platform-constraints.md`.
3. **Hero geometry re-derived from measured widths** (T-005). The brief's
   coordinates assumed a proportional face; JetBrains Mono's flat 0.6em
   advance overflows those boxes (measured 590/665/239u vs 415/415/252u
   available). All brief *rules* kept; coordinates recomputed, with build-time
   `fit()` assertions so future overflows fail the build.
4. **Number floor for traceability lint is 2+ digits** (T-004): every
   headline metric on the page is >= 10, and single digits occur in ordinary
   English prose.
5. **Core modules strip is 890x240 with four stacked rows**, not the brief's
   890x132 four-cells-across (T-006). Measured grounds: the evidence
   repository names run to 453u+ in the mono face and cannot fit a 184u cell;
   rows give every name full width and 14.5u clearance to each separator.
6. **Telemetry panel is 890x200 with three vertical cell dividers** (T-007).
   The brief's shared-baseline method lines read as one run-on sentence
   without the dividers (review round 1, visual). In-image bar segment labels
   were removed entirely: at any size that fits, they sit below the legibility
   floor, and which names fit was an accident of string width. The Markdown
   table directly beneath names every language.
7. **System plate meta is split across both rows** (T-006): name + last-push
   month on row 1, implementation line + language on row 2, because
   name+language on one row overflows for the longest repository name
   (568u + 203u + gap > 746u available).
8. **Hero rails rebalanced** (T-005): LAST PUSH moved to the top rail
   (recency is the single most valuable fact on the page), MEASURED date to
   the bottom rail; the scale's method line lives in the telemetry panel
   caption and the Markdown table instead of under the hero scale (cell-width
   arithmetic in src/hero/hero.ts). All figures remain in the plate.
9. **Signal rationing is "at most one" per asset, not "exactly one"** —
   the brief's checklist item 6 says "exactly", its section 1.4 rule 5 says
   "at most". Implemented as at-most-one: hero and activity carry the amber
   element that marks their most important value; the structural assets
   (modules, plates, telemetry panel) carry none rather than inventing a
   most-important value to colour.
10. **HDU monogram renders at 16u, decorative** (T-005): a three-letter mark
    inside a 31.5u box cannot meet the 26u information floor; the same
    identity is the README's first heading line and the plate title. The
    validator holds decorative text to a 16u absolute floor.
11. **T-008 scope**: English descriptions were set on the three featured
    repositories that had none (additive only). Topics added 2026-08-23, see
    .ai/reports/cross-repo.md. The Turkish README inside the public spark
    repository is out of scope (do not rewrite unrelated repositories) and
    recorded there as an owner recommendation.
12. **.ai/ project records ship in the public repository deliberately** —
    the audit trail (spec, rulings, reviews, evidence) is part of the
    profile's provenance argument. Residual exposure accepted: the documents
    contain no secrets, only local paths under the owner's own user
    directory and the reasoning behind public output.
