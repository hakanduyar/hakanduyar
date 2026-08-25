# GitHub compatibility

- All public visuals are repository-local SVG files; there are no third-party statistic cards, remote images, scripts, or embedded fonts.
- Every SVG has a responsive `viewBox`, an image role, a title, and a description. Fixed root dimensions are removed during optimization.
- The README uses `<picture>` with light and dark assets. Reduced-motion sources appear first so they win when both motion and color preferences match. Systems, architecture, and signal scenes use separate mobile sources at the GitHub-column-aware 1080 px breakpoint.
- The visible README body is image-only: four `<picture>` blocks with no native Markdown headings, paragraphs, lists, badges, separators, or text between them. Descriptive `alt` text remains for accessibility.
- Hero, systems, architecture, and public signal use SVG CSS only. Every scene has a separate fully static asset with no keyframes or animation declarations; lower scenes also have purpose-built mobile animated/static assets.
- The validator rejects scripts, `foreignObject`, image embedding, external resources, fixed dimensions, oversized assets, credentials, the retired polygon/`HDU` identity, missing transition semantics, and missing collision-audit hooks.
- Scene renderers assert protected canvas, text, node, trajectory, and layer zones before assets are emitted. Tests cover all six desktop/mobile geometry specifications; browser evidence then checks rendered SVG text and path geometry at 890 px and 390 px in both themes.
- Browser collision evidence carries a digest of every generated SVG. CI rejects stale evidence, missing required widths, frame coverage below the V4.2 threshold, or any recorded overlap, geometry hit, or out-of-bounds text.
- Generated outputs are deterministic from committed source and `data/telemetry.json`; network access is limited to the explicit telemetry refresh command.
