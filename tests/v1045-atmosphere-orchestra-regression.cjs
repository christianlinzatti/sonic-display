'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const {planArenaAtmosphereDirectorV1045:plan}=load('lib/arena360AtmosphereDirectorV1045');
const planTemplate=generateArenaShowPlanV1040({genre:'Deutschrap',durationMs:200000,prompt:'intensives Konzert'});
const durationMs=200000;
const sample=(percent,overrides={})=>{
 const progressMs=durationMs*percent;
 const show=sampleArenaShowPlanV1040(planTemplate,{enabled:true,playing:true,reducedMotion:false,
  progressMs,durationMs,observedSection:'verse'});
 return plan({enabled:true,playing:true,reducedMotion:false,reactive:true,
  show,showPlan:planTemplate,progressMs,durationMs,strength:65,performanceTier:'high',...overrides});
};
const a=sample(.18);
assert.equal(a.active,true);
assert.equal(a.scene,'verse');
for(const key of ['fogGain','laserGain','skyGain','drift','laserSpread'])assert(Number.isFinite(a[key])&&a[key]>=.55&&a[key]<=1.32,key);
for(const key of ['fogColor','laserA','laserB','skyA','skyB'])assert.match(a[key],/^#[0-9a-f]{6}$/);
for(const scene of ['intro','verse','build','hook','interlude','finale']){
 const segment=planTemplate.segments.find(s=>s.scene===scene);
 const cue=sample((segment.start+segment.end)/2);
 assert.equal(cue.scene,scene);
 assert.equal(cue.active,true);
}
const finale=sample(.97),interlude=sample(.69),build=sample(.38),hook=sample(.54);
assert(finale.laserGain>interlude.laserGain);
assert(finale.fogGain>interlude.fogGain);
assert(build.skyGain>interlude.skyGain);
assert(finale.laserSpread>interlude.laserSpread);
assert(finale.laserLift>interlude.laserLift);
assert(hook.laserGain>interlude.laserGain);
// Scene handoffs are not sudden resets, even when strength & palette change.
for(const segment of planTemplate.segments.slice(1)){
 const before=sample(segment.start-.00000001);
 const after=sample(segment.start+.00000001);
 assert(before.active&&after.active);
 for(const k of ['fogGain','laserGain','skyGain','drift','laserSpread'])assert(Math.abs(before[k]-after[k])<.0001,`${segment.scene}: ${k}`);
 for(const k of ['fogColor','laserA','skyA'])assert.equal(before[k],after[k],`${segment.scene}: ${k}`);
}
// Missing progress, bad templates, safety switches, strength=0 and Reduced Motion do nothing.
for(const overrides of [{enabled:false},{playing:false},{reducedMotion:true},{reactive:false},
 {show:null},{show:{active:false}},{showPlan:null},{showPlan:{}},{progressMs:-1},
 {progressMs:NaN},{durationMs:Infinity},{durationMs:0},{strength:0}]){
 const cue=sample(.18,overrides);
 assert.equal(cue.active,false,JSON.stringify(overrides));
 assert.equal(cue.fogGain,1);
 assert.equal(cue.laserGain,1);
}
for(const bad of [NaN,Infinity,-42,999,null,undefined]){
 const cue=sample(.54,{strength:bad});
 for(const k of ['fogGain','laserGain','skyGain','drift','laserSpread'])assert(Number.isFinite(cue[k])&&cue[k]>=.55&&cue[k]<=1.32);
}
assert(sample(.54,{performanceTier:'low'}).laserGain<=sample(.54,{performanceTier:'balanced'}).laserGain);
assert(sample(.54,{performanceTier:'balanced'}).laserGain<=sample(.54,{performanceTier:'high'}).laserGain);
for(const genre of ['Deutschrap','Hardstyle','Deutschrock','Pop']){
 const newPlan=generateArenaShowPlanV1040({genre,durationMs});
 const cue=sample(.52,{showPlan:newPlan});
 assert.equal(cue.active,true);
 for(const key of ['fogColor','laserA','laserB','skyA','skyB'])assert.match(cue[key],/^#[0-9a-f]{6}$/);
}
// Ensure a complete UI → preferences → avatar → stage → R3F implementation.
for(const f of ['components/visualizer/stages/Arena360StageV1031.tsx',
 'components/visualizer/stages/ArenaLowFogV1036.tsx',
 'components/visualizer/stages/ArenaLaserFansV1036.tsx',
 'components/visualizer/stages/ArenaMovingLedSkyV1036.tsx',
 'components/visualizer/stages/index.tsx','components/visualizer/ThreeAvatar.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx',
 'components/visualizer/VisualizerStage.tsx','types/music.ts',
 'components/visualizer/registry.tsx','context/UiPreferencesContext.tsx'])
 assert(read(f).includes('V1045')||read(f).includes('atmosphereDirectorEnabled'),`missing integration: ${f}`);
const fog=read('components/visualizer/stages/ArenaLowFogV1036.tsx');
assert(read('components/visualizer/stages/ArenaLaserFansV1036.tsx').includes('laserSpread'));
assert(fog.includes('uniform vec3 uTint'));
assert(read('components/visualizer/stages/ArenaLaserFansV1036.tsx').includes('laserSpread'));
assert(fog.includes('Math.min(.16,')&&fog.includes('Math.min(.095,'));
for(const f of ['components/visualizer/stages/ArenaLaserFansV1036.tsx','components/visualizer/stages/ArenaMovingLedSkyV1036.tsx'])
 assert(read(f).includes('Math.min(.')&&read(f).includes('atmosphereV1045'));
for(const forbidden of ['fetch(', 'setTimeout(', 'setInterval(', 'WebSocket(', 'Math.random(', 'new Date(', 'localStorage', 'strobe', 'pyro'])
 assert(!read('lib/arena360AtmosphereDirectorV1045.ts').includes(forbidden),`unexpected side effect: ${forbidden}`);
console.log('PASS V1045 · local show cues, six phases, smooth transitions, palette, bounds, safety, low-power tier and real UI/R3F wiring');
