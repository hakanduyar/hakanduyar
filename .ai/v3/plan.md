# V3 implementation delta

Animate only `identity` and `signal`. `focus`, all four `system-*` plates, and
`channels` stay static: they carry the page's capability, repository, and
navigation text, so motion there would add scan cost without adding meaning.
The system plates will still gain a static observation rail—using the existing
`x=40.75` index rule, branches to `x=56`, and four `r=2` nodes at
`top + [42, 78, 110, 142]`—so the selected repositories read as tracked
entities and relationships even when the page is paused.

## Motion and character

- `renderIdentity` keeps the existing `890 × 254` composition, `Y` baselines
  (`96/134/162/208/234`) and `CELL_X` columns (`40/310/580`) completely
  visible in frame one. Around the wordmark measured by
  `canvas.measureText(t.name, TYPE.display)`, add a thin acquisition bracket
  and a neutral scan line. The bracket draws once over `2.4s`; a low-opacity
  `12u` tracking pulse repeats over `9s`. The name and readouts never fade,
  translate, or depend on the animation.
- `renderSignal` keeps the measured rows and text static: `TRACK_X=280`,
  `TRACK_W=440`, `TRACK_H=8`, `Y.firstRow=108`, `Y.rowPitch=36`, and the
  existing bar widths `TRACK_W * share`. Add one neutral `1.5u` scan cursor
  travelling from `x=280` to `x=720` across the five tracks every `7s`; it is
  an observation pass, not a changing value. The amber primary-language bar
  remains the page's only chromatic element.

This gives the POI character through the system node/trunk geometry, identity
acquisition brackets, and measured signal paths. It gives the JARVIS character
through restrained layered diagnostics, deterministic timing, neutral
instrument rules, and small travelling feedback—no glow, gradients, green,
text motion, or boot-screen reveal. `focus` retains its four-row register and
`channels` retains stable link targets. Animating the four system assets would
require roughly another `149.6 kB` (`146.1 KiB`) of duplicate static fallbacks and breach the
budget; their relationship geometry therefore remains precise but still.

## Rendering and GitHub compatibility

Restore a constrained animation register in `src/shared/canvas.ts`, not the
old free-form variant system: add a `MotionMode` (`'animated' | 'static'`), a
typed `Canvas.registerMotion(...)`, and make `Canvas.build()` emit registered
CSS only for animated mode. Extend `src/shared/svg.ts` so `svgDocument()` can
place the deterministic `<style>` block. Use unguarded CSS `@keyframes` for
the three named effects (`identity-acquire`, `identity-pulse`, `signal-scan`);
do not use SMIL, `transition`, scripts, external references, or any media query
inside an SVG. This follows the measured rule in
`docs/github-platform-constraints.md`: CSS animation runs in SVG-as-`<img>`,
while an in-SVG `prefers-reduced-motion` guard misfires for every viewer.

`src/build.ts` will keep the eight `PANEL_IDS`, but `AssetBuild` and
`expectedAssetPaths()` will emit four files for `identity` and `signal`
(`*-dark.svg`, `*-light.svg`, `*-static-dark.svg`, `*-static-light.svg`) and
the existing two files for every static panel. `renderIdentity` and
`renderSignal` receive the mode and build the same base scene; only the
animated files contain CSS. `src/shared/type.ts`, telemetry, palettes, type
sizes, panel chrome, and the existing renderer measurements remain reused.

Update `scripts/generate/readme.ts` so only the two animated panels use the
four-source ladder, in this exact order: reduced-motion + dark static, reduced
motion light static, dark animated, light animated fallback. Static panels keep
the current one dark source/light fallback. This preserves the three prose
lines and all existing links; no JavaScript enters `README.md`.

## Budget and verification

The current generated total is `301,936` bytes (`294.9 KiB`). Duplicating the
current identity pair (`22,632` bytes) and signal pair (`43,230` bytes) puts the
base at `367,798` bytes before the small CSS and node additions. Target the
measured result below `380 KiB`; `SIZE_LIMITS.totalPayload` remains `400 KiB`
and `sizeBudgetFor()` remains `45 KiB` per file. Every asset keeps its
viewBox-only emitted root, opaque ground, outlined text, `26u` information
floor, and existing contrast/single-chroma rules.

1. Add the typed `Canvas` motion register, mode-aware build paths, SVG style
   emission, and identity/signal motion primitives.
2. Add the static system observation rails, then render the 20 expected assets
   without changing telemetry or content ownership.
3. Update `readme.ts`, `checkPictureSources`, `checkSvg`, `github-render.ts`,
   and the README/scene/check unit tests for the four-source ladder, allowed
   keyframes, 20-file build set, and static-fallback invariants.
4. Replace visual-QA stillness with liveness samples for animated identity and
   signal, pixel-identical checks for their static variants, reduced-motion
   `<picture>` selection, both themes, and the existing 890/360 widths; run
   `npm run render -- --check`, `npm run validate`, `npm test`, and the measured
   payload gate.
