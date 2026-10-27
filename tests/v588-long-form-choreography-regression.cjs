'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {musicalWindowV588,planLongFormChoreographyV588,stepLongFormChoreographyV588,
  newLongFormMotionStateV588}=load('components/visualizer/longFormChoreographyV588');
const {newGenreMotionStateV536,stepGenreMotionV536}=load('components/visualizer/genreAwareMotionDirectorV536');
let groups=0;
function test(name,fn){try{fn();groups++;}catch(e){e.message=`V588 [${name}] ${e.message}`;throw e;}}
const clip=(n,cat='rap',source='embedded')=>({name:n,label:n,duration:2.5,trackCount:45,
  source,category:cat});
const clips=[...Array.from({length:12},(_,i)=>clip(`Rap_Flow_${i}`)),
  ...Array.from({length:10},(_,i)=>clip(`Dance_Groove_${i}`,'dance')),
  ...Array.from({length:8},(_,i)=>clip(`Hardstyle_Stomp_${i}`,'energetic')),
  ...Array.from({length:5},(_,i)=>clip(`Idle_${i}`,'idle')),
  ...Array.from({length:4},(_,i)=>clip(`Walk_${i}`,'locomotion')),
  ...Array.from({length:85},(_,i)=>clip(`Library:motion${i}:0`,'rap','library'))];
const base={clips,trackId:'track-v588',modelKey:'avatar-1',progressMs:0,section:'verse',genre:'Deutschrap',
  bpm:108,energy:.56,slot:0,playing:true,reducedMotion:false,manualPriority:false};
