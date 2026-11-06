#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {
  INITIAL_ARENA_WAVE_V1033,INITIAL_ARENA_FLYOVER_V1033,
  ARENA_WAVE_DURATION_V1033,ARENA_FLYOVER_DURATION_V1033,
  stepArenaWaveV1033,sampleArenaCrowdWaveV1033,sampleArenaPhoneV1033,
  createArenaDomePixelsV1033,sampleArenaDomePixelV1033,
  stepArenaFlyoverV1033,composeArenaFlyoverV1033,
}=load('lib/arena360ImmersionV1033');

const waveOptions={enabled:true,playing:true,reducedMotion:false,reactive:true,
  beat:true,beatStrength:.88,bass:.73};
let wave=stepArenaWaveV1033(INITIAL_ARENA_WAVE_V1033,1/60,waveOptions);
assert.equal(wave.age,0,'rising energetic beat launches crowd wave');
assert.equal(wave.cooldown,5,'wave debouncing');
wave=stepArenaWaveV1033(wave,.1,waveOptions);
assert(wave.age>0,'held beat flag must not start another wave');
assert.equal(stepArenaWaveV1033(wave,.1,{...waveOptions,playing:false}).age,-1,'pause freezes wave');
assert.equal(stepArenaWaveV1033(wave,.1,{...waveOptions,reducedMotion:true}).age,-1,'reduced motion removes audience animation');
assert.equal(stepArenaWaveV1033(wave,.1,{...waveOptions,enabled:false}).age,-1);
assert.equal(stepArenaWaveV1033(INITIAL_ARENA_WAVE_V1033,.016,{...waveOptions,bass:.1}).age,-1,'no false triggers');
const front=ARENA_WAVE_DURATION_V1033*.5;
assert(sampleArenaCrowdWaveV1033(-4.5,0,front)>.85,'wave front reaches the far side');
assert(sampleArenaCrowdWaveV1033(4.5,0,front)<.01,'wave is localized along the ring');
assert.equal(sampleArenaCrowdWaveV1033(4,0,-1),0);
assert.equal(sampleArenaCrowdWaveV1033(4,0,Infinity),0);
for(const mode of ['wave','pulse','chase']){
  const at0=sampleArenaPhoneV1033(.12,2,mode,.92,.3);
  const at1=sampleArenaPhoneV1033(1.3,2,mode,.92,.3);
  assert(at0>=.15&&at0<=1&&at1>=.15&&at1<=1,'phone colors keep safe bounds');
}
assert.notEqual(sampleArenaPhoneV1033(.1,2,'chase',.6,.1),sampleArenaPhoneV1033(2,2,'chase',.6,.1),'chase pattern moves around arena');
assert(sampleArenaPhoneV1033(.1,2,'wave',.6,1)>sampleArenaPhoneV1033(.1,2,'wave',.6,0),'phone brightness follows crowd wave');
const domeLow=createArenaDomePixelsV1033('low');
const domeMedium=createArenaDomePixelsV1033('balanced');
const domeHigh=createArenaDomePixelsV1033('high');
assert(domeLow.length<domeMedium.length&&domeMedium.length<domeHigh.length,'adaptive LED budget');
assert.deepEqual(createArenaDomePixelsV1033('high'),domeHigh,'stable geometry');
assert(domeHigh.every(p=>p.y>3.2&&p.y<4.4),'floating above the ring truss');
assert(new Set(domeHigh.map(p=>p.ring)).size===4,'four vaulted pixel rings');
for(const p of domeHigh){
  for(const t of [0,1.5,22]){
    const value=sampleArenaDomePixelV1033(p,t,.9,.9);
    assert(value>=.15&&value<=.95&&Number.isFinite(value),'bounded pixel brightness');
  }
}
const flyOptions={enabled:true,playing:true,reducedMotion:false,protectedShot:false,
  beat:true,beatStrength:.98,bass:.94,dropSection:false};
