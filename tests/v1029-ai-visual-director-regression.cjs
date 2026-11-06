#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planAiVisualDirectorV1029:plan,mixAiVisualDirectorV1029:mix,
 VISUAL_DIRECTOR_OFF_V1029:OFF,VISUAL_LED_UNIFORMS_V1029:LED}=load('components/visualizer/aiVisualDirectorV1029');
const base={enabled:true,masterEnabled:true,strength:80,trackId:'track-1',durationMs:60000,
 positionMs:9500,playing:true,reactive:true,reducedMotion:false,tier:'high',
 narrative:{source:'verified-v600',trackId:'track-1',durationMs:60000,actIndex:1,
  section:'verse',startMs:5000,endMs:15000},
 cinematic:{active:true,reason:'verified-act',actIndex:1,intent:'portrait',blend:1},
 fx:{active:true,reason:'music',section:'verse',phase:9.5},groupCount:2,
 vocalFocus:true,focusSlot:0,partnerSlot:null,lyricsProtected:false,lyricsVisible:false,
 manualCamera:false,manualLighting:false,manualFx:false,authoredLanes:[],
 seekBlocked:false,blackout:false,energy:.65,kick:.67,budget:1,pressure:.1};
const get=(patch={})=>plan({...base,...patch});
const portrait=get();assert(portrait.active&&portrait.reason==='verified'&&portrait.scene==='portrait');
assert(portrait.ledGain<.8&&portrait.particleGain<portrait.fogGain,'singer priority');
const duet=get({partnerSlot:1,cinematic:{...base.cinematic,intent:'dialogue'}});
assert(duet.active&&duet.scene==='duet'&&duet.ledGain>portrait.ledGain);
const ensemble=get({vocalFocus:false,cinematic:{...base.cinematic,intent:'ensemble'}});
assert(ensemble.active&&ensemble.scene==='ensemble');
const rising=get({narrative:{...base.narrative,section:'build'},
 cinematic:{...base.cinematic,intent:'rise'},fx:{...base.fx,section:'build'}});
assert(rising.active&&rising.scene==='rising'&&rising.fogGain>rising.particleGain);
const hook=get({narrative:{...base.narrative,section:'hook'},
 cinematic:{...base.cinematic,intent:'wide'},fx:{...base.fx,section:'hook'},vocalFocus:false});
assert(hook.active&&hook.scene==='impact'&&hook.ledGain===1&&hook.particleGain===1);
const quietHook=get({...hook,narrative:{...base.narrative,section:'hook'},
 cinematic:{...base.cinematic,intent:'wide'},fx:{...base.fx,section:'hook'},kick:0,vocalFocus:false});
assert(quietHook.active&&quietHook.scene!=='impact'&&quietHook.particleGain<1,
 'a hook with no measured kick cannot become a new drop');
const breakCue=get({narrative:{...base.narrative,section:'break'},
 cinematic:{...base.cinematic,intent:'breath'},fx:{...base.fx,section:'break'}});
// V761 owns the genuine 'breath' camera intent; guard must accept it.
assert(breakCue.active&&breakCue.scene==='breath');
const lyrics=get({lyricsVisible:true});assert(lyrics.active&&lyrics.ledGain<portrait.ledGain&&
 lyrics.fogGain<=portrait.fogGain&&lyrics.particleGain<portrait.particleGain);
