/* Dependency-free regression checks for pure motion modules (uses globally-installed TypeScript). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('./typescript-loader.cjs');
const original = require.extensions['.ts'];
require.extensions['.ts'] = function(mod, filename) {
 const src = fs.readFileSync(filename, 'utf8');
 const result = ts.transpileModule(src, {fileName:filename, compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true});
 const errors=(result.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
 assert.equal(errors.length,0,`${filename}: ${errors.map(e=>ts.flattenDiagnosticMessageText(e.messageText,' ')).join('; ')}`);
 mod._compile(result.outputText,filename);
};
const momentum = require('../components/visualizer/danceMomentumEngine.ts');
const coord = require('../components/visualizer/naturalDanceCoordination.ts');
const natural = require('../components/visualizer/naturalMotionEngine.ts');
const empty = {torsoTwist:0,counterArm:0,hipCounter:0,headCounter:0,kneeFollow:0};
const target = {torsoTwist:0.09,counterArm:0.08,hipCounter:-0.05,headCounter:0.04,kneeFollow:0.03};
let checked=0;
function test(name,run){run();checked++;console.log('PASS '+name)}
test('paused/reduced motion returns neutral coordination',()=>{
 assert.deepEqual(coord.computeNaturalDanceCoordination({bpm:90,energyEnvelope:1},2,false,false,'Deutschrap',1),empty);
 assert.deepEqual(coord.computeNaturalDanceCoordination({bpm:90,energyEnvelope:1},2,true,true,'Deutschrap',1),empty);
});
test('dance genres produce finite coordinates',()=>{
 for(const genre of ['Deutschrap','Trap','Hardstyle','Hardtekk','Techno']) for(const t of [0,.1,2,40]) {
  const p=coord.computeNaturalDanceCoordination({bpm:160,energyEnvelope:.8},t,true,false,genre,1);
  assert.ok(Object.values(p).every(Number.isFinite));
 }
});
test('momentum stays inside configured limits',()=>{
 const s=momentum.createMomentumState();
 const max={torsoTwist:.14,counterArm:.18,hipCounter:.11,headCounter:.06,kneeFollow:.08};
 for(let i=0;i<300;i++){
 const v=momentum.updateMomentumState(s,{torsoTwist:9,counterArm:-9,hipCounter:9,headCounter:-9,kneeFollow:9},1/60,'Hardtekk',true,false);
 for(const [k,n] of Object.entries(max))assert.ok(Number.isFinite(v[k])&&Math.abs(v[k])<=n+1e-8,k);
 }
});
test('momentum resets on pause and reduced motion',()=>{
 const s=momentum.createMomentumState();
 momentum.updateMomentumState(s,target,1/60,'Deutschrap',true,false);
 assert.deepEqual(momentum.updateMomentumState(s,target,1/60,'Deutschrap',false,false),empty);
 assert.deepEqual(s.velocity,empty);
 momentum.updateMomentumState(s,target,1/60,'Deutschrap',true,false);
 assert.deepEqual(momentum.updateMomentumState(s,target,1/60,'Deutschrap',true,true),empty);
});
test('invalid physics delta/targets do not cause NaN',()=>{
 const s=momentum.createMomentumState();
 for(const delta of [NaN,Infinity,-1,100]) {
  const p=momentum.updateMomentumState(s,{...target,torsoTwist:NaN,hipCounter:Infinity},delta,'Trap',true,false);
  assert.ok(Object.values(p).every(Number.isFinite));
 }
});
test('motion personality mappings remain compatible',()=>{
 assert.equal(natural.resolveMotionPersonality('Hardtekk'),'hardstyle');
 assert.equal(natural.resolveMotionPersonality('Hardstyle'),'hardstyle');
 assert.equal(natural.resolveMotionPersonality('Deutschrap'),'default');
});
console.log(`${checked} motion regression checks passed`);
require.extensions['.ts']=original;
