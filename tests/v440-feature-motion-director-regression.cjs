require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planFeatureCastV440:cast,featureChoreoCueV440:cue,featureCameraAssignmentsV440:camera}=load('components/visualizer/automaticFeatureShowV440');
const {nextAutomaticRapShowV438:choose}=load('components/visualizer/automaticMotionIntelligenceV438');
const {emptyDanceSequence:empty}=load('components/visualizer/intelligentDanceCombinationV242');
const t={id:'track-feature',title:'Song',artist:'Alpha, Beta',artists:['Alpha','Beta'],artistDetails:[{id:'a',name:'Alpha',spotifyUrl:''},{id:'b',name:'Beta',spotifyUrl:''}],album:'Album',albumCoverUrl:null,spotifyUrl:'',durationMs:180000};
const stage=cast({track:t,enabled:true,mode:'solo',avatarStage:true,reducedMotion:false});
assert.equal(stage.mode,'duet');assert.equal(stage.visibleCount,2);assert.equal(stage.source,'spotify-artists');
assert.deepEqual(stage.artists,['Alpha','Beta']);
assert.equal(cast({track:{...t,artists:['Alpha'],artistDetails:[]},enabled:true,mode:'solo',avatarStage:true,reducedMotion:false}).mode,'solo');
assert.equal(cast({track:t,enabled:false,mode:'solo',avatarStage:true,reducedMotion:false}).mode,'solo');
assert.equal(cast({track:t,enabled:true,mode:'solo',avatarStage:true,reducedMotion:true}).mode,'solo');
assert.equal(cast({track:t,enabled:true,mode:'mirror',avatarStage:true,reducedMotion:false}).mode,'mirror');
assert.equal(cast({track:t,enabled:true,mode:'duet',avatarStage:true,reducedMotion:false}).source,'manual-mode');
assert.equal(cast({track:{...t,artistDetails:[{id:'a',name:'Alpha',spotifyUrl:''},{id:'dup',name:'alpha ',spotifyUrl:''}],artists:['Alpha','Beta']},enabled:true,mode:'solo',avatarStage:true,reducedMotion:false}).feature,false);
const lyrics={provider:'spotify',synced:true,plainText:null,lines:Array.from({length:20},(_,i)=>({startMs:i*1800,endMs:(i+1)*1800,text:'Test line '+i}))};
const a=cue({cast:stage,lyrics,progressMs:200,scene:'verse',playing:true});
const b=cue({cast:stage,lyrics,progressMs:4*1800+100,scene:'verse',playing:true});
assert.equal(a.focusSlot,0);assert.equal(b.focusSlot,1);assert.equal(a.primaryScene,'verse');assert.equal(a.secondaryScene,'break');assert.equal(b.primaryScene,'break');assert.equal(b.secondaryScene,'verse');
const hook=cue({cast:stage,lyrics,progressMs:1000,scene:'hook',playing:true});assert.equal(hook.primaryScene,'hook');assert.equal(hook.secondaryScene,'hook');
assert.equal(cue({cast:stage,progressMs:0,scene:'duet',playing:true}).primaryScene,'duet');
assert.equal(cue({cast:stage,progressMs:0,scene:'duet',playing:true}).secondaryScene,'duet');
const baseCamera=[{fromLine:0,toLine:19,leadSlot:0,partnerSlot:1,style:'solo',strength:65},
 {fromLine:8,toLine:9,leadSlot:0,partnerSlot:1,style:'hook',strength:80}];
const inferredCamera=camera(baseCamera,lyrics);
assert(inferredCamera.some(x=>x.fromLine===4&&x.leadSlot===1),'second visual performer receives verse camera focus');
assert.equal(inferredCamera.at(-1).style,'hook','inferred hook framing outranks visual alternation');
assert.deepEqual(baseCamera,[{fromLine:0,toLine:19,leadSlot:0,partnerSlot:1,style:'solo',strength:65},
 {fromLine:8,toLine:9,leadSlot:0,partnerSlot:1,style:'hook',strength:80}]);

const noFeature=cue({cast:cast({track:null,enabled:true,mode:'solo',avatarStage:true,reducedMotion:false}),progressMs:0,scene:'verse',playing:true});assert.equal(noFeature.primaryScene,noFeature.secondaryScene);
const motion=(id,section)=>({id,avatarId:'a',url:'/motions/'+id+'.glb',name:id,section,genre:'',bpmMin:0,bpmMax:300,addedAt:0});
const store={version:1,automatic:true,motions:[motion('verse','verse'),motion('hook','hook'),motion('alt','any')]};
const props={enabled:true,manualProtected:false,playing:true,reducedMotion:false,trackId:'t',avatarId:'a',genre:'',bpm:112,progressMs:3000,durationMs:180000,energy:.6,scene:'verse',phraseSlot:0,eventSlot:'verse'};
const lead=choose(empty(),store,props);const partner=choose(empty(),store,{...props,avoidMotionId:lead.chosen.id});
assert.equal(lead.chosen.id,'verse','authored scene beats inferred alternative');
assert.equal(choose(lead.state,store,{...props,playing:false}).chosen,null,'pause respects safety gate');
for(const [file,marker] of [
 ['components/visualizer/VisualizerStage.tsx','multiAvatarMode={effectiveMultiModeV440}'],
 ['components/visualizer/VisualizerStage.tsx','secondaryPreferredMotionUrlV440'],
 ['components/visualizer/ThreeAvatar.tsx','preferredMotionUrlV440'],
 ['components/visualizer/registry.tsx','secondaryPreferredMotionUrlV440'],
 ['components/visualizer/AutoMotionIntelligencePanelV438.tsx','V440 · Automatic Feature Show'],
 ['types/music.ts','rapFeatureAvatarsV440?:boolean'],
 ['context/UiPreferencesContext.tsx','rapFeatureAvatarsV440:true']]){
 assert(fs.readFileSync(file,'utf8').includes(marker),`Missing ${marker} in ${file}`);
}
assert(Number(require('../package.json').version.match(/-v(\d+)$/)?.[1]??0)>=440);
console.log('PASS V440: Spotify-feature credits, authored formation precedence, independent avatar phrases, duet/hook synchronization, clip priority and stage integration');
