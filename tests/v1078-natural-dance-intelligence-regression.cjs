'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {planNaturalDanceV1078:plan,refineNaturalDanceV1078:refine}=load('lib/naturalDanceIntelligenceV1078');
const input=(overrides={})=>({enabled:true,strength:55,playing:true,reducedMotion:false,manualPriority:false,
 quality:'high',qualityGain:1,trackId:'spotify:v1078',seconds:48.375,bpm:132,genre:'Deutschrap',section:'verse',
 energy:.71,beat:.68,snare:.3,slot:0,count:2,footIKEnabled:true,contactKnown:true,
 plantedLeft:false,plantedRight:false,...overrides});
const base={hipSway:.04,legGroove:.13,footStep:.11,weightShift:.08,shoulderRoll:.14,
 spineSway:.05,chestPulse:.06,headNod:.15,armSwing:.05,hipVertical:.1,hipLateral:.12,footLift:.3};
const cue=plan(input());assert(cue.active&&cue.reason==='music');
assert.deepEqual(cue,plan(input()),'deterministic music-gated movement');
const changed=refine(base,input());assert(changed.cue.active);
assert.notStrictEqual(changed.motion,base);assert.notDeepEqual(changed.motion,base);
for(const key of ['headNod','armSwing','hipVertical','hipLateral','footLift'])assert.equal(changed.motion[key],base[key],key);
assert.deepEqual(base,{hipSway:.04,legGroove:.13,footStep:.11,weightShift:.08,
 shoulderRoll:.14,spineSway:.05,chestPulse:.06,headNod:.15,armSwing:.05,
 hipVertical:.1,hipLateral:.12,footLift:.3},'immutable legacy input');
