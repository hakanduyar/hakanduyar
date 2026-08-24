# Codex CLI availability — measured 2026-08-23

```
$ codex --version
codex-cli 0.147.0
$ codex login status
Logged in using ChatGPT
$ codex exec -C C:\GitHub\hakanduyar --sandbox read-only "Reply with exactly: CODEX_READY."
ERROR: You've hit your usage limit. ... or try again at Sep 22nd, 2026 1:27 AM.
```

Fallbacks probed and unavailable:
- `OPENAI_API_KEY`: not set in environment; `auth.json` has `OPENAI_API_KEY: null`.
- Local providers (`codex --oss`): neither `ollama` nor `lms` installed.

Ruling: reviews run in fresh isolated reviewer contexts (no implementer
reasoning shared), consuming the same inputs a Codex reviewer would: the
ticket, the binding spec documents, the repository state, the diff, the
evidence bundle. Prompts are stored under `.ai/reviews/PROMPTS/` so the
identical reviews can be replayed under `codex exec` after 2026-09-22.
