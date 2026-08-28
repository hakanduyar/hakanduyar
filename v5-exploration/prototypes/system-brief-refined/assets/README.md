# Vendored technology marks

Six real technology marks are vendored here as local SVG files. They are the only brand
marks the refined System Brief uses, and each one anchors a specific architecture layer.

## Provenance

| File | Slug | Source | Brand colour | Mark owner |
|---|---|---|---|---|
| `react.svg` | `react` | Simple Icons | `#61DAFB` | Meta Platforms, Inc. |
| `typescript.svg` | `typescript` | Simple Icons | `#3178C6` | Microsoft Corporation |
| `nextjs.svg` | `nextdotjs` | Simple Icons | `#000000` (monochrome) | Vercel, Inc. |
| `nodejs.svg` | `nodedotjs` | Simple Icons | `#5FA04E` | OpenJS Foundation |
| `postgresql.svg` | `postgresql` | Simple Icons | `#4169E1` | PostgreSQL Community Association of Canada |
| `docker.svg` | `docker` | Simple Icons | `#2496ED` | Docker, Inc. |

- Upstream project: <https://github.com/simple-icons/simple-icons>
- Icon file licence: **CC0-1.0**.
- CC0-1.0 text, section 4(a): *"No trademark or patent rights held by Affirmer are waived,
  abandoned, surrendered, licensed or otherwise affected by this document."* The names and
  marks above remain the property of their respective owners. They are used here as
  comprehension aids inside an architecture diagram — not as endorsement, affiliation, or
  certification claims.

Path geometry is copied verbatim from upstream. Nothing has been redrawn, traced, or
approximated. No mark on this page is invented.

## Theme handling

Five marks carry their own brand fill. `nextjs.svg` is left as `currentColor` because the
Next.js mark is monochrome: it renders `#000000` on light surfaces and `#FFFFFF` on dark
surfaces. That is the brand's own native inversion, not a recolour.

No other mark is recoloured, tinted, outlined, or altered. Where a mark needs more presence
against the page, the surrounding plate is tinted instead of the mark itself.

## How the prototype consumes them

`index.html` inlines the identical path geometry as an SVG `<symbol>` sprite so that a single
CSS custom property can drive the Next.js light/dark inversion and so the page renders from
`file://` with no additional requests.

These standalone files are the production source of truth. When the profile README is built,
the generated SVG panels should embed these files directly rather than re-deriving them, and
must not reference a third-party CDN.

## Marks deliberately not used

Every other technology on the page is textual. Adding marks for supporting libraries,
operational tools, or expansion areas would flatten the hierarchy into the badge wall this
direction exists to avoid.
