/**
 * The shape of `data/telemetry.json`.
 *
 * Written by `scripts/generate/snapshot.ts`, consumed by every renderer.
 * Kept in its own module so renderers can import the type without pulling the
 * snapshot script (and its network code) into their dependency graph.
 */

export interface LanguageShare {
  name: string;
  bytes: number;
  /** 0..1 share of total bytes across all public non-fork repositories. */
  share: number;
}

export interface FeaturedRepo {
  /** Stable key from src/shared/config.ts — survives a repository rename. */
  key: string;
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  commits: number;
  stars: number;
  pushedAt: string;
  createdAt: string;
}

export interface Telemetry {
  /** ISO-8601 UTC timestamp, truncated to the minute. */
  capturedAt: string;
  login: string;
  name: string;
  memberSince: string;
  followers: number;
  publicRepos: number;
  /**
   * Non-archived repositories the commit and language sums were computed
   * over. Equal to publicRepos while nothing is archived; quoted in the
   * Commits method cell so the two can never silently diverge.
   */
  countedRepos: number;
  contributions: {
    windowStart: string;
    windowEnd: string;
    total: number;
    commits: number;
    pullRequests: number;
    issues: number;
    repositoriesCreated: number;
    /** Days in the trailing year with at least one contribution. */
    activeDays: number;
    /** Longest run of consecutive contributing days. */
    longestActiveRun: number;
    /** Highest single-day contribution count. */
    peakDay: number;
  };
  /**
   * Exactly 52 complete weekly totals, oldest first.
   *
   * A 53x7 daily grid is deliberately not produced. With 135 contributions
   * across 365 days, roughly 340 cells would be empty: the graphic would say
   * "nothing happened here" far louder than it said anything else, and it is
   * the single most template-recognisable image on GitHub. Weekly aggregation
   * over the same real data has legible variation and no invented values.
   */
  activity: {
    /** 52 weekly contribution totals, oldest first. */
    weekly: number[];
    /** Sum of the 52 plotted weeks. Slightly below the trailing-365-day figure
     *  because the partial current week is excluded; the caption quotes this. */
    total: number;
    /** ISO date of the Sunday starting the first complete week. */
    start: string;
    /** ISO date of the Saturday ending the last complete week. */
    end: string;
    /** Highest single-week total; the y-axis is scaled to exactly this. */
    max: number;
    /** Index of that week, so the renderer can mark it. */
    maxIndex: number;
    /** Weeks with at least one contribution. Public activity here is burst-shaped. */
    activeWeeks: number;
  };
  languages: LanguageShare[];
  /** Sum of `languages[].bytes` — the denominator every share is quoted against. */
  totalSourceBytes: number;
  /** Commits on the default branch, summed across every counted repository. */
  totalCommits: number;
  lastPush: { repo: string; at: string };
  featured: FeaturedRepo[];
  /**
   * Human-readable measurement method for each headline figure.
   *
   * v1 drew these beside the values. v2 does not: the panels state what they
   * counted in their own labels, and a method column was a large part of what
   * made the page read as an audit sheet. They are kept in the snapshot because
   * they are the recorded provenance of each figure — the answer to "counted
   * how?" for anyone reading the data rather than the page.
   */
  methods: Record<'publicRepos' | 'totalCommits' | 'primaryLanguage' | 'activity' | 'lastPush' | 'activeSince', string>;
}
