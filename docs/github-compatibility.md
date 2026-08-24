# GitHub compatibility

- All public visuals are repository-local SVG files; there are no third-party statistic cards, remote images, scripts, or embedded fonts.
- Every SVG has a responsive `viewBox`, an image role, a title, and a description. Fixed root dimensions are removed during optimization.
- The README uses `<picture>` with light and dark assets. Reduced-motion sources appear first so they win when both motion and color preferences match.
- The animated hero uses SVG CSS only. The reduced-motion path is a separate fully static asset with no keyframes or animation declarations.
- The validator rejects scripts, `foreignObject`, image embedding, external resources, fixed dimensions, oversized assets, credentials, and the retired polygon/`HDU` identity.
- Generated outputs are deterministic from committed source and `data/telemetry.json`; network access is limited to the explicit telemetry refresh command.
