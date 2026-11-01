import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

type InteractionStep = {
  type?: string;
  content?: Array<{ type?: string; text?: string; annotations?: Array<{ type?: string; url?: string; title?: string }> }>;
};

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (typeof topic !== 'string' || topic.trim().length < 3) {
      return NextResponse.json({ error: 'Enter a topic to research.' }, { status: 400 });
    }

    const key = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || 'gemini-3.8-flash';
    if (!key) {
      return NextResponse.json({ error: 'AI_API_KEY is missing in Vercel. Add it and redeploy.' }, { status: 503 });
    }

    const prompt = 'Use Google Search to find up to 5 real, current public Quora questions about: ' + topic + '. Prefer questions where a practical learner can add honest value. Do not invent Quora URLs, question text, stats, credentials, experience or facts. Only provide a Quora URL if verified in search results, otherwise use an empty url and label it an idea. For each candidate return question, url, relevance, opportunity (specific gap/angle, do not claim to have inspected answers unless search exposed them), outline (3-5 bullets), answerDraft (180-280 words, useful and original, no invented first-person claims), and commentDrafts (two concise useful replies, no promotion or engagement bait). Return ONLY valid JSON: {"summary":"...","candidates":[{"question":"...","url":"","relevance":"...","opportunity":"...","outline":["..."],"answerDraft":"...","commentDrafts":["...","..."]}]}. Return fewer if evidence is weak.';

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        model,
        input: prompt,
        tools: [{ type: 'google_search' }],
        store: false,
        generation_config: { temperature: 0.35 }
      }),
      signal: AbortSignal.timeout(55000)
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || 'Gemini research failed: ' + response.status }, { status: 502 });
    }

    const steps: InteractionStep[] = Array.isArray(data?.steps) ? data.steps : [];
    const raw = typeof data?.output_text === 'string'
      ? data.output_text
      : steps.filter((step) => step.type === 'model_output')
          .flatMap((step) => step.content || [])
          .filter((part) => part.type === 'text')
          .map((part) => part.text || '')
          .join('');

    let parsed: any;
    try {
      const cleaned = raw.trim().replace(/^\`\`\`(?:json)?\s*/i, '').replace(/\s*\`\`\`$/, '');
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Research returned invalid JSON. Try a narrower topic.' }, { status: 502 });
    }

    const sources = steps
      .filter((step) => step.type === 'model_output')
      .flatMap((step) => step.content || [])
      .flatMap((part) => part.annotations || [])
      .filter((annotation) => annotation.type === 'url_citation' && annotation.url)
      .map((annotation) => ({ url: annotation.url!, title: annotation.title || annotation.url! }));

    const uniqueSources = Array.from(new Map(sources.map((source) => [source.url, source])).values());
    const candidates = (Array.isArray(parsed.candidates) ? parsed.candidates : [])
      .slice(0, 5)
      .filter((item: any) => item.question && item.answerDraft)
      .map((item: any) => ({
        ...item,
        url: typeof item.url === 'string' && item.url.startsWith('https://www.quora.com/') ? item.url : '',
        outline: Array.isArray(item.outline) ? item.outline : [],
        commentDrafts: Array.isArray(item.commentDrafts) ? item.commentDrafts : []
      }));

    return NextResponse.json({ summary: parsed.summary || 'Research complete.', candidates, sources: uniqueSources, model });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected research error' }, { status: 500 });
  }
}
