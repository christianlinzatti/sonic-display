'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const {planArenaCinematicFinaleV1046:plan}=load('lib/arena360CinematicFinaleV1046');
const template=generateArenaShowPlanV1040({genre:'Hardtekk',durationMs:200000});
const sample=(pct,overrides={})=>{
 const progressMs=200000*pct,durationMs=200000;
 const show=sampleArenaShowPlanV1040(template,{enabled:true,playing:true,reducedMotion:false,
  progressMs,durationMs,observedSection:'verse'});
 return plan({enabled:true,playing:true,reducedMotion:false,reactive:true,show,trackId:'current-song',
  progressMs,durationMs,strength:80,performanceTier:'high',...overrides});
};
assert.equal(sample(.85).active,false);
const gather=sample(.92),rise=sample(.95),climax=sample(.98),bow=sample(.997);
assert.deepEqual([gather.phase,rise.phase,climax.phase,bow.phase],['gather','rise','climax','bow']);
assert.equal(gather.confetti,0);
assert(rise.confetti>0&&climax.confetti>=rise.confetti);
assert(climax.shockPower>0);assert.equal(bow.shockPower,0);
assert(climax.audienceAccent>0&&climax.choreoAccent>0);
assert(climax.confettiCount<=96&&climax.confettiCount>=rise.confettiCount);
assert.equal(sample(.98,{performanceTier:'low'}).confettiCount,0);
assert.equal(sample(.98,{performanceTier:'low'}).shockPower,0);
assert(sample(.98,{performanceTier:'balanced'}).confettiCount<=48);
assert(sample(.98,{performanceTier:'balanced'}).shockPower<=climax.shockPower);
for(const percent of [.88,.91,.925,.965,.991,.992,.999,1]){
 const cue=sample(percent);
 for(const key of ['confetti','laserAccent','audienceAccent','deckAccent','shockPower','choreoAccent','clockSeconds'])
  assert(Number.isFinite(cue[key]),key);
 assert(cue.laserAccent>=1&&cue.laserAccent<=1.2);
 assert(cue.audienceAccent<=.2&&cue.deckAccent<=.025&&cue.choreoAccent<=.075);
 assert(cue.confettiCount<=96&&cue.shockPower<=.64);
}
for(const opts of [{enabled:false},{playing:false},{reducedMotion:true},{reactive:false},
 {show:null},{show:{active:false}},{trackId:null},{progressMs:NaN},{durationMs:Infinity},
 {durationMs:0},{progressMs:-100},{progressMs:250000},{strength:0}]){
 const cue=sample(.98,opts);assert.equal(cue.active,false,JSON.stringify(opts));
 assert.equal(cue.confettiCount,0);assert.equal(cue.shockPower,0);
}
for(const x of [NaN,Infinity,-15,999,null,undefined]){
 const cue=sample(.98,{strength:x});assert(Number.isFinite(cue.laserAccent));
 assert(cue.confettiCount<=96);
}
for(const f of ['components/visualizer/stages/Arena360StageV1031.tsx',
 'components/visualizer/stages/ArenaCinematicFinaleV1046.tsx',
 'components/visualizer/stages/ArenaLaserFansV1036.tsx',
 'components/visualizer/stages/index.tsx', 'components/visualizer/ThreeAvatar.tsx',
 'components/visualizer/VisualizerStage.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx','types/music.ts',
 'components/visualizer/registry.tsx','context/UiPreferencesContext.tsx'])
 assert(read(f).includes('V1046')||read(f).includes('cinematicFinale'),`Missing end-to-end integration: ${f}`);
const render=read('components/visualizer/stages/ArenaCinematicFinaleV1046.tsx');
assert(render.includes('audio.beat===true')&&render.includes('!lastBeat.current'));
assert(render.includes('cooldown.current=1.45'));
assert(render.includes('mesh.count=Math.min(96'));
assert(render.includes('mesh.visible=false;ring.visible=false'));
assert(render.includes('previousTrack.current!==trackId'));
assert(read('components/visualizer/stages/Arena360StageV1031.tsx').includes('audienceCueV1044.active&&finaleV1046.active'));
assert(read('components/visualizer/ThreeAvatar.tsx').includes('originalChoreoV1041&&castFinaleV1046.active'));
assert(read('context/UiPreferencesContext.tsx').includes('arenaFinaleEnabledV1046:false'));
for(const forbidden of ['fetch(', 'setTimeout(', 'setInterval(', 'WebSocket(', 'Math.random(', 'new Date(', 'localStorage'])
 assert(!read('lib/arena360CinematicFinaleV1046.ts').includes(forbidden),`Unexpected side effect: ${forbidden}`);
console.log('PASS V1046 · four finale phases, strong-beat shockwave, instanced confetti, show opt-in, tier caps, pause, manual priority and end-to-end wiring');
