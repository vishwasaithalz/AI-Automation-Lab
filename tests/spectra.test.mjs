import test from "node:test";
import assert from "node:assert/strict";
import {rgb,luminance,contrast,grade,bestText,paletteAudit} from "../projects/SpectraUI/web/contrast.mjs";
test("hex parsing",{skip:false},()=>{
 assert.deepEqual(rgb("#fff"),[255,255,255]);
 assert.deepEqual(rgb("#123456"),[18,52,86]);
 assert.throws(()=>rgb("#gggggg"),/hex/);
});
test("reference black and white contrast",()=>{
 assert.ok(Math.abs(contrast("#000","#fff")-21)<0.000001);
 assert.equal(luminance("#000"),0);
 assert.equal(luminance("#fff"),1);
});
test("AAA rating uses genuine WCAG thresholds",()=>{
 assert.equal(grade("#000","#fff").AAA_normal,true);
 assert.equal(grade("#888","#888").AA_normal,false);
 assert.equal(contrast("#101010","#ededed"),contrast("#ededed","#101010"));
});
test("recommended foreground maximizes contrast of black versus white",()=>{
 assert.equal(bestText("#ffffff"),"#000000");
 assert.equal(bestText("#000000"),"#ffffff");
});

test("palette audit suggests readable text and compares every pair",()=>{
 const report=paletteAudit(["#ffffff","#000000","#808080"]);
 assert.equal(report.recommendations.length,3);
 assert.equal(report.pairs.length,3);
 assert.equal(report.recommendations[0].foreground,"#000000");
 assert.equal(report.recommendations[1].foreground,"#ffffff");
 assert.equal(report.pairs[0].AAA_normal,true);
 assert.throws(()=>paletteAudit(["#fff"]),/2 to 12/);
 assert.throws(()=>paletteAudit(["#fff","#zzzzzz"]),/hex/);
});
