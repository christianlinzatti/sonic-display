'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planConcertLightingV462:baseLighting}=load('components/visualizer/concertLightingDirectorV462');
const {refineConcertLightingV542:refine}=load('components/visualizer/intelligentConcertLightingV542');
const source={genre:'Deutschrap',section:'verse',energy:.72,kick:.52,playing:true,reactive:true,
  reducedMotion:false,tier:'high',authored:false,blackout:false};
const make=(patch={})=>{const c={...source,...patch};return refine({base:baseLighting(c),section:c.section,
  energy:c.energy,kick:c.kick,tier:c.tier,playing:c.playing,reactive:c.reactive,
  reducedMotion:c.reducedMotion,authored:c.authored,blackout:c.blackout,
  lyricsProtected:!!c.lyricsProtected,vocalFocus:!!c.vocalFocus,
  groupCount:c.groupCount??1});};
const rap=make(),lyrics=make({lyricsProtected:true}),crew=make({section:'hook',groupCount:3}),
  hard=make({genre:'Hardstyle',section:'drop',kick:1,energy:1}),
  soft=make({genre:'Hardstyle',section:'drop',kick:0,energy:1});
assert.equal(rap.scene,'vocal-verse');assert.equal(crew.scene,'crew-hook');assert.equal(hard.scene,'drop');
assert(lyrics.hazeGain<rap.hazeGain && lyrics.beamGain<rap.beamGain && lyrics.sweepGain<rap.sweepGain);
assert(lyrics.faceFloor>=rap.faceFloor);assert(crew.spotGain>rap.spotGain);
assert(hard.beamGain>soft.beamGain && hard.spotGain>soft.spotGain);
assert.equal(hard.allowLasers,false);
for(const patch of [{authored:true},{blackout:true},{reducedMotion:true},{tier:'low'},
  {playing:false},{reactive:false}]){
  const p=make(patch); assert.equal(p.active,false,JSON.stringify(patch));
  assert.equal(p.faceFloor,0);for(const k of ['keyGain','fillGain','beamGain','spotGain','hazeGain','sweepGain'])assert.equal(p[k],1);
}
let n=0;
for(const genre of ['Deutschrap','Hip Hop','Hardstyle','Hardtekk','techno'])
 for(const section of ['verse','hook','build','drop','break','intro'])
 for(const tier of ['high','balanced','low'])
 for(const count of [1,2,3,4])
 for(const lyricsProtected of [false,true])
 for(const kick of [0,.25,.8,1]) {
  const p=make({genre,section,tier,groupCount:count,lyricsProtected,kick});
  for(const [k,min,max] of [['keyGain',.92,1.09],['fillGain',.92,1.10],['beamGain',.70,1.16],
    ['spotGain',.85,1.12],['hazeGain',.6,1.08],['sweepGain',.58,1.13],['faceFloor',0,.55]]) {
    assert(Number.isFinite(p[k]) && p[k]>=min && p[k]<=max,`${k}: ${p[k]}`);
  }
  if(lyricsProtected && tier!=='low'){
    assert(p.hazeGain<=1-.32*(tier==='high'?1:.55)+1e-12);
    assert(p.sweepGain<=1-.34*(tier==='high'?1:.55)+1e-12);
  }
  assert.equal(p.allowLasers,false); n++;
 }
for(const broken of [{energy:NaN,kick:Infinity,groupCount:NaN},
  {energy:-Infinity,kick:-Infinity,groupCount:-15}, {energy:10,kick:-10,groupCount:999}]){
  const p=make(broken);assert(Object.keys(p).every(k=>typeof p[k]!=='number'||Number.isFinite(p[k])));
}
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const haze=fs.readFileSync('components/visualizer/ConcertAtmosphereRendererV308.tsx','utf8');
const scene=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
for(const token of ['refineConcertLightingV542({base:lightingV462','lyricsProtected:lyricsProtectedV542',
  'lightingV462.keyGain*lightingV542.keyGain','lightingV462.sweepGain * lightingV542.sweepGain',
  'groupCountV542={groupCountV542}'])assert(stage.includes(token),`stage missing ${token}`);
for(const token of ['refineConcertLightingV542({base:lightingV462','lightingV462.hazeGain*lightingV542.hazeGain',
  'lightingV462.spotGain*lightingV542.spotGain','lightingV542.allowLasers && festivalShowLasersV394'])
  assert(haze.includes(token),`atmosphere missing ${token}`);
assert(scene.includes('lyricsProtectedV542={lyricsActiveV356}'));
assert(scene.includes('groupCountV542={groupOnV326?effectiveGroupSettingsV442.count:') && scene.includes('||auto||multiEnabled||Boolean(showFormation)?2:1}')); // V563+: group-count now includes confirmed multi-avatar auto/formation layouts
assert.equal((stage.match(/<spotLight /g)||[]).length,1);
assert.equal((haze.match(/<spotLight /g)||[]).length,2);
const code=fs.readFileSync('components/visualizer/intelligentConcertLightingV542.ts','utf8');
for(const forbidden of ['requestAnimationFrame(', 'setTimeout(', 'Math.random(', 'localStorage', 'new SpotLight(', 'new Mesh(', 'new Audio('])assert(!code.includes(forbidden));
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=542);
assert(pkg.scripts['build:preflight'].includes('npm run test:v542 && npm run test:v542:types'));
console.log(`PASS V542: ${n} mood/section/cast/tier/lyrics scenarios, disabled/manual/blackout/laser safeguards, V462 reuse`);
