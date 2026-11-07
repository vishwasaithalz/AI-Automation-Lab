// Public-repository career evidence snapshot. No user data, writes, or job applications.
import { appendFile } from 'node:fs/promises';
const OWNER='vishwasaithalz';
export const REPOS=Object.freeze(['LogSentry','AI-Automation-Lab','recon-lite','flagship-api']);
const API='https://api.github.com';
export async function getPublicEvidence(name,{fetchImpl=fetch,token=process.env.GITHUB_TOKEN}={}){
 if(!REPOS.includes(name))throw Error('Repository is not allowlisted');
 const request=async(path)=>{
  const headers={'accept':'application/vnd.github+json','user-agent':'KARMA-Career-Evidence/1.0','x-github-api-version':'2022-11-28'};
  if(token)headers.authorization='Bearer '+token;
  const result=await fetchImpl(API+'/repos/'+OWNER+'/'+name+path,{method:'GET',redirect:'manual',headers,signal:AbortSignal.timeout(10000)});
  if(result.status===404)return {missing:true};
  if(!result.ok)throw Error('GitHub '+result.status+' for '+name+' '+path);
  const contentLength=Number(result.headers?.get?.('content-length')??0);
  if(contentLength>300000)throw Error('GitHub response exceeds limit');
  return result.json();
 };
 const metadata=await request('');
 if(metadata.missing||metadata.private!==false)throw Error('Not verified as public: '+name);
 const [readme,license,workflows]=await Promise.all([
  request('/contents/README.md'),
  request('/contents/LICENSE'),
  request('/contents/.github/workflows')
 ]);
 return {
  name, url:'https://github.com/'+OWNER+'/'+name,
  defaultBranch:metadata.default_branch??null, updatedAt:metadata.pushed_at??null,
  readme:!readme.missing,
  license:!license.missing,
  workflowPresent:Array.isArray(workflows)&&workflows.some(x=>x.type==='file'&&/\.ya?ml$/i.test(x.name))
 };
}
export function markdownReport(rows,when){
 const stamp=when.toISOString().slice(0,10);
 const lines=['# KARMA public portfolio evidence · '+stamp,'','Read-only public GitHub metadata. This is a **documentation-readiness** check, not proof of skills, test success, hiring outcomes, security, revenue, or live uptime.','','| Repository | README | License | CI workflow file |','|---|---|---|---|'];
 for(const row of rows){
  if(row.error){lines.push('| '+row.name+' | Unverified | Unverified | Unverified |');continue}
  lines.push('| ['+row.name+']('+row.url+') | '+(row.readme?'Present':'Review')+' | '+(row.license?'Present':'Review')+' | '+(row.workflowPresent?'Present':'Review')+' |');
 }
 lines.push('','## Suggested manual follow-ups','Confirm case-study narratives, genuine screenshots, tests, licenses, and actual shipped demo behavior. Record only authentic experience. Never auto-apply or send outreach.','','Any unverified repository is omitted from passing claims.');
 return lines.join('\n')+'\n';
}
export async function run({fetchImpl=fetch,when=new Date(),token=process.env.GITHUB_TOKEN}={}){
 const rows=[];
 for(const name of REPOS){
  try{rows.push(await getPublicEvidence(name,{fetchImpl,token}));}
  catch(e){rows.push({name,error:e instanceof Error?e.message:'Unknown error'});}
 }
 const output=markdownReport(rows,when);
 if(process.env.GITHUB_STEP_SUMMARY)await appendFile(process.env.GITHUB_STEP_SUMMARY,output,'utf8');
 process.stdout.write(output);
 if(rows.every(x=>x.error))process.exitCode=1;
 return rows;
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){await run();}
