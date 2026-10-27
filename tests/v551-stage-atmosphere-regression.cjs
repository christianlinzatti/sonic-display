'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planStageAtmosphereV551:plan}=load('components/visualizer/intelligentStageAtmosphereV551');
const {planConcertLightingV462:base}=load('components/visualizer/concertLightingDirectorV462');
const {refineConcertLightingV542:refine}=load('components/visualizer/intelligentConcertLightingV542');
const {planConcertSceneV528:castPlan}=load('components/visualizer/cinematicConcertCoordinationV528');
const source={genre:'Deutschrap',section:'verse',energy:.83,kick:.72,playing:true,reactive:true,
 reducedMotion:false,tier:'high',authored:false,blackout:false,groupCount:3,lyricsProtected:false};
function cast(count=3,focus='lead',lead=1,ms=3400){return castPlan({trackId:'song',cueTrackId:'song',
 progressMs:ms,count,playing:true,reducedMotion:false,tier:'high',cue:{active:true,
 count,role:focus==='ensemble'?'hook':focus==='handoff'?'feature':'lead',leadSlot:lead,
 singingSlots:focus==='ensemble'?Array.from({length:count},(_,i)=>i):[lead],
 handoffFrom:focus==='handoff'?(lead+count-1)%count:null,startMs:1000,endMs:9000}});}
function make(patch={}){
 const i={...source,...patch};
 const first=base({genre:i.genre,section:i.section,energy:i.energy,kick:i.kick,playing:i.playing,
  reactive:i.reactive,reducedMotion:i.reducedMotion,tier:i.tier,authored:i.authored,blackout:i.blackout});
 const prior=refine({base:first,section:i.section,energy:i.energy,kick:i.kick,tier:i.tier,
  playing:i.playing,reactive:i.reactive,reducedMotion:i.reducedMotion,authored:i.authored,
  blackout:i.blackout,lyricsProtected:i.lyricsProtected,vocalFocus:true,groupCount:i.groupCount});
 return plan({base:prior,mood:first.mood,section:i.section,energy:i.energy,kick:i.kick,
  tier:i.tier,playing:i.playing,reactive:i.reactive,reducedMotion:i.reducedMotion,
  authored:i.authored,blackout:i.blackout,lyricsProtected:i.lyricsProtected,
  groupCount:i.groupCount,scene:i.scene??null});
}
const lead=make({scene:cast()}),handoff=make({scene:cast(3,'handoff',1)}),
 group=make({scene:cast(3,'ensemble',1)}),noCast=make();
