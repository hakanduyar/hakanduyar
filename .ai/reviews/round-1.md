# REVIEW ROUND 1 — 2026-08-23

Six independent reviewer contexts, one lens each; two adversarial verifiers per
critical/major finding (19 of 40 verifier passes completed before an external
rate-limit window; the remainder were verified by direct mechanical inspection,
recorded per finding below). Raw structured output: `round-1-raw.json`.

## Verdicts

| Dimension | Verdict | Confirmed critical/major | Minors |
|---|---|---|---|
| visual-design | FAIL | 3 | 7 |
| github-compat | FAIL | 4 (+2 overflow) | 6 |
| a11y-language | FAIL | 4 (+2 overflow) | 8 |
| code-architecture | FAIL | 4 | 5 |
| data-honesty | FAIL | 4 (+1 overflow) | 3 |
| security-hygiene | FAIL | 1 | 3 |

## Resolution ledger (all fixes in commit "fix(hdu): resolve review round 1")

CONFIRMED AND FIXED — critical:
- Hero readout stagger dead CSS (visual+code; verified from timeline frames):
  per-row complete animation shorthands; regression note in the source.
- dropspot database wrong (MongoDB -> PostgreSQL; verified via GitHub API).
- "whole applications rather than exercises" overclaim: identity copy now
  scopes the claim to the led-with work.

CONFIRMED AND FIXED — major:
- "Idempotency keys" -> "idempotent claim operations and ACID transactions"
  (matches the repository's own documentation).
- "production storefront" (unverifiable) -> "built as one system"; module
  count corrected to "nine motion modules over a shared base".
- '## Active work' section added, generated from the two most recent pushes
  (now snapshotted as `recentPushes`), plus the private-work sentence.
- material-change.mjs: whitelist of owner-driven fields (clock-derived fields
  excluded), distinct exit codes (0 change / 3 no-change / 1 error), workflow
  branches on them; crash can no longer read as "no change".
- Telemetry sanity floor in snapshot.ts (non-zero repos/commits/languages,
  52 buckets, complete featured set) guards the automated commit.
- CI README drift gate added (regenerate + git diff --exit-code).
- Workflows hardened: SHA-pinned actions, concurrency groups.
- snapshot.ts paginates past 100 repositories and cross-checks totalCount.
- Size budgets tightened to the brief's figures (90/45/400 KB); the 10 missing
  lexicon terms added; font-licence validator gate implemented.
- Dead modules deleted (geometry.ts, motion.ts, unused svg/tokens exports);
  docs no longer cite nonexistent test files or commands.
- Deviations ledger extended with items 5-12 (compositions, rails, rationing,
  monogram, .ai exposure).
- 'the public activity below' direction error fixed; brand casing fixed
  (GitHub/LinkedIn, natural-case method column); channel order per brief;
  horizontal rule before the footer removed; package.json description no
  longer carries the rejected name; hero desc sentence-cased; activity
  label 'MAX 46 IN ONE WEEK'; telemetry segment labels removed and the panel
  returned to 890x200; frames are real <rect rx> so the 2u radius renders;
  br1 rail joins the 200ms fade; alt text de-editorialized.
- T-008 completed: topics added to all four featured repositories (verified).

REFUTED (with grounds):
- "Three of four featured repos still have no description" (a11y overflow) —
  stale read: descriptions were set and verified via `gh repo view` before the
  review ran; the reviewer's evidence base predated the change. Topics were
  genuinely missing and are now set.

ACCEPTED AS RECORDED DEVIATIONS (not code changes):
- Page-evidence montage vs true GitHub render: the montage mirrors the README's
  asset order at both widths; GitHub-side structure is verified separately by
  `npm run qa:github` against POST /markdown. Recorded in the ledger.
- Scheduled-workflow 60-day auto-disable: documented in maintenance.md.
