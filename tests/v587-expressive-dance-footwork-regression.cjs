'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {refineExpressiveFootworkV587:foot,refineExpressiveRigV587:rig}=load('components/visualizer/expressiveDanceFootworkV587');
const {newNaturalFullBodyStateV524,stepNaturalFullBodyV524}=load('components/visualizer/naturalFullBodyDanceV524');
let cases=0;
const test=(title,fn)=>{try{fn();cases++;}catch(error){error.message=`V587 ${title}: ${error.message}`;throw error;}};
const support=(left=false,right=false,tracked=true)=>({tracked,leftPlanted:left,rightPlanted:right});
const slot=()=>({offsetX:.07,offsetZ:-.04,liftLeft:.8,liftRight:.35,rootSpeed:.5,weightShift:.012});
const base=(count=4)=>({active:true,slots:Array.from({length:count},slot)});
const footInput={seconds:12,cueSeconds:2,bpm:120,genre:'Deutschrap',section:'verse',support:Array.from({length:4},()=>support()),tier:'high'};
const g=(b=base(),diff={})=>foot(b,{...footInput,...diff});
const motion={armSwing:.16,followThrough:.1,hipSway:.13,footStep:.14,legGroove:.12,weightShift:.02,headNod:.12,expressionJaw:.4,headTurn:.07};
const rigInput={trackId:'test',seconds:12,playing:true,reducedMotion:false,manualPriority:false,contactKnown:true,
 plantedLeft:true,plantedRight:false,quality:'high',genre:'Deutschrap',section:'verse'};
