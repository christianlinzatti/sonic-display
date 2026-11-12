'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const cues=load('components/visualizer/mixamoShowChoreography');
const v536=load('components/visualizer/genreAwareMotionDirectorV536');
const v588=load('components/visualizer/longFormChoreographyV588');
const v615=load('components/visualizer/intelligentChoreographyVarietyV615');
const v639=load('components/visualizer/intelligentMotionLibraryV639');
const score=(name,family,section,slot=0,count=3,energy=.85)=>
  cues.mixamoShowCueBias({name,family,section,slot,ensembleCount:count,energy});
const stage=(name,category,taggedGenre='',section='any')=>({
 name:'Library:'+name.replace(/\W/g,'')+':0',label:name,category,
 duration:2.4,trackCount:42,source:'library',taggedGenre,
 bpmMin:85,bpmMax:180,assignedSection:section,
});
const fixtures=[
 stage('Mixamo Rap Freestyle Gesture','rap','deutschrap'),
 stage('Mixamo Rap Groove Bounce','dance','deutschrap'),
 stage('Mixamo Rap Two Step','dance','deutschrap'),
 stage('Mixamo Hakken Footwork','energetic','hardtekk'),
 stage('Mixamo Rave Shuffle','dance','hardtekk'),
 stage('Mixamo Jumpstyle Stomp','energetic','hardstyle'),
 stage('Mixamo Hardstyle Power','energetic','hardstyle'),
 stage('Mixamo Idle Breathing','idle'),
 stage('ordinary dance','dance'),
];
const base={clips:fixtures,trackId:'song',modelKey:'same-avatar-model',
 progressMs:0,section:'verse',genre:'deutschrap',bpm:110,energy:.55,
 slot:0,ensembleCount:3,playing:true,reducedMotion:false,manualPriority:false};
const input=(opts={})=>({...base,...opts});
function pipeline(raw){
 // Mirrors the shared selection lane used in the React hook. No frame loops.
 const eligibleMixamo=raw.clips.some(c=>c.source==='library'&&/mixamo/i.test(c.label)&&
   v536.validGenreCandidateV536(c)&&v536.libraryMotionEligibleV536(c,raw));
 const slot=cues.mixamoEnsembleSelectionSlot({
   slot:raw.slot,ensembleCount:raw.ensembleCount??1,section:raw.section,
   hasEligibleMixamo:eligibleMixamo,
 });
 const prepared={...raw,slot};
 const first=v536.stepGenreMotionV536(v536.newGenreMotionStateV536(),prepared);
 const long=v588.stepLongFormChoreographyV588(v588.newLongFormMotionStateV588(),prepared,first);
 const varied=v615.stepChoreographyVarietyV615(v615.newChoreographyVarietyStateV615(),prepared,long.selectedName);
 return v639.stepIntelligentMotionLibraryV639(v639.newIntelligentMotionLibraryStateV639(),prepared,varied.selectedName).selectedName;
}

assert.equal(cues.mixamoShowPhase('Pre-Drop Build'),'build');
assert.equal(cues.mixamoShowPhase('Intro Break'),'quiet');
assert.equal(cues.mixamoShowPhase('German Rap Verse'),'verse');
assert.equal(cues.mixamoShowPhase('Chorus Hook'),'hook');
assert.equal(cues.mixamoShowPhase('Hardstyle Drop'),'drop');
assert.deepEqual(cues.mixamoShowCue('verse',0,3),{phase:'verse',role:'lead',commonPhrase:false});
assert.deepEqual(cues.mixamoShowCue('verse',2,3),{phase:'verse',role:'support',commonPhrase:false});
assert.deepEqual(cues.mixamoShowCue('hook',2,3),{phase:'hook',role:'unison',commonPhrase:true});
assert.deepEqual(cues.mixamoShowCue('drop',1,4),{phase:'drop',role:'unison',commonPhrase:true});
assert.deepEqual(cues.mixamoShowCue('hook',0,1),{phase:'hook',role:'solo',commonPhrase:false});
assert.equal(cues.mixamoEnsembleSelectionSlot({slot:2,ensembleCount:3,section:'drop',hasEligibleMixamo:true}),0);
assert.equal(cues.mixamoEnsembleSelectionSlot({slot:2,ensembleCount:3,section:'verse',hasEligibleMixamo:true}),2);
assert.equal(cues.mixamoEnsembleSelectionSlot({slot:2,ensembleCount:3,section:'hook',hasEligibleMixamo:false}),2);
assert.equal(cues.mixamoEnsembleSelectionSlot({slot:2,ensembleCount:1,section:'hook',hasEligibleMixamo:true}),2);

