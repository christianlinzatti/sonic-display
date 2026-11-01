'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {normalizeConcertFxV810:normalize,planConcertFxV810:fxPlan}=load('components/visualizer/concertFxStudioV810');
const {planSpectralMusicV818:plan,SPECTRAL_CAPS_V818:caps,spectralPlacementV818:placement}=load('components/visualizer/spectralMusicPlannerV818');
const settings=normalize({intensity:100,spectralIntensity:100,quality:'ultra'});
const src={settings,genre:'Hardtekk',section:'drop',progressMs:5000,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.92,kick:.89,bass:.96,mids:.7,highs:.8,
 ledBudget:1,laserBudget:1};
const fx=fxPlan(src);
const args={fx,settings,tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:1,
 energy:.92,bass:.96,mids:.7,highs:.8,spectralBudget:1};
let n=0;
function test(name,fn){try{fn();n++;}catch(e){e.message=name+': '+e.message;throw e;}}
const cue=plan(args);
test('musically verified hardtekk drop renders all three types',()=>{
 assert(fx.active&&cue.active);
 for(const [key,cap] of Object.entries(caps)){assert(cue[key]>0&&cue[key]<=cap,key);}
 for(const key of ['waveOpacity','ringOpacity','prismOpacity'])assert(cue[key]>0&&cue[key]<=.54,key);
});
test('bass controls waves not treble',()=>{
 assert.equal(plan({...args,bass:0}).waves,0);
 assert(plan({...args,bass:0}).rings>0);
 assert(plan({...args,bass:.20}).waveOpacity<cue.waveOpacity);
});
test('mids & highs control rings',()=>{
 assert.equal(plan({...args,mids:0,highs:0}).rings,0);
 assert(plan({...args,mids:.1,highs:.1}).ringOpacity<cue.ringOpacity);
});
test('no measured energy means no effect',()=>{
 for(const patch of [{energy:0},{bass:0,mids:0,highs:0}])assert(!plan({...args,...patch}).active);
});
test('pause, seek outside verified act, no sections or manual lighting fail closed',()=>{
 for(const patch of [{verified:false},{playing:false},{active:false},{reactive:false},
   {reducedMotion:true},{authored:true},{blackout:true},{progressMs:10000},{progressMs:-1},
   {startMs:10000},{tier:'low'},{genre:'rap',tier:'low'}]){
   const parent=fxPlan({...src,...patch});
   assert(!plan({...args,fx:parent,tier:patch.tier??'high'}).active,JSON.stringify(patch));
 }
});
test('break disables even if externally supplied active cue',()=>{
 assert(!plan({...args,fx:{...fx,section:'break'}}).active);
});
test('independent feature flags and intensity',()=>{
 for(const [key,out] of [['spectralBassWaves','waves'],['spectralFrequencyRings','rings'],['spectralGeometry','prisms']]){
   assert.equal(plan({...args,settings:{...settings,[key]:false}})[out],0,key);
 }
 assert(!plan({...args,settings:{...settings,spectralVisuals:false}}).active);
 assert(!plan({...args,settings:{...settings,spectralIntensity:0}}).active);
 assert(!plan({...args,settings:{...settings,intensity:0}}).active);
});
test('spectral music works if all prior FX layers turned off',()=>{
 const only=normalize({...settings,lasers:false,ribbons:false,ledWall:false,lyricsProjection:false,
  atmosphericFx:false,virtualCrowd:false,reactiveParticles:false,foamCannon:false,kineticStage:false});
 const parent=fxPlan({...src,settings:only});
 assert(parent.active&&parent.reason==='music');
 assert(plan({...args,settings:only,fx:parent}).active);
});
test('historical backup default values and input validation',()=>{
 const old=normalize({lasers:false});assert.equal(old.spectralVisuals,true);
 assert.equal(old.spectralIntensity,65);
 assert.equal(normalize({spectralIntensity:Infinity}).spectralIntensity,65);
 assert.equal(normalize({spectralIntensity:-10}).spectralIntensity,0);
 assert.equal(normalize({spectralIntensity:900}).spectralIntensity,100);
});
test('quality tiers strictly limit geometry and brightness',()=>{
 const high=cue,bal=plan({...args,settings:{...settings,quality:'balanced'}});
 const perf=plan({...args,settings:{...settings,quality:'performance'}});
 assert(perf.active&&perf.waves<bal.waves&&bal.waves<high.waves);
 assert(perf.prisms<bal.prisms&&bal.prisms<high.prisms);
 assert(perf.waveOpacity<bal.waveOpacity&&bal.waveOpacity<high.waveOpacity);
 assert(plan({...args,tier:'balanced'}).prisms<high.prisms);
});
test('budget zero off, fractional budget scales, no excessive GPU instances',()=>{
 assert(!plan({...args,spectralBudget:0}).active);
 const low=plan({...args,spectralBudget:.35});
 assert(low.prisms<cue.prisms&&low.rings<cue.rings);
 assert(low.prismOpacity<cue.prismOpacity);
});
test('lyrics, active vocalist and group shot reduce but do not change frequency inputs',()=>{
 for(const x of [{lyricsProtected:true},{vocalFocus:true},{groupCount:4}]){
  const r=plan({...args,...x});assert(r.prismOpacity<cue.prismOpacity);
  assert.equal(r.bass,cue.bass);assert.equal(r.highs,cue.highs);
 }
});
test('section dramaturgy grows through peak',()=>{
 const verse=plan({...args,fx:{...fx,section:'verse'}});
 const hook=plan({...args,fx:{...fx,section:'hook'}});
 assert(verse.prismOpacity<hook.prismOpacity&&hook.prismOpacity<cue.prismOpacity);
});
test('genre attenuation: rap < rock < hardtekk',()=>{
 const rap=plan({...args,fx:{...fx,genre:'rap'}});
 const rock=plan({...args,fx:{...fx,genre:'rock'}});
 assert(rap.prismOpacity<rock.prismOpacity&&rock.prismOpacity<cue.prismOpacity);
});
test('invalid nonfinite inputs, group size and phase fail safe',()=>{
 for(const patch of [{bass:NaN},{energy:Infinity},{spectralBudget:NaN},{mids:-Infinity},{groupCount:0},
  {groupCount:5},{groupCount:1.5},{fx:{...fx,phase:NaN}},{fx:{...fx,phase:-1}}]){
   assert(!plan({...args,...patch}).active,JSON.stringify(patch));
 }
});
test('deterministic, immutable, clamped and seek-stable',()=>{
 const data=JSON.stringify(args);assert.deepEqual(plan(args),cue);assert.equal(JSON.stringify(args),data);
 for(const key of ['bass','mids','highs'])assert(cue[key]>=0&&cue[key]<=1);
});
test('all instances occupy stage wings with max bass radius clearance',()=>{
 for(let i=0;i<caps.prisms;i++){
  const p=placement(i);
  assert(Number.isFinite(p.x)&&p.offset>=0&&p.offset<1);
  assert(Math.abs(p.x)-.7*(.34+1.03)>3.2,'bass wave cannot cover center lane');
  assert.deepEqual(p,placement(i));
 }
});
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
const renderer=fs.readFileSync('components/visualizer/SpectralMusicVisualsV818.tsx','utf8');
test('stage integrates verified cue with actual audio frequencies and existing budget',()=>{
 for(const s of ['spectralCueV818.current=planSpectralMusicV818({fx:fxCueV810','<SpectralMusicVisualsV818 cueRef={spectralCueV818}/>','spectralBudget:getVisualFactorsV640().led',
 'bass:audio.bass??0,mids:audio.mids??0,highs:audio.highs??0'])assert(stage.includes(s),s);
});
test('renderer uses three instanced meshes with throttled buffers and no new lights or clocks',()=>{
 assert.equal((renderer.match(/<instancedMesh /g)||[]).length,3);
 for(const key of ['waves','rings','prisms'])assert(renderer.includes(key));
 for(const bad of ['Math.random(','setInterval(','new Date(','<pointLight','<spotLight'])assert(!renderer.includes(bad));
 assert(renderer.includes('cadence.current<.05')&&renderer.includes('depthWrite={false}'));
});
test('settings UI and preview include all spectral controls',()=>{
 for(const key of ['spectralVisuals','spectralBassWaves','spectralFrequencyRings','spectralGeometry',
  'spectralIntensity','spectralPreview','V818'])assert(ui.includes(key),key);
});
console.log(`PASS V818 Spectral Music Visuals: ${n} test groups`);
