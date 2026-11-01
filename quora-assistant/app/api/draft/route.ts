import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { question, context = '', sourceNotes = '' } = await request.json();
    if (typeof question !== 'string' || question.trim().length < 12) {
      return NextResponse.json({ error: 'Add the full Quora question first.' }, { status: 400 });
    }
    const baseUrl = process.env.AI_BASE_URL;
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL;
    if (!baseUrl || !apiKey || !model) {
      return NextResponse.json({ error: 'AI is not connected yet. Add AI_BASE_URL, AI_API_KEY and AI_MODEL in Vercel environment variables.' }, { status: 503 });
    }
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.65,
        messages: [
          { role: 'system', content: 'Write a useful, original Quora answer. Be honest about the author being a hands-on learner rebuilding technical skills. Never invent credentials, personal experience, tests, facts, statistics or citations. Directly answer the question, explain practical steps, distinguish uncertainty, avoid keyword stuffing and self-promotion. Do not add links unless the source notes justify them. Aim for 180-350 words when appropriate. Return only the answer text.' },
          { role: 'user', content: `QUESTION:\n${question}\n\nAUTHOR CONTEXT:\n${context}\n\nRESEARCH NOTES / SOURCES:\n${sourceNotes}\n\nDraft a specific answer that adds value beyond generic advice.` }
        ]
      }),
      signal: AbortSignal.timeout(45000)
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || `AI provider returned ${response.status}` }, { status: 502 });
    const draft = data?.choices?.[0]?.message?.content;
    if (typeof draft !== 'string' || !draft.trim()) return NextResponse.json({ error: 'The AI provider returned an empty draft.' }, { status: 502 });
    return NextResponse.json({ draft: draft.trim(), model });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected draft error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
