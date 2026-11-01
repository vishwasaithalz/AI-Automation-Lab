'use client';

import { useEffect, useMemo, useState } from 'react';

type Entry = { id: string; question: string; url: string; notes: string; draft: string; status: 'Research' | 'Draft ready' | 'Published'; createdAt: string; publishedUrl?: string };
const KEY = 'quora-answer-studio-v1';
const context = 'I am rebuilding my technical skills through hands-on learning. My interests include cybersecurity fundamentals, authorized security testing, AI tools, automation, JavaScript, Linux and web development. Keep claims grounded and do not present me as a senior professional.';

export default function Home() {
  const [items, setItems] = useState<Entry[]>([]);
  const [question, setQuestion] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [draft, setDraft] = useState('');
  const [activeId, setActiveId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { try { const saved = localStorage.getItem(KEY); if (saved) setItems(JSON.parse(saved)); } catch {} }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);
  const ready = useMemo(() => items.filter(x => x.status === 'Draft ready').length, [items]);
  async function generate() {
    if (!question.trim()) { setMessage('Paste the full question first.'); return; }
    setBusy(true); setMessage('Drafting with your configured AI provider…');
    try {
      const res = await fetch('/api/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, context, sourceNotes: notes }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Draft failed');
      setDraft(data.draft); setMessage(`Draft generated using ${data.model}. Review facts and sources before publishing.`);
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Draft failed'); }
    finally { setBusy(false); }
  }
  function save() {
    if (!question.trim() || !draft.trim()) { setMessage('A question and draft are required to save.'); return; }
    const entry: Entry = { id: crypto.randomUUID(), question: question.trim(), url: url.trim(), notes: notes.trim(), draft: draft.trim(), status: 'Draft ready', createdAt: new Date().toISOString() };
    setItems(prev => [entry, ...prev]); setActiveId(entry.id); setMessage('Saved to this browser’s local queue.'); setQuestion(''); setUrl(''); setNotes(''); setDraft('');
  }
  function update(id: string, patch: Partial<Entry>) { setItems(prev => prev.map(x => x.id === id ? { ...x, ...patch } : x)); }
  function exportQueue() { const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'quora-answer-queue.json'; a.click(); URL.revokeObjectURL(a.href); }
  return <main className="shell">
    <header className="top"><div><div className="eyebrow">AI Automation Lab / Quora workflow</div><h1 className="brand">Quora Answer Studio</h1><p className="sub">Find a question, bring the evidence, shape a genuinely useful answer, then publish from your normal Quora session. Your drafts stay in this browser until you export them.</p></div><span className="pill">CLOUDFLARE SETUP SKIPPED</span></header>
    <div className="statrow"><div className="stat"><b>{items.length}</b><span>Saved drafts</span></div><div className="stat"><b>{ready}</b><span>Ready to review</span></div><div className="stat"><b>{items.filter(x=>x.status==='Published').length}</b><span>Marked published</span></div></div>
    <div className="grid"><section className="panel"><h2>01 / Build an answer</h2>
      <div className="field"><label>QUORA QUESTION</label><textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Paste the exact question text here…" /></div>
      <div className="field"><label>QUESTION URL</label><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://www.quora.com/..." /></div>
      <div className="field"><label>RESEARCH NOTES + SOURCE LINKS</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add verified facts, your own notes and source URLs. Don't paste private information." /></div>
      <div className="actions"><button className="primary" onClick={generate} disabled={busy}>{busy?'Generating…':'Generate answer draft'}</button><button className="secondary" onClick={save}>Save draft to queue</button></div>
      <div className="field"><label>ANSWER DRAFT</label><textarea style={{minHeight:250}} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Your generated answer will appear here. Edit it before saving or publishing." /></div>
      <p className="note">{message || 'AI generation requires an OpenAI-compatible provider configured in Vercel. No credentials are stored in this browser.'}</p>
    </section><aside className="panel"><h2>02 / Your answer queue</h2><div className="actions" style={{marginBottom:12}}><button className="secondary" onClick={exportQueue}>Export queue JSON</button></div>
      {items.length===0?<div className="empty">No drafts yet. Your first answer starts here.</div>:items.map(item=><article className="item" key={item.id}><span className="tag">{item.status}</span><div style={{fontWeight:700,lineHeight:1.4,marginBottom:8}}>{item.question}</div>{item.url&&<div><a href={item.url} target="_blank" rel="noreferrer">Open Quora question ↗</a></div>}<p>{item.draft.slice(0,240)}{item.draft.length>240?'…':''}</p><div className="actions"><button className="secondary" onClick={()=>{setQuestion(item.question);setUrl(item.url);setNotes(item.notes);setDraft(item.draft);setActiveId(item.id);}}>Edit / load</button><button className="secondary" onClick={()=>navigator.clipboard.writeText(item.draft)}>Copy answer</button><button className="secondary" onClick={()=>update(item.id,{status:item.status==='Published'?'Draft ready':'Published'})}>{item.status==='Published'?'Undo published':'Mark published'}</button><button className="secondary" onClick={()=>setItems(prev=>prev.filter(x=>x.id!==item.id))}>Delete</button></div>{item.status==='Published'&&<div className="field"><label>LIVE ANSWER URL</label><input value={item.publishedUrl||''} onChange={e=>update(item.id,{publishedUrl:e.target.value})} placeholder="Paste your published answer URL" /></div>}</article>)}
    </aside></div>
    <p className="note" style={{marginTop:22}}>Privacy note: the queue is stored in localStorage on this browser, not in a shared database. Export it regularly. Never store Quora passwords, session cookies or API keys here. Publishing is intentionally a manual action in Quora.</p>
  </main>;
}
