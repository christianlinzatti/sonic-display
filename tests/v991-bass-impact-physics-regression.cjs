'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planBassImpactV991:plan,createBassImpactStateV991:state,
 enhanceBassImpactParticlesV991:enhance}=load('components/visualizer/bassImpactDirectorV991');
const {BASS_IMPACT_VERTEX_V991:vertex,BASS_IMPACT_FRAGMENT_V991:fragment}=
 load('components/visualizer/bassImpactShaderV991');
const {planConcertFxV810:fxPlan,normalizeConcertFxV810:normalize}=load('components/visualizer/concertFxStudioV810');
const read=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
let passed=0;function check(label,fn){try{fn();passed++;console.log('PASS V991 '+label)}catch(e){e.message=`V991 ${label}: ${e.message}`;throw e}}
const opts=normalize({enabled:true,intensity:100,quality:'ultra',bassImpactV991:true,
 bassImpactStrengthV991:100,bassImpactStyleV991:'shockwave',bassImpactParticlesV991:true});
function make(patch={}){
 const settings=patch.settings??opts;
 const fx=fxPlan({settings,genre:patch.genre??'hardtekk',section:patch.section??'drop',
  progressMs:5000,startMs:0,endMs:10000,active:true,verified:true,playing:true,
  reactive:true,reducedMotion:false,authored:false,blackout:false,
  lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.93,
  kick:.88,bass:.90,mids:.65,highs:.70,ledBudget:1,laserBudget:1});
 return {fx,beat:{active:true,kick:.9,snareLike:.1,bass:.6,peak:.7,led:.4,
   laser:.2,particles:.3,foam:.2},settings,trackId:'song-A',positionMs:5000,
   durationMs:10000,playing:true,reducedMotion:false,tier:'high',budget:1,
   performanceGain:1,manualLighting:false,manualFx:false,blackout:false,
   lyricsProtected:false,lyricsVisible:false,vocalFocus:false,groupCount:1,...patch};
}
function fire(base=make()){
 const st=state();
 plan({...base,beat:{...base.beat,active:false,kick:0},positionMs:4950},st);
 const pulse=plan(base,st);return {st,pulse};
}
check('opt-in off and saved preferences validated',()=>{
 assert.equal(normalize({}).bassImpactV991,false);
 assert.equal(normalize({bassImpactV991:'true'}).bassImpactV991,false);
 assert.equal(normalize({bassImpactStrengthV991:Infinity}).bassImpactStrengthV991,65);
 assert.equal(normalize({bassImpactStrengthV991:-14}).bassImpactStrengthV991,0);
 assert.equal(normalize({bassImpactStrengthV991:150}).bassImpactStrengthV991,100);
 assert.equal(normalize({bassImpactStyleV991:'strobe'}).bassImpactStyleV991,'ripple');
 assert.equal(normalize({bassImpactParticlesV991:'true'}).bassImpactParticlesV991,true);
 assert(!fire(make({settings:normalize({})})).pulse.active);
});
check('measured V822 onset triggers one bounded, local floor wave',()=>{
 const {st,pulse}=fire();assert(pulse.active,pulse.reason);
 assert(pulse.power>0&&pulse.power<=.16&&pulse.floorPulse<=.07);
 assert.equal(pulse.style,1);assert(pulse.radius>=.11);
 assert(pulse.particleLift>=0&&pulse.particleLift<=.09);
 const second=plan(make({positionMs:5180}),st);
 assert(second.active&&second.radius>pulse.radius&&second.power<pulse.power);
 assert.equal(st.onsetMs,5000,'sustained kick must not retrigger');
});
check('disabled beat / no real measured transient never creates a pulse',()=>{
 const st=state(),i=make();
 for(const p of [4800,4950,5000,5200,5500]){
  const cue=plan({...i,positionMs:p,beat:{...i.beat,active:false,kick:0}},st);
  assert(!cue.active);
 }
 assert.equal(st.onsetMs,-1);
});
check('no fake drop, BPM or AI time: verified source and phase required',()=>{
 for(const fx of [{active:false},{reason:'estimated'},{reason:'fallback'},
  {phase:NaN},{phase:Infinity}]){
  const i=make();const {st}=fire(i);
  const x=plan({...i,positionMs:5050,fx:{...i.fx,...fx}},st);
  assert(!x.active,JSON.stringify(fx));
 }
});
check('no retrigger on continuous bass and re-arm on quiet-to-loud transition',()=>{
 const i=make(),{st}=fire(i);
 plan({...i,positionMs:5175},st);assert.equal(st.onsetMs,5000);
 plan({...i,positionMs:5480,beat:{...i.beat,active:false,kick:0}},st);
 const later=plan({...i,positionMs:5650},st);
 assert(later.active);assert.equal(st.onsetMs,5650);
});
check('new track, rewind and large jumps clear stale waves',()=>{
 const i=make();const {st}=fire(i);
 for(const v of [{positionMs:4000},{positionMs:7000},{trackId:'song-B'}]){
  const q=plan({...i,...v},st);assert(!q.active,JSON.stringify(v));
  assert.equal(st.onsetMs,-1);
  plan({...i,...v,beat:{...i.beat,active:false,kick:0}},st);
  plan({...i,...v,positionMs:v.positionMs??5000,beat:{...i.beat,active:false,kick:0}},st);
  plan({...i,positionMs:5000},st); // may return waiting, never use old song event
 }
});
check('pause, manual override, blackout, reduced motion, low tier block everything',()=>{
 for(const changed of [{playing:false},{manualLighting:true},{manualFx:true},
  {blackout:true},{reducedMotion:true},{tier:'low'},{groupCount:0},
  {settings:normalize({...opts,bassImpactStrengthV991:0})}]){
  const x=fire(make(changed)).pulse;
  assert(!x.active,JSON.stringify(changed));assert.equal(x.power,0);
 }
});
check('lyrics overlay cancels floor wave and portrait reduces strength',()=>{
 const normal=fire().pulse;
 assert(!fire(make({lyricsProtected:true})).pulse.active);
 assert(!fire(make({lyricsVisible:true})).pulse.active);
 const vocal=fire(make({vocalFocus:true})).pulse;
 const group=fire(make({groupCount:4})).pulse;
 assert(vocal.active&&vocal.power<normal.power);assert(group.active&&group.power<normal.power);
});
check('performance tiers, budget, style and config shape deterministically',()=>{
 const normal=fire().pulse;
 const balanced=fire(make({tier:'balanced'})).pulse;
 const budget=fire(make({budget:.3})).pulse;
 assert(balanced.power<normal.power);assert(budget.power<normal.power);
 for(const [style,n] of [['ripple',0],['shockwave',1],['subtle',2]]){
  assert.equal(fire(make({settings:normalize({...opts,bassImpactStyleV991:style})})).pulse.style,n);
 }
 assert.equal(fire(make({settings:normalize({...opts,bassImpactParticlesV991:false})})).pulse.particleLift,0);
});
check('10,000 pseudo-random runtime states stay finite and capped',()=>{
 for(let j=0;j<10000;j++){
  const i=make({genre:['hardtekk','rock','rap','pop','hardstyle'][j%5],
    section:['intro','verse','hook','build','drop','break','finale'][j%7],
    tier:j%11===0?'low':j%3===0?'balanced':'high',
    budget:(j%101)/100,groupCount:1+j%4,
    settings:normalize({...opts,bassImpactStrengthV991:j%101}),
    vocalFocus:j%7===0,lyricsVisible:j%13===0});
  const {st,pulse}=fire(i);
  const q=plan({...i,positionMs:5100+j%200},st);
  for(const cue of [pulse,q]){
   for(const k of ['power','radius','age','floorPulse','particleLift'])assert(Number.isFinite(cue[k]),k);
   assert(cue.power>=0&&cue.power<=.16);assert(cue.radius>=0&&cue.radius<=.92);
   assert(cue.floorPulse>=0&&cue.floorPulse<=.07);assert(cue.particleLift>=0&&cue.particleLift<=.09);
  }
 }
});
check('already-limited particles never spawn, overwrite disabled or authored rings',()=>{
 const impact=fire().pulse;
 const c={active:true,sparks:10,shards:10,confetti:10,rings:8,sparkOpacity:.11,
  shardOpacity:.11,confettiOpacity:.05,ringOpacity:.30,phase:5,beat:0,primary:'#fff',secondary:'#fff'};
 const x=enhance(c,impact,false);assert(x.ringOpacity<=.37&&x.ringOpacity>=.30);
 assert.equal(x.rings,8);assert.equal(x.sparks,10);assert.equal(x.shards,10);
 assert.equal(enhance(c,impact,true),c);
 assert.equal(enhance({...c,rings:0},impact,false).rings,0);
 assert.equal(enhance({...c,active:false},impact,false).active,false);
});
check('floor shader capped alpha and no flash, clock or texture samplers',()=>{
 for(const field of ['uPower','uRadius','uAge','uStyle','uColor'])assert(fragment.includes(field));
 assert(fragment.includes('clamp(uPower,0.0,.16)'));
 assert(fragment.includes('0.0,.14)'));
 assert(fragment.includes('if(alpha<.001)discard'));
 assert(!/uniform\s+sampler|uClock|uTime|strobe|fullscreen|flash/i.test(fragment));
 assert(vertex.includes('projectionMatrix*modelViewMatrix'));
});
check('stage UI, version, production checks and source syntax wired',()=>{
 const stage=read('components/visualizer/DynamicStage.tsx');
 for(const needle of ['planBassImpactV991({','enhanceBassImpactParticlesV991(',
   'bassImpactStateV991.current','v991-bass-impact-floor','BASS_IMPACT_FRAGMENT_V991',
   'uPower.value=bassImpactV991.power','playback.positionMs'])assert(stage.includes(needle),needle);
 const ui=read('components/visualizer/ConcertFxStudioPanelV810.tsx');
 for(const needle of ['V991 · Bass Impact Physics','bassImpactV991:e.target.checked',
  'bassImpactStyleV991:e.target.value','bassImpactStrengthV991:Number(e.target.value)',
  'bassImpactParticlesV991:e.target.checked'])assert(ui.includes(needle),needle);
 const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
 assert(Number(pkg.version.split('-v')[1])>=991);assert.equal(pkg.version,lock.version);
 assert.equal(lock.packages[''].version,pkg.version);assert(Number(pkg.sonicFeatureRelease.slice(1))>=991);
 assert(pkg.scripts.prebuild.includes('npm run test:v991 && npm run test:v991:types &&')); 
 assert(read('scripts/vercel-production-build.cjs').includes('V991 Bass Impact Physics'));
 assert(read('.github/workflows/v832-continuous-validation.yml').includes('V991 Bass Impact Physics'));
 assert(read('tests/tsconfig.v991-core.json').includes('bassImpactDirectorV991.ts'));
 const ts=require('./typescript-loader.cjs');
 for(const file of ['components/visualizer/bassImpactDirectorV991.ts',
  'components/visualizer/bassImpactShaderV991.ts','components/visualizer/DynamicStage.tsx',
  'components/visualizer/ConcertFxStudioPanelV810.tsx','components/visualizer/concertFxStudioV810.ts']){
  const out=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,compilerOptions:{
   target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});
  assert(!(out.diagnostics||[]).some(d=>d.category===ts.DiagnosticCategory.Error),file);
 }
});
check('no new timers, loops, external commands or side effect layers',()=>{
 for(const file of ['components/visualizer/bassImpactDirectorV991.ts',
   'components/visualizer/bassImpactShaderV991.ts']){
  const text=read(file);
  for(const forbidden of ['fetch(', 'useFrame(', 'setTimeout(', 'setInterval(',
    'requestAnimationFrame(', 'WebSocket(', 'new Mesh(', 'goveeBridgeRequest'])
    assert(!text.includes(forbidden),file+' '+forbidden);
 }
});
console.log('V991 Bass Impact Physics '+passed+' test groups passed.');
