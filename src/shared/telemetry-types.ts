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
   * 52-53 columns of 7 days, oldest week first, Sunday first within a column.
   * `-1` marks a padded cell that falls outside the reporting window.
   */
  calendar: { start: string; end: string; weeks: number[][] };
  languages: LanguageShare[];
  lastPush: { repo: string; at: string };
  featured: FeaturedRepo[];
}
