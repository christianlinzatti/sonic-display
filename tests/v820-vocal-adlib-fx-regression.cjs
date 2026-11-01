'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {normalizeConcertFxV810:normalize,planConcertFxV810:planFx}=load('components/visualizer/concertFxStudioV810');
const {planVocalAdlibFxV820:plan,VOCAL_FX_OFF_V820:OFF}=load('components/visualizer/vocalAdlibFxPlannerV820');
const settings=normalize({intensity:100,vocalFxIntensity:100,quality:'ultra'});
const parent={settings,genre:'Deutschrap',section:'hook',progressMs:5000,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:2,tier:'high',energy:.9,kick:.8,bass:.8,mids:.7,highs:.8,
 ledBudget:1,laserBudget:1};
const fx=planFx(parent);
const lead={startMs:1000,endMs:9000,leadSlot:0,partnerSlot:1,style:'solo',roleV547:'verse',strength:90};
const feature={...lead,leadSlot:1,partnerSlot:0,roleV547:'feature',startMs:3000,endMs:7000};
const adlib={...lead,leadSlot:1,partnerSlot:0,roleV547:'adlib',startMs:4000,endMs:6000};
const args={settings,fx,trackId:'spotify:track:abc',vocalTrackId:'spotify:track:abc',
 segments:[lead,adlib],vocalEnabled:true,progressMs:5000,playing:true,reducedMotion:false,
 groupCount:2,tier:'high',budget:1,lyricsProtected:false,vocalFocus:false,manualCamera:false,
 manualLighting:false,lyrics:null,lyricsVisible:true};
