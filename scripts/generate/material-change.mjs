/**
 * Decide whether a freshly written data/telemetry.json differs *materially*
 * from the committed one.
 *
 * "Material" means: something the account owner did changed — a push, a new
 * repository, new commits, a language shift, a featured-repo change. Fields
 * that move purely because the clock moved (the capture timestamp, the
 * trailing-window boundaries, and the week buckets that slide with them) are
 * excluded: a week in which nothing happened must produce no commit, or the
 * history becomes a metronome. Known, accepted exception: contributions that
 * touch no owned public default branch (issues/PRs elsewhere, non-default
 * branches) change only the excluded activity fields, so the strip refreshes
 * with the next owned push rather than immediately. Documented in
 * docs/maintenance.md.
 *
 * Exit codes (the workflow branches on these — keep them distinct):
 *   0 = material change            -> rebuild and commit
 *   3 = no material change         -> skip the commit
 *   4 = suspicious collapse        -> FAIL the job; a metric fell to zero or
 *       by more than half, which is the signature of a degraded API response
 *       (most likely: the Actions token returning an empty contribution
 *       calendar), not of normal account activity. Legitimate large swings
 *       (repositories changing visibility) are released by re-running the
 *       workflow with the allow_metric_drop input (ALLOW_METRIC_DROP=1).
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

  const committedFull = JSON.parse(committedRaw);
  const currentFull = JSON.parse(readFileSync('data/telemetry.json', 'utf8'));
  const committed = materialView(committedFull);
  const current = materialView(currentFull);

  // Collapse guard (T-010): a zeroed-but-well-formed API response must never
  // be committed unattended. Checked against the committed snapshot before
  // the change verdict, so a collapse coinciding with a real push still fails.
  if (process.env.ALLOW_METRIC_DROP !== '1') {
    const gauges = [
      ['publicRepos', committedFull.publicRepos, currentFull.publicRepos],
      ['totalCommits', committedFull.totalCommits, currentFull.totalCommits],
      ['totalSourceBytes', committedFull.totalSourceBytes, currentFull.totalSourceBytes],
      ['contributions.total', committedFull.contributions.total, currentFull.contributions.total],
    ];
    for (const [name, before, after] of gauges) {
      const collapsed = before > 0 && (after === 0 || after < before * 0.5);
      if (collapsed) {
        console.error(
          `[material-change] SUSPICIOUS COLLAPSE: ${name} fell ${before} -> ${after}. ` +
            'Refusing to publish; if the account really changed this much, re-run with allow_metric_drop.',
        );
        process.exit(4);
      }
    }
  }

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
