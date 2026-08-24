import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FEATURED_SYSTEMS, LOGIN } from '../src/config.js';
import type { Telemetry } from '../src/telemetry.js';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(REPO_ROOT, 'data/telemetry.json');

function resolveToken(): string {
  const fromEnvironment = process.env['GITHUB_TOKEN'] ?? process.env['GH_TOKEN'];
  if (fromEnvironment) return fromEnvironment;
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', shell: true }).trim();
  } catch {
    throw new Error('No GitHub token is available. Authenticate the GitHub CLI or set GITHUB_TOKEN.');
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

interface RepoNode {
  name: string;
  url: string;
  description: string | null;
  pushedAt: string;
  createdAt: string;
  stargazerCount: number;
  isArchived: boolean;
  primaryLanguage: { name: string } | null;
  languages: { edges: { size: number; node: { name: string } }[] };
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
      'User-Agent': 'hakan-duyar-profile-v4',
    },
    body: JSON.stringify({ query: QUERY, variables: { login: LOGIN, cursor } }),
  });
  if (!response.ok) throw new Error(`GitHub API responded ${response.status} ${response.statusText}`);
  const payload = (await response.json()) as {
    data?: { user: UserPayload | null };
    errors?: { message: string }[];
  };
  if (payload.errors?.length) throw new Error(payload.errors.map((error) => error.message).join('; '));
  const user = payload.data?.user;
  if (!user) throw new Error(`GitHub user ${LOGIN} was not found`);
  return user;
}

async function main(): Promise<void> {
  const token = resolveToken();
  const user = await fetchPage(token, null);
  let pageInfo = user.repositories.pageInfo;
  while (pageInfo.hasNextPage) {
    const next = await fetchPage(token, pageInfo.endCursor);
    user.repositories.nodes.push(...next.repositories.nodes);
    pageInfo = next.repositories.pageInfo;
  }
  if (user.repositories.nodes.length !== user.repositories.totalCount) {
    throw new Error(`Fetched ${user.repositories.nodes.length} of ${user.repositories.totalCount} repositories`);
  }

  const collection = user.contributionsCollection;
  const calendar = collection.contributionCalendar;
  const days = calendar.weeks.flatMap((week) => week.contributionDays);
  let activeDays = 0;
  let peakDay = 0;
  let currentRun = 0;
  let longestActiveRun = 0;
  for (const day of days) {
    peakDay = Math.max(peakDay, day.contributionCount);
    if (day.contributionCount > 0) {
      activeDays += 1;
      currentRun += 1;
      longestActiveRun = Math.max(longestActiveRun, currentRun);
    } else {
      currentRun = 0;
    }
  }

  const completeWeeks = calendar.weeks.filter((week) => week.contributionDays.length === 7).slice(-52);
  const weekly = completeWeeks.map((week) =>
    week.contributionDays.reduce((sum, day) => sum + day.contributionCount, 0),
  );
  const weeklyTotal = weekly.reduce((sum, value) => sum + value, 0);
  const weeklyMax = Math.max(...weekly);
  const lastWeek = completeWeeks.at(-1)?.contributionDays;

  const repositories = user.repositories.nodes.filter((repo) => !repo.isArchived);
  if (!repositories.length) throw new Error('No public, non-fork repositories were returned');

  const languageBytes = new Map<string, number>();
  for (const repo of repositories) {
    for (const edge of repo.languages.edges) {
      languageBytes.set(edge.node.name, (languageBytes.get(edge.node.name) ?? 0) + edge.size);
    }
  }
  const totalSourceBytes = [...languageBytes.values()].reduce((sum, value) => sum + value, 0);
  const languages = [...languageBytes.entries()]
    .map(([name, bytes]) => ({ name, bytes, share: totalSourceBytes ? bytes / totalSourceBytes : 0 }))
    .sort((a, b) => b.bytes - a.bytes);
  const totalCommits = repositories.reduce(
    (sum, repo) => sum + (repo.defaultBranchRef?.target.history.totalCount ?? 0),
    0,
  );

  const byName = new Map(repositories.map((repo) => [repo.name, repo]));
  const featured = FEATURED_SYSTEMS.map((system) => {
    const repo = byName.get(system.repo);
    if (!repo) throw new Error(`Featured repository ${system.repo} is missing from the public set`);
    return {
      key: system.key,
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

  const sortedByPush = [...repositories].sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));
  const mostRecent = sortedByPush[0];
  if (!mostRecent) throw new Error('No recent public push was returned');
  const activityStart = completeWeeks[0]?.contributionDays[0]?.date ?? '';
  const activityEnd = lastWeek?.at(-1)?.date ?? '';

  const telemetry: Telemetry = {
    capturedAt: new Date().toISOString().replace(/:\d{2}\.\d{3}Z$/, ':00Z'),
    login: user.login,
    name: user.name,
    memberSince: user.createdAt.slice(0, 10),
    followers: user.followers.totalCount,
    publicRepos: user.repositories.totalCount,
    countedRepos: repositories.length,
    contributions: {
      windowStart: days[0]?.date ?? '',
      windowEnd: days.at(-1)?.date ?? '',
      total: calendar.totalContributions,
      commits: collection.totalCommitContributions,
      pullRequests: collection.totalPullRequestContributions,
      issues: collection.totalIssueContributions,
      repositoriesCreated: collection.totalRepositoryContributions,
      activeDays,
      longestActiveRun,
      peakDay,
    },
    activity: {
      weekly,
      total: weeklyTotal,
      start: activityStart,
      end: activityEnd,
      max: weeklyMax,
      maxIndex: weekly.indexOf(weeklyMax),
      activeWeeks: weekly.filter((value) => value > 0).length,
    },
    languages,
    totalSourceBytes,
    totalCommits,
    lastPush: { repo: mostRecent.name, at: mostRecent.pushedAt },
    recentPushes: sortedByPush
      .filter((repo) => repo.name !== LOGIN)
      .slice(0, 3)
      .map((repo) => ({ repo: repo.name, at: repo.pushedAt, url: repo.url, description: repo.description })),
    featured,
    methods: {
      publicRepos: `PUBLIC, NON-FORK, OWNED BY @${user.login}`,
      totalCommits: `DEFAULT BRANCHES, ${repositories.length} PUBLIC REPOSITORIES`,
      primaryLanguage: `SHARE OF ${(totalSourceBytes / 1_000_000).toFixed(2)} MB PUBLIC SOURCE`,
      activity: `${weeklyTotal} PUBLIC CONTRIBUTIONS - 52 COMPLETE WEEKS TO ${activityEnd}`,
      lastPush: 'MOST RECENT PUSH TO A PUBLIC REPOSITORY',
      activeSince: `GITHUB ACCOUNT CREATED ${user.createdAt.slice(0, 10)}`,
    },
  };

  if (telemetry.publicRepos < 1 || telemetry.totalCommits < 1) throw new Error('Telemetry sanity floor failed');
  if (telemetry.languages.length < 2) throw new Error('Language distribution is unexpectedly empty');
  if (telemetry.activity.weekly.length !== 52) throw new Error('Expected exactly 52 complete activity weeks');
  if (telemetry.featured.length !== FEATURED_SYSTEMS.length) throw new Error('Featured repository set is incomplete');

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(telemetry, null, 2)}\n`, 'utf8');
  console.log(
    `[data] ${telemetry.publicRepos} public repositories | ${telemetry.contributions.total} contributions | ` +
      `${telemetry.languages.length} languages`,
  );
}

main().catch((error: unknown) => {
  console.error('[data] failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
