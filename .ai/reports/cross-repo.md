# T-008 — Cross-repository prerequisite (completed 2026-08-23)

The audit (02-audit.md §7.10) made English descriptions on the four selected
repositories a blocking precondition for publish.

## Changes made (additive only — every field was previously EMPTY)

| Repository | Before | After |
|---|---|---|
| dropspot-project | (empty) | "Limited-stock drop platform with priority-scored waitlists and idempotent, transactional claim handling" |
| stock-management-system | (empty) | "Role-aware inventory system - NestJS, Next.js, PostgreSQL/Prisma, JWT auth with three-role access control" |
| Hunnes-Academy-motion-system | (empty) | "Composable GSAP motion system for a production storefront - ten motion modules behind one declarative config" (superseded, see correction below) |
| spark | "Personal Planning, Focus, and Growth System" (already English) | unchanged |

No repository content, branches, topics or settings other than the empty
description field were touched. Each claim in each description restates what
the repository's own README/source documents.

## Correction (2026-08-23, review round 1)

The motion-system description above was revised after the data-honesty review:
"production storefront" is unverifiable from the public record and the strict
module count is nine over a shared base. Live description since round 1:
"Composable GSAP motion system - nine motion modules over a shared base,
behind one declarative config" (second revision 2026-08-24, dropping the
deployment-target claim entirely; verified via gh).

## Topics added (2026-08-23, additive - every topic list was previously empty)

| Repository | Topics |
|---|---|
| dropspot-project | express, nodejs, postgresql, react, waitlist |
| stock-management-system | nestjs, nextjs, postgresql, prisma, rbac |
| Hunnes-Academy-motion-system | animation, gsap, javascript, motion-design |
| spark | indexeddb, local-first, pwa, react, typescript |

## Recommendations left to the owner (not automated)

1. **Pinned repositories**: pin `dropspot-project`, `spark`,
   `stock-management-system`, `Hunnes-Academy-motion-system` (profile pins
   have no public API; requires the profile UI).
2. **Profile bio** (currently empty): blocked from automation — the stored
   gh token lacks the "user" scope and granting it requires an interactive
   login. Owner action:
   `gh auth refresh -h github.com -s user` then
   `gh api -X PATCH user -f bio="Front-end and systems engineering. TypeScript, React, Node."`
3. **spark description register**: the live description ("Personal Planning,
   Focus, and Growth System") is Title-Case marketing phrasing; a
   sentence-cased, factual alternative would match the profile register,
   e.g. "Local-first planning PWA - offline, no backend". Left to the owner:
   T-008 was scoped to additive changes only.
4. `spark`'s README is Turkish on a public featured repository; an English
   README there would complete the language story. Out of scope for this
   project (do not rewrite unrelated repositories).
