import test from 'node:test';
import assert from 'node:assert/strict';
import {auditWebsite,validateTarget} from '../src/adapters/website-seo.mjs';
import {auditGitHubCI,validateRepo} from '../src/adapters/github-ci.mjs';
const response=(body,status=200,type='text/html')=>({ok:status>=200&&status<300,status,headers:new Headers({'content-type':type}),text:async()=>body});
test('website validates allowlist, forbids private hosts and URL tricks',()=>{
 assert.throws(()=>validateTarget('http://example.com/', ['example.com']));
 assert.throws(()=>validateTarget('https://example.com.evil/', ['example.com']));
 assert.throws(()=>validateTarget('https://user:pass@example.com/', ['example.com']));
 assert.throws(()=>validateTarget('https://example.com:444/', ['example.com']));
 assert.equal(validateTarget('https://example.com/', ['example.com']),'https://example.com');
});
test('website read-only SEO probe with injected network',async()=>{
 const paths=[];
 const fetchImpl=async(url,opts)=>{paths.push([url,opts.method,opts.redirect]);return response(url.endsWith('robots.txt')?'User-agent: *\nSitemap: https://example.com/sitemap.xml':url.endsWith('sitemap.xml')?'<urlset></urlset>':'<html lang="en"><head><title>Test</title><meta name="description" content="Hello"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://example.com/"></head></html>')};
 const r=await auditWebsite({target:'https://example.com/',allowedHosts:['example.com'],fetchImpl,resolveImpl:async()=>[{address:'93.184.215.14'}]});
 assert.equal(r.pages.length,3);assert.equal(r.checks.filter(x=>x.passed).length,8);assert.deepEqual(paths.map(x=>x[1]),['GET','GET','GET']);assert(paths.every(x=>x[2]==='manual'));
});
test('website blocks private DNS resolution',async()=>{await assert.rejects(()=>auditWebsite({target:'https://example.com/',allowedHosts:['example.com'],resolveImpl:async()=>[{address:'127.0.0.1'}],fetchImpl:()=>{throw Error('should not fetch')}}),/Non-public DNS/)});
test('GitHub CI rejects non-allowlisted repositories',()=>assert.throws(()=>validateRepo('other/repo',['owner/repo'])));
test('GitHub CI returns public-only metadata without writes',async()=>{
 const calls=[];
 const fetchImpl=async(url,opts)=>{calls.push([url,opts.method,opts.redirect]);return response(url.endsWith('/contents/.github/workflows')?JSON.stringify([{type:'file',name:'tests.yml'}]):url.includes('/actions/runs?')?JSON.stringify({workflow_runs:[{id:12,name:'Tests',status:'completed',conclusion:'success',event:'pull_request',head_branch:'feature',html_url:'https://github.com/example'}]}):JSON.stringify({private:false,default_branch:'main'}),200,'application/json')};
 const r=await auditGitHubCI({repo:'owner/repo',allowedRepos:['owner/repo'],fetchImpl});
 assert.equal(r.recentRuns[0].conclusion,'success');assert.equal(r.workflows[0],'tests.yml');assert(calls.every(x=>x[1]==='GET'&&x[2]==='manual'));
});
test('GitHub CI refuses private repositories',async()=>{await assert.rejects(()=>auditGitHubCI({repo:'owner/repo',allowedRepos:['owner/repo'],fetchImpl:async()=>response(JSON.stringify({private:true}),200,'application/json')}),/Only public/)});
