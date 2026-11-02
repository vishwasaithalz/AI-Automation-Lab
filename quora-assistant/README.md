# Quora Answer Studio

A private Next.js workspace for researching public Quora opportunities, drafting original answers and locally queueing packages for manual publication.

## Security

- Production and preview deployments are protected by Vercel Authentication (SSO).
- API routes accept same-origin JSON POST requests only.
- Request bodies have strict size and field-length limits.
- AI provider credentials are read only from server-side Vercel environment variables.
- Responses are marked no-store and upstream calls use bounded timeouts.
- No Quora credentials, cookies, votes, likes or auto-publishing are used.

## Stack

- Next.js 16.4.3
- React 19.3.1
- TypeScript
- ESLint 10
- Google Gemini Interactions API with Google Search for research

## Local setup

```powershell
cd quora-assistant
npm install
npm run dev
```

## AI provider configuration

Set these environment variables in Vercel:

- `AI_API_KEY`: Google Gemini API key, stored as a sensitive server-side secret.
- `AI_MODEL`: exact Gemini model identifier supported by your account. The default is `gemini-3.8-flash`.

The research route uses the Gemini Interactions API with Google Search. The draft route uses the same Interactions API to prepare an answer from a question, author context and research notes.

## Routes

- `POST /api/research` accepts `{ "topic": "..." }`.
- `POST /api/draft` accepts `{ "question": "...", "context": "...", "sourceNotes": "..." }`.

Both routes require an authenticated Vercel session and same-origin JSON requests.

## Privacy and publishing

- Drafts and queue entries remain in the current browser's localStorage.
- Export JSON backups regularly; the queue is not shared across devices.
- Publishing is manual in the user's normal Quora session.
- The app does not store Quora passwords/session files or automate engagement.
- Verify the question, sources and final text before publishing.

## CI

The Quora Assistant workflow installs dependencies, audits advisories, runs ESLint and production-builds the Next.js app on pull requests and pushes affecting this directory.
