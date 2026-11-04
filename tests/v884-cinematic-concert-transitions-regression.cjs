'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v884=load('components/visualizer/cinematicConcertTransitionsV884');
const v882=load('components/visualizer/concertStageSyncV882');
const {buildCinematicTransitionsV884:build,sampleCinematicTransitionV884:sample,
 DEFAULT_CINEMATIC_TRANSITIONS_V884:defaults,normalizeCinematicTransitionsV884:normalize,
 exportCinematicTransitionsV884:serialize,OFF_CINEMATIC_TRANSITION_V884:off}=v884;
let n=0;
function check(name,fn){try{fn();n++}catch(e){e.message=`V884 ${name}: ${e.message}`;throw e;}}
const scenes=[
 {index:0,startMs:0,endMs:30000,section:'verse',intent:'wide'},
 {index:1,startMs:30000,endMs:53000,section:'build',intent:'rise'},
 {index:2,startMs:53000,endMs:76000,section:'drop',intent:'pulse'},
 {index:3,startMs:76000,endMs:103000,section:'hook',intent:'wide'},
 {index:4,startMs:103000,endMs:120000,section:'outro',intent:'breath'},
];
const timeline={trackId:'song',durationMs:120000,source:'verified-v604',scenes};
const plan=build({timeline,trackId:'song',durationMs:120000});
const at=(positionMs,options={})=>sample({plan,trackId:'song',durationMs:120000,positionMs,
 playing:true,reducedMotion:false,settings:defaults,autoEnabled:true,tier:'high',...options});
check('settings default safe and independent',()=>assert.deepEqual(defaults,{enabled:true,style:'cinematic',camera:true,lights:true,visual:true}));
check('invalid values fallback to safe defaults',()=>{
 for(const v of [null,undefined,{},true,[],12,'x'])assert.deepEqual(normalize(v),defaults);
});
check('explicit user toggles preserved',()=>assert.deepEqual(normalize({enabled:false,style:'arena',camera:false,lights:false,visual:false}),
 {enabled:false,style:'arena',camera:false,lights:false,visual:false}));
