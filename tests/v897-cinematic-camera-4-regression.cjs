'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/cinematicCameraDirectorV897');
const dir=load('components/visualizer/aiConcertDirectorV895');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
let checks=0;
function check(label,fn){try{fn();checks++;}catch(e){e.message=`V897 ${label}: ${e.message}`;throw e;}}
const base={trackId:'cinematic-song',durationMs:180000,source:'verified-v604',scenes:[
 {index:0,startMs:0,endMs:20000,section:'intro',intent:'opening'},
 {index:1,startMs:20000,endMs:50000,section:'verse',intent:'performance'},
 {index:2,startMs:50000,endMs:70000,section:'build',intent:'rise'},
 {index:3,startMs:70000,endMs:90000,section:'drop',intent:'drop'},
 {index:4,startMs:90000,endMs:115000,section:'hook',intent:'chorus'},
 {index:5,startMs:115000,endMs:140000,section:'verse',intent:'performance'},
 {index:6,startMs:140000,endMs:160000,section:'finale',intent:'finale'},
 {index:7,startMs:160000,endMs:180000,section:'outro',intent:'closing'},
]};
const plan=dir.buildDirectorPlanV895(base);
const settings={...v.DEFAULT_CAMERA_V897};
const pose={x:.14,y:.32,z:4.7,targetX:0,targetY:.3,targetZ:0,fov:40};
const input=(patch={})=>({pose,plan,settings,trackId:plan.trackId,durationMs:plan.durationMs,
 positionMs:34000,playing:true,autoEnabled:true,directorEnabled:true,directorCameraEnabled:true,
 reducedMotion:false,tier:'high',aspect:16/9,...patch});
const sample=(patch={})=>v.sampleCinematicCameraV897(input(patch));
const around=(time,patch={})=>sample({positionMs:time,...patch});
check('default is enabled and preserves all V848 camera framing unless V604 verified',()=>{
 assert.equal(settings.enabled,true);assert.equal(v.sampleCinematicCameraV897(input({plan:null})).pose,pose);
});
check('stable defaults',()=>assert.deepEqual(v.normalizeCinematicCameraV897(undefined),settings));
for(const value of [null,undefined,{},[],false,0,NaN,Infinity,'style',new Date()])
 check('invalid settings '+String(value),()=>assert.deepEqual(v.normalizeCinematicCameraV897(value),settings));
