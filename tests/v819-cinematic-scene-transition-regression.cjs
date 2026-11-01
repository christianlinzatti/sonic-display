'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {normalizeConcertFxV810:normalize,planConcertFxV810:fxPlan}=load('components/visualizer/concertFxStudioV810');
const {planCinematicTransitionV819:plan,TRANSITION_OFF_V819:OFF}=load('components/visualizer/cinematicTransitionPlannerV819');
const settings=normalize({intensity:100,transitionIntensity:100,quality:'ultra'});
const src={settings,genre:'Hardtekk',section:'drop',progressMs:5000,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.9,kick:.8,bass:.9,mids:.7,highs:.8,
 ledBudget:1,laserBudget:1};
const fx=fxPlan(src);
const transition={active:true,kind:'intra-act',sceneIndex:3,edge:'exit',proximity:.9,cameraRate:.70,lightingRate:.75};
const args={fx,settings,transition,playing:true,reducedMotion:false,manualCamera:false,manualLighting:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',budget:1};
let n=0;
function test(name,fn){try{fn();n++;}catch(e){e.message=name+': '+e.message;throw e;}}
const cue=plan(args);
test('verified scene seam and parent act yield bounded cinematic effect',()=>{
 assert(cue.active);assert.equal(cue.style,'glitch');assert.equal(cue.edge,'exit');
 assert(cue.opacity>0&&cue.opacity<=.24);assert.equal(cue.cameraRate,transition.cameraRate);
 assert.equal(cue.lightingRate,transition.lightingRate);assert.equal(cue.sceneIndex,3);
});
test('genre determines meaningful auto look',()=>{
 assert.equal(plan({...args,fx:{...fx,genre:'rap'}}).style,'wipe');
 assert.equal(plan({...args,fx:{...fx,genre:'rock'}}).style,'dissolve');
 assert.equal(plan({...args,fx:{...fx,genre:'pop'}}).style,'dissolve');
 assert.equal(plan({...args,fx:{...fx,genre:'hardstyle'}}).style,'glitch');
});
test('explicit style overrides genre and respects individual switches',()=>{
 for(const style of ['wipe','glitch','dissolve']){
  assert.equal(plan({...args,settings:{...settings,transitionStyle:style}}).style,style);
  assert(!plan({...args,settings:{...settings,transitionStyle:style,
   [style==='wipe'?'transitionWipes':style==='glitch'?'transitionGlitch':'transitionDissolve']:false}}).active);
 }
});
test('pause, reduced-motion, manual camera, manual lighting & low tier fail closed',()=>{
 for(const patch of [{playing:false},{reducedMotion:true},{manualCamera:true},
  {manualLighting:true},{tier:'low'},{budget:0},{budget:NaN},{groupCount:0},{groupCount:5},
  {groupCount:1.1}])assert(!plan({...args,...patch}).active,JSON.stringify(patch));
});
test('unverified, missing, wrong, or stale transitions fail closed',()=>{
 for(const t of [undefined,null,{...transition,active:false},
  {...transition,kind:'off'},{...transition,sceneIndex:-1},
  {...transition,sceneIndex:1.1},{...transition,proximity:0},
  {...transition,proximity:Infinity},{...transition,proximity:2},
  {...transition,cameraRate:NaN},{...transition,lightingRate:0},
  {...transition,edge:'off'}])assert(!plan({...args,transition:t}).active,String(t?.proximity));
});
test('no V810 verification means no extra 3D flash',()=>{
 for(const patch of [{playing:false},{verified:false},{progressMs:10000},
  {blackout:true},{authored:true},{reducedMotion:true},{tier:'low'},{reactive:false}]){
   const parent=fxPlan({...src,...patch});
   assert(!plan({...args,fx:parent}).active,JSON.stringify(patch));
 }
});
test('only scene transitions enabled can activate V810 with legacy layers off',()=>{
 const only=normalize({...settings,lasers:false,ribbons:false,ledWall:false,lyricsProjection:false,
  atmosphericFx:false,virtualCrowd:false,reactiveParticles:false,kineticStage:false,
  foamCannon:false,spectralVisuals:false});
 const parent=fxPlan({...src,settings:only});
 assert(parent.active&&parent.reason==='music');
 assert(plan({...args,fx:parent,settings:only}).active);
});
test('independent master, intensity and checkbox switch off',()=>{
 for(const patch of [{sceneTransitions:false},{enabled:false},{transitionIntensity:0},{intensity:0}]){
   assert(!plan({...args,settings:{...settings,...patch}}).active,JSON.stringify(patch));
 }
});
test('performance, balanced, ultra, device tiers, budget and gain monotonic',()=>{
 const perf=plan({...args,settings:{...settings,quality:'performance'}});
 const bal=plan({...args,settings:{...settings,quality:'balanced'}});
 assert(perf.active&&perf.opacity<bal.opacity&&bal.opacity<cue.opacity);
 assert(plan({...args,tier:'balanced'}).opacity<cue.opacity);
 assert(plan({...args,budget:.3}).opacity<cue.opacity);
 assert(plan({...args,settings:{...settings,transitionIntensity:30}}).opacity<cue.opacity);
});
test('lyrics, lips and four performer group protect sightlines',()=>{
 for(const patch of [{lyricsProtected:true},{vocalFocus:true},{groupCount:4}]){
  const c=plan({...args,...patch});assert(c.active&&c.opacity<cue.opacity);
  assert.equal(c.cameraRate,transition.cameraRate);
 }
});
test('only near V791 seam; maximal opacity is hard capped',()=>{
 const near=plan({...args,transition:{...transition,proximity:.08}});
 assert(near.opacity<cue.opacity);
 const extremelyHigh=plan({...args,fx:{...fx,phase:333333},transition:{...transition,proximity:1}});
 assert(extremelyHigh.opacity<=.24);
});
test('deterministic and pure, seek reproducible',()=>{
 const input=JSON.stringify(args);assert.deepEqual(plan(args),cue);assert.equal(JSON.stringify(args),input);
 assert.equal(OFF.active,false);assert.equal(OFF.opacity,0);
});
test('historical settings migration and strict clamping',()=>{
 const old=normalize({lasers:false});assert(old.sceneTransitions);
 assert.equal(old.transitionIntensity,65);
 assert.equal(normalize({transitionIntensity:NaN}).transitionIntensity,65);
 assert.equal(normalize({transitionIntensity:-100}).transitionIntensity,0);
 assert.equal(normalize({transitionIntensity:500}).transitionIntensity,100);
 assert.equal(normalize({transitionStyle:'nonsense'}).transitionStyle,'auto');
});
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
const renderer=fs.readFileSync('components/visualizer/CinematicSceneTransitionV819.tsx','utf8');
test('integration uses existing verified V791 cue AND V810, no scene cut',()=>{
 for(const part of ['transitionCueV819.current=planCinematicTransitionV819({fx:fxCueV810',
  'transition:transitionV791','<CinematicSceneTransitionV819 cueRef={transitionCueV819}/>',
  'budget:getVisualFactorsV640().led','manualCamera:cameraNarrativeV605?.manualCamera===true'])
  assert(stage.includes(part),part);
});
test('two back-wing planes, no fullscreen overlay, no real-time lamps',()=>{
 assert.equal((renderer.match(/<mesh ref=/g)||[]).length,2);
 assert(renderer.includes('[-4.45,.20,-3.55]'));
 assert(renderer.includes('[4.45,.20,-3.55]'));
 for(const bad of ['<pointLight','<spotLight','Math.random(','setInterval(','new Date(','requestAnimationFrame('])assert(!renderer.includes(bad));
 assert(renderer.includes('depthWrite={false}')&&renderer.includes('depthTest'));
 assert(renderer.includes('uOpacity*glow*edgeFade'));
});
test('FX Studio exposes toggles, previews and simulated-data explanation',()=>{
 for(const key of ['sceneTransitions','transitionWipes','transitionGlitch',
  'transitionDissolve','transitionIntensity','transitionStyle','cinematicPreview',
  'V819','Simulation'])assert(ui.includes(key),key);
});
console.log(`PASS V819 Cinematic Scene Transition FX: ${n} test groups`);
