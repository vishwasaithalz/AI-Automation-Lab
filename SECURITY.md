# Security Policy

The initial implementation uses a deterministic mock provider and makes no external requests.

- Never commit API keys, access tokens, or private data.
- Use synthetic prompts and context in examples and tests.
- Do not send confidential information to an external provider without explicit authorisation and a review of its data retention and training terms.
- A future real provider adapter must be opt-in, use environment-based secrets, set timeouts and bounded retries, and avoid logging prompts or credentials.
- Report suspected vulnerabilities privately to the repository owner where private reporting is available.
