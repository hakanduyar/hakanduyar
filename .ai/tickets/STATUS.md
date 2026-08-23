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
| T-008 | Cross-repo prerequisite (English descriptions on featured repos) | IN_PROGRESS | see `.ai/reports/cross-repo.md` |
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
