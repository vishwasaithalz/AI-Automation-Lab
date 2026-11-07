# SERPMatrix

**Technical SEO and SERP research.** Status: offline HTML inspection prototype.

Implemented: HTML title, description, canonical, viewport, image dimension checks, basic JSON-LD parse verification, robots meta capture, XML-escaped HTTPS sitemap output and unit tests.

Run from repo root:

    python projects/SERPMatrix/main.py path/to/page.html
    python -m unittest discover -s projects/SERPMatrix -v

**Planned, not yet implemented:** knowledge graph entity resolution, cycle-safe structured-data generation, large-scale crawler, SSR cache warmer, live robots checks, browser CWV benchmarks.

**Claims not verified:** topical dominance, 100/100 Core Web Vitals, CLS 0.000, million-page scale and SEO rankings. This tool does not fetch or modify sites.
