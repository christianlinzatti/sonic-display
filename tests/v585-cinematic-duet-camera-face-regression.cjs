'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {composeCinematicDuetInteractionV585:compose,refineCinematicDuetFaceV585:face,
 duetHandoffEnvelopeV585:envelope}=load('components/visualizer/cinematicDuetInteractionV585');
const {planConcertSceneV528:scene}=load('components/visualizer/cinematicConcertCoordinationV528');
const {measureScreenFrameV540:screen}=load('components/visualizer/cinematicCameraCompositionV540');
const {measureConcertFrameV550:measure}=load('components/visualizer/cinematicConcertCameraV550');
const {planIntelligentRapDuetV500:stage}=load('components/visualizer/intelligentRapDuetPerformanceV500');
let passed=0;
function test(title,fn){try{fn();passed++;}catch(e){e.message=`V585 ${title}: ${e.message}`;throw e;}}
const anchors=[{slot:0,x:-1.35,y:0,z:0,visible:true},{slot:1,x:1.25,y:0,z:0,visible:true},
 {slot:2,x:2.1,y:0,z:0,visible:true},{slot:3,x:-2.2,y:0,z:0,visible:true}];
const pose={x:0,y:1.2,z:7,targetX:0,targetY:.4,targetZ:0,fov:38};
const opts={trackId:'song-verified',progressMs:1450,aspect:16/9,playing:true,reducedMotion:false,
 automatic:true,authored:false,lyricsProtected:false,lyricsSide:null,faceY:1.55};
const mk=(focus='handoff',now=1450,count=2)=>scene({trackId:'song-verified',cueTrackId:'song-verified',
  progressMs:now,count,playing:true,reducedMotion:false,tier:'high',
  cue:{active:true,role:focus==='ensemble'?'hook':'feature',leadSlot:1,
   singingSlots:focus==='ensemble'?Array.from({length:count},(_,i)=>i):[1],
   handoffFrom:focus==='handoff'?0:null,count,startMs:1000,endMs:4500}});
const cue={active:true,style:'reply',lineIndex:3,leadSlot:1,partnerSlot:0,singingSlots:[1],
 handoffFrom:0,phase:.5,emphasis:.75,startMs:1000,endMs:4500,source:'line-timed',count:2};
const args={trackId:'song-verified',cueTrackId:'song-verified',cue,progressMs:1450,count:2,
 positions:[[-1.35,0,0],[1.25,0,0]],playing:true,reducedMotion:false,
 manualPriority:false,beat:.65,strength:75,tier:'high'};
const base={active:true,kind:'reply',slots:[0,1].map((i)=>({
 role:i===0?'handoff':'singing',look:{yaw:0,pitch:0,eyeYaw:0,weight:0},
 gesture:{leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0}}))};
