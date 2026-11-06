import test from 'node:test';
import assert from 'node:assert/strict';
import {collectReport} from '../src/consolidated-readonly-report.mjs';

test('consolidates public read-only checks and isolates failures',async()=>{
 const seen=[];
 const report=await collectReport({
  targets:{websites:['https://example.com/','https://broken.example/'],repos:['owner/public']},
  now:()=>new Date('2026-11-05T00:00:00Z'),
  websiteAudit:async({target,allowedHosts})=>{
   seen.push([target,allowedHosts[0]]);
   if(target.includes('broken'))throw Error('unavailable');
   return {checks:[{id:'title',passed:true},{id:'canonical',passed:false}]};
  },
  githubAudit:async({repo,allowedRepos})=>{
   assert.deepEqual(allowedRepos,[repo]);
   return {checks:[{id:'public_repo',passed:true}]};
  }
 });
 assert.equal(report.mode,'read-only');
 assert.deepEqual(report.summary,{passed:2,failed:1,errors:1});
 assert.equal(report.websites.length,2);
 assert.equal(report.repositories.length,1);
 assert.equal(report.websites[1].error,'unavailable');
 assert.deepEqual(seen,[['https://example.com/','example.com'],['https://broken.example/','broken.example']]);
});
test('empty target list is safe',async()=>{
 const report=await collectReport({targets:{websites:[],repos:[]}});
 assert.deepEqual(report.summary,{passed:0,failed:0,errors:0});
});
