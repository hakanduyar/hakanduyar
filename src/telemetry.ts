export interface LanguageShare {
  name: string;
  bytes: number;
  share: number;
}
export interface FeaturedRepoTelemetry {
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
  capturedAt: string;
  login: string;
  name: string;
  memberSince: string;
  followers: number;
  publicRepos: number;
  countedRepos: number;
  contributions: {
    windowStart: string;
    windowEnd: string;
    total: number;
    commits: number;
    pullRequests: number;
    issues: number;
    repositoriesCreated: number;
    activeDays: number;
    longestActiveRun: number;
    peakDay: number;
  };
  activity: {
    weekly: number[];
    total: number;
    start: string;
    end: string;
    max: number;
    maxIndex: number;
    activeWeeks: number;
  };
  languages: LanguageShare[];
  totalSourceBytes: number;
  totalCommits: number;
  lastPush: { repo: string; at: string };
  recentPushes: { repo: string; at: string; url: string; description: string | null }[];
  featured: FeaturedRepoTelemetry[];
  methods: Record<'publicRepos' | 'totalCommits' | 'primaryLanguage' | 'activity' | 'lastPush' | 'activeSince', string>;
}
