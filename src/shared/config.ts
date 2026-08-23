/**
 * Build-time configuration for the HDU profile system.
 *
 * This file holds the few values that are *decisions* rather than data:
 * whose profile is being built, and which repositories are promoted into
 * Selected systems. Everything else is measured from the GitHub API.
 */

export const LOGIN = 'hakanduyar';

export interface FeaturedRepoConfig {
  /** Stable identifier used in the snapshot and by the renderers. */
  key: string;
  /** Actual repository name under the `LOGIN` account. */
  repo: string;
  /**
   * One-line English positioning statement. The GitHub description is often
   * empty or non-English, so the profile states what the system *is* in its
   * own words — never inventing capability the repository does not have.
   */
  headline: string;
  /** 2-4 concrete engineering facts. Each must be verifiable from the source. */
  signals: string[];
  /** Stack labels, curated — not every dependency in the lockfile. */
  stack: string[];
  /**
   * The one line printed on the system plate. Max 27 characters: beyond that
   * it collides with the right-aligned meta column, and the renderer throws.
   * States what is implemented, never how good it is.
   */
  plateLine: string;
}

/**
 * Ordered by engineering signal, not recency. Tutorial, bootcamp and
 * scaffold-generated repositories are deliberately excluded: they exist in the
 * account and are not hidden, they are simply not what the profile leads with.
 */
export const FEATURED_REPOS: FeaturedRepoConfig[] = [
  {
    key: 'dropspot',
    repo: 'dropspot-project',
    headline: 'Limited-stock drop platform with fair, idempotent claim distribution.',
    signals: [
      'Priority-scored waitlist decides who converts when stock is scarce',
      'Idempotent claim operations and ACID transactions keep concurrent buyers consistent',
      'Documented data model, API surface and seed generation',
    ],
    stack: ['Node.js', 'Express', 'PostgreSQL', 'React'],
    plateLine: 'Idempotent claim handling',
  },
  {
    key: 'motion-system',
    repo: 'Hunnes-Academy-motion-system',
    headline: 'A reusable motion layer built as one system, not a pile of one-off animations.',
    signals: [
      'Nine motion modules over a shared base, behind one declarative config',
      'Page-scoped router activates only the motions a route needs',
      'Ships as a single built bundle for drop-in use',
    ],
    stack: ['JavaScript', 'GSAP', 'ES Modules'],
    plateLine: 'Composable motion modules',
  },
  {
    key: 'stock',
    repo: 'stock-management-system',
    headline: 'Role-aware inventory system covering the full stock movement lifecycle.',
    signals: [
      'Three-role access model: admin, storekeeper, employee',
      'JWT authentication over a Prisma/PostgreSQL schema',
      'Stock-in / stock-out movements tracked as first-class records',
    ],
    stack: ['NestJS', 'Next.js', 'PostgreSQL', 'Prisma'],
    plateLine: 'Role-based access control',
  },
  {
    key: 'spark',
    repo: 'spark',
    headline: 'Local-first planning system that works with no backend and no network.',
    signals: [
      'All state lives in IndexedDB via Dexie — no server, no account',
      'Installable offline PWA built mobile-first',
      'Optional AI layer is additive, never required to use the app',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Dexie'],
    plateLine: 'Local-first, no backend',
  },
];

/**
 * Verified public contact channels, in the order the brief fixes
 * (GitHub, LinkedIn, Medium, Email). `display` carries the correct brand
 * casing - deriving it from the uppercase label produced "Linkedin".
 */
export const CHANNELS = [
  { label: 'GITHUB', display: 'GitHub', detail: `@${LOGIN}`, href: `https://github.com/${LOGIN}` },
  { label: 'LINKEDIN', display: 'LinkedIn', detail: 'in/hakanduyar', href: 'https://www.linkedin.com/in/hakanduyar' },
  { label: 'MEDIUM', display: 'Medium', detail: '@hakanduyar', href: 'https://medium.com/@hakanduyar' },
  { label: 'EMAIL', display: 'Email', detail: 'iamhakanduyar@gmail.com', href: 'mailto:iamhakanduyar@gmail.com' },
] as const;
