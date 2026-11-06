#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planImmersiveConcertFxV1028:plan,mixImmersiveConcertFxV1028:mix,
 IMMERSIVE_OFF_V1028:OFF}=load('components/visualizer/immersiveConcertFxV1028');
const fx={active:true,reason:'music',section:'drop',phase:5};
const input={enabled:true,masterEnabled:true,strength:80,fx,
 positionMs:5000,startMs:0,endMs:10000,durationMs:50000,playing:true,
 reducedMotion:false,blackout:false,manualLighting:false,manualFx:false,
 seekBlocked:false,authoredLanes:[],lyricsProtected:false,lyricsVisible:false,
 vocalFocus:false,cameraCloseup:false,groupCount:2,tier:'high',energy:.88,kick:.86,
 budget:1,pressure:.10};
const get=(patch={})=>plan({...input,...patch});
const drop=get();assert(drop.active&&drop.reason==='verified'&&drop.act==='impact');
assert(drop.waveGain>.75&&drop.confettiGain>.75,'measured drop should retain hero effects');
const build=get({fx:{...fx,section:'build'}});assert(build.active&&build.act==='rising');
assert(build.fogGain>drop.fogGain,'build favours existing haze over competing lanes');
assert(build.sparkGain>build.confettiGain,'build prioritizes sparks');
const finale=get({fx:{...fx,section:'finale'}});assert(finale.act==='finale');
const verse=get({fx:{...fx,section:'verse'}});assert(verse.act==='portrait'&&verse.confettiGain<drop.confettiGain);
const breakCue=get({fx:{...fx,section:'break'}});assert(breakCue.act==='breath');
const noKick=get({kick:0});assert(noKick.active&&noKick.waveGain<drop.waveGain&&noKick.confettiGain<drop.confettiGain,
 'a verified section without measured kick must not trigger hero effects');
const stage={ringOpacity:.38,beamGain:1.1,confettiOpacity:0};
const particles={active:true,ringOpacity:.24,confettiOpacity:.37,sparkOpacity:.43,confetti:32,sparks:26};
const foam={active:true,opacity:.38,power:.72,bubbles:40};
const result=mix(build,stage,particles,foam);
assert.notEqual(result.stage,stage);assert.notEqual(result.particles,particles);
assert.deepEqual(stage,{ringOpacity:.38,beamGain:1.1,confettiOpacity:0},'no mutation');
assert(result.stage.ringOpacity<=stage.ringOpacity&&result.stage.beamGain<=stage.beamGain);
assert(result.particles.confettiOpacity<particles.confettiOpacity);
assert.equal(result.particles.confetti,32,'no new instances');assert.equal(result.particles.sparks,26);
assert(result.foam.opacity<=foam.opacity&&result.foam.power<=foam.power);
assert.deepEqual(mix(OFF,stage,particles,foam),{stage,particles,foam});
assert.equal(mix(build,stage,{...particles,active:false},foam).particles.active,false);
assert.equal(mix(build,stage,particles,{...foam,active:false}).foam.active,false);
for(const p of [drop,build,finale,verse,breakCue,noKick]){
 for(const k of ['waveGain','beamGain','fogGain','confettiGain','sparkGain','foamGain']){
  assert(Number.isFinite(p[k])&&p[k]>=0&&p[k]<=1,k);
 }
}
for(const [name,patch] of Object.entries({
 disabled:{enabled:false},master:{masterEnabled:false},paused:{playing:false},low:{tier:'low'},
 reduced:{reducedMotion:true},blackout:{blackout:true},manual:{manualLighting:true},
 manualFx:{manualFx:true},seek:{seekBlocked:true},authored:{authoredLanes:['particles']},
 lyrics:{lyricsProtected:true},visibleLyrics:{lyricsVisible:true},vocal:{vocalFocus:true},
 closeup:{cameraCloseup:true},noGroup:{groupCount:0},overGroup:{groupCount:5},
 unverified:{fx:{...fx,reason:'unverified'}},fake:{fx:{...fx,active:false}},
 wrongPhase:{fx:{...fx,phase:6}},phaseNan:{fx:{...fx,phase:NaN}},
 unknownSection:{fx:{...fx,section:'unknown'}},end:{positionMs:10000,fx:{...fx,phase:10}},
 wrongDuration:{durationMs:8000},wrongStart:{startMs:6000},noStrength:{strength:0},
 nanStrength:{strength:NaN},nanAudio:{energy:NaN},nanKick:{kick:Infinity},
 noBudget:{budget:0},nanBudget:{budget:NaN},pressure:{pressure:.9},
 })){const v=get(patch);assert.deepEqual(v,OFF,'reject '+name);}
assert.deepEqual(get({positionMs:0,fx:{...fx,phase:0}}),OFF,'no hard start');
const edge=get({positionMs:50,fx:{...fx,phase:.05}});
assert(edge.active&&edge.intensity<drop.intensity,'soft introduction');
const balance=get({tier:'balanced'});assert(balance.active&&balance.intensity<drop.intensity);
const raw=read('components/visualizer/immersiveConcertFxV1028.ts');
for(const forbidden of ['fetch(','localStorage','sessionStorage','setInterval(','setTimeout(',
 'requestAnimationFrame','window.','new SpotLight','new PointLight','new InstancedMesh',
 'goveeBridge','navigator.'])assert(!raw.includes(forbidden),forbidden);
const stageSource=read('components/visualizer/DynamicStage.tsx');
assert(stageSource.includes('const immersiveFxV1028=planImmersiveConcertFxV1028({'));
assert(stageSource.includes('const immersiveMixV1028=mixImmersiveConcertFxV1028('));
assert(stageSource.indexOf('const immersiveMixV1028=')>stageSource.indexOf('const particleMixV889='),
 'never bypass V889 particle governor');
assert(stageSource.includes('cinematicFogV887.floorOpacity*immersiveFxV1028.fogGain'));
assert(stageSource.includes('particlesCueV816.current=immersiveMixV1028.particles;'));
assert.equal((stageSource.match(/useFrame\(/g)||[]).length,1,'one existing R3F loop');
const settings=read('components/visualizer/concertFxStudioV810.ts');
assert(settings.includes('immersiveFxV1028:true,immersiveFxStrengthV1028:65'));
assert(settings.includes("typeof raw?.immersiveFxV1028==='boolean'"));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1028);
assert.equal(pkg.version,lock.version);assert.equal(pkg.sonicFeatureRelease,pkg.version.split('-')[1]);
assert.equal(pkg.sonicRoadmapRelease,pkg.version.split('-')[1]);
assert(pkg.scripts.prebuild.includes('npm run test:v1028 &&'));
assert(pkg.scripts.prebuild.startsWith(`npm run test:${pkg.sonicFeatureRelease} &&`),
 'the latest release must be the first prebuild gate');
for(const path of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(path).includes('tests/v1028-immersive-concert-fx-regression.cjs'),path);
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1028(root)'));
console.log('PASS V1028: synchronized post-budget stage FX, measured impact, safe fog/particle/foam choreography, all guards and CI');
