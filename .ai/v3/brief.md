# V3 brief — motion pass on top of accepted V2

V2 (branch feat/profile-v2-integrated-visual, merged into this branch's base)
already solved: information architecture, content reduction, project selection,
telemetry semantics, compact README, panel structure, data pipeline, CI,
deterministic renderer, light/dark handling, validation, tests. DO NOT reopen
any of that. This is a narrow visual/motion pass only.

## The complaint
V2 is fully static by construction (Canvas has no animation register, checkSvg
rejects any keyframe/animation/transition/SMIL/motion-query). That decision is
reversed for this pass. The profile needs visible, tasteful motion.

## Target character
An original blend — not a copy of any copyrighted UI:
- Person-of-Interest-like machine observation: tracked entities, relationships
  between nodes, observation geometry, acquisition/classification/confidence,
  signal paths, monitored systems. NOT just monospace+grid+green lines.
- JARVIS-like precision instrumentation: elegant restrained movement, layered
  diagnostics, active technical feedback, timed micro-animation, system
  coherence. NOT Marvel UI assets or fan art.
- Motion is: controlled, technical, subtle, visible, premium, intentional.
  NOT: large, flashy, chaotic, game-like, cyberpunk-noisy.

## Hard constraints (non-negotiable)
- HAKAN DUYAR remains the dominant hero element. No giant animated HUD, no
  boot sequence, graphics never overpower the name.
- The README stays an integrated visual composition: panels ARE the page.
  No image/paragraph/image/paragraph. Markdown prose outside panels stays
  minimal (currently: strapline, channels link line, provenance — 3 lines).
- No JavaScript execution inside the README. Motion must work through
  GitHub-compatible generated image assets only (animated SVG via <img>, or
  another GitHub-compatible animated format already provable in this repo's
  validation harness).
- Critical information must never depend only on motion — a reader who sees
  one frame must still get the information.
- Payload: V2 is 295 KB against a 400 KB budget. Revisit the budget only if
  truly necessary, document the measured tradeoff, and do not produce
  multi-megabyte assets.
- Reuse existing renderer components (Canvas, tokens, panel chrome, type
  system, telemetry) wherever possible. Do not rewrite the content pipeline.

## Suggested (not mandatory) motion distribution
- identity: subtle — tracking-line acquisition, tiny brackets, scan pass,
  signal pulse, low-amplitude background movement. Name stays dominant.
- focus: mostly static or extremely subtle.
- selected systems (4 plates): animate the system/network relationship, not
  the text — node pulse, tiny travelling signal, bracket/status activation.
- signal panel: moving trace / scan pass / small data-state movement.
- channels: mostly static, maybe a tiny connection pulse.

## Your task right now
Do NOT start rebuilding code. Inspect the actual current tree (this branch,
which is V2's accepted state) and write ONE concise implementation delta to
.ai/v3/plan.md. Make one strong decision — no multi-option exploration. Cover:
- which panels stay static vs. become animated, and why
- the specific motion each animated panel gets
- how POI character and JARVIS character are achieved concretely (not just
  asserted)
- how GitHub-compatible animation will actually work technically (recall this
  repo's own docs/github-platform-constraints.md findings about
  prefers-reduced-motion misfiring inside SVG-as-image — you may need a
  reduced-motion static fallback strategy similar to what V1 had before V2
  removed it, OR a different GitHub-compatible technique — decide and justify)
- which existing renderer/token/canvas code is reused vs. what must be added
  (e.g. Canvas's animation register was deleted in V2 — decide whether to
  restore a constrained version of it)
- payload estimate and validation/test implications
- a short numbered list of concrete work units (3-5 max) for the
  implementation pass that follows

Write ONLY .ai/v3/plan.md. Do not edit any other file in this pass.
