// Public availability and asset integrity probe. No credentials, no writes to deployments.
const targets=[
  {name:"SentinelPulse",url:"https://karma-sentinelpulse.vercel.app/",title:"<title>SentinelPulse | KARMA Engineering Lab</title>",controls:['id="result"','id="status"'],assets:[]},
  {name:"SERPMatrix",url:"https://karma-serpmatrix.vercel.app/",title:"<title>SERPMatrix | KARMA Engineering Lab</title>",controls:['id="result"','id="status"'],assets:[]},
  {name:"CloudHardener",url:"https://karma-cloudhardener.vercel.app/",title:"<title>CloudHardener | KARMA Engineering Lab</title>",controls:['id="result"','id="status"'],assets:[]},
  {name:"ApexVitals",url:"https://karma-apexvitals.vercel.app/",title:"<title>ApexVitals | KARMA Engineering Lab</title>",controls:['id="result"','id="status"'],assets:[]},
  {name:"ZeroAuth",url:"https://karma-zeroauth.vercel.app/",title:"<title>ZeroAuth | KARMA.EXE LAB</title>",controls:['id="register"','id="login"','id="status"'],assets:[["app.mjs","navigator.credentials.create"],["auth-core.mjs","verifyAssertion"]]},
  {name:"Spectra UI",url:"https://karma-spectra-ui.vercel.app/",title:"<title>Spectra UI | KARMA.EXE LAB</title>",controls:['id="ratio"','id="grades"','id="dialog"'],assets:[["app.mjs","renderRows"],["contrast.mjs","export function contrast"]]}
];
let failed=0;
async function get(url){
 const response=await fetch(url,{redirect:"follow",signal:AbortSignal.timeout(15000),headers:{accept:"text/html,application/javascript"}});
 const text=await response.text();
 return {status:response.status,url:response.url,text};
}
for(const item of targets){
 try{
  const page=await get(item.url);
  const headOk=page.status===200&&page.text.includes(item.title)&&item.controls.every(x=>page.text.includes(x));
  let assetsOk=true;
  for(const [path,needle] of item.assets){
   const url=new URL(path,item.url).href;
   const resource=await get(url);
   const ok=resource.status===200&&resource.text.includes(needle);
   if(!ok)assetsOk=false;
   console.log(item.name+" asset "+path+": HTTP "+resource.status+", expected JS "+(ok?"YES":"NO"));
  }
  const ok=headOk&&assetsOk;
  if(!ok)failed++;
  console.log(item.name+": HTTP "+page.status+", expected HTML "+(headOk?"YES":"NO")+", assets "+(assetsOk?"PASS":"FAIL")+", final host "+new URL(page.url).hostname);
 }catch(error){
  failed++;
  console.error(item.name+": unavailable: "+String(error.message??error));
 }
}
console.log("KARMA website probe: "+(targets.length-failed)+"/"+targets.length+" verified");
if(failed)process.exitCode=1;
