# SentinelPulse

**L7 security and rate-limiting research.** Status: Python prototype.

Implemented: small fixed-pattern request inspector with a bounded input size, in-memory sliding-window rate limiter, CSP nonce/header example and offline tests.

Run from repo root:

    python projects/SentinelPulse/main.py --path /login --body hello
    python -m unittest discover -s projects/SentinelPulse -v

**Planned, not yet implemented:** Redis atomic distributed limits, Wasm regex, actual TLS 1.3 edge policies, HSTS deployment verification, WebGL threat graph, load benchmarking.

**Claims not verified:** line-rate throughput, zero overhead, sub-1.4ms latency, preventing all credential stuffing, 60fps. This demo is not a production WAF. Never use it to protect live traffic without extensive review and measurements.

## Live interactive demo

**[Launch SentinelPulse workbench](https://karma-sentinelpulse.vercel.app/)**

The separate Vercel project serves a browser-based, client-side experiment from [web/index.html](web/index.html). Production deployment reports READY on Vercel; all samples run locally in your browser without accessing live infrastructure.

Actual implementations and tests are under [main.py](main.py), [test_main.py](test_main.py), and [web/index.html](web/index.html). The original enterprise-scale performance and compliance claims remain unverified future goals.
