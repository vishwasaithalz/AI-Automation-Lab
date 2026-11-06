import {auditWebsite} from './adapters/website-seo.mjs';
import {auditGitHubCI} from './adapters/github-ci.mjs';

// Explicit allowlists. Never read private projects, credentials or internal hosts.
export const DEFAULT_TARGETS=Object.freeze({
 websites:['https://netmirror.fit/','https://yinyangyohackers.blogspot.com/'],
 repos:['vishwasaithalz/AI-Automation-Lab','vishwasaithalz/nextjs-boilerplate','vishwasaithalz/flagship-api','vishwasaithalz/recon-lite']
});
export async function collectReport({targets=DEFAULT_TARGETS,websiteAudit=auditWebsite,githubAudit=auditGitHubCI,now=()=>new Date()}={}){
 const websites=targets.websites??[],repos=targets.repos??[];
 const results={generatedAt:now().toISOString(),mode:'read-only',websites:[],repositories:[],summary:{passed:0,failed:0,errors:0}};
 for(const target of websites){
  try{
   const host=new URL(target).hostname;
   const result=await websiteAudit({target,allowedHosts:[host]});
   results.websites.push({target,result});
  }catch(e){results.websites.push({target,error:String(e.message??e)});results.summary.errors++;}
 }
 for(const repo of repos){
  try{const result=await githubAudit({repo,allowedRepos:[repo]});results.repositories.push({repo,result});}
  catch(e){results.repositories.push({repo,error:String(e.message??e)});results.summary.errors++;}
 }
 for(const item of [...results.websites,...results.repositories]){
  for(const check of item.result?.checks??[])results.summary[check.passed?'passed':'failed']++;
 }
 return results;
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 const report=await collectReport();
 console.log(JSON.stringify(report,null,2));
 if(report.summary.errors)process.exitCode=1;
}
