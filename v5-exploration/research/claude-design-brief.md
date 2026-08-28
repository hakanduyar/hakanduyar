# Claude Design Review — System Brief Refinement

You are the independent design director and senior frontend engineer refining one selected GitHub-profile design prototype.

## Scope

- Work only inside `v5-exploration/`.
- Preserve the existing six concepts, especially `prototypes/concept-f/index.html`.
- Create the refinement at `prototypes/system-brief-refined/index.html`.
- You may create target-specific assets under `prototypes/system-brief-refined/assets/`.
- Create `research/claude-design-rationale.md` explaining the choices, tradeoffs, and GitHub README feasibility.
- Do not change root `README.md`, live-profile files, V4 artifacts, branches, git history, remotes, or pull requests.
- Do not commit, push, merge, or publish.

## Source material to inspect

- `prototypes/concept-f/index.html` — selected base direction: System Brief.
- `prototypes/concept-d/index.html` — strongest project-case-study narrative.
- `prototypes/concept-e/index.html` — strongest AI assurance/control narrative.
- `prototypes/shared/base.css` and `prototypes/shared/prototype.js`.
- `research/engineering-inventory.md`, `research/critique.md`, `research/finalist-notes.md`, and `FINAL-REPORT.md`.
- `evidence/finalist-1/desktop-dark.png` and the other finalist-1 theme/mobile evidence.

## Design objective

Refine System Brief into a more memorable corporate engineering profile while preserving its restraint and credibility. It should feel like premium architecture documentation and modern developer tooling—not a sci-fi HUD, badge wall, generic developer README, or AI dashboard template.

Use Concept F as the visual chassis, then selectively borrow:

- Concept D's ability to turn real projects into architecture decisions.
- Concept E's governed AI workflow and assurance-loop clarity.

The result must make the primary identity obvious in ten seconds:

**Hakan Duyar — Front-end & Systems Engineering**

Core depth: React, TypeScript, JavaScript, Next.js, frontend/application architecture.

Applied breadth: Node.js, APIs, PostgreSQL, Prisma, local-first systems, Docker, delivery/runtime context.

AI position: agents participate in planning, implementation, deterministic verification, independent review, bounded repair, and human-gated release. The workflow matters more than tool brands.

## Technology-logo direction

The owner expected some larger technology logos. Address this intentionally rather than avoiding logos entirely.

- Use a small number of real, recognizable technology marks as semantic architecture anchors.
- Give **React, TypeScript, Next.js, Node.js, PostgreSQL, and Docker** meaningfully larger visual presence where they explain a layer or capability.
- Let scale communicate hierarchy: the React/TypeScript frontend core may be largest; applied service/data marks medium; platform/expansion marks smaller.
- Keep all secondary libraries and operational tools textual or very small.
- Do not create a row or wall of equal-sized logos.
- Preserve brand recognizability and colors. Monochrome brands such as Next.js may use a theme-appropriate native black/white treatment.
- Prefer locally vendored SVG assets with a documented source. If reputable icon assets cannot be obtained safely, implement crisp, restrained logo tiles with full technology names and document the production replacement requirement. Never invent a fake logo.

## Architecture and content requirements

1. Identity/hero should be restrained and executive, not oversized decoration.
2. Architecture is the hero: show interface → application → services → data → platform with understandable responsibilities and request/evidence flow.
3. Applications are engineering case studies, not generic cards. Their visible order is locked and must not be substituted or rearranged:
   1. **Software Factory** — flagship governed agentic-engineering control plane.
   2. **Spark** — local-first React/TypeScript PWA with Dexie/IndexedDB and human-accepted AI drafts.
   3. **Built in Layers** — architecture-led frontend/content system with typed MDX, publication gates, server-first boundaries, and verification.
   4. **JointLedger** — present two evidenced contributions: the local Docker Compose/PostgreSQL runtime setup on the default branch and an unmerged four-commit shared-family-book backend extension covering book/membership models, services/APIs, owner/editor/viewer permissions, book scoping, and an idempotent personal-book backfill. State the limits plainly: unreleased; no shared-book frontend or selector; invitations are schema/status infrastructure only; transaction reads/writes remain owner-scoped; and the upstream accounting engine and Vue interface are not Hakan's work.

   Do not insert DropSpot or another project into this featured application sequence.
4. AI engineering must show governed workflow, durable state, deterministic evidence, independent review, bounded repair, and human authority.
5. Clearly separate core, applied, platform context, and current expansion.
6. Kubernetes must remain expansion; K9s only Kubernetes operational tooling.
7. No fabricated metrics, fake telemetry, fake terminal output, or unsupported production claims.

## Visual and interaction constraints

- High-quality desktop dark, desktop light, mobile dark, and mobile light.
- Light mode must look like a premium technical document, not a faint inversion.
- Mobile must be recomposed rather than merely shrunk.
- Strong typography, spacing rhythm, geometry, and legibility.
- Motion is optional and must explain a request, evidence, or review path. Avoid constant decorative motion.
- Prototype may use CSS animation and the existing theme-preview JavaScript only.
- Final concept must remain translatable to GitHub-safe Markdown/HTML/SVG with static fallbacks; do not depend on runtime JavaScript or hover-only information.

## Quality bar

Before finishing, self-critique the implementation as a senior product designer, software architect, engineering manager, and technical recruiter. Remove anything childish, theatrical, generic, overly dense, or visually ambiguous. The page should reward both a ten-second scan and a sixty-second technical read.

Implement the complete refined prototype and rationale. Do not merely return prose.
