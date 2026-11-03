'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {advancePerformanceCameraV747:advance,composePerformanceCameraV747:compose,
 initialPerformanceCameraStateV747:initial,normalizePerformanceCameraV747:normalize,
 DEFAULT_PERFORMANCE_CAMERA_V747:defaults}=load('components/visualizer/performanceCameraDirectorV747');
const {measureConcertFrameV550:frame}=load('components/visualizer/cinematicConcertCameraV550');
const {measureScreenFrameV540:screen}=load('components/visualizer/cinematicCameraCompositionV540');
let checks=0;const ok=(x,msg)=>{assert.ok(x,msg);checks++};const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);checks++};
const pose={x:0,y:1.8,z:8,targetX:0,targetY:1,targetZ:0,fov:43};
const anchors=[{slot:0,x:-1,y:0,z:0,visible:true},{slot:1,x:1,y:0,z:0,visible:true}];
const acts=[{index:0,startMs:0,endMs:50000,section:'verse'},{index:1,startMs:50000,endMs:85000,section:'build'},
 {index:2,startMs:85000,endMs:125000,section:'hook'},{index:3,startMs:125000,endMs:165000,section:'drop'},
 {index:4,startMs:165000,endMs:200000,section:'break'}];
const plan={trackId:'song',durationMs:200000,source:'verified-v600',acts};
const cue={active:true,source:'verified-v600',act:0};
const scene={active:true,trackId:'song',cueStartMs:0,cueEndMs:50000,count:2,focus:'verse',leadSlot:0,
 singingSlots:[0],handoffFrom:null,strength:.8};
const opts={trackId:'song',progressMs:3000,playing:true,reducedMotion:false,automatic:true,
 authored:false,quality:'high',aspect:16/9,lyricsProtected:false,settings:defaults};
const run=(state=initial(),change={})=>advance(state,change.scene===undefined?scene:change.scene,
 change.plan===undefined?plan:change.plan,change.cue===undefined?cue:change.cue,
 change.anchors===undefined?anchors:change.anchors,{...opts,...change});
const start=run();eq(start.cue.shot,'vocal-portrait');ok(start.cue.active);eq(start.cue.strength,0);
const after=run(start.state,{progressMs:5500});ok(after.cue.strength>0);ok(after.cue.strength<=1);
eq(normalize(),defaults);eq(normalize({enabled:'x',strength:-50,vocalFocus:'no',groupShots:null,transitionMs:9999}),
 {...defaults,strength:0,transitionMs:2500});
