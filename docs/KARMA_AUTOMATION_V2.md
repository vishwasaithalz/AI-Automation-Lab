# KARMA.EXE Automation V2 | Review Branch

Date: 2026-11-14. Status: **staged, not activated**.
The configuration in `config/karma-automation-v2.json` is the selection and safety source of truth. A passing GitHub Actions run verifies this policy file only, **not** that third-party tools are installed, users have approved content, or production features work.

## Keep existing execution ownership

| Component | Job | Change policy |
| --- | --- | --- |
| GitHub Actions | Read-only PR checks | Add only a manual/PR review gate; no new cron |
| ChatGPT Automations | The four active owner routines | Preserve their existing settings and schedules |
| Buffer | Three existing social channels | No new slot, queue, publication or deletion by this repo |
| Node-RED | Recommended optional visual flow builder (Apache-2.0) | Not installed; use on trusted local Windows PC after reviewing packages |
| Google AI Studio / Vercel | Current owner-controlled projects | Deploy only after tests and explicit owner permission |
| Private journal | Provenance and date-stamped receipts | Never invent history or claim an action occurred without evidence |

## Winner / alternative decisions

- **Design:** Hallmark designs distinct pages. Impeccable audits UI deterministically. Taste Skill is an optional alternative. Do not run three conflicting global design skills.
- **Code review:** Alibaba Open Code Review for optional LLM-assisted review after token/model costs are approved; reviewdog (MIT) is a lighter alternative. Retain current tests and GitHub gates regardless.
- **SEO:** Lighthouse CI (Apache-2.0) for reproducible performance budgets and technical checks; Claude SEO only if a supported Claude environment and budget exist.
- **Media:** FFmpeg + Kdenlive for source edits; Whisper.cpp for local transcription assistance, with manual word-level correction. Video Shotcraft is conditional because it depends on separately licensed Remotion. Motion Canvas (MIT) is the OSI-open-source code-animation fallback.
- **Voice:** Keep original KARMA.EXE rap audio and lyrics unchanged. VoiceStudio is optional for consented supplementary audio only. AGPL obligations and CPU/RAM constraints require a separate review.
- **Social:** Buffer remains the single publisher. MoneyPrinterTurbo/FunClip may prepare assets offline. `automate-faceless-content` is reference material and has no detected root license.
- **Career:** First Contributions teaches a valid workflow; do real upstream issue work, not synthetic contribution spam.
- **Reverse engineering:** REA is optional only for software, assets and devices the owner is authorized to inspect. Not an unattended scanner.

## Workstream sequence and exit criteria

1. **Inventory and permissions:** identify owners, secrets, scheduled tasks, repo permissions, costs, and licenses. Save the result without copying tokens or private data into public Git.
2. **Quality gates:** test existing projects, check actual HTTP/render behavior, run static lint and optional human/agent code review, record reproducible failures. Do not automatically merge.
3. **Website and SEO:** fix only on a review branch. Check source, responsive layouts, accurate metadata, sitemap/robots, provider links, accessibility and performance. Compare changes before deploying.
4. **Music and video:** preserve approved audio/lyrics, verify source/watermark-free video, produce edited masters, synchronize words, validate 1080p/4K playback, checksum the archive. No publication or countdown.
5. **Content and social:** source -> original content -> media -> factual/rights/quality review -> explicit approval -> existing Buffer queue. Do not create a separate scheduler.
6. **Private journal:** write actual change receipts including source URL, commit, build status, timezone-stamped date, screenshot/archive evidence where possible. Record unverified work as unverified.
7. **Career/learning and Money Lab:** human-quality contribution or deliverable first, then optional scheduled preparation after approval.
8. **KARMA OS/EVA:** local-first setup only after Windows readiness and component-specific consent.

Every workflow requires an artifact or receipt before it can be called complete.

## Safe Windows verification

From PowerShell 7, choose your correct Downloads location, not Desktop:

```powershell
$downloads = if (Test-Path "C:\Users\vishw\Downloads") { "C:\Users\vishw\Downloads" } else { Join-Path $env:USERPROFILE "Downloads" }
Set-Location $downloads
git clone --branch review/karma-automation-v2-20261114 --single-branch https://github.com/vishwasaithalz/AI-Automation-Lab.git AI-Automation-Lab-V2-Review
Set-Location "$downloads\AI-Automation-Lab-V2-Review"
node --test tests/karma-automation-audit.test.mjs
node src/karma-automation-audit.mjs --out "$downloads\karma-automation-v2-audit.json"
```

