require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {lightingMoodV462:genre,planConcertLightingV462:plan}=load('components/visualizer/concertLightingDirectorV462');
const base={genre:'Deutschrap',section:'verse',energy:.65,kick:.4,playing:true,reactive:true,reducedMotion:false,tier:'high',authored:false,blackout:false};
assert.equal(genre('Deutschrap'),'rap');
assert.equal(genre('Hip Hop'),'rap');
assert.equal(genre('german rap'),'rap');
assert.equal(genre('Hardtekk'),'hardtekk');
assert.equal(genre('Hardstyle'),'hardstyle');
assert.equal(genre('Rawstyle'),'hardstyle');
assert.equal(genre('jazz'),'neutral');
const rap=plan(base),hook=plan({...base,section:'hook'});
assert.equal(rap.active,true);
assert(rap.sweepGain<1,'Rap verse should use calmer sweeps');
assert(rap.fillGain>1&&rap.faceFloor>0,'Face lighting should remain visible');
assert(hook.beamGain>rap.beamGain&&hook.spotGain>rap.spotGain,'Hooks gain group emphasis');
assert(hook.hazeGain>=rap.hazeGain&&hook.hazeGain<1,'Rap haze remains subdued');
const hd=plan({...base,genre:'Hardstyle',section:'drop',kick:1});
const hl=plan({...base,genre:'Hardstyle',section:'drop',kick:0});
const ht=plan({...base,genre:'Hardtekk',section:'drop',kick:1});
assert(hd.beamGain>hl.beamGain&&hd.spotGain>hl.spotGain,'Drop needs actual kick evidence');
assert(ht.sweepGain>hd.sweepGain,'Hardtekk slightly more mobile');
assert(hd.hazeGain<=1.12,'Haze must remain bounded');
const low=plan({...base,tier:'low'});
assert.equal(low.active,false); assert.equal(low.faceFloor,0);
for(const [key,value] of [['playing',false],['reactive',false],['reducedMotion',true],['authored',true],['blackout',true],['enabled',false]]){
  const d=plan({...base,[key]:value}); assert.equal(d.active,false,key);assert.equal(d.faceFloor,0,key);
  for(const v of ['keyGain','fillGain','beamGain','spotGain','hazeGain','sweepGain'])assert.equal(d[v],1,`${key}:${v}`);
}
const balanced=plan({...base,genre:'Hardstyle',section:'drop',kick:1,tier:'balanced'});
assert(balanced.beamGain<hd.beamGain,'Balanced must tone down high-tier peaks');
for(let n=0;n<20000;n++){
  const q=plan({ ...base,genre:['Deutschrap','Hardtekk','Hardstyle','techno',''][n%5],
    section:['verse','hook','build','drop','break','intro'][n%6],
    tier:['high','balanced','low'][n%3],energy:(n%31)/30,kick:(n%37)/36 });
  for(const [field,min,max] of [['keyGain',.75,1.27],['fillGain',.75,1.2],['beamGain',.7,1.35],['spotGain',.75,1.28],['hazeGain',.55,1.12],['sweepGain',.28,1.28],['faceFloor',0,.55]]){
    assert(Number.isFinite(q[field])&&q[field]>=min&&q[field]<=max,`${n} ${field}`);
  }
}
for(const p of [plan({...base,energy:NaN,kick:Infinity}),plan({...base,kick:-Infinity,energy:-12})]){
  for(const k of ['keyGain','fillGain','beamGain','spotGain','hazeGain','sweepGain','faceFloor'])assert(Number.isFinite(p[k]),k);
}
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const atmosphere=fs.readFileSync('components/visualizer/ConcertAtmosphereRendererV308.tsx','utf8');
const scene=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
assert(stage.includes('planConcertLightingV462('));
assert(stage.includes('lightingV462.keyGain')&&stage.includes('lightingV462.fillGain')&&stage.includes('lightingV462.sweepGain'));
assert(stage.includes('timelineCue.blackout>0||timelineCue.strobe>0'));
assert(stage.includes('showCue?.enabled===true&&showCue.lightingEnabled===false'));
assert(stage.includes('authoredLightsV386'));
assert(stage.includes('genreV462={genre}'));
assert(atmosphere.includes('planConcertLightingV462('));
assert(atmosphere.includes('lightingV462.hazeGain')&&atmosphere.includes('lightingV462.spotGain'));
assert(atmosphere.includes('authoredLightingV387||!showLightingAllowed'));
assert(atmosphere.includes('timelineGainRef.current<.001'));
assert(scene.includes('<DynamicStage'));
assert.equal((stage.match(/<spotLight /g)||[]).length,1,'Reuse original single stage spotlight');
assert.equal((atmosphere.match(/<spotLight /g)||[]).length,2,'Reuse original two atmosphere spots');
assert(!fs.readFileSync('components/visualizer/concertLightingDirectorV462.ts','utf8').includes('localStorage'));
assert(Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=462);
console.log('PASS V462: rap face/verse/hook, kick-grounded hardstyle/hardtekk drops, bounded haze/sweeps, saved scenes/blackouts, low tier, no new GPU lights, 20k input matrix');
