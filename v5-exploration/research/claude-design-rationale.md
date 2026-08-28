# System Brief — Refined: design rationale

Deliverable: `v5-exploration/prototypes/system-brief-refined/index.html`
Assets: `v5-exploration/prototypes/system-brief-refined/assets/` (six vendored marks + provenance)
Preview: `http://127.0.0.1:4195/v5-exploration/prototypes/system-brief-refined/?theme=dark`
(`?theme=light`, and `&motion=reduce` for the static-motion variant)

Concept F remains the chassis. Concept D contributes its case-study method, Concept E its
authority model. Nothing in `prototypes/concept-a` … `concept-f`, the root `README.md`, the
live profile, the V4 artifacts, or git state was modified.

---

## 1. The problem with the finalist, stated plainly

Concept F scored 9.34 because it is fast to scan and hard to argue with. Reviewing it as the
design director, four things were holding it back:

1. **The identity was the smallest text on the page.** The name sat in a 15px top bar and the
   role in a 10px eyebrow, while the largest type was a tagline. The brief's ten-second test is
   *"Hakan Duyar — Front-end & Systems Engineering"*, and the page was not answering it.
2. **The matrix columns did not mean anything together.** `AUTH / ACCESS`, `TYPE / CONTRACT`,
   `TEST / EVIDENCE`, `AI-ASSISTED DELIVERY` were four unrelated labels, and the headline said
   "two cross-cutting controls" above four columns. Reading down a column taught you nothing.
3. **The motion was semantically wrong.** A token travelled *horizontally* across the middle
   row under the caption `REQUEST → STATE → RULE → PERSIST → DELIVER` — but that sequence
   descends the layer stack vertically. The animation contradicted its own label.
4. **The projects were a stack list with a decision bolted on**, and the featured set was wrong
   for this brief.

Everything below is aimed at those four, plus the logo direction the owner asked for.

---

## 2. Design plan

### Colour — 5 named values per theme, and one rule

The rule is the interesting part: **the page structure is neutral graphite, so the six
technology marks are the only saturated colour on it.** Concept F used an accent blue on
labels, rules, headings and cell tints; against that, real brand marks would have read as more
UI chrome. Desaturating the chassis is what lets React cyan and PostgreSQL blue actually land.

| Role | Dark | Light | Why |
|---|---|---|---|
| Field | `#0A0C10` | `#E5E7E2` | Light is a cool paper-grey *desk*, not an inverted screen |
| Sheet | `#12161C` | `#FCFCFB` | Panels are recessed in dark, lifted in light |
| Ink | `#E9EDF2` | `#13171B` | — |
| Faint | `#858F9D` | `#5E666E` | Annotation floor. Dark retuned three times, same hue throughout (§10): `#69737F` measured 3.3–3.8:1, `#7A8492` cleared the plain tokens but read 4.25–4.32:1 on the `color-mix()` tints, `#7F8997` cleared the two sampled tints and left two short; `#858F9D` is the minimum tested value clearing 4.5:1 on every surface sampled. Light retuned twice: `#606870` cleared the plain tokens but read 4.40:1 on its ≤880 mobile-core tint; `#5E666E` is the minimum tested value clearing it, at 4.54:1 |
| Flow | `#88A7CD` | `#2B5581` | Request path, agent work, core tier. Low-chroma slate — deliberately subordinate to React's `#61DAFB` |
| Authority | `#D3B36A` | `#7C5A0F` | Human authority and explicit boundary/constraint language; never general decoration |

Brass is the page's scarcest semantic accent. It is reserved for human-authority states and a
small set of explicit boundary or constraint annotations: the principle row, evidence-return
key, actor/gate cues, JointLedger inheritance boundary, and current-expansion caution. It never
marks generic system activity. That scarcity is what makes "human release gate" read as a claim
rather than a badge.

### Type — two families, one of them promoted

- **Display / headline:** `"Segoe UI Variable Display", "Segoe UI", Inter, …`. Segoe UI Variable
  Display is the Windows 11 optical size cut for large text; it holds up at 76px where plain
  Segoe UI goes soft. Set tight: `-0.046em` on the hero, `-0.033em` on section heads.
