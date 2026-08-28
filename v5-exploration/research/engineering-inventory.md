# V5 Engineering Inventory

This inventory is a positioning model, not a claim that every named technology is expert-level. It is based on the public repositories, local manifests, architecture documents, and the profile telemetry snapshot inspected for this exploration.

## Primary positioning

**Hakan Duyar — Front-end & Systems Engineering**

React and TypeScript remain the strongest public identity. The differentiator is the ability to connect product interfaces to application state, service boundaries, persistence, delivery, and structured AI-assisted engineering workflows.

## Taxonomy

### Core

- React
- TypeScript
- JavaScript
- frontend engineering and accessible product interfaces
- component and application architecture
- state and data integration

Evidence: TypeScript is the largest public source language in the committed profile telemetry; `spark`, `built-in-layers`, `stock-management-system`, `goal-compass-daily`, and other public applications use React/TypeScript. `Built in Layers` adds typed MDX, publication gates, server-first boundaries, and Playwright/axe evidence.

### Applied

- Next.js
- Node.js, Express.js, NestJS
- REST APIs, JWT, role-aware access boundaries
- PostgreSQL, Prisma, Supabase
- PWA, IndexedDB, Dexie
- Redux Toolkit / Zustand / TanStack Query / React Hook Form / React Router
- CSS, Sass/SCSS, Tailwind CSS, Bootstrap, Material UI
- GSAP and route-aware motion systems

Evidence highlights: `DropSpot` proves React → Express → PostgreSQL with transactional/idempotent claim handling; `spark` proves a versioned Dexie/IndexedDB local-first application; `stock-management-system` proves a narrower role-guarded stock path using Next/Nest/Prisma/PostgreSQL; public/local manifests show repeated use of state, form, query, styling, and motion tools.

### Ecosystem / working familiarity

- GraphQL and WebSocket integration concepts
- MongoDB / Mongoose and Firebase
- Redis, Elasticsearch, Kafka
- Ant Design, Chakra UI, shadcn/ui
- Apache
- Vercel, Netlify, DigitalOcean
- GitLab and GitLab CI/CD

These belong in supporting architecture context only unless a finalist has a specific evidenced reason to show them. They must not compete visually with React, TypeScript, Node, or PostgreSQL.

### Platform tooling

- Git and GitHub
- GitHub Actions
- Docker and Docker Compose
- Nginx
- Linux / Ubuntu / Ubuntu Server / Debian
- K9s only as Kubernetes operational tooling

This is systems and delivery awareness, not a claim of owning a hyperscale production platform.

### Current expansion

- Kubernetes and orchestration
- Ansible
- Grafana and observability
- n8n and broader workflow integration
- broader model routing and local/open-model experimentation

The profile should state or visually encode that these areas are expanding rather than established core expertise.

## Strongest public architecture cases

### Software Factory — AI control plane

Truthful architecture:

`Approved intent → durable plan revision → deterministic DAG validation → human plan approval → work items → scoped implementation worker → fixed-command verification → independent reviewer → bounded repair loop → content-addressed evidence snapshot → human release gate`

Supporting rails: TypeScript, SQLite persistence, provider-neutral worker ports, Codex/Claude CLI adapters, durable planner, resource/backoff supervisor, zero autonomous spending policy.

Do not claim GitHub issue/PR automation, n8n orchestration, server deployment, publishing, or a completed control-room UI.

### spark — local-first frontend application

Truthful architecture:

`React feature surfaces ↔ Dexie live queries → versioned IndexedDB`

Parallel paths: service-worker shell caching; transactional export/import recovery; optional AI drafts that require human acceptance before persistence.

Do not claim a backend, login, cloud sync, or an automated test suite.

### DropSpot — transactional service/data flow

Truthful architecture:

`React/Vite → Axios/JWT → Express routes/controllers → PostgreSQL`

Critical claim path:

`BEGIN → existing-claim lock → drop-row lock → validate window/stock → insert claim + decrement stock + remove waitlist → COMMIT`

Do not claim WebSockets/streaming. Its workflow file is not under `.github/workflows`, so do not claim active GitHub Actions CI.

### Built in Layers — supporting frontend architecture proof

Truthful architecture:

`Typed MDX → Gray Matter/Zod → publication gates → Server Components/SSG → progressive enhancement → Playwright/axe verification`

This is strong evidence for architecture-led frontend delivery, but should not dominate because a portfolio inside a profile can become self-referential.

### Stock Management — reserve case only

Truthful narrow path:

`Next.js → Axios/JWT → NestJS → role-guarded stock endpoints → Prisma transaction → Product + StockMovement → PostgreSQL`

Do not call the system comprehensively RBAC-secure: caller-selected registration roles and a commented product RolesGuard make broader claims inaccurate.

## Explicit exclusions

- `jointledger` has two distinct, evidenced contributions: the default branch carries Hakan's local Docker Compose/PostgreSQL runtime setup, while the unmerged `feature/shared-family-book` branch carries four Hakan-authored backend commits covering book and membership models, services/APIs, owner/editor/viewer permission checks, book scoping, and an idempotent personal-book backfill. Present it as an unreleased backend extension plus runtime integration—not as a finished shared-finance product. The upstream accounting engine and Vue interface are not Hakan's work; there is no shared-book frontend or working invitation flow, and transaction reads/writes remain on the original owner-scoped path.
- Vue and Go remain historical/public-language context and should not become identity technologies.
- K9s never appears as a peer of Kubernetes, Docker, or React.
- Technology presence in history is not sufficient for core-expertise positioning.
