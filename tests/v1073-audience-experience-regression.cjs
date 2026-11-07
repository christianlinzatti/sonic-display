#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {planAudienceExperienceV1073:plan,sampleAudienceExperienceV1073:sample,
 OFF_AUDIENCE_V1073:OFF}=load('lib/arena360AudienceExperienceV1073');
const {generateArenaShowPlanV1040:generate,sampleArenaShowPlanV1040:sampleShow}=load('lib/arena360ShowDesignerV1040');
const durationMs=210000;
const showPlan=generate({genre:'Deutschrap',durationMs,prompt:'Arena Publikum'});
const mk=(ms,extra={})=>({enabled:true,stageIsArena:true,audienceEnabled:true,phoneEnabled:true,
 phoneMode:'wave',showDesignerEnabled:true,showDirectorEnabled:true,
 playing:true,reducedMotion:false,reactive:true,performanceTier:'high',
 show:sampleShow(showPlan,{enabled:true,playing:true,reducedMotion:false,progressMs:ms,durationMs}),
 trackId:'audience-v1073-demo',progressMs:ms,durationMs,strength:60,genre:'Deutschrap',observedSection:'verse',...extra});
const at=(ms,extra={})=>plan(mk(ms,extra));
const cue=at(55000);
assert.equal(cue.active,true);assert.equal(cue.mood,'sway');
assert.equal(cue.reason,'planned');
assert.deepEqual(cue,at(55000),'stable deterministic plan');
assert.deepEqual(at(55000,{enabled:false}),OFF);
assert.equal(at(55000,{playing:false}).reason,'paused');
assert.equal(at(55000,{reducedMotion:true}).reason,'motion');
assert.equal(at(55000,{performanceTier:'low'}).reason,'performance');
assert.equal(at(55000,{phoneMode:'chase'}).reason,'manual');
assert.equal(at(55000,{phoneMode:'pulse'}).reason,'manual');
assert.equal(at(55000,{progressMs:NaN}).reason,'clock');
for(const p of [{enabled:false},{stageIsArena:false},{audienceEnabled:false},
 {phoneEnabled:false},{showDesignerEnabled:false},{showDirectorEnabled:false},
 {reactive:false},{playing:false},{reducedMotion:true},{performanceTier:'low'},
 {phoneMode:'chase'},{phoneMode:'pulse'},{trackId:''},{trackId:null},
 {progressMs:NaN},{progressMs:-1},{progressMs:durationMs+1},
 {durationMs:NaN},{durationMs:0},{durationMs:Infinity},{durationMs:300},
 {strength:0},{strength:-1},{strength:81},{strength:NaN},{strength:Infinity},
 {show:null},{show:{...mk(55000).show,active:false}},
 {show:{...mk(55000).show,scene:'nonsense'}},
 {show:{...mk(55000).show,intensity:0}},
 {show:{...mk(55000).show,intensity:101}},
 {show:{...mk(55000).show,fade:-1}},
 {show:{...mk(55000).show,fade:NaN}},
 {show:{...mk(55000).show,segmentIndex:999}},
 ]) assert.equal(at(55000,p).active,false,'fail closed '+JSON.stringify(p).slice(0,75));
assert.deepEqual(sample(OFF,0,1),{light:0,lift:0,arms:0,faceStage:0});
assert.deepEqual(sample(null,0,1),{light:0,lift:0,arms:0,faceStage:0});
assert.deepEqual(sample(cue,NaN,1),{light:0,lift:0,arms:0,faceStage:0});
assert.deepEqual(sample(cue,0,NaN),{light:0,lift:0,arms:0,faceStage:0});
assert.deepEqual(sample(cue,0,3,NaN),sample(cue,0,3,0),'invalid audio safe');
assert.deepEqual(sample(cue,0,3,Infinity),sample(cue,0,3,0),'invalid audio safe');
assert(at(55000,{strength:30}).gain<cue.gain);
assert(at(55000,{performanceTier:'balanced'}).gain<cue.gain);
assert(at(55000,{observedSection:'hook'}).cheer>=cue.cheer,
 'real observed hook affects only visual crowd intensity');
