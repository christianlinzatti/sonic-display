'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {composeConcertCameraV540:compose,measureScreenFrameV540:measure}=load('components/visualizer/cinematicCameraCompositionV540');
const {planConcertSceneV528:plan}=load('components/visualizer/cinematicConcertCoordinationV528');
const pose={x:0,y:1.1,z:6.8,targetX:0,targetY:.15,targetZ:0,fov:38};
const avatars=[{slot:0,x:-1.7,y:0,z:.1,visible:true},{slot:1,x:-.55,y:0,z:0,visible:true},
  {slot:2,x:.65,y:0,z:0,visible:true},{slot:3,x:1.8,y:0,z:.1,visible:true}];
function scene(count,role,lead,ms=3500){const cue={active:true,role,leadSlot:lead,
  singingSlots:role==='hook'?Array.from({length:count},(_,i)=>i):[lead],
  startMs:1000,endMs:11000,handoffFrom:role==='feature'?(lead+count-1)%count:null,count};
  return plan({trackId:'song-v540',cueTrackId:'song-v540',count,progressMs:ms,playing:true,
    reducedMotion:false,tier:'high',cue});}
const defaults={trackId:'song-v540',progressMs:3500,aspect:16/9,playing:true,reducedMotion:false,
  automatic:true,authored:false,lyricsProtected:false,lyricsSide:null,faceY:1.3};
let trials=0, improved=0;
for (const aspect of [16/9,16/10,4/3,9/16])for (const count of [2,3,4])
for (const role of ['lead','feature','hook'])for(let i=0;i<240;i++){
  const lead=i%count,ms=1300+(i*31)%8900, s=scene(count,role,lead,ms);
  assert(s.active,`${count} ${role}`);
  const selected=s.focus==='ensemble'?s.singingSlots:s.focus==='handoff'?[s.leadSlot,s.handoffFrom]:[s.leadSlot];
  const a=selected.map(slot=>avatars[slot]);
  const opts={...defaults,aspect,progressMs:ms,lyricsProtected:i%3!==0,lyricsSide:i%3===1?'left':i%3===2?'right':null};
  const candidate=compose(pose,s,avatars.slice(0,count),opts);
  const original=measure(pose,a,aspect,opts.lyricsProtected?opts.lyricsSide:null);
  const result=measure(candidate,a,aspect,opts.lyricsProtected?opts.lyricsSide:null);
  assert(result&&original&&result.overflow<=original.overflow+1e-6,`worse viewport overlap ${count}:${role}:${i}`);
  assert([candidate.x,candidate.y,candidate.z,candidate.fov,candidate.targetX,candidate.targetY].every(Number.isFinite));
  assert(candidate.fov>=28&&candidate.fov<=76);assert(Math.abs(candidate.targetX-pose.targetX)<=.6);
  assert(candidate.z>=pose.z-.001,'Only widen, never accidentally crush subjects');
  if(candidate!==pose)improved++;
  trials++;
}
const s=scene(3,'feature',1),opts={...defaults};
assert.notStrictEqual(compose(pose,s,avatars,opts),pose);
for(const patch of [{playing:false},{reducedMotion:true},{automatic:false},{authored:true},
    {trackId:'other-track'},{progressMs:0},{progressMs:11000},{progressMs:NaN},
    {aspect:0},{aspect:NaN},{aspect:8}]){
  assert.strictEqual(compose(pose,s,avatars,{...opts,...patch}),pose,JSON.stringify(patch));
}
for(const bad of [{...s,active:false},{...s,focus:'none'},{...s,focus:'drop'},
    {...s,leadSlot:7},{...s,singingSlots:[5]},{...s,singingSlots:[1,1]},
    {...s,trackId:'wrong'}, {...s,strength:NaN},{...s,count:5},
    {...s,focus:'handoff',handoffFrom:null}]){
  assert.strictEqual(compose(pose,bad,avatars,opts),pose,`invalid cast ${JSON.stringify(bad)}`);
}
assert.strictEqual(compose(pose,s,avatars.filter(a=>a.slot!==0),opts),pose,'handoff requires both singers');
assert.strictEqual(compose(pose,s,avatars.map(a=>({...a,visible:false})),opts),pose);
assert.strictEqual(compose(pose,s,avatars.map(a=>({...a,x:NaN})),opts),pose);
assert.strictEqual(compose({...pose,fov:NaN},s,avatars,opts).fov,NaN);
assert.strictEqual(compose({...pose,z:-6.8},s,avatars,opts).z,-6.8,'reverse shot falls back');
assert.strictEqual(compose({...pose,x:20},s,avatars,opts).x,20,'side shot falls back');
assert.strictEqual(compose(pose,s,avatars,opts).z,compose(pose,s,avatars,opts).z,'pure repeatability');
const source=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
assert(source.indexOf('composeCinematicConcertCameraV550(')<source.indexOf('composeCinematicDuetInteractionV585(concertFramedV550,sceneV528'));
assert(source.indexOf('composeCinematicDuetInteractionV585(concertFramedV550,sceneV528')<source.indexOf('guardAutomaticCameraV351(composedV620,composition)'));
for(const token of ['composeConcertCameraV540','sceneFramedV528,sceneV528','aspect:camera.aspect',
  'authored:authoredCameraV528','composeCinematicConcertCameraV550(concertFramedV540,sceneV528','guardAutomaticCameraV351(composedV620,composition)',
  'lyricsSide:lipSync?.cinematicLyricsVisibleV378'])assert(source.includes(token),`missing camera integration: ${token}`);
const boundary=source.indexOf('composeConcertCameraV540('),safety=source.indexOf('guardAutomaticCameraV351(composedV620');
assert(safety>boundary,'V351 must remain last');
for(const banned of ['requestAnimationFrame(', 'setInterval(','Math.random(','window.', 'localStorage','new Audio('])
  assert(!fs.readFileSync('components/visualizer/cinematicCameraCompositionV540.ts','utf8').includes(banned));
// The five sample models are fixtures for integration QA; check they remain
// available, with their actual authored animation data, outside the release ZIP.
for(const name of ['sonic-performer-v3.glb','sonic-pulsebot-v1.glb','sonic-nova-v1.glb',
    'sonic-rae-v1.glb','sonic-jax-v1.glb']){
  const file=path.join('..',name);if(!fs.existsSync(file))continue;
  const bytes=fs.readFileSync(file);assert.equal(bytes.toString('ascii',0,4),'glTF');
  const length=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+length).toString('utf8'));
  assert(gltf.animations.length>=20);assert(gltf.nodes.length>0);
}
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=540,'V540 camera regression remains active after V540');
assert(pkg.scripts['build:preflight'].includes('npm run test:v540 && npm run test:v540:types'));
console.log(`PASS V540: ${trials} viewport/cast/lyric scenarios (${improved} bounded refinements), manual/identity safeguards, 5 GLB fixtures and camera wiring`);

assert(require("node:fs").readFileSync("components/visualizer/StageCameraDirectorV289.tsx","utf8").indexOf("composeCinematicDuetInteractionV585(concertFramedV550,sceneV528")<require("node:fs").readFileSync("components/visualizer/StageCameraDirectorV289.tsx","utf8").indexOf("composeFullSongCameraV605(duetFramedV585"),"V585 must precede V605");