for(const [change,reason] of [
 [{enabled:false},'disabled'],[{strength:0},'disabled'],[{strength:NaN},'disabled'],
 [{playing:false},'paused'],[{reducedMotion:true},'motion-budget'],[{quality:'low'},'motion-budget'],
 [{manualPriority:true},'manual'],[{footIKEnabled:false},'no-foot-evidence'],
 [{contactKnown:false},'no-foot-evidence'],[{trackId:''},'evidence'],[{trackId:null},'evidence'],
 [{trackId:'x'.repeat(161)},'evidence'],[{seconds:-1},'evidence'],[{seconds:NaN},'evidence'],
 [{bpm:40},'evidence'],[{bpm:250},'evidence'],[{bpm:NaN},'evidence'],
 [{energy:NaN},'evidence'],[{beat:Infinity},'evidence'],[{snare:NaN},'evidence'],
 [{qualityGain:NaN},'evidence'],[{qualityGain:1.2},'evidence'],[{qualityGain:-1},'evidence'],
 [{count:0},'evidence'],[{count:5},'evidence'],[{slot:-1},'evidence'],[{slot:2},'evidence'],
 [{section:'unknown'},'section']]){
 const out=refine(base,input(change));
 assert.strictEqual(out.motion,base,'bypass must preserve reference '+JSON.stringify(change));
 assert(!out.cue.active);assert.equal(out.cue.reason,reason);
}
const plantedBoth=refine(base,input({plantedLeft:true,plantedRight:true}));
for(const k of ['hipSway','legGroove','footStep','weightShift'])assert.equal(plantedBoth.motion[k],base[k],`both feet ${k}`);
const plantedOne=refine(base,input({plantedLeft:true,plantedRight:false}));
for(const k of ['legGroove','footStep','weightShift'])assert.equal(plantedOne.motion[k],base[k],`support foot ${k}`);
assert(Math.abs(plantedOne.cue.hip)<=Math.abs(cue.hip)*.25+1e-12);
const nearCap={...base,hipSway:.9,legGroove:.8,footStep:.8,weightShift:-.9};
const bounded=refine(nearCap,input());
assert(bounded.motion.hipSway<=nearCap.hipSway+1e-12);
for(const k of ['legGroove','footStep','weightShift'])assert(Math.abs(bounded.motion[k])<=Math.abs(nearCap[k])+1e-12);
assert.strictEqual(refine({...base,footStep:Infinity},input()).cue.reason,'invalid-base');
let total=0;const variety=new Set();
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 for(let i=0;i<10000;i++){
  const p=input({genre,slot:i%4,count:4,seconds:i*.029,energy:(i%87)/86,
   beat:(i%61)/60,snare:(i%43)/42,strength:i%90,
   section:['verse','hook','intro','build','finale'][i%5],
   plantedLeft:i%11===0,plantedRight:i%13===0,quality:i%7===0?'balanced':'high'});
  const d=plan(p);total++;assert(Number.isFinite(d.hip));
  if(d.active)variety.add(d.motif);
  for(const [k,max] of [['hip',.028],['leg',.036],['step',.042],['weight',.03],
   ['shoulder',.042],['spine',.027],['chest',.026]]){
   assert(Number.isFinite(d[k])&&Math.abs(d[k])<=max+1e-12,`${k} ${i}`);
  }
  const m=refine(base,p).motion;
  for(const [k,max] of [['hipSway',.65],['legGroove',.65],['footStep',.65],
   ['weightShift',.65],['shoulderRoll',.65],['spineSway',.65],['chestPulse',.65]])
   assert(Number.isFinite(m[k])&&Math.abs(m[k])<=max+1e-12,`${k} ${i}`);
 }
}
assert.equal(total,40000);assert.equal(variety.size,4);
// Phrase crossfade must not jump at 8-beat boundaries.
for(const beatBoundary of [8,16,24,32,40]){
 const seconds=beatBoundary*60/132;
 const before=plan(input({seconds:seconds-.00001})),after=plan(input({seconds:seconds+.00001}));
 for(const k of ['hip','leg','step','weight','shoulder','spine','chest'])
  assert(Math.abs(before[k]-after[k])<.007,`smooth ${beatBoundary} ${k}`);
}
for(const file of ['types/music.ts','components/visualizer/registry.tsx',
 'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/GltfDancerAvatarV492.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('arenaNaturalDanceEnabledV1078'),file);
const dancer=read('components/visualizer/GltfDancerAvatarV492.tsx');
assert(dancer.includes('refineNaturalDanceV1078(baseDebugMotionV1024,'));
assert(dancer.includes('stepDanceChoreographyV1024(danceStateV1024.current,naturalDanceV1078.motion'));
assert(dancer.indexOf('refineNaturalDanceV1078(baseDebugMotionV1024,')<dancer.indexOf('stepDanceChoreographyV1024('));
assert(dancer.indexOf('stepDanceChoreographyV1024(')<dancer.indexOf('refineNaturalFootworkRigV839(naturalFootworkV839.current,debugMotion'));
assert(dancer.indexOf('refineNaturalFootworkRigV839(naturalFootworkV839.current,debugMotion')<dancer.indexOf('updateFootGrounding({delta'));
assert(read('context/UiPreferencesContext.tsx').includes('arenaNaturalDanceEnabledV1078:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1078 · Natural Dance Intelligence 4.0'));
for(const bad of ['fetch(','setInterval(','setTimeout(','Math.random(','Date.now(','requestAnimationFrame(','WebSocket(',
 'localStorage','new AnimationMixer(','morphTargetInfluences','navigator.','footIK.current','position.y'])
 assert(!read('lib/naturalDanceIntelligenceV1078.ts').includes(bad),bad);
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert.equal(pkg.version,'0.1.0-v1078');assert.equal(lock.version,pkg.version);
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(file).includes('tests/v1078-natural-dance-intelligence-regression.cjs'));
console.log(`PASS V1078: ${total.toLocaleString('en-US')} bounded motion samples, 4 motifs, foot-IK, manual override, all stage props and production gates`);
