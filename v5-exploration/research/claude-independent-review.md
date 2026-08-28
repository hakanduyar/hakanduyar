# Independent design & frontend review — System Brief (refined)

Reviewer: independent senior product designer / frontend engineer.
Target: `v5-exploration/prototypes/system-brief-refined/index.html`
Method: static source inspection of the prototype and `prototypes/shared/base.css`, plus
inspection of the *existing* rendered evidence in `v5-exploration/evidence/claude-refined/`.

**No browser was run for this review.** No new rendering was produced. Every claim below is
either (a) derived from the CSS/HTML source, (b) computed arithmetically from the declared
colour tokens, or (c) read off screenshots that already existed in the repository. Anything that
needs a live render to settle is listed in §7 as outstanding browser QA, not asserted as fact.

> **Post-review status — 2026-08-28.** The browser QA this review asks for in §7 was
> subsequently carried out **by Codex, not by Claude and not by this review**, and is recorded in
> [`claude-independent-review-browser-qa.md`](claude-independent-review-browser-qa.md) with
> renders in `evidence/claude-independent-review/`. It reports PASS at 1440 / 880 / 390 in both
> themes and supplies the 880px evidence this document lists as missing. Nothing in this review
> was rendered by its author; the statement above stands unchanged for the review itself. A
> correction pass on the same date fixed the factual errors marked *corrected 2026-08-28* below
> and cut a further 23 visible words from the Software Factory and Spark articles (§2, R4).
>
> **Final correction pass — 2026-08-28.** Codex subsequently ran the picker and one-line-label
> checks this review left open (§7 items 4 and 9) and returned two defects, both now fixed in
> `index.html`: the dark `--faint` retune cleared AA on the plain tokens but not on the
> `color-mix()` tinted surfaces (§2, R8), and the platform tier key wrapped to two lines in the
> 220px column at 1080px (§2, R9). Those two measurements are **Codex's rendered readings, not
> this review's** — still no browser was run by the author of this document, at any revision. They
> also post-date the QA document above and are not recorded in it; that file is Codex's and was not
> edited here, so the readings are quoted in §2 (R8, R9) and §7 instead.
>
> **Micro-patch — 2026-08-28.** Codex then sampled the surfaces R8 deliberately left open and the
> `APPLIED` key R9 left long. Both are now closed in `index.html`: dark `--faint` moves once more,
> `#7F8997` → `#858F9D` (§2, R10), and the two long capability keys are shortened (§2, R11). The
> measurements behind R10 are again **Codex's**, taken on the `#858F9D` candidate against the
> pre-fix page, not this review's. **The patched file has not been rendered by anyone**, at any
> width — R10 and R11 are unverified in a browser exactly as R8 and R9 were.
>
> **Final token correction — 2026-08-28.** Codex then sampled the light theme's `color-mix()`
> surfaces, which no revision before this one had measured. Light `--faint #606870` read
> **4.40 : 1** on the 880px mobile-core tint — short of AA. `#5E666E` is the minimum tested
> same-direction correction that clears it, at **4.54 : 1**; the light human-authority step and
> durable-domain surface compute at **5.00 : 1** and **5.03 : 1** at that value (§2, R12). Dark
> `--faint` is unchanged at `#858F9D`. The measurement behind R12 is again **Codex's**, taken
> against the pre-patch page, not this review's; **the patched file has not been rendered by
> anyone**.

---

## 1. Critical findings before any edit

Ordered by severity. **All eight were acted on** — F1→R1/R8/R10/R12, F2→R2, F3→R3, F4→R3/R4, F5→R5,
F6/F7→R4, F8→R7 (§2). F8 was initially left documented-but-unchanged; that decision was reversed
later in the same pass and R7 records the fix. F1's fix was completed later still, by R8, after
Codex's rendered sampling showed R1 had computed against the wrong surfaces, continued by R10
after Codex sampled the surfaces R8 had left open, and finished by R12 after Codex sampled the
light theme's tinted surfaces, which no earlier pass had measured. R9 and R11 (§2) fix label wraps
that no finding here predicted and only a render exposed. What was considered and
deliberately *not* changed is in §3.

### F1 — The small-annotation floor fails WCAG AA in both themes

`--faint` is the colour of nearly every mono annotation on the page: column keys, group captions,
tier eyebrows, step indices, the layer-span cells, the boundary label, the footer. Computed
against the surfaces it actually sits on:

| Pairing | Contrast (before) |
|---|---|
| dark `--faint #69737F` on `--sheet-2 #171C23` | **3.55 : 1** |
| dark `--faint` on `--sheet #12161C` | 3.77 : 1 |
| dark `--faint` on `--bg #0A0C10` | 4.07 : 1 |
| light `--faint #79828A` on `--sheet #FCFCFB` | **3.81 : 1** |
| light `--faint` on `--bg #E5E7E2` | 3.32 : 1 |

Three of five pairings are below 4.5:1, and the failures land on the *smallest* text on the page.
`--muted` is fine (6.6 : 1 dark on sheet), so this is genuinely a weak lower bound, not a
page-wide contrast problem. This is a code-verifiable defect, independent of rendering.

*(Corrected 2026-08-28: this table is incomplete, not wrong. It pairs `--faint` only with the
plain surface tokens. Some of the smallest annotations sit on `color-mix()` tints that are lighter
than any of them, so the real worst case is worse than the 3.55 : 1 stated here — see R8. The same
was true in light: R12 found a light tinted surface at 4.40 : 1, also below AA.)*

### F2 — Five mono sizes inside a 3px band is noise, not hierarchy

*(Corrected 2026-08-28: this finding originally said six sizes and listed a 10.5px mono step.
**There is no 10.5px mono declaration** in the file, at any revision.)*

Declared mono sizes: **8, 9, 9.5, 10, 11px**. Five steps across 3px cannot be perceived as five
levels; what the reader gets is one indistinct "small" band whose floor (8px on
`.sb-spine-bar i`, 9px on ~14 selectors) is below comfortable reading size at any width, and
which the brief itself flags as a risk for the ~880px README column. The real hierarchy on this
page is carried by weight, tracking, colour and position — the sub-10px steps add nothing.

Non-mono small text has the same problem at 10.5px (`.sb-steps span`) and 11px
(`.sb-path li span`, `.sb-rails span`, `.sb-index em`). `.sb-domain-items span` is **mono at
11px**, not sans at 11.5px — it was misfiled here originally, it is already at the mono 11px
step, and it is not part of this finding.

### F3 — JointLedger: ~350px of dead space in the right column at 1440

Confirmed from existing evidence (`evidence/claude-refined/desktop-dark-jointledger.png`, 1440px
desktop dark). `.sb-ledger` is `1.25fr .75fr`; the left column carries prose + path chain + three
stacked notes, the right column carries only the brass boundary block with `align-self:start`.
The measured result is a bordered card roughly 690px tall whose right half is empty below the
first ~180px. The notes were also forced to a single column (`.sb-case--bounded .sb-notes
{grid-template-columns:1fr}`), which is what makes the left column so tall.

### F4 — JointLedger is the densest prose block on the page, and part of it is duplicated

The case description (65 words) enumerates "models, services, permission checks, and scoping" —
which is exactly what the three path-chain steps immediately below it say (`Book · BookMember ·
BookInvitation`, `Book services and APIs`, `Book scoping`). It also describes the Compose/Postgres
runtime, which the `Runtime` note then describes again in more detail. On mobile this renders as
a nine-line unbroken muted paragraph (confirmed in `mobile-light-jointledger.png`).

