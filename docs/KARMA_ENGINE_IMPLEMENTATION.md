# KARMA Automation Engine: six-lane prototype

This implementation is mock-only and has no dependencies, network calls, production credentials, persistence, scheduler, or publishing adapters.

Engines: website/SEO, security/CI, video/music, research/career/earnings, isolated memory evaluation, approval-gated publishing preparation.

Run: `node --test tests/karma-engine.test.mjs`
Then: `node src/karma-engine.mjs examples/karma-engine-plan.json`

The JSON and Markdown output are preparation checklists, not proof of completed audits or rendered media. Sensitive input keys are redacted in output; do not supply actual secrets or private data to the plan.

The workflow is manual only (workflow_dispatch). Do not merge, deploy or activate external integrations without separate approval. Existing schedules are untouched.
