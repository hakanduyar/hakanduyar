export const meta = {
  name: 'hdu-independent-review',
  description: 'Adversarial multi-dimension review of the HDU profile system with per-finding verification',
  phases: [
    { title: 'Review', detail: 'six isolated reviewers, one lens each' },
    { title: 'Verify', detail: 'two adversarial refuters per major finding' },
  ],
}

const REPO = 'C:\\GitHub\\hakanduyar'

const COMMON = `
You are an INDEPENDENT REVIEW AUTHORITY examining a GitHub profile system that an implementation
team claims is finished. You were not involved in building it. Your job is to find what is wrong,
not to confirm what is right. A PASS verdict must be earned: assume defects exist until your own
inspection fails to find any.

Repository under review (work here, absolute paths): ${REPO}

Binding specification documents (read the ones relevant to your lens FIRST — the work is judged
against these, not against your general taste):
- ${REPO}\\.ai\\project\\02-audit.md   (rulings: asset strategy, telemetry bans, naming, repository selection)
- ${REPO}\\.ai\\project\\03-design-brief.md   (binding design spec: rules, palettes, type scale, motion, lexicon)
- ${REPO}\\.ai\\project\\00-context.md and 01-link-verification.md   (verified facts)
- ${REPO}\\docs\\github-platform-constraints.md   (measured platform behaviour; deviations from the brief are legitimate ONLY where this file documents a measured constraint)

Ground rules:
- READ-ONLY: do not modify, create or delete any file; do not run git commands that change state.
- You MAY run read-only commands from the repo root, e.g.:
  cd ${REPO} && npm test | npm run validate | npm run render -- --check | npx tsc --noEmit
- Evidence screenshots live in ${REPO}\\.ai\\evidence\\visual\\ — you can open .png files with the Read tool.
- Cite every finding with a file path (and line where applicable). A finding without a location is noise.
- Severity: critical = would embarrass the owner in front of the audience the profile targets, or breaks on GitHub;
  major = a reviewer at a top product company would flag it; minor = polish.
- Do NOT report style preferences that the binding spec does not support.
- Do NOT assume something fails: check it. Do NOT assume something works: check it.
- Where the implementation deviates from the design brief, check .ai/tickets/STATUS.md "Deviations" and
  docs/github-platform-constraints.md — a documented, measured deviation is compliant; an undocumented one is a finding.
`

const FINDINGS_SCHEMA = {
  type: 'object',
  required: ['verdict', 'findings', 'summary'],
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'FAIL'] },
    summary: { type: 'string', description: 'Three to six sentences: what you inspected, what you ran, overall judgement' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'title', 'location', 'detail', 'recommendation'],
        properties: {
          severity: { type: 'string', enum: ['critical', 'major', 'minor'] },
          title: { type: 'string' },
          location: { type: 'string', description: 'file path, plus line or asset name' },
          detail: { type: 'string', description: 'what is wrong and how you verified it is wrong' },
          recommendation: { type: 'string' },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['refuted', 'reasoning'],
  properties: {
    refuted: { type: 'boolean', description: 'true if the finding is wrong, unverifiable, or not a real defect' },
    reasoning: { type: 'string' },
  },
}

