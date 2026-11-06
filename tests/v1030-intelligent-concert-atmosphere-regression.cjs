#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planIntelligentConcertAtmosphereV1030:plan,
 applyConcertAtmosphereCrowdV1030:applyCrowd,
 applyConcertAtmosphereStageV1030:applyStage,
 ATMOSPHERE_OFF_V1030:OFF}=load('components/visualizer/intelligentConcertAtmosphereV1030');
const base={enabled:true,masterEnabled:true,strength:80,trackId:'track-1030',
 durationMs:60000,positionMs:9500,playing:true,reactive:true,reducedMotion:false,tier:'high',
 narrative:{source:'verified-v600',trackId:'track-1030',durationMs:60000,
  actIndex:2,section:'verse',startMs:5000,endMs:15000},
 cinematic:{active:true,reason:'verified-act',actIndex:2,intent:'portrait',blend:1},
 fx:{active:true,reason:'music',section:'verse',phase:9.5},groupCount:2,vocalFocus:true,
 lyricsProtected:false,lyricsVisible:false,manualCamera:false,manualLighting:false,
 manualFx:false,authoredLanes:[],seekBlocked:false,blackout:false,
 energy:.64,kick:.71,budget:1,pressure:.1};
const get=(patch={})=>plan({...base,...patch});
const portrait=get();assert(portrait.active&&portrait.scene==='intimate'&&portrait.reason==='verified');
assert(portrait.crowdMovementGain<1&&portrait.crowdLightGain<1&&portrait.ambientGain<1);
assert(portrait.hazeGain<1&&portrait.beamGain<1&&portrait.fillColorBlend>.001);
const duet=get({cinematic:{...base.cinematic,intent:'dialogue'}});
assert(duet.active&&duet.scene==='together'&&duet.crowdLightGain>portrait.crowdLightGain);
const build=get({narrative:{...base.narrative,section:'build'},
 cinematic:{...base.cinematic,intent:'rise'},fx:{...base.fx,section:'build'}});
assert(build.active&&build.scene==='rising'&&build.hazeGain>portrait.hazeGain);
const impact=get({narrative:{...base.narrative,section:'drop'},
 cinematic:{...base.cinematic,intent:'wide'},fx:{...base.fx,section:'drop'},
 vocalFocus:false,energy:.86,kick:.91});
assert(impact.active&&impact.scene==='celebration'&&impact.crowdMovementGain===1);
const noKick=get({narrative:{...base.narrative,section:'drop'},
 cinematic:{...base.cinematic,intent:'wide'},fx:{...base.fx,section:'drop'},kick:0});
assert(noKick.active&&noKick.scene!=='celebration','never claim a bass hit from a section label');
const breath=get({narrative:{...base.narrative,section:'break'},
 cinematic:{...base.cinematic,intent:'breath'},fx:{...base.fx,section:'break'}});