for(const enabled of [true,false])for(const strength of [-10,0,15,70,100,250,NaN,Infinity]){
 const norm=normalize({enabled,strength});ok(norm.strength>=0&&norm.strength<=100);if(!enabled||norm.strength===0)ok(!run(initial(),{settings:norm}).cue.active);
}
for(const settings of [{enabled:false},{strength:0},{groupShots:false,vocalFocus:false}]){
 const r=run(initial(),{settings});ok(!r.cue.active);eq(r.state,initial());
}
for(const overrides of [{playing:false},{automatic:false},{authored:true},{reducedMotion:true},
 {quality:'low'},{trackId:''},{trackId:'other',scene:null,plan:null},{aspect:0},{aspect:100},
 {aspect:NaN},{progressMs:-1},{progressMs:NaN},{progressMs:Infinity}]){
 const r=run(start.state,overrides);ok(!r.cue.active,'reject unavailable state '+JSON.stringify(overrides));eq(r.state,initial());
}
for(const changedScene of [{...scene,trackId:'other'},{...scene,active:false},{...scene,leadSlot:3},
 {...scene,leadSlot:1,singingSlots:[0]},{...scene,singingSlots:[]},{...scene,strength:NaN},
 {...scene,cueEndMs:2000},{...scene,count:3}]){
 const r=run(initial(),{scene:changedScene,plan:null});ok(!r.cue.active,'no invented singer');
}
for(const changedPlan of [null,{...plan,source:'unavailable'},{...plan,trackId:'other'},
 {...plan,acts:[]},{...plan,acts:[{index:0,startMs:5000,endMs:2000,section:'verse'}]}]){
 ok(!run(initial(),{scene:null,plan:changedPlan}).cue.active,'invalid act evidence');
}
for(const changedCue of [{...cue,active:false},{...cue,source:'off'},{...cue,act:-1},{...cue,act:200}]){
 ok(!run(initial(),{scene:null,cue:changedCue}).cue.active,'no guessed chapter');
}
const handoff={...scene,focus:'handoff',leadSlot:1,singingSlots:[1],handoffFrom:0};
eq(run(initial(),{scene:handoff}).cue.shot,'vocal-handoff');
const rejected={...handoff,handoffFrom:8};eq(run(initial(),{scene:rejected}).cue.shot,'vocal-portrait');
for(const [act,ms,shot] of [[0,3000,'verse-stage'],[1,60000,'build-rise'],[2,95000,'hook-ensemble'],
 [3,135000,'drop-wide'],[4,175000,'break-rest']]){
 const r=run(initial(),{scene:null,cue:{...cue,act},progressMs:ms});ok(r.cue.active,shot);eq(r.cue.shot,shot);
}
for(const [act,ms,shot] of [[2,95000,'hook-ensemble'],[3,135000,'drop-wide']]){
 const r=run(initial(),{scene:{...scene,cueStartMs:80000,cueEndMs:175000},cue:{...cue,act},progressMs:ms});eq(r.cue.shot,shot,'verified hooks must frame cast');
}
eq(run(initial(),{settings:{...defaults,groupShots:false}}).cue.shot,'vocal-portrait');
eq(run(initial(),{settings:{...defaults,vocalFocus:false},scene:null}).cue.shot,'verse-stage');
const withheld=run(initial(),{settings:{...defaults,vocalFocus:false},scene:null,plan:null});ok(!withheld.cue.active);
// Hold and transition: no hard cut on the current frame, handoff after a dwell.
let first=run(initial(),{progressMs:3000}),keep=first;
for(let ms=3040;ms<4900;ms+=40){const r=run(keep.state,{progressMs:ms,scene:handoff});eq(r.cue.shot,'vocal-portrait');keep=r;}
const accepted=run(keep.state,{progressMs:5100,scene:handoff});eq(accepted.cue.shot,'vocal-handoff');eq(accepted.cue.strength,0);
const next=run(accepted.state,{progressMs:7000,scene:handoff});ok(next.cue.strength>0);ok(next.cue.serial>first.cue.serial);
// An invalidated singer MUST NOT retain the old close-up for the dwell time.
const vanish=run(next.state,{progressMs:7100,scene:null});eq(vanish.cue.shot,'verse-stage');
const noVocalEvidence=run(next.state,{progressMs:7110,scene:null,plan:null});ok(!noVocalEvidence.cue.active);
const newTrack=run(next.state,{trackId:'new',plan:{...plan,trackId:'new'},scene:null,progressMs:5000});eq(newTrack.state.serial,1);
const backward=run(next.state,{progressMs:1000});eq(backward.state.serial,1);
const gap=run(next.state,{progressMs:40000});eq(gap.state.serial,1);
const repeat=run(next.state,{progressMs:7600,scene:handoff});eq(repeat,run(next.state,{progressMs:7600,scene:handoff}));
// Long-running frame cadence, false vocals never appear, finite and bounded gains.
let state=initial(),switches=0,lastSerial=0;
for(let i=0;i<20000;i++){
 const ms=500+i*9;
 const act=acts.findIndex(a=>ms>=a.startMs&&ms<a.endMs);
 const r=run(state,{progressMs:ms,scene:ms<50000?scene:null,cue:{...cue,act}});
 ok(r.cue.active);ok(r.cue.cameraRate>=.7&&r.cue.cameraRate<=1);ok(Number.isFinite(r.cue.strength)&&r.cue.strength>=0&&r.cue.strength<=1);
 if(r.state.serial!==lastSerial){switches++;lastSerial=r.state.serial;}
 state=r.state;
}ok(switches<14,'shot hold avoids frame jitter');
// Real V550/V540 physical screening for 1–4 actors, quality and caption positions.
const four=[{slot:0,x:-2.2,y:0,z:0,visible:true},{slot:1,x:-.7,y:0,z:0,visible:true},
 {slot:2,x:.7,y:0,z:0,visible:true},{slot:3,x:2.2,y:0,z:0,visible:true}];
