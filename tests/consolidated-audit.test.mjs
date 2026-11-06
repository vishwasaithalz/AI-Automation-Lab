import test from 'node:test';
import assert from 'node:assert/strict';
import {runConsolidatedAudit} from '../src/consolidated-audit.mjs';

test('aggregates successful public audits without mutation',async()=>{
 const report=await runConsolidatedAudit({
  websites:['https://example.com/'],repositories:['example/repo'],
  websiteAudit:async ({target,allowedHosts})=>{assert.deepEqual(allowedHosts,['example.com']);return {origin:target,checks:[]}},
  githubAudit:async ({repo,allowedRepos})=>{assert.deepEqual(allowedRepos,[repo]);return {repo,checks:[]}}
 });
 assert.equal(report.completed,2);assert.equal(report.failed,0);assert.equal(report.mode,'read-only');
});
test('isolates failures and continues other checks',async()=>{
 const report=await runConsolidatedAudit({
  websites:['https://example.com/'],repositories:['example/repo'],
  websiteAudit:async()=>{throw Error('unreachable')},
  githubAudit:async()=>({checks:[]})
 });
 assert.equal(report.failed,1);assert.equal(report.completed,1);assert.equal(report.results[0].error,'unreachable');
});
