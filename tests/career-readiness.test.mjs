import test from 'node:test';
import assert from 'node:assert/strict';
import {REPOS,getPublicEvidence,markdownReport} from '../scripts/career-readiness.mjs';
const response=(status,payload)=>({ok:status>=200&&status<300,status,headers:{get:()=>null},json:async()=>payload});
test('rejects repositories outside the allowlist',async()=>{
 await assert.rejects(()=>getPublicEvidence('private-example',{fetchImpl:async()=>{throw Error('No request expected')}}),/allowlisted/);
});
test('does not claim a private repository is publicly verified',async()=>{
 const fake=async()=>response(200,{private:true});
 await assert.rejects(()=>getPublicEvidence(REPOS[0],{fetchImpl:fake}),/Not verified as public/);
});
test('reports public documentation presence, not CI success',async()=>{
 const fake=async(url)=>{
  if(url.endsWith('/contents/README.md'))return response(200,{name:'README.md'});
  if(url.endsWith('/contents/LICENSE'))return response(404,{message:'Not Found'});
  if(url.endsWith('/contents/.github/workflows'))return response(200,[{name:'tests.yml',type:'file'}]);
  return response(200,{private:false,default_branch:'main',pushed_at:'2026-11-07T00:00:00Z'});
 };
 const report=await getPublicEvidence('LogSentry',{fetchImpl:fake,token:''});
 assert.equal(report.readme,true);assert.equal(report.license,false);assert.equal(report.workflowPresent,true);
 const markdown=markdownReport([report],new Date('2026-11-07T12:00:00Z'));
 assert.match(markdown,/License/);assert.match(markdown,/Review/);assert.match(markdown,/not proof of skills/);
 assert.doesNotMatch(markdown,/CI passed|security passed|revenue earned/i);
});
test('unavailable results cannot be presented as passing',()=>{
 const markdown=markdownReport([{name:'LogSentry',error:'Forbidden'}],new Date('2026-11-07T00:00:00Z'));
 assert.match(markdown,/Unverified/);
});