const DIMENSIONS = [
  {
    key: 'visual-design',
    prompt: `${COMMON}
YOUR LENS: visual design quality. You are a senior product designer reviewing rendered output, not code.

Open and study the PNG evidence in ${REPO}\\.ai\\evidence\\visual\\ :
- asset-*.png (every asset, both themes)
- hero-dark-t*.png and hero-light-t*.png (the entrance timeline at exact offsets)
- page-{dark,light}-{desktop,mobile}.png (the assembled page at 890px and 390px)

Judge against .ai/project/03-design-brief.md: composition, alignment to the stated grid, typographic
hierarchy, spacing rhythm, restraint (RULE 1: every mark encodes a fact or structure), the
dark theme as emitted-light vs the light theme as ink-on-paper (NOT an inversion), exactly one
amber element per asset, and the review checklist in section 10 of the brief.
Also judge the thing the brief cannot enumerate: does this look like a motion-designed, engineered
instrument, or like a template? Would a recruiter think "engineered as a product" or "downloaded a theme"?
Check the entrance timeline frames for: elements popping without easing, half-states that look broken,
the resting state being a finished composition on its own.
Check mobile captures for: text that becomes unreadable, elements that collide, hierarchy that collapses.`,
  },
  {
    key: 'github-compat',
    prompt: `${COMMON}
YOUR LENS: GitHub platform compatibility and build integrity.

Inspect README.md mechanically: every <picture> block (source order — reduced-motion sources MUST
precede colour-scheme sources; first match wins), every src/srcset path resolves to a committed file,
alt text present everywhere, no HTML GitHub's sanitiser strips (verify claims against
docs/github-platform-constraints.md), image widths, link targets.
Run and interpret (from ${REPO}):
- npm run validate
- npm run render -- --check   (asset drift gate)
- npx tsc --noEmit
- npm test
- npm run qa:github   (renders the real README through GitHub's POST /markdown)
Inspect .github/workflows/*.yml line by line: permissions, trigger cadence, whether the refresh job
can loop or spam commits, whether failure leaves the repo broken, whether the commit step can race,
whether anything needs a secret that does not exist. Inspect scripts/generate/material-change.mjs for
correctness of the skip logic. Check the SVG assets for anything that cannot work inside GitHub's
camo-proxied <img>: external references, fonts, scripts, width/height attributes that break scaling.`,
  },
  {
    key: 'a11y-language',
    prompt: `${COMMON}
YOUR LENS: accessibility and English language quality. You are a native-English technical editor
and an accessibility specialist.

Accessibility: every image's alt text (informative, not repetitive?), <title>/<desc> inside the SVGs
(open two or three from assets/generated/ and read them), the reduced-motion strategy (README
<picture> static sources — verify the static SVGs really contain no animation), contrast (spot-check
tokens in src/shared/tokens.ts against the WCAG floors), information available without images
(imagine every image missing: is the page complete?), no flashing/seizure-risk motion.
Language: read EVERY public-facing string as a native reader — README.md top to bottom, and the text
manifests: run  cd ${REPO} && npx tsx -e "import{buildAll,loadTelemetry}from './src/build.js';for(const b of buildAll(loadTelemetry()))for(const t of b.asset.texts)console.log(b.path+' :: '+t.value)"
Flag: any Turkish or non-English fragment, awkward or non-native phrasing, grammar errors,
inconsistent terminology or date formats, claims phrased as hype rather than fact, any term from the
banned lexicon in .ai/project/03-design-brief.md section 5.2, and anything a senior international
recruiter would find odd or inflated. Judge the copy in src/shared/profile.ts sentence by sentence.`,
  },
  {
    key: 'code-architecture',
    prompt: `${COMMON}
YOUR LENS: code and architecture quality. You are a staff engineer reviewing this as production code.

Read the source: src/shared/*.ts, src/build.ts, the five scene modules, scripts/generate/*,
scripts/render/*, scripts/validate/*, tests/*. Judge: correctness (hunt for real bugs — boundary
conditions, wrong arithmetic, silent failure paths, Windows/Unix path issues, race conditions in the
workflows), the determinism claim (is anything time-, locale-, or platform-dependent in the render
path? check toFixed/localeCompare/Object ordering/Map iteration assumptions), error handling in
snapshot.ts (API failures, missing fields, pagination: repositories(first:100) — what happens at 101?),
the drift gate's soundness, test quality (do the tests assert real invariants or mirror the
implementation?), dead code, misleading comments, and maintainability for a solo owner.
Run: npx tsc --noEmit and npm test yourself. Try: npx tsx scripts/render/render-all.ts -- --check.
Report concrete defects with file:line, not general advice.`,
  },
  {
    key: 'data-honesty',
    prompt: `${COMMON}
YOUR LENS: factual accuracy. Nothing on this profile may overstate, understate misleadingly, or be
unverifiable. This is the profile's core promise and the audit's RULE 3.

Cross-check every number: read data/telemetry.json, then verify the README and (via the text
manifests:  cd ${REPO} && npx tsx -e "import{buildAll,loadTelemetry}from './src/build.js';for(const b of buildAll(loadTelemetry()))for(const t of b.asset.texts)console.log(b.path+' :: '+t.value)" )
every displayed figure agrees with the snapshot, including derived ones (percentages, week totals,
the activity caption's total vs the plotted bars, "active weeks", the peak week, the hero index position).
Cross-check every prose claim against reality using gh (read-only):
- dropspot-project: does it actually implement idempotency keys / priority scoring / transactions? (gh api repos/hakanduyar/dropspot-project/readme --jq .content | base64 -d)
- Hunnes-Academy-motion-system: are there really ten motion modules and a router? (gh api repos/hakanduyar/Hunnes-Academy-motion-system/git/trees/main?recursive=1)
- stock-management-system: three roles, JWT, Prisma/PostgreSQL?
- spark: Dexie/IndexedDB, PWA, no backend, optional AI layer?
Check src/shared/config.ts signals[] and headlines line by line against that evidence.
Check the identity paragraphs in src/shared/profile.ts for any claim not supported by the public record.
Flag any banned metric that leaked in (followers, stars, streaks, invented units) and any number that
appears anywhere without a measurement method.`,
  },
  {
    key: 'security-hygiene',
    prompt: `${COMMON}
YOUR LENS: security, licensing and repository hygiene.

Secrets: scan the entire repo (including .ai/, data/, assets/) for tokens, emails that should not be
public (the owner's public contact email iamhakanduyar@gmail.com is fine), API keys, absolute local
paths leaking usernames into PUBLIC-FACING files (README.md and assets — internal .ai/ docs may
reference local paths). Run: cd ${REPO} && git log --all -p -- data/ | head -100 if useful.
Workflows: .github/workflows/*.yml — least-privilege permissions, injection surfaces (untrusted input
in run: blocks), pinned vs floating action versions and whether that choice is defensible, whether
GITHUB_TOKEN scope matches need.
Licensing: assets/fonts/ must contain the licence for the exact vendored binaries; verify
PROVENANCE.md claims (the OFL text must actually be there and cover JetBrains Mono). Check no other
third-party asset lacks attribution. Check package.json dependencies are all dev-time (nothing ships
to a runtime) and none is obviously abandoned/suspicious.
Hygiene: .gitignore correctness (is anything committed that should not be — node_modules, evidence
churn? is .ai/ committed deliberately and coherent?), repository size, generated-file headers,
whether README.md could be mistaken for hand-maintained.`,
  },
]

