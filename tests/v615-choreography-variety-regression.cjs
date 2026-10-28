'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {
 newChoreographyVarietyStateV615:newState,
 rankChoreographyVarietyV615:rank,
 stepChoreographyVarietyV615:step,
}=load('components/visualizer/intelligentChoreographyVarietyV615');
const {musicalWindowV588}=load('components/visualizer/longFormChoreographyV588');
const {newPresetDirectorStateV493,stepMotionPresetDirectorV493}=load('components/visualizer/intelligentMotionPresetDirectorV493');
const clip=(name,category='dance')=>({name,label:name,category,duration:3.2,trackCount:90,source:'embedded'});
const clips=[...Array.from({length:14},(_,i)=>clip(`Rap_TwoStep_${i}`,'rap')),
 ...Array.from({length:12},(_,i)=>clip(`Dance_Groove_${i}`)),
 ...Array.from({length:10},(_,i)=>clip(`Hardstyle_Stomp_${i}`,'energetic')),
 clip('Idle_Groove','idle'),clip('Walk','locomotion')];
const base={trackId:'v615',modelKey:'avatar',clips,progressMs:0,section:'verse',genre:'Deutschrap',bpm:108,
 energy:.56,slot:0,playing:true,reducedMotion:false,manualPriority:false};
let groups=0;
const test=(label,fn)=>{try{fn();groups++;}catch(e){e.message=`V615 ${label}: ${e.message}`;throw e;}};
const invoke=(state,overrides={},proposed='Rap_TwoStep_0')=>step(state,{...base,...overrides},proposed);
test('starts with the approved V588 suggestion',()=>assert.equal(invoke(newState()).selectedName,'Rap_TwoStep_0'));
test('does not override manual selections, pause or reduced motion',()=>{
 for(const extra of [{manualPriority:true},{playing:false},{reducedMotion:true},{trackId:null},{modelKey:''}]){
  const r=invoke(newState(),extra);assert.equal(r.selectedName,null);assert.equal(r.recent.length,0);
 }
});
test('keeps loaded valid candidates and their bytes',()=>{
 const json=JSON.stringify(clips),first=invoke(newState());
 assert(clips.some(c=>c.name===first.selectedName));assert.equal(JSON.stringify(clips),json);
});
test('only selects compatible genre/section clips',()=>{
 const rankQuiet=rank({...base,section:'intro',energy:.10},newState(),null);
 assert.equal(rankQuiet[0].name,'Idle_Groove');
 const rankHard=rank({...base,section:'drop',genre:'Hardstyle',energy:.94},newState(),null);
 assert(rankHard[0].name.startsWith('Hardstyle_'));
});
test('avoids unsafe locomotion when stationary alternatives exist',()=>{
 assert(!rank(base,newState(),null).some(c=>c.name==='Walk'));
});
test('does not invent animation when no compatible clips exist',()=>{
 assert.equal(invoke(newState(),{clips:[]},null).selectedName,null);
 assert.equal(invoke(newState(),{clips:[{...clip('bad'),trackCount:0}]},null).selectedName,null);
});
test('single action remains stable',()=>{
 let st=newState();
 for(let i=0;i<55;i++){st=invoke(st,{clips:[clip('Rap_Only','rap')],progressMs:i*24000},'Rap_Only');
  assert.equal(st.selectedName,'Rap_Only');}
});
test('no same-window per-frame rescoring',()=>{
 const st=invoke(newState());const again=invoke(st,{progressMs:300});
 assert.strictEqual(again.clips,clips);assert.strictEqual(again.usage,st.usage);
});
test('different track and model reset the recent history',()=>{
 let state=invoke(newState());state=invoke(state,{trackId:'other',progressMs:0});
 assert.equal(state.trackId,'other');assert.equal(state.recent.length,1);
 state=invoke(state,{modelKey:'other-model',progressMs:0});assert.equal(state.recent.length,1);
});
test('seek resets history without reusing future selection',()=>{
 const state=invoke(newState(),{progressMs:25_000});
 const seek=invoke(state,{progressMs:0});assert.equal(seek.lastSwitchMs,0);
});
test('uses true adjacent windows for rotation and retains cooldown',()=>{
 const duration=musicalWindowV588(base).durationMs;let st=invoke(newState(),{progressMs:duration-1200});
 const first=st.selectedName;
 st=invoke(st,{progressMs:duration+100});assert.equal(st.selectedName,first);assert(st.pendingName);
 st=invoke(st,{progressMs:duration+7000});assert.equal(st.selectedName,first);
 st=invoke(st,{progressMs:duration+9000});assert.notEqual(st.selectedName,first);
});
test('loaded library has no fixed 20/64 clip cap',()=>{
 const huge=Array.from({length:130},(_,i)=>clip(`Rap_TwoStep_${i}`,'rap'));
 const r=rank({...base,clips:huge},newState(),null);
 assert.equal(r.length,130);
});
test('unique shot slots can pick different compatible motions',()=>{
 const choices=Array.from({length:5},(_,slot)=>invoke(newState(),{slot},null).selectedName);
 assert(new Set(choices).size>=2);
});
test('no date timers random GLB downloads or own animation mixer',()=>{
 const src=fs.readFileSync('components/visualizer/intelligentChoreographyVarietyV615.ts','utf8');
 for(const token of ['Math.random(', 'Date.now(', 'fetch(', 'new AnimationMixer(', 'setInterval(', 'useFrame('])
  assert(!src.includes(token),token);
});
test('runtime hookup reuses V536/V588 and leaves manual overrides intact',()=>{
 const hook=fs.readFileSync('components/visualizer/useGenreAwareMotionDirectorV536.ts','utf8');
 const avatar=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
 for(const x of ['stepGenreMotionV536','stepLongFormChoreographyV588','stepChoreographyVarietyV615','planned.selectedName','manualPriority'])assert(hook.includes(x));
 for(const x of ['manualGenrePriorityV536','!!activeSequence','!!activeLoop','timelineEnabled','avatarBlendEnabled','stableLibraryClip','useGltfClipTransitionsV492'])assert(avatar.includes(x));
});
test('preset gestures rotate without breaking base clip ownership',()=>{
 const p=[0,1,2,3].map(i=>({actionName:`preset-${i}`,presetId:`p${i}`,baseName:'Rap_TwoStep',region:'upper',genre:'rap',weight:.25}));
 let s=newPresetDirectorStateV493();const seen=new Set();let changes=0,last=-Infinity;
 for(let ms=0;ms<=300000;ms+=1000){
  const next=stepMotionPresetDirectorV493(s,{candidates:p,selectedBase:'Rap_TwoStep',trackId:'track',positionMs:ms,
   section:'verse',energy:.55,bpm:103,slot:0,playing:true,reducedMotion:false,manualPriority:false,quality:'high'});
  if(s.selectedId&&next.selectedId!==s.selectedId){assert(ms-last>=10000);changes++;last=ms;}
  seen.add(next.selectedId);s=next;
 }
 assert(changes>=3);assert(seen.size>=3);
});
let samples=0,changes=0,previous=null,unique=new Set(),lastChange=-Infinity;
let st=newState(),duration=musicalWindowV588(base).durationMs;
for(let ms=0;ms<=420000;ms+=50){
 const section=ms<150000?'verse':ms<250000?'hook':ms<310000?'verse':'drop';
 const genre=ms<310000?'Deutschrap':'Hardstyle';
 const next=invoke(st,{progressMs:ms,section,genre,energy:section==='drop'?.95:.60},null);
 assert(next.selectedName&&clips.some(c=>c.name===next.selectedName));
 if(previous!==null&&next.selectedName!==previous){assert(ms-lastChange>=9000);lastChange=ms;changes++;}
 previous=next.selectedName;unique.add(next.selectedName);st=next;
 samples++;
}
test('full-song playback yields genuine variation',()=>{assert(changes>10);assert(unique.size>=12);});
test('stable timeline snapshots and read-only state',()=>{
 const input={...base,progressMs:duration*5.2};
 const frozen=Object.freeze({...newState()});
 assert.deepEqual(step(frozen,input,null),step(frozen,input,null));
});
console.log(`PASS V615: ${groups} groups, ${samples} deterministic full-song samples, ${unique.size} distinct clips`);
