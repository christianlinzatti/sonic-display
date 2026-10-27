'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {composeCinematicConcertCameraV550:compose,measureConcertFrameV550:measure}=load('components/visualizer/cinematicConcertCameraV550');
const {composeConcertCameraV540:prior,measureScreenFrameV540:screen}=load('components/visualizer/cinematicCameraCompositionV540');
const {planConcertSceneV528:plan}=load('components/visualizer/cinematicConcertCoordinationV528');
const pose={x:0,y:1.3,z:7,targetX:0,targetY:.15,targetZ:0,fov:38};
const all=[{slot:0,x:-1.75,y:0,z:0,visible:true},{slot:1,x:-.55,y:0,z:.15,visible:true},
 {slot:2,x:.65,y:0,z:-.1,visible:true},{slot:3,x:1.75,y:0,z:0,visible:true}];
const opt={trackId:'verified',progressMs:3400,aspect:16/9,playing:true,reducedMotion:false,
 automatic:true,authored:false,lyricsProtected:false,lyricsSide:null,faceY:1.63};
function scene(count,focus,lead,ms=3400){return plan({trackId:'verified',cueTrackId:'verified',count,
 progressMs:ms,playing:true,reducedMotion:false,tier:'high',cue:{active:true,
 role:focus==='ensemble'?'hook':focus==='handoff'?'feature':'lead',count,leadSlot:lead,
 handoffFrom:focus==='handoff'?(lead+count-1)%count:null,
 singingSlots:focus==='ensemble'?Array.from({length:count},(_,i)=>i):[lead],startMs:500,endMs:13000}});}
