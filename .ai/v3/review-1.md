VERDICT: FAIL

Reviewed commit `cb8ce04` on `feat/profile-v3-motion-pass` from the repository tree,
the current README, generated SVGs, and the available evidence. The implementation
itself is mostly focused and the offline gates pass, but the delivered review
surface is not clean: authoritative documentation still says the engine is static,
and the visual evidence mixes current V3 captures with stale V1 HUD/liveness files.

A. PASS (narrow) — `identity-dark.svg` and `signal-dark.svg` contain unguarded CSS keyframes on small acquisition/pulse/scan geometry, so the output is not fully static.
B. PASS — the current identity SVG keeps HAKAN DUYAR as the only display-sized text and never animates the name itself.
C. PASS (borderline) — acquisition brackets, moving signal cursor, and observation rails add a restrained technical layer, though the captured resting page still reads primarily as a static dashboard.
D. PASS (minimal) — system plates now have trunks, branches, and nodes, while identity/signal add tracking geometry; the relationships remain mostly static and attached to text rows.
E. PASS (minimal) — the timed bracket, low-opacity pulse, and signal scan provide precise feedback without glow, noise, or a boot-screen treatment.
F. PASS — README is one panel stack with exactly three prose lines outside panels; measured line count is 3.
G. PASS — `data/telemetry.json`, `src/shared/config.ts`, `src/shared/profile.ts`, project selection, and metric ownership are unchanged; the system-rail addition is visual-only.
H. UNVERIFIED — the 890px/360px dark/light captures have no overflow and compose well, and the source ladder is correct, but `qa:github` and a fresh Chrome visual run could not execute in this sandbox, so real GitHub-render proof is absent.
I. PASS — motion is low-amplitude, deterministic, and confined to identity and signal; it does not flash, move text, or alter information.
J. PASS (with scope concern) — the pass stays on two animated panels and remains 371,766 bytes / 363.1 KiB under the 400 KiB cap, but it also changes all four static system plates and expands the validation surface.

## CRITICAL

None.

## MAJOR

- `docs/visual-system.md:88-101`, `docs/architecture.md:19,50,55,74-103`, `docs/github-platform-constraints.md:28-36,68-75`, `docs/maintenance.md:92,102-107`, `src/shared/emit.ts:4-8` still describe V2 as static-only, claim `Canvas` cannot emit keyframes, claim the validator rejects animation, say the README has plain two-source pairs, and/or say the build emits 16 assets. Those statements are now false against the current 20-file build and the actual animated SVGs. Rewrite the motion/asset-count/QA sections for V3, retaining the measured warning that reduced-motion queries must stay outside SVGs.

- `scripts/validate/visual-qa.ts:110-135` captures before/after `<img>` frames but only writes them on failure, while `scripts/validate/visual-qa.ts:18-22` reuses the ignored evidence directory without clearing or versioning old files. `.ai/evidence/visual/hero-dark-t0_6s.png`, `hero-light-t0_6s.png`, and `liveness-later.png` visibly show the forbidden V1 “ENGINEERING RECORD”/HUD sequence, not the current `identity-dark.svg`; they make the delivered evidence internally contradictory. Save labeled current before/after frames on successful liveness, and clean or namespace stale evidence before capture.

## MINOR

- `src/shared/emit.ts:34-42` retains V2-era precision/payload commentary (“same content” at 412 KB/295 KB and panel-02 justification) even though the current generated set is 371,766 bytes across 20 assets. Replace the historical figures with a measured V3 statement or move the comparison to a changelog.

- `scripts/validate/github-render.ts:21-24` falls back to `gh auth token` through `shell: true`; in this environment it failed with `spawnSync /bin/sh EPERM`, and direct network access was also unavailable. Keep the existing `GITHUB_TOKEN` path, but make the failure report explicitly distinguish “no credentials/network” from a renderer assertion so a review cannot mistake an absent result for a pass.

## Direct checks

- `npx tsc --noEmit`: PASS.
- `npx vitest run`: PASS, 5 files / 77 tests.
- Literal `npx tsx` render and visual commands: blocked by the sandbox’s `tsx` IPC pipe (`listen EPERM`). Equivalent `node --import tsx` runs passed render drift (`20 assets`), offline validation (`0 errors, 0 warnings`), README generation, and `git diff --exit-code README.md`.
- `CHROME_PATH=/usr/bin/google-chrome node --import tsx scripts/validate/visual-qa.ts`: blocked before capture by Chrome 149 Crashpad (`setsockopt: Operation not permitted`).
- `node --import tsx scripts/validate/github-render.ts`: no result; `gh` has no authenticated token and network probing is blocked.
- Generated payload is 371,766 bytes / 363.1 KiB, below 409,600 bytes. `rg` finds zero `prefers-reduced-motion` queries in generated SVGs. The README’s identity and signal ladders put static reduced-motion sources before animated/theme sources, which is correct first-match-wins ordering.
- `assets/generated/identity-dark.svg:1` contains `identity-acquire` and `identity-pulse`; `assets/generated/signal-dark.svg:1` contains `signal-scan`. Static variants contain no motion CSS.
- No unused changed exports or dead motion registration paths were found under the passing `noUnusedLocals` typecheck; the principal stale material is documentation and evidence hygiene.
