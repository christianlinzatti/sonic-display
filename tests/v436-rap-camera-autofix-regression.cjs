'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planRapCameraAutoFixV436:plan,combineRapCameraAutoFixV436:combine}=
  load('components/visualizer/rapCameraAutoFixV436');
const {inferRapCameraScenesV436:inferScenes,cameraSceneAssignmentsV436:cast}=
  load('components/visualizer/autoRapSceneAssignmentsV436');
const {resolveExpressiveRapCueV425:resolveCue}=load('components/visualizer/expressiveRapDirectorV425');
const {planRapCameraV429:cameraPlan}=load('components/visualizer/cinematicRapCameraV429');
const line=(idx,start,end,shot,lead=0,override=null)=>({
  lineIndex:idx,startMs:start,endMs:end,text:'Lyrics '+idx,
  shot,authoredShot:shot,override,strength:100,leadSlot:lead,
  durationMs:end-start,eligible:true,
});
const lyricLines=Array.from({length:16},(_,i)=>({startMs:i*1600,endMs:(i+1)*1600,
  text:i<4||i>=12?`Refrain wiederholt sich ${i%4}`:`Strophe mit eigenem Inhalt ${i}`}));
const lyrics={provider:'spotify',synced:true,lines:lyricLines,plainText:null};
const inferred=inferScenes(lyrics,2);
assert(inferred.length>=3,'default solo scene and two detected repeated hook ranges');
assert(inferred.some(scene=>scene.style==='solo'&&scene.fromLine===0&&scene.toLine===15));
assert(inferred.some(scene=>scene.style==='hook'&&scene.fromLine===0));
assert(inferred.some(scene=>scene.style==='hook'&&scene.fromLine===12));
assert.deepEqual(inferScenes(lyrics,1),[],'no vocal cast for a single avatar');
assert.deepEqual(inferScenes({...lyrics,synced:false},2),[]);
assert.equal(cast({lyrics,authored:[],avatarCount:2,autoEnabled:false}).inferred,false);
const explicit=[{fromLine:0,toLine:15,leadSlot:1,partnerSlot:0,style:'duet',strength:85}];
assert.deepEqual(cast({lyrics,authored:explicit,avatarCount:2,autoEnabled:true}),
  {assignments:explicit,inferred:false},'explicit V416 cast is never replaced');
const cue=resolveCue({enabled:true,playing:true,reducedMotion:false,lyrics,progressMs:1400,
  trackId:'track',assignmentTrackId:'track',assignments:inferred,
  assignmentSource:'auto',avatarCount:2,strength:100});
assert(cue.active&&cue.source==='auto-lyrics','inferred lyrics source must be transparent');
assert(cameraPlan({enabled:true,playing:true,reducedMotion:false,trackId:'track',
  assignmentTrackId:'track',progressMs:1400,strength:80,cue}).active,
  'auto scene can drive the existing V429 camera');
const samples=[
  line(0,0,1900,'solo-close'),line(1,1900,2500,'reply-side',1),
  line(2,2500,3100,'duet-wide'),line(3,3100,4400,'hook-push'),
  line(4,4400,5000,'reply-side'),line(5,5000,6500,'solo-close'),
];
const basic={trackId:'rap-track',items:samples,settings:{smoothness:95,beatSync:true},
  bpm:120,duo:true,strength:65,lyricsProtected:true};
const inputSnapshot=JSON.stringify(basic);
const optimized=plan(basic);
assert.equal(optimized.available,true);
assert.equal(optimized.analyzed,6);
assert.equal(optimized.eligible,6);
assert(optimized.changes.some(c=>c.lineIndex===1&&c.shot==='solo-close'),
  '600 ms reply must keep previous camera shot');
assert(optimized.changes.some(c=>c.lineIndex===2),
  'another short verse must not trigger abrupt shot');
assert(!optimized.changes.some(c=>c.lineIndex===3),
  'authored hook-push must always remain');
assert(!optimized.changes.some(c=>c.lineIndex===4),
  'shot immediately after hook must not erase intentional highlight');
assert.deepEqual(optimized,plan(basic),'song planning deterministic');
assert.equal(JSON.stringify(basic),inputSnapshot,'pure computation must not mutate input');
assert(optimized.settings.smoothness>=0&&optimized.settings.smoothness<=100);
assert(optimized.sampledTransitions<=16,'bounded sample');
assert(optimized.scoreBefore===null||optimized.scoreBefore>=0&&optimized.scoreBefore<=100);
assert(optimized.scoreAfter===null||optimized.scoreAfter>=0&&optimized.scoreAfter<=100);
const author=plan({...basic,manualOverrides:[{lineIndex:1,shot:'off',strength:0}],
  keyframes:[{lineIndex:2,offsetMs:0,pose:{x:0,y:0,z:5,targetY:0,fov:38}}]});
assert(!author.changes.some(c=>c.lineIndex===1||c.lineIndex===2),
  'manual V430 decisions and authored V432 keyframes protected');
assert(author.protectedLines>=2);
const merged=combine(optimized.overrides,[{lineIndex:1,shot:'off',strength:0}]);
assert.equal(merged.find(x=>x.lineIndex===1).shot,'off','human override wins');
assert.deepEqual(combine([],[]),[]);
assert.equal(plan({...basic,trackId:''}).available,false);
assert.equal(plan({...basic,trackId:'__proto__'}).available,false);
assert.equal(plan({...basic,items:[]}).available,false);
assert.equal(plan({...basic,items:samples.map(s=>({...s,eligible:false}))}).available,false);
assert.equal(plan({...basic,trackId:'other-track'}).trackId,'other-track');
const long=Array.from({length:5100},(_,i)=>line(i,i*800,(i+1)*800,
  i%2?'reply-side':'solo-close',i%2));
const limited=plan({...basic,items:long});
assert.equal(limited.analyzed,5000,'bounded lyrics input');
assert(limited.overrides.length<=128,'never exceed bounded autogenerated edits');
// Wiring is deliberate: on/off must restore the exact manually authored V430 inputs.
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/RapCameraAutoFixPanelV436.tsx','utf8');
const root=fs.readFileSync('components/visualizer/ExpressiveRapDirectorPanelV425.tsx','utf8');
const types=fs.readFileSync('types/music.ts','utf8');
const context=fs.readFileSync('context/UiPreferencesContext.tsx','utf8');
const camera=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
for(const [source,needle] of [
  [stage,'rapAutoFixActiveV436'],[stage,'rapCameraEditsV436'],
  [stage,'combineRapCameraAutoFixV436'],[stage,'rapCameraTransitionsEnabledV433:'],
  [ui,'Ganzer Song automatisch optimieren'],[ui,'planRapCameraAutoFixV436'],
  [ui,'Vorschläge optional fest in V430 speichern'],
  [root,'RapCameraAutoFixPanelV436'],[types,'rapCameraAutoFixEnabledV436?:boolean'],
  [context,'rapCameraAutoFixEnabledV436:true'],[camera,'applyRapCameraShotV430'],
])assert(source.includes(needle),`missing wiring: ${needle}`);
assert(!ui.includes('seekTo(')&&!ui.includes('setProgressMs('));
assert(!camera.includes('V436'),'no duplicate renderer or second live camera');
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]??0)>=436,'requires V436 or later');
require('./helpers/release-coverage-v651.cjs').assertIncluded('test:v436');
assert(pkg.scripts['verify:offline:fast'].includes('test:v436'));
console.log('PASS V436: automatic song planning, short-cut fixes, hook/keyframe/manual priority, bounds, purity, no live camera duplication');
