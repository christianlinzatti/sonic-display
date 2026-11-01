'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {normalizeConcertFxV810:normalize,planConcertFxV810:fxPlan}=load('components/visualizer/concertFxStudioV810');
const {planFoamCannonV817:foamPlan,createFoamLayoutV817:foamLayout,FOAM_CAPS_V817:caps}=load('components/visualizer/foamCannonPlannerV817');
const {planKineticStageV817:kineticPlan,KINETIC_COLUMNS_V817:columns}=load('components/visualizer/kineticStagePlannerV817');
const settings=normalize({intensity:100,foamIntensity:100,kineticIntensity:100,quality:'ultra'});
const fxBase={settings,genre:'Hardtekk',section:'drop',progressMs:5000,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.95,kick:.9,bass:.87,mids:.65,highs:.6,ledBudget:1,laserBudget:1};
const fx=fxPlan(fxBase);
const base={fx,settings,tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:1,
 energy:.95,kick:.9,foamBudget:1,architectureBudget:1};
let n=0;
function test(title,fn){try{fn();n++;}catch(e){e.message=`${title}: ${e.message}`;throw e;}}
const foam=foamPlan(base),kinetic=kineticPlan(base);
test('hardtekk drop drives foam and kinetic pillars',()=>{
 assert(fx.active&&foam.active&&kinetic.active);
 assert(foam.bubbles>0&&foam.bubbles<=caps.bubbles&&foam.mist>0&&foam.mist<=caps.mist);
 assert(kinetic.columns>0&&kinetic.columns<=columns);
 assert(foam.opacity>0&&foam.opacity<=.62&&kinetic.opacity<=.45);
});
test('musical peak needed for foam; no fake triggers',()=>{
 for(const patch of [{kick:0},{energy:0},{kick:NaN},{energy:Infinity}])
 assert(!foamPlan({...base,...patch}).active);
});
test('sensitive sections break intro verse silent',()=>{
 for(const section of ['break','intro','verse']){
  assert(!foamPlan({...base,fx:{...fx,section}}).active);
 }
 assert(!kineticPlan({...base,fx:{...fx,section:'break'}}).active);
});
test('hook and finale available, build more reserved',()=>{
 assert(foamPlan({...base,fx:{...fx,section:'hook'}}).active);
 assert(foamPlan({...base,fx:{...fx,section:'finale'}}).active);
 assert(foamPlan({...base,fx:{...fx,section:'build'}}).opacity<foam.opacity);
 assert(kineticPlan({...base,fx:{...fx,section:'verse'}}).lift<kinetic.lift);
});
test('parent fail closed for no verification, pause, blackout, manual, motion, mismatched time',()=>{
 for(const patch of [{verified:false},{active:false},{playing:false},{reactive:false},{authored:true},
  {blackout:true},{reducedMotion:true},{progressMs:10000},{endMs:0},{tier:'low'}]){
  const gated=fxPlan({...fxBase,...patch});
  const s={...base,fx:gated,tier:patch.tier??'high'};
  assert(!foamPlan(s).active);assert(!kineticPlan(s).active);
 }
});
test('old backups are migration-safe and fields normalized',()=>{
 const old=normalize({lasers:false});
 assert.equal(old.foamCannon,true);assert.equal(old.kineticStage,true);
 assert.equal(old.foamSide,'both');assert.equal(old.foamIntensity,65);
 assert.equal(normalize({foamIntensity:Infinity}).foamIntensity,65);
 assert.equal(normalize({foamIntensity:-40}).foamIntensity,0);
 assert.equal(normalize({kineticIntensity:300}).kineticIntensity,100);
 assert.equal(normalize({foamSide:'invalid'}).foamSide,'both');
});
test('independent toggles, no global gate dependency on laser/LED/particles',()=>{
 assert(!foamPlan({...base,settings:{...settings,foamCannon:false}}).active);
 assert(!kineticPlan({...base,settings:{...settings,kineticStage:false}}).active);
 const only=normalize({...settings,lasers:false,ribbons:false,ledWall:false,lyricsProjection:false,
  atmosphericFx:false,virtualCrowd:false,reactiveParticles:false});
 const source=fxPlan({...fxBase,settings:only});
 assert(source.active&&source.reason==='music');
 assert(foamPlan({...base,settings:only,fx:source}).active);
 assert(kineticPlan({...base,settings:only,fx:source}).active);
});
test('quality and budget scale counts and opacity',()=>{
 const bal=foamPlan({...base,settings:{...settings,quality:'balanced'}});
 const perf=foamPlan({...base,settings:{...settings,quality:'performance'}});
 assert(perf.active&&perf.bubbles<bal.bubbles&&bal.bubbles<foam.bubbles);
 assert(perf.opacity<bal.opacity&&bal.opacity<foam.opacity);
 const small=foamPlan({...base,foamBudget:.3});
 assert(small.bubbles<foam.bubbles&&small.opacity<foam.opacity);
 assert(kineticPlan({...base,architectureBudget:.25}).columns<kinetic.columns);
 assert(!foamPlan({...base,foamBudget:0}).active);
 assert(!kineticPlan({...base,architectureBudget:0}).active);
 assert(!foamPlan({...base,tier:'low'}).active);
});
test('protect foreground; genre distinction',()=>{
 assert(foamPlan({...base,lyricsProtected:true}).opacity<foam.opacity);
 assert(foamPlan({...base,vocalFocus:true}).opacity<foam.opacity);
 assert(foamPlan({...base,groupCount:4}).opacity<foam.opacity);
 assert(foamPlan({...base,fx:{...fx,genre:'rap'}}).opacity<foam.opacity);
 assert(kineticPlan({...base,vocalFocus:true}).opacity<kinetic.opacity);
});
test('single side mode',()=>{
 assert.equal(foamPlan({...base,settings:{...settings,foamSide:'left'}}).side,'left');
 assert.equal(foamPlan({...base,settings:{...settings,foamSide:'right'}}).side,'right');
 assert.equal(foam.side,'both');
});
test('non-finite and invalid inputs fail closed',()=>{
 for(const patch of [{foamBudget:Infinity,architectureBudget:Infinity},{foamBudget:NaN,architectureBudget:NaN},{groupCount:0},{groupCount:5},{groupCount:1.1},
  {fx:{...fx,phase:NaN}},{fx:{...fx,phase:-1}}]){
  assert(!foamPlan({...base,...patch}).active);
  assert(!kineticPlan({...base,...patch}).active);
 }
});
test('deterministic foam seeds stay outside face lane',()=>{
 for(const count of Object.values(caps)){
  const x=foamLayout(count);assert.equal(x.length,count);
  assert.deepEqual(x,foamLayout(count));
  assert(x.every(p=>(p.side===1||p.side===-1)&&p.phase>=0&&p.phase<1&&Number.isFinite(p.skew)));
  for(const p of x)assert(3.65+Math.abs(p.skew)*.26>=3.25);
 }
});
test('no mutations: deterministic planners and normalized source',()=>{
 const serialized=JSON.stringify(base);
 assert.deepEqual(foamPlan(base),foam);assert.deepEqual(kineticPlan(base),kinetic);
 assert.equal(JSON.stringify(base),serialized);
});
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const studio=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
const foamRenderer=fs.readFileSync('components/visualizer/FoamCannonV817.tsx','utf8');
const kineticsRenderer=fs.readFileSync('components/visualizer/KineticStageV817.tsx','utf8');
test('stage integration inherits V810 and performance budget, single cue ref',()=>{
 for(const v of ['foamCueV817.current=planFoamCannonV817({fx:fxCueV810','kineticCueV817.current=planKineticStageV817({fx:fxCueV810',
  '<FoamCannonV817 cueRef={foamCueV817}/>','<KineticStageV817 cueRef={kineticCueV817}/>'])assert(stage.includes(v),v);
 assert(stage.includes('foamBudget:getVisualFactorsV640().led'));
 assert(stage.includes('architectureBudget:getVisualFactorsV640().led'));
});
test('renderer caps instanced draw calls and avoids per-frame allocation / lights',()=>{
 assert.equal((foamRenderer.match(/<instancedMesh /g)||[]).length,2);
 assert.equal((kineticsRenderer.match(/<instancedMesh /g)||[]).length,1);
 for(const txt of [foamRenderer,kineticsRenderer]){
  assert(!txt.includes('Math.random('));assert(!txt.includes('setInterval('));
  assert(!txt.includes('<spotLight'));assert(!txt.includes('<pointLight'));
  assert(txt.includes('depthWrite={false}'));
 }
 assert(foamRenderer.includes('cue.side===\'left\'')&&foamRenderer.includes('cue.side===\'right\''));
});
test('studio has controls & preview for both effects',()=>{
 for(const key of ['foamCannon','foamIntensity','foamSide','kineticStage','kineticIntensity','foamPreview','kineticPreview'])
  assert(studio.includes(key),key);
});
console.log(`PASS V817: ${n} foam-cannon and kinetic-stage safety/integration tests`);