The `Inherited, not authored` block is four distinct factual boundaries delivered as one
44-word run-on paragraph. These are the most important sentences on the card and they are the
hardest to scan.

### F5 — Software Factory is not typographically distinguished from its peers

`.sb-case-id h3` is 26px for Software Factory, Spark **and** Built in Layers; JointLedger is
23px. The flagship's dominance rests entirely on layout (full width, first position, the bespoke
domain diagram) and on the words "The flagship." Given that flagship dominance is a locked
requirement and the peer relationship is explicit, a shared headline size with Spark is a real
weakness — a scanner reading only titles sees four near-equal cards.

### F6 — Some copy narrates the design instead of the work

`"…a wall of equal badges would say nothing about depth"`, `"Listed once, in the right tier, at
the right size."`, `"Shown as work in progress, because that is what it is."` These explain the
designer's decisions to the reader. On a corporate engineering brief they read as defensive.
They are also the cheapest words to cut, because none of them carries a fact, an evidence claim,
or a qualification.

### F7 — Section 02 and Section 03 restate each other

`Supervision — "Zero autonomous spend. Resource and backoff policy is persisted, so a restart
does not reset the limits."` (Software Factory notes) and `Supervisor — "Zero-spend policy and
persisted backoff, so resource limits outlive a restart."` (§03 rails) are the same sentence
twice. `Durability` / `Durable state` overlap similarly. The rationale claims the two sections
are "split by question"; at the level of the note text they are not.

### F8 — At an 880px viewport the page rendered a 560px column — **resolved (R7)**

`@media(max-width:880px)` set `.page{width:min(100% - 28px,560px)}`. `max-width` is inclusive,
so **at exactly 880px the recomposed narrow layout was served at a 560px measure**, leaving 320px
of empty field — 36% of the viewport, at the one width the brief cares about most and the width
§5 specifies production panels are authored from. This was verifiable from the CSS alone.

Fixed in R7 (§2): the clamp is now 720px, with `ch` measure caps added across the narrow band so
the wider column does not trade the empty field for over-long lines. The 880px *breakpoint* itself
is unchanged (§3). The fix is a source-level change; how the 720px column actually looks at 880px
still has no rendered evidence (§7).

---

## 2. Refinements applied, and the justification for each

### R1 — Raise the weak lower bound of contrast only

`--faint` retuned in both themes. `--ink`, `--muted`, `--flow`, `--authority`, all surfaces and
every other token are untouched.

| Token | Before | After | After: on `--sheet-2` | on `--sheet` | on `--bg` |
|---|---|---|---|---|---|
| dark `--faint` | `#69737F` | `#7A8492` *(superseded — R8, then R10)* | 4.52 : 1 | 4.79 : 1 | 5.16 : 1 |
| light `--faint` | `#79828A` | `#606870` *(superseded — R12)* | 5.03 : 1 | 5.51 : 1 | 4.54 : 1 |

All five previously-listed pairings now clear 4.5 : 1. Computed with the WCAG 2.x relative
luminance formula from the declared hex values; these are arithmetic results, not observations.
*(Corrected 2026-08-28: light `--faint` on `--sheet-2` was stated as 5.18 : 1. The correct figure
is **5.03 : 1** — still AA, and the conclusion is unchanged.)*

**The five pairings were the wrong set.** They are the *plain* surface tokens. Several of the
smallest annotations sit on `color-mix()` tints instead, which are lighter than the token they
mix into, and R1 never computed those. Codex's later picker pass caught it and the dark value was
retuned again — R8 below, and once more in R10 after a second sampling pass over the surfaces R8
left open. The light theme was assumed clean on the same wrong set of pairings; Codex's picker
later found a light tinted surface short as well, and R12 retunes it once, below.

**Accepted trade-off, stated explicitly:** the luminance gap between `--muted` and `--faint`
narrows (light mode most, from ~2.1× to ~1.2× relative luminance). Colour therefore does less
hierarchy work than before. This is deliberate: the hierarchy on this page is carried primarily
by size, weight, tracking and position, and buying a legible floor is worth spending a
distinction that was only legible on a good monitor anyway. The alternative — darkening
`--muted` to keep the gap — would have flattened the whole scale, which the brief forbids.

### R2 — Lift the type floor without touching the top of the scale

- **Mono floor 8px / 9px / 9.5px → 10px.** The 11px mono step is unchanged, as are every mono use
  already at 10px, the 11px layer names, case indices and `.sb-domain-items` spans, and every
  display size from 12.5px to the 76px hero. Net effect: the mono scale goes from five
  indistinguishable steps (8/9/9.5/10/11) to two real ones, 10px and 11px, under the display
  scale. *(Corrected 2026-08-28: there is no 10.5px mono declaration to leave unchanged — see F2.)*
- **Sans floor 10.5px / 11px → 11.5px** on `.sb-steps span`, `.sb-path li span`, `.sb-rails span`,
  `.sb-index em`. 11.5px, 12px, 12.5px, 13px, 13.5px and up are unchanged. *(Corrected 2026-08-28:
  `.sb-domain-items span` was listed here in error. It is mono 11px, not sans 11.5px, and it was
  not changed.)*
- **`.sb-spine-bar i`** (the I/A/S/D/P layer-span cells, previously 8px — the smallest type on
  the page) goes to 10px, with the cell growing 26×20 → 28×22px to keep the optical box.

Two columns were widened so the larger label text cannot introduce a new wrap, computed at a
0.6em mono advance plus the declared tracking:
- `.sb-brief-row` key column 104px → 120px (`APPLIED BREADTH` = 15ch ≈ 110px at 10px/.13em).
- `.sb-tier` first column 236px → 268px, and 190px → 220px in the ≤1080 band
  (`PLATFORM CONTEXT · WORKING AWARENESS` = 36ch ≈ 263px). *(Corrected 2026-08-28: `.sb-key`
  tracking is `.14em`, not the `.13em` used here, so the label is ≈266px. It clears 268px and
  does **not** clear 220px — Codex found it on two lines at 1080. Fixed in R9.)*

### R3 — Rebuild the JointLedger card's geometry

- The three notes move **out** of the ledger's left column and become a full-width three-column
  `dl` below it — the same treatment Software Factory already uses. This is what removes the
  dead right column (F3): the left column now carries only description + path chain, which is
  height-comparable to the boundary block beside it, and the notes read across instead of down.
  It also reinforces the locked "peer case studies" relationship by giving JointLedger the same
  note geometry as the flagship.
- The `Inherited, not authored` block becomes a **stacked label + four-item list**, one item per
  factual boundary, with a brass tick per item. **No boundary was removed and none was softened**
  — see the audit in §4. The change is from a 44-word run-on paragraph to four enumerated
  clauses (37 words); every limit that was asserted before is still asserted.
- Ledger split adjusted `1.25fr .75fr` → `1.15fr .85fr` to suit the new left-column content.

### R4 — Reduce visible prose, mostly by removing duplication

Approach was, in order: cut text that duplicates adjacent structure; cut text that narrates the
design; then tighten phrasing. No evidence, limitation, exclusion or qualification was deleted.

**Counting basis — corrected 2026-08-28.** This section originally reported hand-counted *running
prose*, on a selection that excluded headings, claims, mono labels and enumerations. That basis
was not reproducible and is superseded. The figures below are **full-article `innerText` words** —
every visible word inside each `<article class="sb-case">`, including titles, kind labels, layer
spans, claims, diagram items, note terms and boundary text. The baseline and first-pass columns
are the measured counts from Codex's browser QA pass
([`claude-independent-review-browser-qa.md`](claude-independent-review-browser-qa.md), which
reports the 736 → 643 figures); the correction-pass column applies the source-level word deltas
of the further cuts listed below.

