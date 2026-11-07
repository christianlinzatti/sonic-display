'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const {planArenaAudienceV1044,sampleArenaAudienceV1044}=load('lib/arena360AudienceDirectorV1044');
const scene={active:true,scene:'verse',intensity:75,fade:1};
const base={enabled:true,show:scene,stageIsArena:true,playing:true,reducedMotion:false,
 phoneEnabled:true,phoneMode:'wave',performanceTier:'balanced',trackId:'song',progressMs:40000,
 strength:60,genre:'Deutschrap'};
const cue=planArenaAudienceV1044(base);
assert.equal(cue.active,true);assert.equal(cue.scene,'verse');assert(cue.gain>0&&cue.gain<=.75);
assert.equal(cue.color.length,3);
for(const overrides of [{enabled:false},{stageIsArena:false},{phoneEnabled:false},
 {show:null},{show:{...scene,active:false}},{playing:false},{reducedMotion:true},
 {phoneMode:'pulse'},{phoneMode:'chase'},{performanceTier:'low'},
 {trackId:''},{progressMs:NaN},{progressMs:-1},{show:{...scene,fade:0}},
 {show:{...scene,intensity:0}},{strength:0}]){
 assert.equal(planArenaAudienceV1044({...base,...overrides}).active,false,JSON.stringify(overrides));
}
for(const value of [NaN,Infinity,-1,500,undefined]){
 const v=planArenaAudienceV1044({...base,strength:value});
 assert(v.gain>=0&&v.gain<=.75&&Number.isFinite(v.gain));
}
for(const genre of ['Hardstyle','Deutschrap','Deutschrock','Pop']){
 const v=planArenaAudienceV1044({...base,genre});
 assert(v.color.every(channel=>channel>=0&&channel<=1));
}
for(const s of ['intro','verse','build','hook','interlude','finale']){
 const v=planArenaAudienceV1044({...base,show:{...scene,scene:s}});
 assert.equal(v.active,true);
 for(let a=-Math.PI;a<=Math.PI;a+=.4){
  for(let t=0;t<=20;t+=.5){
   const y=sampleArenaAudienceV1044(v,a,t,.5);
   assert(Number.isFinite(y)&&y>=0&&y<=1,s);
   // Smooth / bounded changes: no on-off strobes.
   const next=sampleArenaAudienceV1044(v,a,t+.02,.5);
   assert(Math.abs(y-next)<.035,s);
  }
 }
}
assert.equal(sampleArenaAudienceV1044(cue,NaN,3,.6),.6);
assert.equal(sampleArenaAudienceV1044(null,1,3,.6),.6);
assert.equal(sampleArenaAudienceV1044(cue,1,Infinity,.6),.6);
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
for(const f of ['components/visualizer/stages/Arena360StageV1031.tsx',
 'components/visualizer/stages/ArenaAudienceV1032.tsx',
 'components/visualizer/stages/index.tsx','components/visualizer/ThreeAvatar.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx','components/visualizer/VisualizerStage.tsx',
 'types/music.ts','components/visualizer/registry.tsx','context/UiPreferencesContext.tsx']){
 assert(read(f).includes(f==='components/visualizer/stages/index.tsx'?'audienceDirectorEnabled':'V1044'),`real integration: ${f}`);
}
for(const blocked of ['fetch(', 'setTimeout(', 'setInterval(', 'WebSocket(', 'Math.random(', 'new Date('])
 assert(!read('lib/arena360AudienceDirectorV1044.ts').includes(blocked),`forbidden: ${blocked}`);
console.log('PASS V1044 Audience Light Orchestra · scene cues, safety, bounds, integration, smooth light envelopes');
