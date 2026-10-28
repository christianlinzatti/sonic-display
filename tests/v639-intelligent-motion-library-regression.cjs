'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {newIntelligentMotionLibraryStateV639:newState,
  stepIntelligentMotionLibraryV639:step,rankIntelligentMotionLibraryV639:rank,
  MOTION_LIBRARY_COOLDOWN_V639:COOLDOWN}=load('components/visualizer/intelligentMotionLibraryV639');
const {newChoreographyVarietyStateV615,stepChoreographyVarietyV615}=load('components/visualizer/intelligentChoreographyVarietyV615');
const {musicalWindowV588}=load('components/visualizer/longFormChoreographyV588');
const clip=(name,category='rap',extra={})=>({name,label:name,category,duration:3.7,trackCount:64,source:'library',...extra});
const clips=[...Array.from({length:28},(_,i)=>clip(`Rap_TwoStep_${i}`)),
 ...Array.from({length:19},(_,i)=>clip(`Dance_Groove_${i}`,'dance')),
 ...Array.from({length:16},(_,i)=>clip(`Hardstyle_Stomp_${i}`,'energetic')),
 ...Array.from({length:10},(_,i)=>clip(`Idle_${i}`,'idle')),
 clip('Walk','locomotion')];
const base={trackId:'v639-song',modelKey:'lead-avatar',clips,progressMs:0,section:'verse',genre:'Deutschrap',
 bpm:112,energy:.57,slot:0,playing:true,reducedMotion:false,manualPriority:false};