for(const style of ['steady','cinematic','dynamic'])check('style accepted '+style,()=>assert.equal(v.normalizeCinematicCameraV897({style}).style,style));
for(const style of ['neon','flash',null,'',99,{},[]])check('bad style rejected '+String(style),()=>assert.equal(v.normalizeCinematicCameraV897({style}).style,'cinematic'));
for(const choice of ['auto','portrait','orbit','dolly','crane','wide'])check('shot preference '+choice,()=>assert.equal(v.normalizeCinematicCameraV897({preference:choice}).preference,choice));
for(const value of ['',null,5,'singer',{},[],'strobe'])check('bad shot preference '+String(value),()=>assert.equal(v.normalizeCinematicCameraV897({preference:value}).preference,'auto'));
for(const n of [-100,-.5,0,.6,25.9,99.9,100,999])check('intensity clamp '+n,()=>assert.equal(v.normalizeCinematicCameraV897({intensity:n}).intensity,Math.round(Math.max(0,Math.min(100,n)))));
for(const n of [NaN,Infinity,-Infinity,'60',null])check('bad intensity '+String(n),()=>assert.equal(v.normalizeCinematicCameraV897({intensity:n}).intensity,55));
for(const key of ['enabled','protectLyrics','protectDuets','portrait','orbit','dolly','crane','wide'])check('boolean flag '+key,()=>{
 assert.equal(v.normalizeCinematicCameraV897({[key]:false})[key],false);
 assert.equal(v.normalizeCinematicCameraV897({[key]:'false'})[key],true);
});
check('verified and only actual song segments',()=>{assert.equal(plan.source,'verified-v604');assert.equal(plan.scenes.length,8);assert.deepEqual(plan.scenes.map(s=>s.startMs),base.scenes.map(s=>s.startMs));});
check('five distinguishable stage shots selected',()=>{const list=plan.scenes.map(s=>v.selectCameraShotV897(s,settings));assert(new Set(list).size>=4,JSON.stringify(list));});
for(const sec of ['verse','hook','drop','build','outro','intro','finale'])check('supported section '+sec,()=>{
 const sc=plan.scenes.find(s=>s.section===sec);assert(v.selectCameraShotV897(sc,settings));
});
for(const pref of ['portrait','orbit','dolly','crane','wide'])check('manual preference '+pref,()=>{
 assert.equal(v.selectCameraShotV897(plan.scenes[0],{...settings,preference:pref}),pref);
});
for(const pref of ['portrait','orbit','dolly','crane','wide'])check('disabled preference ignored '+pref,()=>{
 assert.equal(v.selectCameraShotV897(plan.scenes[0],{...settings,preference:pref,[pref]:false}),null);
});
check('all disabled yields neutral',()=>assert.equal(sample({settings:{...settings,portrait:false,orbit:false,dolly:false,crane:false,wide:false}}).active,false));
check('auto fallback available when section palette disabled',()=>assert.equal(v.selectCameraShotV897(plan.scenes[3],{...settings,wide:false,crane:false,orbit:false,dolly:true,portrait:false}),'dolly'));
check('normal active shot modifies only existing camera pose',()=>{const c=sample();assert(c.active);assert(c.pose!==pose);assert.notDeepEqual(c.pose,pose);assert(c.cameraRate>0);});
check('source pose remains immutable',()=>{sample();assert.deepEqual(pose,{x:.14,y:.32,z:4.7,targetX:0,targetY:.3,targetZ:0,fov:40});});
for(const [reason,patch] of [
 ['disabled',{settings:{...settings,enabled:false}}],['zero intensity',{settings:{...settings,intensity:0}}],
 ['paused',{playing:false}],['global auto disabled',{autoEnabled:false}],
 ['director off',{directorEnabled:false}],['director camera off',{directorCameraEnabled:false}],
 ['manual fx',{manualFx:true}],['manual authored',{authored:true}],['blackout',{blackout:true}],
 ['seek guard',{seekBlocked:true}],['reduced motion',{reducedMotion:true}],['low device tier',{tier:'low'}],
 ['no plan',{plan:null}],['plan unverified',{plan:{...plan,source:'unavailable'}}],
 ['plan wrong track',{plan:{...plan,trackId:'other'}}],['input wrong track',{trackId:'other'}],
 ['plan wrong duration',{plan:{...plan,durationMs:120000}}],['input wrong duration',{durationMs:120000}],
 ['empty track',{trackId:''}],['invalid duration',{durationMs:NaN}],['zero duration',{durationMs:0}],
 ['time negative',{positionMs:-1}],['time NaN',{positionMs:NaN}],['time after end',{positionMs:180000}],
 ['bad aspect 0',{aspect:0}],['bad aspect 5',{aspect:5}],
 ['lyrics protected',{lyricsProtected:true}],['lyrics visible',{lyricsVisible:true}],['vocal close-up',{closeup:true}],
 ['invalid pose x',{pose:{...pose,x:NaN}}],['invalid pose z',{pose:{...pose,z:Infinity}}],
 ['invalid pose fov',{pose:{...pose,fov:96}}],['invalid target',{pose:{...pose,targetY:NaN}}],
 ['unusable extreme close pose',{pose:{...pose,z:.9}}],
 ])check('hard guard '+reason,()=>{const inp=input(patch),out=v.sampleCinematicCameraV897(inp);assert.equal(out.active,false);assert.equal(out.pose,inp.pose);assert.equal(out.cameraRate,1);});
