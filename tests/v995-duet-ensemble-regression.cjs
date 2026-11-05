'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {DEFAULT_DUET_V995,normalizeDuetV995,refineDuetEnsembleV995}=load('components/visualizer/duetEnsembleDirectorV995');
const {planNaturalMultiArtistStageV807}=load('components/visualizer/naturalMultiArtistStageInteractionV807');
const bridge=load('components/visualizer/concertStageSyncV882');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const settings={...DEFAULT_DUET_V995,enabled:true};
const cue=(style='reply',count=2)=>({active:true,source:'line-timed',style,lineIndex:12,
 leadSlot:1,partnerSlot:style==='duet'?0:null,handoffFrom:style==='reply'?0:null,
 singingSlots:style==='hook'?Array.from({length:count},(_,i)=>i):style==='duet'?[0,1]:[1],
 emphasis:.75,startMs:1000,endMs:4000,count});
const duet=(mode='handoff')=>({active:true,mode,trackId:'track-A',leadSlot:1,
 respondingSlot:mode==='ensemble'?null:0,participants:mode==='ensemble'?[0,1,2]:[0,1],
 handoffBlend:.5,glanceStrength:.16,cameraStrength:0,lightingStrength:0});
const positions=[[ -1.25,0,0],[1.25,0,0],[0,0,.8],[.7,0,1.3]];
function sample(patch={},c=cue(),d=duet()){
 const frame={trackId:'track-A',cueTrackId:'track-A',cue:c,
 progressMs:2150,count:c.count,positions:positions.slice(0,c.count),
 playing:true,reducedMotion:false,automatic:true,manualPriority:false,
 lyricsVisible:false,tier:'high',settings};
 const i={...frame,...patch};
 const stage=planNaturalMultiArtistStageV807({...i,beat:.6,strength:65});
 return {stage,output:refineDuetEnsembleV995(stage,d,i)};
}
let n=0;
function check(label,fn){try{fn();n++;console.log('PASS V995 '+label)}catch(e){e.message='V995 '+label+': '+e.message;throw e;}}
check('opt-in default, strict normalization and finite clamps',()=>{
 assert.equal(DEFAULT_DUET_V995.enabled,false);
 assert.equal(normalizeDuetV995({enabled:'true'}).enabled,false);
 assert.equal(normalizeDuetV995({style:'invalid'}).style,'natural');
 assert.equal(normalizeDuetV995({style:'arena'}).style,'arena');
 assert.equal(normalizeDuetV995({style:'responsive'}).style,'responsive');
 assert.equal(normalizeDuetV995({intensity:Infinity}).intensity,55);
 assert.equal(normalizeDuetV995({intensity:-100}).intensity,0);
 assert.equal(normalizeDuetV995({intensity:1000}).intensity,100);
 assert.equal(normalizeDuetV995({partnerGaze:false}).partnerGaze,false);
});
check('reply: brief gentle lead and former singer accents, original untouched',()=>{
 const {stage,output}=sample();assert(stage.active);assert(output.active);
 assert.equal(output.mode,'reply');assert.deepEqual(output.affectedSlots,[1,0]);
 assert.notStrictEqual(output.stage,stage);
 for(let i=0;i<2;i++){
  assert(output.stage.slots[i].gesture.leftLift>=stage.slots[i].gesture.leftLift);
  assert(output.stage.slots[i].gesture.rightLift>=stage.slots[i].gesture.rightLift);
  assert(output.stage.slots[i].gesture.intensity<=.12);
  assert(Math.abs(output.stage.slots[i].look.yaw)<=.42);
 }
 assert.equal(stage.slots[0].gesture.intensity,planNaturalMultiArtistStageV807({
  trackId:'track-A',cueTrackId:'track-A',cue:cue(),progressMs:2150,count:2,
  positions:positions.slice(0,2),playing:true,reducedMotion:false,manualPriority:false,
  tier:'high',beat:.6,strength:65}).slots[0].gesture.intensity);
});
check('duet: only verified two singers exchange gestures',()=>{
 const c=cue('duet');const {output}=sample({},c,duet('duet'));
 assert(output.active&&output.mode==='duet');assert.deepEqual(output.affectedSlots,[1,0]);
 assert.equal(sample({},c,duet('handoff')).output.active,false);
});
check('hook: verified group sings together, no invented partner roles',()=>{
 const c=cue('hook',3);const {output}=sample({},c,undefined);
 assert(output.active);assert.equal(output.mode,'hook');
 assert.deepEqual(output.affectedSlots,[0,1,2]);
 for(let i=0;i<3;i++)assert.equal(output.stage.slots[i].look.yaw,0);
 assert.equal(sample({},cue('hook',2),undefined).output.active,true);
 assert.equal(sample({settings:{...settings,sharedHooks:false}},c,undefined).output.active,false);
});
check('disabled or protected modes are identical no-ops',()=>{
 for(const patch of [
  {settings:{...settings,enabled:false}},{settings:{...settings,intensity:0}},
  {playing:false},{automatic:false},{manualPriority:true},{reducedMotion:true},
  {tier:'low'},{lyricsVisible:true},{progressMs:0},{progressMs:4000},
  {trackId:'other'},{cueTrackId:'other'},
  {positions:[[0,0,0],[.1,0,0]]},{positions:[[0,0,0],[20,0,0]]},
  {positions:[[NaN,0,0],[1,0,0]]},{collisionRisk:[.25,.25]},
  {collisionRisk:[NaN,0]},{count:5},{progressMs:NaN},
 ]){
  const {stage,output}=sample(patch);
  assert.strictEqual(output.stage,stage,JSON.stringify(patch));
  assert(!output.active,JSON.stringify(patch));
 }
});
check('wrong duet cast and corrupt singer evidence are rejected',()=>{
 for(const bad of [
  {...duet(),trackId:'old'}, {...duet(),leadSlot:0},
  {...duet(),participants:[1,1]}, {...duet(),participants:[0,3]},
  {...duet(),respondingSlot:1}, {...duet(),active:false}
 ])assert.equal(sample({},cue(),bad).output.active,false);
 for(const broken of [
  {...cue(),source:'none'}, {...cue(),singingSlots:[0]},
  {...cue(),leadSlot:-1}, {...cue(),count:5},
  {...cue(),startMs:3000,endMs:3000}, {...cue(),lineIndex:-1}
 ])assert.equal(sample({},broken,duet()).output.active,false);
});
check('settings turn off individual motives, not other show subsystems',()=>{
 assert.equal(sample({settings:{...settings,handoffGestures:false}}).output.active,false);
 const a=sample({settings:{...settings,partnerGaze:false}});
 assert(a.output.active);
 for(let i=0;i<2;i++)assert.equal(a.output.stage.slots[i].look.yaw,a.stage.slots[i].look.yaw);
 assert(sample({settings:{...settings,protectLyrics:false},lyricsVisible:true}).output.active);
});
check('safe small motion, no root, audio or face modifications',()=>{
 const {stage,output}=sample();
 for(let i=0;i<2;i++){
  const diff=output.stage.slots[i].gesture.intensity-stage.slots[i].gesture.intensity;
  assert(diff>=0&&diff<.03);
  assert(!('root' in output.stage.slots[i])&&!('mouth' in output.stage.slots[i]));
  assert(output.stage.slots[i].gesture.leftLift<=.08);
 }
});
check('track and duration scoped bridge stores settings, resets on publish(null)',()=>{
 const sig={...bridge.OFF_CONCERT_SIGNAL_V882,trackId:'track-A',durationMs:120000,
 playing:true,enabled:true,intensity:.9,sceneSource:'verified',sceneStartMs:1000,
 duetSettingsV995:{...settings,intensity:1000,style:'invalid'}};
 bridge.publishConcertStageSyncV882(sig);
 assert.equal(bridge.readConcertStageSyncV882().duetSettingsV995.intensity,100);
 assert.equal(bridge.readConcertStageSyncV882().duetSettingsV995.style,'natural');
 bridge.publishConcertStageSyncV882({...sig,duetSettingsV995:{...settings,enabled:false}});
 assert.equal(bridge.readConcertStageSyncV882().duetSettingsV995.enabled,false);
 bridge.publishConcertStageSyncV882(null);
 assert.equal(bridge.readConcertStageSyncV882().trackId,'');
});
check('10,000 deterministic duet/ensemble states bounded',()=>{
 let seed=995;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
 for(let k=0;k<10000;k++){
  const mode=k%3===0?'reply':k%3===1?'duet':'hook';
  const count=mode==='hook'?3:2;
  const c=cue(mode,count);
  const d=mode==='hook'?undefined:duet(mode==='reply'?'handoff':'duet');
  const x=sample({progressMs:1000+rand()*3000,
   settings:{...settings,intensity:rand()*120,style:['natural','responsive','arena'][k%3]},
   collisionRisk:Array.from({length:count},()=>rand()*.20)},c,d);
  for(const slot of x.output.stage.slots){
   for(const value of [slot.look.yaw,slot.look.eyeYaw,slot.look.weight,slot.gesture.leftLift,
    slot.gesture.rightLift,slot.gesture.shoulder,slot.gesture.intensity])assert(Number.isFinite(value));
   assert(Math.abs(slot.look.yaw)<=.42);assert(slot.look.weight<=.46);
   assert(slot.gesture.intensity<=.12);assert(Math.abs(slot.gesture.shoulder)<=.06);
  }
 }
});
check('runtime wiring uses the existing frame, studio and safe bridge',()=>{
 const scene=read('components/visualizer/GroupDancersV326SceneV492.tsx');
 const ui=read('components/visualizer/LiveFxDeckV881.tsx');
 const sync=read('components/visualizer/concertStageSyncV882.ts');
 const core=read('components/visualizer/duetEnsembleDirectorV995.ts');
 assert(scene.includes('refineDuetEnsembleV995(directedInteractionV838,vocalDuetV838'));
 assert(scene.includes('finalInteractionV995.slots[i]'));
 assert(!core.includes('useFrame(')&&!core.includes('navigator.mediaDevices'));
 assert(ui.includes('V995 · Duet &amp; Ensemble 3.0'));
 assert(ui.includes('DUET_KEY_V995')&&ui.includes('updateDuetV995'));
 assert(ui.includes('duetSettingsV995:normalizeDuetV995'));
 assert(sync.includes('normalizeDuetV995(input.duetSettingsV995)'));
});
check('release metadata, safety and CI gates',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('v').at(-1))>=995);assert(Number(pkg.sonicFeatureRelease.slice(1))>=995);
 assert(pkg.scripts.prebuild.includes('npm run test:v995 && npm run test:v995:types'));
 assert(read('scripts/vercel-production-build.cjs').includes('tests/v995-duet-ensemble-regression.cjs'));
 assert(read('.github/workflows/v832-continuous-validation.yml').includes('test:v995'));
});
console.log('PASS V995: '+n+' groups');