let n=0;
function test(name,fn){try{fn();n++;}catch(e){e.message=`${name}: ${e.message}`;throw e;}}
const cue=plan(args);
test('confirmed lead plus overlapping adlib never steals lead',()=>{
 assert(fx.active);assert(cue.active);assert.equal(cue.role,'lead');assert.equal(cue.leadSlot,0);
 assert.equal(cue.adlibSlot,1);assert(cue.leadOpacity>0&&cue.adlibOpacity>0);assert.equal(cue.adlibWord,'');
});
test('confirmed feature uses own mode and side',()=>{
 const c=plan({...args,segments:[feature]});assert(c.active);assert.equal(c.role,'feature');
 assert.equal(c.leadSlot,1);assert.equal(c.adlibSlot,null);assert.equal(c.adlibOpacity,0);
});
test('isolated confirmed adlib has no invented lead singer',()=>{
 const c=plan({...args,segments:[adlib]});assert(c.active);assert.equal(c.role,'adlib');
 assert.equal(c.leadOpacity,0);assert.equal(c.adlibSlot,1);
});
test('no guessed vocal identities from audio or artist credits',()=>{
 for(const segments of [[],null,undefined])assert(!plan({...args,segments}).active);
 assert(!plan({...args,vocalEnabled:false}).active);
 assert(!plan({...args,vocalTrackId:'another-song'}).active);
 assert(!plan({...args,trackId:''}).active);
});
test('adlib timing is strict and seeking is reproducible',()=>{
 for(const progressMs of [0,1000,9000,11000])assert(!plan({...args,progressMs}).active);
 const stillLead=plan({...args,progressMs:3500});assert(stillLead.active&&stillLead.adlibSlot===null);
 const copy=JSON.stringify(args);assert.deepEqual(plan(args),cue);assert.equal(JSON.stringify(args),copy);
});
test('pause, reduced motion, manual override, low tier, invalid budget guard',()=>{
 for(const patch of [{playing:false},{reducedMotion:true},{manualCamera:true},{manualLighting:true},
  {tier:'low'},{budget:0},{budget:NaN},{groupCount:0},{groupCount:5},{groupCount:2.5}])
  assert(!plan({...args,...patch}).active,JSON.stringify(patch));
});
test('parent V810 unverified/blackout is authoritative',()=>{
 for(const patch of [{verified:false},{blackout:true},{authored:true},{playing:false},{reactive:false}])
  assert(!plan({...args,fx:planFx({...parent,...patch})}).active,JSON.stringify(patch));
});
test('slider and individual lead, feature, adlib switches',()=>{
 for(const patch of [{enabled:false},{vocalFx:false},{vocalFxIntensity:0},{intensity:0}])
  assert(!plan({...args,settings:{...settings,...patch}}).active);
 const noLead=plan({...args,settings:{...settings,vocalLeadAura:false}});
 assert(noLead.active&&noLead.leadOpacity===0&&noLead.adlibOpacity>0);
 const noAdlib=plan({...args,settings:{...settings,vocalAdlibs:false}});
 assert(noAdlib.active&&noAdlib.adlibOpacity===0&&noAdlib.adlibSlot===null);
 assert(!plan({...args,segments:[feature],settings:{...settings,vocalFeatureAura:false}}).active);
});
test('text requires explicit adlib tag and timed individual word',()=>{
 const lyrics={synced:true,provider:'spotify',plainText:null,lines:[{startMs:4000,endMs:6000,
   text:'[vocal:adlib:2] Hey',words:[{text:'Hey',startMs:4800,endMs:5400}]}]};
 assert.equal(plan({...args,lyrics}).adlibWord,'HEY');
 assert.equal(plan({...args,lyrics,lyricsVisible:false}).adlibWord,'');
 assert.equal(plan({...args,lyrics:{...lyrics,synced:false}}).adlibWord,'');
 assert.equal(plan({...args,lyrics:{...lyrics,lines:[{...lyrics.lines[0],text:'Hey'}]}}).adlibWord,'');
 assert.equal(plan({...args,lyrics:{...lyrics,lines:[{...lyrics.lines[0],text:'[vocal:adlib:1] Hey'}]}}).adlibWord,'');
 assert.equal(plan({...args,lyrics:{...lyrics,lines:[{...lyrics.lines[0],words:[]}]}}).adlibWord,'');
 assert.equal(plan({...args,lyrics:{...lyrics,lines:[{...lyrics.lines[0],words:[{text:'Hey',startMs:4900,endMs:6500}]}]}}).adlibWord,'');
 assert.equal(plan({...args,lyrics,settings:{...settings,vocalAdlibWords:false}}).adlibWord,'');
});
test('adlib word strips potentially unsafe stage markup',()=>{
 const lyrics={synced:true,provider:'spotify',plainText:null,lines:[{startMs:4000,endMs:6000,
   text:'[vocal:adlib:2] Yo',words:[{text:'<Yo>',startMs:4800,endMs:5400}]}]};
 assert.equal(plan({...args,lyrics}).adlibWord,'YO');
});
test('only an adlib in cast can be used, never an invisible fourth singer',()=>{
 const c=plan({...args,segments:[lead,{...adlib,leadSlot:3,partnerSlot:0}]});
 assert(c.active&&c.adlibOpacity===0&&c.adlibSlot===null);
});
test('bounded opacity, tonal dependence, and three device quality profiles',()=>{
 assert(cue.leadOpacity<=.18&&cue.adlibOpacity<=.22);
 const balanced=plan({...args,settings:{...settings,quality:'balanced'}});
 const performance=plan({...args,settings:{...settings,quality:'performance'}});
 assert(performance.leadOpacity<balanced.leadOpacity&&balanced.leadOpacity<cue.leadOpacity);
 assert(plan({...args,tier:'balanced'}).adlibOpacity<cue.adlibOpacity);
 assert(plan({...args,budget:.4}).adlibOpacity<cue.adlibOpacity);
 assert(plan({...args,lyricsProtected:true}).leadOpacity<cue.leadOpacity);
 assert(plan({...args,vocalFocus:true}).leadOpacity<cue.leadOpacity);
 assert(plan({...args,groupCount:4}).leadOpacity<cue.leadOpacity);
});
test('normalizer accepts old saves and rejects invalid values',()=>{
 const old=normalize({ledWall:true});assert(old.vocalFx&&old.vocalAdlibs);
 assert.equal(normalize({vocalFxIntensity:Infinity}).vocalFxIntensity,60);
 assert.equal(normalize({vocalFxIntensity:-20}).vocalFxIntensity,0);
 assert.equal(normalize({vocalFxIntensity:110}).vocalFxIntensity,100);
 assert.equal(normalize({vocalFx:'wrong'}).vocalFx,true);
});
test('exclusive V820 setting keeps parent verified cue active',()=>{
 const only=normalize({...settings,lasers:false,ribbons:false,ledWall:false,lyricsProjection:false,
  atmosphericFx:false,virtualCrowd:false,reactiveParticles:false,kineticStage:false,
  foamCannon:false,spectralVisuals:false,sceneTransitions:false});
 const c=planFx({...parent,settings:only});assert(c.active);assert(plan({...args,fx:c,settings:only}).active);
});
test('integration uses existing explicit V496 segments and protects camera/light',()=>{
 const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 for(const key of ['vocalFxCueV820.current=planVocalAdlibFxV820({fx:fxCueV810',
  'concertLipSyncV386?.vocalTimeSegmentsV496','concertLipSyncV386?.vocalTimeTrackIdV496',
  'concertLipSyncV386?.vocalTimeEnabledV496===true',
  '<VocalAdlibFxV820 cueRef={vocalFxCueV820}/>','manualLighting:manualLightingV763||authoredLightsV386'])
   assert(stage.includes(key),key);
});
test('renderer reuses side planes, owns canvas cleanup; no new camera or lights',()=>{
 const renderer=fs.readFileSync('components/visualizer/VocalAdlibFxV820.tsx','utf8');
 assert(renderer.includes('position={[-4.45,.20,-3.42]}'));
 assert(renderer.includes('position={[4.45,.20,-3.42]}'));
 assert(renderer.includes('tex.dispose()'));
 assert(renderer.includes('depthWrite={false}')&&renderer.includes('depthTest'));
 for(const bad of ['<pointLight','<spotLight','<PerspectiveCamera','setInterval(','Math.random(','requestAnimationFrame('])
  assert(!renderer.includes(bad),bad);
});
test('FX Studio offers toggles, word safety and simulated preview',()=>{
 const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
 for(const key of ['V820','vocalFxIntensity','vocalLeadAura','vocalFeatureAura','vocalAdlibs',
  'vocalAdlibWords','vocalPreview','Simulierte Vorschau'])assert(ui.includes(key),key);
});
test('off object is inert',()=>{assert(!OFF.active);assert.equal(OFF.leadOpacity,0);assert.equal(OFF.adlibWord,'');});
console.log(`PASS V820 Vocal & Adlib FX: ${n} test groups`);
