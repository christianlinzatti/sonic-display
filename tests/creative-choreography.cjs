const assert=require('node:assert/strict'),load=require('./helpers/load-stage-typescript.cjs');
const {creativeBodyClip}=load('lib/creativeChoreography.ts');
const {fullBodyClipV1133,FULL_BODY_CLIPS_V1133}=load('lib/fullBodyPerformanceV1133.ts');
const {crewInteractionV1131}=load('lib/concertStoryV1131.ts');
const {concertScoreV1134}=load('lib/concertScoreV1134.ts');
const {stepCrew,newCrewState,crewClipTime,CREW_IDS}=load('components/visualizer/sonicCrewDirector.ts');
const manifest=require('../public/avatars/sonic/manifest.json');
const all=new Set(FULL_BODY_CLIPS_V1133);
const genres=['hardstyle','house','hip-hop','latin','afrobeat','jazz','rock','classical','ambient','pop','global'];
for(const modelId of CREW_IDS)for(const genre of genres){
 let recent=[],chosen=new Set();
 for(let phrase=2;phrase<34;phrase++){
  const cue=concertScoreV1134({progressMs:phrase*8000,count:1,section:'verse',genre,energy:.7});
  const input={trackId:'contrast-song',modelId,genre,cue,available:all,recent,shared:false,personal:'Dance_RobotGroove'};
  const clip=creativeBodyClip(input);assert(all.has(clip));
  assert.equal(creativeBodyClip(input),clip,'Identical inputs reconstruct the same choice');
  assert.notEqual(clip,recent[0],'The last real motif must leave space for another');
  if(['ambient','classical'].includes(genre))assert(!['Dance_FrontmanDrive','Dance_RobotGroove'].includes(clip));
  recent=[clip,...recent].slice(0,3);chosen.add(clip);
 }
 assert(chosen.size>=3,`${modelId}/${genre} develops multiple physical motifs`);
}
const tracks=new Set();
for(let n=0;n<24;n++){
 const sequence=[];
 for(let phrase=2;phrase<10;phrase++){
  const cue=concertScoreV1134({progressMs:phrase*8000,count:1,section:'verse',energy:.7});
  sequence.push(creativeBodyClip({trackId:`song-${n}`,modelId:'sonic-chrome-beat',cue,available:all,shared:false,personal:'Dance_RobotGroove'}));
 }
 tracks.add(sequence.join(','));
}
assert(tracks.size>=8,'Different songs must not all replay one fixed sequence');
for(const genre of genres)for(let phrase=2;phrase<18;phrase++){
 const cue=concertScoreV1134({progressMs:phrase*8000,count:3,section:'drop',genre,energy:.8});
 const clips=CREW_IDS.map(modelId=>fullBodyClipV1133({trackId:'shared-hit',modelId,genre,cue,count:3,available:all,recent:[modelId.includes('luna')?'Dance_FluidArc':'Dance_RobotGroove'],fallback:'Dance_Groove'}));
 assert.equal(new Set(clips).size,1,'Shared hits agree across personalities and local histories');
 if(!['ambient','classical'].includes(genre))assert.notEqual(clips[0],'Dance_FluidArc','Powerful drops keep an energetic movement family');
}
for(const genre of genres)for(const phrase of [2,3,8]){
 const cue=concertScoreV1134({progressMs:phrase*8000,count:3,section:'drop',genre,energy:.8});
 const input={trackId:'partial-cast',modelId:'sonic-neon-pulse',genre,cue,count:3,available:all,fallback:'Dance_Groove'};
 const selected=fullBodyClipV1133(input);
 const partial=new Set([...all,'Dance_Groove'].filter(name=>name!==selected));
 assert.equal(fullBodyClipV1133({...input,available:partial}),'Dance_Groove','A missing shared motif must use the protected fallback, never a different solo choice');
}
const cue=concertScoreV1134({progressMs:24000,count:3,section:'verse',energy:.7});
for(const guarded of [{...cue,reading:true},{...cue,act:'breathe'},{...cue,act:'build'},{...cue,lyricDensity:.9},{...cue,interaction:'answer'}]){
 assert.equal(fullBodyClipV1133({modelId:'sonic-chrome-beat',cue:guarded,count:3,available:all,fallback:'Dance_Groove'}),'Dance_Groove');
}
assert.equal(fullBodyClipV1133({modelId:'sonic-chrome-beat',cue,count:1,available:new Set(),fallback:'Idle_Breathe'}),'Idle_Breathe');
for(let count=1;count<=4;count++)for(let leader=0;leader<count;leader++){
 const forward={...cue,interaction:'answer',chorusVisit:1,leader};
 const reverse={...forward,chorusVisit:2};
 const a=Array.from({length:count},(_,slot)=>crewInteractionV1131(forward,slot,count).beatOffset);
 const b=Array.from({length:count},(_,slot)=>crewInteractionV1131(reverse,slot,count).beatOffset);
 assert.equal(a[leader],0);assert.equal(b[leader],0);assert.equal(new Set(a).size,count);assert.equal(new Set(b).size,count);
 if(count>2)assert.notDeepEqual(a,b,'Later refrain reverses its answer wave');
 assert.deepEqual(a.slice().sort(),b.slice().sort(),'Direction changes preserve the same bounded beat spacing');
}
// Real scheduler decisions retain musical bar switches and finite forward clip clocks.
for(const bpm of [55,93,170,210]){
 let state=newCrewState(),seen=new Set();
 const asset=manifest.find(m=>m.file==='neon-pulse.glb');
 for(let ms=0;ms<120000;ms+=50){
  const next=stepCrew(state,{modelId:'sonic-neon-pulse',clips:asset.clips.map(c=>({name:c.name,duration:c.seconds})),trackId:'live-creative',progressMs:ms,
   bpm,energy:.7,section:'verse',genre:'house',slot:0,count:1,playing:true,reducedMotion:false,manualPriority:false,settings:{enabled:true,reactions:true,mode:'adaptive'}});
  assert(next.plan.active);assert(Number.isFinite(crewClipTime(next.plan,4)));seen.add(next.plan.clip);
  if(state.key&&state.clip!==next.state.clip)assert.notEqual(Math.floor((state.beat+1e-7)/4),Math.floor((next.plan.beat+1e-7)/4));
  state=next.state;
 }
 assert(seen.size>=4,'New motifs must reach the actual scheduler');
}
const {lyrics}=require('./fixtures/concertMocksV1130.cjs');
for(const bpm of [55,210]){
 let state=newCrewState(),plan=null,anchor=0,last=null;
 for(let frame=0;frame<7200;frame++){
  const ms=frame*1000/60;
  if(frame%15===0){
   const next=stepCrew(state,{modelId:'sonic-neon-pulse',clips:[{name:'Dance_Groove',duration:2}],trackId:'wave-continuity',progressMs:ms,
    bpm,lyrics,energy:.7,slot:3,count:4,playing:true,reducedMotion:false,manualPriority:false,settings:{enabled:true,reactions:true,mode:'adaptive'}});
   state=next.state;plan=next.plan;anchor=ms;
  }
  const time=crewClipTime(plan,2,ms-anchor);
  if(last!==null)assert((time-last+2)%2<.08,'Reversed answer waves must not jump or reverse the live dance clock');
  last=time;
 }
}
console.log('PASS creative choreography: 11 personalities × 11 genres, motif memory, song variety, mixed-crew unison, reading guards, reversed answer waves and bar-safe live scheduling');