for(const cast of [[anchors[0]],anchors,four])for(const aspect of [1,1.2,16/9,2.4])
for(const lyricsProtected of [true,false])for(const lyricsSide of ['left','right',null])
for(const shot of ['vocal-portrait','vocal-handoff','hook-ensemble','drop-wide','build-rise','verse-stage','break-rest']){
 const c={...after.cue,active:true,shot,leadSlot:cast[0].slot,strength:.6};
 const opts={aspect,lyricsProtected,lyricsSide};const old={...pose,z:cast.length===4?11:8};
 const newer=compose(old,c,cast,opts);
 const side=lyricsProtected?lyricsSide:null;
 const a=frame(old,cast,aspect,side,lyricsProtected),b=frame(newer,cast,aspect,side,lyricsProtected);
 const x=screen(old,cast,aspect,side),y=screen(newer,cast,aspect,side);
 ok(!!a&&!!b&&!!x&&!!y,'measurable frames');
 ok(b.overflow<=a.overflow+1e-6,'no extra viewport overflow');
 ok(b.headOverflow<=a.headOverflow+1e-6,'no increased head crop');
 ok(b.fullBodyOverflow<=a.fullBodyOverflow+1e-6,'no increased foot/body crop');
 ok(y.overflow<=x.overflow+1e-6,'lyrics-safe projected cast');
 if(lyricsProtected)eq(newer.targetX??0,old.targetX??0,'caption-safe no panning');
 for(const val of Object.values(newer))ok(typeof val==='number'&&Number.isFinite(val));
}
for(const bad of [{...after.cue,active:false},{...after.cue,strength:0},
 {...after.cue,strength:NaN},{...after.cue,strength:2},{...after.cue,shot:'off'}]){
 assert.strictEqual(compose(pose,bad,anchors,{aspect:16/9,lyricsProtected:false}),pose);checks++;
}
for(const bad of [[],[anchors[0],anchors[0]],[{...anchors[0],x:NaN}],
 Array(5).fill(anchors[0])]){
 assert.strictEqual(compose(pose,{...after.cue,strength:.4},bad,{aspect:16/9,lyricsProtected:false}),pose);checks++;
}
const orig=JSON.stringify([pose,anchors,after.cue]);compose(pose,after.cue,anchors,{aspect:16/9,lyricsProtected:false});eq(JSON.stringify([pose,anchors,after.cue]),orig);
const source=fs.readFileSync('components/visualizer/performanceCameraDirectorV747.ts','utf8');
ok(!/Date\.now\(|Math\.random\(|setTimeout\(|setInterval\(|localStorage|fetch\(/.test(source),'deterministic pure director');
const camera=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8').replace(/\r\n?/g,'\n');
for(const symbol of ['advancePerformanceCameraV747','composePerformanceCameraV747','performanceCameraStateV747','performanceCameraV747.cue.cameraRate'])ok(camera.includes(symbol),'camera integration '+symbol);
ok(camera.indexOf('const framedV747=')>=0 &&
  camera.indexOf('const framedV747=')<camera.indexOf('const framedV848=') &&
  camera.indexOf('const framedV848=')<camera.indexOf('const stageFramed=automaticShot') &&
  camera.includes('const framedV848=composeCinematicCameraDirectorV848(framedV838,sceneV528,') &&
  camera.includes('const stageFramed=automaticShot\n      ?guardAutomaticCameraV351(framedV848,composition):to;'),
  'final V351 guard must protect the newest V848 frame after V747');
const registry=fs.readFileSync('components/visualizer/registry.tsx','utf8');ok(registry.includes('performanceCameraV747?:'));
const visual=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');ok(visual.includes('performanceCameraV747:coordinatedCameraV750')&&visual.includes('normalizePerformanceCameraV747(preferences.avatarPerformanceCameraV747)')&&visual.includes('scaleAutomaticPercentV750(cameraSettingsV750.strength,applyTuneMultiplierV755(qualityV750.camera'), 'V750 camera budget retains V747 settings and source');
const prefs=fs.readFileSync('context/UiPreferencesContext.tsx','utf8');ok(prefs.includes('avatarPerformanceCameraV747:'));
const types=fs.readFileSync('types/music.ts','utf8');ok(types.includes('avatarPerformanceCameraV747?:'));
const settings=fs.readFileSync('components/SettingsPanel.tsx','utf8');ok(settings.includes('Cinematic Camera Director · V747'));
console.log('PASS V747 Cinematic Performance Camera: '+checks+' checks');