const edge=get({positionMs:5200,fx:{...base.fx,phase:5.2}});
assert(edge.active&&edge.strength<portrait.strength&&edge.ledGain>portrait.ledGain);
const balanced=get({tier:'balanced'});
assert(balanced.active&&balanced.strength<portrait.strength&&balanced.ledGain>portrait.ledGain);
const source={ringOpacity:.45,beamGain:1.2,kind:'original'};
const particles={active:true,ringOpacity:.3,confettiOpacity:.4,sparkOpacity:.5,count:47};
const foam={active:true,opacity:.75,power:.64,bubbles:20};
const composed=mix(portrait,source,particles,foam);
assert.notStrictEqual(composed.stage,source);assert.notStrictEqual(composed.particles,particles);
assert(composed.stage.beamGain<source.beamGain);
assert(composed.particles.confettiOpacity<particles.confettiOpacity);
assert(composed.foam.power<=foam.power);
assert.equal(composed.particles.count,47);assert.equal(composed.foam.bubbles,20);
assert.deepEqual(source,{ringOpacity:.45,beamGain:1.2,kind:'original'});
assert.deepEqual(mix(OFF,source,particles,foam),{stage:source,particles,foam});
assert.equal(mix(portrait,source,{...particles,active:false},foam).particles.active,false);
for(const k of ['ledGain','fogGain','particleGain','beamGain'])for(const p of
 [portrait,duet,ensemble,rising,hook,quietHook,breakCue,lyrics,edge,balanced]){
 assert(Number.isFinite(p[k])&&p[k]>0&&p[k]<=1,k);
}
for(const [name,patch] of Object.entries({
 disabled:{enabled:false},master:{masterEnabled:false},zero:{strength:0},
 paused:{playing:false},notReactive:{reactive:false},low:{tier:'low'},
 reduced:{reducedMotion:true},manualCamera:{manualCamera:true},
 manualLighting:{manualLighting:true},manualFx:{manualFx:true},
 authoredLed:{authoredLanes:['led']},authoredParticles:{authoredLanes:['particles']},
 seek:{seekBlocked:true},blackout:{blackout:true},
 noAct:{narrative:null},badAct:{narrative:{...base.narrative,source:'unavailable'}},
 badTrack:{trackId:'other'},badDuration:{narrative:{...base.narrative,durationMs:61000}},
 stale:{positionMs:18000,fx:{...base.fx,phase:18}},
 mismatch:{cinematic:{...base.cinematic,actIndex:0}},badCamera:{cinematic:{...base.cinematic,reason:'off'}},
 badFX:{fx:{...base.fx,reason:'unverified'}},badPhase:{fx:{...base.fx,phase:7}},
 badSection:{fx:{...base.fx,section:'hook'}},unknown:{narrative:{...base.narrative,section:'intro'},fx:{...base.fx,section:'intro'}},
 noSinger:{groupCount:0},unbounded:{groupCount:5},badIndex:{narrative:{...base.narrative,actIndex:2.1}},
 noBudget:{budget:0},nanBudget:{budget:NaN},pressure:{pressure:.9},
 nanPressure:{pressure:Infinity},nanEnergy:{energy:NaN},noStrength:{strength:NaN},
 fadeStart:{positionMs:5000,fx:{...base.fx,phase:5}},
 })){const value=get(patch);assert.equal(value.active,false,'must reject '+name);
 assert.deepEqual({led:value.ledGain,fog:value.fogGain,particles:value.particleGain,beam:value.beamGain},
  {led:1,fog:1,particles:1,beam:1},'no protected changes '+name);}
assert(LED.length===7&&LED.every(x=>x.startsWith('uLed')||x==='uFxPower'));
const raw=read('components/visualizer/aiVisualDirectorV1029.ts');
for(const forbidden of ['fetch(','localStorage','sessionStorage','setInterval(','setTimeout(',
 'requestAnimationFrame','window.','new SpotLight','new PointLight','new InstancedMesh',
 'goveeBridge','navigator.'])assert(!raw.includes(forbidden),forbidden);
const stage=read('components/visualizer/DynamicStage.tsx');
assert(stage.includes('const visualDirectorV1029=planAiVisualDirectorV1029({'));
assert(stage.includes('const visualMixV1029=mixAiVisualDirectorV1029('));
assert(stage.indexOf('const visualMixV1029=')>stage.indexOf('const immersiveMixV1028='));
assert(stage.includes('cinematicFogV887.floorOpacity*immersiveFxV1028.fogGain*visualDirectorV1029.fogGain'));
assert(stage.includes('for(const uniform of VISUAL_LED_UNIFORMS_V1029)'));
assert(stage.includes('visualDirectorV1029.beamGain'));
assert.equal((stage.match(/useFrame\(/g)||[]).length,1);
const settings=read('components/visualizer/concertFxStudioV810.ts');
assert(settings.includes('aiVisualDirectorV1029:true,aiVisualDirectorStrengthV1029:70'));
assert(settings.includes("typeof raw?.aiVisualDirectorV1029==='boolean'"));
assert(read('components/visualizer/ConcertFxStudioPanelV810.tsx').includes('AI Visual Director 5.0'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert.equal(pkg.version,'0.1.0-v1029');assert.equal(lock.version,pkg.version);
assert.equal(lock.packages[''].version,pkg.version);
assert.equal(pkg.sonicFeatureRelease,'v1029');assert.equal(pkg.sonicRoadmapRelease,'v1029');
assert(pkg.scripts.prebuild.startsWith('npm run test:v1029 &&'));
for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(f).includes('tests/v1029-ai-visual-director-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1029(root)'));
console.log('PASS V1029: confirmed song and camera evidence, scene hierarchy, lyrics, performers, resource caps, manual and seek guards');
