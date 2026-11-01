'use strict';const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planLyricsProjectionV813:plan}=load('components/visualizer/lyricsProjectionV813');
const {normalizeConcertFxV810,planConcertFxV810}=load('components/visualizer/concertFxStudioV810');
const settings=normalizeConcertFxV810({quality:'ultra',intensity:100});
const base={settings,genre:'Deutschrap',section:'hook',progressMs:3500,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,
 blackout:false,lyricsProtected:true,vocalFocus:true,groupCount:1,tier:'high',
 energy:.88,kick:.90,bass:.90,mids:.5,highs:.6,ledBudget:1,laserBudget:1};
const fx=planConcertFxV810(base);
const lyrics={synced:true,provider:'spotify',plainText:null,lines:[
 {startMs:1000,endMs:2800,text:'Wir gehen hinaus',words:[
 {text:'Wir',startMs:1000,endMs:1300},{text:'gehen',startMs:1300,endMs:2000},{text:'hinaus',startMs:2000,endMs:2750}]},
 {startMs:3000,endMs:5200,text:'In die Nacht hinaus',words:[
 {text:'In',startMs:3000,endMs:3150},{text:'die',startMs:3150,endMs:3400},{text:'Nacht',startMs:3400,endMs:3900},{text:'hinaus',startMs:3900,endMs:5000}]}]};
let n=0;const test=(name,fn)=>{try{fn();n++;}catch(e){e.message=name+': '+e.message;throw e;}};
const input={fx,settings,lyrics,progressMs:3500,lyricsVisible:true,verifiedSong:true,groupCount:1};
test('hook word from timing',()=>{const c=plan(input);assert(c.active);assert.equal(c.text,'NACHT');assert.equal(c.source,'word');assert(c.opacity>0&&c.opacity<=.21)});
test('only verified source',()=>{assert(!plan({...input,verifiedSong:false}).active);assert(!plan({...input,fx:{...fx,active:false}}).active)});
test('no lyrics, not synced, lyrics hidden',()=>{assert(!plan({...input,lyrics:null}).active);assert(!plan({...input,lyrics:{...lyrics,synced:false}}).active);assert(!plan({...input,lyricsVisible:false}).active)});
test('gap never inherits previous text',()=>assert(!plan({...input,progressMs:2850}).active));
test('after timestamp no text',()=>assert(!plan({...input,progressMs:6000}).active));
test('word gaps do not fabricate a current word',()=>assert(!plan({...input,progressMs:2900}).active));
test('rhyme-like word accent requires timestamps',()=>{const c=plan({...input,progressMs:4300});assert(c.active);assert.equal(c.accent,'rhyme');assert.equal(c.text,'HINAUS');
 const noTiming={...lyrics,lines:[lyrics.lines[0],{...lyrics.lines[1],words:undefined}]};
 assert.notEqual(plan({...input,progressMs:4300,lyrics:noTiming}).accent,'rhyme');});
test('no verse words without a timed word',()=>{const verseFx={...fx,section:'verse'};const result=plan({...input,fx:verseFx,lyrics:{...lyrics,lines:lyrics.lines.map(l=>({...l,words:undefined}))}});assert(!result.active)});
test('projection surface chosen by user',()=>assert.equal(plan({...input,settings:{...settings,projectionSurface:'floor'}}).surface,'floor'));
test('disabled toggles',()=>assert(!plan({...input,settings:{...settings,lyricsProjection:false}}).active));
test('independent projection without laser/LED',()=>{const x=planConcertFxV810({...base,settings:{...settings,lasers:false,ribbons:false,ledWall:false,atmosphericFx:false}});assert(x.active);assert(plan({...input,fx:x}).active);});
test('seek-stability',()=>assert.deepEqual(plan(input),plan(input)));
test('sanitize long/user lyrics',()=>{const unsafe={...lyrics,lines:[{startMs:0,endMs:5000,text:'hello'.repeat(80),words:[]}]};
 const r=plan({...input,lyrics:unsafe});assert(r.text.length<=30);});
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const host=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
test('live shared projection texture and cleanup',()=>{assert(stage.includes('new CanvasTexture(canvas)'));assert(stage.includes('texture.dispose()'));assert(stage.includes('lyricsDrawnV813.current!==lyricsCueV813.text'));assert(host.includes('lyricsV813={props.lyricsScene?.lyrics??props.lipSync?.lyrics}'))});
test('geometry protected behind cast',()=>{assert(stage.includes('v813-lyrics-wall-projection'));assert(stage.includes('v813-lyrics-floor-projection'));assert(stage.includes('depthWrite={false} depthTest'))});
console.log(`PASS V813: ${n} timestamp/readability/projection tests`);