| Article | Baseline | After first pass | After correction pass | Δ from baseline |
|---|---:|---:|---:|---:|
| Software Factory (flagship) | 198 | 184 | **167** | −15.7% |
| Spark | 137 | 122 | **116** | −15.3% |
| Built in Layers | 153 | 130 | 130 | −15.0% |
| JointLedger | 248 | 207 | 207 | −16.5% |
| **Four-article total** | **736** | **643** | **620** | **−15.8%** |

The QA document's "After" column (643) is correct for the file as it stood at that pass; the
correction pass took the same measure to 620. Prose outside the four articles — section heads,
the legend note, plan cells, the capability footnote — was also cut in R4, but is deliberately
not given a number here, because no reproducible `innerText` measure of those regions exists.

The largest single cuts, all of them duplication rather than content:
- **01 section head** restated the four column headers in prose, immediately above the columns.
  Rewritten to say something the heading and columns do not: that the plan is the coordinate
  system the four case studies are measured in — which is also what justifies the layer-span bar.
- **Legend note**: the badge-wall justification removed (F6).
- **Built in Layers description** restated its own three-step path chain.
- **JointLedger description** restated its own path chain *and* the `Runtime` note.
- **Spark description** restated its own claim line ("no network" / "connectivity loss is a
  normal condition"). It now carries only the architecture fact — the browser is the database.
- **Software Factory `Durability` note** re-listed the eight entities already drawn in the
  durable-domain band directly above it. It now points at the diagram instead.
- **Capability footnote**: "Listed once, in the right tier, at the right size." removed (F6).
- **Software Factory `Supervision`** tightened rather than the §03 `Supervisor` rail, so the
  governance section keeps the crisper of the two near-identical statements (F7).

In the first pass the flagship was cut least on purpose (−7.1%), because cutting it to hit a
page-wide percentage would have worked against the locked dominance requirement.

**Correction pass, 2026-08-28 — a further 23 visible words, all from Software Factory and Spark.**
By this point flagship dominance is carried typographically as well as spatially (R5), so the
flagship no longer needs to be the longest card to be the loudest one. Every cut is narrative
description; no evidence claim, exclusion, limitation or `Not claimed` line was touched.

- **Software Factory description** (−4): "…where planning, execution, verification, review, and
  release are separate responsibilities held by the domain — so a model that fails…" →
  "…holding planning, execution, verification, review, and release as separate domain
  responsibilities — a model that fails…". Same five separated responsibilities, same
  fails/stalls/overstates clause, same "held by the domain" architecture.
- **Durable-domain note** (−6): "Written in TypeScript. Outlives every process that touches it."
  → "Written in TypeScript." The durability claim is not lost — it is the `Durability` note four
  rows below, unchanged: *"Workers, processes, and sessions are disposable. The domain above them
  is not."*
- **Worker-band note** (−4): "Workspace-scoped, default-deny environment. Replaceable without
  touching the domain." → "Workspace-scoped, default-deny environment. Replaceable." The
  environment boundary is verbatim; *without touching the domain* is what the provider-neutral
  port band directly above already states (*"the domain does not know which vendor answers"*).
- **`Fail-closed parsing` note** (−3): "Ambiguous output grants nothing; it never defaults to
  pass." → "Ambiguous output never defaults to pass." Two phrasings of one fail-closed rule; the
  stronger one is kept.
- **Spark `Persistence` note** (−4): "Compound indexes exist because real queries run against
  them." → "Compound indexes serve real queries." The claim — compound indexes exist to serve
  real queries, not as decoration — is intact.
- **Spark path chain and `Recovery` note** (−2): "Feature views and transactional actions" →
  "Feature views, transactional actions"; "A service worker caches the shell" → "Service worker
  caches the shell". Function words only.

Spark's `Not claimed` note, Software Factory's `Not claimed` block, both claim lines, both layer
spans and every `Supervision` / `AI boundary` statement are byte-for-byte unchanged.

### R5 — Make flagship dominance typographic as well as spatial

- `.sb-case--flagship` added to the Software Factory article only: title 26px → 31px, claim
  clamp `17–21px` → `19–24px`, card padding `28/30` → `32/34`.
- The three peers are normalised to a **single** smaller title size: Spark, Built in Layers and
  JointLedger are all 24px (previously 26 / 26 / 23). Resulting scale **31 / 24 / 24 / 24** —
  one flagship, three peers, exactly as locked.
- Mirrored in the ≤880px band (flagship 27px, peers 23px).

No logo, mark or plate size changed anywhere. The six-mark, four-size legend
(164 / 118 / 96 / 76px desktop, 118 / 92 / 78 / 66px narrow) is byte-for-byte untouched — see §3.

### R6 — Label the theme controls as a preview harness in the prototype itself

The prototype bar span now reads `System Brief / refined · preview harness`, and a source comment
above it states that ALL / DARK / LIGHT are preview-only and must not be carried into the README.
The production strategy is recorded in §5 and in the rationale.

### R7 — Widen the narrow clamp to 720px and cap the measure explicitly (F8)

This reverses an earlier decision in this same pass to document F8 rather than fix it. That
decision rested on one premise — that a wider clamp would push `.sb-cell`, `.sb-head p` and the
note bodies to ~95 characters per line because the narrow band has no `ch` measure caps. The
premise was correct; the conclusion was not, because the missing caps are themselves addable.
Adding them is a smaller, more inspectable change than leaving 36% of the target viewport empty.

- **`.page{width:min(100% - 28px,560px)}` → `min(100% - 28px,720px)`.** At 880px the column goes
  560 → 720px, leaving ~9% of field a side, which reads as a document margin rather than as
  breakage. **At 390px nothing changes**: `min()` still resolves to the `100% - 28px` term, so the
  mobile measure is the same 362px assessed in §6.
- **`ch` measure caps added across the narrow band**, so the wider column buys width for structure
  and not for line length: `max-width:62ch` on `.sb-notes dd`, `.sb-bound span`, `.sb-bound-list`,
  `.sb-plan-foot p`, `.sb-rails span`, `.sb-gate p`, `.sb-repair p`, `.sb-position p`,
  `.sb-tier-list`, `.sb-domain-note`, `.sb-path li span`, `.sb-steps span`; and `.sb-head p`
  relaxed from its desktop `46ch` to `56ch`, which is too tight for a 720px column but still
  inert at 390px where the column is only ~44ch. Bordered or filled containers (`.sb-cell`,
  `.sb-legend-note`, `.sb-familiar`) are deliberately left uncapped — capping those would shorten
  their own rules and edges, and their longest content already lands under 95 characters.
  `.sb-lede`, `.sb-desc` and `.sb-close h2` keep the `ch` caps they already declare on desktop.
- **`.sb-case--bounded .sb-claim{max-width:none}` added to the narrow band.** The desktop
  `.sb-case--bounded .sb-claim` rule out-specifies the band's `.sb-claim{max-width:none}`, so
  without this override JointLedger's claim alone would stop short of the wider column while the
  other three claims ran full width. This mirrors the override the flagship already has.
- **`.sb-legend-bar` gained `flex-wrap:wrap`.** Its two keys measure ~302px together at the R2
  10px mono floor against 322px of content box at 390px — under 20px of slack, and the page's only
  credible horizontal-overflow risk after R2. It now wraps instead of overflowing.

The 880px breakpoint itself was not moved; only the clamp inside it (§3). Everything here is a
source-level change reasoned from declared values — see §7 for what a browser still has to settle.

### R8 — Finish the contrast fix on the `color-mix()` surfaces (dark only)

*(Superseded by R10, which moves dark `--faint` one step further to `#858F9D`. R8 is kept as
written because it records the reasoning — and the deliberate stopping point — that R10 revisits.
Every `#7F8997` figure below is the value R8 shipped, not the value in the file now.)*

R1 computed `--faint` against the plain surface tokens. It should have computed it against the
surfaces the small text actually sits on, two of which are tints: `.sb-layer span` on
`[data-emphasis=core] .sb-layer` (`color-mix(in srgb, var(--flow) 7%, var(--sheet))`) and
`.sb-domain-note` on `.sb-domain-durable` (`color-mix(in srgb, var(--flow) 8%, var(--sheet))`).
Both are lighter than `--sheet`, and both failed AA after R1.

Dark `--faint` `#7A8492` → **`#7F8997`** — each channel +5, so the hue is identical (215°) and the
move is a lightness step, not a recolour. No other token, and no light-theme value, was touched.

| Dark `--faint` pairing | `#7A8492` | `#7F8997` | Source |
|---|---:|---:|---|
| core layer tint, `color(srgb .10298 .126078 .158392)` | **4.32 : 1** | **4.62 : 1** | Codex, rendered picker |
| durable-domain tint, `color(srgb .107608 .131765 .165333)` | **4.25 : 1** | **4.54 : 1** | Codex, rendered picker |
| `--sheet-2` `#171C23` | 4.52 : 1 | 4.83 : 1 | computed |
| `--sheet` `#12161C` | 4.79 : 1 | 5.12 : 1 | computed |
| `--bg` `#0A0C10` | 5.16 : 1 | 5.53 : 1 | computed |

The two rendered rows are **Codex's readings from a colour picker against the rendered page**;
this review ran no browser and is not claiming to have observed them. The three computed rows are
arithmetic on declared values, as in R1. Codex's `#7A8492` core-layer reading of 4.32 : 1 matches
the same arithmetic applied to the mixed surface to two decimal places, which is why the computed
rows are quoted here without a second sampling pass.

**Two further tinted surfaces are still short, and neither is fixed here.** Both carry `--faint`,
neither was sampled, and both fall out of the same arithmetic:

- `.sb-row[data-emphasis=core] .sb-layer` **below 880px** restates the tint against the darker
  panel token — `color-mix(in srgb, var(--flow) 9%, var(--sheet-2))` — which is lighter than
  either sampled surface. `#7F8997` computes **~4.17 : 1** there.
- `.sb-steps li[data-actor=human]` — `color-mix(in srgb, var(--authority) 9%, var(--sheet))`,
  under the 10px `.sb-steps i` index. `#7F8997` computes **~4.39 : 1** there.

They are recorded as open in §7 item 9 rather than fixed, deliberately. Clearing both needs
`--faint` at roughly `#858F9D` or lighter — a visibly larger move that narrows the `--muted` ↔
`--faint` gap beyond what the R1 trade-off weighed, chosen on arithmetic against surfaces nobody
has put a picker on. The two surfaces that *were* sampled are the ones this pass acts on; the rest
of the set should be sampled and settled together, in a browser, rather than guessed at one
surface at a time.

The R1 trade-off is unchanged in kind and slightly larger in degree: dark `--faint` is now ~1.35×
`--muted` in relative luminance rather than ~1.46×.

### R9 — Hold the platform tier key on one line at 1080 (not a §1 finding; found in the render)

`PLATFORM CONTEXT · WORKING AWARENESS` is 36ch ≈ 266px at the 10px mono floor with `.sb-key`'s
`.14em` tracking. That clears the 268px desktop first column but not the 220px column the ≤1080
band declares, and Codex found it wrapping to two lines at 1080 while sitting on one at 1440.

The key is now **`Platform · working awareness`** — 27ch ≈ 200px, one line in both columns.

- **The qualification is kept, not the redundancy.** `Platform context` and `Platform` name the
  same tier; the second clause is the one that does calibration work, so *working awareness*
  stays. The shorter form is also the one that matches the other three keys, which are all
  `<tier> · <status>`: `Core · established`, `Applied · evidenced in public work`,
  `Current expansion · in progress` *(the latter two shortened again by R11)*.
- **The boundary is untouched.** `Not a production platform ownership claim` — the locked
  statement audited in §4 — is a separate element and was not edited.
- **Nothing was widened and no type shrank.** Both column widths (268px / 220px) are as R2 left
  them, the 10px mono floor holds, and no plate size, tier weight or capability ordering moved.

Noted, not changed: `APPLIED · EVIDENCED IN PUBLIC WORK` is 34ch ≈ 252px and therefore also
exceeds the 220px column at 1080. Codex reported only the platform key, §7 item 4 asked only about
the platform key, and a two-line key is not a defect on its own — the column is `align-items:start`
with the `h3` below it. It is listed in §7 as something to confirm, not fixed here. **R11 shortens
it.**

### R10 — Close the last two tinted `--faint` surfaces (dark only)

R8 fixed the two tinted surfaces Codex had sampled and left two short by computation, explicitly
declining to move `--faint` further on arithmetic against surfaces nobody had put a picker on.
Codex has since put a picker on them. `#858F9D` — the value R8 named as the level that would clear
them — was sampled and clears everywhere it was measured:

| Surface carrying `--faint` | `#858F9D` | Source |
|---|---:|---|
| ≤880 mobile core layer tint (`color-mix(flow 9%, --sheet-2)`) | **4.51 : 1** | Codex, rendered picker |
| human-authority step (`color-mix(authority 9%, --sheet)`) | **4.75 : 1** | Codex, rendered picker |
| durable-domain tint (`color-mix(flow 8%, --sheet)`) | **4.91 : 1** | Codex, rendered picker |

Dark `--faint` `#7F8997` → **`#858F9D`** — each channel +6, so the hue is again identical (215°)
and the move is a lightness step, not a recolour. No other token, and no light-theme value, was
touched; the light theme was never short on these surfaces by R1's arithmetic and is unchanged.

**Why this value and not a lighter one.** `#858F9D` is the *minimum* candidate Codex tested that
clears 4.5 : 1 on every surface sampled — the mobile core layer at 4.51 is the binding one, with
almost nothing to spare. Going lighter would buy margin the measurements do not ask for and spend
more of the `--muted` ↔ `--faint` distinction than the fix requires. R8's objection to `#858F9D`
was that it would have been chosen on arithmetic alone; it is now chosen on measurement, which is
what R8 said would be needed to justify it.

**The R1 trade-off, restated once more.** Dark `--faint` is now ~1.28× `--muted` in relative
luminance, down from ~1.35× after R8 and ~1.46× after R1. Colour continues to do less hierarchy
work in dark mode than it did originally; size, weight, tracking and position carry it, as R1
argued. This is the third and largest step in the same direction and it should be looked at in a
render — the annotation register is now closer to `--muted` than at any earlier revision.

**Not verified.** These are Codex's readings of the candidate colour against the pre-fix page. The
patched file has not been rendered, sampled or eyeballed by anyone. What is now closed is the
measurement question the surfaces raised, not the appearance of the result.

### R11 — Hold the remaining two capability keys on one line at 1080

R9 shortened the platform key and left the `APPLIED` key long, as §7 item 4 records. Both long
keys are now shortened, on the same rule R9 used — drop the redundant word, keep the clause that
does calibration work:

| Key | Before | After | ch | Width at 10px/.14em |
|---|---|---|---:|---:|
| applied | `Applied · evidenced in public work` | **`Applied · public evidence`** | 34 → 25 | ~252px → ~185px |
| expansion | `Current expansion · in progress` | **`Expansion · in progress`** | 31 → 23 | ~230px → ~170px |

Both now fit the 220px column the ≤1080 band declares, as do the two keys left alone —
`Core · established` (18ch ≈ 133px) and R9's `Platform · working awareness` (27ch ≈ 200px). All
four calibration keys are one line in both the 268px and 220px columns by this arithmetic.

- **Meaning is preserved, not softened.** *Evidenced in public work* → *public evidence* names the
  same standard: the tier is backed by work that can be looked at. *Current expansion* → *Expansion*
  drops a word the `· in progress` clause already carries; the tier is still marked as unfinished.
  No tier is promoted, and no capability moved between tiers.
- **The boundaries and marks are untouched.** `Shown in the cases above`,
  `K9s appears only as Kubernetes operational tooling`, `Not a production platform ownership
  claim`, `Primary identity` and the `Working familiarity, not claimed depth` block are separate
  elements and were not edited.
- **Nothing was widened and no type shrank.** Column widths (268px / 220px), the 10px mono floor,
  plate sizes, tier weights and capability ordering are all as R2/R9 left them.

The `ch` figures are arithmetic on declared values at a 0.6em mono advance, as everywhere else in
this document. The shortened keys have **not** been rendered — §7 item 4 stays open, now for the
`APPLIED` and `EXPANSION` forms as well as R9's platform form.

### R12 — Close the light-theme tinted `--faint` surface

R1 retuned light `--faint` against the plain surface tokens only and reported it clean; R8 and R10
then found and fixed the same gap in dark, but light's tinted surfaces were never sampled. Codex
has now put a picker on the light theme's ≤880px mobile-core `color-mix()` surface and found it
short:

| Surface carrying `--faint` | `#606870` | `#5E666E` | Source |
|---|---:|---:|---|
| ≤880 mobile core layer tint (`color-mix(flow 9%, --sheet-2)`) | **4.40 : 1** | **4.54 : 1** | Codex, rendered picker |
| light human-authority step (`color-mix(authority 9%, --sheet)`) | — | **5.00 : 1** | Codex, computed at candidate |
| light durable-domain tint (`color-mix(flow 8%, --sheet)`) | — | **5.03 : 1** | Codex, computed at candidate |

Light `--faint` `#606870` → **`#5E666E`** — a small same-direction lightness step, not a recolour.
No other token, and no dark-theme value, was touched.

**Why this value and not a lighter one.** `#5E666E` is the *minimum tested* candidate that clears
4.5 : 1 on the surface Codex sampled — the same minimum-correction rule R1, R8 and R10 applied in
dark. The other two light tinted surfaces were not short by the same margin (they compute at
5.00 and 5.03 at this value), so no further move was needed to close them.

**Not verified.** This is Codex's reading of the candidate colour against the pre-patch page, not
this review's. **The patched file has not been rendered by anyone.**

---

## 3. Rejected — considered and deliberately not changed

**Logo scale.** Reviewed against the locked constraint and against the ~880px target. The four
plate sizes are the page's clearest hierarchy device and the narrow band already re-scales them
(118 / 92 / 78 / 66px) while preserving order. I found no evidence that any mark is illegible or
mis-ranked, so the permitted "small, hierarchy-preserving size adjustment" was **not** exercised.
Nothing here needed enlarging; enlarging would have been spectacle.

**The 880px breakpoint itself (not the clamp inside it).** The recomposition breakpoint was
considered for lowering below 880 and left alone: the 6-column plan matrix cannot hold four
readable cells at a ~730px measure, so 880 remains the right place to switch from matrix to
per-layer cards. The clamp *inside* that band did move, from 560px to 720px — that is R7 (§2),
not a rejection.

**Removing the `.sb-index` strip.** Its four descriptors partly duplicate the four
`.sb-case-kind` labels below. Kept anyway: it is the only place the locked order appears as a
single scannable unit, and it is the ten-second read of section 02.

**`"The flagship."`** Two words of design narration by the F6 test, but it is also the plainest
statement of a locked requirement. Kept.

**`Scope — "Included as architecture proof…"` on Built in Layers.** Tightened, not removed. It
functions as a qualification, and qualifications are locked.

**Motion.** Not touched. The riser, both tokens, the 11s cycle, the `@media(prefers-reduced-motion
:reduce)` block and the `:root[data-motion=reduce]` harness hook are unchanged, and it remains the
only animation on the page.

**`.sb-mono` dead rule.** Declared, never used. Left in place; removing it is churn with no
reader-visible benefit and no bearing on any review target.

**`prototypes/shared/base.css` and `prototype.js`.** Out of the permitted file list, and not
edited. Note that `base.css` already carries `:root[data-motion=reduce] *{animation:none!important}`,
so the reduced-motion harness path has two independent implementations.

---

## 4. Factual boundary audit

Every truthfulness-bearing statement checked line by line against
`research/engineering-inventory.md` (§ "Explicit exclusions") and the locked requirements.

| Required boundary | Status | Where it lives after the edit |
|---|---|---|
| JointLedger is an unmerged / unreleased backend extension | **Preserved** | `Status` note: "Four commits ahead on a feature branch. Unmerged and unreleased." |
| …plus runtime integration | **Preserved** | `Runtime` note (Compose definitions, provisioned Postgres container, persistent volume) |
| No shared-book frontend | **Preserved** | Boundary item 2: "No shared-book frontend, no book selector." Also encoded in the layer span (`I` and `A` unfilled) and the spine text "Services → platform · no frontend" |
| No book selector | **Preserved** | Boundary item 2 (same clause) |
| Invitation work is schema-only | **Preserved** | Boundary item 3: "Invitations are schema and status infrastructure only." |
| Transactions remain original owner-scoped | **Preserved** | Boundary item 4: "Transactions carry a bookId, but reads and writes stay on the original owner-scoped path." |
| Upstream engine / Vue UI are not Hakan's work | **Preserved** | Boundary item 1: "Upstream accounting engine and Vue interface — not Hakan's work." |
| Software Factory: no GitHub/PR automation, n8n, server deployment, publishing, control-room UI | **Preserved, verbatim** | `Not claimed` block — not edited at all |
| Spark: no backend, login, cloud sync, automated test suite | **Preserved, verbatim** | `Not claimed` note |
| Kubernetes stays expansion; K9s only as its tooling | **Preserved, verbatim** | Tier 4 + its marker; no mark, no plan cell |
| Platform tier is not a production-ownership claim | **Preserved, verbatim** | `Not a production platform ownership claim` |
| "Working familiarity, not claimed depth" list | **Preserved** | Only the trailing self-narration sentence removed; the heading and the full technology list are intact |
| No fabricated metrics / telemetry / terminal output | **Still true** | The only numbers remain section indices, workflow step numbers, `v1 → v8`, and "four commits" |
| Exact application order | **Preserved** | Software Factory → Spark → Built in Layers → JointLedger, in both the index strip and the article sequence |
| Six marks, no additions | **Preserved** | React, TypeScript, Next.js, Node.js, PostgreSQL, Docker — six `<symbol>`s, six `.sb-anchor`s |

Three changes worth flagging explicitly, because each removes words that a careless reader could
mistake for content:

1. **Spark description.** `"…where the browser is the database, and losing connectivity is an
   ordinary Tuesday rather than an error state"` → `"…where the browser is the database."` The
   offline claim is not lost: it is the card's own claim line two rows above
   (*"It has to keep working with no account, no server, and no network"*), so the description was
   restating it. The colloquialism also sat oddly against the corporate register the direction
   requires.
2. **JointLedger `Status`.** `"Shown as work in progress, because that is what it is."` removed.
   The fact it qualified — unmerged, unreleased — is stated in the same note and is unchanged;
   only the commentary about the decision to state it went.
3. **Software Factory `Durability`.** `"Plans, runs, evidence, reviews, and approvals are not."` →
   `"The domain above them is not."` Those five items are eight items in the durable-domain band
   drawn immediately above (plans, revisions, work items, runs, verification evidence, reviews,
   approvals, release lineage). The note now points at the diagram instead of re-listing a
   subset of it — which is also more accurate than the subset was.

---

## 5. Theme strategy — harness now, `<picture>` in production

**Current state (prototype, correct as-is):** `prototypes/shared/prototype.js` reads `?theme=` and
`?motion=` from the query string and sets `data-theme` / `data-motion` on `<html>`. The
ALL / DARK / LIGHT links in `.prototype-bar` are anchors to `?theme=…`. This is a **preview
harness only** and is now labelled as such in the prototype. It is not a feature of the design.

**Production README requirement — no custom JavaScript at all.** GitHub strips `<script>` from
rendered Markdown and does not execute JS inside `<img>`-embedded SVG, so the theme switch must be
declarative:

```html
<picture>
  <source media="(prefers-color-scheme: dark)"  srcset="assets/generated/plan-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/generated/plan-light.svg">
  <img alt="Responsibility plan: five layers, each answering owns / contract / evidence / where AI participates."
       src="assets/generated/plan-dark.svg" width="880">
</picture>
```

Rules for that build:

- Two pre-rendered variants per panel; **no runtime theme resolution, no CSS custom properties
  relied on at rest, no CDN reference.** Every mark is inlined as a local path.
- The `<img>` `src` is the dark variant, which is what clients without `prefers-color-scheme`
  support fall back to.
- `#gh-dark-mode-only` / `#gh-light-mode-only` fragment suffixes remain available as a secondary
  fallback but should not be the primary mechanism.
- Reduced motion: the plan panel ships a `-static` twin referenced from a
  `media="(prefers-reduced-motion: reduce)"` source, ahead of the colour-scheme sources.
- Motion inside the shipped SVG must be SMIL (`<animate>`), not CSS `@keyframes` — the latter does
  not run in GitHub's `<img>` context.
- Author panels at **880 CSS px**, using this prototype's narrow composition as the source. After
  R7 that composition fills a 720px content column inside an 880px viewport, so the panels carry
  ~9% of margin a side rather than the 320px of dead field F8 identified. Do not author at 1220 and
  downscale: at 880/1220 the 10px mono floor lands at ~7.2px, which reintroduces exactly the defect
  F2 fixed.
- The four case constraints and the JointLedger boundary list should additionally exist as real
  Markdown beneath the images, so the substance survives with images disabled.

---

## 6. Responsive assessment at 1440 / 880 / 390

Sources are labelled per row. "Code" = read from the CSS. "Evidence" = read off a screenshot that
already existed in the repository, rendered from the **pre-edit** file.

### 1440px — desktop

- **Code.** `.page` = `min(1220px, 100% - 48px)` → 1220px content. Hero `1.12fr / .88fr` with a
  72px gutter; plan matrix `46px 206px repeat(4,1fr)` → ~241px per question column; legend
  `auto auto 1fr` with three dividers; tiers `268px 1fr auto` after R2.
- **Evidence (pre-edit).** `desktop-dark.png` / `desktop-light.png` confirm the intended read
  order: identity block → thesis headline → brief rows → section 01. Hierarchy holds; the hero
  headline is unambiguously the largest element and the name/role block resolves the ten-second
  question above it.
- **Evidence (pre-edit).** `desktop-dark-jointledger.png` confirms F3 — the empty right column —
  and confirms exact application order at the JointLedger position.
- **Post-edit at 1440 is code-reasoned, not observed.** The notes moving to a three-column band
  below the ledger, and the boundary block becoming a stacked list, are expected to bring the two
  ledger columns to comparable height. **This specific outcome needs a render to confirm.**

### 880px — the GitHub profile width

- **Code, and this is the headline fact.** `@media(max-width:880px)` matches *at* 880px, so this
  viewport is served the recomposed narrow layout. Before R7, `.page{width:min(100% - 28px,560px)}`
  rendered that layout at a **560px measure inside an 880px viewport**, with ~160px of field on
  each side (F8). After R7 the clamp is 720px → an 80px field a side, and the reading measure is
  held by the band's new `ch` caps rather than by the column width.
- **Code.** In that band the layout is genuinely recomposed, not scaled: the plan matrix becomes
  per-layer cards with `.sb-k` column keys restored (`display:none` above 880), the workflow track
  rotates from 7 columns to a vertical rail, `.sb-pair` and `.sb-ledger` collapse to one column,
  path chevrons rotate 45° → 135°, and the legend keeps four distinct plate sizes.
  **No column of the plan is dropped at any width** — verified by reading the mobile block.
- **Code.** After R2, the smallest text at this width is 10px mono (was 8px). Against the plain
  surface tokens `--faint` is comfortably clear after R10/R12, and every tinted surface Codex has
  sampled now measures ≥4.5:1 — including this band's core-layer tint
  (`color-mix(flow 9%, --sheet-2)`) at 4.51:1 dark and 4.54:1 light, the surfaces that were short
  after R8 and R1 respectively. This is the direct answer to review target 2. One `--faint`
  surface still carries no measurement at all: `.sb-tier[data-tier=core]` (dark; computed 4.69:1
  before R10, higher after) — §7 item 9.
- **No evidence existed at 880px when this review was written**, and none was produced for R7.
  Nothing about the appearance at 880px is asserted in this document beyond what the CSS states —
  including whether 720px is the right measure. *Post-review, 2026-08-28:* Codex has since
  rendered 880px dark and light and reports a 720px page with no horizontal overflow —
  [`claude-independent-review-browser-qa.md`](claude-independent-review-browser-qa.md),
  `evidence/claude-independent-review/github-880-*.png`. That is Codex's observation, not this
  review's.

### 390px — mobile

- **Code.** `.page` = `min(100% - 28px, 720px)` → 362px content; R7 changed only the clamp term,
  which does not bind here, so this figure is the same before and after. Hero headline
  `clamp(38px, 10vw, 50px)` → 39px at 390. `.sb-index` goes 2×2. `.sb-steps li` becomes
  `auto 1fr`. Plates 118 / 92 / 78 / 66px — the tier-1 plate at 118px against a 362px column is
  ~33% of the measure, so the React/TypeScript dominance survives the narrowing.
- **Evidence (pre-edit).** `mobile-light-jointledger.png` at 390px confirms: no horizontal
  overflow, correct card order, the layer span renders legibly, the two-clause kind label wraps
  cleanly, and the path chain stacks with working vertical chevrons. It also confirms F4 — the
  nine-line prose block — which R4 addresses.
- **Post-edit at 390 is code-reasoned.** The prose cut and the boundary list should shorten the
  card; the type-floor lift adds back a little height. Net height change is small and not asserted.

### Overflow risk introduced by R2 — checked arithmetically, not rendered

Every label raised from 9px to 10px was checked against its container at a 0.6em mono advance
(the widest in the declared stack) plus its declared tracking:

| Label | ch | Width at 10px/.13em | Container | Verdict |
|---|---|---|---|---|
| `WHERE AI PARTICIPATES` | 21 | ~153px | 213px (1220) / 177px (1080) | fits |
| `APPLIED BREADTH` | 15 | ~110px | 120px after widening | fits |
| `PLATFORM · WORKING AWARENESS` (was `PLATFORM CONTEXT · …`) | 27 (was 36) | ~200px (was ~266px) | 268px (1220) / 220px (1080) | fits both after R9; the 36ch form fitted 268 but wrapped at 220 |
| `APPLIED · PUBLIC EVIDENCE` (was `APPLIED · EVIDENCED IN PUBLIC WORK`) | 25 (was 34) | ~185px (was ~252px) | 268px (1220) / 220px (1080) | fits both after R11; the 34ch form fitted 268 but not 220 |
| `EXPANSION · IN PROGRESS` (was `CURRENT EXPANSION · …`) | 23 (was 31) | ~170px (was ~230px) | 268px (1220) / 220px (1080) | fits both after R11; the 31ch form fitted 268 but not 220 |
| `DETERMINISTIC EVIDENCE` | 22 | ~161px | ~231px rail cell | fits |
| `PROVIDER-NEUTRAL WORKER PORTS` | 29 | ~212px | full band | fits |
| `ARCHITECTURE-LED FRONTEND / CONTENT SYSTEM` | 42 | ~307px | ~563px pair card (1220) | fits; wraps ≤1080 as it already did at 9px |
| `INHERITED, NOT AUTHORED` | 23 | ~168px | full width after R3 | fits (previously wrapped in a 132px column) |

This is arithmetic on declared values, not measurement. Font-metric differences between Cascadia
Mono and the Consolas fallback are within the margins above, but this is exactly the class of
thing that should be confirmed in a browser.

*(Corrected 2026-08-28.* Two faults in this table, both on the tier row. The header says
`.13em`, but `.sb-key` declares `.14em`, so the 36ch label was ~266px rather than ~263px. More
importantly the "Container" column listed only the 1220px width; the ≤1080 band declares 220px,
which the label did not fit. Codex's render found it on two lines at 1080 and one at 1440 — the
browser confirmation this paragraph asked for, returning a failure. R9 shortens the label; the
row above is restated at both widths. One row was still incomplete by the same test:
`APPLIED · EVIDENCED IN PUBLIC WORK` at 34ch ≈ 252px, which clears 268px and not 220px. **R11
shortens it, and the expansion key with it**; both are now listed above. All four keys fit both
columns by this arithmetic, and none of the shortened forms has been rendered — §7 item 4.*)

---

## 7. Browser QA still recommended

**Browser QA is still required, and none of it was done in this pass.** No render was produced at
any point in this review, including after R7 — every claim above, R7's fix included, is
source-level reasoning. Each item below is listed because it cannot be settled from source.

> **Post-review status — 2026-08-28.** This list has since been worked by **Codex**, not by Claude:
> [`claude-independent-review-browser-qa.md`](claude-independent-review-browser-qa.md), evidence in
> `evidence/claude-independent-review/`. That pass reports PASS and settles **item 1** (880px dark
> and light: 720px page, balanced margins, no horizontal overflow) and **item 6** as far as
> overflow and the type floor go (1440 / 880 / 390, both themes, no horizontal overflow; minimum
> computed visible font size 10px). **Item 2** is addressed only qualitatively, in that pass's
> visual review of the JointLedger card. **Items 3, 4, 5, 7, 8 and 9** — one-line label fits,
> the `.sb-case--bounded` claim override, both reduced-motion paths, and sampled contrast against
> the `color-mix()` surfaces — are **not** reported on there and remain open. The renders also
> predate the correction pass's word cuts (§2, R4), which change text length only.
>
> **Final status — 2026-08-28.** Codex then worked **item 9** and the tier half of **item 4**, and
> both came back as failures rather than confirmations. Item 9: sampled dark `--faint` measured
> 4.32 : 1 on the core layer tint and 4.25 : 1 on the durable-domain tint — R1 had computed
> against the plain tokens only. Item 4: `PLATFORM CONTEXT · WORKING AWARENESS` rendered on two
> lines in the 220px column at 1080 and one line at 1440. **R8 and R9 (§2) fix both.** Those two
> readings are Codex's; this review still has not run a browser. The rest of item 4 (the
> `APPLIED` key), item 5, and **items 3, 7 and 8** remain open, and R8 and R9 have themselves not
> been re-rendered. Item 9 additionally now names one surface that is short by computation and was
> never sampled.
>
> **Micro-patch status — 2026-08-28.** Codex sampled the two surfaces R8 left short, plus the
> durable-domain tint, using the `#858F9D` candidate: **4.51 : 1** on the ≤880 core layer tint,
> **4.75 : 1** on the human-authority step, **4.91 : 1** on the durable-domain tint. **R10 (§2)**
> adopts that value; it is the minimum tested candidate clearing 4.5 everywhere sampled. **R11
> (§2)** shortens the two remaining long capability keys, finishing the tier half of item 4 by
> arithmetic. What that leaves open in item 9 is only what has never been measured:
> `.sb-tier[data-tier=core]` and the entire light theme. Items 3, 5, 7 and 8 are untouched by this
> patch. **Nothing in the patched file has been rendered** — R10 and R11 are quoted measurements
> and arithmetic, not observations of the current file.
>
> **Final token correction status — 2026-08-28.** Codex then sampled the light theme's ≤880
> mobile-core tint and found it short: **4.40 : 1** at `#606870`. `#5E666E` reads **4.54 : 1**
> there, and computes at **5.00 : 1** and **5.03 : 1** on the light human-authority step and
> durable-domain tint. **R12 (§2)** adopts that value. What is left open in item 9 is now only
> `.sb-tier[data-tier=core]` (dark, arithmetic-only). Items 3, 5, 7 and 8 remain untouched.
> **Nothing in the patched file has been rendered** — R12 is a quoted measurement, not an
> observation of the current file.

