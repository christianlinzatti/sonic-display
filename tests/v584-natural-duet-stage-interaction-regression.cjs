'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planIntelligentRapDuetV500:plan}=load('components/visualizer/intelligentRapDuetPerformanceV500');
const {refineNaturalDuetStageV584:refine}=load('components/visualizer/naturalDuetStageInteractionV584');
let pass=0;
function test(label,fn){try{fn();pass++;}catch(e){e.message=`V584 ${label}: ${e.message}`;throw e;}}
const positions=[[-2,0,0],[-.7,0,.1],[.8,0,.1],[2,0,0]];
const cue={active:true,style:'reply',lineIndex:7,leadSlot:1,partnerSlot:0,
 singingSlots:[1],handoffFrom:0,phase:.5,emphasis:.9,startMs:1000,endMs:4600,source:'line-timed',count:4};
const args={trackId:'rap-track-A',cueTrackId:'rap-track-A',cue,progressMs:1360,count:4,positions,
 playing:true,reducedMotion:false,manualPriority:false,beat:.7,strength:85,tier:'high'};
const sample=(p={})=>plan({...args,...p});
const neutralBase={active:true,kind:'reply',slots:Array.from({length:4},(_,s)=>({
 role:s===0?'handoff':s===1?'singing':'listening',
 look:{yaw:s===0?.15:0,pitch:0,eyeYaw:0,weight:s===0?.12:0},
 gesture:{leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0},
}))};
const refineBase=(patch={})=>refine(neutralBase,{...args,...patch});
test('connected from the existing V500/V575 stage planner',()=>{
 const src=fs.readFileSync('components/visualizer/intelligentRapDuetPerformanceV500.ts','utf8');
 assert.match(src,/return refineDuetResponseV575\(/);
 assert.match(fs.readFileSync('components/visualizer/duetResponseV575.ts','utf8'),/refineNaturalDuetStageV584\(/);
});
test('authored incoming lead responds after handoff',()=>{
 const result=refineBase();assert(result.slots[1].gesture.intensity>0);
 assert.equal(result.slots[1].look.weight,0,'lead faces audience');
 assert.equal(result.slots[1].role,'singing');
});
test('outgoing rapper acknowledges assigned incoming vocalist',()=>{
 const result=refineBase({progressMs:1490});
 assert(result.slots[0].look.weight>neutralBase.slots[0].look.weight);
 assert(result.slots[0].gesture.intensity>0);assert.equal(result.slots[0].role,'handoff');
});
test('duet partners alternate rather than mirror exact pulses',()=>{
 const c={...cue,style:'duet',handoffFrom:null,singingSlots:[1,2],partnerSlot:2};
 const bDuet={...neutralBase,kind:'duet'};
 const a=refine(bDuet,{...args,cue:c,progressMs:1540});
 const b=refine(bDuet,{...args,cue:c,progressMs:2110});
 assert(a.slots[1].gesture.intensity>b.slots[1].gesture.intensity);
 assert(b.slots[2].gesture.intensity>a.slots[2].gesture.intensity);
 assert(a.slots[0].gesture.intensity>0,'unassigned listener gets a quiet acknowledgement');
});
test('hook gives sparse shared body accent, leaves every gaze unchanged',()=>{
 const c={...cue,style:'hook',handoffFrom:null,partnerSlot:null,singingSlots:[0,1,2,3]};
 const b={...neutralBase,kind:'hook'};
 const x=refine(b,{...args,cue:c,progressMs:1420});
 assert(x.slots.every((s,i)=>s.gesture.intensity>0&&s.look===b.slots[i].look));
});
test('non-singer listeners are staggered',()=>{
 const c={...cue,style:'solo',handoffFrom:null};
 const b={...neutralBase,kind:'solo'};
 const x=refine(b,{...args,cue:c,progressMs:1520});
 const y=refine(b,{...args,cue:c,progressMs:2340});
 assert(x.slots[3].gesture.intensity>y.slots[3].gesture.intensity);
 assert(y.slots[2].gesture.intensity>x.slots[2].gesture.intensity);
});
test('no near interaction on overlapping performers',()=>{
 const tooClose=[[-.7,0,.1],[-.6,0,.1],[.8,0,0],[2,0,0]];
 const r=refineBase({positions:tooClose});
 assert.strictEqual(r.slots[0],neutralBase.slots[0]);
 assert.strictEqual(r.slots[1],neutralBase.slots[1]);
});
test('no reaction to excessively distant partners',()=>{
 const far=[[-20,0,0],[0,0,0],[16,0,0],[25,0,0]];
 const r=refineBase({positions:far});
 assert.strictEqual(r.slots[0],neutralBase.slots[0]);
 assert.strictEqual(r.slots[1],neutralBase.slots[1]);
});
test('manual singer/formation and motion priorities preserved',()=>{
 for(const gate of [{manualPriority:true},{reducedMotion:true},{playing:false},{tier:'low'},
  {trackId:'different'},{cueTrackId:'different'},{strength:0},{progressMs:1000},
  {progressMs:4600},{progressMs:Infinity},{count:1},{positions:positions.slice(0,1)},
  {cue:{...cue,active:false}},{cue:{...cue,singingSlots:[3],leadSlot:1}},
  {cue:{...cue,count:3}}]){
   assert.strictEqual(refineBase(gate),neutralBase,JSON.stringify(gate));
 }
});
test('seek repeat is pure, no mutation of cast inputs',()=>{
 const frozen=JSON.stringify(args),first=sample();sample({progressMs:3570});
 assert.deepEqual(sample(),first);assert.equal(JSON.stringify(args),frozen);
});
test('2/3/4 avatar cast works',()=>{
 for(const n of [2,3,4]){
  const c={...cue,count:n,leadSlot:1,singingSlots:[1]};
  const out=sample({count:n,cue:c,positions:positions.slice(0,n)});
  assert(out.active&&out.slots.length===n);
 }
});
test('do not make up singers or alter lip sync identity',()=>{
 const r=sample();assert.equal(r.slots.filter(x=>x.role==='singing').length,1);
 assert.equal(r.slots[1].role,'singing');assert.deepEqual(cue.singingSlots,[1]);
});
for(const tier of ['high','balanced'])test(`amplitude caps ${tier}`,()=>{
 for(const style of ['solo','reply','duet','hook']){
  const c={...cue,style,partnerSlot:style==='duet'?2:0,
   singingSlots:style==='duet'?[1,2]:style==='hook'?[0,1,2,3]:[1],
   handoffFrom:style==='reply'?0:null};
  for(let ms=1000;ms<4599;ms+=29){
   const x=sample({cue:c,progressMs:ms,tier,beat:1,strength:100});
   assert(x.active);
   for(const s of x.slots){
    assert(Number.isFinite(s.look.weight)&&s.look.weight<=.46);
    assert(Number.isFinite(s.gesture.leftLift)&&s.gesture.leftLift<=.13);
    assert(Number.isFinite(s.gesture.rightLift)&&s.gesture.rightLift<=.13);
    assert(Number.isFinite(s.gesture.shoulder)&&s.gesture.shoulder<=.065);
    assert(Number.isFinite(s.gesture.intensity)&&s.gesture.intensity<=.28);
   }
  }
 }
});
test('fade-in and fade-out conserve original near boundaries',()=>{
 const b=refineBase({progressMs:1001}),c=refineBase({progressMs:4599});
 assert(b.slots[1].gesture.intensity<.00001);
 assert(c.slots[1].gesture.intensity<.00001);
});
test('bounded per-frame change in handoff envelope',()=>{
 let prior=null;
 for(let ms=1020;ms<1940;ms+=10){
  const s=refineBase({progressMs:ms}).slots[1].gesture.intensity;
  if(prior!==null)assert(Math.abs(s-prior)<.002);
  prior=s;
 }
});
test('30-minute sample is finite and stateless',()=>{
 for(let ms=1000;ms<1_800_000;ms+=173){
  const c={...cue,startMs:ms-(ms%4600),endMs:ms-(ms%4600)+4600};
  const p=sample({cue:c,progressMs:ms});
  assert(p.active&&p.slots.every(x=>Number.isFinite(x.gesture.intensity)));
 }
});
test('no second render loop, new GLB clips or network work',()=>{
 const src=fs.readFileSync('components/visualizer/naturalDuetStageInteractionV584.ts','utf8');
 for(const forbidden of ['useFrame(','requestAnimationFrame(','fetch(','setInterval(','new AnimationMixer','new Mesh','localStorage'])
  assert(!src.includes(forbidden),forbidden);
});
console.log(`PASS V584: ${pass} duet, hook, role safety, deterministic playback, rig bounds and stage integration checks`);
