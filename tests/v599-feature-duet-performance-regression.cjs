'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planIntelligentRapDuetV500:plan}=load('components/visualizer/intelligentRapDuetPerformanceV500');
const {refineFeatureDuetPerformanceV599:refine,featureDuetEvidenceV599:evidence}=load('components/visualizer/featureDuetPerformanceV599');
let groups=0;function test(label,fn){try{fn();groups++;}catch(err){err.message=`V599 ${label}: ${err.message}`;throw err;}}
const positions=[[-2,0,0],[-.7,0,.1],[.7,0,.1],[2,0,0]];
const cue={active:true,style:'reply',lineIndex:-1,leadSlot:1,partnerSlot:0,
 singingSlots:[1],handoffFrom:0,phase:.5,emphasis:.82,startMs:1000,endMs:4400,source:'word-timed',count:4};
const input={cue,trackId:'valid-A',cueTrackId:'valid-A',progressMs:1500,count:4,positions,
 playing:true,reducedMotion:false,manualPriority:false,beat:.75,strength:85,tier:'high'};
const slots=Array.from({length:4},(_,i)=>({
 role:i===0?'handoff':i===1?'singing':'listening',
 look:{yaw:i===0?.12:0,eyeYaw:0,pitch:0,weight:i===0?.12:0},
 gesture:{leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0},
}));
const base={active:true,kind:'reply',slots};
const run=(patch={})=>refine(base,{...input,...patch});
const inspect=(patch={})=>evidence(base,{...input,...patch});
test('connected after V584 and V585 to the V500 chain',()=>{
 const src=fs.readFileSync('components/visualizer/duetResponseV575.ts','utf8');
 assert.match(src,/refineFeatureDuetPerformanceV599\(refineCinematicDuetFaceV585\(refineNaturalDuetStageV584\(/);
 const planner=fs.readFileSync('components/visualizer/intelligentRapDuetPerformanceV500.ts','utf8');
 assert(planner.includes('return refineDuetResponseV575('));
 for(const stage of ['DanceFormationActorsV492.tsx','GroupDancersV326SceneV492.tsx']){
  assert(fs.readFileSync('components/visualizer/'+stage,'utf8').includes('planIntelligentRapDuetV500('));
 }
});
test('evidence is explicit singer cast, not sound recognition',()=>{
 const e=inspect();assert.equal(e.status,'active');assert.deepEqual(e.singers,[1]);
 assert.equal(e.lead,1);assert.equal(e.handoffFrom,0);assert.equal(e.kind,'reply');
 assert.match(e.reason,/explicit track-matched/);
});
test('author-assigned handoff responds without changing roles',()=>{
 const p=run();assert.notStrictEqual(p,base);
 assert(p.slots[0].gesture.intensity>0);
 assert(p.slots[1].gesture.intensity>0);
 assert.equal(p.slots[1].role,'singing');assert.equal(p.slots[0].role,'handoff');
 assert.equal(p.slots[1].look.yaw,0);assert.equal(p.slots[1].look.weight,0);
 assert(p.slots[0].look.weight>slots[0].look.weight);
});
test('handoff moves outgoing attention at a different time from incoming',()=>{
 const early=run({progressMs:1350});const later=run({progressMs:1550});
 assert(early.slots[1].gesture.intensity>later.slots[1].gesture.intensity);
 assert(later.slots[0].look.weight>early.slots[0].look.weight);
});
test('no author-specified handoff means no invented outgoing singer',()=>{
 const c={...cue,handoffFrom:null,style:'solo',partnerSlot:null};
 const b={...base,kind:'solo',slots:slots.map((s,i)=>({...s,role:i===1?'singing':'listening'}))};
 const x=refine(b,{...input,cue:c,progressMs:1810});
 assert.deepEqual(x.slots.map(s=>s.role),b.slots.map(s=>s.role));
 assert.equal(x.slots[0].look.weight,b.slots[0].look.weight,'no invented handoff gaze');
 assert.equal(evidence(b, {...input,cue:c}).handoffFrom,null);
});
test('V416 authored in-line reply begins at the actual .62 handoff point',()=>{
 const c={...cue,lineIndex:12};
 const before=refine(base,{...input,cue:c,progressMs:1500});
 const responseStart=c.startMs+(c.endMs-c.startMs)*.62;
 const during=refine(base,{...input,cue:c,progressMs:responseStart+400});
 assert.equal(before.slots[0].gesture.intensity,0);
 assert(during.slots[0].gesture.intensity>before.slots[0].gesture.intensity);
 assert(during.slots[1].gesture.intensity>before.slots[1].gesture.intensity);
});
test('duet lead and partner alternate restrained gestures',()=>{
 const c={...cue,style:'duet',partnerSlot:2,singingSlots:[1,2],handoffFrom:null};
 const b={...base,kind:'duet',slots:slots.map((s,i)=>({...s,role:i===1||i===2?'singing':'listening',look:{...s.look,weight:i===1||i===2?.2:0,yaw:i===1?.1:i===2?-.1:0}}))};
 const a=refine(b,{...input,cue:c,progressMs:1560});
 const d=refine(b,{...input,cue:c,progressMs:2220});
 assert(a.slots[1].gesture.intensity>d.slots[1].gesture.intensity);
 assert(d.slots[2].gesture.intensity>a.slots[2].gesture.intensity);
 assert(a.slots[1].look.weight>b.slots[1].look.weight);
 assert.equal(a.slots[1].look.yaw,b.slots[1].look.yaw);
});
test('duet does not add glances if no previous gaze exists',()=>{
 const c={...cue,style:'duet',partnerSlot:2,singingSlots:[1,2],handoffFrom:null};
 const b={...base,kind:'duet',slots:slots.map(s=>({...s,look:{...s.look,weight:0}}))};
 const p=refine(b,{...input,cue:c,progressMs:1550});
 assert.equal(p.slots[1].look.weight,0);assert.equal(p.slots[2].look.weight,0);
});
test('hook is shared but not mirrored and always faces crowd',()=>{
 const c={...cue,style:'hook',partnerSlot:null,singingSlots:[0,1,2,3],handoffFrom:null};
 const b={...base,kind:'hook',slots:slots.map(s=>({...s,role:'chorus',look:{yaw:0,pitch:0,eyeYaw:0,weight:0}}))};
 const p=refine(b,{...input,cue:c,progressMs:1360});
 assert(p.slots.every(s=>s.gesture.intensity>0&&s.look.weight===0&&s.role==='chorus'));
 assert.notEqual(p.slots[0].gesture.leftLift,p.slots[1].gesture.leftLift);
});
test('listeners respond with staggered understated arms, no mouth/role edits',()=>{
 const c={...cue,style:'solo',handoffFrom:null,partnerSlot:null};
 const b={...base,kind:'solo'};
 const r=refine(b,{...input,cue:c,progressMs:1810});
 const s=refine(b,{...input,cue:c,progressMs:2510});
 assert(r.slots.some((x,i)=>x.gesture.intensity!==s.slots[i].gesture.intensity));
 assert.deepEqual(r.slots.map(x=>x.role),b.slots.map(x=>x.role));
});
test('high tier more pronounced than balanced, low is fully protected',()=>{
 const a=run(),b=run({tier:'balanced'}),c=run({tier:'low'});
 assert(a.slots[0].gesture.intensity>b.slots[0].gesture.intensity);
 assert.strictEqual(c,base);
});
test('strength zero always returns original references',()=>assert.strictEqual(run({strength:0}),base));
test('reduced motion, manual stage or pause return original plan',()=>{
 for(const patch of [{reducedMotion:true},{manualPriority:true},{playing:false}]){
  assert.strictEqual(run(patch),base);assert.equal(inspect(patch).status,'protected');
 }
});
test('cross-track or stale assignments cannot animate anything',()=>{
 for(const patch of [{trackId:'another'},{cueTrackId:'another'},{trackId:''},{cueTrackId:null}]){
  assert.strictEqual(run(patch),base);assert.equal(inspect(patch).status,'protected');
 }
});
test('out-of-window or invalid timestamp returns original',()=>{
 for(const t of [-2,999,4400,Infinity,NaN])assert.strictEqual(run({progressMs:t}),base);
});
test('reject invalid singer assignment and contradictory duet',()=>{
 for(const c of [{...cue,active:false},{...cue,count:3},{...cue,singingSlots:[]},
  {...cue,singingSlots:[3],leadSlot:1},{...cue,singingSlots:[1,1]},
  {...cue,style:'hook',partnerSlot:null,singingSlots:[1]},
  {...cue,style:'duet',partnerSlot:1,singingSlots:[1]},
  {...cue,style:'duet',partnerSlot:2,singingSlots:[1]},
  {...cue,leadSlot:11},{...cue,startMs:5000,endMs:4000},
  {...cue,handoffFrom:8}]) assert.strictEqual(run({cue:c}),base);
});
test('invalid or unsafe positions yield unchanged base',()=>{
 for(const p of [positions.slice(0,1),[[0,0,0],[NaN,0,0],[2,0,0],[3,0,0]],
  [[200,0,0],...positions.slice(1)]]){
   assert.strictEqual(run({positions:p}),base);
 }
});
test('distance gates protect face-to-face overlaps or remote choreography',()=>{
 const overlap=[[0,0,0],[.1,0,0],[.2,0,0],[.3,0,0]];
 const far=[[-20,0,0],[0,0,0],[20,0,0],[30,0,0]];
 for(const positions of [overlap,far]){
  const p=run({positions});assert.strictEqual(p,base);
 }
});
test('fade smooth at authored cue boundaries',()=>{
 const a=run({progressMs:1001});const b=run({progressMs:4399});
 assert(a.slots[0].gesture.intensity<.00001);
 assert(b.slots[0].gesture.intensity<.00001);
});
test('2, 3 and 4 performers are supported',()=>{
 for(const n of [2,3,4]){
  const c={...cue,count:n,leadSlot:1,singingSlots:[1],handoffFrom:0};
  const b={...base,slots:base.slots.slice(0,n)};
  const p=refine(b,{...input,cue:c,count:n,positions:positions.slice(0,n)});
  assert(p.active&&p.slots.length===n);
 }
});
test('no input mutation, seeking backward is deterministic',()=>{
 const raw=JSON.stringify(input),stored=JSON.stringify(base),a=run();run({progressMs:3200});
 assert.deepEqual(run(),a);assert.equal(JSON.stringify(input),raw);assert.equal(JSON.stringify(base),stored);
});
test('verified V500 integration preserves role count and safe look bounds',()=>{
 const c={...cue,style:'duet',partnerSlot:2,singingSlots:[1,2],handoffFrom:null};
 const x=plan({...input,cue:c,progressMs:2220});
 assert(x.active&&x.kind==='duet'&&x.slots.length===4);
 assert.equal(x.slots.filter(s=>s.role==='singing').length,2);
 for(const slot of x.slots){
  assert(slot.look.weight<=.46&&Math.abs(slot.look.yaw)<=.42);
  assert(slot.gesture.intensity<=.28&&slot.gesture.shoulder<=.065);
  assert(slot.gesture.leftLift<=.13&&slot.gesture.rightLift<=.13);
 }
});
test('pure upper body functionality has no scheduling, mixers, extra audio or APIs',()=>{
 const s=fs.readFileSync('components/visualizer/featureDuetPerformanceV599.ts','utf8');
 for(const blocked of ['setInterval(', 'requestAnimationFrame(', 'useFrame(', 'fetch(', 'localStorage', 'AnimationMixer(', 'Math.random(', 'navigator.'])
  assert(!s.includes(blocked),blocked);
});
for(const kind of ['solo','reply','duet','hook'])test(`pure long-run ${kind} 25,000 points`,()=>{
 const c={...cue,style:kind,partnerSlot:kind==='duet'?2:kind==='hook'?null:0,
  singingSlots:kind==='duet'?[1,2]:kind==='hook'?[0,1,2,3]:[1],handoffFrom:kind==='reply'?0:null};
 const b={...base,kind};
 for(let i=0;i<25000;i++){
  const ms=1000+(i*37)%3400;
  const p=refine(b,{...input,cue:c,progressMs:ms,beat:(i%101)/100});
  assert(p.slots.length===4);
  for(const s of p.slots){
   assert(Number.isFinite(s.gesture.intensity)&&s.gesture.intensity>=0&&s.gesture.intensity<=.28);
   assert(Number.isFinite(s.look.weight)&&s.look.weight>=0&&s.look.weight<=.46);
  }
 }
});
console.log(`PASS V599: ${groups} groups, 100000 deterministic song-time samples, track/cast/manual-priority/foot-IK protections`);
