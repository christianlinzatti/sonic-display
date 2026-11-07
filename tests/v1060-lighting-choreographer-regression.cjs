'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {generateArenaShowPlanV1040:makePlan,sampleArenaShowPlanV1040:sample}=load('lib/arena360ShowDesignerV1040');
const {planLightingChoreographerV1060:choreograph}=load('lib/arena360LightingChoreographerV1060');
const {planCinematicLightingV1056:spots}=load('lib/arena360CinematicLightingV1056');
const {planIntelligentLaserV1057:lasers}=load('lib/arena360IntelligentLaserV1057');
const {planVolumetricLightingV1058:fog}=load('lib/arena360VolumetricLightingV1058');
const {planLedWallV1059:led}=load('lib/arena360LedWallV1059');
const durationMs=210000,trackId='spotify:v1060-regression';
const scene=makePlan({genre:'Deutschrap',durationMs});
const channels={spots:true,lasers:true,fog:true,led:true};
const input=(progressMs=101000,plan=scene)=>({enabled:true,stageIsArena:true,playing:true,
 reducedMotion:false,reactive:true,performanceTier:'high',trackId,progressMs,durationMs,
 plan,show:sample(plan,{enabled:true,playing:true,reducedMotion:false,progressMs,durationMs}),
 strength:70,channels});
const cue=choreograph(input());
assert(cue.active&&cue.reason==='planned');
assert.deepEqual(cue,choreograph(input()),'deterministic concert cues');
const times=[8000,28000,82000,108000,145000,174000,202000];
const chapters=times.map(t=>choreograph(input(t)));
assert(chapters.every(c=>c.active),'all seven planned chapters active');
assert.deepEqual(chapters.map(c=>c.chapter),[0,1,2,3,4,5,6]);
assert.deepEqual(chapters.map(c=>c.focus),['spots','spots','lasers','led','fog','spots','led']);
for(const c of chapters){
 assert(c.total<=4+1e-8,'four-channel light budget');
 for(const lane of Object.keys(channels))assert(Number.isFinite(c[lane])&&c[lane]>=.25&&c[lane]<=1,lane);
}
// Real coordination: different chapters give different emphasis, but never brighten any lane.
assert(chapters[1].spots>chapters[1].lasers,'verse prioritizes performers');
assert(chapters[2].lasers>chapters[2].fog,'build prioritizes laser');
assert(chapters[3].led>chapters[3].fog,'hook prioritizes led');
assert(chapters[4].fog>chapters[4].lasers,'interlude prioritizes atmosphere');
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 const plan=makePlan({genre,durationMs});assert(choreograph(input(108000,plan)).active,genre);
}
const failing=[{enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},
 {reactive:false},{performanceTier:'low'},{trackId:null},{trackId:''},{progressMs:-1},
 {progressMs:Infinity},{progressMs:NaN},{durationMs:Infinity},{durationMs:1000},
 {progressMs:durationMs+1},{plan:null},{show:null},{strength:0},
 {channels:{spots:false,lasers:false,fog:false,led:false}},
 {show:{...input().show,active:false}},{show:{...input().show,segmentIndex:100}},
 {show:{...input().show,scene:'finale'}},{show:{...input().show,fade:0}}];
