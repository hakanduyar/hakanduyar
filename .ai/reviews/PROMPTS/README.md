# Review harness

`independent-review.workflow.js` is the exact orchestration used for the
independent review round: six isolated reviewer contexts (visual design,
GitHub compatibility, accessibility+language, code/architecture, data honesty,
security/hygiene), each blind to the implementer's reasoning, followed by two
adversarial verifiers per critical/major finding.

To replay any single dimension under Codex when its quota returns
(after 2026-09-22), extract the corresponding prompt string from the
DIMENSIONS array and run:

    codex exec -C C:\GitHub\hakanduyar --sandbox read-only "<prompt text>"

The prompts are self-contained: they name the binding documents, the evidence
directory, the allowed read-only commands and the required verdict format.
