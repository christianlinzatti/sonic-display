'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {refineNaturalMultiArtistV607:refine,multiArtistEvidenceV607:evidence}=load('components/visualizer/naturalMultiArtistInteractionV607');
const {planIntelligentRapDuetV500:plan}=load('components/visualizer/intelligentRapDuetPerformanceV500');
let groups=0;
function test(label,callback){try{callback();groups++;}catch(err){err.message=`V607 ${label}: ${err.message}`;throw err;}}
const positions=[[-2,0,0],[-.7,0,.1],[.7,0,.1],[2,0,0]];
const cue={active:true,style:'duet',lineIndex:12,leadSlot:1,partnerSlot:2,
 singingSlots:[1,2],handoffFrom:null,phase:.5,emphasis:.78,startMs:1000,endMs:5400,
 source:'word-timed',count:4};
const initial={cue,trackId:'track-artist-duet-607',cueTrackId:'track-artist-duet-607',
 progressMs:1560,count:4,positions,playing:true,reducedMotion:false,
 manualPriority:false,beat:.85,strength:85,tier:'high'};
function baseFor(c=cue,n=c.count){return {active:true,kind:c.style,slots:Array.from({length:n},(_,i)=>({
  role:c.style==='hook'?'chorus':c.handoffFrom===i&&c.handoffFrom!==c.leadSlot?'handoff':
   c.singingSlots.includes(i)?'singing':'listening',
  look:{yaw:i===1?.09:i===2?-.09:0,eyeYaw:0,pitch:0,weight:.14},
  gesture:{leftLift:.008,rightLift:.009,shoulder:.004,lean:0,intensity:.02},
 }))};}
const base=baseFor();
const doRefine=(patch={},b=base)=>refine(b,{...initial,...patch});
const doEvidence=(patch={},b=base)=>evidence(b,{...initial,...patch});
const signature=p=>JSON.stringify(p);
const delta=(a,b)=>Math.abs(a-b);

