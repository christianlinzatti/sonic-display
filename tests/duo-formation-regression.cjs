require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require("node:assert/strict");const fs=require("node:fs");const path=require("node:path");
const read=n=>fs.readFileSync(path.join(__dirname,"..",n),"utf8");
const source=read("components/visualizer/duoFormationEngine.ts");
const three=read("components/visualizer/ThreeAvatar.tsx");
for(const mode of ['solo','sync','mirror','duet']) assert(source.includes(`case "${mode}"`));
for(const part of ["formationApproach", "Math.exp", "reducedMotion", "partnerVisible", "partner:[", "lead:["])assert(source.includes(part),part);
for(const part of ["FormationDancers", "useFrame", "visibility.current", "duoFormationTargets", "partner.current.scale.set", "<DuoDirectorTick", "secondary />"])assert(three.includes(part),part);
const ts = require('./typescript-loader.cjs');
if(ts){const vm=require('node:vm');const js=ts.transpileModule(source.replace('import type { DuoScene } from "./duoChoreographyDirector";',''),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;let exports={};vm.runInNewContext(js,{exports,Math});const t=exports.duoFormationTargets;
assert.equal(t('solo').partnerVisible,false);assert.equal(t('sync').partnerVisible,true);assert.equal(t('mirror').mirror,true);assert.equal(t('duet').mirror,false);
assert.equal(t('duet',1,0.25,true).lead[0],-.8);assert(Number.isFinite(t('duet',NaN,Infinity).lead[0]));
const approach=exports.formationApproach;assert(approach(0,1,.016)>0);assert(approach(0,1,.016)<1);assert.equal(approach(0,1,0),0);assert(Number.isFinite(approach(NaN,1,.016)));
for(const file of ["components/visualizer/duoFormationEngine.ts", "components/visualizer/ThreeAvatar.tsx"]){const d=ts.transpileModule(read(file),{fileName:file,compilerOptions:{jsx:ts.JsxEmit.Preserve,module:ts.ModuleKind.ESNext},reportDiagnostics:true}).diagnostics||[];assert.equal(d.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,file)} }
console.log("V142 formation engine: structure, easing, scene and syntax assertions passed");
