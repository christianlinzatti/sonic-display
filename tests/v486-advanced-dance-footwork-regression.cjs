require('./helpers/threeAvatarSourcesV492.cjs').install();
"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planAdvancedDanceFootworkV486:plan}=load('components/visualizer/advancedDanceFootworkV486');
const slots=[{offsetX:0,offsetZ:0,step:0,lean:0},
 {offsetX:.09,offsetZ:-.18,step:.8,lean:-.02},
 {offsetX:-.03,offsetZ:.02,step:0,lean:.01},
 {offsetX:0,offsetZ:0,step:0,lean:0}];
const motion={active:true,mode:'passing',slots};
const noSupport=Array.from({length:4},()=>({tracked:false,leftPlanted:false,rightPlanted:false}));
const make=(diff={})=>({motion,count:4,seconds:2.14,cueSeconds:0,bpm:120,playing:true,reducedMotion:false,manualPriority:false,footLocked:false,tier:'high',support:noSupport,...diff});
const result=plan(make());
assert(result.active);
assert.equal(result.slots.length,4);
assert(result.slots[1].liftLeft>0 || result.slots[1].liftRight>0,'alternating procedural foot lift');
assert.deepEqual(plan(make()),result,'deterministic planning independent of elapsed render time');
assert(Math.abs(result.slots[1].offsetX)<.09 && Math.abs(result.slots[1].offsetZ)<.18,'reduced original root movement');
assert(result.slots[1].rootSpeed>=.48&&result.slots[1].rootSpeed<=1,'travel smoothing');
assert(Math.abs(result.slots[1].weightShift)<=.014,'bounded postural compensation');
// Stance reporting must be genuine IK data. A double planted pair slows optional
// travel without changing authored clips or the existing source formation.
const both=noSupport.map((p,i)=>i===1?{tracked:true,leftPlanted:true,rightPlanted:true}:p);
const grounded=plan(make({support:both}));
assert.equal(grounded.slots[1].rootSpeed,.12);
assert.equal(grounded.slots[1].liftLeft,0);
assert.equal(grounded.slots[1].liftRight,0);
assert.equal(grounded.slots[1].offsetX,result.slots[1].offsetX);
const one=noSupport.map((p,i)=>i===1?{tracked:true,leftPlanted:true,rightPlanted:false}:p);
const half=plan(make({support:one}));
assert.equal(half.slots[1].liftLeft,0,'planted left foot remains unaffected');
assert(half.slots[1].rootSpeed>.12);
// With no available IK state, never assume both feet are grounded.
assert(result.slots[1].rootSpeed>.12);
// The new model avoids renderer-time-based phase drift; equivalent positions
// after complete beat periods reproduce the same step cue when V485 motion is same.
assert.deepEqual(plan(make({seconds:2.14})),plan(make({seconds:4.14})));
const around=[];
for(let n=0;n<=1000;n++){
 const r=plan(make({seconds:1+n/500})).slots[1];
 around.push(r);
 assert(r.liftLeft>=0&&r.liftRight>=0&&r.liftLeft<=.8&&r.liftRight<=.8);
 assert(r.liftLeft*r.liftRight<.000001,'never lift both feet at once');
}
for(let i=1;i<around.length;i++){
 assert(Math.abs(around[i].liftLeft-around[i-1].liftLeft)<.05,'left step smoothly enters and exits');
 assert(Math.abs(around[i].liftRight-around[i-1].liftRight)<.05,'right step smoothly enters and exits');
}
const balanced=plan(make({tier:'balanced'}));
assert(balanced.slots[1].liftLeft<=result.slots[1].liftLeft);
assert(balanced.slots[1].liftRight<=result.slots[1].liftRight);
for(const guard of [{playing:false},{reducedMotion:true},{manualPriority:true},{footLocked:true},{tier:'low'},
 {seconds:NaN},{seconds:Infinity},{seconds:-1},{cueSeconds:-2},{cueSeconds:NaN},
 {count:2},{count:5},{support:[]},{motion:{...motion,active:false}},
 {motion:{...motion,slots:slots.map(s=>({...s,offsetX:Infinity}))}}]){
 const response=plan(make(guard));
 assert.equal(response.active,false,JSON.stringify(guard));
 assert(response.slots.every(s=>s.offsetX===0&&s.offsetZ===0&&s.liftLeft===0&&s.liftRight===0&&s.rootSpeed===1));
}
// Full-group drop, low performers: no new floor travel or animated lifted feet.
const lowDrop=plan(make({motion:{active:true,mode:'drop',slots:slots.map(()=>({offsetX:0,offsetZ:0,step:0,lean:.012}))}}));
assert.equal(lowDrop.active,false);
assert(lowDrop.slots.every(s=>s.rootSpeed===1&&s.liftLeft===0&&s.liftRight===0));
// Long running deterministic checks include seeks, BPM edges and varying contact.
for(let t=0;t<120000;t++){
 const sec=t/60;
 const r=plan(make({seconds:sec,cueSeconds:Math.floor(sec/12)*12,bpm:t%37===0?NaN:125,support:t%211===0?both:noSupport}));
 if(t%209===0)for(const s of r.slots){
  assert(Object.values(s).every(Number.isFinite));
  assert(s.liftLeft>=0&&s.liftRight>=0&&s.rootSpeed>=.12&&s.rootSpeed<=1);
  assert(Math.abs(s.offsetX)<=.105&&Math.abs(s.offsetZ)<=.2);
 }
}
const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
for(const token of ['planAdvancedDanceFootworkV486({','GroupFootSupportContextV486.Provider',
 'GroupFootworkContextV486.Provider','groupSupportV486.current.leftPlanted',
 'groupSupportV486.current.rightPlanted','groupFootworkV486?.current.liftLeft',
 'advancedFootworkV486.slots[i].rootSpeed','advancedFootworkV486.slots[i].offsetX']){
 assert(avatar.includes(token),`live R3F integration missing ${token}`);
}
assert(!avatar.includes('Math.sin(state.clock.elapsedTime*5+workloadSlot*.7)'),'V485 unscoped renderer clock must not drive step');
const source=fs.readFileSync('components/visualizer/advancedDanceFootworkV486.ts','utf8');
assert(!/\b(fetch|setInterval|setTimeout|requestAnimationFrame|Date\.now|Math\.random|new THREE)\b/.test(source),'pure bounded planner');
const pkg=require('../package.json');
assert(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=486);
assert(pkg.scripts['build:preflight'].includes('npm run test:v486 && npm run test:v486:types'));
console.log('PASS V486: song-clock stance, alternating foot swings, measured GLB IK support, guard priority, BPM seek, 33-min simulation');