test('single V500 pipeline for two and four artists, V599 precedes V607',()=>{
 const src=fs.readFileSync('components/visualizer/duetResponseV575.ts','utf8');
 assert.match(src,/refineNaturalMultiArtistV607\(refineFeatureDuetPerformanceV599\(refineCinematicDuetFaceV585\(refineNaturalDuetStageV584\(/);
 assert(fs.readFileSync('components/visualizer/intelligentRapDuetPerformanceV500.ts','utf8').includes('refineDuetResponseV575('));
 for(const f of ['DanceFormationActorsV492.tsx','GroupDancersV326SceneV492.tsx'])
   assert(fs.readFileSync('components/visualizer/'+f,'utf8').includes('planIntelligentRapDuetV500('));
});
test('explainability is tied to editorial roles and not speech recognition',()=>{
 const x=doEvidence();assert.equal(x.status,'active');assert.deepEqual(x.singers,[1,2]);
 assert.equal(x.lead,1);assert.equal(x.partner,2);assert.match(x.reason,/editorial singer/);
});
test('duet lead makes an understated first phrase movement',()=>{
 const a=doRefine();assert.notStrictEqual(a,base);
 assert(a.slots[1].gesture.intensity>base.slots[1].gesture.intensity);
 assert.equal(a.slots[1].role,'singing');assert.equal(a.slots[2].role,'singing');
});
test('replying duet artist gets a later response cue',()=>{
 const a=doRefine({progressMs:1600});
 const b=doRefine({progressMs:2600});
 assert(a.slots[1].gesture.intensity>b.slots[1].gesture.intensity);
 assert(b.slots[2].gesture.intensity>a.slots[2].gesture.intensity);
});
test('already-established and correct gaze can become slightly more expressive',()=>{
 const a=doRefine({progressMs:1560});
 assert(a.slots[1].look.weight>base.slots[1].look.weight);
 assert(a.slots[1].look.yaw>base.slots[1].look.yaw);
 assert(a.slots[1].look.eyeYaw>base.slots[1].look.eyeYaw);
});
test('zero-weight gaze does not create a partner look',()=>{
 const b={...base,slots:base.slots.map(s=>({...s,look:{...s.look,weight:0}}))};
 const a=doRefine({},b);assert.equal(a.slots[1].look.weight,0);assert.equal(a.slots[2].look.weight,0);
});
test('no yaw when existing gaze does not point to the authored partner',()=>{
 const b={...base,slots:base.slots.map((s,i)=>({...s,look:{...s.look,yaw:i===1?-.1:i===2?.1:0}}))};
 const a=doRefine({},b);assert.equal(a.slots[1].look.yaw,b.slots[1].look.yaw);
 assert.equal(a.slots[2].look.yaw,b.slots[2].look.yaw);
});
test('short stage distance prevents interaction instead of clipping into each other',()=>{
 const x=[[-.05,0,0],[0,0,0],[.1,0,0],[.15,0,0]];
 assert.strictEqual(doRefine({positions:x}),base);
 assert.equal(doEvidence({positions:x}).status,'invalid');
});
test('far stage partners cannot have intimate duet interaction',()=>{
 const x=[[-40,0,0],[-20,0,0],[20,0,0],[40,0,0]];
 assert.strictEqual(doRefine({positions:x}),base);
});
test('incoherent cast cannot modify existing render plan',()=>{
 for(const b of [{...base,kind:'reply'},
    {...base,slots:base.slots.map((s,i)=>i===2?{...s,role:'listening'}:s)},
    {...base,slots:base.slots.slice(0,3)}]){
    assert.strictEqual(doRefine({},b),b);
  }
});
test('explicit handoff respects editorial V496 segment boundary',()=>{
 const c={...cue,style:'reply',lineIndex:-1,partnerSlot:0,singingSlots:[1],handoffFrom:0};
 const b=baseFor(c);const before=refine(b,{...initial,cue:c,progressMs:1010});
 const during=refine(b,{...initial,cue:c,progressMs:1370});
 assert(during.slots[1].gesture.intensity>before.slots[1].gesture.intensity);
 assert(during.slots[0].gesture.intensity>before.slots[0].gesture.intensity);
 assert.equal(during.slots[0].role,'handoff');
});
test('V416 inline reply cannot start before editor .62 phrase boundary',()=>{
 const c={...cue,style:'reply',lineIndex:15,partnerSlot:0,singingSlots:[1],handoffFrom:0};
 const b=baseFor(c),at=c.startMs+(c.endMs-c.startMs)*.62;
 const before=refine(b,{...initial,cue:c,progressMs:at-220});
 const after=refine(b,{...initial,cue:c,progressMs:at+350});
 assert.equal(before.slots[0].gesture.intensity,b.slots[0].gesture.intensity);
 assert(after.slots[0].gesture.intensity>before.slots[0].gesture.intensity);
});
test('no explicit handoff implies no invented former voice',()=>{
 const c={...cue,style:'solo',partnerSlot:null,singingSlots:[1],handoffFrom:null};
 const b=baseFor(c);const v=refine(b,{...initial,cue:c,progressMs:1910});
 assert.deepEqual(v.slots.map(x=>x.role),b.slots.map(x=>x.role));
 assert.equal(evidence(b,{...initial,cue:c}).handoffFrom,null);
});
test('support cast reacts with slot-shifted accents without singer reassignment',()=>{
 const c={...cue,style:'solo',partnerSlot:null,singingSlots:[1],handoffFrom:null};
 const b=baseFor(c);const values=new Set();
 for(let t=1350;t<3500;t+=170){
   const x=refine(b,{...initial,cue:c,progressMs:t});
   values.add(x.slots[0].gesture.intensity.toFixed(6)+'/'+x.slots[3].gesture.intensity.toFixed(6));
   assert.deepEqual(x.slots.map(z=>z.role),b.slots.map(z=>z.role));
 }
 assert(values.size>4);
});
test('full-cast hook is shared but not robotic identical arms',()=>{
 const c={...cue,style:'hook',singingSlots:[0,1,2,3],partnerSlot:null,leadSlot:1,handoffFrom:null};
 const b=baseFor(c);const x=refine(b,{...initial,cue:c,progressMs:1560});
 assert(x.slots.some((s,i)=>s.gesture.intensity>b.slots[i].gesture.intensity));
 assert(x.slots.some((s,i)=>s.gesture.leftLift!==s.gesture.rightLift));
 assert.deepEqual(x.slots.map(s=>s.role),['chorus','chorus','chorus','chorus']);
 assert(x.slots.every((s,i)=>s.look===b.slots[i].look));
});
test('different authored lines vary the recurring hook motif',()=>{
 const c={...cue,style:'hook',singingSlots:[0,1,2,3],partnerSlot:null,leadSlot:1};
 const b=baseFor(c);const variants=new Set();
 for(let line=0;line<20;line++){
   const x=refine(b,{...initial,cue:{...c,lineIndex:line},progressMs:1740});
   variants.add(x.slots.map(s=>s.gesture.leftLift.toFixed(6)).join(','));
 }
 assert(variants.size>=3);
});
test('2, 3, 4 artist editorial hook formations work',()=>{
 for(const n of [2,3,4]){
   const c={...cue,count:n,style:'hook',partnerSlot:null,handoffFrom:null,leadSlot:0,singingSlots:Array.from({length:n},(_,i)=>i)};
   const b=baseFor(c,n);const x=refine(b,{...initial,count:n,cue:c,positions:positions.slice(0,n),progressMs:1600});
   assert.equal(x.slots.length,n);assert(x.slots.every(y=>y.role==='chorus'));
 }
});
test('duet pair is exactly two explicit singers, never all guests',()=>{
 for(const singers of [[1],[1,2,3],[0,1,2,3]]){
   const c={...cue,singingSlots:singers};assert.strictEqual(doRefine({cue:c}),base);
 }
});
test('nonexistent duet partner cannot be imagined',()=>{
 for(const partnerSlot of [null,1,-1,4,3.2]){
   assert.strictEqual(doRefine({cue:{...cue,partnerSlot}}),base);
 }
});
test('manual / reduced motion / pause / low tier all return exact base',()=>{
 for(const p of [{manualPriority:true},{reducedMotion:true},{playing:false},{tier:'low'},
  {strength:0},{strength:-2},{strength:NaN}])assert.strictEqual(doRefine(p),base);
});
test('foreign track and missing track cues cannot leak',()=>{
 for(const p of [{trackId:'other'},{cueTrackId:'other'},{trackId:null},{cueTrackId:null}]){
  assert.strictEqual(doRefine(p),base);assert.equal(doEvidence(p).status,'protected');
 }
});
test('invalid beat / emphasis or contradictory author roles fail closed',()=>{
 for(const p of [{beat:-.1},{beat:1.01},{beat:NaN},
  {cue:{...cue,emphasis:NaN}},{cue:{...cue,emphasis:-1}},
  {cue:{...cue,singingSlots:[1,1]}},{cue:{...cue,leadSlot:3}},
  {cue:{...cue,active:false}}]) assert.strictEqual(doRefine(p),base);
});
test('window boundaries and nonfinite playback time are protected',()=>{
 for(const progressMs of [-100,999,5400,Infinity,NaN])assert.strictEqual(doRefine({progressMs}),base);
});
test('fade near cue entry and exit has small impulse',()=>{
 const a=doRefine({progressMs:1001});const z=doRefine({progressMs:5399});
 assert(a.slots[1].gesture.intensity-base.slots[1].gesture.intensity<.00001);
 assert(z.slots[1].gesture.intensity-base.slots[1].gesture.intensity<.00001);
});
test('bounded existing V452 gesture / gaze constraints at high intensity',()=>{
 const b={...base,slots:base.slots.map(s=>({...s,
  look:{...s.look,yaw:s.look.yaw*.8,weight:.459,eyeYaw:.109},
  gesture:{...s.gesture,leftLift:.129,rightLift:.129,shoulder:.064,lean:.027,intensity:.279}}))};
 for(let t=1001;t<5399;t+=31){
  const r=refine(b,{...initial,progressMs:t,beat:1,strength:100});
  for(const s of r.slots){
   assert(s.gesture.leftLift<=.13&&s.gesture.rightLift<=.13);
   assert(s.gesture.shoulder<=.065&&s.gesture.intensity<=.28);
   assert(Math.abs(s.gesture.lean)<=.028);
   assert(s.look.weight<=.46&&Math.abs(s.look.yaw)<=.42&&Math.abs(s.look.eyeYaw)<=.11);
  }
 }
});
test('balanced <= high accents, low does not modify',()=>{
 const h=doRefine({tier:'high'}),b=doRefine({tier:'balanced'}),l=doRefine({tier:'low'});
 assert(h.slots[1].gesture.intensity>=b.slots[1].gesture.intensity);assert.strictEqual(l,base);
});
test('does not mutate nested source plan nor editorial cue',()=>{
 const b=structuredClone(base);const i=structuredClone(initial);
 const before=signature({b,i});doRefine({},b);assert.equal(signature({b,i}),before);
});
test('pure seek replay produces identical results',()=>{
 const at=doRefine({progressMs:2720});doRefine({progressMs:5100});doRefine({progressMs:1200});
 assert.equal(signature(doRefine({progressMs:2720})),signature(at));
});
test('no timers, noise, GLB or new rendering objects are instantiated',()=>{
 const src=fs.readFileSync('components/visualizer/naturalMultiArtistInteractionV607.ts','utf8');
 for(const pattern of [/Math\.random\(/,/Date\.now\(/,/setTimeout\(/,/setInterval\(/,/new Audio\(/,/new THREE\./,/useFrame\(/,/requestAnimationFrame\(/,/fetch\(/,/new WebGL/])assert(!pattern.test(src),String(pattern));
 assert(!src.includes('use client'));
});
test('no extra leg, foot contact, root or mouth ownership',()=>{
 const source=fs.readFileSync('components/visualizer/naturalMultiArtistInteractionV607.ts','utf8');
 assert(!/\bfootIK\b|\brootMotion\b|morphTargetInfluences|animationMixer/.test(source));
 const x=doRefine();for(let i=0;i<4;i++)assert.equal(x.slots[i].role,base.slots[i].role);
});
test('fully integrated V500 driver preserves plan slots',()=>{
 const x=plan(initial);assert.equal(x.active,true);assert.equal(x.slots.length,4);
 assert.deepEqual(x.slots.map(s=>s.role),base.slots.map(s=>s.role));
});
test('V500 driver never overrides manually authored scenes',()=>{
 for(const p of [{manualPriority:true},{reducedMotion:true},{playing:false},{trackId:'wrong'}]){
  const x=plan({...initial,...p});assert.equal(x.active,false);
 }
});
test('V416 cue may be a two-performer reply',()=>{
 const c={...cue,style:'reply',count:2,partnerSlot:0,leadSlot:1,singingSlots:[1],handoffFrom:0,lineIndex:20};
 const x=plan({...initial,cue:c,count:2,positions:positions.slice(0,2),progressMs:4000});
 assert.equal(x.active,true);assert.deepEqual(x.slots.map(s=>s.role),['handoff','singing']);
});
test('complete 4-singer hooks do not add face-turns',()=>{
 const c={...cue,style:'hook',singingSlots:[0,1,2,3],partnerSlot:null};
 const x=plan({...initial,cue:c,progressMs:1580});
 assert(x.slots.every(s=>s.look.weight===0&&s.look.yaw===0));
});
test('sanitized invalid positions prevent any V607 change',()=>{
 for(const p of [positions.slice(1),[[NaN,0,0],...positions.slice(1)],
  [[-200,0,0],...positions.slice(1)]])assert.strictEqual(doRefine({positions:p}),base);
});
test('10000 deterministic duet song time samples and bounded finite outputs',()=>{
 let changed=0;
 for(let t=0;t<10000;t++){
  const now=1000+(t*37)%4400;
  const x=doRefine({progressMs:now});
  if(x!==base)changed++;
  for(const s of x.slots){
   for(const n of Object.values(s.look).concat(Object.values(s.gesture)))assert(Number.isFinite(n));
   assert(s.gesture.intensity<=.28);assert(s.look.weight<=.46);
  }
 }
 assert(changed>5000);
});
test('track variation does not shift singer identity or timings',()=>{
 const ref=doRefine();const alt=doRefine({trackId:'another',cueTrackId:'another'});
 assert.deepEqual(alt.slots.map(s=>s.role),ref.slots.map(s=>s.role));
 assert.equal(initial.cue.startMs,1000);assert.equal(initial.cue.endMs,5400);
});
test('source ownership for playback, lyric and camera unchanged',()=>{
 const source=fs.readFileSync('components/visualizer/naturalMultiArtistInteractionV607.ts','utf8');
 for(const path of ['StageCameraDirectorV289','KineticLyrics','VocalRigV368','FootIK'])assert(!source.includes(`from './${path}'`));
});
console.log(`PASS V607: ${groups} groups; 10,000 deterministic authored duet timeline samples; full role/track/manual/rig bounds`);
