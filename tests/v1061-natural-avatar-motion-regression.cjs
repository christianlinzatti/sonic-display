'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {planNaturalMotionV1061:plan,overlayNaturalMotionV1061:overlay}=load('lib/naturalAvatarMotionV1061');
const input=(overrides={})=>({enabled:true,strength:55,playing:true,reducedMotion:false,
 manualPriority:false,quality:'high',trackId:'spotify:motion-v1061',seconds:48.5,
 bpm:127,energy:.62,beat:.34,snare:.25,genre:'Deutschrap',section:'verse',slot:0,
 footIKEnabled:true,contactKnown:true,plantedLeft:false,plantedRight:false,...overrides});
const c=plan(input());assert(c.active&&c.reason==='music');
assert.deepEqual(c,plan(input()),'deterministic music cues');
assert(c.hip!==0&&c.shoulder!==0&&c.spine!==0);
const neutral=plan(input({enabled:false}));assert(!neutral.active);
for(const [override,reason] of [
 [{strength:0},'disabled'],[{strength:NaN},'disabled'],[{playing:false},'paused'],
 [{reducedMotion:true},'motion-budget'],[{quality:'low'},'motion-budget'],
 [{manualPriority:true},'manual'],[{trackId:null},'evidence'],[{trackId:''},'evidence'],
 [{seconds:-1},'evidence'],[{seconds:Infinity},'evidence'],[{seconds:NaN},'evidence'],
 [{bpm:0},'evidence'],[{bpm:null},'evidence'],[{bpm:Infinity},'evidence'],
 [{bpm:300},'evidence'],[{beat:NaN},'evidence'],[{slot:-1},'evidence'],
 [{energy:NaN},'evidence'],[{snare:Infinity},'evidence']]){
 const result=plan(input(override));
 assert(!result.active,JSON.stringify(override));assert.equal(result.reason,reason);
 for(const k of ['hip','shoulder','spine','chest'])assert.equal(result[k],0,k);
}
// Foot-IK and support evidence always beat new pelvis rotations.
for(const override of [
 {footIKEnabled:false},{contactKnown:false},{plantedLeft:true,plantedRight:true}]){
 const result=plan(input(override));assert(result.active);assert.equal(result.hip,0);
 assert(Number.isFinite(result.shoulder),'torso remains available');
}
const free=plan(input({plantedLeft:false,plantedRight:false}));
const one=plan(input({plantedLeft:true,plantedRight:false}));
assert(Math.abs(one.hip)<Math.abs(free.hip)*.4);
// Genre and section variety but identical constraints.
let different=false;
for(const genre of ['Deutschrap','Hardtekk','Hardstyle','Deutschrock','Pop']){
 for(const section of ['intro','verse','build','hook','bridge','drop','finale']){
  const cue=plan(input({genre,section}));
  assert(cue.active,`${genre} ${section}`);
  for(const [k,limit] of [['hip',.036],['shoulder',.075],['spine',.045],['chest',.035]])
   assert(Number.isFinite(cue[k])&&Math.abs(cue[k])<=limit+1e-12,`${genre} ${section} ${k}`);
  if(cue.shoulder!==c.shoulder)different=true;
 }
}
assert(different);
for(let i=0;i<10000;i++){
 const cue=plan(input({seconds:i*.071,slot:i%4,energy:(i%101)/100,
  beat:(i%83)/82,snare:(i%53)/52,strength:i%120}));
 for(const [k,limit] of [['hip',.036],['shoulder',.075],['spine',.045],['chest',.035]])
  assert(Number.isFinite(cue[k])&&Math.abs(cue[k])<=limit+1e-12,`${i} ${k}`);
}
const base={headNod:.02,headTurn:0,spineSway:.04,hipSway:.02,shoulderRoll:.02,
 followThrough:0,headLag:0,chestPulse:.02,armSwing:0,legGroove:.3,footStep:.25,
 weightShift:.12,beatImpulse:0,expressionJaw:0,expressionBrow:0,
 expressionEyeNarrow:0,expressionHeadTilt:0,hipVertical:.11,hipLateral:.07,
 hipPitch:.05,hipRoll:.02};
const original=structuredClone(base);
assert.equal(overlay(base,neutral),base,'disabled is same object');
const combined=overlay(base,c);
assert.deepEqual(base,original,'pure planner may not mutate existing GLB channels');
assert.notEqual(combined,base);
const changed=new Set(Object.keys(combined).filter(k=>combined[k]!==base[k]));
assert.deepEqual([...changed].sort(),['chestPulse','hipSway','shoulderRoll','spineSway']);
for(const key of ['legGroove','footStep','weightShift','hipVertical','hipLateral','hipPitch','hipRoll'])
 assert.equal(combined[key],base[key],`unchanged foot/hip translation ${key}`);
const capped=overlay({...base,hipSway:.65,shoulderRoll:.65,spineSway:.65,chestPulse:.65},c);
for(const key of ['hipSway','shoulderRoll','spineSway','chestPulse'])assert(Math.abs(capped[key])<=.65);
// Integration: 3D models pass existing final footwork + IK; fallback never alters foot/root.
const glb=read('components/visualizer/GltfDancerAvatarV492.tsx');
const proc=read('components/visualizer/ProceduralDancerAvatarV492.tsx');
assert(glb.includes('const debugMotion = overlayNaturalMotionV1061(danceV1024.motion,naturalCueV1061)'));
assert(glb.indexOf('overlayNaturalMotionV1061(danceV1024.motion,naturalCueV1061)')<glb.indexOf('refineNaturalFootworkRigV839(naturalFootworkV839.current,debugMotion'));
assert(glb.indexOf('refineNaturalFootworkRigV839(naturalFootworkV839.current,debugMotion')<glb.indexOf('updateFootGrounding({delta'));
assert(glb.includes('manualPriority:hipManualPriorityV735||avatarMotionMode'));
assert(proc.includes('planNaturalMotionV1061({')&&proc.includes('footIKEnabled:false,contactKnown:false'));
assert(proc.includes('+ naturalCueV1061.spine')&&proc.includes('naturalCueV1061.shoulder'));
assert(!proc.includes('root.current.rotation.y += naturalCueV1061.hip'));
for(const file of ['types/music.ts','components/visualizer/registry.tsx',
 'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('arenaNaturalMotionEnabledV1061'),file);
assert(read('context/UiPreferencesContext.tsx').includes('arenaNaturalMotionEnabledV1061:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1061 · Natural Avatar Motion 3.0'));
const source=read('lib/naturalAvatarMotionV1061.ts');
for(const bad of ['fetch(','setTimeout(','setInterval(','Math.random(','Date.now(',
 'localStorage','WebSocket(','new AnimationMixer(','requestAnimationFrame(','navigator.'])
 assert(!source.includes(bad),bad);
const pkg=JSON.parse(read('package.json'));
assert(pkg.scripts.prebuild.includes('npm run test:v1061 && npm run test:v1061:types &&'));
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(file).includes('tests/v1061-natural-avatar-motion-regression.cjs'));
console.log('PASS V1061 Natural Avatar Motion 3.0: 10k bounded samples, IK, manual priority, props and CI');
