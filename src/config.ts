export const LOGIN = 'hakanduyar';

export interface FeaturedSystem {
  key: 'factory' | 'spark' | 'layers' | 'ledger';
  repo: string;
  label: string;
  code: string;
  role: string;
  summary: string;
  signal: string;
  stack: readonly string[];
}

export const FEATURED_SYSTEMS: readonly FeaturedSystem[] = [
  {
    key: 'factory',
    repo: 'software-factory',
    label: 'Software Factory',
    code: 'F-01',
    role: 'ORCHESTRATION',
    summary: 'Evidence-gated orchestration from planning through verified release.',
    signal: 'Trusted identities and release snapshots prevent proof bypasses.',
    stack: ['TypeScript', 'Node.js', 'SQLite'],
  },
  {
    key: 'spark',
    repo: 'spark',
    label: 'spark',
    code: 'S-02',
    role: 'LOCAL-FIRST',
    summary: 'Offline planning that runs without an account or backend.',
    signal: 'IndexedDB keeps the product useful offline.',
    stack: ['React', 'TypeScript', 'Dexie'],
  },
  {
    key: 'layers',
    repo: 'built-in-layers',
    label: 'Built in Layers',
    code: 'L-03',
    role: 'CASE STUDIES',
    summary: 'Engineering case studies reveal interface, flow, and system decisions.',
    signal: 'Surface, Flow, and System expose the work beneath the screen.',
    stack: ['Next.js', 'TypeScript', 'MDX'],
  },
  {
    key: 'ledger',
    repo: 'jointledger',
    label: 'jointledger',
    code: 'J-04',
    role: 'FINANCE',
    summary: 'Self-hosted personal finance with private, portable financial records.',
    signal: 'Multi-currency ledgers stay searchable, analyzable, and self-controlled.',
    stack: ['Go', 'Vue', 'TypeScript'],
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
