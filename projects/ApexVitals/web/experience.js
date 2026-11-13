(function core(spec){
const [name,label,accent,scene,frequencies]=spec,main=document.querySelector("main");if(!main)return;
const css=document.createElement("style");css.textContent=`
:root{--lab-accent:${accent};--lab-paper:#e8f2f6}
body{background:radial-gradient(ellipse at 75% 4%,color-mix(in srgb,var(--lab-accent) 18%,transparent),transparent 46%),radial-gradient(ellipse at 5% 90%,#1a283e,transparent 52%),#070d15!important;color:#ecf4f8}
body:before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(#fff1 1px,transparent 1px),linear-gradient(90deg,#fff1 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(#0004,transparent 80%)}
header,main,footer{position:relative}header{background:#101923d9!important;backdrop-filter:blur(12px);border-bottom:1px solid #8095a044!important}
main h1{letter-spacing:-.07em!important;text-shadow:0 12px 45px #0008}main h1 em,main h1 span{color:var(--lab-accent)!important}
.panel{background:linear-gradient(135deg,#172633,#0c1522)!important;border:1px solid #6b81916b!important;border-radius:18px!important;box-shadow:0 16px 40px #0003,inset 0 1px #fff1}
.labdeck,.labtool{margin:24px 0 34px;border:1px solid #70889c77;border-radius:21px;background:linear-gradient(145deg,#172633,#0c141f);box-shadow:0 20px 60px #0006;overflow:hidden}
.labdeck{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,39%);min-height:270px}
.labinfo{padding:30px;display:flex;flex-direction:column;gap:14px}.labeyebrow{color:var(--lab-accent);letter-spacing:.22em;text-transform:uppercase;font:800 11px system-ui,sans-serif}
.labinfo h2,.labtool h2{margin:0;font-size:clamp(22px,3vw,36px);line-height:1.1;letter-spacing:-.045em;color:var(--lab-paper)}
.labinfo p,.labtool p{margin:0;color:#c1d0d9;font:14px/1.6 system-ui,sans-serif}
.labcontrols,.labactions{display:flex;gap:10px;flex-wrap:wrap;margin-top:auto}
.labdeck button,.labtool button{font:700 13px system-ui,sans-serif;background:#27394a;color:#f2f8fc;border:1px solid #728da299;border-radius:10px;padding:11px 14px;cursor:pointer}
.labdeck button[aria-pressed=true],.labtool button:hover{background:var(--lab-accent);color:#091722;border-color:var(--lab-accent)}
.labdeck button:focus-visible,.labtool button:focus-visible,.labtool input:focus-visible{outline:3px solid var(--lab-accent);outline-offset:3px}
.labvis{position:relative;min-height:240px;overflow:hidden;background:radial-gradient(circle at center,#264058,#0b1420 70%);border-left:1px solid #617c915a}
.labvis:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 6px,#fff1 7px);pointer-events:none}
.labring,.labring:before,.labring:after{position:absolute;border:1px solid var(--lab-accent);border-radius:50%}
.labring{inset:15%;animation:labpulse 5s ease-in-out infinite;box-shadow:0 0 42px #ffffff1b}
.labring:before,.labring:after{content:"";inset:18%;border-style:dashed;opacity:.65}.labring:after{inset:40%;background:var(--lab-accent);box-shadow:0 0 21px var(--lab-accent)}
.labsweep{position:absolute;inset:12%;border-radius:50%;background:conic-gradient(from 45deg,transparent 60%,color-mix(in srgb,var(--lab-accent) 55%,transparent));mask-image:radial-gradient(circle,#000 12%,transparent 80%);animation:labspin 7s linear infinite}
.labvis[data-scene=search] .labring{border-radius:24%;transform:rotate(-16deg)}
.labvis[data-scene=cluster] .labring{border-radius:12px;transform:rotate(45deg)}
.labvis[data-scene=speed] .labring{border-radius:12px;transform:skew(-13deg)}
.labvis[data-scene=vault] .labring{box-shadow:0 0 0 16px #ffffff13,0 0 0 35px #ffffff0c}
.labvis[data-scene=palette]{background:conic-gradient(#286077,#70526e,#73602f,#427c66,#286077)}
.labstamp{position:absolute;left:18px;bottom:18px;color:var(--lab-accent);font:700 11px ui-monospace,monospace;letter-spacing:.12em;z-index:2}
.labtool{padding:28px}.labtool h2{font-size:26px;margin:6px 0 9px}.labtool p{margin-bottom:18px}.labactions{margin:15px 0}
.laboutput{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.65 ui-monospace,Consolas,monospace;background:#07111b;border:1px solid #728a9a6b;border-radius:12px;color:#d5e4ed;padding:17px;min-height:90px;margin-top:15px}
.labtrend{display:flex;align-items:end;gap:4px;background:#07111b;border:1px solid #728a9a60;padding:10px;height:75px;border-radius:12px}
.labtrend span{height:15%;flex:1;background:var(--lab-accent);border-radius:3px 3px 0 0;max-width:26px}
.labstatus{font:12px system-ui;color:#b7d8e7;min-height:1.3em}
html[data-lab-light=true] body{background:#dce9ed!important;color:#132332!important}
html[data-lab-light=true] main h1{color:#12293c!important;text-shadow:none!important}
html[data-lab-light=true] .panel{background:linear-gradient(135deg,#f6fcff,#d9e8ee)!important;color:#152b3a!important}
html[data-lab-light=true] .lead{color:#294759!important}
@keyframes labspin{to{transform:rotate(360deg)}}@keyframes labpulse{50%{opacity:.45;filter:brightness(1.7)}}
@media(max-width:770px){.labdeck{grid-template-columns:1fr}.labvis{min-height:170px;border-left:0;border-top:1px solid #617c915a}.labinfo,.labtool{padding:22px}}
@media(prefers-reduced-motion:reduce){.labring,.labsweep{animation:none!important}}
html[data-lab-still=true] .labring,html[data-lab-still=true] .labsweep{animation:none!important}
`;document.head.append(css);
const section=document.createElement("section");section.className="labdeck";section.setAttribute("aria-label",name+" instrument panel");
section.innerHTML='<div class="labinfo"><div class="labeyebrow">Lab 2.0 / Functional instruments</div><h2>'+name+'</h2><p>Purpose-built tools and original motion. Visual displays are illustrative and never substitute for measured results.</p><div class="labcontrols"><button type="button" id="lab-theme" aria-pressed="false">Daylight mode</button><button type="button" id="lab-motion" aria-pressed="false">Pause motion</button><button type="button" id="lab-sound" aria-pressed="false">Ambient tone off</button></div><div id="lab-status" class="labstatus" role="status" aria-live="polite">Audio is off by default. Browser data stays local.</div></div><div class="labvis" data-scene="'+scene+'" aria-hidden="true"><div class="labsweep"></div><div class="labring"></div><div class="labstamp">'+name.toUpperCase()+' / LOCAL OPS</div></div>';
const target=main.querySelector(".work,.grid,.workspace");if(target)target.before(section);else main.append(section);
const mode=section.querySelector("#lab-theme"),motion=section.querySelector("#lab-motion"),tone=section.querySelector("#lab-sound"),status=section.querySelector("#lab-status");
mode.onclick=()=>{const enabled=document.documentElement.dataset.labLight!=="true";document.documentElement.dataset.labLight=String(enabled);mode.setAttribute("aria-pressed",String(enabled));mode.textContent=enabled?"Dark mode":"Daylight mode"};
motion.onclick=()=>{const enabled=document.documentElement.dataset.labStill!=="true";document.documentElement.dataset.labStill=String(enabled);motion.setAttribute("aria-pressed",String(enabled));motion.textContent=enabled?"Resume motion":"Pause motion"};
let audio=null;function stop(){if(audio){audio.close().catch(()=>{});audio=null}tone.setAttribute("aria-pressed","false");tone.textContent="Ambient tone off"}
tone.onclick=async()=>{if(audio){stop();status.textContent="Tone disabled.";return}try{const API=window.AudioContext||window.webkitAudioContext;if(!API)throw Error("No Web Audio support");const ctx=new API();await ctx.resume();const volume=ctx.createGain();volume.gain.value=.005;volume.connect(ctx.destination);for(const freq of frequencies){const osc=ctx.createOscillator();osc.type="sine";osc.frequency.value=freq;osc.connect(volume);osc.start()}audio=ctx;tone.setAttribute("aria-pressed","true");tone.textContent="Mute ambient tone";status.textContent="Original generated chord playing. Sound is opt-in."}catch(e){stop();status.textContent=e.message}};
document.addEventListener("visibilitychange",()=>{if(document.hidden&&audio){stop();status.textContent="Sound stopped when the tab was hidden."}});
window.labkit={add(title,description,markup){const el=document.createElement("section");el.className="labtool";el.innerHTML='<div class="labeyebrow">Extended tools</div><h2>'+title+'</h2><p>'+description+'</p>'+markup;main.append(el);return el},
download(filename,data,type){const blob=new Blob([data],{type:type||"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)},
notify(s){status.textContent=s}};
})(["ApexVitals","PERFORMANCE TELEMETRY","#f3d17c","speed",[147,220,294]]);
(function apex(){
const kit=window.labkit,el=kit.add("Actual browser timing","Measures the current ApexVitals page via the browser Performance API, not remote websites or real-user Core Web Vitals.",'<div class="labactions"><button id="new-run" type="button">Measure this page</button><button id="new-export" type="button">Download timing JSON</button></div><div class="labtrend" id="new-trend" aria-hidden="true"></div><div class="laboutput" id="new-out" role="status" aria-live="polite">Click to read real local navigation entries.</div>');const out=el.querySelector("#new-out"),trend=el.querySelector("#new-trend");let report=null;
el.querySelector("#new-run").onclick=()=>{const nav=performance.getEntriesByType("navigation")[0];if(!nav){out.textContent="Navigation Timing entry unavailable.";return}const round=x=>Math.round(x*10)/10;report={source:"current page browser Navigation Timing",ttfbMs:round(nav.responseStart-nav.requestStart),responseEndMs:round(nav.responseEnd),domReadyMs:round(nav.domContentLoadedEventEnd),loadMs:round(nav.loadEventEnd),resourceEntries:performance.getEntriesByType("resource").length,transferSizeBytes:nav.transferSize||null};const a=[report.ttfbMs,report.responseEndMs,report.domReadyMs,report.loadMs],max=Math.max(1,...a);trend.replaceChildren();for(const val of a){const bar=document.createElement("span");bar.style.height=Math.max(3,100*val/max)+"%";bar.title=val+" ms";trend.append(bar)}out.textContent=JSON.stringify(report,null,2)+"\n\nThis is not a remote CWV audit."};
el.querySelector("#new-export").onclick=()=>{if(report)kit.download("apexvitals-navigation.json",JSON.stringify(report,null,2));else out.textContent="Measure before exporting."};
})();
