# V3 Review 3

VERDICT: PASS

This is a narrow follow-up to `.ai/v3/review-2.md`, which passed commit
`ce3417f` with only the two listed non-blocking MINOR findings. The review
scope here is limited to whether `5ec9ed0` resolved those findings without
opening any out-of-scope design or contract changes.

## 1. Commit scope

`git show 5ec9ed0 --stat` reports:

```text
5ec9ed0 (HEAD -> feat/profile-v3-motion-pass) fix(hdu): resolve round-2 review - two non-blocking minors
 .ai/v3/review-2.md                | 120 ++++++++++++++++++++++++++++++++++++++
 scripts/validate/github-render.ts |  22 ++++++-
 src/shared/emit.ts                |  18 +++---
 3 files changed, 151 insertions(+), 9 deletions(-)
```

The only implementation files changed are `src/shared/emit.ts` and
`scripts/validate/github-render.ts`. The third changed path is review
documentation, `.ai/v3/review-2.md`. No motion-design, geometry, content,
test, or build-contract file was touched. The commit body also describes the
two requested fixes; its additional GitHub API/session note is documentation,
not an additional source change.

## 2. `src/shared/emit.ts` comment

PASS. The stale statement that “v2 ships no animation” is gone. The comment
now accurately describes v2's static period and v3's constrained motion
register for two panels, and points to `canvas.ts` for the register. The old
V2-specific `412 KB at two decimals` and `295 KB at one` figures are gone;
the precision note now refers to the current 20-asset v3 set and tells the
reader to re-run rendering rather than preserving stale byte figures.

## 3. `scripts/validate/github-render.ts` token/error handling

PASS. The `gh auth token` fallback now calls `execFileSync('gh', ['auth',
'token'], { encoding: 'utf8' })` with no `shell: true`, so the command uses a
literal argv and does not invoke a shell.

`token()` converts a failed fallback lookup into `NoCredentialError`. The
top-level handler reports that case as `[qa:github] SKIPPED (no credentials)`
with setup guidance, while renderer assertions continue through the generic
`[qa:github] FAILED:` path. Missing credentials and a real assertion failure
are therefore distinguishable in the output.

## 4. Required checks

- `npx tsc --noEmit`: PASS, exit 0.
- `npx vitest run`: PASS, 5 test files and 77 tests passed.
- `npx tsx scripts/render/render-all.ts --check`: blocked by the sandbox's
  `tsx` IPC pipe (`listen EPERM: /tmp/tsx-1000/15.pipe`). Equivalent
  `node --import tsx scripts/render/render-all.ts --check`: PASS, all 20
  assets match their source.
- `npx tsx scripts/validate/validate-all.ts`: blocked by the same sandbox
  `tsx` IPC-pipe restriction. Equivalent `node --import tsx
  scripts/validate/validate-all.ts`: PASS, 20 assets (363.1 KB), 172 manifest
  strings, 0 errors, and 0 warnings.

The working tree was clean after the checks, before this review file was
written.
