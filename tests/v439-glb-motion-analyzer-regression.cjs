'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {analyzeAnimationClipV439:analyze,analyzeMotionClipsV439:analyzeAll}=load('components/visualizer/glbMotionAnalyzerV439');
const {sanitizeMotionCacheV439:sanitize,featuresForMotionsV439:features}=load('components/visualizer/glbMotionCacheV439');
const {profileMotionV438:profile,nextAutomaticRapShowV438:choose}=load('components/visualizer/automaticMotionIntelligenceV438');
const {sanitizeCharacterMotionStore:sanitizeStore}=load('components/visualizer/characterMotionLibrary');
const {emptyDanceSequence:empty}=load('components/visualizer/intelligentDanceCombinationV242');
const quat=(angle)=>[0,Math.sin(angle/2),0,Math.cos(angle/2)];
const makeTrack=(name,angles)=>({name,times:[0,.5,1,1.5,2],values:angles.flatMap(quat),getValueSize:()=>4});
const loud={name:'energetic',duration:2,tracks:[
  makeTrack('mixamorigLeftArm.quaternion',[0,2,-2,2,0]),
  makeTrack('mixamorigRightArm.quaternion',[0,-2,2,-2,0]),
  makeTrack('mixamorigLeftUpLeg.quaternion',[0,2,-2,2,0]),
  makeTrack('mixamorigRightLeg.quaternion',[0,-2,2,-2,0]),
  makeTrack('mixamorigSpine.quaternion',[0,.6,-.6,.6,0])
]};
const calm={name:'quiet',duration:2,tracks:[makeTrack('LeftArm.quaternion',[0,.04,-.04,.04,0]),
  makeTrack('LeftLeg.quaternion',[0,.04,-.04,.04,0]),makeTrack('Spine.quaternion',[0,.02,-.02,.02,0])]};
const a=analyze(loud),b=analyze(calm);
assert(a&&b,'real keyframes produce measurable profiles');
assert(a.arms>.55&&a.legs>.55,'arm/leg activity derived from actual quaternion rotations');
assert(a.energy>b.energy+.35);assert(b.energy<.22);
assert(a.loopability>.9&&b.loopability>.9,'end/start pose closeness estimated');
assert(a.recommended.includes('hook'));assert(b.recommended.includes('break'));
assert(a.confidence>.35&&b.confidence>.35);
assert.equal(analyzeAll([{name:'empty',duration:2,tracks:[]},loud]).clipName,'energetic');
assert.equal(analyze({name:'empty',duration:2,tracks:[]}),null);
assert.equal(analyze({name:'bad',duration:Infinity,tracks:loud.tracks}),null);
assert.equal(analyze({name:'bad',duration:2,tracks:[makeTrack('NotAHumanoid.xyz',[0,0,0,0,0])]}),null);
const malformed={name:'invalid',duration:2,tracks:[{name:'LeftArm.quaternion',times:[0,.5],values:[NaN,0,0,1,0,0,0,1],getValueSize:()=>4}]};
assert.equal(analyze(malformed),null,'NaN values not ranked');
const m=(id,name,section='any')=>({id,avatarId:'av',url:'/motions/'+id+'.glb',name,genre:'deutschrap',section,bpmMin:0,bpmMax:300,addedAt:0});
const motionStore=sanitizeStore({version:1,automatic:true,motions:[m('loud','opaque 1'),m('calm','opaque 2'),m('manual','Calm Idle','hook')]});
const cache=sanitize({
 loud:{url:'/motions/loud.glb',at:Date.now(),status:'ok',features:a},
 calm:{url:'/motions/calm.glb',at:Date.now(),status:'ok',features:b},
 '__proto__':{url:'/motions/attack.glb',at:Date.now(),status:'ok',features:a},
 manual:{url:'/motions/old.glb',at:Date.now(),status:'ok',features:a},
 broken:{url:'/motions/broken.glb',at:Date.now(),status:'ok',features:{...a,arms:NaN}}
});
const measured=features(motionStore.motions,cache);
assert.equal(measured.loud.energy,a.energy);assert.equal(measured.calm.energy,b.energy);
assert.equal(measured.manual,undefined,'changed URL invalidates stale measurements');
assert.equal(measured.broken,undefined);
assert.equal(Object.getPrototypeOf(cache),null,'safe map without prototype');
assert.equal(profile(motionStore.motions[0],a).confidence,'measured');
assert.deepEqual(profile(motionStore.motions[2],a).recommended,['hook'],'manual categories outrank measurements');
const input={enabled:true,manualProtected:false,playing:true,reducedMotion:false,trackId:'song',avatarId:'av',
 genre:'deutschrap',bpm:105,progressMs:2000,durationMs:100000,energy:.9,scene:'hook',phraseSlot:2,eventSlot:'hook',variety:0,motionProfilesV439:measured};
const result=choose(empty(),motionStore,input);
assert.equal(result.chosen.id,'manual','explicit manual section outranks measured classification');
const onlyMeasured={...motionStore,motions:motionStore.motions.filter(x=>x.id!=='manual')};
assert.equal(choose(empty(),onlyMeasured,input).chosen.id,'loud');
assert.equal(choose(empty(),onlyMeasured,{...input,scene:'break',energy:.08,eventSlot:'break'}).chosen.id,'calm');
assert.equal(choose(empty(),onlyMeasured,{...input,enabled:false}).chosen,null);
assert.equal(choose(empty(),onlyMeasured,{...input,manualProtected:true}).chosen,null);
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const panel=fs.readFileSync('components/visualizer/AutoMotionIntelligencePanelV438.tsx','utf8');
const scanner=fs.readFileSync('components/visualizer/glbMotionScanV439.ts','utf8');
for(const [text,token] of [[stage,'scanMotionLibraryV439'],[stage,'motionProfilesV439'],
 [stage,'MOTION_ANALYSIS_EVENT_V439'],[panel,'scanMotionLibraryV439'],
 [panel,'analyzedCount'],[scanner,'GLTFLoader'],[scanner,'parseAsync'],[scanner,'MAX_BYTES'],
 [scanner,'controller.abort()']])assert(text.includes(token),`V439 integration missing: ${token}`);
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]??0)>=439);
assert(pkg.scripts['build:preflight'].includes('npm run test:v439'));
console.log('PASS V439: measured GLB keyframes, humanoid activity, invalid tracks, loopability, cache safety, user preference, live integration');