function actors(s){return s.focus==='ensemble'?s.singingSlots.map(i=>all[i]):s.focus==='handoff'?[all[s.handoffFrom],all[s.leadSlot]]:[all[s.leadSlot]];}
let cases=0,actual=0,solo=0,ensemble=0,handoff=0;
for(const count of [2,3,4])for(const focus of ['lead','handoff','ensemble'])
for(const aspect of [16/9,16/10,4/3,9/16])for(let i=0;i<270;i++){
 const ms=780+(i*43)%11500,s=scene(count,focus,i%count,ms);
 assert(s.active,'verified cue remains active');
 const side=i%4===1?'left':i%4===2?'right':null;
 const options={...opt,progressMs:ms,aspect,lyricsProtected:i%4!==0,lyricsSide:side};
 const anchors=all.slice(0,count),a=actors(s);
 const step=prior(pose,s,anchors,{...options});
 const base=measure(step,a,aspect,side,options.lyricsProtected,1.63);
 const candidate=compose(step,s,anchors,options);
 const next=measure(candidate,a,aspect,side,options.lyricsProtected,1.63);
 if(!base||!next){assert.strictEqual(candidate,step);continue;}
 assert(next.overflow<=base.overflow+1e-6);
 assert(next.headOverflow<=base.headOverflow+1e-6);
 assert(next.fullBodyOverflow<=base.fullBodyOverflow+1e-6);
 const before540=screen(step,a,aspect,side),after540=screen(candidate,a,aspect,side);
 assert(before540&&after540&&after540.overflow<=before540.overflow+1e-6);
 assert([candidate.x,candidate.y,candidate.z,candidate.targetX,candidate.targetY,candidate.fov].every(Number.isFinite));
 assert(Math.abs((candidate.targetX??0)-(step.targetX??0))<=.19);
 assert(Math.abs(candidate.targetY-step.targetY)<=.11);
 assert(candidate.fov>=28&&candidate.fov<=76);
 assert.deepEqual(compose(step,s,anchors,options),candidate,'deterministic: no shake from hidden state');
 if(candidate!==step){actual++;if(focus==='lead')solo++;if(focus==='handoff')handoff++;if(focus==='ensemble')ensemble++;}
 cases++;
}
assert(cases>=9500,`not enough cases: ${cases}`);
assert(solo>0&&handoff>0&&ensemble>0,`camera must make visible changes in all roles: ${solo}/${handoff}/${ensemble}`);
const lead=scene(3,'lead',1),handoffScene=scene(3,'handoff',1),hook=scene(3,'ensemble',1);
for(const s of [lead,handoffScene,hook]){
 assert.strictEqual(compose(pose,s,all,{...opt,playing:false}),pose);
 for(const patch of [{reducedMotion:true},{automatic:false},{authored:true},{trackId:'other'},
  {trackId:''},{progressMs:150},{progressMs:13000},{progressMs:NaN},
  {aspect:.1},{aspect:5},{aspect:NaN}])assert.strictEqual(compose(pose,s,all,{...opt,...patch}),pose,JSON.stringify(patch));
 assert.strictEqual(compose(pose,s,all.map(a=>({...a,visible:false})),opt),pose);
 assert.strictEqual(compose(pose,s,all.map(a=>({...a,x:NaN})),opt),pose);
 assert.strictEqual(compose({...pose,z:-7},s,all,opt).z,-7);
 assert.strictEqual(compose({...pose,x:18},s,all,opt).x,18);
 assert.strictEqual(compose({...pose,fov:NaN},s,all,opt).fov,NaN);
 for(const patch of [{active:false},{trackId:'wrong'}, {count:5},{strength:NaN},
  {leadSlot:9},{singingSlots:[1,1]},{singingSlots:[2]}, {singingSlots:[9]}]){
  assert.strictEqual(compose(pose,{...s,...patch},all,opt),pose,JSON.stringify(patch));
 }
}
assert.strictEqual(compose(pose,{...hook,singingSlots:[1,2]},all,opt),pose,'partial hook cast cannot be inferred');
assert.strictEqual(compose(pose,{...handoffScene,handoffFrom:null},all,opt),pose);
assert.strictEqual(compose(pose,handoffScene,all.filter(a=>a.slot!==0),opt),pose);
assert.strictEqual(measure(pose,[],16/9),null);
assert.strictEqual(measure(pose,all,NaN),null);
assert.strictEqual(measure(pose,all.map(a=>({...a,visible:false})),16/9),null);
const src=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
assert(src.indexOf('composeCinematicConcertCameraV550(')<src.indexOf('composeCinematicDuetInteractionV585(concertFramedV550,sceneV528'));
assert(src.indexOf('composeCinematicDuetInteractionV585(concertFramedV550,sceneV528')<src.indexOf('guardAutomaticCameraV351(genreFramedV610,composition)'));
for(const token of ['composeConcertCameraV540(sceneFramedV528,sceneV528',
 'composeCinematicConcertCameraV550(concertFramedV540,sceneV528',
 'guardAutomaticCameraV351(genreFramedV610,composition)',
 'authored:authoredCameraV528','aspect:camera.aspect','duetAnchorSampleV377.current.anchors',
 'faceY:faceSampleV369.current.value', "sceneV528?.focus==='handoff'?"])
 assert(src.includes(token),'missing camera wiring '+token);
assert(src.indexOf('composeConcertCameraV540(')<src.indexOf('composeCinematicConcertCameraV550('));
assert(src.indexOf('composeCinematicConcertCameraV550(')<src.indexOf('guardAutomaticCameraV351(genreFramedV610'));
const moduleSource=fs.readFileSync('components/visualizer/cinematicConcertCameraV550.ts','utf8');
for(const illegal of ['window.', 'document.', 'Math.random(', 'requestAnimationFrame(', 'setInterval(', 'setTimeout(', 'new Audio('])assert(!moduleSource.includes(illegal));
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=550);
assert(pkg.scripts['build:preflight'].includes('npm run test:v550 && npm run test:v550:types'));
console.log(`PASS V550: ${cases} verified cinematic role/aspect/timing scenarios, ${actual} refined (${solo} solos, ${handoff} handoffs, ${ensemble} hooks), camera/lyrics safety`);

assert(require("node:fs").readFileSync("components/visualizer/StageCameraDirectorV289.tsx","utf8").indexOf("composeCinematicDuetInteractionV585(concertFramedV550,sceneV528")<require("node:fs").readFileSync("components/visualizer/StageCameraDirectorV289.tsx","utf8").indexOf("composeFullSongCameraV605(duetFramedV585"),"V585 must precede V605");
