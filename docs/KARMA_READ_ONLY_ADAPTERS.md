# KARMA read-only adapters (PR #3)

Two adapters now perform **real, opt-in GET requests**. No scheduler, mutation, deployment, publishing, installation or secret injection.

Run with Node 22+:

```sh
npm test
node src/read-only-audit.mjs website-seo https://example.com/
node src/read-only-audit.mjs github-ci vishwasaithalz/AI-Automation-Lab
```

**Website:** HTTPS origin only; exact host approval; public DNS validation; HTTPS requests pinned to the validated IP; no redirects; 512 KB response cap; 8-second timeout. Reads homepage, robots.txt and sitemap.xml; reports basic metadata. It does not render JavaScript, follow links or claim a complete SEO audit. DNS-based protection is defense-in-depth, not a full network sandbox.

**GitHub CI:** unauthenticated public repository only; exact repo approval; reads repository metadata, last ten workflow runs and workflow filenames from api.github.com. No token or private repository access. GitHub rate limits may apply.

**Tests:** deterministic fake HTTP and DNS injections; GitHub Actions existing `Tests` workflow runs `npm test` on pull requests. The new `KARMA Engine Mock Review` workflow remains manual-only and branch-only. Do not merge it merely to dispatch it.

**Approvals:** both draft PRs stay open. No live scans run automatically. Do not provide credentials, private content or internal domains. Explicitly select the public URL or repository when running an audit.
