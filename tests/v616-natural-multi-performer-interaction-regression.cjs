'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {refineNaturalPerformerDuetV616:duet,refineNaturalPerformerCrewV616:crew}=load('components/visualizer/naturalMultiPerformerInteractionV616');
const {planIntelligentRapDuetV500:planDuet}=load('components/visualizer/intelligentRapDuetPerformanceV500');
const {planAdvancedGroupV517:planGroup}=load('components/visualizer/advancedGroupPerformanceV517');
const {planCinematicMultiAvatarV527:planCamera}=load('components/visualizer/cinematicMultiAvatarV527');
const {planCrewConcertInteractionV539:planCrew}=load('components/visualizer/crewConcertInteractionV539');
const positions=[[-2,0,0],[-.8,0,.1],[.8,0,.1],[2,0,0]];
const cue={active:true,style:'duet',lineIndex:20,leadSlot:1,partnerSlot:2,singingSlots:[1,2],
 handoffFrom:null,phase:.5,emphasis:.76,startMs:1000,endMs:6200,source:'word-timed',count:4};
const input={trackId:'v616-song',cueTrackId:'v616-song',cue,count:4,positions,progressMs:1640,
 playing:true,reducedMotion:false,manualPriority:false,tier:'high',beat:.9,strength:85};
function base(c=cue,n=c.count){return {active:true,kind:c.style,slots:Array.from({length:n},(_,i)=>({
  role:c.style==='hook'?'chorus':c.handoffFrom===i&&c.handoffFrom!==c.leadSlot?'handoff':
    c.singingSlots.includes(i)?'singing':'listening',
  look:{yaw:i===1?.10:i===2?-.10:0,eyeYaw:0,pitch:0,weight:.12},
  gesture:{leftLift:.008,rightLift:.009,shoulder:.004,lean:0,intensity:.02}
 }))};}
function cast(c=cue,n=c.count){return {active:true,role:c.style==='hook'?'hook':c.style==='duet'?'feature':'lead',
  leadSlot:c.leadSlot,singingSlots:c.singingSlots,startMs:c.startMs,endMs:c.endMs,handoffFrom:c.handoffFrom,count:n};}
function groupInput(c=cast(),overrides={}){return {count:c?.count??4,trackId:'v616-song',cueTrackId:'v616-song',
  cue:c,seconds:2,progressMs:2100,bpm:112,positions,playing:true,reducedMotion:false,
  manualPriority:false,tier:'high',beat:.7,energy:.67,strength:85,risks:[],...overrides};}
