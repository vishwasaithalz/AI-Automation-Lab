import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (typeof topic !== 'string' || topic.trim().length < 3) return NextResponse.json({error:'Enter a topic to research.'},{status:400});
    const key = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || 'gemini-2.5-flash';
    if (!key) return NextResponse.json({error:'AI_API_KEY is missing in Vercel Production. Add it and redeploy.'},{status:503});
    const prompt = 'Use Google Search grounding to find up to 5 real, current public Quora questions about: ' + topic + '. Prefer questions where a practical learner can add honest value. Do not invent Quora URLs, question text, stats, credentials, experience or facts. Only provide a Quora URL if verified in search results, otherwise use an empty url and label it an idea. For each candidate return question, url, relevance, opportunity (specific gap/angle, do not claim to have inspected answers unless search exposed them), outline (3-5 bullets), answerDraft (180-280 words, useful and original, no invented first-person claims), and commentDrafts (two concise useful replies, no promotion or engagement bait). Return ONLY JSON: {"summary":"...","candidates":[{"question":"...","url":"","relevance":"...","opportunity":"...","outline":["..."],"answerDraft":"...","commentDrafts":["...","..."]}]}. Return fewer if evidence is weak.';
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key), {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.35,responseMimeType:'application/json'}}),signal:AbortSignal.timeout(55000)});
    const data = await r.json();
    if (!r.ok) return NextResponse.json({error:data?.error?.message || 'Gemini research failed: '+r.status},{status:502});
    const raw = data?.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||'').join('') || '';
    let parsed:any; try { parsed=JSON.parse(raw); } catch { return NextResponse.json({error:'Research returned invalid JSON. Try a narrower topic.'},{status:502}); }
    const chunks = data?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.map((x:any)=>x.web).filter((x:any)=>x?.uri).map((x:any)=>({url:x.uri,title:x.title||x.uri}));
    const candidates = (Array.isArray(parsed.candidates)?parsed.candidates:[]).slice(0,5).filter((x:any)=>x.question&&x.answerDraft).map((x:any)=>({...x,url:typeof x.url==='string'&&x.url.startsWith('https://www.quora.com/')?x.url:'',outline:Array.isArray(x.outline)?x.outline:[],commentDrafts:Array.isArray(x.commentDrafts)?x.commentDrafts:[]}));
    return NextResponse.json({summary:parsed.summary||'Research complete.',candidates,sources});
  } catch(e) { return NextResponse.json({error:e instanceof Error?e.message:'Unexpected research error'},{status:500}); }
}
