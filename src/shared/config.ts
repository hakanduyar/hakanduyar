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
   *
   * Too long for the plate at the 26u floor; it is the asset's `<desc>` and the
   * README's alt text, which is where a reader who cannot see the plate gets it.
   */
  headline: string;
  /**
   * The plate's first content line: what the system *is*, as a noun phrase.
   * Max 30 characters. Without it the plate led with an implementation detail
   * and never said what the repository was — the reader learned that
   * dropspot-project does idempotent claim handling without learning it is a
   * drop platform.
   */
  subject: string;
  /** Stack labels, curated — not every dependency in the lockfile. */
  stack: string[];
  /**
   * The plate's second content line: the one engineering fact that
   * distinguishes this system. Max 25 characters — the renderer throws beyond
   * that. States what is implemented, never how good it is.
   *
   * It must add to `subject` rather than reword it. "Local-first planning
   * system" over "Local-first, no backend" spent two of the plate's four lines
   * saying one thing.
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
    subject: 'Limited-stock drop platform',
    stack: ['Node.js', 'Express', 'PostgreSQL', 'React'],
    plateLine: 'Idempotent claim handling',
  },
  {
    key: 'motion-system',
    repo: 'Hunnes-Academy-motion-system',
    headline: 'A reusable motion layer, built as one system behind a declarative configuration.',
    subject: 'Reusable motion layer',
    stack: ['JavaScript', 'GSAP', 'ES Modules'],
    plateLine: 'Nine modules, one config',
  },
  {
    key: 'stock',
    repo: 'stock-management-system',
    headline: 'Role-aware inventory system covering the full stock movement lifecycle.',
    subject: 'Role-aware inventory system',
    stack: ['NestJS', 'Next.js', 'PostgreSQL', 'Prisma'],
    plateLine: 'JWT over a Prisma schema',
  },
  {
    key: 'spark',
    repo: 'spark',
    headline: 'Local-first planning system that works with no backend and no network.',
    subject: 'Local-first planning system',
    stack: ['React', 'TypeScript', 'Vite', 'Dexie'],
    plateLine: 'IndexedDB via Dexie',
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
