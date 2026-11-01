# Quora Answer Studio

A small Next.js app for drafting and locally queueing thoughtful Quora answers. It does not log in to Quora, scrape protected pages, bypass Cloudflare, or publish automatically.

## Local setup

```powershell
cd quora-assistant
npm install
npm run dev
```

## AI provider configuration

Set these environment variables in Vercel (or a local `.env.local`):

- `AI_BASE_URL`: OpenAI-compatible API base URL, without `/chat/completions` (for example `https://api.openai.com/v1`).
- `AI_API_KEY`: provider API key. Keep it server-side only.
- `AI_MODEL`: exact model identifier supported by your provider.

The draft endpoint is `POST /api/draft` and expects `{ "question": "...", "context": "...", "sourceNotes": "..." }`.

## Current limitations

- Question discovery/research is manual: paste a question and verified research notes.
- Queue storage is browser-local. Export JSON regularly; it is not shared across devices.
- Publishing is manual in the user's normal Quora session. Quora has no public official answer-writing API found in the current research.
- Do not store Quora cookies/session files or credentials in this project.

## Next iteration

Add an external research provider and durable database after choosing the AI provider and storage. Keep publishing manual unless Quora documents a supported write integration.
