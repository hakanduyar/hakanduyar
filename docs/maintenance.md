# Maintenance

## Normal editing

Edit copy and project definitions in `src/config.ts`; edit renderers in `src/scenes/`. Then run:

```sh
npm install
npm run check
```

`npm run check` type-checks the source, regenerates assets and README, validates compatibility and accessibility, builds the local preview, and runs tests.

Motion or geometry changes also require a fresh browser frame audit in `.ai/evidence/visual/v4.2/collision-audit.json`. The audit includes a digest of the generated SVG set; `npm run evidence:validate` and the full check reject stale visual evidence.

## Refreshing public telemetry

Telemetry is deliberately not refreshed during a normal build. With an authenticated GitHub CLI or `GITHUB_TOKEN`, run:

```sh
npm run data:refresh
npm run check
```

Review `data/telemetry.json` and the rendered preview before committing. The snapshot records its capture time and measurement methods. No scheduled workflow silently rewrites the public profile.

## Publishing boundary

Feature-branch and pull-request work may be pushed for review. Merging into `main` is a separate owner action because the profile repository publishes `main` directly to GitHub.
