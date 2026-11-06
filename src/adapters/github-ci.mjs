const API='https://api.github.com';
export function validateRepo(repo,allowedRepos){
 if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)||!Array.isArray(allowedRepos)||!allowedRepos.includes(repo))throw Error('Repository not explicitly approved');
 return repo;
}
export async function auditGitHubCI({repo,allowedRepos,fetchImpl=fetch}){
 validateRepo(repo,allowedRepos);
 const urls=[API+'/repos/'+repo,API+'/repos/'+repo+'/actions/runs?per_page=10',API+'/repos/'+repo+'/contents/.github/workflows'];
 const data=[];
 for(const url of urls){
  const response=await fetchImpl(url,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(8000),headers:{accept:'application/vnd.github+json','user-agent':'KARMA-ReadOnly-Audit/1.0'}});
  if(!response.ok)throw Error('GitHub read failed ('+response.status+')');
  const len=Number(response.headers.get('content-length')??0);
  if(len>512000)throw Error('GitHub response too large');
  const body=(await response.text()).slice(0,512000);
  data.push(JSON.parse(body));
 }
 const [repository,runs,workflows]=data;
 if(repository.private!==false)throw Error('Only public repositories supported in this adapter');
 return {repo,mode:'read-only',visibility:'public',defaultBranch:repository.default_branch,workflows:Array.isArray(workflows)?workflows.filter(x=>x.type==='file'&&/\.ya?ml$/.test(x.name)).map(x=>x.name):[],recentRuns:(runs.workflow_runs??[]).slice(0,10).map(r=>({id:r.id,name:r.name,event:r.event,status:r.status,conclusion:r.conclusion,branch:r.head_branch,htmlUrl:r.html_url})),checks:[{id:'public_repo',passed:true},{id:'workflows_present',passed:Array.isArray(workflows)&&workflows.length>0},{id:'recent_runs_present',passed:(runs.workflow_runs??[]).length>0}]};
}
