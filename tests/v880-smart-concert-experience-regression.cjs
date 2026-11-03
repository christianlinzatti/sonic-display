'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planSmartConcertExperienceV880:plan,
 applyConcertArcCrowdV880:applyCrowd,applyConcertArcParticlesV880:applyParticles,
 applyConcertArcFestivalV880:applyFestival,applyConcertArcFoamV880:applyFoam,
 concertArcLaneGainV880:laneGain}=load('components/visualizer/smartConcertExperienceV880');
const {normalizeConcertFxV810:normalize}=load('components/visualizer/concertFxStudioV810');
const {planVirtualConcertCrowdV815:crowd}=load('components/visualizer/virtualConcertCrowdPlannerV815');
const {planIntelligentAudienceV874:arms}=load('components/visualizer/intelligentAudienceExperienceV874');
const {planSmartFestivalAtmosphereV875:festival}=load('components/visualizer/smartFestivalAtmosphereV875');
const {planDynamicFestivalCrowdChoreographyV876:choreo}=load('components/visualizer/dynamicFestivalCrowdChoreographyV876');
const {planIntelligentCrowdInteractionV877:interact}=load('components/visualizer/intelligentCrowdInteractionV877');
const {planSmartAudienceEmotionV878:emotion}=load('components/visualizer/smartAudienceEmotionDirectorV878');
const {planCrowdCameraStageHarmonyV879:harmony}=load('components/visualizer/crowdCameraStageHarmonyV879');
const {planReactiveParticlesV816:particles}=load('components/visualizer/reactiveParticlePlannerV816');
const {planFestivalSpecialFxV844:special}=load('components/visualizer/festivalSpecialFxPlannerV844');
const {planFoamCannonV817:foam}=load('components/visualizer/foamCannonPlannerV817');
const s=normalize({quality:'ultra',intensity:100,crowdIntensity:100,crowdDensity:'arena',
 smartConcertStrengthV880:100,smartConcertStyleV880:'festival',
 festivalAtmosphereStrengthV875:100,crowdChoreographyStrengthV876:100,
 crowdInteractionStrengthV877:100,crowdEmotionStrengthV878:100});
const fx={active:true,reason:'music',genre:'hardtekk',section:'drop',phase:8,
 primary:'#23fff1',secondary:'#f326b8'};
const common={fx,settings:s,tier:'high',energy:.92,kick:.95,
 lyricsProtected:false,vocalFocus:false,reducedMotion:false};
const b=crowd({...common,groupCount:2,crowdBudget:1});
const a=arms({...common,base:b});
const f=festival({...common,base:a,playing:true,manualLighting:false,blackout:false});
const ch=choreo({...common,base:f,playing:true,manualLighting:false,blackout:false});
const it=interact({...common,base:ch,playing:true,manualLighting:false,blackout:false,
 groupCount:2,focusSlot:0,focusVerified:true,lyrics:null,lyricsVisible:false,progressMs:1000});
const em=emotion({...common,base:it,playing:true,manualLighting:false,blackout:false,
 previous:null,trackId:'song-A',positionMs:1000});
const cb=harmony({base:em.cue,settings:s,verifiedCamera:true,cameraIntent:'portrait',
 manualCamera:false,lyricsVisible:false,lyricsProtected:false,vocalFocus:false,
 performerVerified:false,groupCount:2,transitionActive:false,transitionProximity:0,
 playing:true,blackout:false,manualLighting:false,reducedMotion:false,tier:'high'});
const pb=particles({...common,groupCount:2,bass:.86,highs:.61,particleBudget:1});
const fb=special({...common,groupCount:2,playing:true,manualLighting:false,blackout:false,
 particleBudget:1,foamBudget:1,timelineGain:1,performanceGain:1});
const foamBase=foam({...common,groupCount:2,foamBudget:1});
const input={settings:s,fx,previous:null,trackId:'song-A',positionMs:24000,
 durationMs:180000,energy:.92,kick:.95,cameraVerified:true,cameraIntent:'wide',
 manualCamera:false,lyricsProtected:false,vocalFocus:false,groupCount:2,
 transitionActive:false,playing:true,blackout:false,reducedMotion:false,
 manualLighting:false,tier:'high'};
