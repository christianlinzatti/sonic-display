'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {normalizeCinemaV992,DEFAULT_CINEMA_V992,createCinemaStateV992,sampleCinemaV992,
 previewCinemaV992}=load('components/visualizer/cinematicCameraDirectorV992');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=x=>fs.readFileSync(path.join(__dirname,'..',x),'utf8');
const plan={trackId:'song-A',durationMs:120000,source:'verified-v604',scenes:[
 {index:0,startMs:0,endMs:20000,section:'intro'},
 {index:1,startMs:20000,endMs:60000,section:'verse'},
 {index:2,startMs:60000,endMs:100000,section:'hook'},
 {index:3,startMs:100000,endMs:120000,section:'finale'}]};
const pose={x:.1,y:.3,z:4.7,targetX:0,targetY:.4,targetZ:0,fov:40};
const settings={...DEFAULT_CINEMA_V992,enabled:true};
const input=(patch={})=>({pose,plan,settings,trackId:'song-A',durationMs:120000,positionMs:70000,
 playing:true,autoEnabled:true,directorEnabled:true,directorCameraEnabled:true,
 reducedMotion:false,tier:'high',aspect:16/9,measuredKick:.1,...patch});
const sample=(patch={},state=createCinemaStateV992())=>sampleCinemaV992(input(patch),state);
let pass=0;function check(label,fn){try{fn();pass++;console.log('PASS V992 '+label)}catch(e){e.message='V992 '+label+': '+e.message;throw e;}}
check('opt-in defaults and strictly normalized preference values',()=>{
 assert.equal(DEFAULT_CINEMA_V992.enabled,false);
 assert.deepEqual(normalizeCinemaV992({}),DEFAULT_CINEMA_V992);
 assert.equal(normalizeCinemaV992({enabled:'true'}).enabled,false);
 assert.equal(normalizeCinemaV992({mode:'festival'}).mode,'festival');
 assert.equal(normalizeCinemaV992({mode:'performer'}).mode,'performer');
 assert.equal(normalizeCinemaV992({mode:'orbit'}).mode,'story');
 assert.equal(normalizeCinemaV992({intensity:101}).intensity,100);
 assert.equal(normalizeCinemaV992({intensity:-20}).intensity,0);
 assert.equal(normalizeCinemaV992({intensity:Infinity}).intensity,55);
 assert.equal(normalizeCinemaV992({accents:'true'}).accents,true);
 assert.equal(normalizeCinemaV992({protectLyrics:false}).protectLyrics,false);
});
check('no camera override without verified scene and song binding',()=>{
 for(const patch of [{plan:null},{plan:{...plan,source:'unavailable'}},
 {plan:{...plan,trackId:'other'}},{plan:{...plan,durationMs:110000}},
 {trackId:'other'},{durationMs:130000},{positionMs:-1},{positionMs:120000},
 {plan:{...plan,scenes:[]}},{plan:{...plan,scenes:[{...plan.scenes[2],endMs:150000}]}}]){
  const cue=sample(patch);assert.equal(cue.active,false,JSON.stringify(patch));
  assert.strictEqual(cue.pose,pose,'off must preserve original pose object');
 }
});
check('disabling, manual edits, reduced motion and frame protections are authoritative',()=>{
 const gates=[{settings:{...settings,enabled:false}},{settings:{...settings,intensity:0}},
 {playing:false},{autoEnabled:false},{directorEnabled:false},{directorCameraEnabled:false},
 {authored:true},{manualFx:true},{seekBlocked:true},{blackout:true},
 {reducedMotion:true},{tier:'low'},{lyricsProtected:true},{lyricsVisible:true},
 {vocalCloseup:true},{aspect:0},{aspect:4},{pose:{...pose,fov:999}},
 {positionMs:70000,plan:{...plan,scenes:[{...plan.scenes[2],startMs:69000,endMs:70001}]}}];
 for(const patch of gates){const cue=sample(patch);assert.equal(cue.active,false,JSON.stringify(patch));}
});
check('three film languages and song-section continuity',()=>{
 for(const mode of ['story','performer','festival']){
  const c=sample({settings:{...settings,mode}});
  assert(c.active&&c.kind===mode);assert(c.cameraRate<=1&&c.cameraRate>=.92);
  assert(Math.abs(c.pose.x-pose.x)<.17);
  assert(Math.abs(c.pose.z-pose.z)<.25);
  assert(Math.abs(c.pose.fov-pose.fov)<1.1);
 }
 const intro=sample({positionMs:5000}),verse=sample({positionMs:29000}),outro=sample({positionMs:113000});
 assert(intro.active&&verse.active&&outro.active);
 assert.notDeepEqual(intro.pose,verse.pose);
 const boundary=sample({positionMs:60000});assert(!boundary.active,'do not cut at boundaries');
});
check('verified camera preview uses actual scene starts only',()=>{
 assert.equal(previewCinemaV992(null,settings).length,0);
 const previews=previewCinemaV992(plan,settings);
 assert.deepEqual(previews.map(x=>x.startMs),[0,20000,60000,100000]);
 assert(previews.some(x=>x.style==='Künstler-Nähe'));
});
check('live bass requires quiet-to-loud edge within verified energetic scene',()=>{
 const state=createCinemaStateV992();
 sample({positionMs:69000,measuredKick:.95},state); // high at start must not fire
 assert.equal(sample({positionMs:69100,measuredKick:.95},state).accent,0);
 sample({positionMs:69200,measuredKick:.1},state); // arm on quiet
 const on=sample({positionMs:69300,measuredKick:.9},state);
 assert(on.active&&on.accent>0&&on.accent<=.07,'measured onset creates small accent');
 const decayed=sample({positionMs:69600,measuredKick:.9},state);
 assert(decayed.accent<on.accent&&decayed.accent>=0);
 assert.equal(sample({positionMs:69900,measuredKick:.9},state).accent,0);
});
check('no fake impact in verse, missing audio, paused or disabled accents',()=>{
 for(const patch of [{positionMs:29000},{measuredKick:undefined},{measuredKick:Infinity},
 {settings:{...settings,accents:false}},{playing:false},{reducedMotion:true}]){
  const st=createCinemaStateV992(),p=patch.positionMs??69000;
  sample({...patch,positionMs:p,measuredKick:.1},st);
  const cue=sample({...patch,positionMs:p+100,measuredKick:patch.measuredKick===undefined?undefined:patch.measuredKick===Infinity?Infinity:.95},st);
  assert.equal(cue.accent,0,JSON.stringify(patch));
 }
});
check('song switch, skip, pause and seek invalidate stale bass event',()=>{
 const st=createCinemaStateV992();sample({positionMs:69000,measuredKick:.1},st);
 assert(sample({positionMs:69100,measuredKick:.98},st).accent>0);
 for(const patch of [{trackId:'song-B'},{positionMs:67000},{positionMs:75000},{playing:false},
 {seekBlocked:true}]){
  const base={...input(),...patch,plan:patch.trackId?{...plan,trackId:'song-B'}:plan};
  const c=sampleCinemaV992(base,st);
  assert.equal(c.accent,0,'no old kick after seek/change');
  assert.equal(st.onsetMs,-1);
  // reset to known state for each variant
  sample({positionMs:69000,measuredKick:.1},st);
  sample({positionMs:69100,measuredKick:.98},st);
 }
});
check('duets preserve wider composition and never force faces',()=>{
 const single=sample(),multi=sample({duo:true});
 assert(multi.active);assert(Math.abs(multi.pose.z-pose.z)<Math.abs(single.pose.z-pose.z));
});
check('10,000 settings and timing samples never produce invalid camera poses',()=>{
 let seed=87543;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
 for(let j=0;j<10000;j++){
  const s={...settings,mode:['story','performer','festival'][j%3],intensity:rand()*110};
  const c=sample({positionMs:Math.floor(rand()*120000),settings:s,measuredKick:rand()});
  assert(c.accent>=0&&c.accent<=.071);
  assert(c.cameraRate>=.92&&c.cameraRate<=1);
  for(const n of [c.pose.x,c.pose.y,c.pose.z,c.pose.targetX,c.pose.targetY,c.pose.fov])assert(Number.isFinite(n));
  if(c.active){assert(Math.abs(c.pose.z-pose.z)<.25);assert(Math.abs(c.pose.fov-pose.fov)<1.1);}
 }
});
check('published concert bridge sanitizes preferences and keeps V897 fallback',()=>{
 const signal={...bridge.OFF_CONCERT_SIGNAL_V882,trackId:'song-A',durationMs:120000,
  enabled:true,playing:true,intensity:.7,sceneSource:'verified',section:'hook',
  look:'neon',sceneStartMs:60000,sync:{stage:true,lights:true,dance:true},
  cameraSettingsV992:{...settings,intensity:900,mode:'nonsense'},
  directorPlanV895:plan};
 bridge.publishConcertStageSyncV882(signal);
 const snapshot=bridge.readConcertStageSyncV882();
 assert.equal(snapshot.cameraSettingsV992.intensity,100);
 assert.equal(snapshot.cameraSettingsV992.mode,'story');
 assert(snapshot.directorPlanV895);
 bridge.publishConcertStageSyncV882({...signal,cameraSettingsV992:{...settings,mode:'festival'}});
 assert.equal(bridge.readConcertStageSyncV882().cameraSettingsV992.mode,'festival');
 bridge.publishConcertStageSyncV882(null);
});
check('single camera rendering chain, UI, and production gate are connected',()=>{
 const stage=read('components/visualizer/StageCameraDirectorV289.tsx');
 const ui=read('components/visualizer/LiveFxDeckV881.tsx');
 const sync=read('components/visualizer/concertStageSyncV882.ts');
 assert(stage.includes('pose:cinemaV992.pose,plan:cameraSignalV897.directorPlanV895'));
 assert(stage.indexOf('const cinemaV992=')<stage.indexOf('const danceCameraV898='));
 assert(stage.includes('cinematicCameraV897.cameraRate*cinemaV992.cameraRate*danceCameraV898.cameraRate'));
 assert(stage.includes('guardAutomaticCameraV351(cinematicV1025.pose,composition)'));
 assert(stage.includes('measuredKick:lipSync?.rapCameraKickV433'));
 assert(ui.includes('CINEMA_KEY_V992')&&ui.includes('updateCinemaV992'));
 assert(sync.includes('normalizeCinemaV992(input.cameraSettingsV992)'));
 assert(read('scripts/vercel-production-build.cjs').includes('tests/v992-cinematic-camera-director-regression.cjs'));
});
check('release metadata and CI tests present',()=>{
 const pkg=JSON.parse(read('package.json'));
 const lock=JSON.parse(read('package-lock.json'));
 assert(Number(pkg.sonicRoadmapRelease.slice(1))>=992);assert(Number(pkg.sonicFeatureRelease.slice(1))>=992);
 assert.equal(pkg.version,lock.version);assert.equal(lock.packages[''].version,pkg.version);
 assert(pkg.scripts.prebuild.includes('npm run test:v992 && npm run test:v992:types'));
 assert(read('.github/workflows/v832-continuous-validation.yml').includes('test:v992'));
});
console.log('PASS V992: '+pass+' groups');
