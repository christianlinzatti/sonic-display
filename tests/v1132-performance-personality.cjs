const assert=require('node:assert/strict'),load=require('./helpers/load-stage-typescript.cjs');
const p=load('lib/performerPersonalityV1132.ts'),crew=load('components/visualizer/sonicCrewDirector.ts');
const {concertStoryV1131}=load('lib/concertStoryV1131.ts'),manifest=require('../public/avatars/sonic/manifest.json');
const profiles=crew.CREW_IDS.map(p.performerPersonaV1132);
assert.equal(new Set(profiles.map(x=>x.label)).size,11);assert.equal(new Set(profiles.map(x=>JSON.stringify(x))).size,11);
assert(p.expressionGainV1132('subtle')<p.expressionGainV1132('balanced'));assert(p.expressionGainV1132('bold')>1);
assert.deepEqual(crew.normalizeCrewSettings({mode:'adaptive',enabled:true,reactions:true,expression:'bold'}),{mode:'adaptive',enabled:true,reactions:true,expression:'bold'});
assert.equal(crew.normalizeCrewSettings({expression:'invalid'}).expression,undefined);
for(const bpm of [55,80,120,180,210]){
 let offset=0,lastTime=0;
 for(let i=1;i<=600;i++){
  const next=p.approachCrewOffsetV1132(offset,-4,1/60,bpm);
  const time=i/60*bpm/60+next;
  assert(time>=lastTime-1e-9,'A phase correction must never reverse playback');assert(Math.abs(next-offset)<=.011);
  offset=next;lastTime=time;
 }
 assert(Math.abs(offset+4)<1e-6);
}
const clips=manifest.find(x=>x.file==='quantum-bass.glb').clips.map(c=>c.name),available=new Set(clips);
let recent=[],names=new Set(),labels=new Set();
for(let phrase=0;phrase<24;phrase++){
 const cue=concertStoryV1131({progressMs:phrase*8000,bpm:120,section:'verse',energy:.7,count:1});
 const result=p.performanceSequenceV1132({genre:'hardstyle',trackId:'sequence-test',modelId:'sonic-quantum-bass',cue,available,recent,slot:0,count:1,fallback:'Dance_Groove'});
 assert(available.has(result.clip));assert.notEqual(result.clip,recent[0]);names.add(result.clip);labels.add(result.label);recent=[result.clip,...recent].slice(0,3);
}
assert(names.size>=4);assert.equal(labels.size,3);
// Mixed old/new casts share one sequence selection, regardless of individual histories.
for(const genre of ['latin','jazz','rock','house'])for(let phrase=0;phrase<16;phrase++){
 const cue=concertStoryV1131({progressMs:phrase*8000,bpm:120,section:'drop',energy:.8,count:3});
 const chosen=['neon-pulse','rio-carnival','quantum-bass'].map((slug,slot)=>p.performanceSequenceV1132({genre,trackId:'shared',modelId:'sonic-'+slug,cue,
  available:new Set(manifest.find(a=>a.file===slug+'.glb').clips.map(c=>c.name)),recent:[slot===0?'Dance_Groove':'Dance_Disco'],slot,count:3,fallback:'Dance_DiagonalStep'}).clip);
 assert.equal(chosen[0],chosen[1]);assert.equal(chosen[1],chosen[2]);
}
console.log('PASS V1132: 11 distinct personalities, expression presets, phrase combinations, mixed cast parity and forward-only phase correction');

// Real live-style 4 Hz plans, rendered at 60 Hz: phase changes remain continuous between polls.
for(const bpm of [55,120,210]){
 let state=crew.newCrewState(),plan=null,last=null,anchor=0;
 for(let frame=0;frame<2400;frame++){
  const ms=frame/60*1000;
  if(frame%15===0){const next=crew.stepCrew(state,{modelId:'sonic-neon-pulse',clips:[{name:'Dance_Groove',duration:2}],trackId:'smooth-phase',
   progressMs:ms,bpm,energy:.65,section:ms<8000?'verse':ms<16000?'drop':ms<24000?'hook':'verse',slot:1,count:3,playing:true,
   reducedMotion:false,manualPriority:false,settings:{...crew.CREW_DEFAULT,mode:'adaptive'}});state=next.state;plan=next.plan;anchor=ms;}
  const time=crew.crewClipTime(plan,2,ms-anchor);
  if(last!==null){const forward=(time-last+2)%2;assert(forward<.08,`Phase discontinuity at ${bpm} BPM: ${forward}`);}
  last=time;
 }
}
console.log('PASS V1132: continuous 60 Hz clip clocks across 4 Hz role/phase plan updates at 55/120/210 BPM');

// A lyric-derived quiet gap must affect actual clip holding, even with a generic verse hint.
{
 const {lyrics}=require('./fixtures/concertMocksV1130.cjs');let state=crew.newCrewState();let settled=false;
 const asset=manifest.find(a=>a.file==='neon-pulse.glb');
 for(let ms=14000;ms<=22000;ms+=100){const next=crew.stepCrew(state,{modelId:'sonic-neon-pulse',clips:asset.clips.map(c=>({name:c.name,duration:c.seconds})),
 trackId:'lyric-gap',progressMs:ms,bpm:120,section:'verse',energy:.65,lyrics,durationMs:100000,slot:0,count:3,
 playing:true,reducedMotion:false,manualPriority:false,settings:{...crew.CREW_DEFAULT,mode:'adaptive'}});state=next.state;
 if(ms>=20000&&next.plan.part==='quiet'&&next.plan.clip==='Idle_Breathe')settled=true;}
 assert(settled,'Actual crew playback must settle during the lyric-derived quiet gap');
}
console.log('PASS V1132: lyric-derived breathing sections settle the actual clip scheduler');