assert(breath.active&&breath.scene==='breath'&&breath.crowdMovementGain<portrait.crowdMovementGain);
const lyric=get({lyricsVisible:true});
assert(lyric.active&&lyric.hazeGain<portrait.hazeGain&&lyric.crowdPhoneGain<portrait.crowdPhoneGain);
const balanced=get({tier:'balanced'});
assert(balanced.active&&balanced.strength<portrait.strength&&balanced.hazeGain>portrait.hazeGain);
const nearEdge=get({positionMs:5150,fx:{...base.fx,phase:5.15}});
assert(nearEdge.active&&nearEdge.strength<portrait.strength);
const crowd={active:true,count:61,movement:.22,phoneOpacity:.18,lightGain:.12,primary:'#ffccaa'};
const dimmed=applyCrowd(crowd,portrait);
assert.notEqual(dimmed,crowd);
assert.equal(dimmed.count,61);assert.equal(dimmed.primary,crowd.primary);
assert(dimmed.movement<crowd.movement&&dimmed.phoneOpacity<crowd.phoneOpacity);
assert.deepEqual(crowd,{active:true,count:61,movement:.22,phoneOpacity:.18,lightGain:.12,primary:'#ffccaa'});
assert.equal(applyCrowd({...crowd,active:false},portrait).active,false);
assert.strictEqual(applyCrowd(crowd,OFF),crowd);
const stage={beamGain:.9,ringOpacity:.4};
assert(applyStage(stage,portrait).beamGain<stage.beamGain);
assert.equal(applyStage(stage,portrait).ringOpacity,stage.ringOpacity);
assert.strictEqual(applyStage(stage,OFF),stage);
for(const c of [portrait,duet,build,impact,noKick,breath,lyric,balanced,nearEdge]){
 for(const key of ['crowdMovementGain','crowdPhoneGain','crowdLightGain','hazeGain','ambientGain','beamGain'])
  assert(Number.isFinite(c[key])&&c[key]>0&&c[key]<=1,key);
 assert(c.fillColorBlend>=0&&c.fillColorBlend<.05);
}
for(const [name,patch] of Object.entries({
 disabled:{enabled:false},master:{masterEnabled:false},zero:{strength:0},
 paused:{playing:false},noReactivity:{reactive:false},reduced:{reducedMotion:true},
 low:{tier:'low'},manualCamera:{manualCamera:true},manualLight:{manualLighting:true},
 manualFx:{manualFx:true},authoredLed:{authoredLanes:['led']},
 authoredCrowd:{authoredLanes:['crowd']},seek:{seekBlocked:true},blackout:{blackout:true},
 missingNarrative:{narrative:null},unverified:{narrative:{...base.narrative,source:'unknown'}},
 wrongTrack:{trackId:'other'},wrongDuration:{durationMs:63000},
 wrongAct:{cinematic:{...base.cinematic,actIndex:3}},badCinematic:{cinematic:null},
 badCameraReason:{cinematic:{...base.cinematic,reason:'synthetic'}},
 wrongSection:{fx:{...base.fx,section:'hook'}},wrongFx:{fx:{...base.fx,reason:'synthesized'}},
 staleClock:{fx:{...base.fx,phase:9.2}},noTime:{positionMs:18000},
 noGroup:{groupCount:0},fiveSingers:{groupCount:5},
 badAudio:{energy:NaN},badKick:{kick:Infinity},budget:{budget:0},
 pressure:{pressure:.95},badPressure:{pressure:NaN},badStrength:{strength:Infinity},
 excessiveStrength:{strength:150},badDuration:{durationMs:0},
 edge:{positionMs:5000,fx:{...base.fx,phase:5}},
 })){const value=get(patch);
 assert.equal(value.active,false,'must disable '+name);
 for(const k of ['crowdMovementGain','crowdPhoneGain','crowdLightGain','hazeGain','ambientGain','beamGain'])
  assert.equal(value[k],1,'no visual modification '+name+':'+k);
 assert.equal(value.fillColorBlend,0,'no light tint on '+name);
 assert.strictEqual(applyCrowd(crowd,value),crowd);
 assert.strictEqual(applyStage(stage,value),stage);
}
const source=read('components/visualizer/intelligentConcertAtmosphereV1030.ts');
for(const forbidden of ['fetch(','localStorage','sessionStorage','setInterval(','setTimeout(',
 'requestAnimationFrame','window.','new SpotLight','new PointLight','new InstancedMesh',
 'goveeBridge','navigator.'])assert(!source.includes(forbidden),forbidden);
const scene=read('components/visualizer/DynamicStage.tsx');
assert.equal((scene.match(/useFrame\(/g)||[]).length,1);
assert(scene.includes('const concertAtmosphereV1030=planIntelligentConcertAtmosphereV1030({'));
assert(scene.indexOf('const concertAtmosphereV1030=')>scene.indexOf('const visualDirectorV1029='));
assert(scene.includes('applyConcertAtmosphereCrowdV1030(crowdCueV815.current,concertAtmosphereV1030)'));
assert(scene.indexOf('applyConcertAtmosphereCrowdV1030(')>scene.indexOf('crowdCueV815.current=limitCrowdV999('));
assert(scene.includes('applyConcertAtmosphereStageV1030(liveStageV882.current,concertAtmosphereV1030)'));
assert(scene.includes('concertAtmosphereV1030.hazeGain'));
assert(scene.includes('liveAtmosphereV885.environmentMix*concertAtmosphereV1030.ambientGain'));
assert(scene.includes('targetSecondary.current.lerp(targetPrimary.current,concertAtmosphereV1030.fillColorBlend)'));
const settings=read('components/visualizer/concertFxStudioV810.ts');
assert(settings.includes('intelligentAtmosphereV1030:true,atmosphereStrengthV1030:65'));
assert(settings.includes("typeof raw?.intelligentAtmosphereV1030==='boolean'"));
assert(read('components/visualizer/ConcertFxStudioPanelV810.tsx').includes('Intelligent Concert Atmosphere 5.0'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert.equal(pkg.version,'0.1.0-v1030');assert.equal(lock.version,pkg.version);
assert.equal(lock.packages[''].version,pkg.version);
assert.equal(pkg.sonicFeatureRelease,'v1030');assert.equal(pkg.sonicRoadmapRelease,'v1030');
assert(pkg.scripts.prebuild.startsWith('npm run test:v1030 &&'));
for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(f).includes('tests/v1030-intelligent-concert-atmosphere-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1030(root)'));
console.log('PASS V1030: song evidence, atmosphere moods, audience no-growth, light/lyrics safety, performance, blackouts and manual priority');
