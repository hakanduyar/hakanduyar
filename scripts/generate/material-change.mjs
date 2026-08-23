/**
 * Decide whether a freshly written data/telemetry.json differs *materially*
 * from the committed one.
 *
 * "Material" means: something the account owner did changed — a push, a new
 * repository, new commits, a language shift, a featured-repo change. Fields
 * that move purely because the clock moved (the capture timestamp, the
 * trailing-window boundaries, and the week buckets that slide with them) are
 * excluded: a week in which nothing happened must produce no commit, or the
 * history becomes a metronome. Owner-driven changes always also touch one of
 * the whitelisted fields, so nothing real can slip through the exclusion.
 *
 * Exit codes (the workflow branches on these — keep them distinct):
 *   0 = material change            -> rebuild and commit
 *   3 = no material change         -> skip the commit
 *   1 = error (bad file, bad git)  -> FAIL the job; never treat as "no change"
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/** The owner-driven fields. Everything else is derived from them or the clock. */
function materialView(snapshot) {
  return {
    login: snapshot.login,
    name: snapshot.name,
    memberSince: snapshot.memberSince,
    publicRepos: snapshot.publicRepos,
    totalCommits: snapshot.totalCommits,
    totalSourceBytes: snapshot.totalSourceBytes,
    languages: snapshot.languages,
    lastPush: snapshot.lastPush,
    recentPushes: snapshot.recentPushes,
    featured: snapshot.featured,
  };
}

try {
  let committedRaw;
  try {
    committedRaw = execFileSync('git', ['show', 'HEAD:data/telemetry.json'], { encoding: 'utf8' });
  } catch {
    console.log('[material-change] no committed telemetry.json - treating as changed');
    process.exit(0);
  }

  const committed = materialView(JSON.parse(committedRaw));
  const current = materialView(JSON.parse(readFileSync('data/telemetry.json', 'utf8')));

  if (JSON.stringify(committed) !== JSON.stringify(current)) {
    console.log('[material-change] material change detected');
    process.exit(0);
  }
  console.log('[material-change] no owner-driven change - skipping the commit');
  process.exit(3);
} catch (error) {
  console.error('[material-change] ERROR:', error instanceof Error ? error.message : error);
  process.exit(1);
}
