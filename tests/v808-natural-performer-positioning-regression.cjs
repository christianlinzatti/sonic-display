'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planNaturalPerformerPositioningV808:plan,canRepositionWithGroundV808:groundSafe,canRepositionWithObservationV808:obsSafe}=
 load('components/visualizer/naturalPerformerPositioningV808');
let checks=0,probes=0;
const test=(name,cb)=>{try{cb();checks++;}catch(e){e.message=`V808 ${name}: ${e.message}`;throw e;}};
const cue={active:true,source:'word-timed',style:'duet',lineIndex:2,leadSlot:0,
 partnerSlot:1,handoffFrom:null,singingSlots:[0,1],startMs:1000,endMs:8500,count:3};
const positions=[[-1.9,0,0],[0,0,0],[2.2,0,0]];
const base={trackId:'t808',cueTrackId:'t808',cue,progressMs:4500,count:3,
 positions,playing:true,reducedMotion:false,manualPriority:false,tier:'high',
 footReady:[true,true,true],risks:[0,0,0],strength:85};
const get=(patch)=>plan({...base,...patch});
const off=(patch)=>assert.equal(get(patch).active,false);
const active=get({});
test('real assigned duet changes only performers depth',()=>{
 assert.equal(active.active,true);assert.equal(active.mode,'duet');assert.equal(active.slots.length,3);
 assert(active.slots[0].offsetZ<0&&active.slots[1].offsetZ<0);assert.equal(active.slots[2].offsetZ,0);
 assert.equal(active.slots[0].role,'lead');assert.equal(active.slots[1].role,'partner');
});
test('deterministic with no mutated source',()=>{
 const old=JSON.stringify(base);assert.deepEqual(get({}),active);assert.equal(JSON.stringify(base),old);
});
for(const [name,patch] of [
 ['wrong song',{trackId:'wrong'}],['missing song',{trackId:null}],['stale singer source',{cueTrackId:'stale'}],
 ['pause',{playing:false}],['reduced motion',{reducedMotion:true}],['manual choreography',{manualPriority:true}],
 ['low tier',{tier:'low'}],['no power',{strength:0}],['over-power',{strength:101}],['broken strength',{strength:NaN}],
 ['before segment',{progressMs:900}],['after segment',{progressMs:8500}],['invalid clock',{progressMs:NaN}],
 ['no source',{cue:{...cue,source:'none'}}],['no verified singer',{cue:{...cue,active:false}}],
 ['unsupported solo',{cue:{...cue,style:'solo',singingSlots:[0]}}],
 ['invalid phrase',{cue:{...cue,startMs:8500}}],['invalid line',{cue:{...cue,lineIndex:-1}}],
 ['invalid role',{cue:{...cue,leadSlot:9}}],['duplicate singers',{cue:{...cue,singingSlots:[0,0]}}],
 ['unknown singer',{cue:{...cue,singingSlots:[0,9]}}],
 ['bogus duet',{cue:{...cue,style:'duet',partnerSlot:null}}],
 ['mismatched assigned partner',{cue:{...cue,partnerSlot:2}}],
 ['wrong cast size',{cue:{...cue,count:4}}],['unknown positions',{positions:[[NaN,0,0],...positions.slice(1)]}],
 ['missing positions',{positions:[]}],['missing foot reports',{footReady:[]}],
 ['missing risks',{risks:[]}],['invalid risk',{risks:[0,NaN,0]}],
 ['too close',{positions:[[0,0,0],[1.2,0,0],[3,0,0]]}],
 ])test('reject '+name,()=>off(patch));
test('no motion at phrase boundary; smooth fade near end',()=>{
 assert(!get({progressMs:1000}).active);
 const near=get({progressMs:8499});assert(!near.active||near.slots.every(x=>Math.abs(x.offsetZ)<1e-6));
});
test('rejected contacts suppress their specific roots',()=>{
 const x=get({footReady:[false,true,true]});assert(x.active);
 assert.equal(x.slots[0].offsetZ,0);assert(x.slots[1].offsetZ<0);
});
test('all planted singers reject movement',()=>off({footReady:[false,false,false]}));
test('risk suppresses only threatened root',()=>{
 const x=get({risks:[.19,0,0]});assert(x.active);
 assert.equal(x.slots[0].offsetZ,0);assert(x.slots[1].offsetZ<0);
});
test('high risk and slow foot grounding fail closed',()=>off({risks:[1,1,0]}));
test('support cannot move as a singer',()=>assert.equal(active.slots[2].offsetZ,0));
test('hook needs all singers; different symmetric depth layout',()=>{
 off({cue:{...cue,style:'hook'}});
 const x=get({cue:{...cue,style:'hook',singingSlots:[0,1,2]}});
 assert(x.active);assert(x.slots.every(s=>s.role==='chorus'));
 assert.notEqual(x.slots[0].offsetZ,x.slots[1].offsetZ);
});
test('reply requires a real outgoing singer',()=>{
 off({cue:{...cue,style:'reply',singingSlots:[0],handoffFrom:null}});
 const x=get({cue:{...cue,style:'reply',singingSlots:[0],handoffFrom:1}});
 assert(x.active);assert.equal(x.slots[1].role,'handoff');assert(x.slots[1].offsetZ>0);
});
test('reply invalid outgoing index never moves',()=>off({cue:{...cue,style:'reply',singingSlots:[0],handoffFrom:0}}));
test('balanced tier quieter than high',()=>{
 const b=get({tier:'balanced'});assert(b.active);assert(Math.abs(b.slots[0].offsetZ)<Math.abs(active.slots[0].offsetZ));
});
test('offset never changes X lane; no excessive displacement',()=>{
 for(const slot of active.slots)assert(slot.offsetZ>=-.075&&slot.offsetZ<=.06);
});
test('two to four singers accepted with evidence',()=>{
 for(const n of [2,3,4]){
   const x=plan({...base,count:n,cue:{...cue,count:n},positions:[[-4,0,0],[-2,0,0],[0,0,0],[2,0,0]].slice(0,n),footReady:Array(n).fill(true),risks:Array(n).fill(0)});
   assert.equal(x.active,true);assert.equal(x.slots.length,n);
 }
});
const safeGround={active:true,phase:'moving',support:'left',gain:.85,driftCm:1};
test('real V494 moving support permits tiny root travel',()=>assert(groundSafe(safeGround,false)));
for(const [name,g,locked] of [
 ['V322 active',safeGround,true],['no V494',undefined,false],
 ['low pose',{...safeGround,phase:'low'},false],['lowering',{...safeGround,phase:'lowering'},false],
 ['rising',{...safeGround,phase:'rising'},false],['both planted',{...safeGround,support:'both'},false],
 ['high drift',{...safeGround,driftCm:4},false],['bad drift',{...safeGround,driftCm:NaN},false],
 ['no gain',{...safeGround,gain:0},false],['corrupt gain',{...safeGround,gain:NaN},false],
 ])test('deny '+name,()=>assert(!groundSafe(g,locked)));
