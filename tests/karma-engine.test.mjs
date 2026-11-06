import test from 'node:test';
import assert from 'node:assert/strict';
import {run,validate,markdown} from '../src/karma-engine.mjs';
const job=(engine,action,id='a')=>({id,engine,action,inputs:{token:'secret',note:'Bearer abc123'}});
test('all six lanes are mock only',()=>{
 const jobs=[job('website-seo','audit-seo','a'),job('security-ci','check-ci','b'),job('video-music','prepare-video','c'),job('research-career-earnings','draft-offer','d'),job('memory-isolation','evaluate-memory','e'),job('publishing','prepare-publication','f')];
 const r=run({jobs});assert.equal(r.ok,true);assert.equal(r.summary.executed,0);assert.equal(r.results.length,6);assert.equal(r.results[4].status,'approval_required');assert.equal(r.results[5].status,'approval_required');assert.equal(r.results[0].inputs.token,'[REDACTED]');assert.equal(r.results[0].inputs.note,'Bearer [REDACTED]');assert.match(markdown(r),/No external actions were performed/);
});
test('rejects invalid or duplicate actions',()=>assert.equal(validate({jobs:[job('website-seo','deploy'),job('website-seo','audit-seo')]}).length,2));
test('rejects live policy',()=>assert.equal(run({jobs:[job('publishing','prepare-publication')]},{mode:'live',max_jobs:30}).ok,false));
test('rejects malformed plan',()=>assert.equal(run({jobs:'bad'}).ok,false));
test('does not mutate plan',()=>{const p={jobs:[job('website-seo','audit-design')]};run(p);assert.equal(p.jobs[0].inputs.token,'secret')});
