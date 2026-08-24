# V3 implementation

Implemented the accepted V3 delta:

- Restored a typed `MotionMode`/`Canvas.registerMotion` register with deterministic CSS emission for the three controlled effects: `identity-acquire`, `identity-pulse`, and `signal-scan`.
- Added animated identity and signal variants, static reduced-motion fallbacks, the four-source README ladders, and the static system observation rails.
- Updated the 20-file build contract, validators, GitHub-render checks, tests, browser helpers, and visual-QA assertions. Content, ownership, telemetry, and the three-line README budget remain unchanged.

Final generated payload: **371,766 bytes / 363.05 KiB**, below `SIZE_LIMITS.totalPayload` (409,600 bytes).

Clean gates:

- `npx tsc --noEmit`
- `npx vitest run` — 5 files, 77 tests passed
- render drift check — 20 assets match source
- offline validation — 20 assets, 0 errors, 0 warnings
- README generation is deterministic on rerun
- `git diff --check`

The requested `npx tsx` commands could not start in this sandbox because the tsx IPC pipe fails with `EPERM`; equivalent `node --import tsx` commands passed for rendering, validation, and README generation. The literal `git diff --exit-code README.md` reports the intentional V3 README delta (two reduced-motion sources in each animated picture), while a subsequent generator rerun is stable. Visual QA was implemented but could not launch `/usr/bin/google-chrome`: Chrome 149 exits before startup with `crashpad ... setsockopt: Operation not permitted` under the sandbox. No implementation deviation was made to weaken or skip that gate.