const previous=newGenreMotionStateV536();
const baseline=(input)=>stepGenreMotionV536(previous,input);
const plan=(overrides={})=>planLongFormChoreographyV588({...base,...overrides});
const step=(state,overrides={})=>{const input={...base,...overrides};return stepLongFormChoreographyV588(state,input,baseline(input));};
test('32-beat beat-index with bounded windows and invalid tempo fallback',()=>{
 assert(musicalWindowV588(base).durationMs>10_000);
 assert.equal(musicalWindowV588({...base,bpm:NaN}).durationMs,16_000);
 assert(musicalWindowV588({...base,bpm:220}).durationMs>=10_000);
 assert(musicalWindowV588({...base,bpm:55}).durationMs<=28_000);
 assert(musicalWindowV588({...base,bpm:-90}).durationMs>0);
});
test('long-song playlist uses more than 20 and 64 available library actions',()=>{
 const seen=new Set();const duration=musicalWindowV588(base).durationMs;
 for(let i=0;i<100;i++)seen.add(plan({progressMs:(i+.12)*duration}).name);
 assert(seen.size>30,`only ${seen.size} unique actions in 100 musical phrases`);
 assert(seen.has('Library:motion70:0')||[...seen].filter(x=>x?.startsWith('Library:')).length>=30);
});
test('no immediate repeat for a stable pool throughout a song',()=>{
 const same=Array.from({length:9},(_,i)=>clip(`Rap_TwoStep_${i}`));
 const duration=musicalWindowV588(base).durationMs;
 let prev=null;
 for(let i=0;i<32;i++){
  const found=plan({clips:same,progressMs:(i+.2)*duration});
  assert.equal(found.poolSize,9);
  if(prev)assert.notEqual(found.name,prev);
  prev=found.name;
 }
});
test('seek and play order do not change the window plan',()=>{
 const point=132_000,first=plan({progressMs:point});
 for(let i=0;i<50;i++)plan({progressMs:i*3_000});
 assert.deepEqual(plan({progressMs:point}),first);
 assert.deepEqual(plan({progressMs:point}),plan({progressMs:point}));
});
test('different artists slots can have distinct choreography',()=>{
 const names=Array.from({length:4},(_,slot)=>plan({slot}).name);
 assert(new Set(names).size>=2,`all performers picked ${names[0]}`);
});
test('musically different genre and section changes repertoire',()=>{
 const quiet=plan({section:'intro',energy:.15});
 const hard=plan({genre:'Hardstyle',section:'drop',energy:.94});
 assert(quiet.name&&hard.name);assert.notEqual(quiet.name,hard.name);
 assert(/^Idle_/.test(quiet.name),`quiet became ${quiet.name}`);
 assert(/^Hardstyle_/.test(hard.name),`drop became ${hard.name}`);
});
test('owner controls: manual, reduced, pause and unknown track never choose',()=>{
 for(const entry of [{manualPriority:true},{reducedMotion:true},{playing:false},{trackId:null},{modelKey:''}]){
  assert.equal(plan(entry).name,null);assert.equal(step(newLongFormMotionStateV588(),entry).selectedName,null);
 }
});
test('single compatible clip falls back to V536 instead of forcing variation',()=>{
 const input={clips:[clip('Rap_Only')]};const p=plan(input);
 assert.equal(p.name,null);const out=step(newLongFormMotionStateV588(),input);
 assert.equal(out.selectedName,'Rap_Only');
});
test('manually installed and retargeted clips are never modified or fetched',()=>{
 const serialized=JSON.stringify(clips);
 const out=plan();assert(clips.some(c=>c.name===out.name));assert.equal(JSON.stringify(clips),serialized);
 for(const word of ['new AnimationClip','new AnimationMixer','useFrame(','requestAnimationFrame','fetch(','Math.random(','Date.now('])
  assert(!fs.readFileSync('components/visualizer/longFormChoreographyV588.ts','utf8').includes(word),word);
});
test('locomotion is omitted from rotation when safe stationary alternatives exist',()=>{
 for(let i=0;i<45;i++)assert(!plan({progressMs:i*19_000}).name?.startsWith('Walk_'));
});
test('8-second safety cooldown and pending phrase without frame-wise rescoring',()=>{
 const stableClips=Array.from({length:5},(_,i)=>clip(`Rap_TwoStep_${i}`));
 const duration=musicalWindowV588(base).durationMs;
 let st=step(newLongFormMotionStateV588(),{clips:stableClips,progressMs:duration-1000});
 const initial=st.selectedName;
 st=step(st,{clips:stableClips,progressMs:duration+100});
 assert.equal(st.selectedName,initial);assert(st.pendingName, 'transition was not deferred');
 let prev=st;for(let i=1;i<80;i++){
  st=step(st,{clips:stableClips,progressMs:duration+100+i*80});
  assert.strictEqual(st.pendingName,prev.pendingName);prev=st;
 }
 st=step(st,{clips:stableClips,progressMs:duration+7150});
 assert.notEqual(st.selectedName,initial);assert.equal(st.pendingName,null);
});
test('section changes do not thrash playback or bypass cooldown',()=>{
 let st=step(newLongFormMotionStateV588(),{progressMs:20_000});
 let lastChange=20_000;
 for(let i=0;i<600;i++){
  const ms=20_050+i*50;
  const section=i%3===0?'hook':i%3===1?'verse':'drop';
  const next=step(st,{progressMs:ms,section});
  if(next.selectedName!==st.selectedName){assert(ms-lastChange>=8_000);lastChange=ms;}
  st=next;
 }
});
test('change of GLB, track, invalid clip, pause, seek clears old assignment',()=>{
 const start=step(newLongFormMotionStateV588());
 for(const entry of [{trackId:'new'}, {modelKey:'avatar-2'},{progressMs:96_000},{progressMs:0},
     {manualPriority:true},{playing:false},{reducedMotion:true}]){
  const next=step(start,entry);
  if(entry.manualPriority||entry.playing===false||entry.reducedMotion)assert.equal(next.selectedName,null);
  if(entry.trackId)assert.equal(next.trackId,entry.trackId);
  if(entry.modelKey)assert.equal(next.modelKey,entry.modelKey);
 }
 const removed=step(start,{clips:[clip('Rap_Replacement')]});
 assert.equal(removed.selectedName,'Rap_Replacement');
});
test('invalid or empty library falls back to original selection safely',()=>{
 assert.equal(plan({clips:[]}).name,null);
 assert.equal(step(newLongFormMotionStateV588(),{clips:[]}).selectedName,null);
 assert.equal(plan({clips:[clip('x'),{...clip('broken'),trackCount:0}]}).name,null);
});
test('runtime wiring reuses existing V536 hook, library metadata, crossfade and safety policy',()=>{
 const hook=fs.readFileSync('components/visualizer/useGenreAwareMotionDirectorV536.ts','utf8');
 const glb=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
 for(const word of ['stepLongFormChoreographyV588','newLongFormMotionStateV588','stepGenreMotionV536','manualPriority'])assert(hook.includes(word));
 for(const word of ['useGenreAwareMotionDirectorV536','libraryClips.flatMap','library.automatic',
   'genreCrossfadeSecondsV536','useGltfClipTransitionsV492','stableLibraryClip',"avatarMotionMode!=='hybrid'"])assert(glb.includes(word));
});
test('20,000 playback samples, stable loaded-action ownership and deterministic seeks',()=>{
 let st=newLongFormMotionStateV588(),changes=0,used=new Set(),lastMs=-Infinity;
 const duration=musicalWindowV588(base).durationMs;
 for(let i=0;i<20000;i++){
  const ms=i*45;const section=ms<180000?'verse':ms<320000?'hook':ms<420000?'verse':'drop';
  const genre=ms>420000?'Hardtekk':'Deutschrap';
  const next=step(st,{progressMs:ms,section,genre,energy:ms>420000?.92:.57});
  assert(next.selectedName&&clips.some(c=>c.name===next.selectedName));
  if(st.selectedName&&st.selectedName!==next.selectedName){assert(ms-lastMs>=8_000);lastMs=ms;changes++;}
  used.add(next.selectedName);st=next;
 }
 assert(changes>10,`only ${changes} switches`);assert(used.size>12,`only ${used.size} different clips`);
 assert.equal(plan({progressMs:12*duration}).name,plan({progressMs:12*duration}).name);
});
console.log(`PASS V588: ${groups} test groups, 20,000 playback samples, long-song repertoire rotation and backwards-compatible GLB safety`);