function groupRun(i){const g=planGroup(i),camera=planCamera(g,i);return planCrew(g,camera,i);}
let groups=0;const test=(label,fn)=>{try{fn();groups++;}catch(e){e.message=`V616 ${label}: ${e.message}`;throw e;}};
test('both existing stage channels use one additive V616 refinement, no new actor trees',()=>{
 const v575=fs.readFileSync('components/visualizer/duetResponseV575.ts','utf8');
 const v539=fs.readFileSync('components/visualizer/crewConcertInteractionV539.ts','utf8');
 assert.match(v575,/refineNaturalPerformerDuetV616\(/);
 assert.match(v539,/refineNaturalPerformerCrewV616\(/);
 for(const file of ['DanceFormationActorsV492.tsx','GroupDancersV326SceneV492.tsx']){
   const s=fs.readFileSync('components/visualizer/'+file,'utf8');
   assert(s.includes('planIntelligentRapDuetV500('));assert(s.includes('planCrewConcertInteractionV539('));
   assert(s.includes('combineCrewLooksV452('));assert(s.includes('combineCrewGesturesV452('));
 }
});
test('duet partners make modest alternating reactions without changing roles or clips',()=>{
 const a=base(),aJson=JSON.stringify(a);const early=duet(a,input);
 const late=duet(a,{...input,progressMs:2580});
 assert.notStrictEqual(early,a);assert.notStrictEqual(late,a);
 assert(early.slots[1].gesture.intensity>a.slots[1].gesture.intensity);
 assert(late.slots[2].gesture.intensity>a.slots[2].gesture.intensity);
 assert.deepEqual(early.slots.map(s=>s.role),a.slots.map(s=>s.role));
 assert.equal(JSON.stringify(a),aJson);
 assert(early.slots[1].look.weight>=a.slots[1].look.weight);
});
test('no invented partner gaze when base look is neutral or points away',()=>{
 const b=base();b.slots[1].look.weight=0;b.slots[2].look.yaw=.12;
 const out=duet(b,input);
 assert.equal(out.slots[1].look.weight,0);
 assert.equal(out.slots[2].look.yaw,.12);
});
test('inline call-and-response respects 62-percent boundary',()=>{
 const c={...cue,style:'reply',lineIndex:4,leadSlot:1,partnerSlot:null,singingSlots:[1],handoffFrom:0};
 const b=base(c);const boundary=c.startMs+(c.endMs-c.startMs)*.62;
 const before=duet(b,{...input,cue:c,progressMs:boundary-200});
 const after=duet(b,{...input,cue:c,progressMs:boundary+480});
 assert.strictEqual(before.slots[0],b.slots[0]);
 assert(after.slots[0].gesture.intensity>b.slots[0].gesture.intensity);
 assert.equal(after.slots[0].role,'handoff');
});
test('time-coded segment reply can react from its actual segment start',()=>{
 const c={...cue,style:'reply',lineIndex:-1,leadSlot:1,partnerSlot:null,singingSlots:[1],handoffFrom:0};
 const b=base(c);const out=duet(b,{...input,cue:c,progressMs:c.startMs+550});
 assert(out.slots[0].gesture.intensity>b.slots[0].gesture.intensity);
});
test('solo lead remains audience-facing while nearby support can acknowledge',()=>{
 const c={...cue,style:'solo',singingSlots:[1],partnerSlot:null,handoffFrom:null};const b=base(c);
 const a=duet(b,{...input,cue:c,progressMs:2300});
 assert.strictEqual(a.slots[1].look,b.slots[1].look);
 assert.deepEqual(a.slots.map(s=>s.role),b.slots.map(s=>s.role));
 assert(a.slots.some((s,i)=>i!==1&&s.gesture.intensity>b.slots[i].gesture.intensity));
});
test('full cast hook remains crowd-facing and ensemble pulses differ',()=>{
 const c={...cue,style:'hook',leadSlot:1,partnerSlot:null,singingSlots:[0,1,2,3]};const b=base(c);
 const out=duet(b,{...input,cue:c,progressMs:1800});
 assert(out.slots.every((s,i)=>s.look===b.slots[i].look));
 assert(out.slots.every(s=>s.role==='chorus'));
 assert(out.slots.some((s,i)=>s.gesture.intensity>b.slots[i].gesture.intensity));
});
test('manual, pause, low tier, track mismatch and playback bounds leave existing plans alone',()=>{
 for(const delta of [{playing:false},{manualPriority:true},{reducedMotion:true},{tier:'low'},
  {trackId:'wrong'},{cueTrackId:'wrong'},{progressMs:999},{progressMs:6200},
  {beat:NaN},{beat:1.8},{strength:0},{progressMs:NaN},
  {positions:[[NaN,0,0],...positions]}]){
  const b=base();assert.strictEqual(duet(b,{...input,...delta}),b,JSON.stringify(delta));
 }
});
test('wrong authored roles, duplicated singer and unsafe duet distances cannot create reactions',()=>{
 const b=base();const c={...cue,singingSlots:[1,1]};
 assert.strictEqual(duet(b,{...input,cue:c}),b);
 const wrong=base();wrong.slots[2].role='listening';
 assert.strictEqual(duet(wrong,input),wrong);
 const close=[[0,0,0],[.01,0,0],[.03,0,0],[4,0,0]];
 assert.strictEqual(duet(b,{...input,positions:close}),b);
 const far=[[0,0,0],[-20,0,0],[20,0,0],[24,0,0]];
 assert.strictEqual(duet(b,{...input,positions:far}),b);
});
test('crew overlay supports verified 2–4-person stages',()=>{
 for(const n of [2,3,4]){
   const ci={...cast(),count:n,leadSlot:0,singingSlots:[0]};
   const i=groupInput(ci,{count:n,positions:positions.slice(0,n),progressMs:2400,seconds:2.4});
   const p=groupRun(i);assert(p.active&&p.source==='authored-singer');
   assert.equal(p.slots.length,n);
   const r=crew(p,i);assert(r.active&&r.slots.length===n);
   assert(r.slots.every((x,index)=>x.role===p.slots[index].role&&x.target===p.slots[index].target));
 }
});
test('cue-free visual ensembles remain nonvocal',()=>{
 const visual=groupInput(null,{cue:null,count:4,progressMs:3500,seconds:3.5,
  formation:{active:true,lead:0,moment:'hook',slots:[{},{},{},{}]}});
 const p=groupRun(visual);assert(p.active&&p.source==='visual-only');
 assert.strictEqual(crew(p,visual),p);
 assert(p.slots.every(s=>s.role==='visual'&&s.target===null));
});
test('risk/collision safeguards suppress added reaction',()=>{
 const ci={...cast(),role:'lead',singingSlots:[1]};
 const i=groupInput(ci,{risks:[{risk:1,gestureScale:1,accentScale:1}]});
 const p=groupRun(i);const r=crew(p,i);
 assert.strictEqual(r.slots[0],p.slots[0]);
 const far={...i,positions:[[99,0,0],...positions.slice(1)]};
 const f=groupRun(far);const q=crew(f,far);
 assert.strictEqual(q.slots[0],f.slots[0]);
});
test('crew has no follow-through after handoff tail',()=>{
 const ci={...cast(),role:'feature',singingSlots:[1],handoffFrom:0};
 const i=groupInput(ci,{progressMs:3500,seconds:3.5});
 const p=groupRun(i);const out=crew(p,i);
 assert.strictEqual(out.slots[0],p.slots[0]);
});
test('pure deterministic output across pause/resume, same timestamp and seek',()=>{
 const b=Object.freeze(base());const x=duet(b,input);
 assert.deepEqual(x,duet(b,input));
 duet(b,{...input,progressMs:3000});
 assert.deepEqual(x,duet(b,input));
 const i=groupInput();const p=groupRun(i);
 assert.deepEqual(crew(p,i),crew(p,i));
});
test('bounds stay within V144/V145/V452 and never move roots',()=>{
 let count=0;
 for(const n of [2,3,4])for(let t=1200;t<5800;t+=40){
  const c={...cue,count:n,leadSlot:0,partnerSlot:1,singingSlots:[0,1],handoffFrom:null};
  const b=base(c,n);const ps=positions.slice(0,n);
  const v=duet(b,{...input,cue:c,count:n,positions:ps,progressMs:t,beat:(t%1000)/1000});
  assert(v.slots.every(s=>s.gesture.leftLift>=0&&s.gesture.leftLift<=.13&&
   s.gesture.rightLift<=.13&&s.gesture.shoulder<=.065&&s.gesture.intensity<=.28&&
   Math.abs(s.look.yaw)<=.42&&s.look.weight<=.46));
  count++;
 }
 assert(count>=300);
});
test('all existing facial, IK and animation planners retain authority',()=>{
 const src=fs.readFileSync('components/visualizer/naturalMultiPerformerInteractionV616.ts','utf8');
 for(const token of ['Math.random(', 'Date.now(', 'useFrame(', 'AnimationMixer(', 'setInterval(',
  'setTimeout(', 'fetch(', 'lipMorph', 'position.set(', 'footIK'])assert(!src.includes(token),token);
 assert(fs.readFileSync('components/visualizer/intelligentRapDuetPerformanceV500.ts','utf8').includes('refineDuetResponseV575('));
 const pkg=require('../package.json');
 assert(Number(pkg.version.match(/-v(\d+)$/)?.[1])>=616,'V616 must remain supported by later versions');
 assert(pkg.scripts['test:smoke:v616'].includes('test:v616'));
 // Later releases can delegate through full smoke suites or run v616 directly.
 // Search all npm script edges (including build:preflight -> smoke), rather than assuming that the
 // first smoke entry is the only route (new releases also run selected regressions).
 const seen=new Set();
 function reachesV616(script){
  if(script==='test:v616')return true;
  if(seen.has(script)||!pkg.scripts[script])return false;
  seen.add(script);
  const calls=[...pkg.scripts[script].matchAll(/npm run ([a-zA-Z0-9:._-]+)/g)].map(m=>m[1]);
  return calls.some(reachesV616);
 }
 assert(reachesV616('prebuild'),'prebuild must transitively run V616');
});
console.log(`PASS V616: ${groups} groups, safe 2–4 artist stage interactions and deterministic cue-bound gestures`);