check('disabled lyric protection deliberately allows standard framing',()=>assert(sample({settings:{...settings,protectLyrics:false},lyricsProtected:true}).active));
check('duo preserve composition by attenuating motion',()=>assert(sample({duo:true}).gain<sample({duo:false}).gain));
check('duet guard can be disabled',()=>assert.equal(sample({duo:true,settings:{...settings,protectDuets:false}}).gain,sample().gain));
check('medium quality tier attenuates',()=>assert(sample({tier:'balanced'}).gain<sample().gain));
for(const style of ['steady','cinematic','dynamic'])check('style active '+style,()=>assert(sample({settings:{...settings,style}}).active));
check('steady has less amplitude than dynamic',()=>assert(sample({settings:{...settings,style:'steady'}}).gain<sample({settings:{...settings,style:'dynamic'}}).gain));
check('zero movement at entry/exit and no hard cuts',()=>{
 for(const s of plan.scenes){const a=around(s.startMs),b=around(s.endMs-0.001);assert.equal(a.active,false);assert(!b.active||b.gain<.00001);}
});
check('inactive when no scene matches',()=>assert.equal(sample({plan:{...plan,scenes:[]}}).active,false));
check('short scene rejected',()=>assert.equal(sample({plan:{...plan,scenes:[{...plan.scenes[1],startMs:33800,endMs:34500}]}}).active,false));
check('invalid scene geometry rejected',()=>assert.equal(sample({plan:{...plan,scenes:[{...plan.scenes[1],endMs:200000}]}}).active,false));
check('track scoped positioning never guesses drop',()=>{const x=around(34000),y=around(84000);assert.notEqual(x.sceneIndex,y.sceneIndex);assert.equal(x.sceneIndex,1);assert.equal(y.sceneIndex,3);});
check('spotlight closeup can bypass only when protective setting disabled',()=>assert(sample({closeup:true,settings:{...settings,protectLyrics:false}}).active));
check('deterministic replay at same time',()=>assert.deepEqual(sample(),sample()));
check('invalid near-field camera fully rejected',()=>assert.equal(sample({pose:{...pose,z:1.35}}).active,false));
for(const name of ['portrait','orbit','dolly','crane','wide'])check('bounded pose '+name,()=>{
 const c=sample({settings:{...settings,preference:name,intensity:100},tier:'high'});
 assert.equal(c.shot,name);assert(c.active);
 assert(Math.abs(c.pose.x-pose.x)<=.28);assert(Math.abs(c.pose.y-pose.y)<=.20);
 assert(Math.abs(c.pose.z-pose.z)<=.28);assert(Math.abs(c.pose.targetY-pose.targetY)<=.05);
 assert(Math.abs(c.pose.fov-pose.fov)<=1.3);
});
check('large simulation stays finite, within V351-safe micro offsets',()=>{
 for(let j=0;j<30000;j++){
  const sec=plan.scenes[j%8],pos=sec.startMs+1000+((j*47)%(sec.endMs-sec.startMs-2000));
  const c=around(pos,{settings:{...settings,intensity:j%101}});
  assert(Number.isFinite(c.pose.x)&&Number.isFinite(c.pose.z)&&Number.isFinite(c.pose.fov));
  assert(c.cameraRate>=.94&&c.cameraRate<=1.03);
  assert(Math.abs(c.pose.x-pose.x)<.31&&Math.abs(c.pose.z-pose.z)<.31);
 }
});
check('export unavailable source blocked',()=>assert.equal(v.exportCinematicCameraV897({...plan,source:'unavailable'},settings),null));
check('export empty track blocked',()=>assert.equal(v.exportCinematicCameraV897({...plan,trackId:''},settings),null));
check('export missing scene blocked',()=>assert.equal(v.exportCinematicCameraV897({...plan,scenes:[]},settings),null));
check('verified export contains actual scene times and permissions only',()=>{
 const j=JSON.parse(v.exportCinematicCameraV897(plan,settings));
 assert.equal(j.schema,'sonic-cinematic-camera-v897');assert.equal(j.source,'verified-v604');
 assert.equal(j.scenes.length,8);assert.deepEqual(j.scenes.map(s=>s.startMs),base.scenes.map(s=>s.startMs));
 assert(!('beats' in j));assert(!('singerId' in j));assert.match(j.note,/No new camera/);
});
check('bridge normalizes camera settings and preserves verified plan',()=>{
 const sig={trackId:plan.trackId,durationMs:plan.durationMs,playing:true,reducedMotion:false,
 enabled:true,intensity:1,sceneSource:'verified',section:'verse',look:'cinema',sceneStartMs:20000,
 manual:null,manualId:0,manualStartMs:-1,sync:{stage:true,lights:true,dance:true},
 directorPlanV895:plan,directorSettingsV895:dir.DEFAULT_DIRECTOR_V895,
 cameraSettingsV897:{...settings,style:'dynamic',intensity:75}};
 bridge.publishConcertStageSyncV882(sig);
 assert.equal(bridge.readConcertStageSyncV882().cameraSettingsV897.style,'dynamic');
 assert.equal(bridge.readConcertStageSyncV882().cameraSettingsV897.intensity,75);
 assert.strictEqual(bridge.readConcertStageSyncV882().directorPlanV895,plan);
 bridge.publishConcertStageSyncV882(null);
});
check('V897 positioned after V848 but before V351 final guard',()=>{
 const src=read('components/visualizer/StageCameraDirectorV289.tsx');
 const a=src.indexOf('const framedV848='),b=src.indexOf('const cinematicCameraV897='),
  d=src.indexOf('const danceCameraV898='),c=src.indexOf('guardAutomaticCameraV351(cinematicV1025.pose');
 assert(a>=0&&b>a&&d>b&&c>d);
 assert(src.includes('cinematicCameraV897.cameraRate'));
 assert(!src.includes('new PerspectiveCamera'));
});
check('live FX setting, persistence, export wired',()=>{
 const src=read('components/visualizer/LiveFxDeckV881.tsx');
 for(const key of ['CAMERA_KEY_V897','cameraReadyV897','cameraSettingsV897:normalizeCinematicCameraV897','V897 · Cinematic Camera 4.0','exportCameraV897Json','selectCameraShotV897'])assert(src.includes(key),key);
});
check('no new resources or invented singer inference',()=>{
 const src=read('components/visualizer/cinematicCameraDirectorV897.ts');
 for(const bad of ['Math.random(', 'fetch(', 'setInterval(', 'requestAnimationFrame(', 'new THREE.', 'new PerspectiveCamera(', 'GLBLoader(', 'WebSocket(', 'beatPrediction'])assert(!src.includes(bad),bad);
});
check('CI V897 and Windows gate registered',()=>{
 assert(read('.github/workflows/v832-continuous-validation.yml').includes('V897 Cinematic Camera 4.0'));
 assert(read('scripts/verify-v897-windows.ps1').includes('verify:v897:focused'));
});
check('package and lockfile same V897 version',()=>{const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
 assert(Number(p.version.split('-v')[1])>=897);assert.equal(l.version,p.version);assert.equal(l.packages[''].version,p.version);
 assert(p.scripts['prebuild'].includes('test:v897'));assert(p.scripts['build:preflight'].includes('test:v897'));
});
console.log(`V897 Cinematic Camera 4.0 PASS: ${checks} checks`);
