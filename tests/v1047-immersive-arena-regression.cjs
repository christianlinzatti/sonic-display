'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const {planArenaImmersionV1047:plan,sampleAudienceHologramV1047:sampleHolo,
 sampleLightTunnelV1047:sampleTunnel,planArenaImmersiveCameraV1047:planCamera,
 composeArenaImmersiveCameraV1047:composeCamera}=load('lib/arena360ImmersiveArenaV1047');
const template=generateArenaShowPlanV1040({genre:'Hardtekk',durationMs:200000});
const inputs=(percent,more={})=>{
 const progressMs=Math.round(200000*percent),durationMs=200000;
 const show=sampleArenaShowPlanV1040(template,{enabled:true,playing:true,reducedMotion:false,
  progressMs,durationMs,observedSection:'verse'});
 return {enabled:true,stageIsArena:true,playing:true,reducedMotion:false,
  reactive:true,show,trackId:'real-track',progressMs,durationMs,strength:75,
  genre:'Hardtekk',performanceTier:'high',...more};
};
const mapping=[[.03,'arrival'],[.12,'orbit'],[.32,'spiral'],[.5,'canopy'],[.68,'arrival'],[.95,'crown']];
for(const [pct,mode] of mapping){
 const cue=plan(inputs(pct));assert.equal(cue.mode,mode);
 assert.equal(cue.active,true);assert(cue.gain>0&&cue.gain<=.65);
 assert.equal(cue.hologramCount,24);assert.equal(cue.tunnelCount,12);
 for(let j=0;j<cue.hologramCount;j++){
  const h=sampleHolo(j,cue.hologramCount,cue);
  for(const v of Object.values(h))assert(Number.isFinite(v));
  assert(h.glow>=0&&h.glow<=.65);
 }
 for(let j=0;j<cue.tunnelCount;j++){
  const t=sampleTunnel(j,cue.tunnelCount,cue);
  for(const v of Object.values(t))assert(Number.isFinite(v));
  assert(t.glow>=0&&t.glow<=.6);
 }
 assert.deepEqual(sampleHolo(2,24,cue),sampleHolo(2,24,cue));
}
for(const override of [{enabled:false},{stageIsArena:false},{playing:false},
 {reducedMotion:true},{reactive:false},{show:null},{trackId:null},
 {progressMs:NaN},{progressMs:-1},{progressMs:200001},
 {durationMs:Infinity},{durationMs:0},{strength:0}]){
 const cue=plan(inputs(.95,override));assert.equal(cue.active,false,JSON.stringify(override));
 assert.equal(cue.hologramCount,0);assert.equal(cue.tunnelCount,0);
}
const balanced=plan(inputs(.95,{performanceTier:'balanced'}));
assert.deepEqual([balanced.hologramCount,balanced.tunnelCount],[12,6]);
const low=plan(inputs(.95,{performanceTier:'low'}));
assert.deepEqual([low.hologramCount,low.tunnelCount],[0,0]);
for(const strength of [NaN,-100,0,1000,Infinity,null,undefined]){
 const cue=plan(inputs(.95,{strength}));
 assert(Number.isFinite(cue.gain));assert(cue.gain<=.65);
}
const base={x:11,y:4.2,z:12,fov:45,targetX:0,targetY:1,targetZ:0};
const c=planCamera({...inputs(.5),cameraEnabled:true,manualPriority:false});
assert.equal(c.active,true);assert(c.gain<=.3);
const updated=composeCamera(base,c,false);
assert.notDeepEqual(updated,base);
for(const v of Object.values(updated))assert(Number.isFinite(v));
assert.deepEqual(composeCamera(base,c,true),base);
assert.deepEqual(composeCamera(base,{...c,active:false},false),base);
assert.deepEqual(composeCamera({...base,x:2,z:0},c,false),{...base,x:2,z:0});
for(const x of [{cameraEnabled:false},{manualPriority:true},{reducedMotion:true},
 {playing:false},{enabled:false},{performanceTier:'low'},{trackId:null},
 {durationMs:NaN}]) assert.equal(planCamera({...inputs(.5),cameraEnabled:true,manualPriority:false,...x}).active,false);
for(const f of ['components/visualizer/stages/Arena360StageV1031.tsx',
 'components/visualizer/stages/ArenaImmersiveExperienceV1047.tsx',
 'components/visualizer/stages/index.tsx','components/visualizer/ThreeAvatar.tsx',
 'components/visualizer/VisualizerStage.tsx','components/visualizer/registry.tsx',
 'components/visualizer/StageCameraDirectorV289.tsx',
 'components/visualizer/SmartStageCameraV236.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx','types/music.ts',
 'context/UiPreferencesContext.tsx']){
 assert(read(f).includes('V1047'),`Missing end-to-end integration: ${f}`);
}
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('hologramsEnabled={hologramsEnabled&&showDirectorEnabled}'));
assert(stage.includes('lasersEnabled={laserArchitectureEnabled&&lasersEnabled&&showDirectorEnabled}'));
const view=read('components/visualizer/stages/ArenaImmersiveExperienceV1047.tsx');
assert(view.includes('instancedMesh')&&view.includes('args={[undefined,undefined,24]}')&&
 view.includes('args={[undefined,undefined,12]}')&&view.includes('a.visible=canHolo;b.visible=canLaser'));
assert(read('context/UiPreferencesContext.tsx').includes('arenaImmersiveEnabledV1047:false'));
assert(read('components/visualizer/StageCameraDirectorV289.tsx').includes('flyoverProtectedV1033||!automaticShot'));
for(const forbidden of ['fetch(', 'setTimeout(', 'setInterval(', 'WebSocket(', 'Math.random(', 'localStorage', 'document.'])
 assert(!read('lib/arena360ImmersiveArenaV1047.ts').includes(forbidden),`side effect: ${forbidden}`);
console.log('PASS V1047 · five scenic modes, holograms/tunnel, cinematic camera, reduced-motion, manual priority, performance & end-to-end opt-in');
