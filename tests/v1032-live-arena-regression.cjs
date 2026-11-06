#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {createArenaAudienceV1032,INITIAL_ARENA_DROP_V1032,stepArenaDropV1032,
  composeArenaCameraV1032}=load('lib/arena360ExperienceV1032');
const low=createArenaAudienceV1032('low');
const medium=createArenaAudienceV1032('balanced');
const high=createArenaAudienceV1032('high');
assert(low.length>=30,'low tier retains a visible crowd');
assert(low.length<medium.length&&medium.length<high.length,'tier scales only geometry count');
assert.deepEqual(createArenaAudienceV1032('high'),high,'deterministic audience positions');
assert.deepEqual(createArenaAudienceV1032('high',false),[]);
for(const person of high){
  assert(Math.hypot(person.x,person.z)>4.2,'spectators must remain outside rotating stage');
  assert(Number.isFinite(person.height));
}
const dropInput={playing:true,reducedMotion:false,enabled:true,reactive:true,
  beat:true,beatStrength:.96,bass:.82,energyEnvelope:.81};
let state=stepArenaDropV1032(INITIAL_ARENA_DROP_V1032,1/60,dropInput);
assert.equal(state.energy,1,'strong kick starts a soft glow');
assert(state.cooldown>=5.9,'refractory period prevents strobing');
state=stepArenaDropV1032(state,.1,dropInput);
assert(state.energy<1,'held beat flag must not retrigger flash');
assert.equal(stepArenaDropV1032(state,.016,{...dropInput,playing:false}).energy,0,'pause clears accent');
assert.equal(stepArenaDropV1032(state,.016,{...dropInput,reducedMotion:true}).energy,0,'reduced motion disables accent');
assert.equal(stepArenaDropV1032(state,.016,{...dropInput,enabled:false}).energy,0);
assert.equal(stepArenaDropV1032(INITIAL_ARENA_DROP_V1032,.016,{...dropInput,bass:.1}).energy,0,'do not invent a drop without bass');
for(let i=0;i<70;i++)state=stepArenaDropV1032(state,.1,{...dropInput,beat:i%2===0});
assert(state.energy>=0&&state.energy<=1,'bounded pulse, no runaway brightness');
const pose={x:0,y:1.3,z:8,fov:45,targetX:0,targetY:0,targetZ:0};
const camera={enabled:true,playing:true,reducedMotion:false,automatic:true,protectedShot:false,seconds:18};
const orbit=composeArenaCameraV1032(pose,{...camera,mode:'orbit'});
assert.notDeepEqual(orbit,pose,'automatic camera moves around the stage');
assert(Math.abs(Math.hypot(orbit.x,orbit.z)-8)<1e-7,'orbit keeps same distance');
assert.equal(orbit.fov,pose.fov,'preserve existing field of view');
assert.notDeepEqual(composeArenaCameraV1032({...pose,z:4.2},{...camera,mode:'orbit'}),{...pose,z:4.2},'default solo director distance gets arena camera motion');
assert.deepEqual(composeArenaCameraV1032(pose,{...camera,protectedShot:true}),pose,'protect authored and lyrics shots');
assert.deepEqual(composeArenaCameraV1032(pose,{...camera,automatic:false}),pose,'manual camera remains authoritative');
assert.deepEqual(composeArenaCameraV1032(pose,{...camera,reducedMotion:true}),pose);
assert.deepEqual(composeArenaCameraV1032({...pose,z:3},{...camera}),{...pose,z:3},'preserve closeup shots');
assert.deepEqual(composeArenaCameraV1032(pose,{...camera,playing:false}),pose);
assert.deepEqual(composeArenaCameraV1032(pose,{...camera,enabled:false}),pose);
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
const env=read('components/visualizer/stages/index.tsx');
const three=read('components/visualizer/ThreeAvatar.tsx');
assert(stage.includes('<ArenaAudienceV1032')&&stage.includes('<ArenaLightsV1032'));
assert(stage.indexOf('<ArenaAudienceV1032')<stage.indexOf('<group ref={turntable}'), 'audience is NOT parented to rotating platform');
assert(stage.indexOf('<ArenaLightsV1032')<stage.indexOf('<group ref={turntable}'),'lights remain stationary');
assert(env.includes('audienceEnabled={audienceEnabled}')&&env.includes('dropEnabled={dropEnabled}'));
assert(three.includes('audienceEnabled={props.arenaAudienceEnabledV1032 ?? true}'));
assert(three.includes('arenaCameraEnabled={props.arenaCameraEnabledV1032 ?? true}'));
assert(three.includes('arenaCameraMode={props.arenaCameraModeV1032 ?? "arc"}'));
for(const name of ['StageCameraDirectorV289.tsx','SmartStageCameraV236.tsx']){
  const source=read('components/visualizer/'+name);
  assert(source.includes('composeArenaCameraV1032('),`${name}: must compose into existing camera`);
  assert(!source.includes('<ArenaCameraV1032'),`${name}: no second camera owner`);
}
const audience=read('components/visualizer/stages/ArenaAudienceV1032.tsx');
const lights=read('components/visualizer/stages/ArenaLightsV1032.tsx');
assert(audience.includes('instancedMesh')&&audience.includes('useAdaptivePerformance'));
assert(lights.includes('getActivePerformanceTier')&&lights.includes('castShadow={false}'));
assert(!lights.includes('setInterval')&&!lights.includes('requestAnimationFrame'));
const settings=read('components/SettingsPanel.tsx');
for(const key of ['arenaAudienceEnabledV1032','arenaLightsEnabledV1032','arenaDropEnabledV1032','arenaCameraEnabledV1032','arenaCameraModeV1032']){
  assert(settings.includes(key)&&read('context/UiPreferencesContext.tsx').includes(key)&&read('types/music.ts').includes(key)&&read('components/visualizer/registry.tsx').includes(key)&&read('components/visualizer/VisualizerStage.tsx').includes(key),`missing ${key} integration`);
}
console.log('V1032 Live Arena Experience: audience tiers, moving spots, soft drops, camera ownership, safety and settings PASS');
