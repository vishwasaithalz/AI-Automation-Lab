import {rgb,grade,bestText,paletteAudit} from "./contrast.mjs";
const $=id=>document.getElementById(id);
const fg=$("fg"),bg=$("bg"),fPick=$("fpick"),bPick=$("bpick");
const normalize=s=>"#"+rgb(s).map(n=>n.toString(16).padStart(2,"0")).join("");
function update(){
 try{
  const result=grade(fg.value,bg.value);
  $("preview").style.color=fg.value;$("preview").style.backgroundColor=bg.value;
  $("ratio").textContent=result.ratio.toFixed(2)+":1";
  $("grades").textContent=(result.AAA_normal?"AAA normal PASS":"AAA normal FAIL")+
   " · "+(result.AAA_large?"AAA large PASS":"AAA large FAIL")+
   " · "+(result.AA_normal?"AA normal PASS":"AA normal FAIL");
  fPick.value=normalize(fg.value);bPick.value=normalize(bg.value);
  $("message").textContent="Contrast derived from WCAG 2.x relative luminance.";
 }catch(e){$("message").textContent=e.message;$("ratio").textContent="--";}
}
[fg,bg].forEach(el=>el.addEventListener("input",update));
fPick.addEventListener("input",()=>{fg.value=fPick.value;update()});
bPick.addEventListener("input",()=>{bg.value=bPick.value;update()});
$("optimize").addEventListener("click",()=>{fg.value=bestText(bg.value);update()});
$("reset").addEventListener("click",()=>{fg.value="#f4f8fe";bg.value="#101b29";update()});
const tabs=[...document.querySelectorAll('[role="tab"]')];
const panels=[...document.querySelectorAll('[role="tabpanel"]')];
function switchTo(tab,focus=true){
 tabs.forEach(t=>{const active=t===tab;t.setAttribute("aria-selected",String(active));t.tabIndex=active?0:-1;});
 panels.forEach(p=>{p.hidden=p.id!==tab.getAttribute("aria-controls");});
 if(focus)tab.focus();
}
tabs.forEach((tab,index)=>{
 tab.addEventListener("click",()=>switchTo(tab));
 tab.addEventListener("keydown",e=>{
  let target=null;
  if(e.key==="ArrowRight")target=tabs[(index+1)%tabs.length];
  if(e.key==="ArrowLeft")target=tabs[(index+tabs.length-1)%tabs.length];
  if(e.key==="Home")target=tabs[0];
  if(e.key==="End")target=tabs[tabs.length-1];
  if(target){e.preventDefault();switchTo(target);}
 });
});
const dialog=$("dialog");
$("modal-open").addEventListener("click",()=>dialog.showModal());
$("modal-close").addEventListener("click",()=>dialog.close());
$("toast-open").addEventListener("click",()=>{$("toast").textContent="Demonstration action acknowledged. No external request sent.";});
$("toast-close").addEventListener("click",()=>{$("toast").textContent="";});
const rows=[
 {name:"Authentication",team:"Security",state:"Ready",priority:1},
 {name:"Crawler",team:"SEO",state:"Review",priority:3},
 {name:"Asset pipeline",team:"Performance",state:"Ready",priority:2},
 {name:"Ingress audit",team:"Security",state:"Review",priority:1},
 {name:"Design tokens",team:"Frontend",state:"Ready",priority:2}
];
let key="priority",asc=true;
function renderRows(){
 const sorted=[...rows].sort((a,b)=>{
  const x=a[key],y=b[key];
  return (typeof x==="number"?x-y:String(x).localeCompare(String(y)))*(asc?1:-1);
 });
 const body=$("rows");body.replaceChildren();
 for(const row of sorted){
  const tr=document.createElement("tr");
  for(const label of ["name","team","state","priority"]){const td=document.createElement("td");td.textContent=String(row[label]);tr.append(td);}
  body.append(tr);
 }
 document.querySelectorAll("[data-sort]").forEach(btn=>{
  btn.closest("th").setAttribute("aria-sort",btn.dataset.sort===key?(asc?"ascending":"descending"):"none");
 });
}
document.querySelectorAll("[data-sort]").forEach(btn=>btn.addEventListener("click",()=>{
 const target=btn.dataset.sort;
 if(target===key)asc=!asc;else{key=target;asc=true;}
 renderRows();
 $("message").textContent="Table sorted by "+key+", "+(asc?"ascending":"descending")+".";
}));
update();renderRows();switchTo(tabs[0],false);

$("palette-run").addEventListener("click",()=>{
 try{
  const colors=$("palette-input").value.split(/\r?\n|,/).map(x=>x.trim()).filter(Boolean);
  const report=paletteAudit(colors);
  const output=[
   "PALETTE AUDIT / LOCAL",
   "Suggested readable foreground for each background:",
   ...report.recommendations.map(x=>x.background+" → "+x.foreground+" | "+x.ratio+":1 | AA normal "+(x.AA_normal?"PASS":"FAIL")),
   "",
   "Pairwise contrast:",
   ...report.pairs.map(x=>x.foreground+" on "+x.background+" | "+x.ratio+":1 | AA normal "+(x.AA_normal?"PASS":"FAIL")),
   "",
   "Contrast checks only. A passing ratio does not certify accessibility."
  ];
  $("palette-result").textContent=output.join("\n");
  $("message").textContent="Audited "+colors.length+" local palette tokens. No network requests.";
 }catch(error){
  $("palette-result").textContent="Input error: "+error.message;
  $("message").textContent="Fix the palette input and retry.";
 }
});
