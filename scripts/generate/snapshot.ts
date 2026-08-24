/**
 * Telemetry snapshot.
 *
 * Pulls real numbers from the GitHub GraphQL API into `data/telemetry.json`.
 * Renderers never call the network: they read the committed snapshot, so a
 * build is reproducible and a rendered asset can always be traced back to the
 * exact data that produced it.
 *
 * Auth resolution order:
 *   1. $GITHUB_TOKEN   (GitHub Actions)
 *   2. `gh auth token` (local developer machine)
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOGIN, FEATURED_REPOS } from '../../src/shared/config.js';
import type { Telemetry } from '../../src/shared/telemetry-types.js';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(REPO_ROOT, 'data/telemetry.json');

function resolveToken(): string {
  const fromEnv = process.env['GITHUB_TOKEN'] ?? process.env['GH_TOKEN'];
  if (fromEnv) return fromEnv;
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', shell: true }).trim();
  } catch {
    throw new Error(
      'No GitHub token available. Set GITHUB_TOKEN or authenticate the gh CLI (`gh auth login`).',
    );
  }
}

const QUERY = `
query($login: String!, $cursor: String) {
  user(login: $login) {
    login
    name
    createdAt
    followers { totalCount }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalRepositoryContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount weekday } }
      }
    }
    repositories(first: 100, after: $cursor, privacy: PUBLIC, isFork: false, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        name
        url
        description
        pushedAt
        createdAt
        stargazerCount
        isArchived
        primaryLanguage { name }
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name } }
        }
        defaultBranchRef { target { ... on Commit { history(first: 0) { totalCount } } } }
      }
    }
  }
}`;

interface LangEdge {
  size: number;
  node: { name: string };
}

interface RepoNode {
  name: string;
  url: string;
  description: string | null;
  pushedAt: string;
  createdAt: string;
  stargazerCount: number;
  isArchived: boolean;
  primaryLanguage: { name: string } | null;
  languages: { edges: LangEdge[] };
  defaultBranchRef: { target: { history: { totalCount: number } } } | null;
}

interface UserPayload {
  login: string;
  name: string;
  createdAt: string;
  followers: { totalCount: number };
  contributionsCollection: {
    totalCommitContributions: number;
    totalPullRequestContributions: number;
    totalIssueContributions: number;
    totalRepositoryContributions: number;
    contributionCalendar: {
      totalContributions: number;
      weeks: { contributionDays: { date: string; contributionCount: number; weekday: number }[] }[];
    };
  };
  repositories: {
    totalCount: number;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: RepoNode[];
  };
}

async function fetchPage(token: string, cursor: string | null): Promise<UserPayload> {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'hdu-profile-system',
    },
    body: JSON.stringify({ query: QUERY, variables: { login: LOGIN, cursor } }),
  });
  if (!response.ok) {
    throw new Error(`GitHub API responded ${response.status} ${response.statusText}`);
  }
  const payload = (await response.json()) as {
    data?: { user: UserPayload | null };
    errors?: { message: string }[];
  };
  if (payload.errors?.length) {
    throw new Error(`GitHub API errors: ${payload.errors.map((e) => e.message).join('; ')}`);
  }
  const user = payload.data?.user;
  if (!user) throw new Error(`User ${LOGIN} not found`);
  return user;
}

async function main(): Promise<void> {
  const token = resolveToken();

  // First page carries everything; further pages only add repository nodes.
  const user = await fetchPage(token, null);
  let pageInfo = user.repositories.pageInfo;
  while (pageInfo.hasNextPage) {
    const next = await fetchPage(token, pageInfo.endCursor);
    user.repositories.nodes.push(...next.repositories.nodes);
    pageInfo = next.repositories.pageInfo;
  }
  if (user.repositories.nodes.length !== user.repositories.totalCount) {
    throw new Error(
      `Pagination bug: fetched ${user.repositories.nodes.length} repositories but totalCount is ` +
        `${user.repositories.totalCount} - refusing to publish inconsistent numbers`,
    );
  }

  const cc = user.contributionsCollection;
  const cal = cc.contributionCalendar;

  // Flatten the calendar so active days / longest run / peak all come from the
  // same real day series the visualisation draws.
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  let activeDays = 0;
  let peakDay = 0;
  let run = 0;
  let longestActiveRun = 0;
  for (const day of days) {
    if (day.contributionCount > 0) {
      activeDays++;
      run++;
      if (run > longestActiveRun) longestActiveRun = run;
    } else {
      run = 0;
    }
    if (day.contributionCount > peakDay) peakDay = day.contributionCount;
  }

  // GitHub pads the first and last calendar week with partial data. Drop any
  // incomplete week so every rendered column represents the same span of time,
  // then keep the most recent 52 so the axis label "12 months" is literally true.
  const completeWeeks = cal.weeks.filter((w) => w.contributionDays.length === 7);
  const recentWeeks = completeWeeks.slice(-52);
  const weekly = recentWeeks.map((w) => w.contributionDays.reduce((sum, d) => sum + d.contributionCount, 0));
  // The sum of the 52 complete weeks, slightly below GitHub's trailing-365-day
  // figure because the partial current week is excluded. The signal panel
  // states this number alongside the window it covers, so the two always agree;
  // quoting the larger figure against a 52-week window would not.
  const weeklyTotal = weekly.reduce((a, b) => a + b, 0);
  const activityMax = weekly.reduce((a, b) => Math.max(a, b), 0);
  const activityMaxIndex = weekly.indexOf(activityMax);
  const activityStart = recentWeeks[0]?.contributionDays[0]?.date ?? '';
  const lastWeek = recentWeeks[recentWeeks.length - 1]?.contributionDays;
  const activityEnd = lastWeek?.[lastWeek.length - 1]?.date ?? '';

  const repos = user.repositories.nodes.filter((r) => !r.isArchived);
  const [firstRepo] = repos;
  if (!firstRepo) throw new Error('No public non-fork repositories returned');

  // Aggregate language bytes across every public non-fork repository.
  const langBytes = new Map<string, number>();
  for (const repo of repos) {
    for (const edge of repo.languages.edges) {
      langBytes.set(edge.node.name, (langBytes.get(edge.node.name) ?? 0) + edge.size);
    }
  }
  const totalBytes = [...langBytes.values()].reduce((a, b) => a + b, 0);
  const totalCommits = repos.reduce((sum, r) => sum + (r.defaultBranchRef?.target.history.totalCount ?? 0), 0);
  const languages = [...langBytes.entries()]
    .map(([name, bytes]) => ({ name, bytes, share: totalBytes ? bytes / totalBytes : 0 }))
    .sort((a, b) => b.bytes - a.bytes);

  const byName = new Map(repos.map((r) => [r.name, r]));
  const featured = FEATURED_REPOS.map((entry) => {
    const repo = byName.get(entry.repo);
    if (!repo) {
      throw new Error(
        `Featured repository "${entry.repo}" is not in the public non-fork set - ` +
          'it was renamed, archived or made private. Update src/shared/config.ts.',
      );
    }
    return {
      key: entry.key,
      name: repo.name,
      url: repo.url,
      description: repo.description,
      language: repo.primaryLanguage?.name ?? null,
      commits: repo.defaultBranchRef?.target.history.totalCount ?? 0,
      stars: repo.stargazerCount,
      pushedAt: repo.pushedAt,
      createdAt: repo.createdAt,
    };
  });

  const mostRecent = repos.reduce((best, r) => (r.pushedAt > best.pushedAt ? r : best), firstRepo);
  const firstDay = days[0]?.date ?? '';
  const lastDay = days[days.length - 1]?.date ?? '';

  const telemetry: Telemetry = {
    capturedAt: new Date().toISOString().replace(/:\d{2}\.\d{3}Z$/, ':00Z'),
    login: user.login,
    name: user.name,
    memberSince: user.createdAt.slice(0, 10),
    followers: user.followers.totalCount,
    publicRepos: user.repositories.totalCount,
    countedRepos: repos.length,
    contributions: {
      windowStart: firstDay,
      windowEnd: lastDay,
      total: cal.totalContributions,
      commits: cc.totalCommitContributions,
      pullRequests: cc.totalPullRequestContributions,
      issues: cc.totalIssueContributions,
      repositoriesCreated: cc.totalRepositoryContributions,
      activeDays,
      longestActiveRun,
      peakDay,
    },
    activity: {
      weekly,
      total: weeklyTotal,
      start: activityStart,
      end: activityEnd,
      max: activityMax,
      maxIndex: activityMaxIndex,
      activeWeeks: weekly.filter((w) => w > 0).length,
    },
    languages,
    totalSourceBytes: totalBytes,
    totalCommits,
    lastPush: { repo: mostRecent.name, at: mostRecent.pushedAt },
    featured,
    methods: {
      publicRepos: `PUBLIC, NON-FORK, OWNED BY @${user.login}`,
      totalCommits: `DEFAULT BRANCHES, ${repos.length} PUBLIC REPOSITORIES`,
      primaryLanguage: `SHARE OF ${(totalBytes / 1_000_000).toFixed(2)} MB PUBLIC SOURCE`,
      activity: `${weeklyTotal} PUBLIC CONTRIBUTIONS - 52 WEEKS TO ${activityEnd}`,
      lastPush: 'MOST RECENT PUSH TO A PUBLIC REPOSITORY',
      activeSince: `GITHUB ACCOUNT CREATED ${user.createdAt.slice(0, 10)}`,
    },
  };

  // Sanity floor: an API hiccup that zeroes the profile must fail loudly
  // here, not ship a plausible-looking empty instrument. The refresh workflow
  // relies on this throw to abort before its commit step.
  if (telemetry.publicRepos < 1) throw new Error('Sanity: zero public repositories');
  if (telemetry.totalCommits < 1) throw new Error('Sanity: zero commits on default branches');
  if (telemetry.languages.length < 2) throw new Error('Sanity: language distribution collapsed');
  if (telemetry.activity.weekly.length !== 52) {
    throw new Error(`Sanity: expected 52 weekly buckets, got ${telemetry.activity.weekly.length}`);
  }
  if (telemetry.featured.length !== FEATURED_REPOS.length) {
    throw new Error('Sanity: featured repository set incomplete');
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(telemetry, null, 2) + '\n', 'utf8');
  console.log(
    `[snapshot] wrote ${OUT}\n` +
      `           ${telemetry.publicRepos} public repos | ${telemetry.contributions.total} contributions | ` +
      `${telemetry.contributions.activeDays} active days | ${telemetry.languages.length} languages`,
  );
}

main().catch((error: unknown) => {
  console.error('[snapshot] FAILED:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
