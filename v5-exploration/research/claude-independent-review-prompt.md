# Independent design review and refinement

You are an independent senior product designer, frontend engineer, and technical recruiter reviewing a GitHub profile design authored in an earlier Claude session.

Use the official frontend-design skill. Do not defend the existing work automatically. First inspect and critique it, then apply only changes that materially improve the design.

## Files in scope

- Review and edit: `v5-exploration/prototypes/system-brief-refined/index.html`
- Review and, only if needed, edit: `v5-exploration/research/claude-design-rationale.md`
- Create the review report: `v5-exploration/research/claude-independent-review.md`

Do not edit any other file. Do not use Bash. Do not commit, stage, push, merge, publish, replace the root README, touch main, V4, or PR #6. This remains a browser prototype, not a production GitHub README.

## Locked decisions

- Exact application order: Software Factory → Spark → Built in Layers → JointLedger.
- Software Factory remains the flagship.
- Preserve the six-logo semantic hierarchy: React and TypeScript largest; Next.js medium; Node.js and PostgreSQL smaller; Docker smallest.
- Do not add logos, make every logo large, or create a badge wall.
- Preserve the corporate, architecture-first, restrained visual direction. No sci-fi, HUD, neon, cyberpunk, or decorative topology.
- Preserve meaningful request/evidence motion and the reduced-motion fallback.
- Preserve every evidence boundary and negative claim. Do not inflate expertise or authorship.

## Required review targets

1. Reduce visible prose density by roughly 15–20%, prioritizing JointLedger, without removing evidence or ownership/unfinished-work boundaries.
2. Improve the smallest monospace annotation readability and contrast for GitHub's approximately 880px profile width. Current floor is 8px, with extensive 9px metadata. Raise the floor where appropriate without flattening hierarchy.
3. Review composition at 1440px desktop, approximately 880px GitHub content width, and 390px mobile. Mobile must be recomposed, not merely shrunk.
4. Keep the preview-only ALL / DARK / LIGHT controls as a prototype harness if useful, but document that production must use a GitHub-safe `<picture>` / theme-media strategy rather than visible controls.
5. Preserve the strong React/TypeScript identity and ensure a recruiter understands it within ten seconds.
6. Keep AI framed as governed engineering participation, not tool fandom. Human release authority remains explicit.

## Claims that must survive editing

- Software Factory: durable SQLite domain versus disposable provider-neutral workers; strict/fail-closed reviewer parsing; persisted resource/backoff policy; engine proof only, not completed GitHub/PR automation, n8n, server deployment, publishing, or control-room UI.
- Spark: React/TypeScript local-first PWA; IndexedDB schema evolution; transactional JSON restore; AI drafts require human acceptance; no backend, login, cloud sync, or automated test suite.
- Built in Layers: typed MDX with validation/publication gates; server-first and accessible delivery; Playwright/axe evidence; architecture proof, not the portfolio as subject.
- JointLedger: two evidenced contributions to an upstream application: Docker/PostgreSQL runtime setup on default branch and an unmerged four-commit shared-ledger backend extension. Preserve Book/BookMember/BookInvitation, roles, per-book scoping, deterministic idempotent backfill, unmerged/unreleased status, upstream ownership boundary, no shared-book frontend/selector, invitation schema/status only, and owner-scoped transaction reads/writes.
- AI: “Agents participate. The system keeps authority.” “Model confidence is not system evidence.” Zero autonomous release authority.

## Baseline

- Software Factory card: 198 words.
- Spark card: 137 words.
- Built in Layers card: 153 words.
- JointLedger card: 248 words.
- Logo sizes: desktop 164/118/96/76px; mobile 118/92/78/66px.
- Exact order is currently correct.

## Deliverable

Write `claude-independent-review.md` with:

- review verdict;
- concrete issues found;
- changes applied and why;
- what you intentionally did not change;
- GitHub implementation notes;
- remaining risks.

Then make the scoped prototype/rationale edits. Finish by reporting exact files changed and a concise summary. Do not claim browser QA; Codex will render and verify afterward.
