# CloudHardener

**Kubernetes security-policy lab.** Status: offline, read-only JSON manifest inspector.

Implemented: checks for privileged workloads, privilege escalation, non-root constraints, read-only roots, basic Ingress TLS declarations and Secret stringData presence without printing secret values.

Run from repo root:

    python projects/CloudHardener/main.py path/to/manifest.json
    python -m unittest discover -s projects/CloudHardener -v

**Planned, not yet implemented:** authenticated cluster scanner, mapping to specific CIS benchmark versions, drift detection, microsegmentation egress policy generation and cryptographically signed immutable logs.

This is NOT a CIS certification, professional penetration test or production vulnerability scanner. It never connects to Kubernetes or changes any live configuration. Never commit real Kubernetes secrets.

## Live interactive demo

**[Launch CloudHardener workbench](https://karma-cloudhardener.vercel.app/)**

The separate Vercel project serves a browser-based, client-side experiment from [web/index.html](web/index.html). Production deployment reports READY on Vercel; all samples run locally in your browser without accessing live infrastructure.

Actual implementations and tests are under [main.py](main.py), [test_main.py](test_main.py), and [web/index.html](web/index.html). The original enterprise-scale performance and compliance claims remain unverified future goals.