let fly=stepArenaFlyoverV1033(INITIAL_ARENA_FLYOVER_V1033,1/60,flyOptions);
assert.equal(fly.age,0);assert.equal(fly.cooldown,13);
fly=stepArenaFlyoverV1033(fly,.1,flyOptions);
assert(fly.age>0,'held beat does not retrigger flyover');
assert.equal(stepArenaFlyoverV1033(fly,.1,{...flyOptions,protectedShot:true}).age,-1,'manual/lyrics shots cancel flyover');
assert.equal(stepArenaFlyoverV1033(fly,.1,{...flyOptions,reducedMotion:true}).age,-1);
assert.equal(stepArenaFlyoverV1033(fly,.1,{...flyOptions,enabled:false}).age,-1);
const dropSection=stepArenaFlyoverV1033(INITIAL_ARENA_FLYOVER_V1033,.016,{...flyOptions,beat:false,dropSection:true});
assert.equal(dropSection.age,0,'drop section can start camera on cue');
const pose={x:0,y:1.3,z:8,fov:44,targetX:0,targetY:0,targetZ:0};
const mid={...fly,age:ARENA_FLYOVER_DURATION_V1033/2};
const moved=composeArenaFlyoverV1033(pose,mid,true);
assert(moved.y>pose.y&&moved.z<pose.z&&moved.z>4.2,'camera flies forward over crowd');
assert(moved.fov<=78&&moved.fov>=34,'FOV capped');
assert.deepEqual(composeArenaFlyoverV1033(pose,mid,false),pose,'no camera move when disabled');
assert.deepEqual(composeArenaFlyoverV1033({...pose,z:3.5},mid,true),{...pose,z:3.5},'preserve close-up');
assert.deepEqual(composeArenaFlyoverV1033(pose,{...fly,age:ARENA_FLYOVER_DURATION_V1033},true),pose,'end returns original pose');
assert(Math.abs(composeArenaFlyoverV1033(pose,{...fly,age:.00001},true).y-pose.y)<.001,'smooth entry');

const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
const audience=read('components/visualizer/stages/ArenaAudienceV1032.tsx');
const dome=read('components/visualizer/stages/ArenaLedDomeV1033.tsx');
assert(stage.includes('<ArenaLedDomeV1033')&&stage.includes('wavesEnabled={wavesEnabled}'));
assert(stage.indexOf('<ArenaLedDomeV1033')<stage.indexOf('<group ref={turntable}'),'cupola stays fixed as deck turns');
assert(audience.includes('stepArenaWaveV1033')&&audience.includes('sampleArenaPhoneV1033'));
assert(audience.includes('instancedMesh')&&audience.includes('tier===\'low\''),'crowd GPU batches and performance budget');
assert(dome.includes('instancedMesh')&&dome.includes('useAdaptivePerformance'));
assert(!dome.includes('setInterval')&&!dome.includes('requestAnimationFrame'),'no independent frame loops');
for(const file of ['components/visualizer/StageCameraDirectorV289.tsx','components/visualizer/SmartStageCameraV236.tsx']){
  const source=read(file);
  assert(source.includes('stepArenaFlyoverV1033(')&&source.includes('composeArenaFlyoverV1033('),`camera composition missing in ${file}`);
  assert(!source.includes('<ArenaFlyoverCamera'),'must not create a competing camera owner');
}
const wire=['types/music.ts','context/UiPreferencesContext.tsx','components/visualizer/registry.tsx',
  'components/visualizer/VisualizerStage.tsx','components/visualizer/ThreeAvatar.tsx','components/SettingsPanel.tsx'];
for(const key of ['arenaWavesEnabledV1033','arenaPhoneSyncEnabledV1033','arenaPhoneModeV1033','arenaDomeEnabledV1033','arenaFlyoverEnabledV1033']){
  for(const file of wire)assert(read(file).includes(key),`${key} is not wired in ${file}`);
}
assert(read('components/visualizer/stages/index.tsx').includes('domeEnabled={domeEnabled}'));
console.log('V1033 Immersive Arena Show: synchronized waves/phones, 3 LED budgets, protected drop flyovers, pause and settings PASS');