- **Technical:** `"Cascadia Mono", "Cascadia Code", ui-monospace, "SF Mono", …`. Cascadia ships
  with VS Code and Windows Terminal and is far more characterful than the Consolas fallback the
  existing prototypes land on.

The deliberate move is **promoting the monospace from caption face to structural voice.** In
real engineering drawings essentially all annotation is one technical face at one or two sizes,
and the only display typography is the project title. So here: every layer name, datum, column
key, path label, tier label and boundary marker is mono at 10–11px with `+0.12–0.14em` tracking.
(The floor was 8–9px in the first build; the independent review pass raised it — §10.)
The grotesque is reserved for headlines, claims, and reading text. No serif — that would drift
toward the cream/serif/terracotta look this brief should avoid.

### Layout

```
┌ TITLE BLOCK ─ Hakan Duyar / Front-end & Systems Engineering ──── V5 ┐
├ HERO ─ thesis headline + lede │ brief: core / applied / AI / principle
├ 01 ENGINEERING SYSTEM
│   LEGEND  [React][TypeScript] │ [Next.js] │ [Node][Postgres][Docker]
│   PLAN    5 layers × Owns / Contract / Evidence / Where AI participates
│           riser: request descends ↓   evidence returns ↑
├ 02 APPLICATIONS   01 Software Factory (full width, flagship)
│                   02 Spark │ 03 Built in Layers      (2-up)
│                   04 JointLedger (full width, peer weight, authorship boundary exposed)
├ 03 AI ENGINEERING  dark position panel │ 7-step authority rail + repair
├ 04 CAPABILITY      core / applied / platform / expansion, weighted
└ CLOSE + footer title block
```

The legend-then-plan order is not decoration: architectural drawings put the **key** before the
**plan**, and that happens to also be the right reading order here — big marks answer the
ten-second question, the matrix rewards the sixty-second one.

### Signature: the layer span

The one device the page should be remembered by is **a five-segment bar — I A S D P — that
appears on every application plate and shows which layers of the plan that work actually
occupies.**

| | I | A | S | D | P |
|---|---|---|---|---|---|
| Software Factory | ○ | ● | ● | ● | ● |
| Spark | ● | ● | ○ | ● | ○ |
| Built in Layers | ● | ● | ○ | ● | ● |
| JointLedger | ○ | ○ | ● | ● | ● |

It earns its place three times over:

- It **proves the plan is load-bearing.** Section 01 is not a diagram the projects ignore; it is
  the coordinate system they are measured in.
- It **encodes truth visually.** Software Factory's *interface* segment is empty, because there
  is no completed control-room UI. JointLedger fills services, data and platform but not
  interface, because the shared-book work is backend-only — there is no frontend or book
  selector. The honesty is in the geometry, not only in the prose.
- It **is instantly legible** without a key, which alphanumeric grid coordinates would not be.

I deliberately took the risk of putting a scope-limiting device on the flagship project. A
filled-in-everywhere bar would have looked stronger and been false.

### Motion — one orchestrated moment, not scattered effects

Exactly one animation: a vertical riser down the left gutter of the plan carrying two tokens on
an 11-second cycle. A **flow-coloured token descends** layers 1→5 in the first half; a **brass
token climbs back** 5→1 in the second. That is the request going down and the evidence coming
back to the person making the release decision — the return path being the thing most stacks
leave undesigned.

This fixes Concept F's contradiction (horizontal motion under a vertical label), and it is the
only moving thing on the page. The workflow section deliberately gets a *static* repair arc
instead of a second animation. Both `prefers-reduced-motion` and the existing
`?motion=reduce` hook park the tokens at their endpoints, where the rail still reads correctly.

---

## 3. Technology-logo direction

The owner expected larger technology logos. Addressed head-on rather than avoided.

**Six real marks, vendored locally, four sizes.** All six are copied verbatim from Simple Icons
(CC0-1.0) into `assets/`, with source, licence, brand hex, and mark owner recorded in
`assets/README.md`. Nothing is redrawn, traced, or approximated — **no mark on the page is
invented**, and none is recoloured.

