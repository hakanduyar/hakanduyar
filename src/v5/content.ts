export const V5_PROFILE = {
  name: 'Hakan Duyar',
  role: 'Front-end & Systems Engineering',
  statement: 'I build product interfaces and the systems behind them.',
  principle: 'AI participates in the workflow. Release authority remains human.',
  github: 'https://github.com/hakanduyar',
  linkedin: 'https://www.linkedin.com/in/hakanduyar',
} as const;

export interface V5Project {
  key: 'factory' | 'spark' | 'layers' | 'ledger';
  index: string;
  name: string;
  repo: string;
  kind: string;
  claim: string;
  description: string;
  occupied: readonly number[];
  span: string;
  path: readonly { title: string; detail: string }[];
  notes: readonly { key: string; title: string; detail: string }[];
  boundary: string;
}

export const V5_PROJECTS: readonly V5Project[] = [
  {
    key: 'factory',
    index: '01',
    name: 'Software Factory',
    repo: 'https://github.com/hakanduyar/software-factory',
    kind: 'Governed agentic engineering · control plane',
    claim: 'Agents can produce work. They cannot grant it authority.',
    description: 'A durable control plane keeps planning, execution, verification, review, and release as separate responsibilities.',
    occupied: [1, 2, 3, 4],
    span: 'Application → platform · no product interface claimed',
    path: [
      { title: 'Durable domain · SQLite', detail: 'Plans · revisions · work items · runs · evidence · reviews · approvals · release lineage' },
      { title: 'Provider-neutral ports', detail: 'The domain does not know which vendor answers' },
      { title: 'Disposable workers', detail: 'Codex CLI · Claude Code CLI · workspace-scoped adapters' },
    ],
    notes: [
      { key: 'Durability', title: 'Workers are disposable.', detail: 'The domain above them is not.' },
      { key: 'Fail closed', title: 'Verdicts parse strictly.', detail: 'Ambiguous output never becomes a pass.' },
      { key: 'Supervision', title: 'Zero autonomous spend.', detail: 'Resource and backoff policy persist.' },
    ],
    boundary: 'Not claimed: GitHub issue/PR automation, n8n orchestration, deployment, publishing, or a completed control-room UI.',
  },
  {
    key: 'spark',
    index: '02',
    name: 'Spark',
    repo: 'https://github.com/hakanduyar/spark',
    kind: 'Local-first React PWA · client persistence',
    claim: 'It keeps working with no account, no server, and no network.',
    description: 'A React and TypeScript planning application where the browser is the database.',
    occupied: [0, 1, 3],
    span: 'Interface → data · no server',
    path: [
      { title: 'React surfaces', detail: 'Feature views and transactional actions' },
      { title: 'Dexie live queries', detail: 'Reactive reads over compound indexes' },
      { title: 'IndexedDB', detail: 'Versioned persistence · schema v1 → v8' },
    ],
    notes: [
      { key: 'Persistence', title: 'IndexedDB is product state.', detail: 'It is not treated as a cache.' },
      { key: 'Recovery', title: 'Export/import is transactional.', detail: 'The service worker keeps the shell available.' },
      { key: 'AI boundary', title: 'Drafts are proposals.', detail: 'A person accepts before persistence.' },
    ],
    boundary: 'Not claimed: backend, login, cloud sync, or an automated test suite.',
  },
  {
    key: 'layers',
    index: '03',
    name: 'Built in Layers',
    repo: 'https://github.com/hakanduyar/built-in-layers',
    kind: 'Architecture-led frontend · content system',
    claim: 'Content cannot publish itself past its own contract.',
    description: 'A typed content pipeline where accessibility is delivery evidence rather than an assertion.',
    occupied: [0, 1, 3, 4],
    span: 'Interface → platform · content is the data layer',
    path: [
      { title: 'Typed MDX', detail: 'Gray Matter and Zod validate frontmatter' },
      { title: 'Publication gates', detail: 'Invalid content fails the build' },
      { title: 'Server-first render', detail: 'RSC and SSG, then progressive enhancement' },
    ],
    notes: [
      { key: 'Contract', title: 'Frontmatter is a schema.', detail: 'A broken document stops the build.' },
      { key: 'Boundary', title: 'Server-first by default.', detail: 'Interactivity earns its cost.' },
      { key: 'Evidence', title: 'Playwright and axe run.', detail: 'Accessibility stays checkable.' },
    ],
    boundary: 'Scope: architecture proof, not the subject of the profile.',
  },
  {
    key: 'ledger',
    index: '04',
    name: 'JointLedger',
    repo: 'https://github.com/hakanduyar/jointledger',
    kind: 'Upstream backend extension · runtime integration',
    claim: 'A shared ledger is a permissions problem before it is a screen.',
    description: 'Two evidenced contributions to an upstream accounting application: a Docker/PostgreSQL runtime and an unreleased shared-book backend extension.',
    occupied: [2, 3, 4],
    span: 'Services → platform · no frontend claimed',
    path: [
      { title: 'Book domain', detail: 'Book · BookMember · BookInvitation' },
      { title: 'Services and APIs', detail: 'Owner · editor · viewer permission checks' },
      { title: 'Book scoping', detail: 'Accounts · categories · tags resolved per book' },
    ],
    notes: [
      { key: 'Migration', title: 'Backfill is idempotent.', detail: 'A second run creates no duplicate.' },
      { key: 'Runtime', title: 'Compose + PostgreSQL.', detail: 'Persistent volume and verified local environment.' },
      { key: 'Status', title: 'Four commits ahead.', detail: 'Feature branch; unmerged and unreleased.' },
    ],
    boundary: 'Inherited, not authored: upstream engine and Vue UI. No shared-book frontend, selector, or completed invitation flow.',
  },
] as const;

export const CAPABILITY_TIERS = [
  {
    key: 'Core · established',
    title: 'Front-end & application architecture',
    list: 'React · TypeScript · JavaScript · Next.js · component architecture · state and data integration · accessible product interfaces',
    mark: 'Primary identity',
  },
  {
    key: 'Applied · public evidence',
    title: 'Services, persistence & local-first data',
    list: 'Node.js · Express · NestJS · REST · JWT / role-aware access · PostgreSQL · Prisma · Supabase · PWA · IndexedDB / Dexie · modern state, query and form systems',
    mark: 'Shown in the cases above',
  },
  {
    key: 'Platform · working awareness',
    title: 'Delivery & runtime',
    list: 'Git · GitHub · GitHub Actions · GitLab CI/CD · Docker · Compose · Nginx · Linux · Vercel · Netlify',
    mark: 'Not a production-platform ownership claim',
  },
  {
    key: 'Expansion · in progress',
    title: 'Orchestration & observability',
    list: 'Kubernetes · Ansible · Grafana · n8n · model routing · local/open-model experimentation',
    mark: 'K9s appears only as Kubernetes tooling',
  },
] as const;
