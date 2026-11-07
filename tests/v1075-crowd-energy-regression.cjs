#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {planCrowdEnergyV1075:plan,sampleCrowdEnergyV1075:sample,
 OFF_CROWD_ENERGY_V1075:OFF,ZERO_CROWD_ENERGY_V1075:ZERO}=load('lib/arena360CrowdEnergyV1075');
const {generateArenaShowPlanV1040:generate,sampleArenaShowPlanV1040:sampleShow}=load('lib/arena360ShowDesignerV1040');
const durationMs=210000;
const show=generate({genre:'Deutschrap',durationMs});
const mk=(ms,extra={})=>({enabled:true,stageIsArena:true,audienceEnabled:true,
 showDesignerEnabled:true,showDirectorEnabled:true,playing:true,reducedMotion:false,
 reactive:true,performanceTier:'high',phoneMode:'wave',trackId:'concert-v1075',
 show:sampleShow(show,{enabled:true,playing:true,reducedMotion:false,progressMs:ms,durationMs}),
 progressMs:ms,durationMs,strength:60,observedSection:'verse',...extra});
const at=(ms,extra={})=>plan(mk(ms,extra));
const cue=at(55000);
assert(cue.active);assert.deepEqual(cue,at(55000),'deterministic');
for(const bad of [
 {enabled:false},{stageIsArena:false},{audienceEnabled:false},
 {showDesignerEnabled:false},{showDirectorEnabled:false},{reactive:false},
 {playing:false},{reducedMotion:true},{performanceTier:'low'},
 {phoneMode:'pulse'},{phoneMode:'chase'},{trackId:''},{trackId:null},
 {progressMs:NaN},{progressMs:Infinity},{progressMs:-1},
 {progressMs:durationMs+1},{durationMs:0},{durationMs:Infinity},
 {strength:0},{strength:NaN},{strength:Infinity},{strength:81},
 {show:null},{show:{...mk(55000).show,active:false}},
 {show:{...mk(55000).show,scene:'unknown'}},
 {show:{...mk(55000).show,intensity:101}},
 {show:{...mk(55000).show,fade:0}},
 {show:{...mk(55000).show,segmentIndex:7}},
 ])assert.equal(at(55000,bad).active,false,'fail-closed '+JSON.stringify(bad).slice(0,90));
assert.deepEqual(at(55000,{enabled:false}),OFF);
assert.equal(at(55000,{phoneMode:'pulse'}).reason,'manual');
assert.equal(at(55000,{playing:false}).reason,'paused');
assert.equal(at(55000,{performanceTier:'low'}).reason,'performance');
assert.deepEqual(sample(OFF,1,10),ZERO);
assert.deepEqual(sample(null,1,10),ZERO);
assert.deepEqual(sample(cue,NaN,10),ZERO);
assert.deepEqual(sample(cue,1,-5),ZERO);
assert.deepEqual(sample(cue,1,Infinity),ZERO);
assert.deepEqual(sample(cue,1,10,Infinity,NaN),sample(cue,1,10,0,0));
assert(at(55000,{strength:35}).motion<cue.motion);
assert(at(55000,{performanceTier:'balanced'}).motion<cue.motion);
assert.equal(at(55000,{observedSection:'drop'}).mood,cue.mood);
const moods=new Set();let tested=0;
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 const planForGenre=generate({genre,durationMs});
 for(let i=0;i<10000;i++){
  const ms=durationMs*(i+.5)/10000;
  const q=plan(mk(ms,{trackId:genre,show:sampleShow(planForGenre,
   {enabled:true,playing:true,reducedMotion:false,progressMs:ms,durationMs})}));
  tested++;
  if(!q.active){assert.equal(q.motion,0);continue;}
  moods.add(q.mood);
  assert(q.gain>=0&&q.gain<=.75&&q.motion>=0&&q.motion<=.65);
  for(const angle of [0,1.2,2.4,3.6]){
   const pose=sample(q,angle,ms/1000,(i%23)/23,(i%13)/13);
   assert(Object.values(pose).every(Number.isFinite));
   assert(Math.abs(pose.sway)<=.016&&pose.rise>=0&&pose.rise<=.065);
   assert(pose.arms>=0&&pose.arms<=.47&&Math.abs(pose.head)<=.053);
   assert(pose.light>=0&&pose.light<=1);
  }
 }
}
assert.equal(tested,40000);
for(const mood of ['arrival','groove','rise','peak','breath','encore'])assert(moods.has(mood),mood);
// The added phone-light factor must never brighten manual or automatic lights.
for(let i=0;i<1000;i++){
 const a=sample(cue,i*.013,i*.05,.3,.5),b=sample(cue,i*.013,i*.05+.01,.3,.5);
 assert(Math.abs(a.sway-b.sway)<.002&&Math.abs(a.arms-b.arms)<.006,'smooth crowd');
 assert(a.light<=1,'bounded relative phone light');
}
for(const p of ['types/music.ts','components/visualizer/registry.tsx',
 'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx'])
 assert(read(p).includes('arenaCrowdEnergyEnabledV1075')||read(p).includes('crowdEnergyEnabledV1075'),p);
assert(read('context/UiPreferencesContext.tsx').includes('arenaCrowdEnergyEnabledV1075:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1075 · Crowd Energy Engine'));
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('planCrowdEnergyV1075(')&&stage.includes('crowdEnergyCueV1075={crowdEnergyV1075}'));
const crowd=read('components/visualizer/stages/ArenaAudienceV1032.tsx');
assert(crowd.includes('sampleCrowdEnergyV1075(')&&crowd.includes('energyActiveV1075'));
assert(crowd.includes('(energyV1075?.light??1)'));
assert(!crowd.includes('new Audio('));
for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(p).includes('tests/v1075-crowd-energy-regression.cjs'),p);
for(const bad of [/\bMath\.random\(/,/\bDate\.now\(/,/\bfetch\(/,/\bsetTimeout\(/,
 /\bsetInterval\(/,/\brequestAnimationFrame\(/,/\bAudioContext\b/,/\bWebSocket\b/])
 assert(!bad.test(read('lib/arena360CrowdEnergyV1075.ts')),'pure cue '+bad);
console.log('PASS V1075: 40,000 show samples, four genres, six moods, safe phone lights, manual/motion and GPU guardrails');