| Tier | Plate | Marks | Reason |
|---|---|---|---|
| 1 | 164px | **React, TypeScript** | Established core. Largest by a wide margin |
| 2 | 118px | **Next.js** | Application boundary — applied, not core |
| 3 | 96px | **Node.js, PostgreSQL** | Applied services and data |
| 4 | 76px | **Docker** | Platform context |

Four distinct sizes, bottom-aligned in three divided groups: the hierarchy is unmissable in
peripheral vision, and it is structurally impossible to read as a row of equal badges.

Deliberate decisions inside that:

- **Each mark sits on a plate tinted with its own brand colour** (14% dark / 9% light). This is
  the drawing-legend convention of assigning a colour key per layer — and it solves a real
  problem: React's `#61DAFB` on a near-white sheet has weak presence, so the plate gives it a
  field to sit on without touching the mark itself.
- **Next.js renders white on dark and black on light.** The brief permits this; it is the
  brand's own native inversion, and its vendored file is left as `currentColor` for that reason.
- **Kubernetes gets no mark**, because it is expansion. Docker — real, evidenced, used in
  JointLedger — is the smallest mark on the page. Size follows the capability tiers exactly.
- **Every other technology stays textual.** Redux, Dexie, Prisma, Playwright, Nginx and the rest
  appear as words in the layer they serve. Adding marks for them would flatten a four-step
  hierarchy into a wall, which is the failure this direction exists to avoid.

The prototype inlines the identical path geometry as an SVG `<symbol>` sprite so a single custom
property can drive the Next.js inversion and so the file renders from `file://`. The standalone
files in `assets/` are the production source of truth; the README notes that the README build
must embed them and must not call a CDN.

---

## 4. Applications — the mandatory order, and what it cost

The featured sequence is fixed and is implemented exactly as specified:

**01 Software Factory → 02 Spark → 03 Built in Layers → 04 JointLedger.**

DropSpot is **not** in the sequence. It is also not smuggled in by name anywhere else — the
"integration tests exercise the API path" cell in the plan describes the practice without
attaching a project, precisely so the featured four are not quietly expanded to five.

Weight is assigned by architectural substance, not by list position:

- **Software Factory** takes a full-width flagship plate and the only bespoke diagram on the
  page: a durable SQLite domain band above provider-neutral worker ports above a dashed,
  disposable adapter band (Codex CLI, Claude Code CLI). That drawing *is* the decision — the
  domain outlives every process that touches it. Its "not claimed" line rules out GitHub
  issue/PR automation, n8n, server deployment, publishing, and a control-room UI.
- **Spark** and **Built in Layers** share a two-up row: comparable substance, different failure
  modes (network absence vs. content contract).
- **JointLedger** takes a full-width plate at the same weight as Spark and Built in Layers.
  (Its internal geometry was rebuilt in the review pass: description and path chain on the left,
  the inheritance boundary as an enumerated list on the right, and the three notes in a
  full-width band below — see §10.)
  A repository audit corrected an earlier, thinner reading of this project: the default branch
  carries the upstream ezBookkeeping application plus Hakan's local Docker Compose and
  PostgreSQL setup, but an unmerged `feature/shared-family-book` branch — four commits ahead —
  adds Hakan-authored backend work: `Book`, `BookMember` and `BookInvitation` models, book
  services and APIs, owner/editor/viewer permission checks with role tests, deterministic
  personal-book creation with an idempotent backfill, and book scoping for accounts, categories
  and tags. That is an extension against an inherited schema, not environment setup, and the
  card now says so. Its claim line is *"A shared ledger is a permissions problem before it is a
  screen"* — which is both the engineering argument and the reason there is no UI yet.

Three judgement calls worth flagging:

1. **JointLedger is distinguished by its boundary, not by suppression.** The first pass gave it
   a visibly lighter strip so the hierarchy would carry the truth. Once the audit showed real
   backend authorship, that treatment was understating the work, so the card was promoted to
   full case weight and the *inheritance boundary* was promoted with it — a brass-bordered block
   naming what is not Hakan's. Scope limits stated at full volume are more credible than scope
   limits implied by a small card.