// Human-readable style cues, all bounded. These are preferences, not
// hard eligibility or an attempt to recognize actual motion capture poses.
assert(score('Mixamo Rap Freestyle Gesture','rap','verse',0)>score('Mixamo Rap Groove Bounce','rap','verse',0));
assert(score('Mixamo Rap Groove Bounce','rap','verse',2)>score('Mixamo Rap Freestyle Gesture','rap','verse',2));
assert(score('Mixamo Rap Groove Bounce','rap','hook')>score('Mixamo Idle Breathing','rap','hook'));
assert(score('Mixamo Hakken Footwork','hardtekk','drop')>score('Mixamo Rap Freestyle Gesture','hardtekk','drop'));
assert(score('Mixamo Jumpstyle Stomp','hardstyle','drop')>score('Mixamo Hakken Footwork','hardstyle','drop'));
assert(score('Mixamo Rave Shuffle','hardtekk','pre-drop build')>score('Mixamo Jumpstyle Stomp','hardtekk','pre-drop build'));
assert(score('Mixamo Idle Breathing','hardstyle','intro')>score('Mixamo Jumpstyle Stomp','hardstyle','intro'));
assert.equal(score('Rap Freestyle Gesture','rap','verse'),0,'other libraries remain unmodified');
assert.equal(score('Mixamo Rap Freestyle','pop','verse'),0,'other genre families unchanged');
for(const name of ['Mixamo Rap Groove','Mixamo Hakken Footwork','Mixamo Jumpstyle Stomp','Mixamo Idle','mixamo']){
 for(const phase of ['verse','hook','drop','build','quiet']){
  const v=score(name,'rap',phase,3,4,NaN);
  assert(Number.isFinite(v)&&v>=-1.2&&v<=1.2);
 }
}

// Same model + same available repertoire + shared song section = the same
// selected clip during hook/drop, despite separate per-avatar director states.
for(const section of ['hook','drop']){
 const stageGenre=section==='drop'?'hardstyle':'deutschrap';
 const shared=Array.from({length:4},(_,slot)=>pipeline(input({
   slot,ensembleCount:4,section,genre:stageGenre,progressMs:62000,bpm:150,energy:.9,
 })));
 assert(shared[0]&&shared.every(name=>name===shared[0]),'shared '+section+': '+shared.join(', '));
}
assert.equal(pipeline(input({manualPriority:true,section:'hook'})),null);
assert.equal(pipeline(input({playing:false,section:'drop'})),null);
assert.equal(pipeline(input({reducedMotion:true,section:'drop'})),null);
assert.equal(pipeline(input({clips:[],section:'hook'})),null);
const source=JSON.stringify(fixtures);
pipeline(input({section:'drop',genre:'hardstyle',bpm:154}));
assert.equal(JSON.stringify(fixtures),source,'source clips untouched');

// Hard user constraints win even over perfect filename cues.
const restricted=[
 stage('Mixamo Hakken Footwork','energetic','hardtekk','drop'),
 stage('Mixamo Jumpstyle Stomp','energetic','hardstyle','drop'),
];
const rapPool=v536.rankGenreMotionsV536(input({clips:restricted,genre:'deutschrap',section:'drop',bpm:150}),'drop:2');
assert.deepEqual(rapPool,[]);
const outOfBpm=v536.rankGenreMotionsV536(input({clips:restricted,genre:'hardtekk',section:'drop',bpm:190}),'drop:2');
assert.deepEqual(outOfBpm,[]);
const valid=v536.rankGenreMotionsV536(input({clips:restricted,genre:'hardtekk',section:'drop',bpm:155}),'drop:2');
assert.deepEqual(valid.map(c=>c.name),[restricted[0].name]);

const hook=fs.readFileSync('components/visualizer/useGenreAwareMotionDirectorV536.ts','utf8');
const avatar=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
const engine=fs.readFileSync('components/visualizer/genreAwareMotionDirectorV536.ts','utf8');
const show=fs.readFileSync('components/visualizer/mixamoShowChoreography.ts','utf8');
assert(hook.includes('mixamoEnsembleSelectionSlot('));
assert(hook.includes('stepLongFormChoreographyV588('));
assert(hook.includes('stepChoreographyVarietyV615('));
assert(hook.includes('stepIntelligentMotionLibraryV639('));
assert(hook.includes('stageInput,varied.selectedName'));
assert(avatar.includes('ensembleCount:ensembleCountV745??propsLipSyncV367?.ensembleCountV374??1'));
assert(avatar.includes('useGltfClipTransitionsV492('),'existing pose crossfade remains owner');
assert(engine.includes('libraryMotionEligibleV536(c,input)'));
assert(engine.includes('c.source==="library")score+=mixamoShowCueBias('));
for(const forbidden of ['Math.random(', 'Date.now(', 'fetch(', 'requestAnimationFrame(', 'new AnimationMixer(', 'new AnimationClip(', 'setInterval(', 'useFrame(']){
 assert(!show.includes(forbidden),forbidden);
}
console.log('PASS Mixamo show section cues, lead/support, unison selection, hard library eligibility and manual ownership');
