# KARMA: four independent technical prototypes

Each project has a standalone README, runnable standard-library Python demonstration, unit tests and an honest implemented-versus-planned scope.

| Project | Actual prototype | Proposed next |
|---|---|---|
| [SentinelPulse](SentinelPulse/) | Fixed signatures, local rate-limiter, CSP nonce | Redis, Wasm, TLS deployment, WebGL |
| [SERPMatrix](SERPMatrix/) | Offline SEO analysis and XML sitemap | Knowledge Graph, CWV, large-scale crawling |
| [CloudHardener](CloudHardener/) | Read-only Kubernetes JSON security checks | CIS policy mapping, cluster scanner, signed logs |
| [ApexVitals](ApexVitals/) | Glyph inventory, gzip/Brotli, srcset plan | True font and AVIF processing |

These are folders inside the AI-Automation-Lab repository, not four new standalone repositories. No production benchmarks or security guarantees have been established.

The brief also mentioned ZeroAuth and Spectra UI; they are not represented as implemented here.

Run a project's suite:

    python -m unittest discover -s projects/SentinelPulse -v

Substitute another project name as needed. The GitHub Actions matrix runs all four suites.

## Launch the interactive apps

| Project | Production Vercel demo | Deployment source |
|---|---|---|
| SentinelPulse | [Launch app](https://karma-sentinelpulse.vercel.app/) | [Web source](SentinelPulse/web/index.html) |
| SERPMatrix | [Launch app](https://karma-serpmatrix.vercel.app/) | [Web source](SERPMatrix/web/index.html) |
| CloudHardener | [Launch app](https://karma-cloudhardener.vercel.app/) | [Web source](CloudHardener/web/index.html) |
| ApexVitals | [Launch app](https://karma-apexvitals.vercel.app/) | [Web source](ApexVitals/web/index.html) |

Four distinct Vercel production projects share this GitHub repository and use separate project root directories. Vercel reports READY with aliases assigned; an independent client-side HTTP/interaction check was unavailable in this execution environment.
