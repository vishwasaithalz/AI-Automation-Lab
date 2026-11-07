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
