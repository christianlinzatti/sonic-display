const assert=require('node:assert/strict'),load=require('./helpers/load-stage-typescript.cjs');
const {crewDialogue,dialogueMotifs}=load('lib/crewDialogue.ts');
const {concertScoreV1134}=load('lib/concertScoreV1134.ts');
const {fullBodyClipV1133,FULL_BODY_CLIPS_V1133}=load('lib/fullBodyPerformanceV1133.ts');
const {stepCrew,newCrewState,crewClipTime,CREW_IDS}=load('components/visualizer/sonicCrewDirector.ts');
const manifest=require('../public/avatars/sonic/manifest.json');
const genres=['house','hardstyle','hip-hop','latin','afrobeat','jazz','rock','classical','ambient','pop','global'];
const available=new Set([...FULL_BODY_CLIPS_V1133,'Dance_Groove']);
for(const genre of genres)for(let count=2;count<=4;count++)for(let scene=0;scene<8;scene++){
 const phase=3+scene*3;
 const input={trackId:'dialogue-track',section:'verse',genre,count,energy:.65};
 const call=concertScoreV1134({...input,progressMs:phase*8000+1000});
 const reply=concertScoreV1134({...input,progressMs:(phase+1)*8000+1000});
 const reunion=concertScoreV1134({...input,progressMs:(phase+2)*8000+1000});
 assert.equal(call.dialogue.phase,'call');assert.equal(reply.dialogue.phase,'reply');assert.equal(reunion.dialogue.phase,'reunion');
 assert.equal(reply.leader,call.partner);assert.equal(reply.partner,call.leader);
 const clips=cue=>Array.from({length:count},(_,slot)=>fullBodyClipV1133({trackId:input.trackId,modelId:CREW_IDS[slot],cue,count,genre,slot,available,fallback:'Dance_Groove'}));
 const a=clips(call),b=clips(reply),c=clips(reunion);
 assert.notEqual(a[call.leader],a[call.partner]);
 assert.equal(a[call.leader],b[reply.leader],'Another performer literally takes over the leading motif');
 assert.equal(a[call.partner],b[reply.partner],'The contrasting motif changes hands as well');
 assert(c.every(clip=>clip===a[call.leader]),'The shared return recalls the earlier actual motif');
 assert.equal(reunion.interaction,'unison');assert.equal(reunion.mode,'unison');assert(reunion.cameraScale>1);
 if(['ambient','classical'].includes(genre))assert(a.every(clip=>!['Dance_RobotGroove','Dance_FrontmanDrive'].includes(clip)));
 for(const bpm of [55,93,210])assert.deepEqual(concertScoreV1134({...input,bpm,progressMs:phase*8000+1000}).dialogue,call.dialogue);
 const missing=new Set([...available].filter(name=>name!==c[0]));
 assert.equal(fullBodyClipV1133({trackId:input.trackId,modelId:CREW_IDS[0],cue:reunion,count,genre,slot:0,available:missing,fallback:'Dance_Groove'}),'Dance_Groove');
}
for(const section of ['intro','break','build','hook','drop']){
 const cue=concertScoreV1134({progressMs:33000,count:3,section,energy:.8});assert.equal(cue.dialogue,undefined,section+' owns the scene');
}
assert.equal(concertScoreV1134({progressMs:33000,count:1,section:'verse'}).dialogue,undefined);
assert.equal(concertScoreV1134({progressMs:33000,count:3,section:'verse',lyricDensity:.8}).dialogue,undefined);
assert.equal(crewDialogue(NaN,3),null);assert.equal(crewDialogue(2,3),null);assert.equal(crewDialogue(3,1),null);
for(let count=2;count<=4;count++){
 const partners=new Set();
 for(let scene=0;scene<count*(count-1);scene++){
  const d=crewDialogue(3+scene*3,count);partners.add(`${d.caller}:${d.responder}`);
 }
 assert.equal(partners.size,count*(count-1),'Every directed partner pairing gets a turn');
}
const pair=dialogueMotifs('frozen','house',1);assert(Object.isFrozen(pair));
for(let scene=0;scene<100;scene++)dialogueMotifs('cache-rotation','jazz',scene);
assert.deepEqual(dialogueMotifs('frozen','house',1),pair,'Eviction must not change a reconstructed scene');
const modelIds=['sonic-neon-pulse','sonic-rio-carnival','sonic-quantum-bass'];
for(const bpm of [55,120,210]){
 let states=modelIds.map(()=>newCrewState()),plans=[];
 for(let ms=0;ms<=48000;ms+=50){
  plans=modelIds.map((modelId,slot)=>{
   const asset=manifest.find(a=>a.file===modelId.slice(6)+'.glb');
   const next=stepCrew(states[slot],{modelId,slot,count:3,trackId:'real-dialogue',genre:'house',section:'verse',progressMs:ms,
    clips:asset.clips.map(c=>({name:c.name,duration:c.seconds})),bpm,energy:.65,playing:true,reducedMotion:false,manualPriority:false,settings:{enabled:true,reactions:true,mode:'adaptive'}});
   if(states[slot].key&&states[slot].clip!==next.state.clip)assert.notEqual(Math.floor((states[slot].beat+1e-7)/4),Math.floor((next.plan.beat+1e-7)/4));
   assert(Number.isFinite(crewClipTime(next.plan,4)));states[slot]=next.state;return next.plan;
  });
  if(ms===47000)assert.equal(new Set(plans.map(p=>p.clip)).size,1,'The actual scheduler reaches the shared return');
 }
}
console.log('PASS crew dialogue: motif handoff, complementary partners, shared reprise, 11 genre groups, 2–4 performers, protected sections, cache reconstruction and real bar-safe scheduling');
