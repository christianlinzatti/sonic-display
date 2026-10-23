'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {profileMotionV438:profile,catalogAutoMotionsV438:catalog,nextAutomaticRapShowV438:choose}=load('components/visualizer/automaticMotionIntelligenceV438');
const {sanitizeCharacterMotionStore:sanitize}=load('components/visualizer/characterMotionLibrary');
const {emptyDanceSequence:empty}=load('components/visualizer/intelligentDanceCombinationV242');
const clip=(id,name,section='any',opts={})=>({id,avatarId:'singer1',url:'/motions/'+id+'.glb',name,section,genre:'deutschrap',bpmMin:65,bpmMax:170,addedAt:1,...opts});
const clips=[clip('verse','Hip Hop Groove Step','verse'),clip('hook','Big Chorus Power Dance','hook'),
 clip('break','slow sway break','any'),clip('other','Freestyle bounce','any'),
 clip('hook2','Hook Anthem Jump','any'),clip('wrong','idle motion','build')];
const original=JSON.stringify(clips);
const store=sanitize({version:1,motions:clips,automatic:true});
assert.equal(profile(store.motions[0]).confidence,'configured');
assert.deepEqual(profile(store.motions[1]).recommended,['hook']);
assert.equal(profile(store.motions[2]).confidence,'name-hint');
assert(profile(store.motions[2]).energy<.5);
assert(profile(store.motions[4]).recommended.includes('hook'));
assert.equal(catalog(store,'other').length,0);
assert.equal(catalog(store,'singer1').length,6);
const input={enabled:true,manualProtected:false,playing:true,reducedMotion:false,
 trackId:'song-one',avatarId:'singer1',genre:'deutschrap',bpm:106,progressMs:5000,durationMs:150000,
 energy:.65,scene:'verse',phraseSlot:1,eventSlot:'1:verse',variety:80,fallback:'/fallback.glb'};
const a=choose(empty(),store,input);
assert.equal(a.chosen.id,'verse','authored verse tag outranks inferred choices');
assert.equal(a.switched,true);
const unchanged=choose(a.state,store,{...input,progressMs:6000,energy:1});
assert.equal(unchanged.state,a.state,'stable selection within the same phrase');
assert.equal(unchanged.switched,false);
const implicitVerse=choose(empty(),store,{...input,eventSlot:undefined});
const implicitHook=choose(implicitVerse.state,store,{...input,eventSlot:undefined,scene:'hook',energy:.9});
assert.equal(implicitHook.chosen.id,'hook','scene change without explicit event slot switches clips');
const incompatibleHold=choose(a.state,store,{...input,bpm:210});
assert.equal(incompatibleHold.chosen,null,'stale selected motion must respect changed bpm requirements');
const chorus=choose(a.state,store,{...input,scene:'hook',eventSlot:'1:hook',energy:.9});
assert.equal(chorus.chosen.id,'hook','authored hook marker wins');
const paused=choose(chorus.state,store,{...input,playing:false});
assert.equal(paused.url,'/fallback.glb');
assert.equal(paused.state.motionId,null);
for(const args of [{enabled:false},{manualProtected:true},{reducedMotion:true},{trackId:''},{progressMs:NaN}]){
  const r=choose(empty(),store,{...input,...args});assert.equal(r.chosen,null);
}
assert.equal(choose(empty(),{...store,automatic:false},input).chosen,null,'library auto switch respected');
assert.equal(choose(empty(),{...store,motions:[]},input).url,'/fallback.glb');
assert.equal(choose(empty(),store,{...input,avatarId:'other'}).url,'/fallback.glb');
assert.equal(choose(empty(),store,{...input,bpm:210}).url,'/fallback.glb');
const reset=choose(chorus.state,store,{...input,trackId:'new-song',scene:'verse',phraseSlot:0,eventSlot:'0:verse'});
assert.equal(reset.state.trackId,'new-song');assert.deepEqual(reset.state.recent,['verse']);
const later=choose(chorus.state,store,{...input,scene:'hook',phraseSlot:2,eventSlot:'2:hook',variety:100,energy:.88});
assert.notEqual(later.state.slot,chorus.state.slot);assert(later.state.recent.length<=4);
const reply=choose(empty(),store,{...input,scene:'reply',eventSlot:'reply'});
assert.equal(reply.section,'verse');
const duet=choose(empty(),store,{...input,scene:'duet',eventSlot:'duet'});
assert.equal(duet.section,'verse');
assert.equal(JSON.stringify(clips),original,'library descriptors unchanged');
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const prefs=fs.readFileSync('context/UiPreferencesContext.tsx','utf8');
const types=fs.readFileSync('types/music.ts','utf8');
const root=fs.readFileSync('components/visualizer/ExpressiveRapDirectorPanelV425.tsx','utf8');
const panel=fs.readFileSync('components/visualizer/AutoMotionIntelligencePanelV438.tsx','utf8');
for(const [source,token] of [[stage,'nextAutomaticRapShowV438'],[stage,'manualProtected:!rapDanceAllowedV437'],
 [stage,'sequenceRef.current=smartActiveV438?smartMotionV438.state:combination.state'],
 [stage,'rapPerformanceCueV437.scene'],[stage,'eventSlot:`${danceEventV437}:v438-'],
 [prefs,'rapAutoMotionEnabledV438:true'],[prefs,'rapAutoMotionVarietyV438:70'],
 [types,'rapAutoMotionEnabledV438?:boolean'],[root,'<AutoMotionIntelligencePanelV438'],
 [panel,'saveCharacterMotionStore'],[panel,'CHARACTER_MOTION_CHANGE_EVENT']])assert(source.includes(token),`missing integration: ${token}`);
assert(!panel.includes('seekTo(')&&!panel.includes('setProgressMs('));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]??0)>=438);assert(pkg.scripts['build:preflight'].includes('npm run test:v438'));
console.log('PASS V438: offline clip profiles, manual precedence, deterministic energy-aware motion selection, phrase stability, protected modes and stage integration');