2. **The unmerged status is on the card, not omitted.** "Four commits ahead, unmerged and
   unreleased" appears as its own note. A reviewer who checks the repository should find exactly
   what the page told them, including the parts that are not finished.
3. **The honest framing is an asset, not damage control.** Naming the upstream accounting engine
   and Vue interface as someone else's work, and the invitation flow as schema-only, reads to an
   engineering manager as calibration. Four flagship-sized, uniformly confident projects would
   read as inflation.

Each plate follows Concept D's method: a constraint stated as the failure it prevents, the
architecture that answers it, then decision / boundary notes — never a technology list.

---

## 5. AI engineering

Section 03 does not repeat the Software Factory plate. They are split by question:

- **Section 02** answers *what was built* — the durable-domain / disposable-worker architecture.
- **Section 03** answers *who holds authority* — the seven-step path from Specify to Release,
  colour-coded by actor (brass = human, flow = agent, neutral outline = deterministic process),
  with the bounded repair return, the three rails (durable state, deterministic evidence,
  supervisor), and the invalidation rule.

The workflow is the claim, not the tool brands — stated as such, and reinforced by the
architecture: Codex and Claude Code appear once, inside a dashed adapter band, as replaceable.

Every AI statement traces to `engineering-inventory.md`. Nothing claims autonomous release,
production scale, telemetry, or a finished product. There are no fabricated metrics, no fake
terminal output, and no numbers on the page except the section indices, the workflow step
numbers, and the Dexie schema range v1 → v8, which is documented.

---

## 6. Light mode as a premium document

Light mode is composed, not inverted:

- The field is a cool paper-grey **desk**; sheets are near-white and **lift off it** with an
  inset white highlight plus a soft drop shadow (`--lift`). In dark mode `--lift` is `none` and
  the same panels read as recessed. The two themes have genuinely different physics.
- Brand-tint percentages drop from 14% to 9%, and mark plate edges from 32% to 26% — hairlines
  and washes that read as delicate on a screen read as weak on paper.
- **One panel stays dark in both themes**: the AI position block, which functions as a printed
  black tab. It pins the dark-theme brass locally, because light mode's darker brass would fall
  to roughly 2.5:1 against that surface.

## Mobile is recomposed, not shrunk

- **The plan matrix becomes per-layer cards.** Rows are `display:contents` on desktop so their
  cells are items of the plan grid; below 880px the body reverts to block flow, each row becomes
  its own bordered card with the numbered chip and layer name as a header, and every cell gets
  its column key back (`Owns`, `Contract`, `Evidence`, `Where AI participates`) — keys that are
  `display:none` on desktop because the header row carries them. No column is dropped.
- **The workflow track rotates**: seven horizontal cells become a vertical authority rail with
  the index, label, and description on one line each.
- **The legend keeps its hierarchy**: plates scale to 118 / 92 / 78 / 66px, so React and
  TypeScript remain visibly dominant rather than collapsing to a uniform row.
- Path chains stack with the chevron connectors rotating from horizontal to vertical.

---

## 7. Self-critique

Reviewed as product designer, architect, engineering manager, and technical recruiter. What was
cut or changed as a result:

- **Cut a second animation.** An animated repair-return arc in section 03 was planned and
  removed. Two moving things compete; one reads as intent. The repair path is drawn statically.
- **Cut alphanumeric plan coordinates.** Case plates originally cited `A1–D5`-style references
  into the matrix. It was clever and required decoding. Replaced by the layer-span bar, which
  carries the same information and needs no key.
- **Cut the drawing-sheet costume.** Registration ticks, `SHEET 01 OF 05` stamps, and revision
  blocks were in the plan. The title block and the datum discipline survive; the theatre did
  not. Restraint is the brief.
- **Rewrote the matrix columns.** `Owns / Contract / Evidence / Where AI participates` — four
  questions asked of every layer, so a column now reads as an argument and a row as a
  responsibility. This is the largest single improvement over Concept F.
- **Made the identity legible.** The name is 23px and the role 13px in a proper title block,
  answering the ten-second test before the thesis headline is read.
- **Removed Kubernetes from the plan entirely.** Concept F had it as a greyed platform cell,
  which still granted it plan-level presence. It now appears only in the expansion tier, with
  K9s named only as its operational tooling.

