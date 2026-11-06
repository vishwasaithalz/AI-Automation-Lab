import {auditWebsite} from './adapters/website-seo.mjs';
import {auditGitHubCI} from './adapters/github-ci.mjs';

/** Explicitly approved public targets only. No publishing or mutations. */
export async function runConsolidatedAudit({websites=[],repositories=[],websiteAudit=auditWebsite,githubAudit=auditGitHubCI}={}){
 const targets=[...websites.map(target=>({kind:'website',target})),...repositories.map(target=>({kind:'github',target}))];
 const results=[];
 for(const {kind,target} of targets){
  try{
   const data=kind==='website'
    ?await websiteAudit({target,allowedHosts:[new URL(target).hostname]})
    :await githubAudit({repo:target,allowedRepos:[target]});
   results.push({kind,target,status:'completed',data});
  }catch(error){results.push({kind,target,status:'error',error:String(error?.message??error).slice(0,300)});}
 }
 return {schemaVersion:1,mode:'read-only',total:targets.length,completed:results.filter(x=>x.status==='completed').length,failed:results.filter(x=>x.status==='error').length,results};
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 const targets=process.argv.slice(2);
 if(!targets.length)throw Error('Provide explicit public HTTPS URLs and/or owner/repository targets.');
 const report=await runConsolidatedAudit({websites:targets.filter(x=>x.startsWith('https://')),repositories:targets.filter(x=>!x.startsWith('https://'))});
 console.log(JSON.stringify(report,null,2));
 if(report.failed)process.exitCode=1;
}
