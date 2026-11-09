const assert=require('node:assert/strict'),load=require('./helpers/load-stage-typescript.cjs');
const {concertScoreV1134,newScoreCameraV1134,composeScoreCameraV1134}=load('lib/concertScoreV1134.ts');
const {normalizeLyricTimingV1134}=load('lib/lyricTimingV1134.ts');
const {crewInteractionV1131}=load('lib/concertStoryV1131.ts');
const {stepCrew,newCrewState,crewClipTime,CREW_DEFAULT}=load('components/visualizer/sonicCrewDirector.ts');
const {lyrics}=require('./fixtures/concertMocksV1130.cjs');
const {malformedLyrics,rapLyrics,tempoEvents}=require('./fixtures/concertStressV1134.cjs');
const base={lyrics,durationMs:100000,bpm:120,count:3,energy:.65};
const pre=concertScoreV1134({...base,progressMs:22500}),hook=concertScoreV1134({...base,progressMs:24600});
assert.equal(pre.staging,'anticipation');assert.equal(pre.interaction,'answer');assert.equal(pre.accent,0);assert(hook.lightGain>pre.lightGain);assert(hook.beamGain>pre.beamGain);assert(hook.cameraScale>pre.cameraScale);
assert.equal(hook.staging,'chorus');assert(hook.accent>.5);
const chorus2=concertScoreV1134({...base,progressMs:65000});assert.equal(chorus2.chorusVisit,2);assert.notEqual(hook.leader,chorus2.leader);
for(const progressMs of [8000,17000,41000,65000,95000]){
 const a=concertScoreV1134({...base,progressMs});
 assert.deepEqual(a,concertScoreV1134({...base,progressMs}),'Seeking reconstructs the same score');
 for(const bpm of [55,120,210]){const b=concertScoreV1134({...base,progressMs,bpm});assert.equal(a.leader,b.leader);assert.equal(a.phrase,b.phrase);}
}
const duel=concertScoreV1134({progressMs:24000,count:4,section:'verse',energy:.6});assert.equal(duel.interaction,'duel');
assert.notEqual(duel.leader,duel.partner);const lead=crewInteractionV1131(duel,duel.leader,4),partner=crewInteractionV1131(duel,duel.partner,4);
assert(lead.yaw*partner.yaw<0,'Duellists face each other');assert.equal(partner.beatOffset,-2);
const rapid=concertScoreV1134({...base,lyrics:rapLyrics,progressMs:10000});assert.equal(rapid.staging,'reading');assert.equal(rapid.interaction,'solo');assert.equal(rapid.accent,0);assert(rapid.beamGain<.5);
const camera={x:0,y:1,z:6,fov:40,targetY:0},state=newScoreCameraV1134(),guard={playing:true,reducedMotion:false,protectedShot:false};
const held=composeScoreCameraV1134({...camera,x:1},rapid,state,guard,camera);
for(let i=0;i<60;i++)assert.deepEqual(composeScoreCameraV1134({...camera,x:i,z:10},rapid,state,guard,{...camera,x:2}),held);
const manual={...camera,x:9};assert.strictEqual(composeScoreCameraV1134(manual,rapid,state,{...guard,protectedShot:true},camera),manual);
const reduced={...guard,reducedMotion:true};assert.strictEqual(composeScoreCameraV1134(manual,hook,state,reduced,camera),manual);
composeScoreCameraV1134(camera,hook,state,{...guard,playing:false},camera);assert.deepEqual(composeScoreCameraV1134(manual,hook,state,{...guard,playing:false},manual),camera);
assert.notDeepEqual(composeScoreCameraV1134(camera,hook,state,guard,camera),camera,'Resume releases pause hold');
const repaired=normalizeLyricTimingV1134(malformedLyrics,100000);assert(repaired.synced);assert.equal(repaired.lines[0].startMs,8000);assert.equal(repaired.lines[0].endMs,12000);assert.equal(repaired.lines[0].words,undefined);
assert.equal(repaired.lines.filter(l=>l.startMs===8000).length,1);assert(repaired.lines.every(l=>l.startMs<100000));
assert.equal(normalizeLyricTimingV1134({synced:true,lines:[{startMs:-1,text:'Lesbar ohne Timing'}]}).synced,false);assert.equal(normalizeLyricTimingV1134(null),null);
for(const payload of [null,{synced:false,lines:[],plainText:'Ein Text ohne Zeiten'},malformedLyrics])for(let ms=0;ms<100000;ms+=500){
 const c=concertScoreV1134({...base,lyrics:payload,progressMs:ms});for(const n of ['lightGain','beamGain','intensity','cameraScale','cameraSide'])assert(Number.isFinite(c[n]));
}
// Full scheduler at 60 Hz: sudden BPM changes, invalid tempo, paused polls and resumption.
const manifest=require('../public/avatars/sonic/manifest.json');const asset=manifest.find(a=>a.file==='neon-pulse.glb');
const input={modelId:'sonic-neon-pulse',clips:asset.clips.map(c=>({name:c.name,duration:c.seconds})),trackId:'stress-tempo',energy:.6,section:'verse',slot:1,count:3,reducedMotion:false,manualPriority:false,settings:{...CREW_DEFAULT,mode:'adaptive'}};
let crew=newCrewState(),lastBeat=-1,lastTempo=90,lastPosition=0;
for(let frame=0;frame<60*48;frame++){
 const pos=frame*1000/60,bpm=tempoEvents.filter(e=>e.at<=pos).at(-1).bpm;
 const next=stepCrew(crew,{...input,progressMs:pos,bpm,playing:true});
 assert(next.plan.active);assert(next.plan.beat>=lastBeat);assert(Number.isFinite(crewClipTime(next.plan,4)));
 if(frame>0)assert(Math.abs(next.plan.bpm-lastTempo)<1,'Sudden tempo changes are smoothed');
 crew=next.state;lastBeat=next.plan.beat;lastTempo=next.plan.bpm;lastPosition=pos;
 if(frame===800){
  for(let poll=0;poll<6;poll++){const pause=stepCrew(crew,{...input,progressMs:pos,bpm,playing:false});assert.strictEqual(pause.state,crew);assert(!pause.plan.active);}
  const resumed=stepCrew(crew,{...input,progressMs:pos+16,bpm,playing:true});assert(resumed.plan.beat-lastBeat<.1);
 }
}
for(const progressMs of [8000,95000,17000]){const seek=stepCrew(crew,{...input,progressMs,bpm:120,playing:true});assert(seek.plan.active);assert(Number.isFinite(seek.plan.beat));}
console.log('PASS V1134: anticipation/chorus contrast, rotating roles, mutual gaze, rap camera hold, manual/reduced-motion priority, broken timing repair, missing lyrics, 60 Hz tempo jumps and pause continuity');

// Role blocks may fall between musical bars at slow/odd tempi. Queue clip choices until the bar.
for(const bpm of [55,93,170]){
 let state=newCrewState(),changes=0,names=new Set();
 for(let ms=0;ms<90000;ms+=50){
  const next=stepCrew(state,{...input,slot:0,progressMs:ms,bpm,playing:true});names.add(next.plan.clip);
  if(state.key&&state.clip!==next.state.clip){
   changes++;
   assert.notEqual(Math.floor((state.beat+1e-7)/4),Math.floor((next.plan.beat+1e-7)/4),'Clip changes must wait for a musical bar');
  }
  state=next.state;
 }
 assert(changes>=4&&names.size>=3,'Pending phrase choices must actually reach the mixer at non-120 BPM');
}
const badWordEnd=normalizeLyricTimingV1134({synced:true,lines:[{startMs:0,endMs:1000,text:'Licht',words:[{text:'Licht',startMs:0,endMs:'später'}]}]});
assert.equal(badWordEnd.lines[0].words,undefined);
console.log('PASS V1134: queued phrase switches at 55/93/170 BPM and rejection of non-numeric word ends');
