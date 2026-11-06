#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {
 planArenaAtmosphereV1036,INITIAL_ARENA_PEAK_V1036,stepArenaPeakV1036,
 createArenaLasersV1036,sampleArenaLaserV1036,createArenaSkyPixelsV1036,
 sampleArenaSkyPixelV1036,createArenaFogBanksV1036,sampleArenaFogV1036,
}=load('lib/arena360AtmosphereV1036');
const base={enabled:true,playing:true,reducedMotion:false,reactive:true,
 section:'hook',progressMs:175000,durationMs:250000,energy:.88,intensity:85};
const cue=planArenaAtmosphereV1036(base);
assert(cue.laser>0&&cue.sky>0&&cue.fog>0&&cue.movement>0);
assert.equal(cue.section,'hook');assert.equal(cue.act,'climax');
const peak=planArenaAtmosphereV1036({...base,peak:1});
assert(peak.sky>cue.sky&&peak.laser>=cue.laser);
const quiet=planArenaAtmosphereV1036({...base,section:'break',energy:.1,intensity:25});
assert(quiet.laser<cue.laser&&quiet.fog<cue.fog);
for(const overrides of [{enabled:false},{playing:false},{reducedMotion:true},{reactive:false},{intensity:0}]){
 const safe=planArenaAtmosphereV1036({...base,peak:1,...overrides});
 assert.equal(safe.laser,0);assert.equal(safe.fog,0);assert.equal(safe.movement,0);
}
const missing=planArenaAtmosphereV1036({...base,durationMs:0,energy:NaN,progressMs:Infinity});
for(const k of ['laser','sky','fog','movement'])assert(Number.isFinite(missing[k]));
const tiers=['low','balanced','high'];
assert.deepEqual(tiers.map(createArenaLasersV1036).map(a=>a.length),[6,12,18]);
assert.deepEqual(tiers.map(createArenaSkyPixelsV1036).map(a=>a.length),[24,60,120]);
assert.deepEqual(tiers.map(createArenaFogBanksV1036).map(a=>a.length),[5,9,14]);
for(const tier of tiers){
 for(const f of createArenaLasersV1036(tier)){
  assert(Math.abs(Math.hypot(f.originX,f.originZ)-4.2)<1e-6);
  for(const t of [0,20,NaN]){
   const s=sampleArenaLaserV1036(f,t,cue);
   assert(s.targetY>=.70&&s.targetY<=1.88);
   assert(Number.isFinite(s.targetX)&&Number.isFinite(s.targetZ));
   assert(s.brightness>=0&&s.brightness<=.64);
  }
 }
 for(const p of createArenaSkyPixelsV1036(tier)){
  const s=sampleArenaSkyPixelV1036(p,25,cue);
  assert(s.brightness>=.1&&s.brightness<=.82&&Math.abs(s.lift)<=.11);
  assert(p.radius>=4.25&&p.y>=3.18);
 }
 for(const b of createArenaFogBanksV1036(tier)){
  const s=sampleArenaFogV1036(b,17,cue);
  assert(s.alpha<=.18&&s.alpha>=0&&s.size>0&&s.height<=-1.735);
 }
}
let state={...INITIAL_ARENA_PEAK_V1036};
const beat={enabled:true,playing:true,reducedMotion:false,reactive:true,
 section:'drop',energy:.9,beat:true,beatStrength:.88};
state=stepArenaPeakV1036(state,1/60,beat);
assert.equal(state.count,1);assert(state.energy>.9);assert.equal(state.cooldown,18);
for(let i=0;i<400;i++)state=stepArenaPeakV1036(state,1/60,{...beat,beat:i%19===0});
assert.equal(state.count,1,'second drop within cooldown must not trigger');
assert.equal(stepArenaPeakV1036(INITIAL_ARENA_PEAK_V1036,1/60,{...beat,section:'verse'}).count,0);
assert.equal(stepArenaPeakV1036(INITIAL_ARENA_PEAK_V1036,1/60,{...beat,section:'hook',beatStrength:.83}).count,0);
assert.equal(stepArenaPeakV1036(INITIAL_ARENA_PEAK_V1036,1/60,{...beat,energy:.4}).count,0);
assert.equal(stepArenaPeakV1036(INITIAL_ARENA_PEAK_V1036,1/60,{...beat,beat:false}).count,0);
assert.equal(stepArenaPeakV1036(INITIAL_ARENA_PEAK_V1036,1/60,{...beat,section:'hook',beatStrength:.98,energy:.9}).count,1);
for(const opts of [{playing:false},{enabled:false},{reducedMotion:true},{reactive:false}]){
 const stopped=stepArenaPeakV1036(state,1/60,{...beat,...opts});
 assert.equal(stopped.energy,0);assert.equal(stopped.cooldown,0);
}
for(let i=0;i<1200;i++)state=stepArenaPeakV1036(state,1/60,{...beat,beat:false});
state=stepArenaPeakV1036(state,1/60,beat);assert.equal(state.count,2);
assert.equal(stepArenaPeakV1036(INITIAL_ARENA_PEAK_V1036,NaN,{...beat,beat:false}).count,0);
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
for(const k of ['ArenaLaserFansV1036','ArenaMovingLedSkyV1036','ArenaLowFogV1036']){
 assert(stage.includes('<'+k));
 assert(stage.indexOf('<'+k)<stage.indexOf('ref={turntable}'),'FX must be world-fixed');
 const c=read('components/visualizer/stages/'+k+'.tsx');
 assert(c.includes('instancedMesh')&&c.includes('useAdaptivePerformance'));
 assert(!c.includes('setInterval(')&&!c.includes('<spotLight')&&!c.includes('<pointLight'));
}
assert(stage.includes('sharedPeak=useRef')&&stage.includes('stepArenaPeakV1036'));
assert(read('components/visualizer/StageThemeCardScene.tsx').includes('v1036-preview-fog'));
assert(read('components/visualizer/StageThemeCardScene.tsx').includes('v1036-laser-'));
assert(stage.includes('{children}')&&stage.includes('ref={turntable}'));
assert(read('components/visualizer/stages/ArenaLowFogV1036.tsx').includes('depthWrite={false}'));
assert(read('components/visualizer/stages/ArenaLowFogV1036.tsx').includes('v1036-soft-smoke-wisps'));
for(const k of ['arenaLasersEnabledV1036','arenaMovingSkyEnabledV1036','arenaGroundFogEnabledV1036','arenaPeakDirectorEnabledV1036']){
 for(const name of ['types/music.ts','context/UiPreferencesContext.tsx','components/visualizer/registry.tsx',
  'components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx','components/SettingsPanel.tsx'])
  assert(read(name).includes(k),`${k} missing in ${name}`);
}
assert(read('components/visualizer/stages/index.tsx').includes('arenaPeaksEnabled={arenaPeaksEnabled}'));
console.log('V1036 atmosphere: lasers, LED canopy, shader fog, beats, cooldown, pauses, settings, tiers PASS');