check('unknown modes never accepted',()=>assert.equal(normalize({style:'strobe'}).style,'cinematic'));
check('only verified scene plan accepted',()=>assert.equal(plan.source,'verified-v604'));
check('every adjacent change gets exact boundary',()=>assert.deepEqual(plan.transitions.map(t=>t.atMs),[30000,53000,76000,103000]));
check('all seams are inside verified intervals',()=>{
 for(const t of plan.transitions){const from=scenes[t.fromIndex],to=scenes[t.toIndex];
  assert.equal(t.atMs,from.endMs);assert.equal(t.atMs,to.startMs);
  assert(t.atMs-t.windowMs>from.startMs);assert(t.atMs+t.windowMs<to.endMs);}
});
check('each seam has stable unique id',()=>assert.equal(new Set(plan.transitions.map(t=>t.id)).size,plan.transitions.length));
check('styles include quiet ending and energetic drop',()=>{
 assert.equal(plan.transitions.find(t=>t.atMs===103000).kind,'quiet');
 assert.equal(plan.transitions.find(t=>t.atMs===53000).kind,'release');
 assert.equal(plan.transitions.find(t=>t.atMs===30000).kind,'rise');
});
check('first and last section have no imaginary beyond-the-song edge',()=>{
 assert(plan.transitions.every(t=>t.atMs>0&&t.atMs<120000));
});
check('same section + intent does not generate redundant transition',()=>{
 const t={...timeline,scenes:[...scenes.slice(0,2),{...scenes[2],section:'build',intent:'rise'},...scenes.slice(3)]};
 assert(!build({timeline:t,trackId:'song',durationMs:120000}).transitions.some(s=>s.atMs===53000));
});
check('scene gap must never be interpolated',()=>{
 const t={...timeline,scenes:[...scenes.slice(0,2),{...scenes[2],startMs:54100},...scenes.slice(3)]};
 assert(!build({timeline:t,trackId:'song',durationMs:120000}).transitions.some(s=>s.atMs===54100));
});
check('short scene gets no transition',()=>{
 const t={...timeline,scenes:[{...scenes[0],endMs:29600},{...scenes[1],startMs:29600,endMs:32000},
  {...scenes[2],startMs:32000},...scenes.slice(3)]};
 const p=build({timeline:t,trackId:'song',durationMs:120000});
 assert(!p.transitions.some(s=>s.atMs===29600||s.atMs===32000));
});
check('unverified source disables planning',()=>assert.equal(build({timeline:{...timeline,source:'unavailable'},trackId:'song',durationMs:120000}).transitions.length,0));
check('track switch disables planning',()=>assert.equal(build({timeline,trackId:'other',durationMs:120000}).source,'unavailable'));
check('duration mismatch disables planning',()=>assert.equal(build({timeline,trackId:'song',durationMs:120100}).source,'unavailable'));
check('overlapping scenes disable all planning',()=>assert.equal(build({timeline:{...timeline,scenes:scenes.map((s,i)=>i===2?{...s,startMs:51000}:s)},trackId:'song',durationMs:120000}).transitions.length,0));
check('nonfinite endpoints disable planning',()=>assert.equal(build({timeline:{...timeline,scenes:scenes.map((s,i)=>i===1?{...s,endMs:Infinity}:s)},trackId:'song',durationMs:120000}).transitions.length,0));
check('missing timeline no visual guesses',()=>assert.equal(build({timeline:null,trackId:'song',durationMs:120000}).transitions.length,0));
check('no effect far from boundary',()=>assert.deepEqual(at(20000),off));
check('transition is active before AND after exact border',()=>{
 for(const p of [51900,52500,53000,53500,54000])assert.equal(at(p).active,true,String(p));
});
check('no effect outside transition envelope',()=>{
 assert.deepEqual(at(50200),off);assert.deepEqual(at(54800),off);
});
check('camera is eased, never forcibly cut/repositioned',()=>{
 const q=at(53000);assert(q.cameraRate<1&&q.cameraRate>=.63);assert(q.active);
});
check('lighting only small changes (not strobe)',()=>{
 for(let t=51400;t<54700;t+=31){const q=at(t);assert(q.lightGain>=.94&&q.lightGain<=1.08);
  assert(Math.abs(q.lightOffset)<=.19);}
});
check('visual bridge capped to 17% opacity',()=>{
 for(let t=51400;t<54700;t+=19)assert(at(t).visualOpacity<=.17);
});
check('peak and shoulders ease smoothly',()=>{
 const before=at(52600),peak=at(53000),after=at(53400);
 assert(peak.proximity>before.proximity&&peak.proximity>after.proximity);
 assert(Math.abs(before.proximity-after.proximity)<.00001);
});
check('quiet transition remains gentler than drop',()=>{
 assert(at(103000).visualOpacity<at(53000).visualOpacity);
});
check('subtle mode is softer than arena mode',()=>{
 const s=at(53000,{settings:{...defaults,style:'subtle'}});
 const a=at(53000,{settings:{...defaults,style:'arena'}});
 assert(s.visualOpacity<a.visualOpacity&&s.cameraRate>a.cameraRate);
});
check('independent camera toggle',()=>{
 const q=at(53000,{settings:{...defaults,camera:false}});
 assert.equal(q.cameraRate,1);assert(q.lightGain>1);
});
check('independent light toggle',()=>{
 const q=at(53000,{settings:{...defaults,lights:false}});
 assert.equal(q.lightGain,1);assert.equal(q.lightOffset,0);assert(q.cameraRate<1);
});
check('independent overlay toggle',()=>assert.equal(at(53000,{settings:{...defaults,visual:false}}).visualOpacity,0));
check('all channels disabled is fully inactive',()=>assert.deepEqual(at(53000,{settings:{...defaults,camera:false,lights:false,visual:false}}),off));
check('disabled, master auto off, pause and reduced motion block cues',()=>{
 for(const input of [{settings:{...defaults,enabled:false}},{autoEnabled:false},{playing:false},{reducedMotion:true}])
 assert.deepEqual(at(53000,input),off);
});
check('clock/timeline safety',()=>{
 for(const input of [{trackId:'stale'},{durationMs:99999},{positionMs:NaN},{positionMs:Infinity},{positionMs:-1},{positionMs:120000}])
 assert.deepEqual(at(53000,input),off);
});
check('seek suppression, low GPU and blackout fail closed',()=>{
 for(const input of [{seekBlocked:true},{tier:'low'},{blackout:true}])assert.deepEqual(at(53000,input),off);
});
check('manual live FX takes priority',()=>assert.deepEqual(at(53000,{manualFx:true}),off));
check('manual camera and keyframes win',()=>{
 const q=at(53000,{manualCamera:true});assert.equal(q.cameraRate,1);assert(q.lightGain>1);
});
check('authored lighting never changed',()=>{
 const q=at(53000,{manualLighting:true});assert.equal(q.lightGain,1);assert.equal(q.lightOffset,0);
});
check('lyrics protection prevents overlay and light accents',()=>{
 const q=at(53000,{lyricsProtected:true});assert.equal(q.lightGain,1);assert.equal(q.visualOpacity,0);
});
check('quiet moments never show bright release',()=>{
 const q=at(103000);assert(q.visualOpacity<.1);assert(q.lightGain<=1);
});
check('exports reproducible JSON only for verified scenes',()=>{
 const data=JSON.parse(serialize(plan,defaults));assert.equal(data.schema,'sonic-cinematic-transitions-v884');
 assert.equal(data.transitions.length,4);assert.equal(data.trackId,'song');assert(!Object.hasOwn(data,'beatData'));
 assert.equal(serialize(build({timeline:null,trackId:'song',durationMs:120000}),defaults),null);
});
const signal={trackId:'song',durationMs:120000,playing:true,reducedMotion:false,enabled:true,intensity:1,
 sceneSource:'verified',section:'drop',sceneStartMs:53000,look:'neon',manual:null,manualId:0,manualStartMs:-1,
 sync:{stage:true,lights:true,dance:true},transitionPlan:plan,transitionSettings:defaults};
