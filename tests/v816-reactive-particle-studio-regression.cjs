'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planReactiveParticlesV816:plan,createParticleLayoutV816:layout,PARTICLE_CAPS_V816:caps}=load('components/visualizer/reactiveParticlePlannerV816');
const {normalizeConcertFxV810:normalize,planConcertFxV810:parent}=load('components/visualizer/concertFxStudioV810');
const settings=normalize({intensity:100,particleIntensity:100,quality:'ultra',particleDensity:'epic'});
const baseFx={settings,genre:'Hardtekk',section:'drop',progressMs:5000,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.9,kick:.9,bass:.9,mids:.6,highs:.7,ledBudget:1,laserBudget:1};
const fx=parent(baseFx);
const input={fx,settings,tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:1,
 energy:.9,kick:.9,bass:.9,highs:.7,particleBudget:1};
let count=0;const check=(name,fn)=>{try{fn();count++;}catch(error){error.message=`${name}: ${error.message}`;throw error;}};
const active=plan(input);
check('verified drop activates bounded sparks, shards and rings',()=>{
 assert(active.active);assert(active.sparks>0&&active.sparks<=caps.sparks);
 assert(active.shards>0&&active.shards<=caps.shards);assert(active.rings>0&&active.rings<=caps.rings);
 assert.equal(active.confetti,0);assert(active.sparkOpacity<=.62);
 assert(active.shardOpacity<=.50);assert(active.confettiOpacity<=.52);assert(active.ringOpacity<=.37);
});
check('finale enables confetti',()=>assert(plan({...input,fx:{...fx,section:'finale'}}).confetti>0));
check('hook enables confetti',()=>assert(plan({...input,fx:{...fx,section:'hook'}}).confetti>0));
check('verse is subdued and break suppressed',()=>{
 assert(plan({...input,fx:{...fx,section:'verse'}}).sparkOpacity<active.sparkOpacity);
 assert(!plan({...input,fx:{...fx,section:'break'}}).active);
});
check('audio with no measured accent cannot fabricate sparks',()=>{
 assert(!plan({...input,energy:0,kick:0,bass:0,highs:0}).active);
 assert(plan({...input,kick:0}).sparkOpacity<active.sparkOpacity);
});
check('source cue fail-closed',()=>{
 for(const patch of [{active:false},{reason:'off'},{reason:'guarded'},{reason:'unverified'}])
  assert(!plan({...input,fx:{...fx,...patch}}).active);
});
check('parent guards playing, verified act, authored, blackout, reduced motion, no stage',()=>{
 for(const patch of [{playing:false},{verified:false},{authored:true},{blackout:true},{reducedMotion:true},{active:false},{progressMs:10001},{tier:'low'}]){
  const cue=parent({...baseFx,...patch});assert(!plan({...input,fx:cue,tier:patch.tier??'high'}).active);
 }
});
check('off settings',()=>{
 for(const patch of [{reactiveParticles:false},{particleIntensity:0},{intensity:0},{enabled:false}])
  assert(!plan({...input,settings:{...settings,...patch}}).active);
});
check('all four switches are independent',()=>{
 assert.equal(plan({...input,settings:{...settings,particleSparks:false}}).sparks,0);
 assert.equal(plan({...input,settings:{...settings,particleShards:false}}).shards,0);
 assert.equal(plan({...input,settings:{...settings,particleEnergyRings:false}}).rings,0);
 const finaleFx={...fx,section:'finale'};
 assert.equal(plan({...input,fx:finaleFx,settings:{...settings,particleConfetti:false}}).confetti,0);
 assert(!plan({...input,settings:{...settings,particleSparks:false,particleShards:false,particleEnergyRings:false,particleConfetti:false}}).active);
});
check('performance / balanced / ultra count ordering',()=>{
 const perf=plan({...input,settings:{...settings,quality:'performance'}});
 const bal=plan({...input,settings:{...settings,quality:'balanced'}});
 assert(perf.active&&perf.sparks<bal.sparks&&bal.sparks<active.sparks);
 assert(perf.sparkOpacity<bal.sparkOpacity&&bal.sparkOpacity<active.sparkOpacity);
});
check('device budget limits density',()=>{
 const trim=plan({...input,particleBudget:.45});
 assert(trim.sparks<active.sparks&&trim.sparkOpacity<active.sparkOpacity);
 assert(!plan({...input,particleBudget:0}).active);
 assert(!plan({...input,tier:'low'}).active);
});
check('quality tier caps visual intensity',()=>assert(plan({...input,tier:'balanced'}).sparkOpacity<active.sparkOpacity));
check('density controls particle count',()=>{
 assert(plan({...input,settings:{...settings,particleDensity:'subtle'}}).sparks<active.sparks);
});
check('face, lyrics and ensemble suppress effects',()=>{
 assert(plan({...input,lyricsProtected:true}).sparkOpacity<active.sparkOpacity);
 assert(plan({...input,vocalFocus:true}).shardOpacity<active.shardOpacity);
 assert(plan({...input,groupCount:4}).ringOpacity<active.ringOpacity);
});
check('genres differ',()=>assert(plan({...input,fx:{...fx,genre:'rap'}}).sparkOpacity<active.sparkOpacity));
check('invalid sensor data and incomplete cast fail closed',()=>{
 for(const patch of [{kick:NaN},{highs:Infinity},{particleBudget:-1},{energy:NaN},{groupCount:5},{groupCount:1.5},{groupCount:0},{fx:{...fx,phase:-1}},{fx:{...fx,phase:NaN}}])
  assert(!plan({...input,...patch}).active);
});
check('normalization migrates backups and clamps changes',()=>{
 const old=normalize({ledWall:false,virtualCrowd:false});
 assert(old.reactiveParticles&&old.particleSparks&&old.particleEnergyRings);
 assert.equal(old.particleDensity,'balanced');assert.equal(old.particleIntensity,65);
 assert.equal(normalize({particleIntensity:Infinity}).particleIntensity,65);
 assert.equal(normalize({particleIntensity:200}).particleIntensity,100);
 assert.equal(normalize({particleDensity:'invalid'}).particleDensity,'balanced');
});
check('particle layout deterministic and central stage clear',()=>{
 for(const [key,cap] of Object.entries(caps)){
  const points=layout(cap);assert.equal(points.length,cap,key);
  assert(points.every(p=>Math.abs(p.x)>=3.15&&p.z<0&&Number.isFinite(p.y)));
  assert.deepEqual(points,layout(cap));
 }
});
check('seek stability without side effects',()=>{
 const copy=JSON.stringify(input);assert.deepEqual(plan(input),active);assert.equal(JSON.stringify(input),copy);
});
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const render=fs.readFileSync('components/visualizer/ReactiveParticleStudioV816.tsx','utf8');
const studio=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
check('stage integration uses verified fx, existing budget and separate draw layer',()=>{
 assert(stage.includes('planReactiveParticlesV816({fx:fxCueV810'));
 assert(stage.includes('particleBudget:getVisualFactorsV640().led'));
 assert(stage.includes('<ReactiveParticleStudioV816 cueRef={particlesCueV816}/>'));
});
check('renderer bounds 4 instanced meshes without lights or timers',()=>{
 assert.equal((render.match(/<instancedMesh /g)||[]).length,4);
 assert(!render.includes('<pointLight')&&!render.includes('<spotLight'));
 assert(!render.includes('setInterval(')&&!render.includes('Math.random('));
 assert(render.includes('depthWrite={false}'));
});
check('studio offers settings, preview and switches',()=>{
 for(const key of ['reactiveParticles','particleSparks','particleShards','particleConfetti','particleEnergyRings','particleIntensity','particleDensity','particlePreview'])
  assert(studio.includes(key),key);
});
console.log(`PASS V816: ${count} particle-gating, budget, genre, persistence and 3D integration tests`);