Known limitations, stated rather than hidden:

- **Typography depends on system fonts.** Segoe UI Variable Display and Cascadia Mono are very
  likely present on the owner's Windows machine but are not universal; the stacks degrade
  through Inter → Helvetica Neue → Arial and ui-monospace → SF Mono → Consolas. Production SVG
  should convert headline text to outlines, or commit to a webfont pair.
- **The page is long.** It rewards a ten-second scan and a sixty-second read, but a sixty-second
  reader who starts at section 04 gets the least interesting part. Section order is fixed by the
  brief's own requirement sequence, which I judged correct to follow.
- **`assets/` and the inline sprite duplicate the same geometry.** Deliberate, and documented in
  `assets/README.md`, but it is a drift risk that production should resolve by generating the
  sprite from the files.
- **The prototype was not rendered by me.** It was built and statically audited without a
  browser in this session. Visual QA was performed separately and passed — see section 9.
- **JointLedger's scope was initially misread.** The first pass described it as environment
  setup only, which understated it. Corrected after a repository audit; see section 4. The
  lesson is that the layer-span device is only as honest as the evidence behind it, so the
  span values should be re-derived whenever a repository is re-audited.

---

## 8. GitHub README feasibility

High, and higher than Concept F's original because the page now decomposes along clean seams.

**Split into five SVG panels**, not one tall asset:

| Panel | Content | Motion |
|---|---|---|
| `hero` | Title block + thesis + brief rows | none |
| `legend` | Six marks at four sizes | none |
| `plan` | 5 × 4 responsibility matrix + riser | one token pair |
| `applications` | Four plates, or one per project | none |
| `workflow` | Seven-step authority rail + rails + gate | none |

Mechanics:

- **The prototype's ALL / DARK / LIGHT controls are a preview harness and must not ship.** They
  are anchors into `../shared/prototype.js`, which reads `?theme=` / `?motion=` and sets
  `data-theme` / `data-motion` on `<html>`. GitHub strips `<script>` from rendered Markdown and
  does not execute JS inside `<img>`-embedded SVG, so **the production README carries no custom
  JavaScript at all** — the theme switch is entirely declarative.
- `<picture>` with `prefers-color-scheme` media sources for dark/light variants, two
  pre-rendered files per panel, the dark variant as the `<img src>` fallback. GitHub also
  honours `#gh-dark-mode-only` / `#gh-light-mode-only` fragment suffixes as a secondary
  fallback, but they should not be the primary mechanism. Full pattern in
  `claude-independent-review.md` §5.
- **The marks are already GitHub-safe.** They are local SVG paths with no external references,
  no CSS custom properties needed at rest, and no CDN. Inline them into each panel and hard-code
  the two Next.js variants per theme.
- **Motion**: SMIL (`<animate>` / `<animateMotion>`) survives GitHub's sanitiser where CSS
  `@keyframes` inside `<img>`-embedded SVG generally does not. Restrict it to the plan panel's
  two tokens. Ship a `-static` twin of that panel and reference it from a
  `prefers-reduced-motion` source — the pattern `assets/generated/` already uses.
- **Nothing on the page depends on runtime JavaScript or hover.** The only script is the shared
  theme-preview harness and a `<span data-year>`; the layer spans, boundaries, and actor keys
  are all rendered statically, and every colour-coded distinction (actor, filled layer segment,
  tier) also carries a text label.
- **Alt text**: each panel needs a descriptive `alt`, and the four case constraints plus the
  JointLedger boundary should additionally exist as real Markdown below the images so the
  substance survives with images disabled.
- **Sizing**: GitHub's profile column is ~880px. Author panels at 880 × N and let them scale;
  do not author at 1220 and rely on downscaling, or the 10px mono annotation will not survive
  (at 880/1220 it lands at ~7.2px). The narrow recomposition in this prototype is the correct
  source for the 880px rendering.
- **Curation is the standing risk.** Concept F's recorded weakness was that the map goes generic
  if production adds every candidate technology. The four-question column structure now makes
  additions self-policing: a technology that cannot answer *owns / contract / evidence / where
  AI participates* does not belong in the plan.

