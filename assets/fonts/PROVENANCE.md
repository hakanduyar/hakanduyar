# Vendored fonts

| File | Family | Weight | Source | Version | Licence |
|---|---|---|---|---|---|
| `JetBrainsMono-400.woff2` | JetBrains Mono | 400 | npm `@fontsource/jetbrains-mono` | 5.3.0 | SIL OFL 1.1 |
| `JetBrainsMono-500.woff2` | JetBrains Mono | 500 | npm `@fontsource/jetbrains-mono` | 5.3.0 | SIL OFL 1.1 |
| `JetBrainsMono-700.woff2` | JetBrains Mono | 700 | npm `@fontsource/jetbrains-mono` | 5.3.0 | SIL OFL 1.1 |
| `JetBrainsMono-800.woff2` | JetBrains Mono | 800 | npm `@fontsource/jetbrains-mono` | 5.3.0 | SIL OFL 1.1 |

Licence text: [LICENSE-JetBrainsMono.txt](LICENSE-JetBrainsMono.txt) (copied from the same package release).

JetBrains Mono is released under the SIL Open Font License 1.1, which explicitly permits
embedding: "The fonts and derivatives... may be included in Software... provided the Font
Software is not sold by itself." Converting glyphs to outlines at build time is a permitted
derivative use, and the licence text ships alongside the binaries in this directory.

These files are committed rather than read from `node_modules` so that a build is reproducible
from the repository alone, and so that the licence travels with the binaries.