test('correct camera integration order, no second camera/renderer',()=>{
 const src=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
 assert.match(src,/composeCinematicDuetInteractionV585\(concertFramedV550,sceneV528,/);
 assert.match(src,/composeConcertHarmonyCameraV606\(framedV605,/);
 assert.match(src,/guardAutomaticCameraV351\(genreFramedV610,composition\)/);
 const duet=fs.readFileSync('components/visualizer/duetResponseV575.ts','utf8');
 assert.match(duet,/refineCinematicDuetFaceV585\(refineNaturalDuetStageV584\(/);
 const code=fs.readFileSync('components/visualizer/cinematicDuetInteractionV585.ts','utf8');
 for(const denied of ['useFrame(','requestAnimationFrame(','new WebGLRenderer','fetch(','setInterval(','new AnimationMixer','new Mesh','localStorage'])
  assert(!code.includes(denied),denied);
});
test('hand-off envelope deterministic and bounded',()=>{
 for(let ms=-100;ms<4700;ms+=7){const v=envelope(ms,1000,4500);assert(Number.isFinite(v)&&v>=0&&v<=1);assert.equal(v,envelope(ms,1000,4500));}
 assert.equal(envelope(900,1000,4500),0);assert.equal(envelope(4500,1000,4500),0);
 assert.equal(envelope(NaN,1000,4500),0);
});
test('verified handoff camera uses real anchors and remains within framing limits',()=>{
 let changes=0;
 for(const count of [2,3,4])for(const aspect of [16/9,16/10,4/3,9/16])for(const ms of [1100,1300,1500,1800,2100,2700,3700]){
  const sc=mk('handoff',ms,count);assert(sc.active);
  for(const lyricsSide of [null,'left','right']){
   const o={...opts,progressMs:ms,aspect,lyricsSide,lyricsProtected:lyricsSide!==null};
   const candidate=compose(pose,sc,anchors,o);
   if(candidate!==pose)changes++;
   const selected=anchors.slice(0,2);
   const original=measure(pose,selected,aspect,lyricsSide,o.lyricsProtected,1.55);
   const after=measure(candidate,selected,aspect,lyricsSide,o.lyricsProtected,1.55);
   const original2=screen(pose,selected,aspect,lyricsSide),after2=screen(candidate,selected,aspect,lyricsSide);
   assert(original&&after&&original2&&after2);
   assert(after.overflow<=original.overflow+1e-6);
   assert(after.headOverflow<=original.headOverflow+1e-6);
   assert(after.fullBodyOverflow<=original.fullBodyOverflow+1e-6);
   assert(after2.overflow<=original2.overflow+1e-6);
   assert(Math.abs(candidate.x-pose.x)<=.221);assert(Math.abs((candidate.targetX??0)-(pose.targetX??0))<=.221);
  }
 }
 assert(changes>0,'no real camera adjustment was accepted');
});
test('verified group hook widens without dropping cast',()=>{
 let expanded=0;
 for(const count of [2,3,4])for(const ms of [1700,2100,2500,3500])for(const aspect of [16/9,16/10,4/3]){
  const sc=mk('ensemble',ms,count),o={...opts,progressMs:ms,aspect};
  const result=compose(pose,sc,anchors,o);
  if(result!==pose){assert(result.z>=pose.z);expanded++;}
  const before=measure(pose,anchors.slice(0,count),aspect,null,false,1.55);
  const after=measure(result,anchors.slice(0,count),aspect,null,false,1.55);
  assert(before&&after&&after.overflow<=before.overflow+1e-6);
 }
 assert(expanded>0,'group framing did not widen');
});
test('manual, stale, low tier, pause, no cast or unsupported focus are exact no-ops',()=>{
 const s=mk(),fallback=mk('lead');
 for(const patch of [{authored:true},{automatic:false},{playing:false},{reducedMotion:true},
  {trackId:'other'},{progressMs:5000},{aspect:.2}])
  assert.strictEqual(compose(pose,s,anchors,{...opts,...patch}),pose);
 assert.strictEqual(compose(pose,fallback,anchors,opts),pose);
 assert.strictEqual(compose(pose,mk(),anchors.map((a,i)=>i===1?{...a,visible:false}:a),opts),pose);
 assert.strictEqual(compose(pose,mk(),anchors.map((a,i)=>i===1?{...a,x:NaN}:a),opts),pose);
 assert.strictEqual(compose(pose,mk(),anchors,{...opts,progressMs:950}),pose);
 assert.strictEqual(compose(pose,mk(),anchors,{...opts,progressMs:4500}),pose);
});
test('incoming and outgoing face briefly acknowledge each other, no invented singer',()=>{
 const r=face(base,args);
 assert.notStrictEqual(r,base);assert(r.slots[0].look.yaw>0);assert(r.slots[1].look.yaw<0);
 assert(r.slots[0].look.weight>0&&r.slots[1].look.weight>0);
 assert(r.slots.every((p,i)=>p.role===base.slots[i].role&&p.gesture===base.slots[i].gesture));
 assert.deepEqual(r.slots.map(x=>x.look.pitch),[0,0]);
 const pipeline=stage(args);
 assert.equal(pipeline.slots[1].role,'singing');assert(pipeline.slots[1].look.weight>0);
});
test('face respects manual priority, pause, Pi low tier, cast mismatch and spacing',()=>{
 for(const patch of [{manualPriority:true},{playing:false},{reducedMotion:true},{tier:'low'},
   {cueTrackId:'unrelated'},{progressMs:4500},{positions:[[0,0,0],[.1,0,0]]},
   {positions:[[0,0,0],[15,0,0]]},{cue:{...cue,handoffFrom:null}},
   {cue:{...cue,style:'hook'}}])
   assert.strictEqual(face(base,{...args,...patch}),base,JSON.stringify(patch));
});
test('face remains finite, playback-time deterministic and bounded for a long playback',()=>{
 for(let ms=1000;ms<2000000;ms+=133){
  const start=ms-ms%3500,c={...cue,startMs:start,endMs:start+3500};
  const input={...args,cue:c,progressMs:ms};
  const a=face(base,input),b=face(base,input);
  assert.deepEqual(a,b);
  for(const s of a.slots){assert(Math.abs(s.look.yaw)<=.42);assert(Math.abs(s.look.eyeYaw)<=.11);assert(s.look.weight<=.46);}
 }
});
console.log(`PASS V585: ${passed} camera/face regression groups; real-anchor safety and deterministic playback`);

assert(require("node:fs").readFileSync("components/visualizer/StageCameraDirectorV289.tsx","utf8").indexOf("composeCinematicDuetInteractionV585(concertFramedV550,sceneV528")<require("node:fs").readFileSync("components/visualizer/StageCameraDirectorV289.tsx","utf8").indexOf("composeFullSongCameraV605(duetFramedV585"));
