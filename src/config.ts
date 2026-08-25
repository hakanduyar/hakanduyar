export const LOGIN = 'hakanduyar';

export interface FeaturedSystem {
  key: 'dropspot' | 'spark' | 'stock' | 'motion';
  repo: string;
  code: string;
  role: string;
  summary: string;
  signal: string;
  stack: readonly string[];
}

export const FEATURED_SYSTEMS: readonly FeaturedSystem[] = [
  {
    key: 'dropspot',
    repo: 'dropspot-project',
    code: 'D-01',
    role: 'DISTRIBUTION',
    summary: 'Limited-stock distribution with fair, idempotent claim handling.',
    signal: 'Transactions protect concurrent claims.',
    stack: ['React', 'Node.js', 'PostgreSQL'],
  },
  {
    key: 'spark',
    repo: 'spark',
    code: 'S-02',
    role: 'LOCAL-FIRST',
    summary: 'Offline planning that runs without an account or backend.',
    signal: 'IndexedDB keeps the product useful offline.',
    stack: ['React', 'TypeScript', 'Dexie'],
  },
  {
    key: 'stock',
    repo: 'stock-management-system',
    code: 'O-03',
    role: 'OPERATIONS',
    summary: 'Role-aware inventory across the stock movement lifecycle.',
    signal: 'Movement records preserve operational history.',
    stack: ['Next.js', 'NestJS', 'Prisma'],
  },
  {
    key: 'motion',
    repo: 'Hunnes-Academy-motion-system',
    code: 'M-04',
    role: 'MOTION',
    summary: 'Composable motion modules behind one declarative system.',
    signal: 'Route scope activates only the motion a page needs.',
    stack: ['JavaScript', 'GSAP', 'ES Modules'],
  },
] as const;

export const CHANNELS = [
  { label: 'GitHub', detail: '@hakanduyar', href: 'https://github.com/hakanduyar' },
  { label: 'LinkedIn', detail: 'in/hakanduyar', href: 'https://www.linkedin.com/in/hakanduyar' },
  { label: 'Medium', detail: '@hakanduyar', href: 'https://medium.com/@hakanduyar' },
  { label: 'Email', detail: 'iamhakanduyar@gmail.com', href: 'mailto:iamhakanduyar@gmail.com' },
] as const;

export const PROFILE_COPY = {
  strapline: 'Front-end and systems engineering. TypeScript, React, Node.',
  introduction:
    'I build product interfaces and the systems behind them, with particular attention to state, data integrity, performance, and accessibility.',
  architecture:
    'The work moves from interface decisions through state and services into delivery. AI-assisted development supports the process; engineering judgment remains accountable.',
  provenance:
    'Every visual is generated from source in this repository. No third-party statistics or remote image services are used.',
} as const;
