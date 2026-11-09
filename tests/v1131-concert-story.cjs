const assert=require('node:assert/strict'),load=require('./helpers/load-stage-typescript.cjs');
const story=load('lib/concertStoryV1131.ts'),crew=load('components/visualizer/sonicCrewDirector.ts');
const {lyrics}=require('./fixtures/concertMocksV1130.cjs'),manifest=require('../public/avatars/sonic/manifest.json');
const at=progressMs=>story.concertStoryV1131({progressMs,durationMs:100000,lyrics,bpm:120,count:3,genre:'pop'});
const first=at(25000),second=at(65000),last=at(95000);
assert.equal(first.chorusVisit,1);assert.equal(second.chorusVisit,2);assert.equal(last.chorusVisit,3);
assert(second.intensity>first.intensity);assert(second.lightGain>first.lightGain);assert(second.lyricGain>first.lyricGain);
assert.equal(last.act,'finale');assert.equal(last.interaction,'unison');assert(last.cameraScale>second.cameraScale);
assert.equal(at(47000).interaction,'rest');assert.equal(at(8000).act,'story');
// A generic verse hint must not hide a known repeated lyric block.
assert.equal(story.concertStoryV1131({progressMs:65000,lyrics,section:'verse'}).act,'lift');
const duel=story.concertStoryV1131({progressMs:8000,bpm:120,section:'verse',count:3,energy:.7});
assert.equal(duel.interaction,'duel');
const roles=Array.from({length:3},(_,i)=>story.crewInteractionV1131(duel,i,3));
assert.equal(roles.filter(r=>r.role==='lead').length,1);assert.equal(roles.filter(r=>r.role==='partner').length,1);
assert(roles.every(r=>Math.abs(r.yaw)<=.09&&r.armAccent<=.055));
const dense=story.concertStoryV1131({progressMs:8000,bpm:120,section:'verse',count:3,lyricDensity:.9});
assert.equal(dense.interaction,'solo');assert.equal(story.storyFootworkV1131(dense,0),null);
const answer=story.concertStoryV1131({progressMs:0,bpm:120,section:'verse',count:3});
assert.deepEqual([0,1,2].map(i=>story.crewInteractionV1131(answer,i,3).beatOffset),[0,-2,-4]);
const base={x:0,y:1,z:6,fov:40,targetY:0};
for(const guard of [{playing:false,reducedMotion:false,protectedShot:false},{playing:true,reducedMotion:true,protectedShot:false},{playing:true,reducedMotion:false,protectedShot:true}])assert.strictEqual(story.composeStoryCameraV1131(base,last,guard),base);
const framed=story.composeStoryCameraV1131(base,last,{playing:true,reducedMotion:false,protectedShot:false});assert(framed.z>base.z&&framed.fov>base.fov);
const ids=['sonic-neon-pulse','sonic-rio-carnival','sonic-quantum-bass'];let states=ids.map(()=>crew.newCrewState()),seen=new Set();
for(let ms=0;ms<100000;ms+=100){
 const plans=ids.map((id,slot)=>{
  const asset=manifest.find(a=>a.file===id.slice(6)+'.glb');
  for(const clip of story.FOOTWORK_CLIPS_V1131)assert(asset.clips.some(c=>c.name===clip));
  const result=crew.stepCrew(states[slot],{modelId:id,clips:asset.clips.map(c=>({name:c.name,duration:c.seconds})),
   trackId:'complete-mocked-song',progressMs:ms,bpm:120,energy:.65,lyrics,durationMs:100000,genre:'pop',slot,count:3,
   playing:true,reducedMotion:false,manualPriority:false,settings:{...crew.CREW_DEFAULT,mode:'adaptive'}});
  states[slot]=result.state;assert(result.plan.active);assert((result.state.recent??[]).length<=3);seen.add(result.plan.clip);return result.plan;
 });
 if(ms===96000){assert(plans.every(p=>p.story.act==='finale'));assert.equal(plans[0].clip,plans[1].clip);assert.equal(plans[1].clip,plans[2].clip);}
}
// V1134 anticipation adds breathing space; new full-body steps also count as footwork variety.
assert([...seen].filter(c=>story.FOOTWORK_CLIPS_V1131.includes(c)).length>=2);
assert([...seen].filter(c=>/SideGlide|DiagonalStep|HeelToe|PivotStep|CrossStep|RobotGroove|FluidArc|FrontmanDrive|JazzRebound|TurnPhrase/.test(c)).length>=4);
for(const ms of [40000,5000,95000]){
 const asset=manifest.find(a=>a.file==='neon-pulse.glb');const next=crew.stepCrew(states[0],{modelId:ids[0],clips:asset.clips.map(c=>({name:c.name,duration:c.seconds})),trackId:'seek-song',progressMs:ms,bpm:120,lyrics,durationMs:100000,slot:0,count:3,playing:true,reducedMotion:false,manualPriority:false,settings:{...crew.CREW_DEFAULT,mode:'adaptive'}});
 assert.equal(next.plan.story.chorusVisit,story.chorusVisitsV1131(lyrics,ms));
}
console.log('PASS V1131: full-song escalation, repeatable seek, duet/answer roles, bounded body language, shared finale, footwork and camera guards');