let checks=0;
function check(name,fn){try{fn();checks++;}catch(e){e.message=name+': '+e.message;throw e;}}
const at=(patch={})=>plan({...input,...patch});
const section=(name,patch={})=>at({fx:{...fx,section:name},...patch});
check('real V879 crowd cue is valid',()=>assert(cb.active&&cb.count>0));
check('V880 activated for verified music',()=>assert(at().cue.active));
check('section names produce seven distinct narrative roles',()=>{
 const roles=['intro','verse','hook','build','drop','break','finale'].map(n=>section(n).cue.role);
 assert.deepEqual(roles,['opening','narrative','singalong','anticipation','impact','breathing','finale']);
});
check('break is quieter than drop in every shared channel',()=>{
 const drop=section('drop').cue.gains,quiet=section('break').cue.gains;
 for(const k of Object.keys(drop))assert(drop[k]>=quiet[k],k);
});
check('hook keeps audience prominent for singalong',()=>{
 const h=section('hook').cue.gains;assert(h.crowd>h.particles);
});
check('build favours LED preparation over crowd',()=>{
 const b=section('build').cue.gains;assert(b.led>b.crowd);
});
check('finale keeps a high but bounded visual climax',()=>{
 const q=section('finale').cue.gains;assert(q.led>=.75&&q.festival>=.75);
});
check('all gains are finite zero-to-one and never brighten',()=>{
 for(const name of ['intro','verse','hook','build','drop','break','finale']){
  const q=section(name).cue;
  for(const [key,v] of Object.entries(q.gains))assert(Number.isFinite(v)&&v>=0&&v<=1,`${name}/${key}`);
 }
});
check('rotation is stable within one time window',()=>{
 assert.equal(at({positionMs:24000}).cue.hero,at({positionMs:25000}).cue.hero);
});
check('rotation changes hero on following window',()=>{
 assert.notEqual(at({positionMs:24000}).cue.hero,at({positionMs:37000}).cue.hero);
});
check('non peak passage never invents hero',()=>{
 assert.equal(section('verse').cue.hero,'none');
 assert.equal(section('break').cue.hero,'none');
});
check('track-specific hero pattern deterministic',()=>{
 assert.deepEqual(at(),at());
 assert.deepEqual(at({trackId:'other'}),at({trackId:'other'}));
});
check('hero rotation can be disabled independently',()=>{
 assert.equal(at({settings:{...s,smartConcertHeroRotationV880:false}}).cue.hero,'none');
});
check('contrast disabled lifts nonhero channels',()=>{
 const normal=at(),relaxed=at({settings:{...s,smartConcertContrastV880:false}});
 const k=normal.cue.hero==='crowd'?'laser':'crowd';
 assert(relaxed.cue.gains[k]>=normal.cue.gains[k]);
});
check('cinematic is more restrained than festival',()=>{
 const cinematic=at({settings:{...s,smartConcertStyleV880:'cinematic'}});
 assert(cinematic.cue.gains.particles<at().cue.gains.particles);
});
check('strength zero means exact bypass',()=>{
 const q=at({settings:{...s,smartConcertStrengthV880:0}});
 assert.equal(q.cue.active,false);assert.equal(q.state,null);
 assert(Object.values(q.cue.gains).every(x=>x===1));
});
check('master opt-out means exact bypass',()=>assert.equal(
 at({settings:{...s,smartConcertExperienceV880:false}}).cue.active,false));
