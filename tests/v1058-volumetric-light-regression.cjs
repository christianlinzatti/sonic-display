'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const {planVolumetricLightingV1058:plan}=load('lib/arena360VolumetricLightingV1058');
const durationMs=210000,trackId='spotify:v1058-volume-smoke';
const scene=generateArenaShowPlanV1040({genre:'Deutschrap',durationMs});
const create=(t=103000,p=scene)=>({enabled:true,stageIsArena:true,lightsEnabled:true,fogEnabled:true,
 playing:true,reducedMotion:false,reactive:true,performanceTier:'high',trackId,progressMs:t,
 durationMs,strength:70,plan:p,show:sampleArenaShowPlanV1040(p,{enabled:true,playing:true,
 reducedMotion:false,progressMs:t,durationMs})});
const first=plan(create());
assert(first.active&&first.reason==='planned');
assert.deepEqual(first,plan(create()),'cue must be deterministic');
const sampled=[8000,28000,82000,108000,145000,174000,202000].map(t=>plan(create(t)));
assert(sampled.every(c=>c.active),'seven planned chapters');
assert.deepEqual(sampled.map(c=>c.chapter),[0,1,2,3,4,5,6]);
assert(sampled[3].beamOpacity>sampled[4].beamOpacity,'hook highlight exceeds interlude');
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 const p=generateArenaShowPlanV1040({genre,durationMs}),c=plan(create(103000,p));
 assert(c.active);
 for(const color of [c.colorA,c.colorB,c.fogTint])assert.match(color,/^#[0-9a-f]{6}$/i);
}
const no=[{enabled:false},{stageIsArena:false},{lightsEnabled:false,fogEnabled:false},
 {playing:false},{reducedMotion:true},{reactive:false},{performanceTier:'low'},
 {trackId:''},{progressMs:-1},{progressMs:NaN},{progressMs:Infinity},{durationMs:Infinity},
 {durationMs:1000},{progressMs:durationMs+1},{plan:null},{show:null},{strength:0},
 {show:{...create().show,active:false}},
 {show:{...create().show,segmentIndex:99}},
 {show:{...create().show,scene:'finale'}},
 {show:{...create().show,fade:0}}];
for(const patch of no){const out=plan({...create(),...patch});
 assert.equal(out.active,false,JSON.stringify(patch));
 assert.equal(out.beamOpacity,.075);assert.equal(out.fogGain,1);
}
assert.equal(plan({...create(),playing:false}).reason,'paused');
assert.equal(plan({...create(),reducedMotion:true}).reason,'motion');
assert.equal(plan({...create(),performanceTier:'low'}).reason,'quality');
assert.equal(plan({...create(),progressMs:NaN}).reason,'clock');
assert(plan({...create(),performanceTier:'balanced'}).beamOpacity<first.beamOpacity);
assert(plan({...create(),strength:Infinity}).beamOpacity<=.14);
assert(plan({...create(),lightsEnabled:false}).active,'fog-only opt-in');
assert(plan({...create(),fogEnabled:false}).active,'light-only opt-in');
for(let i=0;i<7000;i++){
 const t=1+i*31.31,c=plan(create(t));
 for(const key of ['beamOpacity','beamFeather','fogGain'])assert(Number.isFinite(c[key]),key);
 assert(c.beamOpacity>=.075&&c.beamOpacity<=.14);
 assert(c.beamFeather>=.38&&c.beamFeather<=.65);
 assert(c.fogGain>=1&&c.fogGain<=1.32);
}
const pure=read('lib/arena360VolumetricLightingV1058.ts');
for(const unsafe of ['fetch(','setInterval(','setTimeout(','Math.random(','navigator.',
 'localStorage','WebSocket(','Date.now(','new SpotLight','new Camera'])
 assert(!pure.includes(unsafe),unsafe);
const lights=read('components/visualizer/stages/ArenaLightsV1032.tsx');
const fog=read('components/visualizer/stages/ArenaLowFogV1036.tsx');
const arena=read('components/visualizer/stages/Arena360StageV1031.tsx');
const env=read('components/visualizer/stages/index.tsx');
assert.equal((lights.match(/<spotLight\b/g)||[]).length,2,'no new spotlight');
assert.equal((lights.match(/<coneGeometry\b/g)||[]).length,2,'reuse two existing beam cones');
assert.equal((fog.match(/<instancedMesh\b/g)||[]).length,2,'reuse existing fog batches');
assert(lights.includes('showVolumeShader ? <shaderMaterial'), 'old beam materials survive opt-out');
assert(lights.includes('beamFragmentV1058')&&lights.includes('clamp(uOpacity')&&lights.includes('0.14'));
assert(lights.includes('1-Math.exp(-dt*3)'), 'smooth optical crossfades');
assert(lights.includes("tier!=='low'"),'low-tier no new beam effect');
assert(fog.includes('volume?.fogGain')&&fog.includes('volume?.fogTint'));
assert(fog.includes('Math.min(.16')&&fog.includes('Math.min(.095'),'opacity caps retained');
assert(arena.includes('planVolumetricLightingV1058('));
assert.equal((arena.match(/volumetricCueV1058={volumetricLightingEnabledV1058\?/g)||[]).length,2);
assert(env.includes('volumetricLightingEnabledV1058={volumetricLightingEnabledV1058}'));
for(const file of ['types/music.ts','context/UiPreferencesContext.tsx',
 'components/visualizer/VisualizerStage.tsx','components/visualizer/registry.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('VolumetricLightingEnabledV1058')||read(file).includes('volumetricLightingEnabledV1058'),file);
assert(read('context/UiPreferencesContext.tsx').includes('arenaVolumetricLightingEnabledV1058:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1058 · Volumetric Light Experience'));
assert(/arenaVolumetricLightingEnabledV1058:false(?:,|})/.test(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx')));
console.log('PASS V1058 · seven lighting chapters, four palettes, bounded 7000 samples, low-tier/paused/motion safeguards, two existing cones and fog batches, full opt-in wiring');
