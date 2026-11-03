'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {focusForActV850:focus,planSmartFestivalShowV850:plan}=load('components/visualizer/smartFestivalShowDirectorV850');
const {planConcertFxV810:fxPlan,normalizeConcertFxV810:normalize}=load('components/visualizer/concertFxStudioV810');
let checks=0;
const check=(label,fn)=>{try{fn();checks++;}catch(error){error.message=`V866 ${label}: ${error.message}`;throw error;}};
const genres=['rap','hardtekk','hardstyle','rock','pop','neutral'];
const sections=['intro','verse','hook','build','drop','break','finale'];
const settings=normalize({enabled:true,intensity:100,quality:'ultra',festivalDirectorV850:true,festivalDirectorStrengthV850:80,festivalDirectorStyleV850:'balanced'});
function cue(genre,section,actIndex=3){
 const fx=fxPlan({settings,genre,section,progressMs:5000,startMs:0,endMs:10000,
  active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,
  blackout:false,lyricsProtected:false,vocalFocus:false,groupCount:2,tier:'high',
  energy:.85,kick:.9,bass:.8,mids:.65,highs:.7,ledBudget:1,laserBudget:1});
 return {settings,fx,trackId:'v866-song',actIndex,actStartMs:0,actEndMs:10000,progressMs:5000,
  playing:true,reactive:true,reducedMotion:false,manualLighting:false,blackout:false,
  lyricsProtected:false,vocalFocus:false,groupCount:2,tier:'high',budget:1,authoredLanes:[]};
}
check('legacy three-argument neutral focus unchanged',()=>{
 for(const section of sections)for(let n=0;n<5;n++)
  assert.deepEqual(focus('song',n,section),focus('song',n,section,'neutral'));
});
for(const genre of genres)for(const section of sections){
 const input=cue(genre,section);
 const original=JSON.stringify(input);
 const result=plan(input);
 check(`${genre}/${section} verified genre-sensitive plan`,()=>{
  assert.equal(result.active,true);
  assert.equal(result.reason,'music');
  assert.equal(result.section,section);
  assert.equal(JSON.stringify(input),original,'source input mutated');
  assert.deepEqual(result,plan(input),'not seek-stable/deterministic');
  assert(Object.values(result.gains).every(g=>Number.isFinite(g)&&g>=0&&g<=1));
  assert(result.sceneLabel.includes(section==='verse'?'Strophe':section==='intro'?'Auftakt':section==='break'?'Ruhepunkt':section==='build'?'Spannungsaufbau':section==='hook'?'Hook':section==='finale'?'Finale':'Drop'));
 });
 check(`${genre}/${section} planning follows genre focus`,()=>{
  assert.equal(result.focus,focus(input.trackId,input.actIndex,section,input.fx.genre).focus);
 });
 check(`${genre}/${section} manual controls remain authoritative`,()=>{
  const locked=plan({...input,authoredLanes:['laser','led','particles','foam','transition']});
  assert.equal(locked.gains.laser,1);assert.equal(locked.gains.led,1);
  assert.equal(locked.gains.particles,1);assert.equal(locked.gains.foam,1);
  assert.equal(locked.gains.transition,1);
 });
 check(`${genre}/${section} refuses unverified audio`,()=>{
  const locked=plan({...input,fx:{...input.fx,reason:'unverified'}});
  assert.equal(locked.active,false);
  assert(Object.values(locked.gains).every(g=>g===1));
 });
 check(`${genre}/${section} reduced motion and blackout protected`,()=>{
  for(const patch of [{reducedMotion:true},{blackout:true},{manualLighting:true}]){
   const locked=plan({...input,...patch});
   assert.equal(locked.active,false);
   assert(Object.values(locked.gains).every(g=>g===1));
  }
 });
}
check('Deutschrap verse prioritizes vocals regardless of variation',()=>{
 for(let act=0;act<18;act++)assert.equal(focus('song',act,'verse','rap').focus,'vocals');
});
check('Hardtekk verified drops rotate laser, particles and LED',()=>{
 const f=new Set([0,1,2].map(n=>focus('track',n,'drop','hardtekk').focus));
 assert.deepEqual(f,new Set(['laser','particles','led']));
});
check('Rock hooks rotate vocal, LED and particles',()=>{
 const f=new Set([0,1,2].map(n=>focus('track',n,'hook','rock').focus));
 assert.deepEqual(f,new Set(['vocals','led','particles']));
});
check('No synthetic FX during breaks/intros',()=>{
 for(const genre of genres)for(const section of ['intro','break'])
 assert.equal(focus('x',4,section,genre).focus,'rest');
});
check('Lyrics and vocals suppress automatic glare',()=>{
 const input=cue('rap','hook');
 const ordinary=plan(input),safe=plan({...input,lyricsProtected:true,vocalFocus:true});
 for(const lane of ['laser','festival','particles'])assert(safe.gains[lane]<=ordinary.gains[lane]);
});
check('Source retains the existing V850 director and authored lane protections',()=>{
 const src=fs.readFileSync('components/visualizer/smartFestivalShowDirectorV850.ts','utf8');
 assert(src.includes('genreRotationV866'));
 assert(src.includes('i.authoredLanes?.includes'));
 assert(!src.includes('Math.random(')&&!src.includes('setInterval(')&&!src.includes('useFrame('));
});
check('DynamicStage still consumes original V850 output',()=>{
 const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 assert(stage.includes('planSmartFestivalShowV850'));
 assert(stage.includes('festivalShowV850.gains.laser'));
 assert(stage.includes('festivalShowV850.gains.festival'));
});
check('V866 remains in all release and build regression gates',()=>{
 const pkg=require('../package.json');
 const lock=require('../package-lock.json');
 assert.equal(pkg.version,lock.version);
 assert.equal(pkg.version,lock.packages[''].version);
 for(const name of ['check:fast','check:release','build:preflight'])
  assert(pkg.scripts[name].includes('npm run test:v866 && npm run test:v866:types && npm run test:v865'),
   `${name} must retain V866 before V865 (allowing newer V869+ gates)`);
 assert(pkg.scripts['test:smoke:v665:flat'].includes('run-npm-chain-flat'));
});
console.log(`PASS V866: ${checks} deterministic genre-show variety and safety groups`);
