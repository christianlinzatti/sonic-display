'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/naturalDuetFeatureInteractionV664');
const {planIntelligentRapDuetV500:plan}=load('components/visualizer/intelligentRapDuetPerformanceV500');
const positions=[[-2,0,0],[-.7,0,.1],[.8,0,.1],[2,0,0]];
const cue={active:true,style:'duet',lineIndex:7,leadSlot:1,partnerSlot:2,singingSlots:[1,2],
 handoffFrom:null,phase:.5,emphasis:.85,startMs:1000,endMs:6000,source:'word-timed',count:4};
const input={trackId:'rap-duet-664',cueTrackId:'rap-duet-664',cue,progressMs:1650,count:4,positions,
 playing:true,reducedMotion:false,manualPriority:false,tier:'high',beat:.8,strength:85,
 interactionModeV664:'natural'};
const run=(patch={})=>plan({...input,...patch});
const raw=()=>({...input,interactionModeV664:'off'});
let checks=0;const test=(label,cb)=>{try{cb();checks++;}catch(e){e.message='V664 '+label+': '+e.message;throw e;}};
test('off by default, optional field leaves legacy behavior',()=>{
 const a=run({interactionModeV664:'off'}),b=run({interactionModeV664:undefined});assert.deepEqual(a,b);
});
test('song-scoped explicit selection and invalid values',()=>{
 v.clearNaturalDuetModeV664();assert.equal(v.getNaturalDuetModeV664(input.trackId),'off');
 assert(v.setNaturalDuetModeV664(input.trackId,'natural'));
 assert.equal(v.getNaturalDuetModeV664(input.trackId),'natural');
 assert.equal(v.getNaturalDuetModeV664('another'),'off');
 for(const mode of ['auto','natural ',null,'guess'])assert.equal(v.setNaturalDuetModeV664(input.trackId,mode),false);
 for(const trackId of ['', 'x'.repeat(251)])assert.equal(v.setNaturalDuetModeV664(trackId,'natural'),false);
 assert(v.setNaturalDuetModeV664(input.trackId,'off'));
 assert.equal(v.getNaturalDuetModeV664(input.trackId),'off');
});
test('line and word evidence both accepted, but never unverified empty cue',()=>{
 assert(run().active);
 assert(run({cue:{...cue,source:'line-timed'}}).active);
 const b=run({interactionModeV664:'off'});
 const unknown=run({cue:{...cue,source:'none'}});
 assert.deepEqual(unknown,run({cue:{...cue,source:'none'},interactionModeV664:'off'}));
 assert.notDeepEqual(run(),b);
});
test('V496 explicitly authored time segment with lineIndex -1 works',()=>{
 const c={...cue,lineIndex:-1,source:'none'};
 assert.notDeepEqual(run({cue:c}),run({cue:c,interactionModeV664:'off'}));
});
test('duet singers alternate attention without changing singer roles',()=>{
 const first=run({progressMs:1650}),second=run({progressMs:2880});
 const offA=run({progressMs:1650,interactionModeV664:'off'}),offB=run({progressMs:2880,interactionModeV664:'off'});
 assert(first.slots[1].gesture.intensity>offA.slots[1].gesture.intensity);
 assert(second.slots[2].gesture.intensity>offB.slots[2].gesture.intensity);
 assert.deepEqual(first.slots.map(x=>x.role),offA.slots.map(x=>x.role));
});
test('live mode stronger than natural',()=>{
 const a=run(),b=run({interactionModeV664:'live'});
 assert(b.slots[1].gesture.intensity>a.slots[1].gesture.intensity);
});
test('reply reacts AFTER the explicit 62 percent handoff',()=>{
 const c={...cue,style:'reply',partnerSlot:0,singingSlots:[1],handoffFrom:0};
 const start=c.startMs+(c.endMs-c.startMs)*.62;
 const at=start+450;
 const b=run({cue:c,progressMs:at,interactionModeV664:'off'});
 const a=run({cue:c,progressMs:at});
 assert(a.slots[0].gesture.intensity>b.slots[0].gesture.intensity);
 assert.equal(a.slots[0].role,b.slots[0].role);
 const before=run({cue:c,progressMs:start-1});
 const beforeOff=run({cue:c,progressMs:start-1,interactionModeV664:'off'});
 assert.deepEqual(before,beforeOff);
});
test('V496 handoff starts at the authored segment start',()=>{
 const c={...cue,style:'reply',lineIndex:-1,source:'none',partnerSlot:0,singingSlots:[1],handoffFrom:0};
 const at=c.startMs+420;
 const a=run({cue:c,progressMs:at}),b=run({cue:c,progressMs:at,interactionModeV664:'off'});
 assert(a.slots[0].gesture.intensity>b.slots[0].gesture.intensity);
});
test('shared hook stays audience-facing with staggered accents',()=>{
 const c={...cue,style:'hook',singingSlots:[0,1,2,3],partnerSlot:null};
 const at=1480;const x=run({cue:c,progressMs:at}),b=run({cue:c,progressMs:at,interactionModeV664:'off'});
 assert(x.slots.some((s,i)=>s.gesture.intensity>b.slots[i].gesture.intensity));
 assert.deepEqual(x.slots.map(x=>x.look),b.slots.map(x=>x.look));
 assert(x.slots.every(s=>s.role==='chorus'));
});
test('no novel gaze when base has zero look weight',()=>{
 const c={...cue};const b=run({cue:c,interactionModeV664:'off'});
 const u=v.refineNaturalDuetFeatureV664({...b,slots:b.slots.map(s=>({...s,look:{yaw:0,pitch:0,eyeYaw:0,weight:0}}))},{...input,cue:c});
 assert(u.slots.every(x=>x.look.weight===0));
});
test('spatial safety: overlapping and far performers receive no new feature',()=>{
 for(const p of [ [[0,0,0],[0,0,0],[.02,0,0],[0,0,0]], [[-20,0,0],[0,0,0],[20,0,0],[25,0,0]] ]){
 const a=run({positions:p}),b=run({positions:p,interactionModeV664:'off'});assert.deepEqual(a,b);
 }
});
test('invalid, paused, manual, reduced-motion, low-tier and stale-song gated',()=>{
 const gates=[{playing:false},{manualPriority:true},{reducedMotion:true},{tier:'low'},
 {trackId:'different'},{cueTrackId:'other'},{progressMs:6000},{progressMs:Infinity},
 {progressMs:999},{count:1},{positions:positions.slice(0,1)},
 {cue:{...cue,active:false}},{cue:{...cue,singingSlots:[3]}},
 {cue:{...cue,leadSlot:4}},{cue:{...cue,lineIndex:-2}},
 {cue:{...cue,startMs:0,endMs:20000}},{interactionModeV664:'auto'},{strength:0}];
 for(const patch of gates){const a=run(patch),b=run({...patch,interactionModeV664:'off'});assert.deepEqual(a,b,JSON.stringify(patch));}
});
test('pure, deterministic seeking; source unchanged',()=>{
 const old=JSON.stringify(input);const a=run();run({progressMs:4990});assert.deepEqual(run(),a);
 assert.equal(JSON.stringify(input),old);
});
test('only partner-look and upper-body gesture channels are modified',()=>{
 const a=run(),b=run({interactionModeV664:'off'});
 assert.equal(a.kind,b.kind);assert.equal(a.slots.length,b.slots.length);
 for(let i=0;i<a.slots.length;i++){
  const sa=a.slots[i],sb=b.slots[i];
  assert.equal(sa.role,sb.role);
  assert.equal(sa.look.yaw,sb.look.yaw);assert.equal(sa.look.pitch,sb.look.pitch);
  assert.equal(sa.look.eyeYaw,sb.look.eyeYaw);
  assert.equal(sa.gesture.lean,sb.gesture.lean);
 }
});
test('no extra renderer, persistence, media capture, network or timers',()=>{
 const s=fs.readFileSync('components/visualizer/naturalDuetFeatureInteractionV664.ts','utf8');
 assert(!/useFrame\(|setInterval\(|setTimeout\(|localStorage\.|fetch\(|AudioContext\(|getUserMedia\(/.test(s));
});
test('wired for both cast sizes and in V500/V575 planner',()=>{
 const v500=fs.readFileSync('components/visualizer/intelligentRapDuetPerformanceV500.ts','utf8');
 const v575=fs.readFileSync('components/visualizer/duetResponseV575.ts','utf8');
 assert(v500.includes('interactionModeV664?'));assert(v575.includes('refineNaturalDuetFeatureV664('));
 for(const file of ['DanceFormationActorsV492.tsx','GroupDancersV326SceneV492.tsx']){
  assert(fs.readFileSync('components/visualizer/'+file,'utf8').includes('getNaturalDuetModeV664(props.track?.id??""'));
 }
});
test('UI opt-in and reset when settings closed',()=>{
 const ui=fs.readFileSync('components/visualizer/RapDuetStudioPanelV416.tsx','utf8');
 const shell=fs.readFileSync('components/SmartLazySettings.tsx','utf8');
 assert(ui.includes('V664 · Natural Duet & Feature Interaction'));
 assert(ui.includes('setNaturalDuetModeV664(id,mode)'));
 assert(shell.includes('clearNaturalDuetOnTrackChangeV664(trackId)'));
 v.setNaturalDuetModeV664(input.trackId,'live');
 v.clearNaturalDuetOnTrackChangeV664(input.trackId);
 assert.equal(v.getNaturalDuetModeV664(input.trackId),'live');
 v.clearNaturalDuetOnTrackChangeV664('next');
 assert.equal(v.getNaturalDuetModeV664(input.trackId),'off');
});
let samples=0;
for(let i=0;i<14000;i++){
 const c=i%3===0?{...cue,style:'hook',singingSlots:[0,1,2,3],partnerSlot:null}:cue;
 const s=run({cue:c,progressMs:1001+(i*43)%4900,count:4,
  interactionModeV664:i%2?'natural':'live'});
 assert(s.active);
 for(const item of s.slots){
  assert(item.look.weight<=.46&&Number.isFinite(item.look.weight));
  assert(item.gesture.leftLift<=.13&&Number.isFinite(item.gesture.leftLift));
  assert(item.gesture.rightLift<=.13&&Number.isFinite(item.gesture.rightLift));
  assert(item.gesture.shoulder<=.065&&Number.isFinite(item.gesture.shoulder));
  assert(item.gesture.intensity<=.28&&Number.isFinite(item.gesture.intensity));
 }
 samples++;
}
console.log(`PASS V664: ${checks} regression groups, ${samples} multi-performer samples`);
