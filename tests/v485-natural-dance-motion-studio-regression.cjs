'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planNaturalDanceMotionV485:plan}=load('components/visualizer/naturalDanceMotionStudioV485');
const positions=[[-2.1,0,0],[-.7,0,0],[.7,0,0],[2.1,0,0]];
const original={active:true,source:'automatic-stage',slots:[
  {mode:'crouch',depth:.4},{mode:'stand',depth:0},{mode:'crouch',depth:.38},{mode:'stand',depth:0},
]};
const input=(v={})=>({plan:original,count:4,positions,focus:1,trackId:'music-v485',seconds:2,cueSeconds:0,
  beat:.89,kick:.7,energy:.75,genre:'Deutschrap',playing:true,reducedMotion:false,manualPriority:false,
  lyricsForeground:false,automaticGroup:true,footLocked:false,tier:'high',...v});
const result=plan(input());
assert(result.active&&result.mode==='passing','standing dancer moves in front of crouched partner');
assert.equal(result.slots.length,4);
assert(result.slots.some(s=>s.step>0),'procedural step cue is available');
assert(result.slots.some(s=>s.offsetZ<0),'brief foreground pass without lane swap');
assert.deepEqual(plan(input()),result,'seek-safe planning for an identical input');
for(const [i,s] of result.slots.entries()){
 assert(Math.abs(s.offsetX)<=.10501&&Math.abs(s.offsetZ)<=.20001,'small travel');
 assert(s.step>=0&&s.step<=1&&Math.abs(s.lean)<=.02501,'bounded leg and balance accents');
 for(const v of Object.values(s))assert(Number.isFinite(v));
 for(let j=i+1;j<4;j++){
  const t=result.slots[j];
  const d=Math.hypot(positions[i][0]+s.offsetX-positions[j][0]-t.offsetX,
    positions[i][2]+s.offsetZ-positions[j][2]-t.offsetZ);
  assert(d>=1.03,'preserved stage root spacing');
 }
}
const entry=plan(input({seconds:.3}));
assert(!entry.active,'starts from the original stage pose');
const rejoin=plan(input({seconds:3.9}));
assert(!rejoin.active&&rejoin.slots.every(s=>s.offsetX===0&&s.offsetZ===0),'returns to fixed stage lanes');
const allLow=plan(input({plan:{...original,slots:original.slots.map(()=>({mode:'crouch',depth:.41}))}}));
assert(allLow.active&&allLow.mode==='drop','group drop has no passing');
assert(allLow.slots.every(s=>s.offsetX===0&&s.offsetZ===0&&s.step===0),'crouching dancers keep both feet planted');
const noBeat=plan(input({beat:.1,kick:.1}));
assert(!noBeat.active,'no invented music event');
const balanced=plan(input({tier:'balanced'}));
assert(balanced.active);
assert(Math.max(...balanced.slots.map(s=>Math.abs(s.offsetZ)))<Math.max(...result.slots.map(s=>Math.abs(s.offsetZ))));
for(const guard of [
 {playing:false},{reducedMotion:true},{manualPriority:true},{automaticGroup:false},
 {lyricsForeground:true},{footLocked:true},{tier:'low'},{trackId:''},
 {count:2},{count:5},{seconds:NaN},{seconds:-2},{cueSeconds:NaN},
 {seconds:0,cueSeconds:8},{energy:.05},{beat:Infinity},{kick:NaN},
 {plan:{...original,active:false}},{plan:{...original,source:'disabled'}},
 {positions:[...positions.slice(0,3),[NaN,0,0]]},
 {positions:[[-.2,0,0],[-.1,0,0],[.7,0,0],[2.1,0,0]]},
 ]){
  const output=plan(input(guard));
  assert(!output.active,JSON.stringify(guard));
  assert(output.slots.every(s=>Object.values(s).every(v=>v===0)));
}
// V485 is bounded across >30 minutes without a new timer/ref or cumulative drift.
for(let i=0;i<120000;i++){
 const seconds=i/60;
 const next=plan(input({seconds,cueSeconds:Math.floor(seconds/12)*12,
   beat:Math.sin(seconds)**2,kick:Math.cos(seconds)**2,energy:.65}));
 if(i%349===0)for(const s of next.slots){
  assert(Object.values(s).every(Number.isFinite));
  assert(Math.abs(s.offsetX)<=.106&&Math.abs(s.offsetZ)<=.201&&s.step<=1);
 }
}
const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
for(const symbol of ['planNaturalDanceMotionV485({','GroupDanceMotionContextV485.Provider',
  'stepLeftV485','stepRightV485','advancedFootworkV486.slots[i].offsetX','advancedFootworkV486.slots[i].offsetZ'])
 assert(avatar.includes(symbol),`runtime integration ${symbol}`);
const moduleSource=fs.readFileSync('components/visualizer/naturalDanceMotionStudioV485.ts','utf8');
assert(!/\b(fetch|setInterval|setTimeout|requestAnimationFrame|Math\.random|Date\.now|new THREE)\b/.test(moduleSource),'pure deterministic planner');
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1])>=485);
assert(pkg.scripts['build:preflight'].includes('npm run test:v485 && npm run test:v485:types'));
console.log('PASS V485: automatic near-pass, procedural step, rejoin, low-drop, lyrics/manual/IK guards, collision centers, seek, 33-min simulation');
