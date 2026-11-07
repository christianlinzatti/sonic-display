'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {planAvatarPerformanceV1054:plan,timedWordGestureV1054:word}=load('lib/arena360AvatarPerformanceV1054');
const {planArenaChoreographyV1041:oldPlan}=load('lib/arena360ChoreographyV1041');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const durationMs=210000,trackId='spotify:v1054-rap-performance';
const showPlan=generateArenaShowPlanV1040({genre:'Deutschrap',durationMs});
function input(progressMs=93000){
 const show=sampleArenaShowPlanV1040(showPlan,{enabled:true,playing:true,reducedMotion:false,progressMs,durationMs});
 const base=oldPlan({enabled:true,stageIsArena:true,playing:true,reducedMotion:false,manualPriority:false,show,
  trackId,progressMs,genre:'Deutschrap',strength:60,performanceTier:'high'});
 return {enabled:true,stageIsArena:true,playing:true,reducedMotion:false,manualPriority:false,reactive:true,
  base,show,trackId,progressMs,durationMs,genre:'Deutschrap',strength:70,performanceTier:'high',lyricsPlaying:false,lyrics:null};
}
const standard=input(),v=plan(standard);
assert(v.active&&v.reason==='planned');
assert.deepEqual(plan(standard),v,'repeatable song clock');
assert.equal(v.choreography.active,true);
assert.equal(v.choreography.role,'together','must not manufacture singer assignment');
assert.equal(v.choreography.dropAccent,false,'must not manufacture a drop');
assert.equal(v.choreography.scene,standard.base.scene,'preserve formation mode');
assert.equal(v.choreography.formation,standard.base.formation,'preserve formation placement');
assert(v.choreography.leadGain>=standard.base.leadGain&&v.choreography.leadGain<=1.18);
assert(v.choreography.partnerGain>=standard.base.partnerGain&&v.choreography.partnerGain<=1.18);
assert.equal(standard.base.leadGain,oldPlan({enabled:true,stageIsArena:true,playing:true,reducedMotion:false,
 manualPriority:false,show:standard.show,trackId,progressMs:standard.progressMs,genre:'Deutschrap',strength:60,performanceTier:'high'}).leadGain,'base must remain immutable');
const before=plan(input(7999)),after=plan(input(8001));
assert(after.blend<.003,'new phrase does not snap in at onset');
assert(before.blend>=after.blend,'new phrase envelope soft-start');
assert.notDeepEqual(plan(input(93000)),plan(input(97000)),'song position affects direction');
const synced={provider:'lrclib',synced:true,plainText:null,lines:[
 {startMs:92700,endMs:94800,text:'Das ist ein Rap Vers!',words:[
  {text:'Das',startMs:92700,endMs:92900},
  {text:'ist',startMs:92900,endMs:93100},
  {text:'ein',startMs:93100,endMs:93350},
  {text:'Rap',startMs:93350,endMs:93700},
  {text:'Vers!',startMs:93700,endMs:94800}]},
 {startMs:96000,endMs:98200,text:'Die Nacht wird lange!',words:[
  {text:'Die',startMs:96000,endMs:96500},{text:'Nacht',startMs:96500,endMs:97500},
  {text:'wird',startMs:97500,endMs:97800},{text:'lange!',startMs:97800,endMs:98200}]},
]};
assert(word(synced,93500)?.kind==='rap-accent','timed shorter word pulse');
assert(word(synced,97000)?.kind==='vocal-swell','timed longer word swell');
assert(!word(synced,95000),'gap never becomes singer evidence');
assert(!word({...synced,synced:false},93500),'unsynced lyrics blocked');
assert(!word({...synced,lines:[{startMs:92700,endMs:94800,text:'line only'}]},93500));
assert(!word(synced,NaN));assert(!word(synced,100000));
const vocal=plan({...input(93500),lyrics:synced,lyricsPlaying:true});
assert(vocal.active&&vocal.wordTimed&&vocal.style==='rap-accent');
assert(!plan({...input(93500),lyrics:synced,lyricsPlaying:false}).wordTimed,'lyrics must be playing');
const sustained=plan({...input(97000),lyrics:synced,lyricsPlaying:true});
assert(sustained.wordTimed&&sustained.style==='vocal-swell');
const off=plan({...input(93500),lyrics:synced,lyricsPlaying:false});
assert(!off.wordTimed,'no lyric pulse with stopped lyrics');
for(const patch of [{enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},{manualPriority:true},
 {reactive:false},{performanceTier:'low'},{strength:0},{trackId:''},{trackId:null},
 {progressMs:-1},{progressMs:NaN},{progressMs:Infinity},{progressMs:220000},{durationMs:0},
 {durationMs:NaN},{show:{...standard.show,active:false}},{base:{...standard.base,active:false}}]){
 const i={...standard,...patch};const r=plan(i);
 assert.equal(r.active,false,JSON.stringify(patch));
 assert.strictEqual(r.choreography,i.base,'off path exact reference preserves existing choreography');
}
const lo=plan({...standard,performanceTier:'balanced'});
assert(lo.active&&lo.blend<=v.blend,'balanced has smaller budget');
const zero=plan({...standard,strength:-5});assert(!zero.active);
const max=plan({...standard,strength:500});assert(max.blend<=.8);
const calm=plan(input(143000));assert(calm.style==='breathe','interlude uses reduced motion intent');
for(const t of [21000,59000,97000,126000,143000,184000,203000]){
 const cue=plan(input(t));if(!cue.active)continue;
 assert(Number.isFinite(cue.blend)&&cue.blend>=0&&cue.blend<=.8);
 assert(cue.choreography.leadGain<=1.18&&cue.choreography.partnerGain<=1.18);
 assert.equal(cue.choreography.formation,input(t).base.formation);
 assert.equal(cue.choreography.dropAccent,false);
}
for(const file of ['components/visualizer/ThreeAvatar.tsx','components/visualizer/VisualizerStage.tsx',
 'types/music.ts','context/UiPreferencesContext.tsx','components/visualizer/ArenaShowDesignerPanelV1040.tsx']){
 assert(read(file).includes('arenaAvatarPerformanceEnabledV1054'),file);
}
assert(read('components/visualizer/ThreeAvatar.tsx').includes('choreography={authoredEnabled ? null : multiEnabled ? choreography : intelligentEnabled ? intelligentCue : arenaChoreoV1041.active ? performanceChoreoV1054 : null}'));
assert(read('context/UiPreferencesContext.tsx').includes('arenaAvatarPerformanceEnabledV1054:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1054 · Advanced Avatar Performance Intelligence'));
const source=read('lib/arena360AvatarPerformanceV1054.ts');
for(const forbidden of ['fetch(', 'setTimeout(', 'setInterval(', 'Math.random(', 'localStorage', 'navigator.', 'document.', 'Date.now(', 'WebSocket(', 'new AnimationMixer', 'Bone('])
 assert(!source.includes(forbidden),'pure no added effects '+forbidden);
console.log('PASS V1054 · lyric words, rap accents, vocal phrasing, genre motifs, manual/GLB priority, deterministic safety, performance tiers, wiring');
