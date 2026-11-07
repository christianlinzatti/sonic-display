#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {planConcertCameraDirectorV1072:plan,composeConcertCameraDirectorV1072:compose,
 OFF_CAMERA_V1072:OFF}=load('lib/arena360ConcertCameraDirectorV1072');
const {generateArenaShowPlanV1040:generate,sampleArenaShowPlanV1040:sample}=load('lib/arena360ShowDesignerV1040');
const durationMs=210000,score=generate({genre:'Deutschrap',durationMs,prompt:'Konzert mit Rap'});
const lyrics={synced:true,provider:'lrclib',plainText:null,lines:[
 {startMs:50000,endMs:56000,text:'Wir bauen die Welt!',words:[{text:'Wir',startMs:50000,endMs:51000},
  {text:'bauen',startMs:51000,endMs:52500},{text:'die',startMs:52500,endMs:54000},
  {text:'Welt!',startMs:54000,endMs:56000}]},
]};
const mk=(ms,extra={})=>({enabled:true,stageIsArena:true,cameraEnabled:true,
 playing:true,reducedMotion:false,reactive:true,manualPriority:false,
 showDesignerEnabled:true,showDirectorEnabled:true,trackId:'song-v1072-one',
 progressMs:ms,durationMs,strength:65,performanceTier:'high',castCount:3,
 plan:score,show:sample(score,{enabled:true,playing:true,reducedMotion:false,
 progressMs:ms,durationMs}),lyricsPlaying:true,lyrics,...extra});
const at=(ms,extra={})=>plan(mk(ms,extra));
const pose={x:5.2,y:1.7,z:6.4,fov:40,targetX:.5,targetY:1,targetZ:0};
const active=at(54000);
assert.equal(active.active,true);assert.equal(active.reason,'planned');
assert.deepEqual(at(54000),active,'deterministic score');
assert.equal(active.chapter,1);assert.equal(active.lyricAccent,true,'word-level timed lyric accent');
assert.notDeepEqual(compose(pose,active),pose,'camera composition is visible');
assert.deepEqual(pose,{x:5.2,y:1.7,z:6.4,fov:40,targetX:.5,targetY:1,targetZ:0},'no mutation');
for(const patch of [{enabled:false},{stageIsArena:false},{cameraEnabled:false},
 {reactive:false},{playing:false},{reducedMotion:true},{performanceTier:'low'},
 {manualPriority:true},{showDesignerEnabled:false},{showDirectorEnabled:false},
 {trackId:''},{trackId:null},{progressMs:NaN},{progressMs:-1},{durationMs:0},
 {durationMs:Infinity},{durationMs:21000},{progressMs:211000},{strength:0},
 {strength:-1},{strength:81},{strength:NaN},{strength:Infinity},
 {plan:null},{plan:{...score,segments:[]}},{show:null},{show:{...active,scene:'invalid'}},
 {show:{...mk(54000).show,active:false}},{show:{...mk(54000).show,segmentIndex:7}},
 {show:{...mk(54000).show,fade:NaN}},{show:{...mk(54000).show,intensity:101}}]){
 const cue=at(54000,patch);
 assert.equal(cue.active,false,'fail closed '+JSON.stringify(patch).slice(0,75));
 assert.strictEqual(compose(pose,cue),pose,'off cue is an identity');
}
assert.deepEqual(at(54000,{enabled:false}),OFF);
assert.equal(at(54000,{playing:false}).reason,'paused');
assert.equal(at(54000,{manualPriority:true}).reason,'manual');
assert.equal(at(54000,{reducedMotion:true}).reason,'motion');
assert.equal(at(54000,{progressMs:NaN}).reason,'clock');
const muted=at(54000,{lyrics:null});
assert(!muted.lyricAccent,'no generated lyric events');
const lineOnly=at(54000,{lyrics:{...lyrics,lines:[{startMs:50000,text:'Nur Zeile'}]}});
assert(!lineOnly.lyricAccent,'line-only lyrics may not trigger vocal accents');
assert(at(54000,{strength:15}).weight<at(54000,{strength:75}).weight);
assert(at(54000,{performanceTier:'balanced'}).weight<active.weight);
const invalid=[{...pose,x:NaN},{...pose,fov:Infinity},{...pose,targetZ:Infinity},
 {...pose,x:1,z:1,targetX:0},{...pose,x:80}];
for(const p of invalid)assert.strictEqual(compose(p,active),p,'nonfinite/too near/too far camera protected');
assert.strictEqual(compose(pose,active,true),pose,'manual/duet/lyric/preset protected');
assert.strictEqual(compose(pose,{...active,active:false}),pose);
for(const shot of ['vocal','ensemble','orbit','crane','dolly','wide']){
 const cue={...active,shot,previous:shot,blend:1,weight:.65,seconds:40};
 const result=compose(pose,cue);
 assert(Math.abs(result.x-pose.x)<.55&&Math.abs(result.z-pose.z)<.55,'bounded camera movement '+shot);
 assert(Math.abs(result.y-pose.y)<.4,'bounded height '+shot);
 assert(Math.abs(result.targetY-pose.targetY)<.12,'bounded camera focus '+shot);
 assert(Math.abs(result.fov-pose.fov)<2,'bounded fov '+shot);
 assert(Number.isFinite(result.x)&&Number.isFinite(result.y)&&Number.isFinite(result.z));
}
const vocalPose=compose(pose,{...active,shot:'vocal',previous:'vocal',blend:1,lyricAccent:false});
assert(vocalPose.fov<pose.fov,'lens zoom for existing singer-tracked center');
assert(Math.hypot(vocalPose.x-pose.targetX,vocalPose.z-pose.targetZ)<
 Math.hypot(pose.x-pose.targetX,pose.z-pose.targetZ),'closeup moves slightly closer');