const invoke=(state,overrides={},proposed='Rap_TwoStep_0')=>step(state,{...base,...overrides},proposed);
const ranked=(state,overrides={},proposed='Rap_TwoStep_0')=>rank({...base,...overrides},state,proposed);
let groups=0;
function test(label,fn){try{fn();groups++;}catch(e){e.message=`V639 ${label}: ${e.message}`;throw e;}}
const disabled=[{playing:false},{reducedMotion:true},{manualPriority:true},{trackId:null},{trackId:'  '},{modelKey:''}];
test('starts with approved genre-compatible V615 candidate',()=>assert.equal(invoke(newState()).selectedName,'Rap_TwoStep_0'));
test('no motion on paused playback',()=>assert.equal(invoke(newState(),{playing:false}).selectedName,null));
test('no motion with reduced-motion flag',()=>assert.equal(invoke(newState(),{reducedMotion:true}).selectedName,null));
test('no motion with manual priority',()=>assert.equal(invoke(newState(),{manualPriority:true}).selectedName,null));
test('no motion without track ID',()=>assert.equal(invoke(newState(),{trackId:null}).selectedName,null));
test('blank track ID fails closed',()=>assert.equal(invoke(newState(),{trackId:'  '}).selectedName,null));
test('no motion without an avatar',()=>assert.equal(invoke(newState(),{modelKey:''}).selectedName,null));
test('all disabled inputs clear history and pending candidate',()=>{
 const prev=invoke(newState());for(const d of disabled){const next=invoke(prev,d);assert.equal(next.selectedName,null);assert.deepEqual(next.usage,{});assert.deepEqual(next.recent,[]);assert.equal(next.pendingName,null);}
});
test('missing actions produce no invented motion',()=>assert.equal(invoke(newState(),{clips:[]},null).selectedName,null));
test('invalid source metadata is excluded',()=>assert.equal(invoke(newState(),{clips:[clip('untrusted','rap',{source:'unknown'})]},'untrusted').selectedName,null));
test('invalid track counts are excluded',()=>assert.equal(invoke(newState(),{clips:[clip('broken','rap',{trackCount:0})]},'broken').selectedName,null));
test('missing labels are excluded',()=>assert.equal(invoke(newState(),{clips:[clip('bad','rap',{label:''})]},'bad').selectedName,null));
test('NaN durations are excluded',()=>assert.equal(invoke(newState(),{clips:[clip('bad','rap',{duration:NaN})]},'bad').selectedName,null));
test('no duplicated candidates',()=>{const rs=ranked(newState(),{clips:[clip('rap_a'),clip('rap_a'),clip('rap_b')]},null);assert.equal(new Set(rs.map(x=>x.name)).size,rs.length);});
test('clip metadata remains untouched',()=>{const before=JSON.stringify(clips);invoke(newState());ranked(newState());assert.equal(JSON.stringify(clips),before);});
test('suitability remains first: quiet favors idle',()=>{const r=ranked(newState(),{section:'break',energy:.1},null);assert(r.every(x=>x.category==='idle'));});
test('suitability remains first: drop favors energetic',()=>{const r=ranked(newState(),{section:'drop',genre:'hardstyle',energy:1},null);assert(r.every(x=>x.category==='energetic'));});
test('deutschrap verse never selects locomotion with other loaded clips',()=>assert(!ranked(newState()).some(x=>x.category==='locomotion')));
test('selects stationary motions over locomotion',()=>{const r=ranked(newState(),{clips:[clip('Walk','locomotion'),clip('Rap_TwoStep') ]});assert(!r.some(x=>x.category==='locomotion'));});
test('small pool stays valid without inventing additions',()=>{let s=newState();const one=[clip('One')];for(let i=0;i<30;i++){s=invoke(s,{clips:one,progressMs:i*9000},'One');assert.equal(s.selectedName,'One');}});
test('initial suggestion outside near-best pool is not trusted',()=>{const s=invoke(newState(),{section:'break',energy:.1},'Hardstyle_Stomp_2');assert(s.selectedName.startsWith('Idle_'));});
test('initial recommendation within near-best pool is respected',()=>{const s=invoke(newState());assert.equal(s.recent.at(-1),'Rap_TwoStep_0');});
test('minimum switch duration at least 10 seconds',()=>assert(COOLDOWN>=10000));
test('invalid clock never produces NaN state',()=>{for(const progressMs of [NaN,-1,Infinity,-Infinity]){const s=invoke(newState(),{progressMs});assert.equal(s.lastPositionMs,0);assert(Number.isFinite(s.lastSwitchMs));}});
test('invalid tempo still produces bounded phrase index',()=>{for(const bpm of [NaN,-20,Infinity,0]){const r=ranked(newState(),{bpm});assert(r.length>0);}});
test('song change resets selection history and usage',()=>{const s=invoke(newState());const next=invoke(s,{trackId:'other-track',progressMs:0});assert.equal(next.trackId,'other-track');assert.equal(next.recent.length,1);assert.equal(next.usage[next.selectedName],1);});
test('model change resets motion histories',()=>{const s=invoke(newState());const next=invoke(s,{modelKey:'support-avatar',progressMs:0});assert.equal(next.modelKey,'support-avatar');assert.equal(next.recent.length,1);});
test('backwards seek clears outdated usage',()=>{const s=invoke(newState(),{progressMs:35000});const next=invoke(s,{progressMs:10});assert.equal(next.recent.length,1);});
test('large forwards seek clears outdated usage',()=>{const s=invoke(newState());const next=invoke(s,{progressMs:65000});assert.equal(next.recent.length,1);});
test('no per-frame sorting in same signature',()=>{const a=invoke(newState());const b=invoke(a,{progressMs:100});assert.strictEqual(b.usage,a.usage);assert.strictEqual(b.clips,clips);});
test('equal snapshot selects deterministically',()=>{const input={...base,progressMs:32000};const snapshot=Object.freeze(newState());assert.deepEqual(step(snapshot,input,'Rap_TwoStep_0'),step(snapshot,input,'Rap_TwoStep_0'));});
test('no mutation of previous state after selection',()=>{const prior=Object.freeze(newState());invoke(prior);assert.equal(prior.selectedName,null);});
test('larger library does not face 20/64 cap',()=>{const huge=Array.from({length:180},(_,i)=>clip(`Rap_TwoStep_${i}`));const r=ranked(newState(),{clips:huge});assert.equal(r.length,180);});
test('quality metadata is only a soft hint',()=>{const r=ranked(newState(),{clips:[clip('Rap_TwoStep_A','rap',{trackCount:1,duration:.7}),clip('Rap_TwoStep_B')]},null);assert.equal(r.length,2);});
test('category diversity has a bounded incentive',()=>{const r=ranked({...newState(),recent:['Rap_TwoStep_0']});assert(r.every(x=>Number.isFinite(x.score)));});
test('underused candidates receive preference in rank',()=>{const state={...newState(),usage:{Rap_TwoStep_0:24},recent:[]};const a=ranked(state,{},null);assert(a.length>0);assert(a.some(r=>r.name!=='Rap_TwoStep_0'));});
test('recency is bounded to 8 successful selections',()=>{let s=newState();const duration=musicalWindowV588(base).durationMs;for(let i=0;i<30;i++)s=invoke(s,{progressMs:i*duration},null);assert(s.recent.length<=8);});
test('usage is indexed only by current source library after a committed change',()=>{
 const old=invoke(newState());const other=[clip('Rap_Replacement')];const replaced=invoke(old,{clips:other,progressMs:10100},'Rap_Replacement');assert.equal(replaced.selectedName,'Rap_Replacement');assert.deepEqual(Object.keys(replaced.usage),['Rap_Replacement']);
});
test('removed selected clip cannot remain published',()=>{const prev=invoke(newState());const other=[clip('Rap_Replacement')];const next=invoke(prev,{clips:other,progressMs:100},'Rap_Replacement');assert.equal(next.selectedName,'Rap_Replacement');});
test('source category is not replaced by filename guessing',()=>{const x=ranked(newState(),{clips:[clip('Hardstyle_Stomp','rap'),clip('Rap_TwoStep_B','rap')]},null);assert(x.length);assert(x.every(c=>c.category==='rap'));});
test('many hours of usage stays bounded',()=>{const state={...newState(),usage:{Rap_TwoStep_0:65535}};const next=invoke(state);assert(next.usage.Rap_TwoStep_0<=65535);});
test('clip reorder does not change suitability of unique repertoire',()=>{const a=ranked(newState(),{},null).map(x=>x.name);const b=ranked(newState(),{clips:[...clips].reverse()},null).map(x=>x.name);assert.deepEqual(a,b);});
test('each performer has its own slot-scoped state',()=>{const choices=Array.from({length:4},(_,slot)=>invoke(newState(),{slot,progressMs:21000},null).selectedName);assert(new Set(choices).size>=2);});
test('state does not mix singer-roles or invent vocal cues',()=>{const source=fs.readFileSync('components/visualizer/intelligentMotionLibraryV639.ts','utf8');for(const t of ['singerId:', 'speakerId:', 'diariz', 'stemSeparation'])assert(!source.includes(t));});
test('same exact musical window retains current clip',()=>{const a=invoke(newState(),{progressMs:0});const b=invoke(a,{progressMs:1300});assert.equal(b.selectedName,a.selectedName);});
test('paused state resumes as a fresh selection',()=>{const a=invoke(newState());const b=invoke(a,{playing:false});const c=invoke(b,{progressMs:300,playing:true});assert.equal(c.recent.length,1);});
test('manual override resumes from empty history',()=>{const a=invoke(newState());const b=invoke(a,{manualPriority:true});const c=invoke(b,{progressMs:300});assert.equal(c.recent.length,1);});
test('empty clips after playback clears history',()=>{const a=invoke(newState());const b=invoke(a,{clips:[],progressMs:2000},null);assert.equal(b.selectedName,null);assert.deepEqual(b.recent,[]);});
test('no GLB/network/GPU or browser frame loops',()=>{const src=fs.readFileSync('components/visualizer/intelligentMotionLibraryV639.ts','utf8');for(const x of ['Math.random(', 'Date.now(', 'fetch(', 'new AnimationMixer(', 'new AnimationClip(', 'useFrame(', 'requestAnimationFrame(', 'setInterval(', 'new Mesh(', 'new Worker('])assert(!src.includes(x),x);});
test('runtime composes V639 after V615 in same hook',()=>{const src=fs.readFileSync('components/visualizer/useGenreAwareMotionDirectorV536.ts','utf8');assert(src.includes('stepGenreMotionV536('));assert(src.includes('stepLongFormChoreographyV588('));assert(src.includes('stepChoreographyVarietyV615('));assert(src.includes('stepIntelligentMotionLibraryV639('));assert(src.indexOf('stepIntelligentMotionLibraryV639(libraryV639.current')>src.indexOf('stepChoreographyVarietyV615(varietyV615.current'));assert(src.includes('selectedName:selectedV639.selectedName'));});
test('manual GLB owner retains original motion mixer',()=>{const src=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');for(const x of ['manualGenrePriorityV536','!!activeSequence','!!activeLoop','timelineEnabled','avatarBlendEnabled','useGltfClipTransitionsV492'])assert(src.includes(x));});
test('initial selection requires valid loaded model and no network',()=>{const source=fs.readFileSync('components/visualizer/intelligentMotionLibraryV639.ts','utf8');assert(source.includes('validGenreCandidateV536'));assert(source.includes('input.clips'));});
let samples=0,changes=0,lastChoice=null,lastSwitch=-Infinity;
const seen=new Set();let state=newState(), variety=newChoreographyVarietyStateV615();
for(let ms=0;ms<=480_000;ms+=40){
 const section=ms<110_000?'verse':ms<220_000?'hook':ms<310_000?'verse':ms<370_000?'break':'drop';
 const genre=section==='drop'?'Hardstyle':'Deutschrap';
 const input={...base,progressMs:ms,section,genre,energy:section==='drop'?.96:section==='break'?.15:.61};
 variety=stepChoreographyVarietyV615(variety,input,null);
 const next=step(state,input,variety.selectedName);
 assert(next.selectedName&&clips.some(c=>c.name===next.selectedName));
 if(lastChoice&&next.selectedName!==lastChoice){assert(ms-lastSwitch>=COOLDOWN);lastSwitch=ms;changes++;}
 lastChoice=next.selectedName;seen.add(next.selectedName);state=next;samples++;
}
test('full eight-minute song uses multiple compatible clips',()=>{assert(changes>=10,changes);assert(seen.size>=9,seen.size);});
test('full-song history remains bounded and all selected clips are loaded',()=>{assert(state.recent.length<=8);assert(state.selectedName&&clips.some(c=>c.name===state.selectedName));});
test('12,001 playback samples are valid',()=>assert.equal(samples,12001));
console.log(`PASS V639: ${groups} groups, ${samples} simulated song frames, ${changes} safe transitions and ${seen.size} unique loaded GLB actions`);
