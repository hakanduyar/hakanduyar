/**
 * Curated public copy.
 *
 * Everything here is a human editorial decision; everything measured lives in
 * `data/telemetry.json`. The split matters: a number must never be typed into
 * this file, and a sentence must never be generated from the API. The content
 * lint enforces the first half of that rule.
 *
 * Language: professional English throughout, including anything that ends up
 * inside a generated graphic.
 */

export interface CapabilityModule {
  /** Shown inside the core-modules strip. */
  name: string;
  /** One Markdown sentence beneath the strip. States what was built, not how good it is. */
  summary: string;
  /** Repository key (from config.FEATURED_REPOS) that evidences this capability. */
  evidence: string;
}

export const PROFILE = {
  /** The plate's discipline line. Uppercased at render time. */
  discipline: 'INTERFACE AND SYSTEMS ENGINEERING',

  /** Bold line directly under the hero — the first thing search and screen readers get. */
  strapline: 'Hakan Duyar — front-end and systems engineer. TypeScript, React, Node.',

  /**
   * Two paragraphs. No location, employer, job title or years-of-experience
   * figure: all four are empty on the GitHub profile, so asserting them would
   * be fabrication.
   */
  identity: [
    'I build interfaces in TypeScript and React, and the services behind them when a project needs one. ' +
      'My public repositories are whole applications rather than exercises — a limited-stock drop platform ' +
      'with idempotent claim handling, a role-aware inventory service, a local-first planning app that runs ' +
      'with no backend at all.',
    'The parts I care about are the ones that decide whether software survives real use: data integrity under ' +
      'concurrency, honest state management, performance, and accessibility treated as correctness rather than ' +
      'as a later pass.',
  ],

  modules: [
    {
      name: 'INTERFACE',
      summary:
        'Component architecture, routing and form/state handling in React, Next.js and TypeScript, ' +
        'built against real backends rather than mock data.',
      evidence: 'stock',
    },
    {
      name: 'SYSTEMS',
      summary:
        'Server-side design where correctness is the hard part: transactional writes, idempotency keys, ' +
        'priority-scored queues and role-based access control.',
      evidence: 'dropspot',
    },
    {
      name: 'DATA',
      summary:
        'Client-side persistence and offline behaviour — IndexedDB schemas, local-first sync boundaries, ' +
        'and deciding what genuinely needs a server.',
      evidence: 'spark',
    },
    {
      name: 'MOTION',
      summary:
        'Animation as a system: composable modules behind one configuration, scoped per route and shipped ' +
        'as a single bundle.',
      evidence: 'motion-system',
    },
  ] satisfies CapabilityModule[],

  /**
   * Opinions, labelled as opinions. One line each, no motivational register.
   */
  principles: [
    'Understand a system before automating it.',
    'Performance is a feature, and it is cheapest to add first.',
    'Accessibility is correctness, not decoration.',
    'Prefer fewer moving parts over clever ones.',
    'A tool can write the code; the engineer still owns the decision.',
  ],

  /**
   * One sentence about private work. No repository names, no counts, no
   * metrics — anything more would be unverifiable by the reader.
   */
  privateWork:
    'Some current work is in private repositories, so the public activity below understates recent output.',

  /** Rendered as the final line of the README, replacing any sign-off. */
  provenanceNote:
    'Every image on this page is generated from source in this repository. Nothing is fetched from a third-party service.',
} as const;
