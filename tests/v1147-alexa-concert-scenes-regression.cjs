'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const source=fs.readFileSync(path.join(__dirname,'../lib/alexaConcertScenesV1147.ts'),'utf8');
const result=ts.transpileModule(source,{fileName:'alexaConcertScenesV1147.ts',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
assert.equal(result.diagnostics.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
const mod={exports:{}};vm.runInNewContext(result.outputText,{module:mod,exports:mod.exports,Object,Number,Math,Error});
const plan=mod.exports.planConcertSceneV1147;
const base={scene:'intense',genre:'hardtekk',showConsent:true,goveeConsent:false,musicSyncConsent:true,reducedMotion:false,masterBrightness:50};
assert.throws(()=>plan({...base,showConsent:false}),/freigabe/);
assert.throws(()=>plan({...base,scene:'strobe'}),/Unbekannte/);
assert.throws(()=>plan({...base,masterBrightness:101}),/Helligkeit/);
assert.equal(plan(base).brightnessCap,50);
assert.equal(plan(base).goveeAllowed,false);
assert.equal(plan({...base,goveeConsent:true}).goveeAllowed,true);
assert.equal(plan({...base,goveeConsent:true,musicSyncConsent:false}).goveeAllowed,false);
assert.equal(plan({...base,reducedMotion:true}).rotationAllowed,false);
assert(plan({...base,reducedMotion:true,scene:'finale'}).stageIntensity<=40);
for(const genre of ['deutschrap','hardtekk','deutschrock','other'])
 for(const scene of ['calm','intense','finale']){
  const x=plan({...base,genre,scene});
  assert(x.brightnessCap<=base.masterBrightness);
  assert(Object.values(x.lightColor).every(v=>v>=0&&v<=255));
 }
console.log('PASS V1147: scene planning, opt-in gates, brightness caps, reduced motion, genre palettes');