1. **880px viewport, dark and light — the priority item.** The one width the brief cares about
   most, and still the one with no evidence at any revision. Specifically: does R7's 720px column
   inside an 880px field read as a deliberate document measure? And do the new `ch` caps hold the
   body runs at a comfortable measure in that wider column, or do they now leave visible ragged
   gaps beside the uncapped bordered containers (`.sb-cell`, `.sb-legend-note`, `.sb-familiar`)?
   R7 is the change with the largest untested surface in this pass.
2. **1440px JointLedger card, dark and light.** Confirm R3 actually balances the two ledger
   columns and that the three-column note band does not crowd at ~373px per column.
3. **1440px Software Factory card.** Confirm the 31px title plus the widened `.sb-case-kind` at
   10px still sit on one line in the `1fr auto` head, and that flagship dominance now reads at a
   glance against the 24px peers.
4. **Capability tiers at 1220 and 1080.** *Half-settled, it failed, and the fix is now complete in
   source but unrendered.* Codex rendered `PLATFORM CONTEXT · WORKING AWARENESS` on **two lines**
   in the 220px column at 1080, one line at 1440. R9 shortened that key to
   `PLATFORM · WORKING AWARENESS` (27ch ≈ 200px); R11 then shortened the other two long keys to
   `APPLIED · PUBLIC EVIDENCE` (25ch ≈ 185px) and `EXPANSION · IN PROGRESS` (23ch ≈ 170px). All
   four keys fit 220px by arithmetic. **None of the three shortened forms has been rendered** —
   confirm all four on one line at 1080, and that the shorter keys have not left the tier heads
   looking under-set at 1440.
