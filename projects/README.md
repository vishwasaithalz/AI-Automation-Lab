# KARMA.EXE LAB · Six engineering workbenches

Six separately deployed web applications, supported by working code, automated tests, and reproducible prototypes. The original enterprise specifications are engineering goals, not measured or certified achievements.

## New tested source capabilities

The six labs now include **opt-in source-level enhancements**. Existing demos, their Git-connected Vercel roots and default behavior are unchanged. These functions require local execution or an additional UI release before they appear on the live sites.

| Workbench | New original function |
| :-- | :-- |
| SentinelPulse | `inspect_batch` for bounded offline event summaries |
| SERPMatrix | `audit_extended` for page structure and image alt review |
| CloudHardener | `inspect_advanced` for additional manifest risk signals |
| ApexVitals | `transfer_budget` for deterministic local gzip estimates |
| ZeroAuth | `assessCounter` and an optional signature-review counter check |
| Spectra UI | `paletteAudit` for bounded token palette contrast comparisons |

[Open the GitHub Reference Atlas](REFERENCE_ATLAS.md) for 30 selected public references, their scope and future engineering gates.

## Live apps

| Workbench | Live app | Working functions | Planned, unverified |
|---|---|---|---|
| **SentinelPulse** | [Open security lab](https://karma-sentinelpulse.vercel.app/) | Fixed L7 signature checks, local sliding-window rate limit simulator, CSP nonce generator | Redis-cluster atomic rate limiting, Wasm filters, TLS edge policies, 60fps WebGL visualization, latency benchmarks |
| **SERPMatrix** | [Open SEO lab](https://karma-serpmatrix.vercel.app/) | Local HTML meta/schema checks, XML sitemap generator | Entity graphs, large-scale crawler, SSR cache warming, measured CWV |
| **CloudHardener** | [Open infrastructure lab](https://karma-cloudhardener.vercel.app/) | Read-only Kubernetes JSON security policy checks | CIS-complete cluster audit, drift detection, signed audit trail |
| **ApexVitals** | [Open performance lab](https://karma-apexvitals.vercel.app/) | Route glyph analysis, image dimension checks, responsive candidate planning, real local gzip generation | AVIF encoding, genuine font subsets, global LCP improvements |
| **ZeroAuth** | [Open passkey lab](https://karma-zeroauth.vercel.app/) | Real browser WebAuthn register/get ceremonies and client-side ES256 signature verification | Secure server-side account binding, sessions, attestation trust, recovery |
| **Spectra UI** | [Open UI lab](https://karma-spectra-ui.vercel.app/) | WCAG 2.x contrast calculator, keyboard tabs, modal, sortable table, responsive components | WCAG AAA certification, complete assistive-technology audit, npm package |

## Source and tests

Each project has an independent source directory with its own README:
- [SentinelPulse](SentinelPulse/)
- [SERPMatrix](SERPMatrix/)
- [CloudHardener](CloudHardener/)
- [ApexVitals](ApexVitals/)
- [ZeroAuth](ZeroAuth/)
- [Spectra UI](SpectraUI/)

Test the Python prototypes with:

    python -m unittest discover -s projects/SentinelPulse -v
    python -m unittest discover -s projects/SERPMatrix -v
    python -m unittest discover -s projects/CloudHardener -v
    python -m unittest discover -s projects/ApexVitals -v

Test the two JavaScript projects with:

    node --test tests/zeroauth.test.mjs tests/spectra.test.mjs
    node --test tests/karma-remaining-web-smoke.test.mjs

The repository-level npm test workflow covers all Node tests. The GitHub Actions live-endpoints workflow checks HTTP 200, page identity and required assets of all six Vercel production deployments.

## Project boundaries

These six projects currently share the public AI-Automation-Lab repository. They use **six separate Git-connected Vercel projects** and root directories. They are **not six standalone GitHub repositories**, and are not production security services.

Do not use these educational demos as actual intrusion prevention, authentication enforcement, cloud vulnerability attestation, or verified performance guarantees. Benchmark and certify independently before marketing quantitative claims.