---

## 9. Verification

> **Scope correction.** Everything in this section describes the **pre-review revision** of the
> prototype. An independent review pass has since edited `index.html` (§10), so this QA record no
> longer covers the current file. A separate Codex browser-QA pass dated 2026-08-28 does cover the
> post-review file — `claude-independent-review-browser-qa.md`, summarised at the end of §10.
> Items neither pass settles are listed in `claude-independent-review.md` §7.

**Browser QA: passed (pre-review revision).** Codex rendered desktop dark, desktop light, mobile dark and mobile light
after Claude's static audit. All four variants have the exact application order and no horizontal
overflow; the initial browser run also produced no console warnings.

Claude's design session had no browser available, so the prototype was audited statically first.
The following were found and fixed by reading the source before Codex performed browser QA:

1. **Plan matrix collapse (layout-breaking).** `.sb-row` declared both `display:grid` and, later,
   `display:contents`. The six-column template was therefore declared on an element that no
   longer formed a grid, and `.sb-plan-body` was a plain block — the whole matrix would have
   stacked vertically. The grid now lives on `.sb-plan-head` / `.sb-plan-body`, with mobile
   reverting the body to block and the rows to grid.
2. **Legend caption competing with the marks.** `.sb-group-cap` was a flex sibling of the
   anchors instead of a full-width caption below them, and `align-items:end` on the group grid
   would have stopped the dividers spanning full height.
3. **Invalid capability-tier markup.** `<h3>` inside `<dt>`, and a `<span>` as a direct child of
   a `<dl>` grouping div. Worse, `[data-tier=core] dd` out-specified `.sb-mark`, so the core
   tier's marker would have rendered at 13.5px ink instead of 9px mono. Restructured.
4. **Brass invisible on the dark AI panel in light mode** (~2.5:1). The panel now pins the
   dark-theme brass locally.
5. Smaller: `font` shorthand carrying a `var()` font-size, unmargined `<p>` inside bordered
   panels, captions able to out-measure their mark plates and flatten the size hierarchy, an
   `aria-label` on each mark duplicating the adjacent visible name, and dead `.sb-path-4` /
   `.sb-sr` rules.

### Re-check after the JointLedger correction — passed

The evidence-driven JointLedger change was rendered again after the correction. At 1440 × 1000
in desktop dark and light, and 390 × 845 in mobile dark and light, the exact application order is
preserved and there is no horizontal overflow. The full-width card reads as peer-weight to Spark
and Built in Layers without competing with the Software Factory flagship; its 1.25fr / 0.75fr
desktop split keeps the notes and brass authorship boundary aligned, while mobile recomposes them
into a clean stack. The two-clause case label wraps cleanly on mobile. Current evidence is in
`../evidence/claude-refined/desktop-dark-jointledger.png` and
`../evidence/claude-refined/mobile-light-jointledger.png`.

---

## 10. Independent review pass

An independent reviewer re-inspected the completed prototype without deferring to this document.
Findings and full justification: `research/claude-independent-review.md`. What changed in
`index.html` as a result:

1. **Annotation contrast.** `--faint` measured 3.55:1 (dark, on `--sheet-2`) and 3.32:1 (light, on
   the field) — below AA, on the smallest text on the page. Retuned to `#7A8492` / `#606870`,
   which cleared 4.5:1 against every **plain surface token**. That was the wrong test: several of
   these annotations sit on `color-mix()` tints, which are lighter than the token they mix into.
   Codex later sampled the rendered page and read `#7A8492` at **4.32:1** on the core layer tint
   and **4.25:1** on the durable-domain tint — still below AA. The dark value went to `#7F8997`,
   which Codex reads at 4.62 and 4.54 there, but that still left the ≤880 core layer (~4.17:1) and
   the human workflow step (~4.39:1) short by computation, and neither had been sampled. Codex then
   sampled them on the next candidate up: **`#858F9D`** reads **4.51:1** on the 880px mobile core
   tint, **4.75:1** on the human-authority step and **4.91:1** on the durable-domain surface. That
   is the dark value in the file — the minimum tested candidate clearing 4.5 on every dark surface
   sampled. Light was assumed clean on the same plain-token test; Codex later sampled its ≤880
   mobile-core tint and read `#606870` at **4.40:1** — also short. **`#5E666E`** is the minimum
   tested correction clearing it, at **4.54:1**; the light human-authority step and durable-domain
   surface compute at **5.00:1** and **5.03:1** at that value. That is the light value in the file.
   Only that one token moved in each theme, across all four passes, and the hue is identical at
   each step. The `--muted` ↔ `--faint` gap narrows further as a
   result — dark `--faint` is now ~1.28× `--muted` in relative luminance, from ~1.46× originally —
   an accepted trade, since hierarchy here is carried mainly by size, weight and tracking. Still
   unmeasured: `.sb-tier[data-tier=core]`, which clears by arithmetic only, and the remaining light
   tinted surfaces beyond the one sampled. **The patched file itself has not been rendered or
   re-sampled**; the readings above are Codex's, taken on the candidate colours against the pre-fix
   page.
