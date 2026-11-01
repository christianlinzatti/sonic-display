'use strict';
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(807);
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planNaturalMultiArtistStageV807:plan}=load('components/visualizer/naturalMultiArtistStageInteractionV807');
const positions=[[-1.5,0,0],[0,0,0],[1.5,0,0],[3,0,0]];
const cue={active:true,style:'solo',lineIndex:8,leadSlot:0,partnerSlot:null,
 singingSlots:[0],handoffFrom:null,phase:.4,emphasis:.7,startMs:1000,endMs:6000,
 source:'word-timed',count:3};
const base={trackId:'rap-track',cueTrackId:'rap-track',cue,progressMs:2400,count:3,positions,
 playing:true,reducedMotion:false,manualPriority:false,beat:.8,strength:65,tier:'high'};
let tests=0,probes=0;
const test=(name,fn)=>{try{fn();tests++;}catch(e){e.message=`V807 ${name}: ${e.message}`;throw e;}};
const active=plan(base);
const off=(patch)=>assert.strictEqual(plan({...base,...patch}).active,false);
test('actual song-bound vocal cue activates an overlay',()=>assert.deepEqual([active.active,active.reason,active.mode,active.leadSlot],[true,'verified-vocal','solo',0]));
test('three separate performer slots',()=>assert.deepEqual(active.slots.map(s=>s.slot),[0,1,2]));
test('only assigned singer is lead',()=>assert.deepEqual(active.slots.map(s=>s.role),['lead','support','support']));
test('repeated evaluation is deterministic without input mutation',()=>{
 const old=JSON.stringify(base);assert.deepEqual(plan(base),active);assert.equal(JSON.stringify(base),old);
});
for(const [name,patch] of [
 ['wrong track',{trackId:'other'}],['no track',{trackId:''}],['stale cue',{cueTrackId:'old'}],
 ['paused',{playing:false}],['reduced motion',{reducedMotion:true}],['manual timeline',{manualPriority:true}],
 ['low quality',{tier:'low'}],['zero strength',{strength:0}],['negative strength',{strength:-1}],
 ['invalid strength',{strength:101}],['unavailable clock',{progressMs:NaN}],
 ['before cue',{progressMs:999}],['after cue',{progressMs:6000}],
 ['missing positions',{positions:[]}],['invalid stage root',{positions:[[NaN,0,0],...positions.slice(1)]}],
 ['invalid beat',{beat:NaN}],['invalid cue count',{cue:{...cue,count:4}}],
 ['unknown singer',{cue:{...cue,leadSlot:4}}],['duplicate vocals',{cue:{...cue,singingSlots:[0,0]}}],
 ['no editorial time',{cue:{...cue,source:'none'}}],['inactive cue',{cue:{...cue,active:false}}],
 ['invalid timestamp',{cue:{...cue,endMs:1000}}],['invalid lyrics line',{cue:{...cue,lineIndex:-1}}],
 ['missing head evidence',{cue:{...cue,singingSlots:[1]}}],
 ['two solo voices',{cue:{...cue,singingSlots:[0,1]}}],
 ['unsupported style',{cue:{...cue,style:'drop'}}],
 ])test('reject '+name,()=>off(patch));
