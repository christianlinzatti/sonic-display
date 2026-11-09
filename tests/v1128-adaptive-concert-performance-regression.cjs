#!/usr/bin/env node
'use strict';
/** V1128: real frame telemetry, bounded FX factor parity and pause/manual guards. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1128-'));
const check=(name,fn)=>{fn();console.log('PASS V1128 '+name);};
try{
 const compiler=(()=>{try{return require.resolve('typescript/bin/tsc')}catch{return '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/bin/tsc'}})();
 assert(fs.existsSync(compiler),'TypeScript compiler unavailable: install devDependencies');
 fs.mkdirSync(path.join(tmp,'types'),{recursive:true});
 const run=spawnSync(process.execPath,[compiler,'--typeRoots',path.join(tmp,'types'),'-p',
  path.join(root,'tests/tsconfig.v1128-core.json'),'--noEmit','false',
  '--module','commonjs','--moduleResolution','node','--outDir',tmp],
  {cwd:root,encoding:'utf8',timeout:90000,windowsHide:true});
 assert.equal(run.status,0,run.stdout+'\n'+run.stderr+'\n'+(run.error?.message||''));
 const {initialConcertFxBudgetV1128,stepConcertFxBudgetV1128,concertFxFactorsV1128,INITIAL_CONCERT_FX_V1128}=require(path.join(tmp,'lib/adaptiveConcertPerformanceV1128.js'));
 const valid={fps:38,p95Ms:34,slowRatio:.31,elapsed:1,samples:40,playing:true,visible:true,transitioning:false,auto:true};
 const good={...valid,fps:60,p95Ms:17,slowRatio:.02,samples:60};
 const step=(state,window=valid)=>stepConcertFxBudgetV1128(state,window);
 const many=(start,n,window)=>Array.from({length:n}).reduce(s=>step(s,window),start);
 check('three sustained bad windows downshift, never after one spike',()=>{
  const original=initialConcertFxBudgetV1128();
  assert.equal(step(original).level,'full');assert.equal(many(original,2,valid).level,'full');
  const down=many(original,3,valid);assert.equal(down.level,'balanced');assert.equal(down.holdSeconds,8);
  assert.equal(many(down,4,valid).level,'balanced');assert.equal(many(down,8,valid).level,'economy');
  assert.equal(many(many(down,8,valid),20,valid).level,'economy');
 });
 check('seven good windows and cooldown restore progressively and never exceed full',()=>{
  let state=many(initialConcertFxBudgetV1128(),14,valid);
  assert.equal(state.level,'economy');
  assert.equal(many(state,4,good).level,'economy'); // hold still active
  state=many(state,7,good);assert.equal(state.level,'balanced');
  state=many(state,8,good);assert.equal(state.level,'full');
  assert.equal(many(state,20,good).level,'full');
 });
 check('30 and 45 FPS targets use per-profile thresholds, not fixed 60 FPS criteria',()=>{
  for(const targetFps of [30,45]){
   const stable={...good,targetFps,fps:targetFps,p95Ms:1000/targetFps,slowRatio:targetFps===30?1:.02,samples:targetFps};
   assert.equal(many(initialConcertFxBudgetV1128(),30,stable).level,'full');
   const overloaded={...stable,fps:targetFps*.65,p95Ms:2200/targetFps};
   assert.equal(many(initialConcertFxBudgetV1128(),3,overloaded).level,'balanced');
  }
 });
 check('alternating noisy FPS never causes oscillating levels',()=>{
  let state=initialConcertFxBudgetV1128();
  for(let i=0;i<300;i++)state=step(state,i%2===0?valid:good);
  assert.equal(state.level,'full');
 });
 check('manual, pause, hidden tab revert temporary FX changes without changing user settings',()=>{
  const active=many(initialConcertFxBudgetV1128(),3,valid);assert.equal(active.level,'balanced');
  for(const changed of [{auto:false},{playing:false},{visible:false}]){
   assert.strictEqual(step(active,{...valid,...changed}),INITIAL_CONCERT_FX_V1128);
  }
  assert.equal(step(active,{...valid,transitioning:true}).level,'balanced');
  assert.equal(step(active,{...valid,transitioning:true}).badWindows,0);
 });
 check('invalid or insufficient data never turns a single observation into evidence',()=>{
  for(const changed of [{fps:NaN},{p95Ms:Infinity},{slowRatio:-1},{samples:3},
   {fps:0},{fps:300},{elapsed:.1},{elapsed:12},{p95Ms:260},{slowRatio:2}]){
   assert.equal(many(initialConcertFxBudgetV1128(),20,{...valid,...changed}).level,'full',JSON.stringify(changed));
  }
 });
 check('256 sample configurations and strict monotonic optional effect budgets',()=>{
  let n=0;for(const fps of [25,35,45,59])for(const p95Ms of [11,20,32,45])
  for(const slowRatio of [0,.1,.2,.5])for(const elapsed of [.75,1,1.2,1.8]){
   const state=step(initialConcertFxBudgetV1128(),{...valid,fps,p95Ms,slowRatio,elapsed,samples:Math.max(15,Math.ceil(fps*elapsed))});
   assert(['full','balanced','economy'].includes(state.level));assert.equal(state.samples,1);n++;
  }assert.equal(n,256);
  const a=concertFxFactorsV1128('full'),b=concertFxFactorsV1128('balanced'),c=concertFxFactorsV1128('economy');
  for(const k of ['crowdTick','ledTick','fogTick','laserTick'])assert(a[k]===1&&b[k]>a[k]&&c[k]>b[k]);
  assert(a.fogOpacity===1&&b.fogOpacity<a.fogOpacity&&c.fogOpacity<b.fogOpacity);
 });
 check('integration uses one measured R3F window; no extra frame clock or hardware calls',()=>{
  const controller=fs.readFileSync(path.join(root,'components/visualizer/adaptivePerformance.tsx'),'utf8');
  assert(controller.includes('stepConcertFxBudgetV1128(concertFxV1128.current'));
  assert(controller.includes('samples:sorted.length'));
  assert(controller.includes('transitioning:transitioningV640'));
  assert(controller.includes('targetFps:displaySettingsV835.targetFps')); 
  assert(controller.includes('V1128 adaptive concert FX status'));
  const store=fs.readFileSync(path.join(root,'components/visualizer/concertFxBudgetStoreV1128.ts'),'utf8');
  for(const prohibited of ['requestAnimationFrame(', 'setInterval(', 'fetch(', 'localStorage.', 'WebSocket('])
   assert(!store.includes(prohibited));
  for(const [pathName,key] of [['ArenaAudienceV1032.tsx','crowdTick'],['ArenaLedWallV1059.tsx','ledTick'],
   ['ArenaLowFogV1036.tsx','fogTick'],['ArenaLaserFansV1036.tsx','laserTick']]){
   const src=fs.readFileSync(path.join(root,'components/visualizer/stages',pathName),'utf8');
   assert(src.includes('getConcertFxBudgetV1128().level'),pathName);
   assert(src.includes(`.level).${key}`),pathName);
  }
  const fog=fs.readFileSync(path.join(root,'components/visualizer/stages/ArenaLowFogV1036.tsx'),'utf8');
  assert(fog.includes('cue.fog*.2*gain)*fogSafetyV1128'));
  assert(fog.includes('cue.fog*.12*gain)*fogSafetyV1128'));
 });
 check('release metadata, main documentation, CI and browser coverage are present',()=>{
  const pkg=require(path.join(root,'package.json'));
  assert.match(pkg.version,/^0\.1\.0-v\d+$/);assert(Number(pkg.sonicFeatureRelease.slice(1))>=1128);
  assert(Number(pkg.sonicRoadmapRelease.slice(1))>=1128);assert(pkg.scripts.prebuild.startsWith('npm run test:v1128 && npm run test:v1128:types'));
  assert(fs.existsSync(path.join(root,'tests/e2e/adaptive-concert-performance-v1128.spec.cjs')));
  assert(fs.readFileSync(path.join(root,'ARCHITECTURE.md'),'utf8').includes('**Dokumentationsstand:** V1128'));
 });
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
