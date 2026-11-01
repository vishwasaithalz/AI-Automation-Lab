import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

type InteractionStep = {
  type?: string;
  content?: Array<{ type?: string; text?: string }>;
};

export async function POST(request: Request) {
  try {
    const { question, context = '', sourceNotes = '' } = await request.json();
    if (typeof question !== 'string' || question.trim().length < 12) {
      return NextResponse.json({ error: 'Add the full Quora question first.' }, { status: 400 });
    }

    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || 'gemini-3.8-flash';
    if (!apiKey) {
      return NextResponse.json({ error: 'AI_API_KEY is missing in Vercel environment variables. Add it and redeploy.' }, { status: 503 });
    }

    const input = [
      'Write a useful, original Quora answer. Be honest about the author being a hands-on learner rebuilding technical skills. Never invent credentials, personal experience, tests, facts, statistics or citations. Directly answer the question, explain practical steps, distinguish uncertainty, avoid keyword stuffing and self-promotion. Do not add links unless the source notes justify them. Aim for 180-350 words when appropriate. Return only the answer text.',
      '',
      'QUESTION:',
      question,
      '',
      'AUTHOR CONTEXT:',
      String(context),
      '',
      'RESEARCH NOTES / SOURCES:',
      String(sourceNotes),
      '',
      'Draft a specific answer that adds value beyond generic advice.'
    ].join('\n');

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ model, input, store: false, generation_config: { temperature: 0.65 } }),
      signal: AbortSignal.timeout(55000)
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || `Gemini returned ${response.status}` }, { status: 502 });
    }

    const steps: InteractionStep[] = Array.isArray(data?.steps) ? data.steps : [];
    const draftText = typeof data?.output_text === 'string'
      ? data.output_text
      : steps.filter((step) => step.type === 'model_output')
          .flatMap((step) => step.content || [])
          .filter((part) => part.type === 'text')
          .map((part) => part.text || '')
          .join('');

    if (!draftText.trim()) {
      return NextResponse.json({ error: 'Gemini returned an empty draft.' }, { status: 502 });
    }

    return NextResponse.json({ draft: draftText.trim(), model });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected draft error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
