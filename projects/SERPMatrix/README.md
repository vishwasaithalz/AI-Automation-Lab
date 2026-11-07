# SERPMatrix

**Technical SEO and SERP research.** Status: offline HTML inspection prototype.

Implemented: HTML title, description, canonical, viewport, image dimension checks, basic JSON-LD parse verification, robots meta capture, XML-escaped HTTPS sitemap output and unit tests.

Run from repo root:

    python projects/SERPMatrix/main.py path/to/page.html
    python -m unittest discover -s projects/SERPMatrix -v

**Planned, not yet implemented:** knowledge graph entity resolution, cycle-safe structured-data generation, large-scale crawler, SSR cache warmer, live robots checks, browser CWV benchmarks.

**Claims not verified:** topical dominance, 100/100 Core Web Vitals, CLS 0.000, million-page scale and SEO rankings. This tool does not fetch or modify sites.

## Live interactive demo

**[Launch SERPMatrix workbench](https://karma-serpmatrix.vercel.app/)**

The separate Vercel project serves a browser-based, client-side experiment from [web/index.html](web/index.html). Production deployment reports READY on Vercel; all samples run locally in your browser without accessing live infrastructure.

Actual implementations and tests are under [main.py](main.py), [test_main.py](test_main.py), and [web/index.html](web/index.html). The original enterprise-scale performance and compliance claims remain unverified future goals.
