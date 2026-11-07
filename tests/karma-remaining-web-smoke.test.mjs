import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";

for(const project of ["ZeroAuth","SpectraUI"]){
 test(project+" web workbench references real elements and loads syntactically valid JavaScript",()=>{
  const root=new URL("../projects/"+project+"/web/",import.meta.url);
  const html=readFileSync(new URL("index.html",root),"utf8");
  const app=readFileSync(new URL("app.mjs",root),"utf8");
  assert.match(html,/<meta name="viewport"/);
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/<script type="module" src="\.\/app\.mjs"/);
  for(const match of app.matchAll(/\$\("([a-zA-Z0-9-]+)"\)/g)){
   assert.ok(html.includes('id="'+match[1]+'"'),"Missing HTML id: "+match[1]);
  }
  for(const filename of project==="ZeroAuth"?["app.mjs","auth-core.mjs"]:["app.mjs","contrast.mjs"]){
   const parsed=spawnSync(process.execPath,["--check",fileURLToPath(new URL(filename,root))],{encoding:"utf8"});
   assert.equal(parsed.status,0,filename+": "+parsed.stderr);
  }
 });
}