5. **Hero brief rows.** Confirm the 120px key column holds `APPLIED BREADTH` on one line.
6. **390px mobile, dark and light.** Confirm no new overflow from the 10px mono floor, and that
   the boundary list's brass ticks align at the reduced measure. Also confirm R7 is genuinely
   inert here — that `min()` resolves to the percentage term as reasoned, and that the `ch` caps
   never bind at a ~44ch column — and that `.sb-legend-bar` wraps cleanly rather than overflowing.
7. **JointLedger claim at ≤880px.** Confirm R7's `.sb-case--bounded .sb-claim{max-width:none}`
   override actually lands, so that claim runs to the same measure as the other three.
8. **Reduced motion.** Confirm both paths still park the tokens at their endpoints:
   OS-level `prefers-reduced-motion: reduce`, and the harness `?motion=reduce`.
9. **Contrast spot-check.** *Worked, and it failed.* The R1 figures were computed against the
   plain tokens, not sampled, and the `color-mix()` tinted rows were exactly where that broke:
   Codex's picker read dark `--faint` `#7A8492` at **4.32 : 1** on `[data-emphasis=core]
   .sb-layer` and **4.25 : 1** on `.sb-domain-durable`. R8 retunes it to `#7F8997`, which Codex
   reads at 4.62 and 4.54 there. A second Codex pass then sampled the two surfaces R8 had left
   short, on the `#858F9D` candidate R10 adopts: **4.51 : 1** on
   `.sb-row[data-emphasis=core] .sb-layer` below 880px (`color-mix(flow 9%, --sheet-2)`, the
   smallest text at the width the brief cares about most) and **4.75 : 1** on
   `.sb-steps li[data-actor=human]` (`color-mix(authority 9%, --sheet)`, carrying the 10px step
   index). The same pass read **4.91 : 1** on `.sb-domain-durable`. What is left:
   - `.sb-tier[data-tier=core]` (`color-mix(flow 6%, --sheet)`, carrying `.sb-mark`) computed
     4.69 : 1 at `#7F8997` and is higher at `#858F9D`. It is the one tinted `--faint` surface in
     dark that has never had a picker on it, and it clears by arithmetic only.
   - Light theme's ≤880 mobile-core tint was then sampled and read **4.40 : 1** at `#606870` —
     also short. `#5E666E` reads **4.54 : 1** there (R12), and the light human-authority step and
     durable-domain tint compute at **5.00 : 1** and **5.03 : 1** at that value. The remaining
     light tinted surfaces have not had a picker on them; those two figures are computed, not
     sampled.
   - **Nothing has been sampled on the patched file.** Every figure above is a reading of a
     candidate colour against an earlier revision. Re-sampling after R10/R12 is a confirmation
     step, not a formality: 4.51 : 1 on the dark mobile core layer and 4.54 : 1 on the light one
     are each close to the line.

   The honest summary of this item: of the six `color-mix()` surfaces that carry `--faint` across
   both themes, five are measured (four dark, one light) and pass at the R10/R12 values, and one
   (dark) clears by arithmetic alone — all of that on the pre-patch file. A picker pass over all
   six, on the file as it now stands, is what actually closes it.

