const assert=require('node:assert/strict');
const load=require('./helpers/load-stage-typescript.cjs');
const {activeConcertLyric,concertLyricSection,concertRefrainVisit,nextConcertRefrain}=load('lib/concertLyricTimeline.ts');
const {concertScoreV1134}=load('lib/concertScoreV1134.ts');
const {lyricSpotlightV1133}=load('lib/lyricSpotlightV1133.ts');
const {lyricDensityV1130}=load('lib/showIntelligenceV1130.ts');
const lyrics={synced:true,provider:'lrclib',lines:[
 {startMs:0,endMs:4000,text:'Leise beginnt die Reise'},
 {startMs:24000,endMs:28000,text:'Unser Licht trägt diese Nacht'},
 {startMs:64000,endMs:68000,text:'UNSER LICHT trägt diese Nacht!'},
 {startMs:80000,text:'Ein letzter Schritt'},
]};
const before=JSON.stringify(lyrics);
for(const [ms,index] of [[-1,-1],[0,0],[3999,0],[4000,-1],[23999,-1],[24000,1],[28000,-1],[64000,2],[68000,-1],[80000,3],[83999,3],[84000,-1],[NaN,-1],[Infinity,-1]]){
 assert.equal(activeConcertLyric(lyrics,ms),index,`Line boundary ${ms}`);
}
for(const ms of [4000,10000,27999+1,84000]){
 assert.equal(concertLyricSection(lyrics,ms),'quiet');
 assert.equal(lyricSpotlightV1133(lyrics,ms).mode,'none');
 assert.equal(lyricDensityV1130(lyrics,ms),0);
}
assert.equal(concertRefrainVisit(lyrics,23999),0);
assert.equal(concertRefrainVisit(lyrics,24000),1);
assert.equal(concertRefrainVisit(lyrics,64000),2);
assert.equal(nextConcertRefrain(lyrics,24000),64000);
assert.equal(nextConcertRefrain(lyrics,64000),null);
const base={lyrics,count:3,bpm:120,energy:.65,durationMs:100000};
for(const [start,end,leader] of [[21000,23999,0],[61000,63999,1]]){
 let last=null;
 for(let ms=start;ms<=end;ms+=37){
  const cue=concertScoreV1134({...base,progressMs:ms});
  assert.equal(cue.staging,'anticipation');assert.equal(cue.leader,leader);
  assert.equal(cue.accent,0,'An upcoming refrain does not flash');
  if(last)for(const key of ['anticipationProgress','lightGain','beamGain','motionGain','intensity','cameraScale'])assert(cue[key]>=last[key],`${key} builds smoothly`);
  last=cue;
 }
 for(const bpm of [55,93,210])assert.equal(concertScoreV1134({...base,bpm,progressMs:end}).leader,leader);
 assert.equal(concertScoreV1134({...base,progressMs:end+1}).leader,leader,'Prepared lead continues into the refrain');
}
const rapBeforeHook={...lyrics,lines:[...lyrics.lines.slice(0,2),
 {startMs:60000,endMs:64000,text:'Jeder neue Schritt bringt heute unser Licht durch diese Nacht wir bleiben wach und tragen jeden Takt gemeinsam weiter bis zum Morgen'},
 ...lyrics.lines.slice(2)]};
for(const progressMs of [61000,62500,63999]){
 const cue=concertScoreV1134({...base,lyrics:rapBeforeHook,progressMs});
 assert.equal(cue.staging,'reading');assert.equal(cue.anticipationProgress,0);
 assert.equal(cue.leader,0,'Reading focus keeps its current soloist until the refrain');
 assert.equal(cue.accent,0);
}
assert.equal(JSON.stringify(lyrics),before,'Planning cannot modify provider lyrics');
assert.equal(activeConcertLyric({...lyrics,synced:false},24000),-1);
assert.equal(concertLyricSection(null,24000),null);
// Cached indexing must agree with a simple interval scan through forward playback and seeks.
let reads=0;
const rows=Array.from({length:1200},(_,i)=>({startMs:i*3000,endMs:i*3000+2000,text:`Phrase ${i%40} carries the lights`}));
const long={synced:true,get lines(){reads++;return rows;}};
for(let n=0;n<6000;n++){
 const ms=(n*7919)%3600000;
 const expected=rows.findIndex(l=>l.startMs<=ms&&ms<l.endMs);
 assert.equal(activeConcertLyric(long,ms),expected);
 concertRefrainVisit(long,ms);nextConcertRefrain(long,ms);concertLyricSection(long,ms);
}
assert.equal(reads,1,'Thousands of render queries must index a track only once');
const other={...lyrics,lines:[{startMs:24000,endMs:25000,text:'Ein anderer Track'}]};
assert.equal(concertLyricSection(other,24000),'verse');
assert.equal(concertLyricSection(lyrics,24000),'hook','Switching tracks must not contaminate cached structure');
// Verify that the shared build reaches the actual upper-body reaction layer.
const {Object3D,Quaternion}=require('three');
const {stepCrew,newCrewState}=load('components/visualizer/sonicCrewDirector.ts');
const {prepareCrewReaction,applyCrewReaction}=load('components/visualizer/sonicCrewReaction.ts');
const manifest=require('../public/avatars/sonic/manifest.json');
for(const asset of manifest){
 const modelId='sonic-'+asset.file.replace('.glb','');
 const input={...base,modelId,trackId:'prepared-refrain',slot:1,count:3,playing:true,reducedMotion:false,manualPriority:false,
  settings:{enabled:true,reactions:true,mode:'adaptive'},clips:asset.clips.map(c=>({name:c.name,duration:c.seconds}))};
 const sample=progressMs=>{
  const {plan}=stepCrew(newCrewState(),{...input,progressMs});
  assert(plan.active);assert.equal(plan.leader,1);
  const chest=new Object3D();chest.name='Chest';const nodes=prepareCrewReaction(chest);
  for(let frame=0;frame<180;frame++)applyCrewReaction(nodes,plan,3.25,.65,1/60);
  return chest.quaternion.angleTo(new Quaternion());
 };
 const early=sample(61000),late=sample(63999);
 assert(early>0&&late>early*1.05,`${modelId}: actual body accent grows with the build`);
}
console.log('PASS concert lyric timeline: exact boundaries, gaps, seeks, 1200-line tracks, one-time indexing, source isolation, smooth builds and prepared crew leads');
