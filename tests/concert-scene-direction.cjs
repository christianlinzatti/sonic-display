const assert=require('node:assert/strict'),load=require('./helpers/load-stage-typescript.cjs');
const {planConcertScenes,concertCrewRelationship,liveConcertContext}=load('lib/concertScenePlan.ts');
const {concertLyricIdentity}=load('lib/concertLyricIdentity.ts');
const {crewDialogue,dialogueMotifs}=load('lib/crewDialogue.ts');
const {choosePoseAwareCrew}=load('lib/poseAwareCrew.ts');
const {crewStageTarget}=load('lib/crewStagecraft.ts');
const {concertScoreV1134,composeScoreCameraV1134,newScoreCameraV1134}=load('lib/concertScoreV1134.ts');
const {newConcertShowReview,sampleConcertShowReview,summarizeConcertShow}=load('lib/concertShowReview.ts');
const {normalizeLyricTimingV1134}=load('lib/lyricTimingV1134.ts');
const {lyrics}=require('./fixtures/concertMocksV1130.cjs'),{rapLyrics,malformedLyrics}=require('./fixtures/concertStressV1134.cjs');
assert.deepEqual(liveConcertContext({lyrics,energy:.35,section:'quiet'},false),{energy:undefined,section:undefined});
assert.deepEqual(liveConcertContext({lyrics:null,energy:.8,section:'drop'},true),{energy:.8,section:'drop'});
const input={lyrics,positionMs:9000,durationMs:100000,count:3,act:'story',reading:false,lyricFocus:false};
const early=planConcertScenes(input);assert.equal(early.next.atMs,24000);assert.equal(early.prepare,0);
const prep=planConcertScenes({...input,positionMs:19000}),late=planConcertScenes({...input,positionMs:22500});assert(prep.prepare>0&&late.prepare>prep.prepare);assert.equal(prep.next.leader,0);
assert.equal(planConcertScenes({...input,positionMs:19000,reading:true}).prepare,0);
assert.equal(planConcertScenes({...input,positionMs:19000,lyricFocus:true}).prepare,0);
assert.equal(planConcertScenes({...input,lyrics:null,durationMs:undefined}).next,null);
assert.equal(planConcertScenes({...input,positionMs:75000}).next.kind,'finale');
const short=planConcertScenes({...input,positionMs:22000,durationMs:40000});assert.deepEqual(short.upcoming.map(s=>s.kind),['refrain','finale']);
for(const count of [2,3,4]){
 const pairs=new Set();
 for(let scene=0;scene<24;scene++){
  const relation=concertCrewRelationship('seed',count,scene);pairs.add(relation.id);
  assert.notEqual(relation.first,relation.second);assert(relation.second<count);
  const call=crewDialogue(3+scene*3,count,'seed'),reply=crewDialogue(4+scene*3,count,'seed');assert.equal(call.caller,relation.first);assert.equal(reply.responder,relation.second);
  if(scene%3)assert.equal(relation.id,concertCrewRelationship('seed',count,scene-1).id);
  assert.deepEqual(dialogueMotifs('song','house',scene,undefined,undefined,'seed'),dialogueMotifs('song','house',Math.floor(scene/3)*3,undefined,undefined,'seed'));
 }
 assert.equal(pairs.size,count*(count-1)/2);
 assert.equal(concertCrewRelationship('seed',count,23,true).id,concertCrewRelationship('seed',count,0).id);
}
assert.equal(concertCrewRelationship('seed',1,0),null);
assert.equal(choosePoseAwareCrew({clips:[{name:'old',duration:2,tracks:[]}],outgoing:'old',candidate:'Dance_CrossStep',outTime:1,time:()=>1,left:true,right:true}),'Dance_CrossStep','Absent pose evidence must preserve the fallback, even with both feet planted');
const original=crewStageTarget({x:0,z:0},1,3,1,0,false),prepared=crewStageTarget({x:0,z:0},1,3,1,0,false,{leader:0,partner:2,progress:1});assert.equal(original.x,prepared.x);assert(prepared.z<original.z);
const first=concertLyricIdentity(lyrics,25000,'seed'),reprise=concertLyricIdentity(lyrics,65000,'seed');assert.equal(first.mode,'refrain');assert.equal(first.pattern,reprise.pattern);assert(reprise.visit>first.visit);
assert.equal(concertLyricIdentity(rapLyrics,10000,'seed').mode,'rap');assert.equal(concertLyricIdentity(null,10000,'seed').mode,'none');
for(const genre of ['house','classical','hip-hop','rock'])for(const data of [lyrics,rapLyrics,normalizeLyricTimingV1134(malformedLyrics,100000),null])for(const position of [0,17000,22500,33000,65000,85000,99000]){
 const cue=concertScoreV1134({trackId:'whole-song',genre,lyrics:data,progressMs:position,durationMs:100000,count:4,showPlans:true});
 assert(Number.isFinite(cue.cameraScale)&&Number.isFinite(cue.lightGain));assert(cue.scenePlan.upcoming.length<=2);
 if(cue.reading||cue.lyricFocus)assert.equal(cue.scenePlan.prepare,0);
 const camera={x:0,y:1,z:8,fov:40};assert.strictEqual(composeScoreCameraV1134(camera,cue,newScoreCameraV1134(),{playing:true,reducedMotion:false,protectedShot:true},camera),camera);
}
const frame=(time,extra={})=>({source:'review',nowMs:time,positionMs:time,durationMs:60000,playing:true,eligible:true,reading:false,intentionalMotif:false,...extra});
const full=newConcertShowReview('review',60000);
for(let time=0;time<=60000;time+=250)sampleConcertShowReview(full,frame(time));
const report=summarizeConcertShow(full);assert.equal(report.coverage,1);assert(report.fullSong);assert.equal(report.cameraMs,0);assert.equal(report.lyricMs,0);assert.equal(report.crewMs,0);
const seek=newConcertShowReview('review',60000);sampleConcertShowReview(seek,frame(0));sampleConcertShowReview(seek,frame(59000,{nowMs:250}));sampleConcertShowReview(seek,frame(59500,{nowMs:750}));assert(!summarizeConcertShow(seek).fullSong);assert(summarizeConcertShow(seek).coverage<.02);
const paused=newConcertShowReview('review',60000);for(let time=0;time<=60000;time+=250)sampleConcertShowReview(paused,frame(time,{playing:false}));assert.equal(summarizeConcertShow(paused).coverage,0);
const faulty=newConcertShowReview('review',60000);
for(let time=0;time<=60000;time+=250)sampleConcertShowReview(faulty,frame(time,{reading:time<10000,camera:{x:time/250%2*2,y:1,z:8},lyrics:{clipped:true,overlap:.2},clips:[{slot:0,clip:time<10000?(time%1000<500?'Dance_Groove':'Dance_House'):'Dance_Groove'}]}));
const bad=summarizeConcertShow(faulty);assert(bad.cameraCuts>4&&bad.rapidChanges>3&&bad.longHoldMs>4000&&bad.readingMotionMs>1000&&bad.clippedMs>500&&bad.overlapMs>500);assert.equal(bad.warnings.length,6);
const intentional=newConcertShowReview('review',60000);for(let time=0;time<=60000;time+=250)sampleConcertShowReview(intentional,frame(time,{intentionalMotif:true,clips:[{slot:0,clip:'Dance_RobotGroove'}]}));assert.equal(summarizeConcertShow(intentional).longHoldMs,0);
const longRap=newConcertShowReview('review',60000);for(let time=0;time<=60000;time+=250)sampleConcertShowReview(longRap,frame(time,{reading:true,clips:[{slot:0,clip:'Dance_Groove'}]}));assert.equal(summarizeConcertShow(longRap).longHoldMs,0,'A long stable rap accompaniment is intentional');
const missingCamera=newConcertShowReview('review',60000);
for(let time=0;time<=6000;time+=250)sampleConcertShowReview(missingCamera,frame(time,{reading:true,...(time>=2000&&time<=3000?{}:{camera:{x:time<2000?0:2,y:1,z:8}})}));
assert.equal(summarizeConcertShow(missingCamera).readingMotionMs,0,'An unobserved camera interval must not manufacture a rap-motion warning');
// Replaying the same part does not inflate coverage or fabricate a complete song.
for(let time=0;time<=60000;time+=250)sampleConcertShowReview(full,frame(time,{nowMs:time+61000}));assert.equal(summarizeConcertShow(full).coverage,1);
console.log('PASS scene direction: two-phrase preview, smooth preparation, stable pair arcs, refrain identity, genre/text guards and whole-song coverage with injected camera/lyric/motion faults');