const clock={trackId:'song',durationMs:120000,positionMs:53500,playing:true,reducedMotion:false,tier:'high'};
const onStage=(s={},c={})=>v882.planConcertStageV882({...signal,...s},{...clock,...c});
check('real V882 spotlight consumes transition (not a second rig)',()=>{
 const withCue=onStage(),without=onStage({transitionPlan:null});
 assert.notEqual(withCue.beamGain,without.beamGain);
});
check('V882 with verified scene and manualLighting protects all old lights',()=>{
 assert.equal(onStage({}, {manualLighting:true}).beamGain,1);
});
check('V882 blackout protects all old stage channels',()=>{
 assert.deepEqual(onStage({}, {blackout:true}),v882.OFF_CONCERT_STAGE_V882);
});
check('V882 independent light sync off',()=>{
 assert.equal(onStage({sync:{stage:true,lights:false,dance:true}}).beamGain,1);
});
check('V882 respects seek block in song clock',()=>{
 assert.equal(onStage({transitionSeekBlockedUntilMs:56000}).beamGain,onStage({transitionPlan:null}).beamGain);
});
check('V882 blocks manually triggered FX from automatic seam',()=>{
 const manual={manual:'sweep',manualId:8,manualStartMs:53000};
 assert.deepEqual(onStage(manual),onStage({...manual,transitionPlan:null}));
});
check('V882 does not publish stale plan',()=>{
 v882.publishConcertStageSyncV882({...signal,transitionPlan:{...plan,trackId:'other'}});
 assert.equal(v882.readConcertStageSyncV882().transitionPlan,null);
 v882.publishConcertStageSyncV882(signal);assert.equal(v882.readConcertStageSyncV882().transitionPlan,plan);
 v882.publishConcertStageSyncV882(null);
});
const ui=fs.readFileSync('components/visualizer/LiveFxDeckV881.tsx','utf8');
const camera=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
check('V884 UI contains real settings, plan and preview',()=>{
 for(const label of ['buildCinematicTransitionsV884','sampleCinematicTransitionV884','concert-transition-options-v884',
 'concert-transition-wash-v884','Übergangsplan als JSON exportieren'])assert(ui.includes(label),label);
});
check('transition is published to real R3F stage sync',()=>{
 assert(ui.includes('transitionPlan,transitionSettings:normalizeCinematicTransitionsV884'));
 assert(ui.includes('transitionSeekBlockedUntilMs:'));
});
check('new settings are persisted independently and guarded',()=>{
 assert(ui.includes('window.localStorage.setItem(CINEMATIC_TRANSITIONS_KEY_V884'));
 assert(ui.includes('catch {setStorageError(true);}'));
});
check('V884 uses existing camera alpha not second camera or forced cut',()=>{
 assert(camera.includes('v884Camera.cameraRate'));
 assert(camera.includes('editingPose||cutToCameraCueV400'));
 assert(camera.includes('manualCamera:!!(editingPose||cutToCameraCueV400'));
 assert(!fs.readFileSync('components/visualizer/cinematicConcertTransitionsV884.ts','utf8').includes('new PerspectiveCamera'));
});
check('overlay honors browser motion reduction',()=>{
 assert(css.includes('@media(prefers-reduced-motion:reduce){.concert-transition-wash-v884{display:none!important}}'));
 assert(ui.includes('playing,reducedMotion:motionOff,settings:transitionSettings'));
});
console.log(`V884 Cinematic Concert Transitions: ${n}/${n} tests PASS`);
