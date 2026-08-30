# Logo mark sources & license strategy

## Source

Every technology mark in `v7/assets/logos/*.svg` (and the path data in
`v7/src/logos.ts`) is vendored from the [simple-icons](https://github.com/simple-icons/simple-icons)
npm package (see `package.json` for the pinned version) by running:

```
node --require ./scripts/node-runtime.cjs --import tsx v7/scripts/vendor-logos.ts
```

The vendoring step is the **only** place that touches the icon package.
Generation (`npm run v7:build`) and the published assets read exclusively
from these repository-local files — no external runtime URL, no CDN, no
`<image>` embed. Marks are inlined as single `<path>` elements.

## Licenses

- The simple-icons set is released under **CC0-1.0**; icons without an
  explicit upstream license entry fall under that release.
- Icons that carry an explicit upstream license keep it, recorded in each
  file's header comment and in `v7/src/logos.ts`:
  - **Apache** — Apache-2.0
  - **Debian** — CC-BY-SA-3.0
- All marks remain **trademarks of their respective projects**. They are
  used here nominatively — to identify the technologies actually used —
  which is the use the respective brand guidelines permit. No endorsement
  is implied; the proof's footer states this.

## Color strategy

Brand colors come from simple-icons' canonical hex values. Per-mode
adjustments (documented in `v7/src/theme.ts` `logoFill`) are applied only
where the canonical color fails contrast on the V7.1 paper/charcoal
grounds (e.g. React cyan on light paper, Debian red on dark charcoal).
Tux (Linux) renders in monochrome ink, its canonical black-and-white form.

## Exclusions

- **Vue** (JointLedger's inherited upstream UI) is deliberately not
  displayed as a technology: the icon is CC-BY-NC-SA-4.0 licensed and the
  inherited UI is not claimed work, so the boundary text describes it
  without a mark.
- **Dexie/IndexedDB** has no canonical mark; Spark's storage is described
  in text only.
