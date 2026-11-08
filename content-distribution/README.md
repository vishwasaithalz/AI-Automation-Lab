# Vishwas Aithal | Omnichannel Draft Engine

**One verified story. Five platform-native drafts. Zero fake engagement.**

Dependency-free Python 3.10+ starter that converts a fact-checked technical update into distinct drafts for **X, Quora, Indie Hackers, Medium and DEV.to**. No platform logins, API calls, automated following, posting, scraping, or keys. Reuses the existing protected Quora Answer Studio editorial workflow without granting it a public-writing capability.

## Run

\`\`\`bash
cd content-distribution
python build.py example_story.json --output out
python -m unittest discover -s . -p 'test_*.py' -v
\`\`\`

Outputs in \`out/security-logon-events/\` have a \`manifest.json\` with \`NOT_PUBLISHED\` status. Quora output remains gated as \`needs_question\` until a real relevant question and verified URL are supplied. Do not invent Quora question identifiers.

| Platform | Original format | Publisher integration |
| --- | --- | --- |
| X | Short insight and source | Verified Buffer account, handled by a separate existing daily automation |
| Quora | Direct answer to verified question | Research/draft only, no approved official posting integration |
| Indie Hackers | Specific builder lesson and genuine question | Research/draft only, no verified writer integration |
| Medium | Editorial narrative | Review/import-ready; new API tokens not issued |
| DEV.to | Technical Markdown with \`published: false\`, optional canonical URL | Forem API exists; no authenticated publisher currently connected |

## Editorial controls

- Require two specific source-grounded facts and a secure source URL.
- Never fabricate metrics, credentials, case studies, question links, citations or publication receipts.
- Use one topic with **different formats**, not a duplicate pasted into each community.
- X scheduling lives in the existing verified Buffer workflow. The generator deliberately never publishes anything.
- Future DEV.to API integration must use secrets stored in a secure service, test first in draft mode, and write post URL/status receipts.
- Quora, Medium and Indie Hackers remain manual/weekly approval-ready unless an official supported authenticated publisher is verified.
- Keep private repository names, credentials, API tokens and unreleased work out of public output.
- No browser/CAPTCHA automation, reply/follow/vote bots or engagement manipulation.

The recurring tasks live in ChatGPT Automations, not GitHub Actions; this folder is a portable formatting and quality-gate component, not a production scheduler.