const r=(m=motion,diff={})=>rig(m,{...rigInput,...diff});
test('group 4 returns new attenuated automatic steps',()=>{const src=base(),out=g(src);assert(out.active&&out!==src);assert.equal(out.slots.length,4);assert(out.slots[0].liftLeft<src.slots[0].liftLeft);});
test('group 3 accepts four available support records',()=>{const x=base(3);assert(g(x).slots[0].liftLeft<x.slots[0].liftLeft);});
test('manual, reduced, low and paused safety delegated to V524',()=>{
 const options={trackId:'t',seconds:12,delta:1/60,count:4,footwork:base(),support:footInput.support,genre:'Deutschrap',playing:true,
  reducedMotion:false,manualPriority:false,footLocked:false,automaticGroup:true,tier:'high',expressiveV587:{cueSeconds:2,bpm:120,section:'hook'}};
 for(const change of [{manualPriority:true},{reducedMotion:true},{playing:false},{tier:'low'},{footLocked:true},{automaticGroup:false}]){
   const x=stepNaturalFullBodyV524(newNaturalFullBodyStateV524(),{...options,...change});
   assert(!x.active);assert.strictEqual(x.footwork,options.footwork);
 }
});
test('no invented contact when support untracked',()=>{const out=g(base(),{support:Array.from({length:4},()=>support(true,true,false))});assert(out.slots[0].liftLeft>0&&out.slots[0].liftRight>0);});
for(const which of ['left','right','both'])test(`known ${which} planted foot never lifts`,()=>{
 const planted=which==='left'?support(true,false):which==='right'?support(false,true):support(true,true);
 const out=g(base(),{support:Array.from({length:4},()=>planted)});
 for(const item of out.slots){if(planted.leftPlanted)assert.equal(item.liftLeft,0);if(planted.rightPlanted)assert.equal(item.liftRight,0);}
});
test('both feet planted reduces sway without changing travel',()=>{
 const b=base(),out=g(b,{support:Array.from({length:4},()=>support(true,true))});
 assert(Math.abs(out.slots[0].weightShift)<Math.abs(b.slots[0].weightShift));
 assert.equal(out.slots[0].rootSpeed,b.slots[0].rootSpeed);
 assert.equal(out.slots[0].offsetX,b.slots[0].offsetX);assert.equal(out.slots[0].offsetZ,b.slots[0].offsetZ);
});
test('no mutation of sources or measured support',()=>{const b=base(),i=structuredClone(footInput),bb=JSON.stringify(b),ii=JSON.stringify(i);g(b);assert.equal(JSON.stringify(b),bb);assert.equal(JSON.stringify(i),ii);});
test('pure deterministic seek playback',()=>{const before=g();g(base(),{seconds:5});g(base(),{seconds:38});assert.deepEqual(g(),before);});
test('no invented beat if BPM unknown',()=>{const b=base(),x=g(b,{bpm:null,seconds:10}),y=g(b,{bpm:null,seconds:12});assert.deepEqual(x,y);});
test('supplied BPM yields subtle tempo-bound diversity',()=>{const x=g(),y=g(base(),{seconds:13});assert.notDeepEqual(x.slots[0],y.slots[0]);assert.notEqual(x.slots[0].liftLeft,x.slots[1].liftLeft);});
test('hook is more energetic than verse but never exceeds V524',()=>{const b=base(),verse=g(b).slots[0],hook=g(b,{section:'hook'}).slots[0];assert(hook.liftLeft>verse.liftLeft);assert(hook.liftLeft<=b.slots[0].liftLeft);});
test('low tier and inactive footwork preserve exact object identity',()=>{const b=base();assert.strictEqual(g(b,{tier:'low'}),b);b.active=false;assert.strictEqual(g(b),b);});
for(const values of [{seconds:NaN},{seconds:-1},{cueSeconds:NaN},{cueSeconds:13},{support:[]},{tier:'low'}])test('invalid input bypass '+JSON.stringify(values),()=>{
 const b=base();assert.strictEqual(g(b,values),b);
});
test('unexpected nonfinite lift bypasses intact input',()=>{const b=base();b.slots[0].liftRight=NaN;assert.strictEqual(g(b),b);});
test('GLB rig modulates only existing additive channels',()=>{const original=JSON.stringify(motion),o=r();assert(o!==motion);assert(Math.abs(o.armSwing)<=Math.abs(motion.armSwing));assert(Math.abs(o.followThrough)<=Math.abs(motion.followThrough));assert.equal(JSON.stringify(motion),original);for(const k of ['footStep','legGroove','weightShift','headNod','expressionJaw','headTurn'])assert.equal(o[k],motion[k]);});
test('GLB both planted suppresses arms and sway more',()=>{const one=r(),two=r(motion,{plantedRight:true});assert(Math.abs(two.armSwing)<Math.abs(one.armSwing));assert(Math.abs(two.hipSway)<Math.abs(one.hipSway));});
test('GLB hook keeps slightly more shoulder energy',()=>{const verse=r(),hook=r(motion,{section:'hook'});assert(hook.armSwing>verse.armSwing);});
test('GLB zero motion does not invent new motions',()=>{const z={...motion,armSwing:0,followThrough:0,hipSway:0};const x=r(z);assert.equal(x.armSwing,0);assert.equal(x.followThrough,0);assert.equal(x.hipSway,0);});
for(const [label,diff] of [['pause',{playing:false}],['manual',{manualPriority:true}],['no IK',{contactKnown:false}],['reduced',{reducedMotion:true}],['low',{quality:'low'}],['no track',{trackId:''}],['time missing',{seconds:NaN}]])test(`GLB ${label} identity`,()=>assert.strictEqual(r(motion,diff),motion));
test('no clipping of negative arm motion',()=>{const n={...motion,armSwing:-.16,followThrough:-.1,hipSway:-.13};const out=r(n);assert(out.armSwing<0&&out.followThrough<0&&out.hipSway<0);assert(Math.abs(out.armSwing)<=.16);});
test('GLB NaN source passes through unchanged',()=>{const n={...motion,footStep:NaN};assert.strictEqual(r(n),n);});
test('integration uses V524 before V587, V545 before rig, then single IK',()=>{
 const a=fs.readFileSync('components/visualizer/naturalFullBodyDanceV524.ts','utf8');
 const group=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
 const glb=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
 assert(a.includes('input.expressiveV587?refineExpressiveFootworkV587('));
 assert(group.includes('expressiveV587:{cueSeconds:settings.cues.find'));
 assert(group.includes('footwork:naturalFootworkV524.slots[i]'));
 assert(glb.indexOf('const motionV545=refineNaturalDanceMotionV545(')<glb.indexOf('refineExpressiveRigV587(motionV545'));
 assert(glb.indexOf('refineExpressiveRigV587(motionV545')<glb.indexOf('applyAvatarRigMotion(rigTargets.current, debugMotion'));
 assert(glb.indexOf('applyAvatarRigMotion(rigTargets.current, debugMotion')<glb.indexOf('updateFootGrounding({delta'));
});
test('no extra loop, scheduler or new contact solver',()=>{
 const code=fs.readFileSync('components/visualizer/expressiveDanceFootworkV587.ts','utf8');
 for(const token of ['requestAnimationFrame','useFrame(','setInterval(','Math.random(','Date.now(','new AnimationMixer','new AnimationClip','fetch(','updateFootGrounding('])assert(!code.includes(token),token);
});
test('20,000 musical samples and contact constraints',()=>{
 for(let i=0;i<20000;i++){
  const s=12+i/65;const sup=Array.from({length:4},(_,j)=>support(i%43<5,(j+i)%59<4,i%7!==0));
  const src={active:true,slots:Array.from({length:4},(_,j)=>({...slot(),liftLeft:Math.sin((i+j)*.017)**2,liftRight:Math.sin((i+j)*.019)**2,weightShift:Math.sin(i*.01)*.014}))};
  const out=g(src,{seconds:s,genre:i%3===0?'Hardtekk':'Deutschrap',section:i%5===0?'hook':'verse',support:sup});
  for(let j=0;j<4;j++){
   const a=out.slots[j],b=src.slots[j];
   assert(Object.values(a).every(Number.isFinite));
   assert(a.liftLeft>=0&&a.liftLeft<=b.liftLeft+1e-10);
   assert(a.liftRight>=0&&a.liftRight<=b.liftRight+1e-10);
   if(sup[j].tracked&&sup[j].leftPlanted)assert.equal(a.liftLeft,0);
   if(sup[j].tracked&&sup[j].rightPlanted)assert.equal(a.liftRight,0);
   assert.equal(a.rootSpeed,b.rootSpeed);assert.equal(a.offsetX,b.offsetX);assert.equal(a.offsetZ,b.offsetZ);
   assert(Math.abs(a.weightShift)<=.014+1e-10);
  }
 }
});
console.log(`PASS V587: ${cases} groups with 20,000 playback samples and GLB/contact integration safety`);
