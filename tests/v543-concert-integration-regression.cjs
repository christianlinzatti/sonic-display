'use strict';
/** Integration tests: REAL existing planners, simulated music-time only, never synthetic FPS assertions. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {assessConcertShowReadinessV543:assess}=load('services/monitoring/concertShowReadinessV543');
const {beginBenchmarkV522:begin,advanceBenchmarkV522:advance,BENCHMARK_RECIPES_V522:recipes}=load('services/monitoring/concertBenchmarkValidationV522');
const {planConcertLightingV462:lighting}=load('components/visualizer/concertLightingDirectorV462');
const {refineConcertLightingV542:refine}=load('components/visualizer/intelligentConcertLightingV542');
const {planCinematicLyricsV541:lyricsPlan,planCinematicWordV541:word}=load('components/visualizer/cinematicLyricsExperienceV541');
const {planConcertSceneV528:scene,composeConcertSceneCameraV528:cameraBase}=load('components/visualizer/cinematicConcertCoordinationV528');
const {composeConcertCameraV540:camera}=load('components/visualizer/cinematicCameraCompositionV540');
const {planAdvancedGroupV517:group}=load('components/visualizer/advancedGroupPerformanceV517');
const {planCinematicMultiAvatarV527:multi}=load('components/visualizer/cinematicMultiAvatarV527');
const {planCrewConcertInteractionV539:crew}=load('components/visualizer/crewConcertInteractionV539');
const {rankGenreMotionsV536:rank}=load('components/visualizer/genreAwareMotionDirectorV536');
const {suggestMotionCategoryV535:category}=load('components/visualizer/motionLibraryIntelligenceV535');

// Run history comes ONLY from V522 once-per-second samples. Values below are
// FIXTURES for the readiness STATE MACHINE, never device performance measurements.
const at=1740000000000;
const read=(t,overrides={})=>({at:t,fps:48,p95FrameMs:27,p99FrameMs:35,slowPercent:4,
 drawCalls:320,triangles:183000,avatarCount:4,tier:'balanced',dpr:1.1,
 piProfile:'off',piLevel:'disabled',features:{lyrics:true,lipSync:true,reactiveLighting:true},
 heapMb:120,geometries:24,textures:17,...overrides});
function benchmark(id,recipe,offset=0,reading={}) {
  const t=at+offset;
  let run=begin(id,recipe.id,30,read(t,reading),t+200);
  assert(run);
  for(let i=1;i<=recipe.warmupSeconds+recipe.measurementSeconds;i++) {
    run=advance(run,read(t+i*1000,reading));
  }
  assert.equal(run.status,'complete');
  return run;
}
const empty=assess([],{},30);
assert.equal(empty.status,'measurements-missing');assert.equal(empty.completedScenes,0);
const three=recipes.flatMap((recipe,k)=>Array.from({length:3},(_,i)=>benchmark(`${k}-${i}`,recipe,k*900000+i*250000)));
assert.equal(assess(three,{},30).status,'visual-review-missing');
assert.equal(assess(three,{},30).completedScenes,3);
const review={lyricsLegible:true,lipSyncPlausible:true,motionNatural:true,lightReadable:true};
const partial=assess(three,{'deutschrap-feature':review},30);
assert.equal(partial.reviewedScenes,1);
const all=Object.fromEntries(recipes.map(r=>[r.id,review]));
assert.equal(assess(three,all,30).status,'locally-reviewed');
assert.match(assess(three,all,30).note,/kein automatischer Pi/);
assert.equal(assess(three.slice(0,-1),all,30).status,'measurements-missing');
assert.equal(assess(three.map(r=>({...r,targetFps:45})),all,30).status,'measurements-missing');
assert.equal(assess(three.map((r,i)=>i===0?{...r,status:'invalid'}:r),all,30).status,'measurements-missing');
const slow=benchmark('slow',recipes[0],4000000,{fps:18,p95FrameMs:56,p99FrameMs:75,slowPercent:35});
assert.equal(assess([...three,slow],all,30).status,'needs-attention',
 'A new bad run must revoke the provisional performance result');
const slow3=Array.from({length:3},(_,i)=>benchmark(`slow${i}`,recipes[0],5500000+i*500000,{fps:18,p95FrameMs:56,p99FrameMs:75,slowPercent:35}));
assert.equal(assess([...three,...slow3],all,30).status,'needs-attention');
const invalid= {...three.at(-1),id:'broken',status:'invalid',startedAt:at+9000000};
assert.equal(assess([...three,invalid],all,30).status,'needs-attention');
assert.equal(assess([...three,invalid,benchmark('fixed',recipes[2],10000000)],all,30).status,'locally-reviewed');
assert.equal(assess(three,all,45).status,'measurements-missing');

const pose={x:0,y:1.1,z:7.1,targetX:0,targetY:.15,targetZ:0,fov:38};
const anchors=[{slot:0,x:-1.8,y:0,z:.1,visible:true},{slot:1,x:-.6,y:0,z:0,visible:true},
 {slot:2,x:.6,y:0,z:0,visible:true},{slot:3,x:1.8,y:0,z:.1,visible:true}];
const samples=['Ich','rappe','auf','den','Beat','wir','stehen','hier'].map((text,i)=>
 ({text,startMs:1000+i*175,endMs:1135+i*175}));
const line={text:samples.map(w=>w.text).join(' '),startMs:1000,endMs:2500,words:samples};
const globFiles=['sonic-performer-v3.glb','sonic-pulsebot-v1.glb','sonic-nova-v1.glb',
 'sonic-rae-v1.glb','sonic-jax-v1.glb'];
let available=0,scenarios=0,checked=0;
for(const name of globFiles){
 const file=path.join(process.env.SONIC_V543_SAMPLES||'/mnt/data',name);
 let names=['Idle_Groove','Dance_Groove','Dance_RapTwoStep','Rap_Gesture',
   'Finger_Flow','Dance_ClubGroove','Hip_Bounce','Arms_Up','Head_Nod',
   'Shoulder_Roll','Dance_SideStep','Greeting_Wave','Hardtekk_Shuffle','Hardstyle_Stomp',
   'Dance_RapBounce','Dance_DiscoPoint','Dance_BackStep','Dance_Shuffle',
   'Dance_Rhythm','Idle_Breathe'];
 let tracks=165;
 if(fs.existsSync(file)){
  const data=fs.readFileSync(file);
  assert.equal(data.toString('ascii',0,4),'glTF');
  assert.equal(data.readUInt32LE(8),data.length,'GLB length/header integrity');
  const j=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString('utf8'));
  assert(j.animations.length>=20,'expected embedded clips');
  assert(j.skins?.length>0&&j.meshes?.length>0,'GLB rig and meshes');
  names=j.animations.map(a=>a.name);tracks=j.animations[0].channels.length;
  available++;
 }
 // Named synthetic clips are deliberately not presented as GLB verification.
 // In ZIP installations the external five models are optional fixtures.
 const clips=names.map(n=>({name:n,label:n,duration:2.4,trackCount:tracks,
  category:category(n),source:'embedded'}));
 for(const genre of ['Deutschrap','Hardstyle','Hardtekk'])for(const section of ['verse','hook','drop'])
 for(const count of [2,3,4])for(const tier of ['low','balanced','high']){
   const progressMs=1850;
   const vocalCue={active:true,role:section==='hook'?'hook':'feature',leadSlot:0,
    singingSlots:section==='hook'?Array.from({length:count},(_,i)=>i):[0],
    startMs:1000,endMs:10000,handoffFrom:section==='hook'?null:1,count};
   const base={genre,section,energy:section==='drop'?.9:.7,kick:section==='drop'?.95:.35,
    playing:true,reactive:true,reducedMotion:false,tier,authored:false,blackout:false};
   const ranked=rank({clips,trackId:'same-track',modelKey:name,progressMs,section,genre,bpm:120,
     energy:base.energy,slot:0,playing:true,reducedMotion:false,manualPriority:false},'phrase-v543');
   assert(ranked.length>0,`${name}: no valid motions`);
   const visual=lyricsPlan({line,nextLineStart:2800,synchronized:true,playing:true,
     reducedMotion:false,layout:'immersive',avatarCount:count,tier});
   assert(visual.verifiedWords);assert(visual.max3DWordMeshes<=(tier==='low'?0:26));
   const fill=word({line,nextLineStart:2800,wordIndex:3,progressMs,playing:true,
      reducedMotion:false,plan:visual});
   assert(fill&&fill.fill>=0&&fill.fill<=1);
   const lights=refine({base:lighting(base),section,energy:base.energy,kick:base.kick,tier,
     playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
     lyricsProtected:visual.verifiedWords,vocalFocus:genre==='Deutschrap',groupCount:count});
   assert.equal(lights.allowLasers,false);
   if(lights.active){assert(lights.hazeGain<=1&&lights.beamGain<=1,'Lyrics must take precedence over FX');}
   const result=scene({trackId:'same-track',cueTrackId:'same-track',cue:vocalCue,progressMs,
     count,playing:true,reducedMotion:false,tier});
   const shot=camera(pose,result,anchors.slice(0,count),{trackId:'same-track',progressMs,
      aspect:16/10,playing:true,reducedMotion:false,automatic:true,authored:false,
      lyricsProtected:true,lyricsSide:'left',faceY:1.3});
   assert(Number.isFinite(shot.z)&&Number.isFinite(shot.fov));
   const gInput={count,trackId:'same-track',cueTrackId:'same-track',cue:vocalCue,
     seconds:progressMs/1000,progressMs,bpm:105,positions:anchors.slice(0,count).map(a=>[a.x,0,a.z]),
     playing:true,reducedMotion:false,manualPriority:false,tier,beat:.7,energy:base.energy,strength:75,risks:[]};
   const g=group(gInput),c=multi(g,gInput),q=crew(g,c,gInput);
   if(tier==='low'){assert(!q.active);assert(!result.active);assert(!lights.active);}
   else {assert(result.active&&q.active);checked++;}
   scenarios++;
 }
}

assert.equal(scenarios,405);
// Direct integration references must survive later refactors.
const ui=fs.readFileSync('components/visualizer/PiConcertBenchmarkStudioV522.tsx','utf8');
assert(ui.includes('assessConcertShowReadinessV543(history,showReviewsV543,target)'));
assert(ui.includes('V543 – Concert Show Integration'));
assert(ui.includes('sceneVisualReviews:showReviewsV543'));
assert(!ui.includes('setPerformanceMode(')&&!ui.includes('requestAnimationFrame('));
for(const name of ['components/visualizer/DynamicStage.tsx','components/visualizer/StageCameraDirectorV289.tsx',
 'components/KineticLyrics.tsx','components/visualizer/Lyrics3DScene.tsx'])assert(fs.existsSync(name));
const pkg=require('../package.json');
assert.match(pkg.version,/^0\.1\.0-v(\d+)$/);
assert(Number(pkg.version.match(/-v(\d+)/)[1])>=543,'V543 behavior must remain available in later releases');
assert(pkg.scripts['build:preflight'].includes('npm run test:v543 && npm run test:v543:types &&'),'V543 preflight is mandatory in newer versions');
console.log(`PASS V543: ${scenarios} cross-system scenarios across ${available} real GLBs / ${5-available} synthetic stand-ins (${checked} active crew/camera cases), 3x3 V522 benchmark state machines + human review boundaries`);
