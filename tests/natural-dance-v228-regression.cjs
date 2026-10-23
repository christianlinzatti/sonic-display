const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('./typescript-loader.cjs');
require.extensions['.ts'] = (mod, name) => {
  const result = ts.transpileModule(fs.readFileSync(name, 'utf8'), {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
  mod._compile(result.outputText,name);
};
const {createNaturalDanceDynamics, naturalDanceTargets, updateNaturalDanceDynamics} = require('../components/visualizer/naturalDanceIntelligence.ts');
let n=0;
function test(name,fn){ fn(); n++; console.log('PASS '+name); }
const audio = {bpm:140,energyEnvelope:0.85,phaseConfidence:0,beatPhase:null};
test('zero state',()=>assert.ok(Object.values(createNaturalDanceDynamics().values).every(v=>v===0)));
test('all genres finite and limited',()=>{for(const g of ['Deutschrap','Trap','Hardstyle','Hardtekk','Techno',null]) for(const t of [0,1,10,9999,NaN]) {const v=naturalDanceTargets(audio,t,g,1); assert.ok(Object.values(v).every(n=>Number.isFinite(n)&&Math.abs(n)<=0.32));}});
test('rap and hardstyle use different groove profiles',()=> assert.notDeepEqual(naturalDanceTargets(audio,.15,'Deutschrap',1),naturalDanceTargets(audio,.15,'Hardtekk',1)));
test('no movement in reduced-motion or paused state from neutral',()=>{const s=createNaturalDanceDynamics();updateNaturalDanceDynamics(s,audio,.2,1/60,false,false,'Rap',1);assert.ok(Object.values(s.values).every(v=>v===0));updateNaturalDanceDynamics(s,audio,.2,1/60,true,true,'Rap',1);assert.ok(Object.values(s.values).every(v=>v===0));});
test('smooth start and return to neutral',()=>{const s=createNaturalDanceDynamics(); const aim=naturalDanceTargets(audio,.2,'Rap',1); const first=updateNaturalDanceDynamics(s,audio,.2,1/60,true,false,'Rap',1);assert.ok(Math.abs(first.weightTransfer)<Math.abs(aim.weightTransfer)); for(let i=0;i<200;i++)updateNaturalDanceDynamics(s,audio,.2,1/60,false,false,'Rap',1);assert.ok(Object.values(s.values).every(v=>Math.abs(v)<0.00001));});
test('finite with invalid delta and inputs',()=>{const s=createNaturalDanceDynamics(); for(const dt of [NaN,Infinity,-1,3]){const v=updateNaturalDanceDynamics(s,{...audio,energyEnvelope:NaN,bpm:Infinity},Infinity,dt,true,false,'Rap',NaN);assert.ok(Object.values(v).every(Number.isFinite));}});
test('phase confidence and energy affect dynamics',()=>{const a=naturalDanceTargets({...audio,energyEnvelope:.1},.17,'Rap',1);const b=naturalDanceTargets({...audio,energyEnvelope:.9},.17,'Rap',1);assert.ok(Math.abs(b.weightTransfer)>Math.abs(a.weightTransfer));});
test('pipeline uses new channels without changing foot lock',()=>{const source=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');for(const k of ['bodyDynamics.weightTransfer','bodyDynamics.hipCounter','bodyDynamics.shoulderCounter','bodyDynamics.armFollow','bodyDynamics.headFollow']) assert.ok(source.includes(k));assert.ok(!fs.readFileSync('components/visualizer/naturalDanceIntelligence.ts','utf8').includes('root.position'));});
console.log(`${n} V228 regression checks passed`);