test('cue onset and end both smoothly fade to neutral',()=>{
 const beginning=plan({...base,progressMs:1000}),end=plan({...base,progressMs:5999});
 assert(!beginning.active);assert(end.active);
 for(const s of end.slots)assert(s.gesture.intensity<1e-5);
});
test('the lead does not turn toward unassigned singer',()=>{
 const s=plan({...base,progressMs:1580});assert.equal(s.slots[0].look.weight,0);
});
test('supporting artists may look toward verified singer',()=>{
 const s=plan({...base,progressMs:2696});assert(s.slots.some((x,i)=>i!==0&&x.look.weight>0));
});
test('duet has two explicitly assigned artists and a partner role',()=>{
 const res=plan({...base,cue:{...cue,style:'duet',partnerSlot:2,singingSlots:[0,2]}});
 assert(res.active);assert.deepEqual(res.slots.map(x=>x.role),['lead','support','partner']);
});
test('duet is rejected without partner',()=>off({cue:{...cue,style:'duet',singingSlots:[0,2],partnerSlot:null}}));
test('duet rejects unassigned partner',()=>off({cue:{...cue,style:'duet',singingSlots:[0,1],partnerSlot:2}}));
test('short-distance/long-distance glance safely disabled',()=>{
 const duet={...cue,style:'duet',partnerSlot:1,singingSlots:[0,1]};
 for(const x of [0,.5,6,100]){
  const res=plan({...base,progressMs:2400,cue:duet,positions:[[0,0,0],[x,0,0],[2,0,0]]});
  assert(res.active);assert.equal(res.slots[0].look.weight,0);
 }
});
test('hook requires complete singer cast',()=>{
 assert(!plan({...base,cue:{...cue,style:'hook'}}).active);
 const res=plan({...base,cue:{...cue,style:'hook',singingSlots:[0,1,2]}});
 assert(res.active);assert(res.slots.every(s=>s.role==='chorus'&&s.look.weight===0));
});
test('explicit outgoing handoff becomes a distinct reaction, not lead',()=>{
 const res=plan({...base,cue:{...cue,style:'reply',handoffFrom:1}});
 assert(res.active);assert.equal(res.slots[1].role,'handoff');assert.equal(res.slots[0].role,'lead');
});
test('invalid handoff cannot target the new lead',()=>off({cue:{...cue,style:'reply',handoffFrom:0}}));
test('two, three and four performers work',()=>{
 for(const count of [2,3,4]){
  const res=plan({...base,count,positions:positions.slice(0,count),cue:{...cue,count}});
  assert(res.active);assert.equal(res.slots.length,count);
 }
});
test('gesture and look envelopes remain tiny and finite for many timestamps',()=>{
 const songStyles=['solo','reply','duet','hook'];
 for(let i=0;i<2500;i++){
  const count=2+i%3,style=songStyles[i%4],slots=Array.from({length:count},(_,n)=>n);
  const xcue={...cue,count,style,partnerSlot:style==='duet'?1:null,
   singingSlots:style==='hook'?slots:style==='duet'?[0,1]:[0],
   handoffFrom:style==='reply'?1:null};
  const input={...base,count,positions:positions.slice(0,count),cue:xcue,
   progressMs:1001+(i*47)%4998,beat:(i%101)/100};
  const res=plan(input);assert(res.active);assert.deepEqual(res,plan(input));
  for(const slot of res.slots){
   for(const n of Object.values(slot.look))assert(Number.isFinite(n)&&Math.abs(n)<.42);
   for(const n of Object.values(slot.gesture))assert(Number.isFinite(n)&&Math.abs(n)<.08);
  }
  probes++;
 }
});
test('both live group and two-performer stage actually consume V807',()=>{
 const group=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
 const duo=fs.readFileSync('components/visualizer/DanceFormationActorsV492.tsx','utf8');
 for(const s of [group,duo]){
  assert(s.includes('planNaturalMultiArtistStageV807('));
  assert(s.includes('combineCrewLooksV452('));assert(s.includes('combineCrewGesturesV452('));
  assert(s.includes("props.avatarMotionMode==='choreography'"));
 }
 assert(group.indexOf('const stageInteractionV807=')<group.indexOf('if(collisionV506.active||motionV508.active)'));
 assert(duo.indexOf('const ensembleInteractionV807=')<duo.indexOf('const handWeight ='));
 assert(duo.includes('softenCollisionGestureV506(leadGesture.current'));
});
test('no extra GLB, mixer, three scene, timer, storage or WebGL loop',()=>{
 const s=fs.readFileSync('components/visualizer/naturalMultiArtistStageInteractionV807.ts','utf8');
 assert(!/\buseFrame\s*\(|new AnimationMixer\s*\(|new PerspectiveCamera\s*\(|requestAnimationFrame\s*\(|localStorage|setInterval\s*\(/.test(s));
});
test('V807 first in all mandatory release gates',()=>{
 const pkg=require('../package.json');assert(/^0\.1\.0-v\d+$/.test(pkg.version));
 for(const k of ['build:preflight','check:fast','check:release'])assert(pkg.scripts[k].includes('npm run test:v807 && npm run test:v807:types && npm run test:v806 && npm run test:v806:types'),k);
});
console.log(`PASS V807: ${tests} tests, ${probes} deterministische multi-artist samples`);