2. **Type floor.** The mono scale ran 8 / 9 / 9.5 / 10 / 11px — five steps in a 3px band. The
   sub-10px steps were collapsed into a 10px floor; the 11px mono step and every size above are
   unchanged, leaving two mono sizes under the display scale. Small sans text at 10.5–11px
   (`.sb-steps span`, `.sb-path li span`, `.sb-rails span`, `.sb-index em`) went to 11.5px;
   `.sb-domain-items span` is mono 11px and was not part of that change. Two label columns were
   widened (`.sb-brief-row` 104→120px, `.sb-tier` 236→268px / 190→220px) so no new wrap is
   introduced. **One wrap was introduced anyway:** the widening was checked against the 268px
   desktop column only, and Codex found `PLATFORM CONTEXT · WORKING AWARENESS` on two lines in the
   220px column at 1080px. The key is now `Platform · working awareness` — 27ch instead of 36ch,
   one line at both widths. The tier name and its qualifier both survive; only the redundant
   *context* goes, which also makes the key match the `<tier> · <status>` form of the other three.
   Two of those three exceeded 220px by the same arithmetic and are now shortened on the same rule:
   `Applied · evidenced in public work` → **`Applied · public evidence`** (34ch → 25ch) and
   `Current expansion · in progress` → **`Expansion · in progress`** (31ch → 23ch). Both name the
   same standard as before — public work you can look at, and a tier still marked unfinished.
   `Core · established` and `Platform · working awareness` already fitted and are unchanged, so all
   four calibration keys are one line in the 220px column at 1080. No column was widened, no type
   shrank, no tier was promoted, and the tier marks and boundaries — including `Not a production
   platform ownership claim` — are untouched. The shortened keys are arithmetic, not rendered.
3. **JointLedger geometry.** The 1440px evidence showed ~350px of dead space in the card's right
   column. The three notes moved out of the ledger grid into a full-width three-column band
   below it — the same geometry the flagship uses — and the inheritance boundary became a
   stacked label plus a four-item list, one item per factual limit. No limit was removed.
4. **Prose density down ~16%**, cut in this order: text that duplicated adjacent structure, text
   that narrated the design rather than the work, then phrasing. No evidence, exclusion,
   limitation or qualification was deleted; the boundary audit is in the review, §4. Measured as
   full-article visible words (`innerText`, the only reproducible basis), the four case studies
   went **736 → 643** in the review pass and **→ 620** after a 2026-08-28 correction pass that
   took a further 23 words out of Software Factory and Spark alone: Software Factory 198 → 167,
   Spark 137 → 116, Built in Layers 153 → 130, JointLedger 248 → 207. The flagship was cut least
   in the review pass (−7.1%) and given back its dominance typographically instead (item 5), so
   the correction pass could tighten it without weakening it. Per-cut justification is in the
   review, §2 R4.
5. **Flagship dominance made typographic.** Software Factory, Spark and Built in Layers all had
   26px titles. Software Factory is now 31px with a larger claim and more padding; the three
   peers share one 24px title. Layout dominance alone was doing too much work.
6. **Theme harness labelled.** The prototype bar now reads "preview harness", with a source
   comment stating the production `<picture>` requirement — see §8.

