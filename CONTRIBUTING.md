# Contributing

## Requirements

Node.js 20+ and npm. The initial project has no runtime dependencies.

## Checks

    npm test
    npm run demo

## Guidelines

- Keep the default workflow in mock mode.
- Validate all input before calling a provider.
- Keep provider-specific code behind a small adapter interface.
- Add bounded timeouts and retries before introducing external network calls.
- Never log secrets or sensitive prompt content.
- Add tests for success, malformed input, provider failure, and empty output.
