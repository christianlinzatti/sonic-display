'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const {directLiveConcertV1049:direct}=load('lib/arena360LiveConcertIntelligenceV1049');
const plan=generateArenaShowPlanV1040({genre:'Hardtekk',durationMs:240000});
const show=sampleArenaShowPlanV1040(plan,{enabled:true,playing:true,reducedMotion:false,
 progressMs:110000,durationMs:240000,observedSection:'verse'});
assert(show.active&&show.intensity>0);
const audio={energyEnvelope:.76,attack:.68,decay:.1,beat:true,beatStrength:.8,
 phaseLocked:true,phaseConfidence:.82,kickAccentIntensity:.83};
const valid={enabled:true,microphoneActive:true,playing:true,reducedMotion:false,stageIsArena:true,
 reactive:true,show,audio,strength:60,performanceTier:'high',sampleAgeMs:100};
const peak=direct(valid);assert(peak.active&&peak.verifiedBeat);assert.equal(peak.moment,'crest');
const rise=direct({...valid,audio:{...audio,beat:false,energyEnvelope:.46}});
assert.equal(rise.moment,'rise');assert.equal(rise.verifiedBeat,false);
const release=direct({...valid,audio:{...audio,beat:false,attack:.02,decay:.7,energyEnvelope:.24}});
assert.equal(release.moment,'release');
assert(release.show.intensity<peak.show.intensity);
const steady=direct({...valid,audio:{...audio,beat:false,attack:0,decay:0,energyEnvelope:.55}});
assert.equal(steady.moment,'steady');
for(const result of [peak,rise,release,steady]){
 assert(result.show.intensity<=show.intensity&&result.show.intensity>=0);
 assert.equal(result.show.scene,show.scene);
 for(const prop of ['camera','dance','deck','floating','lasers','fade','active','segmentIndex'])
  assert.deepEqual(result.show[prop],show[prop],`Do not replace authored ${prop}`);
 assert.equal(result.verifiedBeat,result.moment==='crest');
}
for(const patch of [{enabled:false},{microphoneActive:false},{playing:false},
 {reducedMotion:true},{stageIsArena:false},{reactive:false},{performanceTier:'low'},
 {sampleAgeMs:451},{sampleAgeMs:-1},{sampleAgeMs:NaN},{sampleAgeMs:Infinity},
 {strength:0},{audio:null},{audio:{...audio,energyEnvelope:NaN}},
 {audio:{...audio,attack:-1}},{audio:{...audio,decay:Infinity}},
 {show:{...show,active:false}}]){
 const input={...valid,...patch},result=direct(input);
 assert.equal(result.active,false,JSON.stringify(patch));
 assert.deepEqual(result.show,input.show,'safe fallback must not mutate the cue');
}
for(const patch of [{phaseLocked:false},{phaseConfidence:.2},{beatStrength:.2},
 {beat:false},{phaseConfidence:undefined}]){
 const r=direct({...valid,audio:{...audio,...patch}});
 assert(!r.verifiedBeat,'untrusted beat is not a real beat');
 assert.notEqual(r.moment,'crest');
}
const balanced=direct({...valid,performanceTier:'balanced',audio:{...audio,beat:false,attack:0,decay:.7,energyEnvelope:.22}});
const high=direct({...valid,performanceTier:'high',audio:{...audio,beat:false,attack:0,decay:.7,energyEnvelope:.22}});
assert(balanced.show.intensity>=high.show.intensity,'balanced profile uses less dynamic dimming');
for(let i=0;i<150;i++){
 const energy=i/149;
 const result=direct({...valid,audio:{...audio,energyEnvelope:energy,attack:1-energy,decay:energy}});
 assert(Number.isFinite(result.show.intensity));assert(result.show.intensity<=show.intensity);
}
assert.deepEqual(direct(valid),direct(valid),'pure deterministic decision');
const files=['components/visualizer/stages/Arena360StageV1031.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/GoveeMusicSyncV909.tsx'];
for(const f of files){assert(read(f).includes('directLiveConcertV1049'),`missing live layer in ${f}`);}
assert(read('components/GoveeMusicSyncV909.tsx').includes('sampleAgeMs:now-state.observedAt'));
assert(read('components/visualizer/VisualizerStage.tsx').includes('microphoneActiveV1049={audioActive}'));
assert(read('context/UiPreferencesContext.tsx').includes('arenaLiveConcertEnabledV1049:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arenaLiveConcertEnabledV1049'));
for(const banned of ['fetch(', 'setTimeout(', 'setInterval(', 'Math.random(', 'WebSocket(',
 'localStorage', 'navigator.', 'document.', 'Date.now(', 'performance.now('])
 assert(!read('lib/arena360LiveConcertIntelligenceV1049.ts').includes(banned),`unexpected side effect: ${banned}`);
console.log('PASS V1049 · live microphone gating, phase-qualified beats, dynamics, manual priority, bounded intensity, stale audio, Govee guard, deterministic decisions');
