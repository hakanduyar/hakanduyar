# EXTERNAL LINK VERIFICATION — 2026-08-23

| Destination | Method | Result | Ruling |
|---|---|---|---|
| https://github.com/hakanduyar | curl -L | 200 | INCLUDE |
| https://linkedin.com/in/hakanduyar | curl -L | 200 | INCLUDE |
| https://medium.com/@hakanduyar | curl -L, bot UA | 403 | inconclusive — Medium blocks bot UAs |
| https://medium.com/@hakanduyar | curl -L, browser UA | 200 | INCLUDE |
| https://medium.com/feed/@hakanduyar | curl RSS | 200, `<title>Stories by Hakan Duyar on Medium</title>` | CONFIRMS the Medium profile exists |
| mailto:iamhakanduyar@gmail.com | n/a (carried over from previous README, owner-published) | n/a | INCLUDE |

No portfolio/personal site: the GitHub `blog` field is empty and the `portfolio` repo is PRIVATE.
=> Do NOT publish a portfolio link. Four channels only: GitHub, LinkedIn, Medium, Email.
