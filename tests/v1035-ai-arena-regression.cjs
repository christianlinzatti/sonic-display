#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {
 planArenaTimelineV1035,createArenaColumnsV1035,sampleArenaColumnV1035,
 INITIAL_ARENA_PYRO_V1035,stepArenaPyroV1035,sampleArenaPyroSparkV1035,sampleArenaCrowdHookV1035,
}=load('lib/arena360DirectorV1035');
const base={enabled:true,playing:true,reducedMotion:false,reactive:true,
 progressMs:120000,durationMs:240000,section:'hook',energy:.85,intensity:75};
const cue=planArenaTimelineV1035(base);
assert.equal(cue.act,'journey');assert.equal(cue.progress,.5);
assert.equal(cue.section,'hook');assert(cue.crowdEnergy>.1);
assert(!cue.pyroArmed,'hook never triggers virtual pyro');
for(const [position,act] of [[0,'opening'],[21600,'journey'],[144000,'climax'],[208800,'finale']]){
 assert.equal(planArenaTimelineV1035({...base,progressMs:position}).act,act);
}
assert.equal(planArenaTimelineV1035({...base,progressMs:0,durationMs:0}).act,'untracked');
assert.equal(planArenaTimelineV1035({...base,progressMs:-1,durationMs:1}).progress,null);
assert.equal(planArenaTimelineV1035({...base,progressMs:Infinity}).progress,null);
assert.equal(planArenaTimelineV1035({...base,progressMs:500000}).progress,1);
assert.equal(planArenaTimelineV1035({...base,section:'not-a-section'}).section,'verse');
const drop=planArenaTimelineV1035({...base,section:'drop'});
assert(drop.pyroArmed);
assert.equal(planArenaTimelineV1035({...base,progressMs:0,section:'drop'}).pyroArmed,false,'intro is conservative');
for(const opts of [{enabled:false},{playing:false},{reducedMotion:true},{reactive:false},{intensity:0}]){
 const safe=planArenaTimelineV1035({...base,section:'drop',...opts});
 assert(!safe.pyroArmed && safe.crowdEnergy===0 && safe.columnEnergy===0,'disabled motion must be calm');
}
const early=planArenaTimelineV1035({...base,progressMs:0,section:'hook'});
const late=planArenaTimelineV1035({...base,progressMs:220000,section:'hook'});
assert(late.columnEnergy>early.columnEnergy,'song dramaturgy grows toward finale');
const cols=['low','balanced','high'].map(t=>createArenaColumnsV1035(t));
assert.deepEqual(cols.map(c=>c.length),[8,12,16]);
for(const tier of cols){for(const f of tier){
 assert(Math.abs(Math.hypot(f.x,f.z)-3.48)<1e-6);
 for(const time of [0,2,20]){
  const s=sampleArenaColumnV1035(f,time,late);
  assert(s.height>=.6&&s.height<=1.35&&s.light>=.12&&s.light<=.85);
  assert(Number.isFinite(s.twist));
 }
}}
assert(sampleArenaColumnV1035(cols[2][0],5,late).height>
 sampleArenaColumnV1035(cols[2][0],5,planArenaTimelineV1035({...base,enabled:false})).height);