No install script for the eleven third-party repositories is run by the review workflow. Do not use `irm URL | iex` or blindly run arbitrary npm package install hooks. When ready, install reviewed agent skills project-locally, pin versions/commits, test them in an isolated project, and record rollback paths.

## License guardrails

- No license detected means **no assumed permission to redistribute code**.
- The Anthropic Skills collection may have different licenses for individual skills; inspect each skill and asset.
- The VoiceStudio app is AGPL-3.0; check obligations and model weights separately.
- The Video Shotcraft repo is Apache-2.0, while its Remotion dependency is separately licensed and not OSI open source.
- n8n is source-available under its Sustainable Use License. Node-RED (Apache-2.0) and Activepieces MIT core are open-source alternatives.
- Repository stars measure popularity and do not substitute for maintainer, dependency, package-script, privacy and security audits.

## Activation checklist

- [ ] Review upstream pinned refs and install scripts for every selected tool
- [ ] Verify user device disk/RAM and browser requirements
- [ ] Establish local Node-RED backup/restore, secrets and network limitations
- [ ] Run standalone project smoke tests and snapshot comparison
- [ ] Review all social queue entries and approvals
- [ ] Verify media master checksums and word sync
- [ ] Set up PR-based QA without additional timers
- [ ] Explicitly approve the exact tool installations and external actions
- [ ] Re-run tests and record receipts

## Earlier morning repositories, reconciled

The user also supplied earlier candidates called OpenSEO, MoneyPrinterTurbo, DramaClaw, FunClip, Abogen, Stickman Video Director, MangoDisk, LinkedIn Skills, Easel, n8n and MakeMoneyWithAI. The exact owners of the less-distinct repository names were not preserved alongside this review. Keep these **identity-unverified** rather than guessing a source and installing the wrong project. MoneyPrinterTurbo, FunClip, Abogen and n8n have plausible public matches recorded in the registry but are still not installed. This expands the prior 75-repo video/music catalog; it does not turn that entire catalog into mandatory dependencies.

## Optional Windows bootstrap

For a one-file local preflight, download the branch's reviewed `scripts/KARMA-Automation-V2-Setup.ps1` to Downloads and inspect it before execution. It clones only the review branch, runs the six Node policy tests and writes a JSON receipt to Downloads. Use `-InstallNodeRed` only after reviewing the pinned Node-RED 5.0.9 package and typing the explicit confirmation token. That optional install is local to Downloads, loopback-only and does **not** create a Windows service, browser automation or publishing flow.

```powershell
$downloads = if (Test-Path 'C:\Users\vishw\Downloads') { 'C:\Users\vishw\Downloads' } else { Join-Path $env:USERPROFILE 'Downloads' }
$scriptPath = Join-Path $downloads 'KARMA-Automation-V2-Setup.ps1'
Invoke-WebRequest 'https://raw.githubusercontent.com/vishwasaithalz/AI-Automation-Lab/review/karma-automation-v2-20261114/scripts/KARMA-Automation-V2-Setup.ps1' -OutFile $scriptPath
Get-Content $scriptPath
& $scriptPath
# After reviewing the package and accepting local installation:
# & $scriptPath -InstallNodeRed
```

**Laptop reality:** A Windows i5 with 8 GB RAM and integrated graphics can run metadata review, Node scripts, local Node-RED and moderate FFmpeg work. Large AI video models and multi-agent GPU workflows should be deferred or run on explicitly approved remote hardware. Never assume free cloud rendering is unlimited.

## First real Node-RED flow: manual NetMirror endpoint preflight

`automation/node-red/netmirror-readonly-check.json` contains three buttons, each performing only a public GET request:
- Production `robots.txt`
- Production `sitemap.xml`
- AI Studio preview `robots.txt`

The receipt appears in Node-RED's Debug sidebar with time, URL, HTTP status and pass/fail. The flow does not publish, merge, deploy, store credentials, alter an online service or run on a timer. The Windows bootstrap installs this flow only when a new local Node-RED runtime is explicitly installed, and never overwrites pre-existing flows.

This is a real **manual quality check**, not proof that streaming-provider data, sitemap coverage or site rendering are accurate. Continue using the already existing CI endpoint checks and full browser reviews for those.