for(const invalid of failing){
 const c=choreograph({...input(),...invalid});assert(!c.active,JSON.stringify(invalid));
 for(const lane of Object.keys(channels))assert.equal(c[lane],1,'inactive mode leaves old effects unchanged');
}
assert.equal(choreograph({...input(),playing:false}).reason,'paused');
assert.equal(choreograph({...input(),reducedMotion:true}).reason,'motion');
assert.equal(choreograph({...input(),performanceTier:'low'}).reason,'quality');
assert.equal(choreograph({...input(),channels:{}}).reason,'channels');
assert(choreograph({...input(),performanceTier:'balanced'}).spots>=cue.spots*.7);
assert(choreograph({...input(),strength:Infinity}).active);
const lightTouch=choreograph({...input(),strength:1});
assert(lightTouch.total>cue.total, 'near-zero strength must not abruptly clamp all channels');
for(const alone of Object.keys(channels)){
 const active=Object.fromEntries(Object.keys(channels).map(x=>[x,x===alone]));
 const c=choreograph({...input(),channels:active});assert(c.active);
 for(const other of Object.keys(channels))if(other!==alone)assert.equal(c[other],1,'manual off wins');
}
for(let i=0;i<8000;i++){
 const t=1+i*26.2,c=choreograph(input(t));
 for(const lane of Object.keys(channels))assert(Number.isFinite(c[lane])&&c[lane]>=.25&&c[lane]<=1,lane);
 assert(Number.isFinite(c.total)&&c.total>=0&&c.total<=4+1e-8);
}
// One complete, consistent show cue feeds all four underlying directors.
const base={enabled:true,stageIsArena:true,playing:true,reducedMotion:false,reactive:true,
 performanceTier:'high',trackId,progressMs:101000,durationMs,plan:scene,show:input().show,strength:70};
const candidates=[spots({...base,lightsEnabled:true}),
 lasers({...base,fanEnabled:true,architectureEnabled:true}),
 fog({...base,lightsEnabled:true,fogEnabled:true}),led({...base,pattern:'auto'})];
assert(candidates.every(x=>x.active),'V1056-1059 active inputs preserved');
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
for(const marker of ['planLightingChoreographerV1060(',
 'channels:{spots:cinematicLightingV1056.active',
 'coordinatedSpotsV1060','coordinatedLasersV1060','coordinatedVolumeV1060','coordinatedLedV1060',
 'cue={flowLedV1071}','lightCueV1056={coordinatedSpotsV1060}',
 'laserCueV1057={flowLasersV1071}',
 'volumetricCueV1058={volumetricLightingEnabledV1058?coordinatedVolumeV1060:undefined}'])
 assert(stage.includes(marker),marker);
assert.equal((stage.match(/laserCueV1057=\{flowLasersV1071\}/g)||[]).length,2);
assert(stage.includes('coordinatedLasersV1060.fanGain*ultimateFinaleV1070.lasers'));
assert(stage.includes('coordinatedLedV1060.gain*ultimateFinaleV1070.led')); // V1070 attenuation only
assert.equal((stage.match(/volumetricCueV1058=\{volumetricLightingEnabledV1058\?coordinatedVolumeV1060:undefined\}/g)||[]).length,2);
const pure=read('lib/arena360LightingChoreographerV1060.ts');
for(const unsafe of ['fetch(','setInterval(','setTimeout(','Math.random(','Date.now(',
 'localStorage','WebSocket(','new SpotLight','navigator.'])assert(!pure.includes(unsafe),unsafe);
const lights=read('components/visualizer/stages/ArenaLightsV1032.tsx');
assert.equal((lights.match(/<spotLight\b/g)||[]).length,2,'spot count unchanged');
for(const file of ['types/music.ts','context/UiPreferencesContext.tsx',
 'components/visualizer/VisualizerStage.tsx','components/visualizer/registry.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('LightingChoreographerEnabledV1060')||read(file).includes('lightingChoreographerEnabledV1060'),file);
assert(read('context/UiPreferencesContext.tsx').includes('arenaLightingChoreographerEnabledV1060:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1060 · AI Lighting Choreographer'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arenaLightingChoreographerEnabledV1060:false'));
assert(read('scripts/v931-production-gate.cjs').includes('tests/v1060-lighting-choreographer-regression.cjs'));
assert(read('scripts/vercel-production-build.cjs').includes('tests/v1060-lighting-choreographer-regression.cjs'));
console.log('PASS V1060 seven chapters, four genre plans, manual off, opt-in, 8000 bounded samples, optical budget, four existing render channels');
