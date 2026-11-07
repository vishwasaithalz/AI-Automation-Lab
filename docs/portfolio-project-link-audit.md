# Correct AI Studio portfolio project links

**Reference inspected:** https://vishwasaithal.ai.studio/ using a real GitHub Actions Chromium browser on 2026-11-07 UTC.

The live portfolio shows six projects. The six visible GitHub links use `github.com/vishwasaithal/...` (without the final **z** in the username). Public repository lookups for all six original links returned 404 on the inspection date. That may mean they are missing or inaccessible, not proof of private repository status.

## Verified replacement links

| Portfolio card | Live demo | Actual public GitHub source |
|---|---|---|
| SentinelPulse | https://karma-sentinelpulse.vercel.app/ | https://github.com/vishwasaithalz/AI-Automation-Lab/tree/main/projects/SentinelPulse |
| SERPMatrix | https://karma-serpmatrix.vercel.app/ | https://github.com/vishwasaithalz/AI-Automation-Lab/tree/main/projects/SERPMatrix |
| CloudHardener | https://karma-cloudhardener.vercel.app/ | https://github.com/vishwasaithalz/AI-Automation-Lab/tree/main/projects/CloudHardener |
| ApexVitals | https://karma-apexvitals.vercel.app/ | https://github.com/vishwasaithalz/AI-Automation-Lab/tree/main/projects/ApexVitals |
| ZeroAuth | https://karma-zeroauth.vercel.app/ | https://github.com/vishwasaithalz/AI-Automation-Lab/tree/main/projects/ZeroAuth |
| Spectra UI | https://karma-spectra-ui.vercel.app/ | https://github.com/vishwasaithalz/AI-Automation-Lab/tree/main/projects/SpectraUI |

**Important:** These six sources currently reside within one public GitHub monorepo. Do not link to individual repository URLs under `vishwasaithalz/<Project>` until those repositories exist and have been verified.

## Portfolio reference captured for visual direction

The live site title reads "Vishwas Aithal: Cybersecurity Specialist, Web Designer & Technical SEO Strategist". Its main navigation includes Overview, About, Skills, Projects, Tools, Blog, Timeline and Contact. The Projects section is titled "Featured Software Projects & Hardened Security Systems" and includes all six above project cards.

Observed computed styles: near-black body background `rgb(7, 9, 14)`, text `rgb(241, 245, 249)`, Plus Jakarta Sans as the body and hero font, with a 60px hero headline at desktop width. The visible page uses electric teal/cyan accents, sharp dashboard panels, and dense security-console layouts. Treat these as *design reference points*, not a copy of proprietary page source.

## Content accuracy recommendations

Project descriptions on the reference page contain claims such as zero overhead, zero CLS, high throughput and enterprise compliance. The public implementations are working educational prototypes, not measured production implementations of those claims. Keep future targets visibly separate from features demonstrated by code and tests.

## What was not changed

The AI Studio site has not been edited. Its six outbound project GitHub links still need to be replaced in its original project editor or source. No Vercel domains or Git integrations were altered by this audit.

## Verification

- [Real Chromium 14-test suite and captured reference](https://github.com/vishwasaithalz/AI-Automation-Lab/actions/workflows/karma-browser-e2e.yml)
- [Public live-site HTTP verification](https://github.com/vishwasaithalz/AI-Automation-Lab/actions/workflows/karma-live-endpoints.yml)