---

## 8. Files changed

Exactly three files were written in this review.

| File | Change |
|---|---|
| `v5-exploration/research/claude-independent-review.md` | Created — this document |
| `v5-exploration/prototypes/system-brief-refined/index.html` | Edited — R1–R7 above |
| `v5-exploration/research/claude-design-rationale.md` | Edited — §2, §4, §6, §8 corrections + new §10; see below |

**Correction pass, 2026-08-28.** The same three files were edited again, and only those three:
`index.html` (the 23-word cut in §2, R4, plus a stale source comment that repeated the 10.5px
mono error), this document (the F2 / R1 / R2 fact corrections, the `innerText` counting basis, and
the post-review cross-links), and the rationale (§9 and §10, where those figures and the "no
rendered evidence" statement had gone stale). `claude-independent-review-browser-qa.md` and the
renders under `evidence/claude-independent-review/` are **Codex's work and were not edited** —
they are cited here, not authored here.

**Final correction pass, 2026-08-28.** The same three files again, and only those three:
`index.html` (R8's one-token `--faint` change and R9's tier-key wording, plus the two source
comments those make stale), this document (§1, §2 R1/R2 + new R8/R9, §6 and §7), and the rationale
(§2 colour table and §10). `claude-independent-review-browser-qa.md` is **Codex's document and was
not edited**; the two rendered measurements this pass acts on are quoted from Codex, and no
browser, shell command, network call or subagent was used here either. No prose count, layout,
plate or logo size, application order, claim, boundary, motion rule or other file changed.

**Micro-patch, 2026-08-28.** The same three files once more, and only those three: `index.html`
(R10's one-token `--faint` change, R11's two capability-key labels, and the `--faint` source
comment those make stale), this document (§1 header note and F1 lead-in, §2 R8 supersession banner
+ new R10/R11, §6 and §7), and the rationale (§2 colour table and §10). No browser, shell command,
network call or subagent was used; the three contrast readings are quoted from Codex.
`claude-independent-review-browser-qa.md` and the renders under `evidence/` are Codex's and were
not edited. Light-theme `--faint` `#606870` is unchanged, as are `Core · established` and R9's
`Platform · working awareness`. No other prose, word count, CSS rule, layout, logo, application
order, motion rule, claim or boundary statement changed.

**Final token correction, 2026-08-28.** The same three files once more, and only those three:
`index.html` (R12's one-token light `--faint` change and the source comment that made it stale),
this document (§1, §2 R1 supersession note + new R12, §6 and §7), and the rationale (§2 colour
table and §10). No browser, shell command, network call or subagent was used; the light-theme
contrast reading is quoted from Codex. `claude-independent-review-browser-qa.md` and the renders
under `evidence/` are Codex's and were not edited. Dark-theme `--faint` `#858F9D` is unchanged, as
is every other token, and none of R9's, R10's or R11's labels or values changed. No other prose,
word count, CSS rule, layout, logo, application order, motion rule, claim or boundary statement
changed.

Nothing else was created, edited, moved or deleted. No shell command was run, no browser or
network was used, no subagent was invoked. `README.md`, `main`, V4 artifacts, PR #6, production
assets, `prototypes/concept-a` … `concept-f`, `prototypes/shared/*`, `research/engineering-
inventory.md` and all git state (branch, index, stash, remotes) are untouched. Nothing was
committed, pushed, merged, published or productionized. The deliverable remains a design
prototype.

Rationale corrections were genuinely needed and are limited to statements the edits made
inaccurate:

- §2 "mono at 9–11px" → 10–11px, and the colour table gained the retuned `--faint` row.
- §4 / §6 described the JointLedger notes as living inside the ledger's left column.
- §8 did not state that the ALL / DARK / LIGHT harness must not ship.
- §9 recorded a browser-QA pass against a file that has since changed; it is now scoped to the
  pre-review revision, with the outstanding items pointing here.
- §10 was added to record this pass, including R7 (item 7) and the fact that no revision of the
  file has been rendered.