assert(at(55000,{observedSection:'drop'}).wristband>=cue.wristband);
assert.equal(at(55000,{observedSection:'drop'}).mood,cue.mood,
 'observed section does not forge planned chapter');
const scenes=new Set(),colors=new Set();let tested=0;
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 const planForGenre=generate({genre,durationMs});
 for(let k=0;k<7500;k++){
  const ms=durationMs*(k+.5)/7500;
  const q=plan(mk(ms,{genre,trackId:'song-'+genre,
   show:sampleShow(planForGenre,{enabled:true,playing:true,reducedMotion:false,
    progressMs:ms,durationMs})}));
  tested++;
  if(!q.active){assert.equal(q.gain,0);continue;}
  scenes.add(q.mood);colors.add(q.color.join(','));
  assert(q.gain>=0&&q.gain<=.8&&q.wristband<=.75&&q.cheer<=.65);
  const angle=k*Math.PI/127,seconds=ms/1000;
  const v=sample(q,angle,seconds,Math.sin(seconds)**2);
  assert(v.light>=0&&v.light<=.72,'safe wristband light');
  assert(v.lift>=0&&v.lift<=.12,'safe lift');
  assert(v.arms>=0&&v.arms<=.58,'safe cheer arms');
  assert(v.faceStage>=0&&v.faceStage<=.6,'safe stage focus');
  assert(Object.values(v).every(Number.isFinite),'no nonfinite output');
 }
}
assert.equal(tested,30000);
for(const mood of ['arrival','sway','anticipate','celebrate','listen','encore'])
 assert(scenes.has(mood),'covered mood '+mood);
assert.equal(colors.size,4,'genre colors');
for(let i=0;i<900;i++){
 const a=sample(cue,.9,i*.002,.8),b=sample(cue,.9,(i+1)*.002,.8);
 assert(Math.abs(a.light-b.light)<.01,'slow continuous lights, no flash');
 assert(Math.abs(a.arms-b.arms)<.01,'continuous arm movement');
}
// Ensure it is physically connected to the existing crowd rather than producing detached overlays.
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
const audience=read('components/visualizer/stages/ArenaAudienceV1032.tsx');
assert(stage.includes('planAudienceExperienceV1073('));
assert(stage.includes('audienceCueV1073={audienceExperienceV1073}'));
assert(audience.includes('sampleAudienceExperienceV1073('));
assert.equal((audience.match(/name="v1073-audience-wristbands"/g)||[]).length,1);
assert(audience.includes('args={[undefined,undefined,phoneMembers.length]}'),
 'bounded instance budget matches existing phone count');
assert(audience.includes('tier!==\'low\''),'protected tier');
assert(!audience.includes('name="v1073-audience-extra-avatars"'));
assert(audience.includes('audienceCueV1073!.color'));
for(const file of ['context/UiPreferencesContext.tsx','types/music.ts',
 'components/visualizer/registry.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx'])
 assert(read(file).includes('AudienceExperienceEnabledV1073')||read(file).includes('audienceExperienceEnabledV1073'),file);
assert(read('context/UiPreferencesContext.tsx').includes('arenaAudienceExperienceEnabledV1073:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1073 · Concert Audience Experience 3.0'));
for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(f).includes('tests/v1073-audience-experience-regression.cjs'),f);
for(const bad of [/\bfetch\(/,/\bMath\.random\(/,/\bDate\.now\(/,/\bsetInterval\(/,/\bsetTimeout\(/,/\brequestAnimationFrame\(/,/\bWebSocket\(/,/\blocalStorage\b/,/\bAudioContext\b/])
 assert(!bad.test(read('lib/arena360AudienceExperienceV1073.ts')),'pure safe module '+bad);
console.log('PASS V1073: 30,000 audience moods, four genre palettes, manual/clock/motion protections and bounded lights');