let pyro={...INITIAL_ARENA_PYRO_V1035};
const trigger={enabled:true,playing:true,reducedMotion:false,armed:true,beat:true,beatStrength:.9,energy:.8};
pyro=stepArenaPyroV1035(pyro,1/60,trigger);
assert.equal(pyro.burst,1);assert(pyro.energy>.7&&pyro.cooldown>5);
const held=stepArenaPyroV1035(pyro,1/60,trigger);
assert.equal(held.burst,1,'held beat is not repeated');
for(let i=0;i<250;i++)pyro=stepArenaPyroV1035(pyro,1/60,{...trigger,beat:i%17===0});
assert.equal(pyro.burst,1);
for(let i=0;i<120;i++)pyro=stepArenaPyroV1035(pyro,1/60,{...trigger,beat:false});
assert.equal(pyro.burst,1,'cooldown prevents flicker on subsequent hits');
pyro=stepArenaPyroV1035(pyro,1/60,{...trigger,beat:false});
pyro=stepArenaPyroV1035(pyro,1/60,trigger);
assert.equal(pyro.burst,2,'next real event after cooldown may fire again');
for(const bad of [{armed:false},{playing:false},{reducedMotion:true},{enabled:false}]){
 const safe=stepArenaPyroV1035(pyro,1/60,{...trigger,...bad});
 assert.equal(safe.energy,0,'unsafe or paused pyro clears immediately');
}
assert.equal(stepArenaPyroV1035(INITIAL_ARENA_PYRO_V1035,1/60,{...trigger,beatStrength:.7}).burst,0);
assert.equal(stepArenaPyroV1035(INITIAL_ARENA_PYRO_V1035,1/60,{...trigger,energy:.2}).burst,0);
assert.equal(stepArenaPyroV1035(INITIAL_ARENA_PYRO_V1035,1/60,{...trigger,beat:false}).burst,0);
assert.equal(stepArenaPyroV1035(INITIAL_ARENA_PYRO_V1035,NaN,{...trigger,beat:false}).energy,0);
assert.equal(stepArenaPyroV1035(INITIAL_ARENA_PYRO_V1035,1,{...trigger,beat:false}).cooldown,0);
for(let i=0;i<48;i++){
 const spark=sampleArenaPyroSparkV1035(i,48,pyro);
 assert(spark.height>=0&&spark.height<=.5&&spark.rise<=2.8&&spark.brightness<=.8);
}
assert.equal(sampleArenaPyroSparkV1035(0,48,INITIAL_ARENA_PYRO_V1035).brightness,0);
assert.equal(sampleArenaCrowdHookV1035(cue,0,3),sampleArenaCrowdHookV1035(cue,0,3));
assert(sampleArenaCrowdHookV1035(cue,0,3)>0);
assert.equal(sampleArenaCrowdHookV1035(planArenaTimelineV1035({...base,enabled:false}),0,3),0);
assert(read('components/visualizer/StageThemeCardScene.tsx').includes('v1035-column-'),'new features visible in stage preview');
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
const audience=read('components/visualizer/stages/ArenaAudienceV1032.tsx');
const columns=read('components/visualizer/stages/ArenaLedColumnsV1035.tsx');
const sparks=read('components/visualizer/stages/ArenaVirtualPyroV1035.tsx');
assert(stage.includes('<ArenaLedColumnsV1035')&&stage.includes('<ArenaVirtualPyroV1035'));
assert(stage.indexOf('<ArenaVirtualPyroV1035')<stage.indexOf('ref={turntable}'));
assert(stage.indexOf('<ArenaLedColumnsV1035')<stage.indexOf('ref={turntable}'));
assert(stage.includes('ref={turntable}')&&stage.includes('{children}'),'performers still rotate with deck');
assert(audience.includes('sampleArenaCrowdHookV1035')&&audience.includes('sampleArenaPhoneV1033'));
for(const src of [columns,sparks]){
 assert(src.includes('instancedMesh')&&src.includes('useAdaptivePerformance'));
 assert(!src.includes('setInterval(')&&!src.includes('<spotLight')&& !src.includes('<pointLight'));
}
for(const key of ['arenaFullSongDirectorEnabledV1035','arenaLedColumnsEnabledV1035',
 'arenaVirtualPyroEnabledV1035','arenaCrowdChantEnabledV1035','arenaShowIntensityV1035']){
 for(const name of ['types/music.ts','context/UiPreferencesContext.tsx','components/visualizer/registry.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx','components/SettingsPanel.tsx']){
  assert(read(name).includes(key),`${key} missing from ${name}`);
 }
}
assert(read('components/visualizer/ThreeAvatar.tsx').includes('durationMs={props.track?.durationMs ?? 0}'));
assert(read('components/visualizer/stages/index.tsx').includes('progressMs={progressMs} durationMs={durationMs}'));
console.log('V1035 AI Arena: timeline, scene choreography, instancing, crowd, beat cooldown, safety and preferences PASS');
