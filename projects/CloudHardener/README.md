# CloudHardener

**Kubernetes security-policy lab.** Status: offline, read-only JSON manifest inspector.

Implemented: checks for privileged workloads, privilege escalation, non-root constraints, read-only roots, basic Ingress TLS declarations and Secret stringData presence without printing secret values.

Run from repo root:

    python projects/CloudHardener/main.py path/to/manifest.json
    python -m unittest discover -s projects/CloudHardener -v

**Planned, not yet implemented:** authenticated cluster scanner, mapping to specific CIS benchmark versions, drift detection, microsegmentation egress policy generation and cryptographically signed immutable logs.

This is NOT a CIS certification, professional penetration test or production vulnerability scanner. It never connects to Kubernetes or changes any live configuration. Never commit real Kubernetes secrets.
