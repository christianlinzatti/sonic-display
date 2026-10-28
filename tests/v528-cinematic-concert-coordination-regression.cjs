'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planConcertSceneV528:plan,composeConcertSceneCameraV528:camera,
  concertLyricDirectionV528:lyrics}=load('components/visualizer/cinematicConcertCoordinationV528');
const {resolveAuthoredConcertSceneV528:authored}=load('components/visualizer/cinematicConcertSceneSourceV528');
const cast={active:true,role:'feature',leadSlot:1,singingSlots:[1],
  startMs:1000,endMs:7000,handoffFrom:0,count:3};
const base={trackId:'verified-track',cueTrackId:'verified-track',count:3,progressMs:2300,
 playing:true,reducedMotion:false,tier:'high',cue:cast};
const anchors=[{slot:0,x:-2,y:0,z:0,visible:true},{slot:1,x:.7,y:0,z:0,visible:true},
 {slot:2,x:2,y:0,z:0,visible:true},{slot:3,x:3.1,y:0,z:0,visible:true}];
const pose={x:0,y:1.2,z:7,targetX:0,targetY:0,targetZ:0,fov:39};
let n=0;
for(const count of [2,3,4])for(const role of ['lead','feature','hook'])for(let i=0;i<400;i++){
 const start=1000,now=start+20+i*13;
 const cue={...cast,count,role,leadSlot:i%count,handoffFrom:null,
   singingSlots:role==='hook'?Array.from({length:count},(_,k)=>k):[i%count]};
 const input={...base,count,cue,progressMs:now};const p=plan(input);
 assert(p.active); assert.equal(p.focus,role==='hook'?'ensemble':'lead');
 assert.deepEqual(p,plan(input));assert(p.strength<=.8&&p.strength>=0);
 assert(p.readingBoost<=1.035&&p.plateBoost<=.07&&p.lyricMotionGain>=.74);
 const framed=camera(pose,p,anchors.slice(0,count),{automatic:true,authored:false,lyricsProtected:i%2===0});
 assert(framed!==pose);assert(Number.isFinite(framed.z));assert(Math.abs(framed.targetX-pose.targetX)<=.38);
 assert(framed.fov>=30&&framed.fov<=72);
 n++;
}
const p=plan(base);assert(p.active&&p.focus==='handoff'&&p.leadSlot===1&&p.handoffFrom===0);
const panorama=plan({...base,cue:{...cast,role:'hook',handoffFrom:null,singingSlots:[0,1,2]}});
assert(panorama.active&&panorama.focus==='ensemble');
assert(camera(pose,panorama,anchors.slice(0,3),{automatic:true,authored:false,lyricsProtected:false}).z>pose.z);
const auto={automatic:true,authored:false,lyricsProtected:false};
for(const patch of [{playing:false},{reducedMotion:true},{tier:'low'},{trackId:'wrong'},
 {cueTrackId:'wrong'},{trackId:''},{progressMs:7000},{progressMs:-1},{progressMs:NaN},
 {count:5},{cue:null},{cue:{...cast,active:false}},{cue:{...cast,leadSlot:5}},
 {cue:{...cast,singingSlots:[2]}},{cue:{...cast,singingSlots:[1,1]}},
 {cue:{...cast,role:'hook'}},{cue:{...cast,handoffFrom:1}},
 {cue:{...cast,count:4}},{cue:{...cast,endMs:900}}]){
  assert(!plan({...base,...patch}).active,JSON.stringify(patch));
}
assert.strictEqual(camera(pose,p,anchors,{...auto,automatic:false}),pose);
assert.strictEqual(camera(pose,p,anchors,{...auto,authored:true}),pose);
assert.strictEqual(camera(pose,p,anchors.filter(a=>a.slot!==0),auto),pose);
assert.strictEqual(camera({...pose,fov:NaN},p,anchors,auto).fov,NaN);
assert.strictEqual(camera(pose,p,anchors.map(a=>({...a,visible:false})),auto),pose);
assert.deepEqual(lyrics(null,true,false),{motionGain:1,readingBoost:1,plateBoost:0});
assert.equal(lyrics(p,false,false).motionGain,1);
assert.equal(lyrics(p,true,true).motionGain,1);
assert(lyrics(p,true,false).motionGain<1);
// Actual track-bound V385 / V416 / V496 editorial inputs. No visual-only credit fallback.
const timed={trackId:'verified-track',lyrics:{synced:true,lines:[
 {startMs:1000,endMs:4000,text:'Lead rap'},{startMs:4000,endMs:7000,text:'Feature rap'}]},
 count:3,progressMs:4500,playing:true,reducedMotion:false,tier:'high'};
