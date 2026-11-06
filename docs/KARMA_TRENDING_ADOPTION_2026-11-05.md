# KARMA Safe Tool Adoption | 2026-11-05

Status: RESEARCH / REVIEW ONLY. This is a PUBLIC repository. No private journals, secrets, personal data, device backup paths, or chat transcripts belong here.

## Verified tools and intended roles

| GitHub repo | Workflow | Decision |
|---|---|---|
| Nutlope/hallmark | Website design, anti-generic UI lint and preview audit | Pilot in staging |
| cloudflare/security-audit-skill | Source-driven security audit | Pilot with read-only source access and isolated sandbox |
| heygen-com/hyperframes | HTML/CSS video and deterministic MP4 | Pilot licensed media and local preview |
| anthropics/knowledge-work-plugins | Productivity, sales, marketing and data workflow patterns | Adapt patterns; do not assume Claude compatibility elsewhere |
| thedotmack/claude-mem | Durable coding agent memory | Quarantine pending privacy/hook/cloud-sync evaluation |
| pbakaus/impeccable | Existing UI critique and design system | Pilot on one staging page |
| max-sixty/worktrunk | Parallel Git worktree development | Optional after local recovery |
| vercel-labs/agent-desktop | OS-level desktop control | Defer: sensitive permissions |
| debpalash/VoiceStudio | Voice production | Defer: resource/license/consent review |
| NationalSecurityAgency/ghidra | Reverse engineering learning | Separate authorized, isolated research lab |

README and repository existence checked through GitHub connector. Monthly-trending comparison is based on third-party snapshots as direct GitHub monthly trending access failed. Trending is not proof of safety. No dependency audit, controlled execution or security certification has been performed.

## Workstream mapping

1. Windows recovery: backup first; do not install or execute local agents until stable.
2. GitHub and Vercel: read-only inventory, checks, CI status, remediation suggestions.
3. KARMA Control Center: shared structured status schema; never expose private data to public site.
4. Build Journal and SEO: preserve private journal; visual/design audits on preview only.
5. Quora Desk: research, citations, drafts and manual review, no unsupervised posting.
6. NOSTALGIA.EXE: HyperFrames video prototypes and asset manifest, no automatic publishing.
7. Music: user-provided audio, caption assets, cover art, local review and licensed material.
8. Money Lab: offer research, mock ledger, no outreach or payment without approval.
9. Cybersecurity study: source reviews only on owned systems; no third-party scanning.
10. netmirror.fit: Cloudflare remains production, Vercel preview-only.

## Non-negotiable gates

- Review source, scripts, package lock, dependencies, permissions, security advisories and external egress before installing anything.
- Pin vetted commit SHA or release; record license, runtime cost, privacy handling and rollback steps.
- Execute third-party tools only in disposable, non-privileged sandbox with no production tokens and limited egress/resources.
- No automatic installs, global hooks, production deploys, merges, messages, publication, purchase, or deletion.
- Review public-facing copy and licensed images/audio, and treat model/tool output as untrusted input.
- Keep all existing scheduled jobs unmodified. New schedules require separate controlled setup.
- Candidate state flow: discovered > source-verified > reviewed > sandbox-tested > approved > enabled, or blocked.

## Implementation acceptance

- Mock-only defaults with zero credentials needed.
- Produce machine-readable records and human-readable reports.
- Report provenance, commit/version, license, scripts, privacy, CPU/RAM, risks and rollback.
- Never claim a real install/deploy or safety validation without evidence.
