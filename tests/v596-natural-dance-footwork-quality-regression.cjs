'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {newGroupFootworkQualityStateV596:newG,stepGroupFootworkQualityV596:group,
 newGlbFootworkQualityStateV596:newR,stepGlbFootworkQualityV596:rig}=load('components/visualizer/naturalFootworkQualityV596');
let cases=0;const test=(name,fn)=>{try{fn();cases++}catch(e){e.message=`V596 ${name}: ${e.message}`;throw e}};
const support=(left=false,right=false,tracked=true)=>({leftPlanted:left,rightPlanted:right,tracked});
const slot=()=>({offsetX:.08,offsetZ:-.03,liftLeft:.8,liftRight:.6,rootSpeed:.52,weightShift:.012});
const base=(n=4)=>({active:true,slots:Array.from({length:n},slot)});
const ginput=(overrides={})=>({trackId:'song-1',seconds:10,delta:1/60,playing:true,reducedMotion:false,manualPriority:false,
 automaticGroup:true,footLocked:false,tier:'high',genre:'Deutschrap',support:Array.from({length:4},()=>support()),...overrides});
const glb={footStep:.16,legGroove:.19,weightShift:.025,armSwing:.22,hipCounter:.15,headNod:.3,expressionJaw:.66};
const rinput=(overrides={})=>({trackId:'song-1',modelKey:'avatar-1',seconds:10,delta:1/60,playing:true,
 reducedMotion:false,manualPriority:false,footIKEnabled:true,contactKnown:true,plantedLeft:false,plantedRight:false,quality:'high',genre:'Deutschrap',...overrides});
test('untracked support never invents planted contact',()=>{const b=base();const a=group(newG(),b,ginput({support:Array.from({length:4},()=>support(true,true,false))}));assert.deepEqual(a.footwork,b);assert.equal(a.state.phases[0].known,false)});
test('initial group automatic steps remain unchanged with valid contacts',()=>{const b=base(),out=group(newG(),b,ginput());assert(out.active);assert.deepEqual(out.footwork,b);assert.notEqual(out.footwork,b)});
for(const side of ['left','right','both'])test('known planted '+side+' stops lift immediately',()=>{
 const planted=support(side!=='right',side!=='left');const result=group(newG(),base(),ginput({support:Array.from({length:4},()=>planted)}));
 for(const step of result.footwork.slots){if(planted.leftPlanted)assert.equal(step.liftLeft,0);if(planted.rightPlanted)assert.equal(step.liftRight,0);assert.equal(step.rootSpeed,.52)}
});
test('group release is gentle, monotonically restoring existing lift',()=>{
 let state=group(newG(),base(),ginput({support:Array.from({length:4},()=>support(true,false))})).state;
 let previous=0;
 for(let i=1;i<=50;i++){
  const v=group(state,base(),ginput({seconds:10+i/60,support:Array.from({length:4},()=>support())}));state=v.state;
  const lift=v.footwork.slots[0].liftLeft;
  assert(lift>=previous-1e-12 && lift<=.8+1e-12);
  assert.equal(v.footwork.slots[0].liftRight,.6);
  previous=lift;
 }
 assert(previous>.70,'released foot eventually regains original step');
});
test('group new contact snaps down, not up',()=>{
 let s=group(newG(),base(),ginput()).state;
 s=group(s,base(),ginput({seconds:10.017,support:Array.from({length:4},()=>support(false,true))})).state;
 const o=group(s,base(),ginput({seconds:10.034,support:Array.from({length:4},()=>support(true,true))}));
 assert.equal(o.footwork.slots[0].liftLeft,0);assert.equal(o.footwork.slots[0].liftRight,0);
});
test('group strength never exceeds existing source, root travel and offsets unchanged',()=>{
 const b=base(),o=group(newG(),b,ginput({support:Array.from({length:4},()=>support(true,true))}));
 assert(o.footwork.slots.every((s,i)=>s.offsetX===b.slots[i].offsetX&&s.offsetZ===b.slots[i].offsetZ&&s.rootSpeed===b.slots[i].rootSpeed&&Math.abs(s.weightShift)<=Math.abs(b.slots[i].weightShift)));
});
test('group data immutable and deterministic for identical frame',()=>{
 const src=base(),a=ginput(),before=JSON.stringify([src,a]),state=newG();assert.deepEqual(group(state,src,a),group(state,src,a));assert.equal(JSON.stringify([src,a]),before)});