7. **The 880px column.** `@media(max-width:880px)` matches *at* 880px, and the narrow band
   clamped the page to a 560px measure — 36% of the viewport left empty at the width the brief
   cares about most, and at the width §5 of the review specifies production panels are authored
   from. The clamp is now 720px, with `ch` measure caps added across the narrow band so the wider
   column does not buy back the empty field at the cost of ~100-character lines. At 390px nothing
   changes: `min()` still resolves to the percentage term. `.sb-legend-bar` also gained
   `flex-wrap` — its two keys measured ~302px against 322px of content box at 390px.

Not changed, and deliberately so: the six-mark legend and all four plate sizes; the exact
application order; the riser motion and both reduced-motion paths; the 880px *breakpoint* itself
(only the clamp inside it moved).

**The review pass had no browser either.** Its conclusions are from source, from arithmetic on the
declared colour and type values, and from the screenshots already in `evidence/claude-refined/`
— which were rendered from the pre-review file. Neither the design pass nor the review pass
observed the edited file.

**Post-review browser QA — 2026-08-28, performed by Codex.** The renders the review asks for were
produced separately, by Codex rather than by Claude, and are recorded in
`claude-independent-review-browser-qa.md` with evidence in `evidence/claude-independent-review/`.
Result: PASS — 1440 / 880 / 390 in both themes, no horizontal overflow, exact application order,
a minimum computed visible font size of 10px, and a 720px page at 880px, so the 880px width now
has rendered evidence. Contrast sampling, the reduced-motion paths and the one-line label fits are
not covered there and stay open in the review, §7.

**Two of those open items were then worked, and both failed — 2026-08-28.** Codex ran the contrast
picker and the tier-label check (review §7 items 9 and 4). Dark `--faint` `#7A8492` measured
4.32:1 and 4.25:1 on two `color-mix()` tinted surfaces, and the platform tier key rendered on two
lines at 1080px. Both are fixed above — items 1 and 2 of this section — as review R8 and R9. These
readings are **Codex's**, taken after `claude-independent-review-browser-qa.md` was written and not
recorded in it; neither that document nor its renders were edited, and Claude ran no browser at any
point. The fixes themselves have not been rendered.

**Final micro-patch — 2026-08-28.** Codex sampled the two tinted surfaces that pass had left short,
plus the durable-domain tint, using the next candidate up: `#858F9D` read 4.51:1 on the 880px
mobile core tint, 4.75:1 on the human-authority step and 4.91:1 on the durable-domain surface. Dark
`--faint` is now that value (review R10), and the two capability keys that still exceeded the 220px
column were shortened to `Applied · public evidence` and `Expansion · in progress` (review R11).
Again **Codex's readings, on the candidate colour against the pre-fix page** — the patched file has
not been rendered, sampled or eyeballed by anyone, and the 4.51 figure clears the line by one
hundredth, so re-sampling is a real check rather than a formality. The review §7 open list at this
point was: `.sb-tier[data-tier=core]` and the whole light theme, neither ever sampled; the four
tier keys at 1080, three of them now in shortened forms nobody has rendered; the JointLedger card
at 1440; the Software Factory head at 1440; the hero brief key column; the `.sb-case--bounded`
claim override; and both reduced-motion paths.

**Final token correction — 2026-08-28.** Codex then sampled the light theme's ≤880 mobile-core
tint, the one light surface still unmeasured, and read `#606870` at **4.40:1** — short of AA.
`#5E666E` is the minimum tested same-direction correction that clears it, at **4.54:1**; the light
human-authority step and durable-domain surface compute at **5.00:1** and **5.03:1** at that value
(review R12). Dark `--faint` is unchanged at `#858F9D`. Again **Codex's reading, on the candidate
colour against the pre-fix page** — the patched file has not been rendered by anyone. The review
§7 open list is now: `.sb-tier[data-tier=core]` (dark, arithmetic-only) and the remaining light
tinted surfaces beyond the one sampled; the four tier keys at 1080; the JointLedger card at 1440;
the Software Factory head at 1440; the hero brief key column; the `.sb-case--bounded` claim
override; and both reduced-motion paths.