const manual=authored({...timed,manualEnabled:true,manualAssignments:[
 {fromLine:0,toLine:0,role:'lead',slot:0},{fromLine:1,toLine:1,role:'feature',slot:1}]});
assert(!authored({...timed,manualEnabled:true,manualCameraAllowed:false,manualAssignments:[{fromLine:1,toLine:1,role:'lead',slot:1}]}).active);
assert(manual.active&&manual.focus==='handoff'&&manual.leadSlot===1);
assert(!authored({...timed,manualEnabled:true,manualAssignments:[
 {fromLine:1,toLine:1,role:'lead',slot:3}]}).active);
assert(!authored({...timed,manualStage:true,manualEnabled:true,manualAssignments:[{fromLine:1,toLine:1,role:'feature',slot:1}]}).active);
const vocalTime=authored({...timed,timeEnabled:true,timeSegments:[
 {startMs:1000,endMs:4000,leadSlot:0,partnerSlot:1,style:'solo',strength:70},
 {startMs:4000,endMs:7000,leadSlot:1,partnerSlot:0,style:'duet',strength:70}]});
assert(vocalTime.active&&vocalTime.singingSlots.join(',')==='1,0');
assert(!authored({...timed,timeEnabled:true,timeCameraAllowed:false,timeSegments:[{startMs:4000,endMs:7000,leadSlot:1,partnerSlot:0,style:'duet',strength:80}]}).active);
const hook=authored({...timed,timeEnabled:true,timeSegments:[
 {startMs:4000,endMs:7000,leadSlot:1,partnerSlot:0,style:'hook',strength:70}]});
assert(hook.active&&hook.focus==='ensemble');
const duet=authored({...timed,duetEnabled:true,duetAssignments:[
 {fromLine:1,toLine:1,leadSlot:2,partnerSlot:1,style:'reply',strength:60}]});
assert(duet.active&&duet.leadSlot===2);
assert(!authored({...timed,duetEnabled:true,duetCameraAllowed:false,duetAssignments:[{fromLine:1,toLine:1,leadSlot:2,partnerSlot:1,style:'reply',strength:60}]}).active);
assert(!authored({...timed,manualEnabled:false,timeEnabled:false,duetEnabled:false}).active);
assert(!authored({...timed,trackId:''}).active);
for(const [file,tokens] of [
 ['components/visualizer/VisualizerStage.tsx',['resolveAuthoredConcertSceneV528','cinematicSceneV528,','lipSync={{cinematicSceneV528']],
 ['components/visualizer/StageCameraDirectorV289.tsx',['composeConcertSceneCameraV528','authoredCameraV528','composeConcertCameraV540(sceneFramedV528,sceneV528','composeCinematicConcertCameraV550(concertFramedV540,sceneV528','guardAutomaticCameraV351(composedV620','duetAnchorSampleV377.current.anchors']],
 ['components/visualizer/Lyrics3DScene.tsx',['concertLyricDirectionV528','visualV526.wordMotionGain*lyricsDirectionV528.motionGain']],
 ['components/KineticLyrics.tsx',['concertLyricDirectionV528','v526.wordMotionGain*lyricsDirectionV528.motionGain']],
 ['components/visualizer/cinematicMultiAvatarV527.ts',['cinematicFocusV527(scene)']]]){
   const source=fs.readFileSync(file,'utf8');for(const token of tokens)assert(source.includes(token),`${file} missing ${token}`);
}
const cameraWiringV585=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
assert(cameraWiringV585.indexOf('composeCinematicConcertCameraV550(')<cameraWiringV585.indexOf('composeCinematicDuetInteractionV585(concertFramedV550,sceneV528'));
assert(cameraWiringV585.indexOf('composeCinematicDuetInteractionV585(concertFramedV550,sceneV528')<cameraWiringV585.indexOf('guardAutomaticCameraV351(composedV620,composition)'));
const src=fs.readFileSync('components/visualizer/cinematicConcertCoordinationV528.ts','utf8');
for(const symbol of ['requestAnimationFrame(', 'setInterval(','new Audio(','window.','localStorage','Math.random('])assert(!src.includes(symbol));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=528);
assert(pkg.scripts['build:preflight'].includes('npm run test:v528 && npm run test:v528:types'));
console.log(`PASS V528: ${n} verified camera+lyrics frames; manual priority, invalid identity, tracks, hooks and integration`);

assert(require("node:fs").readFileSync("components/visualizer/StageCameraDirectorV289.tsx","utf8").indexOf("composeCinematicDuetInteractionV585(concertFramedV550,sceneV528")<require("node:fs").readFileSync("components/visualizer/StageCameraDirectorV289.tsx","utf8").indexOf("composeFullSongCameraV605(duetFramedV585"),"V585 must precede V605");