test('track swap and backwards seek never reuses release envelope',()=>{
 let s=group(newG(),base(),ginput({support:Array.from({length:4},()=>support(true,false))})).state;
 const song=group(s,base(),ginput({trackId:'next',seconds:3}));assert.equal(song.footwork.slots[0].liftLeft,.8);
 const seek=group(s,base(),ginput({seconds:4}));assert.equal(seek.footwork.slots[0].liftLeft,.8);
});
for(const [why,change] of Object.entries({pause:{playing:false},manual:{manualPriority:true},reduced:{reducedMotion:true},low:{tier:'low'},
 footLock:{footLocked:true},author:{automaticGroup:false},missingTrack:{trackId:''},missingSupport:{support:[]},badTime:{seconds:NaN},badDelta:{delta:NaN},gap:{delta:.3}}))test('group '+why+' bypasses and resets state',()=>{
 const b=base(),st=group(newG(),b,ginput()).state;const o=group(st,b,ginput(change));assert.strictEqual(o.footwork,b);assert.deepEqual(o.state,newG());
});
for(const n of [2,5])test('group size '+n+' is never modified',()=>{const b=base(n);assert.strictEqual(group(newG(),b,ginput()).footwork,b)});
test('unknown support in middle of release never fabricates a plant',()=>{
 const planted=Array.from({length:4},()=>support(true,false));const unknown=Array.from({length:4},()=>support(true,false,false));
 const s=group(newG(),base(),ginput({support:planted})).state;
 const o=group(s,base(),ginput({seconds:10.018,support:unknown}));assert.equal(o.footwork.slots[0].liftLeft,.8);
});
test('GLB initial step preserved if feet are free',()=>{const a=rig(newR(),glb,rinput());assert.equal(a.motion.footStep,glb.footStep);assert.equal(a.motion.headNod,glb.headNod)});
test('GLB both-planted dampens residual foot impulse and balance',()=>{const a=rig(newR(),glb,rinput({plantedLeft:true,plantedRight:true}));assert(a.motion.footStep<glb.footStep&&a.motion.legGroove<glb.legGroove&&a.motion.weightShift<glb.weightShift)});
test('GLB one-foot plant immediately lowers step without touching facial or arms',()=>{
 const o=rig(newR(),glb,rinput({plantedLeft:true})).motion;assert(o.footStep<glb.footStep);
 for(const key of ['armSwing','hipCounter','headNod','expressionJaw'])assert.equal(o[key],glb[key]);
});
test('GLB lift after planted stance has a bounded smooth release',()=>{
 let state=rig(newR(),glb,rinput({plantedLeft:true})).state;
 let prev=0;
 for(let i=1;i<=65;i++){
  const out=rig(state,glb,rinput({seconds:10+i/60}));state=out.state;
  assert(out.motion.footStep>=prev-1e-12 && out.motion.footStep<=glb.footStep+1e-12);prev=out.motion.footStep;
 }assert(prev>.15);
});
test('GLB negatives retain sign and zero remains zero',()=>{
 const m={...glb,footStep:-.17,legGroove:-.16,weightShift:0};const a=rig(newR(),m,rinput({plantedLeft:true,plantedRight:true}));
 assert(a.motion.footStep<0&&a.motion.legGroove<0&&a.motion.weightShift===0);
});
test('GLB frames are deterministic without mutating state or source',()=>{
 const state=newR(),before=JSON.stringify(glb),a=rig(state,glb,rinput());assert.deepEqual(a,rig(state,glb,rinput()));assert.equal(JSON.stringify(glb),before);
});
for(const [why,change] of Object.entries({pause:{playing:false},reduced:{reducedMotion:true},manual:{manualPriority:true},
 noIk:{footIKEnabled:false},unknown:{contactKnown:false},low:{quality:'low'},missingTrack:{trackId:''},missingModel:{modelKey:''},badTime:{seconds:NaN},badDelta:{delta:0}}))test('GLB '+why+' returns original motion',()=>{
 const a=rig(newR(),glb,rinput(change));assert.strictEqual(a.motion,glb);assert.deepEqual(a.state,newR());
});
test('GLB malformed source returns untouched motion',()=>{const b={...glb,footStep:NaN};assert.strictEqual(rig(newR(),b,rinput()).motion,b)});
test('GLB seek and model switch discard previous contact state',()=>{
 const s=rig(newR(),glb,rinput({plantedLeft:true})).state;
 assert.equal(rig(s,glb,rinput({trackId:'new',seconds:1})).motion.footStep,glb.footStep);
 assert.equal(rig(s,glb,rinput({modelKey:'new'})).motion.footStep,glb.footStep);
 assert.equal(rig(s,glb,rinput({seconds:2})).motion.footStep,glb.footStep);
});
test('GLB and group integration keep one existing frame pipeline',()=>{
 const nat=fs.readFileSync('components/visualizer/naturalFullBodyDanceV524.ts','utf8');
 const groupCode=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
 const glbCode=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
 assert(nat.includes('stepGroupFootworkQualityV596('));assert(nat.indexOf('refineExpressiveFootworkV587(')<nat.indexOf('stepGroupFootworkQualityV596('));
 assert(groupCode.includes('qualityV596:{state:qualityStateV596.current}'));
 assert(glbCode.indexOf('refineExpressiveRigV587(motionV545')<glbCode.indexOf('stepGlbFootworkQualityV596('));
 assert(glbCode.indexOf('stepGlbFootworkQualityV596(')<glbCode.indexOf('applyAvatarRigMotion(rigTargets.current, debugMotion'));
 assert(glbCode.indexOf('applyAvatarRigMotion(rigTargets.current, debugMotion')<glbCode.indexOf('updateFootGrounding({delta'));
});
test('real V524→V587→V596 group pipeline retains contact authority',()=>{
 const {newNaturalFullBodyStateV524,stepNaturalFullBodyV524}=load('components/visualizer/naturalFullBodyDanceV524');
 let baseState=newNaturalFullBodyStateV524(), qualityState=newG();
 const mk=(seconds,feet)=>({trackId:'song-1',seconds,delta:1/60,count:4,footwork:base(),support:Array.from({length:4},()=>feet),
  genre:'Deutschrap',playing:true,reducedMotion:false,manualPriority:false,footLocked:false,automaticGroup:true,tier:'high',
  expressiveV587:{cueSeconds:0,bpm:120,section:'verse'},qualityV596:{state:qualityState}});
 const planted=stepNaturalFullBodyV524(baseState,mk(12,support(true,false)));
 assert(planted.active&&planted.qualityStateV596);assert.equal(planted.footwork.slots[0].liftLeft,0);
 baseState=planted.state;qualityState=planted.qualityStateV596;
 const released=stepNaturalFullBodyV524(baseState,mk(12+1/60,support(false,false)));
 assert(released.active&&released.footwork.slots[0].liftLeft<=released.state.slots[0].liftLeft+1e-12);
 assert.equal(released.footwork.slots[0].offsetX,base().slots[0].offsetX);
});
test('no added time source, clip manipulation or independent render loop',()=>{
 const code=fs.readFileSync('components/visualizer/naturalFootworkQualityV596.ts','utf8');
 for(const marker of ['requestAnimationFrame','useFrame(','Math.random(','Date.now(','new AnimationMixer','new AnimationClip','fetch(','updateFootGrounding('])assert(!code.includes(marker),marker);
});
test('30/60/120fps phase release agrees within allowed envelope',()=>{
 function run(dt){let state=group(newG(),base(),ginput({support:Array.from({length:4},()=>support(true))})).state;
  for(let i=1;i<=Math.round(.5/dt);i++)state=group(state,base(),ginput({seconds:10+i*dt,delta:dt})).state;
  return state.phases[0].left;}
 const a=run(1/30),b=run(1/60),c=run(1/120);assert(Math.abs(a-b)<.015&&Math.abs(c-b)<.015);
});
test('25,000 sustained genre/foot-contact frames produce finite bounded results',()=>{
 let gs=newG(),rs=newR();for(let i=0;i<25000;i++){
  const at=12+i/60,genre=i%3===0?'Hardtekk':i%3===1?'Deutschrap':'Hardstyle';
  const supports=Array.from({length:4},(_,j)=>support((i+j)%91<6,(i+2*j)%113<7,i%17!==0));
  const src={active:true,slots:Array.from({length:4},(_,j)=>({...slot(),liftLeft:Math.sin((i+j)*.03)**2,
   liftRight:Math.sin((i+j+31)*.028)**2,weightShift:Math.sin(i*.011)*.014}))};
  const frame=group(gs,src,ginput({seconds:at,genre,support:supports}));gs=frame.state;
  for(let j=0;j<4;j++){
   const a=frame.footwork.slots[j],b=src.slots[j];assert(Object.values(a).every(Number.isFinite));
   assert(a.liftLeft>=0&&a.liftLeft<=b.liftLeft+1e-12&&a.liftRight>=0&&a.liftRight<=b.liftRight+1e-12);
   assert(a.rootSpeed===b.rootSpeed&&a.offsetX===b.offsetX&&a.offsetZ===b.offsetZ);
   if(supports[j].tracked&&supports[j].leftPlanted)assert.equal(a.liftLeft,0);
   if(supports[j].tracked&&supports[j].rightPlanted)assert.equal(a.liftRight,0);
   assert(Math.abs(a.weightShift)<=Math.abs(b.weightShift)+1e-12);
  }
  const m={...glb,footStep:Math.sin(i*.02)*.18,weightShift:Math.sin(i*.014)*.2};
  const next=rig(rs,m,rinput({seconds:at,genre,plantedLeft:i%91<6,plantedRight:i%79<5}));rs=next.state;
  for(const k of ['footStep','legGroove','weightShift'])assert(Math.abs(next.motion[k])<=Math.abs(m[k])+1e-12);
  assert.equal(next.motion.expressionJaw,m.expressionJaw);
 }
});
console.log(`PASS V596: ${cases} test groups, 25,000 contact/genre frames plus seeks and 30/60/120 FPS tests`);