assert.equal(at(54000,{lyricsPlaying:false}).lyricAccent,false);
// No vocal shot is ever selected if lyrics cannot substantiate word-level timing.
for(let k=0;k<700;k++){
 const t=(20000+k*250)%209999;
 assert.notEqual(at(t,{lyrics:null}).shot,'vocal');
 assert.notEqual(at(t,{lyricsPlaying:false}).shot,'vocal');
 assert.notEqual(at(t,{castCount:1}).shot,'ensemble');
}
// Verify all seven chapter positions and four pacing profiles over 20,000 samples.
let sampleCount=0;const shotTypes=new Set();
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 const g=generate({genre,durationMs});
 for(let k=0;k<5000;k++){
  const ms=durationMs*(k+.55)/5000;
  const q=plan(mk(ms,{plan:g,show:sample(g,{enabled:true,playing:true,reducedMotion:false,
    progressMs:ms,durationMs}),trackId:'song-'+genre}));
  sampleCount++;
  if(!q.active){assert.equal(q.weight,0,`${genre} fade-in ${k}`);continue;}
  shotTypes.add(q.shot);
  assert(q.blend>=0&&q.blend<=1&&q.weight>=0&&q.weight<=.8,'bounded cue');
  const p=compose(pose,q);
  assert(Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z)&&Number.isFinite(p.fov));
  assert(Math.abs(p.x-pose.x)<.6&&Math.abs(p.z-pose.z)<.6&&Math.abs(p.y-pose.y)<.4,
    `${genre} camera motion ${k}`);
 }
}
assert.equal(sampleCount,20000);
for(const shot of ['wide','crane','orbit','dolly','vocal','ensemble'])assert(shotTypes.has(shot),'coverage '+shot);
for(const b of [.085,.29,.43,.62,.76,.88]){
 // Probe same chapter pose with transition after new chapter: no hard camera mode cut.
 const atBoundary=(ms)=>{const v=mk(ms);const index=v.show.segmentIndex;
   v.show={...v.show,fade:1,intensity:score.segments[index].intensity};return plan(v);};
 const right=atBoundary(durationMs*(b+1e-9));
 assert(right.active&&right.blend<.00001,'blend restarts at chapter boundary '+b);
 const left=atBoundary(durationMs*(b-1e-9));
 assert.equal(right.previous,left.shot,'previous shot continues into new chapter '+b);
}
const owners=['components/visualizer/StageCameraDirectorV289.tsx','components/visualizer/SmartStageCameraV236.tsx'];
for(const file of owners){
 const src=read(file);
 assert(src.includes('composeArenaCinematicCameraV1053('),'retain V1053 '+file);
 assert(src.includes('composeConcertCameraDirectorV1072('),'new composition '+file);
 assert(src.indexOf('composeConcertCameraDirectorV1072(')>src.indexOf('composeArenaCinematicCameraV1053('),'ordered '+file);
 assert(src.includes('flyoverProtectedV1033||!automaticShot')||src.includes('protectedShotV1033'),'manual locks '+file);
}
const app=read('components/visualizer/ThreeAvatar.tsx');
assert(app.includes('concertCameraV1072=planConcertCameraDirectorV1072('));
assert(app.includes("stageIsArena:props.stageTheme==='arena360',cameraEnabled:props.arenaCameraEnabledV1032??true,"),
 'V1072 can be enabled independently of old V1043 show camera toggle');
for(const component of ['StageCameraDirectorV289','SmartStageCameraV236'])
 assert(app.includes(`<${component} concertCameraCueV1072={concertCameraV1072}`),'both camera owners get cue');
for(const file of ['types/music.ts','components/visualizer/registry.tsx','context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx'])
 assert(read(file).includes('arenaCameraDirectorStrengthV1072'),file);
assert(read('context/UiPreferencesContext.tsx').includes('arenaCameraDirectorEnabledV1072:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1072 · Concert Camera Director 4.0'));
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(file).includes('tests/v1072-concert-camera-director-regression.cjs'));
for(const bad of [/\bfetch\(/,/\bMath\.random\(/,/\bDate\.now\(/,/\bsetInterval\(/,/\bsetTimeout\(/,/\brequestAnimationFrame\(/,/\bWebSocket\(/,/\blocalStorage\b/,/\bGoveeClient\b/])
 assert(!bad.test(read('lib/arena360ConcertCameraDirectorV1072.ts')),'no hardware/timer/random: '+bad);
console.log('PASS V1072: 20,000 concert shots across 4 genres, 7 chapters, lyrical focus, two protected camera owners');
