VERDICT: PASS

Independent review of `ce3417f` at HEAD (`feat/profile-v3-motion-pass`). The two
MAJOR claims are substantiated against the tree: the four required documents now
describe the V3 20-asset contract, and `visual-qa.ts` clears stale evidence and
writes both liveness pairs unconditionally. The two prior MINORs remain; they
are non-blocking and are listed below.

The checked-in `.ai/v3/brief.md` is 72 lines and has no section 23 or A-J list.
For the requested A-J ruling, I rechecked the ten criteria represented by
`review-1.md` and the current V3 brief against source, generated output and
available evidence.

A. PASS — The four intended animated SVGs use unguarded CSS keyframes; static fallbacks and every other generated SVG contain no motion CSS.
B. PASS — `src/identity/identity.ts:61-65,129-137` keeps HAKAN DUYAR as the static display wordmark and does not attach motion to the name or readouts.
C. PASS — `src/identity/identity.ts:71-109`, `src/signal/signal.ts:136-151` and the system observation rails give the page restrained acquisition, scan and monitored-system character.
D. PASS — `src/systems/system-plate.ts:40-42,88-112` draws one trunk, four branches and four nodes per selected system, while identity/signal add tracking geometry without moving information.
E. PASS — The only timings are 2.4s acquisition, 9s identity pulse and 7s signal scan, with low opacity and no glow, SMIL, transition or boot-screen reveal.
F. PASS — `README.md` is an eight-panel stack with no scripts and exactly three prose lines outside panels: the strapline, channel links and provenance.
G. PASS — `data/telemetry.json`, `src/shared/config.ts` and `src/shared/profile.ts` are unchanged from the V2 base; the motion pass does not alter metric ownership or project selection.
H. UNVERIFIED — The source ladder and offline checks pass, but Chrome cannot start in this sandbox and `qa:github` has no valid credentials, so fresh browser/GitHub-render proof is unavailable.
I. PASS — Critical text and values are static in the animated variants, and the README places static identity/signal variants before animated theme sources for reduced-motion users.
J. PASS — The build has 20 assets totaling 371,766 bytes / 363.1 KiB, below the 409,600-byte total budget; the added system rails stay within the declared visual delta.

## Documentation audit

Read in full:

- `docs/visual-system.md:88-102` now states that identity and signal animate
  with unguarded keyframes, that their static light/dark variants are selected
  by the README ladder, that the other six panels stay static, and that the
  build emits 20 files.
- `docs/architecture.md:19,55,74-114` now describes 20 `RenderedAssets`, the
  constrained motion register, the two animated panels, the six static panels,
  and the 20-asset/visual-QA commands. The historical V1/V2 explanation is
  clearly historical rather than a current static-only claim.
- `docs/github-platform-constraints.md:17-21` retains the measured platform
  table unchanged. `:28-39` and `:71-77` correctly make the current ruling
  constrained two-panel motion with static `<picture>` fallbacks, while the
  measured fact that an in-SVG reduced-motion query misfires remains intact.
- `docs/maintenance.md:70-111` correctly distinguishes two-source static
  panels from four-choice animated-panel ladders and documents the V3 motion
  allowlist.

No false V2-static-only statement remains in those four required documents, and
the platform measurement table was neither altered nor removed. The only stale
implementation commentary found is the separate MINOR in `src/shared/emit.ts`.

## Evidence audit

`.ai/evidence/visual/` contains 50 files, all with current V3 names: 20 asset
captures, four page captures at desktop/mobile in both themes, reduced-motion
and liveness HTML fixtures, and the expected liveness evidence. There are no
`hero-*`, `ENGINEERING RECORD`, `liveness-later`, V1 or unrelated filenames.
All 16 required pairs exist:

- `timeline-{identity,signal}-{dark,light}-{a,b}.png`
- `img-liveness-{identity,signal}-{dark,light}-{a,b}.png`

Every `a`/`b` pair has a different SHA-256, and direct inspection of the dark
and light desktop/mobile page captures plus light/dark identity and signal pairs
shows the current wordmark, panels, brackets and scan cursor rather than the
stale V1 HUD. `scripts/validate/visual-qa.ts:100-104,131-132` writes both pairs
before testing equality, so a successful run leaves proof even when it passes;
`:203-209` clears the directory before a capture.

The requested visual command was attempted. Literal `CHROME_PATH=/usr/bin/google-chrome
npx tsx scripts/validate/visual-qa.ts` is blocked by the sandbox's `tsx` IPC
pipe (`listen EPERM`). The equivalent `CHROME_PATH=/usr/bin/google-chrome node
--import tsx scripts/validate/visual-qa.ts` reaches `/usr/bin/google-chrome` but
Chrome 149 exits before launch with Crashpad `setsockopt: Operation not
permitted`. I restored the inspected evidence snapshot after that failed
preflight cleanup; this is an environment limitation, not a claimed visual-QA
pass.

## CRITICAL

None.

## MAJOR

None. The stale-doc and contaminated/incomplete-evidence findings from
`review-1.md` are resolved in the current tree.

## MINOR

- `src/shared/emit.ts:5,34-41` is still stale: it says V2 ships no animation
  and preserves V2 precision figures (“412 KB at two decimals” / “295 KB at
  one”) despite the current 20-file, 371,766-byte V3 output. Replace the prose
  with a measured V3 statement or move historical figures to a changelog.
- `scripts/validate/github-render.ts:21-24,121-123` still uses `shell: true`
  for the `gh auth token` fallback and reports this environment's absent/invalid
  auth as a generic `[qa:github] FAILED: spawnSync /bin/sh EPERM`. Use a direct
  non-shell invocation and distinguish missing credentials/network from a
  renderer assertion. `ce3417f` does not change either file, and no resolution
  ledger entry was found despite `.ai/v3/fix-1.md:6-8` asserting these MINORs
  were fixed elsewhere.

## Direct checks

- `npx tsc --noEmit`: PASS, exit 0.
- `npx vitest run`: PASS, 5 files / 77 tests.
- `npx tsx scripts/render/render-all.ts --check`: blocked by `listen EPERM` in
  the sandbox; equivalent `node --import tsx scripts/render/render-all.ts
  --check`: PASS, all 20 assets match source.
- `npx tsx scripts/validate/validate-all.ts`: blocked by the same IPC issue;
  equivalent `node --import tsx scripts/validate/validate-all.ts`: PASS, 20
  assets, 0 errors and 0 warnings at 363.1 KB.
- `npx tsx scripts/generate/readme.ts && git diff --exit-code README.md`:
  blocked by the same IPC issue; equivalent `node --import tsx
  scripts/generate/readme.ts && git diff --exit-code README.md`: PASS.
- `CHROME_PATH=/usr/bin/google-chrome npx tsx scripts/validate/visual-qa.ts`:
  blocked by `tsx` IPC; the equivalent reaches Chrome and fails at Crashpad as
  documented above.
- `qa:github`: no valid `GITHUB_TOKEN`/`GH_TOKEN`; `gh auth status` reports the
  stored GitHub token invalid. The equivalent script attempt therefore fails at
  auth/shell startup, and no GitHub-render PASS is claimed.
- Generated motion search finds CSS motion only in
  `identity-dark.svg`, `identity-light.svg`, `signal-dark.svg` and
  `signal-light.svg`; static variants and the other 16 assets are motion-free.