// Review + immediate per-dimension verification: no barrier between dimensions.
const reviewed = await pipeline(
  DIMENSIONS,
  (d) => agent(d.prompt, { label: `review:${d.key}`, phase: 'Review', schema: FINDINGS_SCHEMA }),
  async (review, d) => {
    if (!review) return null
    const majors = review.findings
      .filter((f) => f.severity === 'critical' || f.severity === 'major')
      .slice(0, 4)
    const verified = await parallel(
      majors.map((f) => async () => {
        const votes = await parallel(
          [1, 2].map((i) => () =>
            agent(
              `${COMMON}
You are an ADVERSARIAL VERIFIER. Another reviewer claims the following defect exists in the
repository at ${REPO}. Your default position is scepticism: try to REFUTE it by direct inspection.
Only uphold it if you can reproduce or confirm the defect yourself, concretely.

CLAIMED DEFECT (severity ${f.severity}):
Title: ${f.title}
Location: ${f.location}
Detail: ${f.detail}

Inspect the actual files/screenshots/commands yourself (read-only). If the claim is factually wrong,
based on a misreading, contradicted by the binding spec, or describes behaviour that is actually
correct/documented as a measured platform constraint, set refuted=true. If the defect is real,
set refuted=false and state exactly how you confirmed it.`,
              { label: `verify${i}:${f.title.slice(0, 30)}`, phase: 'Verify', schema: VERDICT_SCHEMA },
            ),
          ),
        )
        const valid = votes.filter(Boolean)
        const upheld = valid.filter((v) => !v.refuted).length
        // Confirmed unless every verifier who answered refuted it.
        const confirmed = valid.length === 0 ? true : upheld > 0
        return { ...f, confirmed, votes: valid }
      }),
    )
    const minors = review.findings.filter((f) => f.severity === 'minor')
    return {
      dimension: d.key,
      verdict: review.verdict,
      summary: review.summary,
      confirmedMajors: verified.filter(Boolean).filter((f) => f.confirmed),
      refutedMajors: verified.filter(Boolean).filter((f) => !f.confirmed),
      unverifiedOverflow: review.findings.filter((f) => f.severity !== 'minor').slice(4),
      minors,
    }
  },
)

const results = reviewed.filter(Boolean)
log(`${results.length}/6 dimensions reviewed`)
return { results }