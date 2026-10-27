"use strict";
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {load} = require('./helpers/ts-loader-v404.cjs');
const {planCinematicLyricsExperienceV525:plan,hasRapidVerifiedRapWordsV525:rapid} = load('components/visualizer/cinematicLyricsExperienceV525');
const {planCinematicLyricsExperienceV501:basePlan} = load('components/visualizer/cinematicLyricsExperienceV501');
const words=['Ich','rappe','jetzt','ganz','schnell','auf','dem','Beat'].map((text,i)=>({text,startMs:1000+i*175,endMs:1160+i*175}));
const line={text:words.map(w=>w.text).join(' '),startMs:1000,endMs:2600,words};
const source={line,nextLineStart:3000,progressMs:1500,synchronized:true,playing:true,reducedMotion:false,layout:'immersive',avatarCount:4,genre:'Deutschrap'};
const run=(args={})=>{const cfg={...source,...args};const {genre,...baseArgs}=cfg;return plan({...cfg,base:basePlan(baseArgs)});};
assert(rapid(line,3000));
assert(!rapid({...line,words:undefined},3000));
assert(!rapid({...line,words:[{text:'fake',startMs:9000}]},3000));
assert(!rapid({...line,words:words.slice(0,3)},3000));
const rap=run();
assert(rap.rapidRap && rap.textClass==='rapid-rap');
assert(rap.wordMotionGain>0 && rap.wordMotionGain<.3);
assert(rap.readingBoost>1 && rap.readingBoost<=1.11);
assert(rap.plateOpacity>=.89 && rap.plateOpacity<=.94);
assert(rap.max3DWidth>0 && rap.max3DWidth<=2.3);
assert.equal(run({genre:'Hardstyle'}).rapidRap,false);
assert.equal(run({synchronized:false}).rapidRap,false);
assert.equal(run({line:{...line,words:undefined}}).rapidRap,false);
assert.equal(run({playing:false}).wordMotionGain,0);
assert.equal(run({reducedMotion:true}).wordMotionGain,0);
assert.equal(run({layout:'standard',avatarCount:4}).readingBoost,1);
assert.equal(run({avatarCount:1}).readingBoost,1);
assert.equal(run({avatarCount:4,line:{...line,text:'f'.repeat(160)}}).readingBoost,1);
assert.equal(run({avatarCount:NaN}).readingBoost,1);
assert.equal(run({genre:'Deutschrap',line:{...line,words:words.map((w,i)=>({...w,startMs:1000+i*370,endMs:1350+i*370})),endMs:4900},nextLineStart:5000}).rapidRap,false);
assert.equal(run({genre:'Deutschrap',line:{...line,words:words.map(w=>({...w,startMs:NaN}))}}).rapidRap,false);
const snapshot=JSON.stringify(source); assert.deepEqual(run(),run());assert.equal(JSON.stringify(source),snapshot,'input must be immutable');
const cin=fs.readFileSync('components/KineticLyrics.tsx','utf8');
const glb=fs.readFileSync('components/visualizer/Lyrics3DScene.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
for(const token of ['planCinematicLyricsExperienceV525','v525.readingBoost','coordinateConcertLyricsV526(v525','v526.wordMotionGain','v525.plateOpacity'])assert(cin.includes(token),`DOM integration missing: ${token}`);
for(const token of ['planCinematicLyricsExperienceV525','visualV525.readingBoost','coordinateConcertLyricsV526(visualV525','visualV526.wordMotionGain','activeCaptionV525?.plateOpacity'])assert(glb.includes(token),`3D integration missing: ${token}`);
assert(cin.includes('lyricPlaybackFractionV477'), 'karaoke fill must remain based on verified times');
assert(glb.includes('lyricPlaybackFractionV477'));
assert(css.includes('v525-cinematic-lyrics')&&css.includes('max-width:calc(47% - 14px)'));
assert(!fs.readFileSync('components/visualizer/cinematicLyricsExperienceV525.ts','utf8').includes('setInterval'));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=525);
assert(pkg.scripts['build:preflight'].includes('npm run test:v525 && npm run test:v525:types')); 
let checked=0;
for(const genre of ['Deutschrap','Hardstyle','Hardtekk','Alternative Rap','Pop']) {
 for(let i=0;i<6000;i++) {
  const ret=run({genre,playing:i%17!==0,reducedMotion:i%23===0,
   avatarCount:1+i%4,layout:i%3===0?'standard':i%2===0?'stage-3d':'immersive',
   progressMs:500+i*4});
  assert(Number.isFinite(ret.readingBoost)&&ret.readingBoost>=1&&ret.readingBoost<=1.11);
  assert(Number.isFinite(ret.plateOpacity)&&ret.plateOpacity>=0&&ret.plateOpacity<=1);
  assert(Number.isFinite(ret.wordMotionGain)&&ret.wordMotionGain>=0&&ret.wordMotionGain<=1);
  assert(Number.isFinite(ret.max3DWidth)&&ret.max3DWidth>0&&ret.max3DWidth<=2.3);
  if(i%17===0||i%23===0)assert.equal(ret.wordMotionGain,0);
  checked++;
 }
}
console.log(`PASS V525 cinematic lyrics: ${checked} deterministic visual-plan simulations, word-timing guards, DOM/3D/10-inch CSS wiring`);