check('lyrics protection is more restrained than unprotected',()=>{
 const q=at({lyricsProtected:true}).cue;
 assert.equal(q.focusProtection,1);assert(q.gains.crowd<at().cue.gains.crowd);
});
check('verified singer portrait increases focus protection',()=>{
 const q=at({cameraIntent:'portrait'}).cue;
 assert(q.focusProtection>at().cue.focusProtection);
});
check('manual camera prevents automatic camera inference',()=>{
 assert.equal(at({cameraIntent:'portrait',manualCamera:true}).cue.focusProtection,0);
});
check('unknown camera and unverified intent do not protect as a portrait',()=>{
 assert.equal(at({cameraVerified:false,cameraIntent:'portrait'}).cue.focusProtection,0);
 assert.equal(at({cameraIntent:'unexpected'}).cue.focusProtection,0);
});
check('voice focus protects even when camera unknown',()=>{
 assert(at({vocalFocus:true,cameraVerified:false}).cue.focusProtection>.5);
});
check('performer protection can be disabled separately',()=>{
 const q=at({lyricsProtected:true,settings:{...s,smartConcertPerformerGuardV880:false}});
 assert.equal(q.cue.focusProtection,0);
});
check('verified transition gently lowers selected visuals',()=>{
 const q=at({transitionActive:true}).cue,normal=at().cue;
 assert(q.gains.crowd<=normal.gains.crowd);
});
check('song-position smoothing is frame-rate independent',()=>{
 const first=at({energy:0,kick:0});
 const same=at({previous:first.state,energy:1,kick:1});
 assert.equal(same.state.smoothedEnergy,first.state.smoothedEnergy);
 const progressed=at({previous:first.state,positionMs:24500,energy:1,kick:1});
 assert(progressed.state.smoothedEnergy>0&&progressed.state.smoothedEnergy<1);
});
check('seek backward resets smoothing',()=>{
 const first=at();const again=at({previous:first.state,positionMs:2000,energy:0,kick:0});
 assert.equal(again.state.smoothedEnergy,0);
});
check('large skip resets smoothing',()=>{
 const first=at();const again=at({previous:first.state,positionMs:70000,energy:0,kick:0});
 assert.equal(again.state.smoothedEnergy,0);
});
check('new track resets smoothing',()=>{
 const first=at();const again=at({previous:first.state,trackId:'next',energy:0,kick:0});
 assert.equal(again.state.smoothedEnergy,0);
});
check('all hard safety vetoes disable V880',()=>{
 for(const patch of [{playing:false},{blackout:true},{reducedMotion:true},{manualLighting:true},
 {tier:'low'},{groupCount:0},{groupCount:5},{durationMs:0},{positionMs:-1},
 {fx:{...fx,active:false}},{fx:{...fx,reason:'preview'}},
 {settings:{...s,enabled:false}},{settings:{...s,intensity:0}}]){
  assert.equal(at(patch).cue.active,false,JSON.stringify(patch));
 }
});
check('invalid numerical values fail closed',()=>{
 for(const patch of [{energy:NaN},{kick:Infinity},{positionMs:NaN},{durationMs:Infinity},
 {fx:{...fx,phase:NaN}},{settings:{...s,smartConcertStrengthV880:Infinity}},
 {positionMs:186000}])assert.equal(at(patch).cue.active,false);
});
check('unknown verified act section fails closed',()=>{
 assert.equal(section('unknown').cue.active,false);
});
check('normalization supports old persisted settings and clamps outliers',()=>{
 const n=normalize({});assert.equal(n.smartConcertExperienceV880,true);
 assert.equal(n.smartConcertStrengthV880,65);
 assert.equal(n.smartConcertStyleV880,'balanced');
 assert.equal(normalize({smartConcertStrengthV880:500}).smartConcertStrengthV880,100);
 assert.equal(normalize({smartConcertStrengthV880:-5}).smartConcertStrengthV880,0);
 assert.equal(normalize({smartConcertStrengthV880:NaN}).smartConcertStrengthV880,65);
 assert.equal(normalize({smartConcertStyleV880:'invalid'}).smartConcertStyleV880,'balanced');
});
check('applying crowd arc respects count, active and parent opt-outs',()=>{
 const original=JSON.stringify(cb),q=applyCrowd(cb,at().cue);
 assert.equal(q.count,cb.count);assert.equal(q.active,cb.active);
 for(const k of ['movement','cheer','phoneOpacity','armLift','wristbandGlow'])
  assert(q[k]>=0&&q[k]<=cb[k],k);
 assert.equal(JSON.stringify(cb),original);
 const disabled=applyCrowd({...cb,active:false},at().cue);
 assert.equal(disabled.active,false);
});
check('particles preserve caps, counts, source flags',()=>{
 const q=applyParticles(pb,at().cue);
 for(const k of ['sparks','shards','confetti','rings','active'])assert.equal(q[k],pb[k]);
 for(const k of ['sparkOpacity','shardOpacity','confettiOpacity','ringOpacity'])
  assert(q[k]<=pb[k]);
});
check('festival never increases strobe or bursts',()=>{
 const q=applyFestival({...fb,active:true,strobeGain:.12,co2Opacity:.3},at().cue);
 assert(q.strobeGain<=.12&&q.co2Opacity<=.3);
 assert.equal(q.co2Count,fb.co2Count);assert.equal(q.moment,fb.moment);
});
check('foam retains emitter topology, only attenuates',()=>{
 const q=applyFoam({...foamBase,active:true},at().cue);
 assert(q.opacity<=foamBase.opacity&&q.power<=foamBase.power);
 assert.equal(q.bubbles,foamBase.bubbles);assert.equal(q.mist,foamBase.mist);
});
check('adapter exact bypass if director inactive',()=>{
 const off=at({playing:false}).cue;
 assert.deepEqual(applyCrowd(cb,off),cb);
 assert.deepEqual(applyParticles(pb,off),pb);
 assert.deepEqual(applyFestival(fb,off),fb);
 assert.deepEqual(applyFoam(foamBase,off),foamBase);
});
check('authored LED and laser lanes remain unchanged',()=>{
 const q=at().cue;
 assert.equal(laneGain(q,'led',true),1);assert.equal(laneGain(q,'laser',true),1);
 assert(laneGain(q,'led',false)<=1&&laneGain(q,'laser',false)<=1);
});
check('pure planning does not modify settings/input',()=>{
 const json=JSON.stringify(input);const q=at();
 assert.equal(JSON.stringify(input),json);assert.deepEqual(q,at());
});
check('genre-specific visual restraint never increases allowed effects',()=>{
 const base=at().cue.gains;
 const rap=at({fx:{...fx,genre:'rap'}}).cue.gains;
 const rock=at({fx:{...fx,genre:'rock'}}).cue.gains;
 assert(rap.foam<=base.foam&&rap.festival<=base.festival);
 assert(rock.laser<=base.laser);
});
check('manual authored foam and particle lanes are kept separate',()=>{
 const src=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 assert(src.includes("if(!authoredLanesV850.includes('foam'))\n        foamCueV817.current=applyConcertArcFoamV880"));
 assert(src.includes("if(!authoredLanesV850.includes('particles'))\n        festivalCueV844.current=applyConcertArcFestivalV880"));
});
check('stage is downstream of V879 and final V871 budgeting',()=>{
 const src=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 assert(src.indexOf('planSmartConcertExperienceV880({')>src.indexOf('planCrowdCameraStageHarmonyV879({'));
 assert(src.indexOf('planSmartConcertExperienceV880({')>src.indexOf('coordinateFestivalFxV871({'));
 assert(src.includes('cameraIntent:cinematicCueV761?.intent??null'));
 assert(src.includes('manualLighting:manualLightingV763||authoredLightsV386||showCue?.lightingEnabled===false'));
});
check('shader output uses authored-aware V880 lane gains',()=>{
 const src=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 assert(src.includes('laserGainV823*concertArcLaserGainV880*('));
 assert(src.includes('ledGainV823*concertArcLedGainV880*('));
 assert(src.includes('laserGainV823*concertArcLaserGainV880)'));
 assert(src.includes("concertArcLaneGainV880(concertArcV880.cue,'led',authoredLanesV850.includes('led'))"));
});
check('panel exposes wired settings and preview',()=>{
 const src=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
 assert(src.includes('V880 · Smart Concert Experience 5.0'));
 assert(src.includes('concertPreviewV880.gains.led'));
 assert(src.includes('patch({smartConcertStrengthV880:+e.target.value})'));
});
console.log('V880 Smart Concert Experience 5.0: '+checks+'/'+checks+' Regressionstests erfolgreich.');
