'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const {planArenaCinematicCameraV1053:plan,composeArenaCinematicCameraV1053:compose,
 hasTimedVocalAccentV1053:timed}=load('lib/arena360CinematicCameraV1053');
const durationMs=210000,score=generateArenaShowPlanV1040({genre:'Deutschrap',durationMs});
function input(progressMs=58000){return {enabled:true,stageIsArena:true,cameraEnabled:true,
 playing:true,reducedMotion:false,reactive:true,show:sampleArenaShowPlanV1040(score,{enabled:true,
 playing:true,reducedMotion:false,progressMs,durationMs}),trackId:'spotify:v1053-track',progressMs,durationMs,
 strength:70,performanceTier:'high',lyricsPlaying:false,lyrics:null};}
const wide=input(),a=plan(wide);
assert(a.active&&a.reason==='planned');assert(a.gain>0&&a.gain<.8);
assert.deepEqual(plan(wide),a,'same song, same camera score');
const another=plan({...wide,trackId:'spotify:v1053-alternate'});
assert(another.active,'new track still has camera direction');
const pose={x:5,y:1,z:6,targetX:0,targetY:0,targetZ:0,fov:40};
const result=compose(pose,a);
assert.notDeepEqual(result,pose,'camera subtly moves');assert.deepEqual(pose,{x:5,y:1,z:6,targetX:0,targetY:0,targetZ:0,fov:40},'no mutation');
assert.strictEqual(compose(pose,a,true),pose,'manual/lyrics/vocal protected shot has precedence');
assert.strictEqual(compose(pose,{...a,active:false}),pose,'inactive exact no-op');
assert.strictEqual(compose({...pose,x:NaN},a).x,NaN,'nonfinite pose rejected');
assert.strictEqual(compose({...pose,x:1,z:1},a).x,1,'near camera rejected');
assert.strictEqual(compose({...pose,x:40},a).x,40,'far camera rejected');
const lyrics={synced:true,provider:'lrclib',plainText:null,lines:[
 {startMs:57000,endMs:61500,text:'Und heute klingt es fantastisch!',words:[
  {text:'Und',startMs:57000,endMs:57700},{text:'heute',startMs:57700,endMs:58400},
  {text:'klingt',startMs:58400,endMs:59100},
  {text:'es',startMs:59100,endMs:59900},
  {text:'fantastisch!',startMs:59900,endMs:61500}]},
 {startMs:63000,endMs:64500,text:'Wieder!',words:[{text:'Wieder!',startMs:63000,endMs:64500}]}
]};
assert(!timed({...lyrics,synced:false},60000),'unsynced lyrics are not live evidence');
assert(!timed({...lyrics,lines:[{startMs:57000,endMs:61500,text:'Line only'}]},60000),'line only cannot make closeup');
assert(!timed(lyrics,56999));assert(!timed(lyrics,62000),'gap cannot trigger closeup');
assert(!timed(lyrics,58000),'short non-emphatic word does not trigger');
assert(timed(lyrics,60500),'timed expressive word');
assert(!timed(lyrics,65000),'no stale lyric cues');
const singing=plan({...input(60500),lyrics,lyricsPlaying:true});
assert(singing.active&&singing.mode==='lead'&&singing.lyricAccent,'timed word proposes closeup');
const silent=plan({...input(60500),lyrics,lyricsPlaying:false});
assert(!silent.lyricAccent&&silent.mode!=='lead','not playing lyrics cannot create closeup');
const closer=compose(pose,singing);
assert(closer.fov<pose.fov&&Math.hypot(closer.x,closer.z)<Math.hypot(pose.x,pose.z),'bounded closeup');
assert(closer.targetY>pose.targetY);
for(const patch of [{enabled:false},{stageIsArena:false},{cameraEnabled:false},{reactive:false},
 {playing:false},{reducedMotion:true},{performanceTier:'low'},{manualPriority:true},{trackId:null},
 {trackId:''},{progressMs:-1},{progressMs:Infinity},{progressMs:220000},{durationMs:0},
 {durationMs:NaN},{strength:0},{show:{...wide.show,active:false}}]){
 const out=plan({...wide,...patch});assert.equal(out.active,false,JSON.stringify(patch));
 assert.strictEqual(compose(pose,out),pose,'off gate preserves original');
}
assert.equal(plan({...wide,playing:false}).reason,'paused');
assert.equal(plan({...wide,manualPriority:true}).reason,'manual');
assert.equal(plan({...wide,reducedMotion:true}).reason,'motion');
assert.equal(plan({...wide,progressMs:NaN}).reason,'clock');
assert(plan({...wide,performanceTier:'balanced'}).gain<a.gain,'balanced quality budget');
for(const t of [30000,58000,99000,158000,201000]){
 const q=plan(input(t));if(!q.active)continue;
 const p=compose(pose,q);
 assert(Math.abs(p.x-pose.x)<1&&Math.abs(p.y-pose.y)<.5&&Math.abs(p.z-pose.z)<1);
 assert(p.fov>=28&&p.fov<=65);
}
for(const file of ['components/visualizer/StageCameraDirectorV289.tsx','components/visualizer/SmartStageCameraV236.tsx']){
 const source=read(file);assert(source.includes('composeArenaCinematicCameraV1053('),file);
 assert(source.includes('protectedShotV1033')||source.includes('flyoverProtectedV1033'),file);
}
for(const file of ['components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx',
 'types/music.ts','context/UiPreferencesContext.tsx','components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('arenaCinematicCameraEnabledV1053'),file);
assert(read('context/UiPreferencesContext.tsx').includes('arenaCinematicCameraEnabledV1053:false'));
assert(read('components/visualizer/ThreeAvatar.tsx').includes('arenaCinematicCameraCueV1053={arenaCameraV1053}'));
const moduleText=read('lib/arena360CinematicCameraV1053.ts');
for(const word of ['fetch(', 'setTimeout(', 'setInterval(', 'Math.random(', 'localStorage', 'navigator.', 'document.', 'Date.now(', 'WebSocket(', 'new Camera'])
 assert(!moduleText.includes(word),'pure planner, forbidden '+word);
console.log('PASS V1053 · opt-in, timed words, camera composition, manual/lyrics guards, deterministic score, reduced motion, tiers, integration');