const validObs={tracked:true,leftPlanted:true,rightPlanted:false,leftConfidence:.9,rightConfidence:.1,
 leftDriftCm:.5,rightDriftCm:0};
test('V487 measured single-foot stable step permits optional motion',()=>assert(obsSafe(validObs,false,false)));
for(const [name,o,locked,low] of [
 ['missing observation',undefined,false,false],['untracked',{...validObs,tracked:false},false,false],
 ['both planted',{...validObs,rightPlanted:true},false,false],['foot lock',validObs,true,false],
 ['low pose',validObs,false,true],['drift',{...validObs,leftDriftCm:2},false,false],
 ['weak confidence',{...validObs,leftConfidence:.3},false,false],
 ['bad drift',{...validObs,leftDriftCm:NaN},false,false],
 ])test('V487 reject '+name,()=>assert(!obsSafe(o,locked,low)));
test('2500 deterministic repeated timed scenes preserve separation and bounds' ,()=>{
 for(let i=0;i<2500;i++){
  const count=2+i%3,style=i%3===0?'hook':i%3===1?'duet':'reply';
  const pos=Array.from({length:count},(_,j)=>[j*2,0,0]);
  const c={...cue,count,style,singingSlots:style==='hook'?pos.map((_,j)=>j):style==='duet'?[0,1]:[0],
    handoffFrom:style==='reply'?1:null};
  const x=plan({...base,count,positions:pos,cue:c,footReady:Array(count).fill(true),
    risks:Array(count).fill(0),progressMs:1500+(i*31)%6400});
  assert.deepEqual(x,plan({...base,count,positions:pos,cue:c,footReady:Array(count).fill(true),
    risks:Array(count).fill(0),progressMs:1500+(i*31)%6400}));
  assert(x.active);assert(x.slots.every(v=>Number.isFinite(v.offsetZ)&&Math.abs(v.offsetZ)<=.0751));
  for(let a=0;a<count;a++)for(let b=a+1;b<count;b++){
   const dx=pos[a][0]-pos[b][0],dz=x.slots[a].offsetZ-x.slots[b].offsetZ;
   assert(Math.hypot(dx,dz)>=1.5);
  }
  probes++;
 }
});
test('both V326 group and V377 duo actually move existing root targets',()=>{
 const group=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
 const duo=fs.readFileSync('components/visualizer/DanceFormationActorsV492.tsx','utf8');
 assert(group.includes('planNaturalPerformerPositioningV808('));
 assert(group.includes('canRepositionWithGroundV808(g,footLock)'));
 assert(group.includes('canRepositionWithObservationV808('));
 assert(group.includes('base:stagePositionV808')&&group.includes('stageBlockingResultV840.active')&&group.includes('stageBlockingResultV840.offsets[i]')); // V840 refines but cannot replace V808 evidence
 assert(duo.includes('planNaturalPerformerPositioningV808('));
 assert(duo.includes('positionCueV808.current={cue:rapDuetCueV416'));
 assert(duo.includes('duoOffsetV808(0)')&&duo.includes('duoOffsetV808(1)'));
 assert(duo.includes('ensemble.protectionActive'));
 assert(duo.includes('collisionRiskV808.current'));
 assert(duo.includes('lastCollisionAtV808.current'));
 assert(duo.includes('collisionRiskV808.current=['));
 assert(group.includes('safeCollisionDepthV506')&&duo.includes('readFootLockV322().enabled'));
});
test('does not create a renderer, mixer, camera, timer, storage, server side effects',()=>{
 const src=fs.readFileSync('components/visualizer/naturalPerformerPositioningV808.ts','utf8');
 assert(!/\buseFrame\s*\(|new AnimationMixer\s*\(|new PerspectiveCamera\s*\(|requestAnimationFrame\s*\(|localStorage|setInterval\s*\(/.test(src));
});
test('V808 release gates prepend V807',()=>{
 const pkg=require('../package.json');assert(/^0\.1\.0-v(?:850|849|848|847|846|845|844(?:\.1)?|843|842|841|840|(?:80[0-9]|81[0-9]|82[0-9]|83[0-9]))$/.test(pkg.version));
 for(const key of ['build:preflight','check:fast','check:release'])
  assert(pkg.scripts[key].includes('npm run test:v808 && npm run test:v808:types && npm run test:v807 && npm run test:v807:types'),key);
});
console.log(`PASS V808: ${checks} tests; ${probes} deterministische Aufstellungsproben`);
