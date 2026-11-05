'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planConcertFxV810,normalizeConcertFxV810}=load('components/visualizer/concertFxStudioV810');
const {planBeatAccentDirectorV822,BEAT_ACCENT_OFF_V822}=load('components/visualizer/beatAccentDirectorV822');
let tests=0;
function test(name,cb){try{cb();tests++;}catch(error){error.message=`${name}: ${error.message}`;throw error;}}
const s=normalizeConcertFxV810({intensity:100,beatAccentIntensityV822:100,quality:'ultra'});
const fxBase={settings:s,genre:'hardtekk',section:'drop',progressMs:5000,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,
 authored:false,blackout:false,lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',
 energy:.95,kick:.94,bass:.89,mids:.60,highs:.80,ledBudget:1,laserBudget:1};
const fx=(over={})=>planConcertFxV810({...fxBase,...over});
const inputs={fx:fx(),settings:s,tier:'high',budget:1,beatStrength:.93,kickOnset:.95,
 kickBand:.87,snareBand:.92,bass:.89,energy:.92,attack:.92,lyricsProtected:false,
 vocalFocus:false,groupCount:1};
const plan=(over={})=>planBeatAccentDirectorV822({...inputs,...over});
test('Backwards compatible default preferences',()=>{
 const x=normalizeConcertFxV810({enabled:true});
 assert(x.beatAccentV822&&x.beatAccentKickV822&&x.beatAccentSnareV822);
 assert(x.beatAccentBassV822&&x.beatAccentPeaksV822);
 assert.equal(x.beatAccentIntensityV822,65);
});
test('No alterations to unrelated saved settings',()=>{
 const x=normalizeConcertFxV810({foamSide:'left',ledLookV821:'waves',quality:'performance'});
 assert.equal(x.foamSide,'left');assert.equal(x.ledLookV821,'waves');assert.equal(x.quality,'performance');
});
test('Intensity and sensitivity inputs are sanitized',()=>{
 for(const n of [NaN,Infinity,-55,1011]){
  const x=normalizeConcertFxV810({beatAccentIntensityV822:n});
  assert(Number.isFinite(x.beatAccentIntensityV822)&&x.beatAccentIntensityV822>=0&&x.beatAccentIntensityV822<=100);
 }
 assert.equal(normalizeConcertFxV810({beatAccentSensitivityV822:'xyz'}).beatAccentSensitivityV822,'balanced');
});
test('Full effect cue uses measured bands',()=>{
 const x=plan();assert(x.active);assert(x.kick>0);assert(x.bass>0);assert(x.peak>0);
 assert(x.led>0&&x.laser>0&&x.particles>0&&x.foam>0);
});
test('Snare-like and kick accents are distinguishable',()=>{
 const kick=plan({kickBand:1,snareBand:.1});
 const snare=plan({kickBand:.15,snareBand:1,kickOnset:.9});
 assert(kick.kick>snare.kick);assert(snare.snareLike>kick.snareLike);
});
test('Attack alone without observed onset does not trigger transient',()=>{
 const x=plan({attack:1,kickOnset:0,beatStrength:0});
 assert.equal(x.kick,0);assert.equal(x.snareLike,0);assert.equal(x.peak,0);
});
test('Predicted BPM or phase pulse without microphone attack cannot trigger',()=>{
 const x=plan({attack:0,kickOnset:1,beatStrength:1});
 assert.equal(x.kick,0);assert.equal(x.snareLike,0);assert.equal(x.peak,0);
});
test('Measured snare-like onset can work with no kick onset',()=>{
 const x=plan({kickOnset:0,beatStrength:.9,attack:.95,snareBand:1,kickBand:.15});
 assert(x.snareLike>0);assert.equal(x.kick,0);
});
test('Bass response is continuous and does not fake an onset',()=>{
 const x=plan({attack:0,kickOnset:0,beatStrength:0,bass:.9});
 assert(x.bass>0);assert.equal(x.peak,0);assert.equal(x.foam,0);
});
test('Peaks only in verified hook, drop or finale',()=>{
 for(const section of ['intro','verse','build','break']){
  assert.equal(plan({fx:fx({section})}).peak,0,section);
 }
 for(const section of ['hook','drop','finale'])assert(plan({fx:fx({section})}).peak>0,section);
});
test('No new effects in breaks even with noisy audio',()=>{
 assert.equal(plan({fx:fx({section:'break'})}).peak,0);
 assert.equal(plan({fx:fx({section:'break'})}).foam,0);
});
test('Verified music gate blocks all accent lanes',()=>{
 for(const over of [{verified:false},{authored:true},{blackout:true},{playing:false},
 {reactive:false},{reducedMotion:true},{active:false},{tier:'low'},
 {progressMs:10000},{progressMs:0}]){
  const x=plan({fx:fx(over)});assert.deepEqual(x,BEAT_ACCENT_OFF_V822,JSON.stringify(over));
 }
});
test('Toggle and master intensity disable accents',()=>{
 for(const setting of [{enabled:false},{beatAccentV822:false},{beatAccentIntensityV822:0},{intensity:0}]){
  assert(!plan({settings:{...s,...setting}}).active,JSON.stringify(setting));
 }
});
test('Each instrument/peak switch acts independently',()=>{
 for(const [key,output] of [['beatAccentKickV822','kick'],['beatAccentSnareV822','snareLike'],
 ['beatAccentBassV822','bass'],['beatAccentPeaksV822','peak']]){
   assert.equal(plan({settings:{...s,[key]:false}})[output],0,key);
 }
});
test('Disabled FX families receive zero additional gain',()=>{
 for(const [key,output] of [['ledWall','led'],['lasers','laser'],
 ['reactiveParticles','particles'],['foamCannon','foam']]){
  assert.equal(plan({settings:{...s,[key]:false}})[output],0,key);
 }
});
test('Settings quality caps and low device tier',()=>{
 const values=['performance','balanced','ultra'].map(quality=>plan({settings:{...s,quality}}));
 assert(values[0].led<values[1].led&&values[1].led<values[2].led);
 assert.equal(values[0].laser,0);
 assert.deepEqual(plan({tier:'low'}),BEAT_ACCENT_OFF_V822);
});
test('Intensity, budget, and protection reduce accents',()=>{
 const top=plan().led;
 assert(plan({settings:{...s,beatAccentIntensityV822:30}}).led<top);
 assert(plan({budget:.25}).led<top);
 assert(plan({lyricsProtected:true}).led<top);
 assert(plan({vocalFocus:true}).led<top);
 assert(plan({groupCount:4}).led<top);
});
test('Conservative threshold gates more than responsive threshold',()=>{
 const base={attack:.38,kickOnset:.38,kickBand:.48,snareBand:.5,energy:.53,bass:.55};
 const low=plan({...base,settings:{...s,beatAccentSensitivityV822:'conservative'}});
 const high=plan({...base,settings:{...s,beatAccentSensitivityV822:'responsive'}});
 assert(high.kick>low.kick);assert(high.peak>=low.peak);
});
test('Bad numerical values and invalid cast size fail closed',()=>{
 for(const n of [NaN,Infinity,-Infinity])assert.deepEqual(plan({kickOnset:n}),BEAT_ACCENT_OFF_V822);
 for(const n of [0,-1,NaN,Infinity])assert.deepEqual(plan({budget:n}),BEAT_ACCENT_OFF_V822);
 for(const n of [0,5,2.5])assert.deepEqual(plan({groupCount:n}),BEAT_ACCENT_OFF_V822);
});
test('No cue exceeds permitted normalized gain',()=>{
 for(const key of ['kick','snareLike','bass','peak','led','laser','particles','foam']){
  assert(plan()[key]>=0&&plan()[key]<=1,key);
 }
});
test('Pure and deterministic across repeated samples and backward seeks',()=>{
 const original=JSON.stringify(inputs);
 assert.deepEqual(plan(),plan());assert.equal(JSON.stringify(inputs),original);
 assert.deepEqual(plan({fx:fx({progressMs:4200})}),plan({fx:fx({progressMs:4200})}));
});
test('V822 uses existing V821 shader and uniforms, no new draw calls',()=>{
 const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 assert(stage.includes('planBeatAccentDirectorV822('));
 assert((stage.includes('fragmentShader={LED_WALL_FRAGMENT_V842}') || ((stage.includes('fragmentShader={LED_WALL_FRAGMENT_V886}') || (stage.includes('fragmentShader={LED_WALL_FRAGMENT_V990}') && fs.readFileSync('components/visualizer/livingLedWallShaderV990.ts','utf8').includes('LED_WALL_FRAGMENT_V886'))) && fs.readFileSync('components/visualizer/ledWallCreativeShaderV886.ts','utf8').includes('LED_WALL_FRAGMENT_V842'))) &&
  fs.readFileSync('components/visualizer/ledWallExperienceShaderV842.ts','utf8').includes('LED_WALL_FRAGMENT_V821'));
 for(const u of ['uBeat22Kick','uBeat22Snare','uBeat22Peak']){
  assert(stage.includes(`led.uniforms.${u}.value=`));assert(stage.includes(`${u}:{value:0}`));
 }
 assert(!stage.includes('<BeatAccentRendererV822'));
});
test('V822 shader accents are confined to perimeter and capped',()=>{
 const shader=fs.readFileSync('components/visualizer/ledWallExperienceShaderV821.ts','utf8');
 assert(shader.includes('float beat22=clamp(')&&shader.includes('*rim,0.0,.30)'));
 assert(shader.includes('uBeat22Kick')&&shader.includes('uBeat22Snare'));
 assert(shader.includes('clamp(uOpacity*backdrop*vignette+ledAlpha,0.0,.15)'));
});
test('Studio exposes controls and discloses simulated data',()=>{
 const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
 for(const key of ['beatAccentV822','beatAccentSensitivityV822','beatAccentIntensityV822',
 'beatAccentKickV822','beatAccentSnareV822','beatAccentBassV822','beatAccentPeaksV822',
 'planBeatAccentDirectorV822','Simulation','Frequenzheuristik'])assert(ui.includes(key),key);
});
test('Settings stay backed up via shared normalizer',()=>{
 const pref=fs.readFileSync('context/UiPreferencesContext.tsx','utf8');
 assert(pref.includes('normalizeConcertFxV810(parsed.concertFxV810)'));
});
console.log(`PASS V822: ${tests} Advanced Beat Accent Director test groups`);
