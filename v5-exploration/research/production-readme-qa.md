# HDU Profile V5 — Production README QA

## Production composition

- First visible scene: engineering identity and weighted technology anchors.
- Native disclosure immediately after the first scene: `Show more`.
- Expanded order: responsibility architecture, Software Factory, Spark, Built in Layers, JointLedger, governed AI workflow, capability calibration.
- Project scenes link directly to their repositories.
- No visible Markdown prose interrupts the image composition.

## GitHub-safe implementation

- Desktop light and dark assets are selected with GitHub-supported `<picture>` and `prefers-color-scheme` sources.
- GitHub strips viewport logic from any source that also contains a color-scheme condition. The production markup therefore keeps conditions separate: mobile always selects the high-contrast dark mobile composition; desktop follows GitHub theme.
- Motion is delivered as animated GIF rather than relying on SVG animation support.
- `prefers-reduced-motion: reduce` selects static dark SVG equivalents before any GIF source, without mixing that condition with a color-scheme query.
- All public assets are repository-local; there are no remote image dependencies.
- SVGs contain no script, `foreignObject`, external resource, or animation declarations.

## Verification result

- Generated assets: 44.
- Total generated V5 payload: 520,444 bytes.
- TypeScript: passed.
- Unit tests: 9 passed.
- XML, asset budget, README structure, accessibility, project order, theme and motion validation: passed.
- GitHub official Markdown render API and live-profile DOM are both checked. Theme-only sources remain theme-aware; viewport and reduced-motion sources keep their original conditions.
- Browser QA: desktop dark, desktop light, mobile dark, mobile light, animated motion, reduced motion, closed disclosure, and expanded disclosure passed.
- Mobile preview measured no horizontal overflow: document 1265/1265, shell 430/430, README composition 398/398.
- Expanded visual narrative is approximately 56% shorter on desktop and 57% shorter on mobile than the first V5 production pass.

## Motion semantics

- Architecture: a request travels interface → application → services → data → platform; evidence returns to release authority.
- AI workflow: active responsibility advances through specify → plan → approve → implement → verify → independent review → bounded repair → human release.
- Reduced motion: both scenes render as stable, complete SVG documents.
