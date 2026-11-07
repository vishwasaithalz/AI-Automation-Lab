import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
for(const name of ['SentinelPulse','SERPMatrix','CloudHardener','ApexVitals']){
 test(name+' static workbench has valid inline JS and real controls',()=>{
  const html=readFileSync(new URL('../projects/'+name+'/web/index.html',import.meta.url),'utf8');
  assert.match(html,/<meta name="viewport"/);
  assert.match(html,/aria-live="polite"/);
  assert.match(html,new RegExp('<title>'+name));
  assert.match(html,/document\.getElementById\(/);
  const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length,1);
  assert.ok(scripts[0][1].length>500);
  new Script(scripts[0][1]);
 });
}
