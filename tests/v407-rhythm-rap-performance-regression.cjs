'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {resolveVocalPerformanceQualityV374}=load('components/visualizer/vocalPerformanceQualityV374');
const {rapRhythmAccentsV407:rhythm,composeRapRhythmStageV407:compose}=load('components/visualizer/rapRhythmPerformanceV407');
const {composeRapStageV406}=load('components/visualizer/rapStagePerformanceV406');
const lyrics={synced:true,provider:'test',lines:[
 {startMs:1000,endMs:1980,text:'Kick Snare',words:[{text:'Kick',startMs:1000,endMs:1400},{text:'Snare!',startMs:1450,endMs:1950}]},
 {startMs:2200,endMs:2550,text:'[Instrumental]'},
 {startMs:3100,endMs:3700,text:'Line only'},
]};
const opt={style:'rap',genre:'Deutschrap',qualityEnabledV374:true,naturalArticulationEnabledV384:true,rapArticulationEnabledV405:true,
 lipStrength:95,rapClarityV405:80,ensembleCountV374:2,manualSingingSlotsV385:[0],avatarSlot:0};
const at=(ms=1710,extra={},playing=true,l=lyrics)=>resolveVocalPerformanceQualityV374(l,ms,playing,{...opt,...extra});
const word=at();
const context={playing:true,enabled:true,strength:80,energy:.75,bodyEnabled:true,gestures:true,slot:0,section:'verse',rhythmEnabled:true};
const microphone={kick:.86,snare:.03,attack:.75,beatPhase:.04,phaseConfidence:.83,phaseLocked:true,bpmConfidence:.8,kickAccentIntensity:.93};
const snareAudio={...microphone,kick:.08,snare:.92,attack:.86,kickAccentIntensity:0};
const estimated={kick:.4,snare:.4,attack:1,kickAccentIntensity:.9,beatPhase:0};
assert.equal(word.articulationV405.active,true);
const base=composeRapStageV406(word.body,word,context);
const k=rhythm(word,microphone,context),s=rhythm(word,snareAudio,context);
assert.equal(k.source,'microphone');
assert(k.kick>.6&&k.snare<.04,'measured onset kick should dominate');
assert(s.snare>.6&&s.kick===0,'snare should dominate on a separate measured transient');
assert(k.chest>s.chest,'kick should drive the chest');
assert(s.head>k.head,'snare should drive the head');
const kickBody=compose(base,word,microphone,context),snareBody=compose(base,word,snareAudio,context);
assert(kickBody.chestLean<snareBody.chestLean,'kick makes a deeper torso pulse');
assert(snareBody.headPitch<kickBody.headPitch,'snare has larger head nod');
const verse=rhythm(word,snareAudio,context),hook=rhythm(word,snareAudio,{...context,section:'hook'});
assert(hook.arm>verse.arm,'hooks use broader gestures');
assert(hook.phrase>verse.phrase,'hooks use more open vocal-phrase dynamics');
assert.notDeepEqual(compose(base,word,snareAudio,{...context,section:'hook'}),compose(base,word,snareAudio,context));
const noMic=rhythm(word,estimated,context);
assert.equal(noMic.kick,0,'Spotify estimated pulse is not a detected kick');
assert.equal(noMic.snare,0,'Spotify estimated pulse is not a detected snare');
assert(['word','none'].includes(noMic.source),'word cues must identify their non-audio provenance');
const noAttack=rhythm(word,{...snareAudio,attack:0},context);
assert.equal(noAttack.snare,0,'sustained spectral snare energy alone is not an onset');
assert.equal(rhythm(word,{...microphone,kickAccentIntensity:0},context).kick,0,'no measured kick onset');
for(const [ms,extra,playing,l] of [
 [0,{},true,lyrics],[1405,{},true,lyrics],[2300,{},true,lyrics],[3330,{},true,lyrics],
 [1710,{},false,lyrics],[1710,{style:'singing'},true,lyrics],[1710,{avatarSlot:1},true,lyrics],
 [1710,{rapArticulationEnabledV405:false},true,lyrics],[1710,{},true,{...lyrics,synced:false}],
]) {
 const cue=at(ms,extra,playing,l),body=composeRapStageV406(cue.body,cue,context);
 assert.equal(rhythm(cue,microphone,{...context,playing}).active,false,`no fake rap on ${ms}`);
 assert.equal(compose(body,cue,microphone,{...context,playing}),body,'inactive returns original reference');
}
for(const extra of [{enabled:false},{playing:false},{reducedMotion:true},{bodyEnabled:false},{authoredPriority:true},
 {rhythmEnabled:false},{strength:0},{strength:NaN},{strength:Infinity},{section:'break'}]){
 const c={...context,...extra};assert.equal(rhythm(word,microphone,c).active,false,`guard: ${JSON.stringify(extra)}`);
 assert.equal(compose(base,word,microphone,c),base);
}
const noGest=compose(base,word,snareAudio,{...context,gestures:false});
assert.equal(noGest.leftArm,base.leftArm);assert.equal(noGest.rightArm,base.rightArm);
assert.equal(noGest.headYaw,base.headYaw);assert.equal(noGest.eyeYaw,base.eyeYaw);
for(const sec of ['verse','hook','build','drop','break',null]){
 for(const ms of [1000,1190,1390,1450,1710,1940,2200,3200]){
  const cue=at(ms),b=composeRapStageV406(cue.body,cue,context),c={...context,section:sec};
  const r=compose(b,cue,snareAudio,c);
  assert.deepEqual(r,compose(b,cue,snareAudio,c),'seek-safe, stateless and deterministic');
  for(const [key,max] of [['headPitch',.18],['headTilt',.12],['chestLean',.12],['leftArm',.25],['rightArm',.25]]){
   assert(Number.isFinite(r[key])&&Math.abs(r[key])<=max+1e-8,`${key} bounded`);
  }
  for(const key of ['headYaw','eyeYaw','emphasis','confidence','mode'])assert.equal(r[key],b[key],'existing vocal/partner cue protected');
 }
}
const three=fs.readFileSync(path.resolve(__dirname,'../components/visualizer/ThreeAvatar.tsx'),'utf8');
assert.equal((three.match(/composeRapRhythmStageV407\(/g)||[]).length,2,'both avatar pipelines must be wired');
assert(/applyVocalStageOverlayV371\(rigTargets.current,\s*addAdvancedVocalHeadV459\(addExpressiveHeadV453\(rapBodyV407/.test(three),'GLTF overlay uses the final cue');
assert(three.includes('rapBodyV453.headPitch')&&three.includes('rapBodyV407.chestLean'),'procedural avatar uses the final cue');
const pkg=require('../package.json');
assert.ok((Number(String(pkg.version).match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 407));
assert(pkg.scripts['verify:offline'].includes('test:v407'));
assert(pkg.scripts['build:preflight'].includes('test:v407'));
assert.equal(pkg.scripts.prebuild,'npm run build:preflight','npm run build must run preflight automatically');
console.log('PASS V407: measured kick->chest, snare->head, verse/hook gestures, no synthetic-onset claims, vocal roles, bounded poses, pause/seek guards and both avatar pipelines');