assert.equal(lead.moment,'verse');assert.equal(lead.leftSingerSlot,1);assert.equal(lead.rightSingerSlot,null);
assert.equal(handoff.moment,'handoff');assert.equal(handoff.leftSingerSlot,0);assert.equal(handoff.rightSingerSlot,1);
assert.equal(group.moment,'ensemble');assert.equal(group.leftSingerSlot,0);assert.equal(group.rightSingerSlot,2);
assert.equal(noCast.leftSingerSlot,null);assert.equal(noCast.focusStrength,0);
assert(handoff.hazeGain<1&&group.hazeGain<1);
const hard=make({scene:null,genre:'Hardtekk',section:'drop',energy:1,kick:1});
const zero=make({scene:null,genre:'Hardtekk',section:'drop',energy:1,kick:0});
assert(hard.beamGain>zero.beamGain);assert(hard.spotGain>zero.spotGain);
assert(hard.fogNearOffset<zero.fogNearOffset);
const lyricDrop=make({scene:null,genre:'Hardstyle',section:'drop',energy:1,kick:1,lyricsProtected:true});
assert(lyricDrop.hazeGain<1&&lyricDrop.beamGain<1&&lyricDrop.sweepGain<1);
assert(lyricDrop.fogNearOffset>0&&lyricDrop.fogFarOffset>0);
for(const patch of [{authored:true},{blackout:true},{reducedMotion:true},{tier:'low'},
 {playing:false},{reactive:false}]){
 const p=make({...patch,scene:cast()});assert.equal(p.active,false,JSON.stringify(patch));
 assert.equal(p.focusStrength,0);assert.equal(p.leftSingerSlot,null);assert.equal(p.fogNearOffset,0);
 for(const key of ['keyGain','fillGain','spotGain','beamGain','hazeGain','sweepGain'])assert.equal(p[key],1);
}
for(const patch of [{trackId:''},{active:false},{count:4},{strength:NaN},
 {leadSlot:7},{singingSlots:[1,1]},{singingSlots:[]},
 {focus:'handoff',handoffFrom:null},{focus:'ensemble',singingSlots:[1]},
 {focus:'lead',singingSlots:[2]}]){
 const p=make({scene:{...cast(),...patch}});assert.equal(p.focusStrength,0,JSON.stringify(patch));
 assert.equal(p.leftSingerSlot,null,JSON.stringify(patch));
}
let samples=0,driven=0;
for(const genre of ['Deutschrap','Hip Hop','Hardstyle','Hardtekk','pop'])
for(const section of ['verse','hook','build','drop','break'])
for(const tier of ['low','balanced','high'])
for(const count of [2,3,4])
for(const focus of ['lead','handoff','ensemble'])
for(const lyricsProtected of [false,true])
for(const energy of [0,.45,1])
for(const kick of [0,.45,1]){
 const p=make({genre,section,tier,groupCount:count,scene:cast(count,focus,1),lyricsProtected,energy,kick});
 for(const [key,min,max] of [['keyGain',.96,1.07],['fillGain',.96,1.07],
 ['beamGain',.82,1.09],['spotGain',.94,1.09],['hazeGain',.73,1.05],
 ['sweepGain',.72,1.07],['fogNearOffset',-.4,1.6],['fogFarOffset',-.6,2],
 ['focusStrength',0,.7]])assert(Number.isFinite(p[key])&&p[key]>=min-1e-9&&p[key]<=max+1e-9,`${key}: ${p[key]}`);
 if(lyricsProtected&&tier!=='low'){
  assert(p.hazeGain<=1-.22*(tier==='high'?1:.56)+1e-8);
  assert(p.beamGain<=1-.13*(tier==='high'?1:.56)+1e-8);
  assert(p.fogNearOffset>=.7*(tier==='high'?1:.56)-1e-8);
 }
 if(p.leftSingerSlot!==null){assert(p.leftSingerSlot>=0&&p.leftSingerSlot<count);driven++;}
 assert.deepEqual(p,make({genre,section,tier,groupCount:count,scene:cast(count,focus,1),lyricsProtected,energy,kick}));
 samples++;
}
for(const extreme of [{energy:NaN,kick:Infinity},{energy:-Infinity,kick:-Infinity},
 {energy:999,kick:-3}])assert(Object.values(make(extreme)).every(v=>typeof v!=='number'||Number.isFinite(v)));
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const atmosphere=fs.readFileSync('components/visualizer/ConcertAtmosphereRendererV308.tsx','utf8');
for(const token of ['planStageAtmosphereV551({base:lightingV542','lightingV551.keyGain',
 'lightingV551.fillGain','lightingV551.beamGain','lightingV551.sweepGain',
 'concertSceneV551={concertLipSyncV386?.cinematicSceneV528}'])assert(stage.includes(token),'stage wiring: '+token);
for(const token of ['planStageAtmosphereV551({base:lightingV542','ownedFogV551.current',
 'scene.fog===fog','fog.near+=','fog.far+=','spotlightAimV551(',
 'v377-vocal-stage-slot-${slot}','lightingV551.hazeGain','lightingV551.spotGain',
 'leftAimV551','rightAimV551'])assert(atmosphere.includes(token),'atmosphere wiring: '+token);
for(const forbidden of ['window.', 'document.', 'Math.random(', 'requestAnimationFrame(',
 'setTimeout(', 'setInterval(', 'new SpotLight(', 'new Mesh(', 'new Fog(', 'localStorage'])
 assert(!fs.readFileSync('components/visualizer/intelligentStageAtmosphereV551.ts','utf8').includes(forbidden),forbidden);
assert.equal((stage.match(/<spotLight /g)||[]).length,1);
assert.equal((atmosphere.match(/<spotLight /g)||[]).length,2);
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=551);
assert(pkg.scripts['build:preflight'].includes('npm run test:v551 && npm run test:v551:types'));
console.log(`PASS V551: ${samples} genre/section/tier/cast/lyrics/energy/kick cases, ${driven} verified singer focuses, manual/blackout/low-tier safeguards`);
