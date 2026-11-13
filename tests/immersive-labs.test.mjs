import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
for(const name of ["SentinelPulse","SERPMatrix","CloudHardener","ApexVitals","ZeroAuth","SpectraUI"]){
 test(name+" instrument integrates and parses",()=>{
  const html=readFileSync(new URL("../projects/"+name+"/web/index.html",import.meta.url),"utf8");
  const script=readFileSync(new URL("../projects/"+name+"/web/experience.js",import.meta.url),"utf8");
  assert.ok(html.includes('<script src="./experience.js" defer></script>'));
  assert.ok(script.includes("prefers-reduced-motion"));
  assert.ok(script.includes("AudioContext"));
  assert.ok(!/\bfetch\s*\(|XMLHttpRequest\s*\(/.test(script));
  new Function(script);
 });
}
